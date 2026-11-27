---
summary: Ổ đầy là sự cố hay gặp nhất trên server, khiến web không ghi được log, database dừng. Bài này dạy xem dung lượng (df), tìm thư mục và file chiếm chỗ (du), các trường hợp lạ (hết inode, file đã xoá nhưng vẫn chiếm chỗ), và kiểm tra, sửa lỗi filesystem bằng fsck, xfs_repair, tune2fs.
minutes: 40
commands: [df -h, df -i, du -sh, du --max-depth, lsof +L1, fsck, e2fsck, xfs_repair, tune2fs, dumpe2fs]
quiz:
  - q: Khác nhau giữa df và du?
    options: ["Giống nhau", "df cho biết dung lượng của cả filesystem (đã dùng, còn trống); du đo dung lượng của từng thư mục / file", "df cho file, du cho ổ", "du chỉ chạy được bằng root"]
    answer: 1
    explain: "`df -h` trả lời 'ổ nào sắp đầy'. `du -sh thư-mục` trả lời 'cái gì đang chiếm chỗ'. Gỡ lỗi ổ đầy thường dùng `df` trước, rồi `du` để tìm thủ phạm."
  - q: "df báo ổ 100% nhưng du cả thư mục chỉ thấy vài chục KB. Nguyên nhân hay gặp?"
    options: ["df bị lỗi", "Có file đã bị xoá nhưng một tiến trình vẫn đang mở nó, nên chỗ trống chưa được trả lại", "Ổ bị hỏng", "du không đếm file ẩn"]
    answer: 1
    explain: "Xoá file đang được một chương trình mở (thường là file log) thì tên biến mất nhưng dữ liệu còn đến khi chương trình đóng file. Tìm bằng `sudo lsof +L1`, rồi khởi động lại chương trình đó."
  - q: "Còn nhiều GB trống nhưng không tạo được file mới, báo `No space left on device`. Kiểm tra gì tiếp?"
    options: ["df -h", "df -i (hết inode)", "free -h", "lsblk"]
    answer: 1
    explain: "Mỗi file cần một inode. Hàng triệu file nhỏ (cache, session) có thể dùng hết inode trong khi dung lượng còn nhiều. `df -i` cho biết %IUse."
  - q: Tại sao không được chạy fsck trên filesystem đang gắn ghi được?
    options: ["fsck sẽ chạy chậm", "Vừa sửa vừa có chương trình ghi vào có thể làm hỏng dữ liệu nặng hơn", "fsck không đọc được", "Không có lý do"]
    answer: 1
    explain: "e2fsck từ chối: `/dev/vdb1 is mounted. e2fsck: Cannot continue, aborting.` Phải gỡ ra trước. Với ổ `/` thì kiểm tra lúc khởi động hoặc từ chế độ cứu hộ."
  - q: Lệnh nào sửa lỗi filesystem xfs?
    options: ["fsck.xfs", "e2fsck", "xfs_repair", "tune2fs"]
    answer: 2
    explain: "`fsck.xfs` chỉ là chương trình rỗng, không làm gì. Với xfs, dùng `xfs_repair` (gỡ ổ ra trước). `-n` để chỉ kiểm tra, không sửa."
---

> Phần `df`, `du` làm được trong container. Phần sửa lỗi filesystem cần **máy ảo** có ổ phụ như [bài 29](/bai/phan-vung-va-filesystem).

## df: ổ nào sắp đầy

```bash
df -h
```

```text
Filesystem      Size  Used Avail Use% Mounted on
tmpfs           197M 1008K  196M   1% /run
/dev/vda1        11G  1.7G  9.0G  16% /
tmpfs           984M     0  984M   0% /dev/shm
/dev/vda16      881M   64M  756M   8% /boot
/dev/vda15      105M  6.2M   99M   6% /boot/efi
/dev/vdb2       448M   35M  414M   8% /srv/web
```

| Phần | Ý nghĩa |
|---|---|
| `df` | Dung lượng các filesystem đang gắn (**d**isk **f**ree) |
| `-h` | Đơn vị dễ đọc |
| `-T` | Thêm cột loại filesystem |
| `-x tmpfs` | Bỏ các filesystem tạm trong RAM cho gọn |
| `df -h /var` | Chỉ filesystem chứa thư mục `/var` |

| Cột | Ý nghĩa |
|---|---|
| `Size`, `Used`, `Avail` | Tổng, đã dùng, còn dùng được |
| `Use%` | Phần trăm đã dùng. Quá 85–90% nên xử lý |
| `Mounted on` | Điểm gắn |

`Used + Avail` thường nhỏ hơn `Size`, vì ext4 giữ lại khoảng 5% cho root (để root vẫn đăng nhập và dọn dẹp được khi ổ đầy với user thường).

### df -i: hết inode

```bash
df -i /
```

```text
/dev/vda1      1441792 85379 1356413    6% /
```

Các cột là: tổng inode, đã dùng, còn trống, `IUse%`. Mỗi file, thư mục cần một inode. Ứng dụng tạo hàng triệu file nhỏ (cache, session PHP, hàng đợi mail) có thể làm **hết inode** dù còn nhiều GB. Lúc đó tạo file báo `No space left on device` dù `df -h` còn trống.

## du: cái gì đang chiếm chỗ

```bash
sudo du -sh /var/log /usr /var/lib
sudo du -h --max-depth=1 /var | sort -h | tail -5
```

```text
24M	/var/log
1.5G	/usr
100M	/var/lib
48K	/var/tmp
24M	/var/log
43M	/var/cache
100M	/var/lib
167M	/var
```

| Phần | Ý nghĩa |
|---|---|
| `du` | Đo dung lượng thư mục, file (**d**isk **u**sage) |
| `-s` | Chỉ in tổng của mỗi đối số (**s**ummary) |
| `-h` | Đơn vị dễ đọc |
| `--max-depth=1` (hoặc `-d 1`) | In tổng của từng thư mục con cấp 1 |
| `-a` | In cả file, không chỉ thư mục |
| `\| sort -h \| tail -5` | Sắp theo dung lượng dạng dễ đọc, lấy 5 cái lớn nhất |
| `sudo` | Để đọc được mọi thư mục. Không có thì `du` báo `Permission denied` và đếm thiếu |

**Cách tìm thủ phạm khi ổ đầy**: bắt đầu từ điểm gắn bị đầy, đi xuống từng cấp:

```bash
sudo du -h -d 1 / 2>/dev/null | sort -h | tail
sudo du -h -d 1 /var 2>/dev/null | sort -h | tail
sudo du -h -d 1 /var/log 2>/dev/null | sort -h | tail
```

Thêm `-x` để `du` không đi sang filesystem khác (ví dụ khi đo `/` thì bỏ qua `/boot` và các ổ gắn thêm). Tìm thẳng file lớn: `sudo find / -xdev -type f -size +500M 2>/dev/null` ([bài 10](/bai/tim-kiem-file)). Công cụ `ncdu` (cài bằng `apt`) cho phép duyệt bằng phím mũi tên, rất tiện.

Thủ phạm hay gặp trên server:

| Chỗ | Cách dọn |
|---|---|
| `/var/log` (log không xoay vòng, log ứng dụng) | Cấu hình logrotate, `journalctl --vacuum-size=500M` ([bài 23](/bai/nhat-ky-he-thong)) |
| `/var/lib/docker` | `docker system prune` (cẩn thận: xoá image, container đã dừng) |
| `/var/cache/apt` | `sudo apt clean` |
| File sao lưu cũ, file dump database | Xoá bớt, chuyển đi nơi khác |
| `/tmp` | Xoá file tạm của chương trình đã chết |

## Trường hợp lạ: xoá rồi mà vẫn đầy

Tái hiện: ghi đầy ổ 500 MB, cho một tiến trình mở file, rồi xoá file đó.

```bash
sudo dd if=/dev/zero of=/mnt/dulieu/big bs=1M count=600
df -h /mnt/dulieu
sudo bash -c 'sleep 60 < /mnt/dulieu/big &'
sudo rm /mnt/dulieu/big
df -h /mnt/dulieu
sudo du -sh /mnt/dulieu
```

```text
500109312 bytes (500 MB, 477 MiB) copied, 1.63993 s, 305 MB/s
/dev/vdb1       488M  477M     0 100% /mnt/dulieu
/dev/vdb1       488M  477M     0 100% /mnt/dulieu
20K	/mnt/dulieu
```

`dd` dừng khi ổ đầy. Đã `rm` file mà `df` vẫn 100%, trong khi `du` chỉ thấy 20K. Lý do: file đã mất tên nhưng tiến trình `sleep` còn đang mở nó, nên kernel chưa giải phóng dữ liệu ([bài 12](/bai/hard-link-soft-link): dữ liệu chỉ bị xoá khi không còn ai trỏ tới). Tìm:

```bash
sudo lsof +L1
```

```text
COMMAND  PID USER   FD   TYPE DEVICE  SIZE/OFF NLINK NODE NAME
sleep   1155 root    0r   REG 253,17 500109312     0   13 /mnt/dulieu/big (deleted)
```

| Phần | Ý nghĩa |
|---|---|
| `lsof +L1` | File đang mở có số liên kết nhỏ hơn 1, tức là đã bị xoá |
| `(deleted)` | Đánh dấu file đã bị xoá |
| `SIZE/OFF` | Dung lượng vẫn đang chiếm |

Dừng hoặc khởi động lại tiến trình đó, chỗ trống được trả lại ngay:

```text
/dev/vdb1       488M   24K  452M   1% /mnt/dulieu
```

> Trên server thật, thủ phạm thường là file log bị xoá tay trong khi nginx hoặc ứng dụng vẫn đang ghi. Muốn làm rỗng một file log đang được ghi, đừng `rm` nó, mà dùng `sudo truncate -s 0 file.log` (hoặc `: > file.log`).

## Kiểm tra và sửa lỗi filesystem

Mất điện đột ngột, ổ đĩa lỗi có thể làm filesystem hỏng cấu trúc. Dấu hiệu: lỗi đọc ghi trong `dmesg`, filesystem tự chuyển sang chỉ đọc (dòng `errors=remount-ro` trong fstab của `/` có tác dụng này), máy không khởi động được.

### fsck và e2fsck (ext2/3/4)

**Phải gỡ filesystem ra trước** khi sửa:

```bash
sudo fsck /dev/vdb1
```

```text
fsck from util-linux 2.39.3
e2fsck 1.47.0 (5-Feb-2023)
/dev/vdb1 is mounted.
e2fsck: Cannot continue, aborting.
```

```bash
sudo umount /mnt/dulieu
sudo fsck -f /dev/vdb1
```

```text
fsck from util-linux 2.39.3
e2fsck 1.47.0 (5-Feb-2023)
Pass 1: Checking inodes, blocks, and sizes
Pass 2: Checking directory structure
Pass 3: Checking directory connectivity
Pass 4: Checking reference counts
Pass 5: Checking group summary information
dulieu: 12/32768 files (0.0% non-contiguous), 6353/131072 blocks
```

| Phần | Ý nghĩa |
|---|---|
| `fsck` | Chương trình chung, tự gọi công cụ đúng loại (`e2fsck` cho ext4) |
| `-f` | Ép kiểm tra kể cả khi filesystem được đánh dấu "sạch" (**f**orce) |
| `-n` | Chỉ kiểm tra, trả lời "không" cho mọi câu hỏi sửa. An toàn để xem trước |
| `-y` | Tự trả lời "có" cho mọi câu hỏi sửa |
| `Pass 1–5` | Năm bước kiểm tra: inode, thư mục, liên kết, số đếm, thống kê |
| `12/32768 files` | Đã dùng 12 trên 32768 inode |

Gặp lỗi, e2fsck hỏi từng câu `Fix<y>?`. File mất tên được đưa vào `lost+found`.

Ổ `/` thì không gỡ ra được khi đang chạy. Cách làm: cho kiểm tra ở lần khởi động tới (thêm `fsck.mode=force` vào dòng kernel ở menu GRUB), hoặc khởi động vào chế độ cứu hộ ([bài 21](/bai/khoi-dong-he-thong)). Cột 6 trong `/etc/fstab` quyết định ổ nào được tự kiểm tra khi khởi động.

Nếu superblock chính bị hỏng, e2fsck dùng được bản sao. Vị trí bản sao đã được in lúc `mkfs`, hoặc xem bằng:

```bash
sudo dumpe2fs /dev/vdb1 | grep -i "superblock at"
```

```text
  Primary superblock at 0, Group descriptors at 1-1
  Backup superblock at 32768, Group descriptors at 32769-32769
  Backup superblock at 98304, Group descriptors at 98305-98305
```

Rồi `sudo e2fsck -b 32768 /dev/vdb1`.

### xfs_repair (xfs)

`fsck.xfs` không làm gì cả. Với xfs dùng `xfs_repair`, cũng phải gỡ ổ ra trước:

```bash
sudo umount /srv/web
sudo xfs_repair -n /dev/vdb2
sudo mount /srv/web
```

```text
        - moving disconnected inodes to lost+found ...
Phase 7 - verify link counts...
No modify flag set, skipping filesystem flush and exiting.
```

`-n` chỉ kiểm tra. Bỏ `-n` để sửa thật.

### tune2fs: xem và chỉnh thông số ext4

```bash
sudo tune2fs -l /dev/vdb1 | grep -E "Filesystem state|Block count|Reserved block count|Mount count|Last checked"
sudo tune2fs -m 1 /dev/vdb1
```

```text
Filesystem state:         clean
Block count:              131072
Reserved block count:     6553
Mount count:              4
Last checked:             Fri Nov 27 08:43:40 2026
Setting reserved blocks percentage to 1% (1310 blocks)
```

| Lệnh | Làm gì |
|---|---|
| `tune2fs -l` | Liệt kê thông số filesystem: trạng thái, số khối, số lần gắn, lần kiểm tra cuối |
| `tune2fs -m 1` | Giảm phần dành riêng cho root từ 5% xuống 1%. Hữu ích với ổ dữ liệu lớn (5% của 4 TB là 200 GB bị giữ lại) |
| `tune2fs -L tên` | Đổi nhãn |
| `tune2fs -c 30` | Tự kiểm tra sau mỗi 30 lần gắn (`-1` là tắt) |

## Thực hành

1. Filesystem nào trên máy đang dùng nhiều nhất (theo %)? Còn bao nhiêu inode trên `/`?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   df -h -x tmpfs
   df -i /
   ```

   </details>

2. Tìm 5 thư mục con chiếm nhiều chỗ nhất trong `/usr`, và 5 file lớn nhất trong `/var/log`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo du -h -d 1 /usr 2>/dev/null | sort -h | tail -6
   sudo find /var/log -type f -exec du -h {} + 2>/dev/null | sort -h | tail -5
   ```

   Dòng cuối cùng của lệnh đầu là tổng của `/usr`, nên lấy 6 dòng.

   </details>

3. (Máy ảo) Tái hiện trường hợp "xoá rồi mà vẫn đầy" như trong bài, tìm ra tiến trình bằng `lsof +L1`, xử lý cho ổ trống lại.

4. (Máy ảo) Gỡ phân vùng ext4 ra, kiểm tra bằng `fsck -f`, xem thông số bằng `tune2fs -l`, rồi gắn lại.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo umount /dev/vdb1
   sudo fsck -f /dev/vdb1
   sudo tune2fs -l /dev/vdb1 | head -20
   sudo mount -a
   ```

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Ổ nào sắp đầy | `df -h`, `df -hT -x tmpfs` |
| Hết inode? | `df -i` |
| Thư mục nào lớn | `sudo du -h -d 1 /đường 2>/dev/null \| sort -h \| tail` |
| Tổng một thư mục | `sudo du -sh thư-mục` |
| File đã xoá vẫn chiếm chỗ | `sudo lsof +L1` |
| Làm rỗng log đang được ghi | `sudo truncate -s 0 file.log` |
| Kiểm tra / sửa ext4 (gỡ ổ trước) | `sudo fsck -f /dev/x`, `sudo e2fsck -n /dev/x` |
| Kiểm tra / sửa xfs | `sudo xfs_repair -n /dev/x` |
| Thông số ext4 | `sudo tune2fs -l /dev/x` |
