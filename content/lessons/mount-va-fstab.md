---
summary: Gắn một filesystem vào cây thư mục (mount), gỡ ra (umount), xử lý lỗi "target is busy", các tuỳ chọn gắn (ro, noexec…), và ghi vào /etc/fstab để tự gắn mỗi khi khởi động — kèm cách kiểm tra fstab trước khi khởi động lại để không làm máy treo.
minutes: 40
commands: [mount, umount, findmnt, /etc/fstab, mount -a, findmnt --verify, lsof, fuser, blkid]
quiz:
  - q: "Lệnh nào gắn /dev/vdb1 vào thư mục /mnt/dulieu?"
    options: ["mount /mnt/dulieu /dev/vdb1", "sudo mount /dev/vdb1 /mnt/dulieu", "sudo umount /dev/vdb1 /mnt/dulieu", "ln -s /dev/vdb1 /mnt/dulieu"]
    answer: 1
    explain: "`mount THIẾT-BỊ THƯ-MỤC`. Thư mục phải có sẵn (tạo bằng `mkdir -p`). File cũ trong thư mục đó bị che đi cho đến khi gỡ ra."
  - q: "`umount` báo `target is busy`. Nguyên nhân hay gặp nhất?"
    options: ["Ổ bị hỏng", "Có tiến trình đang dùng thư mục đó, kể cả chính shell của bạn đang cd vào trong", "Thiếu sudo", "Ổ chưa được gắn"]
    answer: 1
    explain: "Thoát khỏi thư mục (`cd /`), tìm tiến trình đang dùng bằng `lsof +f -- /mnt/dulieu` hoặc `fuser -vm /mnt/dulieu`, dừng nó rồi gỡ lại."
  - q: Vì sao trong /etc/fstab nên dùng UUID=... thay vì /dev/vdb1?
    options: ["Ngắn hơn", "Tên /dev/sdX có thể đổi thứ tự khi thêm bớt ổ; UUID gắn với chính filesystem nên không đổi", "Vì /dev/vdb1 không hợp lệ", "Để nhanh hơn"]
    answer: 1
    explain: "Thêm một ổ mới có thể làm `sdb` thành `sdc`. Gắn nhầm ổ, hoặc không tìm thấy ổ lúc khởi động, có thể làm máy treo ở chế độ khẩn cấp."
  - q: "Trong dòng fstab `UUID=... /srv/web xfs defaults,nofail 0 2`, tuỳ chọn nofail có tác dụng gì?"
    options: ["Không cho ghi", "Nếu không tìm thấy ổ lúc khởi động thì bỏ qua, máy vẫn khởi động bình thường", "Không kiểm tra lỗi", "Tự sửa lỗi"]
    answer: 1
    explain: "Không có `nofail`, thiếu ổ (volume bị gỡ, ổ hỏng) sẽ làm máy dừng ở chế độ khẩn cấp và phải vào console để sửa. Với ổ dữ liệu phụ, nên luôn có `nofail`."
  - q: Vừa sửa /etc/fstab, cách kiểm tra an toàn trước khi khởi động lại?
    options: ["Khởi động lại thử", "sudo findmnt --verify rồi sudo mount -a", "cat /etc/fstab", "Không cần kiểm tra"]
    answer: 1
    explain: "`findmnt --verify` kiểm tra cú pháp và các ổ được nhắc tới. `mount -a` gắn mọi dòng chưa gắn: báo lỗi ngay bây giờ thì sửa được, còn hơn để máy treo lúc khởi động."
---

> Bài này tiếp nối [bài mở rộng 4](/bai/phan-vung-va-filesystem): ổ `/dev/vdb` có `vdb1` (ext4, nhãn `dulieu`), `vdb2` (xfs, nhãn `web`), `vdb3` (swap).

## mount: gắn filesystem vào cây thư mục

Linux chỉ có một cây thư mục ([bài 6](/bai/cay-thu-muc)). Một filesystem mới chỉ dùng được khi được **gắn** (mount) vào một thư mục trong cây. Thư mục đó gọi là **điểm gắn** (mount point).

```bash
sudo mkdir -p /mnt/dulieu
sudo mount /dev/vdb1 /mnt/dulieu
df -h /mnt/dulieu
```

```text
Filesystem      Size  Used Avail Use% Mounted on
/dev/vdb1       488M   24K  452M   1% /mnt/dulieu
```

| Phần | Ý nghĩa |
|---|---|
| `mkdir -p /mnt/dulieu` | Tạo thư mục làm điểm gắn |
| `mount` | Gắn filesystem |
| `/dev/vdb1` | Thiết bị chứa filesystem. Có thể ghi `UUID=...` hoặc `LABEL=dulieu` |
| `/mnt/dulieu` | Điểm gắn. Nếu thư mục có sẵn file, chúng bị **che đi** (không mất) cho đến khi gỡ |
| `-t ext4` | (Tuỳ chọn) loại filesystem. Thường không cần, `mount` tự nhận ra |

Thư mục mới gắn có `lost+found`: chỗ `fsck` để lại các mảnh file tìm được khi sửa lỗi ext4.

### Xem những gì đang được gắn

```bash
findmnt /mnt/dulieu
findmnt -t ext4,xfs
```

```text
TARGET      SOURCE    FSTYPE OPTIONS
/mnt/dulieu /dev/vdb1 ext4   rw,relatime
TARGET        SOURCE                   FSTYPE OPTIONS
/             /dev/vda1                ext4   rw,relatime,discard,errors=remount-ro,commit=30
|-/boot       /dev/vda16               ext4   rw,relatime
`-/mnt/dulieu /dev/vdb1                ext4   rw,relatime
```

| Lệnh | Cho biết |
|---|---|
| `findmnt` | Cây các filesystem đang gắn. `-t` lọc theo loại |
| `mount` (không đối số) | Danh sách đang gắn, rất dài vì có cả filesystem ảo. `mount \| grep vdb` để lọc |
| `df -h` | Đang gắn kèm dung lượng |
| `lsblk` | Cột `MOUNTPOINTS` |

## umount: gỡ ra

```bash
sudo umount /mnt/dulieu
```

Ghi điểm gắn hoặc thiết bị đều được (`umount /dev/vdb1`). Lưu ý tên lệnh là **umount**, không có chữ n.

Lỗi hay gặp nhất:

```text
umount: /mnt/dulieu: target is busy.
```

Có tiến trình đang dùng thư mục, rất hay là **chính shell của bạn đang đứng trong đó**. Tìm thủ phạm:

```bash
sudo lsof +f -- /mnt/dulieu
sudo fuser -vm /mnt/dulieu
```

```text
COMMAND  PID    USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
sleep   2331 hocvien  cwd    DIR 253,17     4096    2 /mnt/dulieu
                     USER        PID ACCESS COMMAND
/mnt/dulieu:         root     kernel mount /mnt/dulieu
                     hocvien    2331 ..c.. sleep
```

| Phần | Ý nghĩa |
|---|---|
| `lsof +f -- /mnt/dulieu` | Liệt kê file đang mở trên filesystem đó (**l**ist **o**pen **f**iles) |
| `cwd` | Tiến trình đang đứng (thư mục làm việc) trong đó |
| `fuser -vm` | Liệt kê tiến trình dùng filesystem. Cột `ACCESS`: `c` thư mục làm việc, `f` file đang mở |

Thoát thư mục (`cd /`), dừng tiến trình (`kill PID`), rồi `umount` lại.

## Tuỳ chọn gắn

```bash
sudo mount -o ro,noexec /dev/vdb1 /mnt/dulieu
findmnt -no OPTIONS /mnt/dulieu
sudo touch /mnt/dulieu/b
sudo mount -o remount,rw /mnt/dulieu
```

```text
ro,noexec,relatime
touch: cannot touch '/mnt/dulieu/b': Read-only file system
```

| Tuỳ chọn | Ý nghĩa |
|---|---|
| `defaults` | Bộ mặc định: `rw,suid,dev,exec,auto,nouser,async` |
| `ro` / `rw` | Chỉ đọc / đọc ghi |
| `noexec` | Không cho chạy chương trình nằm trên filesystem này. Hay dùng cho `/tmp` để chặn mã độc |
| `nosuid` | Bỏ qua bit SUID/SGID ([bài mở rộng 20](/bai/quyen-dac-biet)) |
| `nodev` | Không coi file thiết bị trên đó là thiết bị |
| `noatime` | Không ghi lại thời gian đọc file, giảm ghi đĩa |
| `remount` | Đổi tuỳ chọn của filesystem đang gắn mà không cần gỡ |
| `nofail` | (Trong fstab) thiếu ổ thì bỏ qua, không làm treo quá trình khởi động |
| `user` / `users` | Cho user thường gắn / gỡ (USB) |

Gắn file ISO hoặc ổ CD: `sudo mount /dev/sr0 /mnt` (hoặc `sudo mount -o loop file.iso /mnt`). Nó tự gắn chỉ đọc:

```text
mount: /mnt: WARNING: source write-protected, mounted read-only.
```

## /etc/fstab: tự gắn khi khởi động

Gắn bằng `mount` sẽ mất sau khi khởi động lại. Muốn giữ lâu dài, ghi vào `/etc/fstab` (**f**ile**s**ystem **tab**le):

```bash
cat /etc/fstab
```

```text
LABEL=cloudimg-rootfs	/	 ext4	discard,commit=30,errors=remount-ro	0 1
LABEL=BOOT	/boot	ext4	defaults	0 2
LABEL=UEFI	/boot/efi	vfat	umask=0077	0 1
```

Mỗi dòng 6 cột:

| Cột | Ví dụ | Ý nghĩa |
|---|---|---|
| 1. Thiết bị | `UUID=8cea...`, `LABEL=BOOT`, `/dev/vdb1` | Cái gì cần gắn. **Nên dùng UUID** |
| 2. Điểm gắn | `/srv/web` | Gắn vào đâu. Swap ghi `none` |
| 3. Loại | `ext4`, `xfs`, `vfat`, `swap` | Loại filesystem |
| 4. Tuỳ chọn | `defaults,nofail` | Như `mount -o` |
| 5. dump | `0` | Công cụ sao lưu cũ `dump`, gần như luôn là `0` |
| 6. fsck | `1`, `2`, `0` | Thứ tự kiểm tra lỗi khi khởi động: `1` cho `/`, `2` cho các ổ khác, `0` là không kiểm tra (xfs, swap) |

Vì sao dùng UUID: tên `/dev/sdb` có thể đổi thành `/dev/sdc` khi thêm ổ hoặc khi đổi thứ tự cắm. UUID gắn với chính filesystem nên không đổi. Lấy UUID bằng `sudo blkid` hoặc `lsblk -f`.

### Thêm một dòng vào fstab

```bash
sudo mkdir -p /srv/web
sudo blkid -s UUID -o value /dev/vdb2
echo "UUID=8cea9187-1bc2-4a5d-bad5-c8249dc871f4  /srv/web  xfs  defaults,nofail  0  2" | sudo tee -a /etc/fstab
```

| Phần | Ý nghĩa |
|---|---|
| `blkid -s UUID -o value` | Chỉ in giá trị UUID (**s**how tag UUID, **o**utput value) |
| `sudo tee -a /etc/fstab` | Ghi nối vào cuối fstab bằng quyền root ([bài 13](/bai/chuyen-huong-va-pipe)) |

Có thể sửa bằng `sudo vim /etc/fstab`. **Luôn sao lưu trước**: `sudo cp /etc/fstab /etc/fstab.bak`.

### Kiểm tra trước khi khởi động lại

Một dòng fstab sai (gõ nhầm UUID, sai loại filesystem, thiếu thư mục) có thể làm máy **dừng ở chế độ khẩn cấp** lúc khởi động. Máy chủ ở xa thì bạn sẽ phải vào màn hình console của nhà cung cấp để sửa. Vì vậy luôn kiểm tra:

```bash
sudo findmnt --verify
sudo systemctl daemon-reload
sudo mount -a
findmnt /srv/web
```

```text
0 parse errors, 0 errors, 1 warning
   [W] your fstab has been modified, but systemd still uses the old version;
       use 'systemctl daemon-reload' to reload
TARGET   SOURCE    FSTYPE OPTIONS
/srv/web /dev/vdb2 xfs    rw,relatime,attr2,inode64,logbufs=8,logbsize=32k,noquota
```

| Lệnh | Làm gì |
|---|---|
| `findmnt --verify` | Kiểm tra fstab: cú pháp, thiết bị có tồn tại, thư mục có tồn tại |
| `systemctl daemon-reload` | systemd chuyển mỗi dòng fstab thành một unit `.mount`. Sửa fstab xong cần reload |
| `mount -a` | Gắn mọi dòng trong fstab chưa được gắn. Lỗi thì báo **ngay bây giờ** |

Một fstab có lỗi trông như sau khi kiểm tra:

```text
0 parse errors, 2 errors, 1 warning
/khongco
   [E] unreachable on boot required target: No such file or directory
```

Khởi động lại máy để chắc chắn:

```bash
sudo reboot
```

Sau khi vào lại, `findmnt /srv/web` vẫn thấy ổ, và có unit `srv-web.mount` do systemd tự tạo từ fstab:

```text
  srv-web.mount                 loaded active mounted /srv/web
```

### Swap trong fstab

```text
/dev/vdb3  none  swap  sw  0  0
/swapfile  none  swap  sw  0  0
```

Bật mọi swap trong fstab mà không cần khởi động lại: `sudo swapon -a`.

## Thực hành

Trên máy đã làm [bài mở rộng 4](/bai/phan-vung-va-filesystem).

1. Gắn phân vùng ext4 vào `/mnt/dulieu`, tạo một file trong đó, gỡ ra, rồi kiểm tra file nằm ở đâu.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo mkdir -p /mnt/dulieu
   sudo mount /dev/vdb1 /mnt/dulieu
   echo xin chao | sudo tee /mnt/dulieu/thu.txt
   sudo umount /mnt/dulieu
   ls /mnt/dulieu
   sudo mount /dev/vdb1 /mnt/dulieu
   ls /mnt/dulieu
   ```

   Sau khi gỡ, `/mnt/dulieu` trống, vì file nằm trên `vdb1` chứ không nằm trên ổ hệ điều hành. Gắn lại thì file xuất hiện.

   </details>

2. `cd` vào `/mnt/dulieu` rồi thử `sudo umount /mnt/dulieu`. Đọc lỗi, tìm ra tiến trình đang giữ thư mục, xử lý rồi gỡ được.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   cd /mnt/dulieu
   sudo umount /mnt/dulieu
   sudo fuser -vm /mnt/dulieu
   cd /
   sudo umount /mnt/dulieu
   ```

   `fuser` chỉ ra chính tiến trình `bash` của bạn.

   </details>

3. Thêm phân vùng ext4 vào fstab bằng UUID, gắn ở `/data`, tuỳ chọn `defaults,noatime,nofail`. Kiểm tra bằng `findmnt --verify` và `mount -a`, khởi động lại, xác nhận vẫn được gắn.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo cp /etc/fstab /etc/fstab.bak
   sudo mkdir -p /data
   U=$(sudo blkid -s UUID -o value /dev/vdb1)
   echo "UUID=$U  /data  ext4  defaults,noatime,nofail  0  2" | sudo tee -a /etc/fstab
   sudo findmnt --verify
   sudo systemctl daemon-reload
   sudo mount -a
   findmnt /data
   sudo reboot
   ```

   Vào lại rồi `findmnt /data`.

   </details>

4. Gắn lại `/data` thành chỉ đọc mà không gỡ ra, thử tạo file (phải lỗi), rồi trả về đọc ghi.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo mount -o remount,ro /data
   sudo touch /data/x
   sudo mount -o remount,rw /data
   ```

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Gắn | `sudo mount /dev/vdb1 /mnt/x` (hoặc `UUID=...`, `LABEL=...`) |
| Gỡ | `sudo umount /mnt/x` |
| Xem đang gắn | `findmnt`, `df -h`, `lsblk` |
| Ai đang giữ thư mục | `sudo lsof +f -- /mnt/x`, `sudo fuser -vm /mnt/x` |
| Đổi tuỳ chọn khi đang gắn | `sudo mount -o remount,ro /mnt/x` |
| Lấy UUID | `sudo blkid`, `lsblk -f` |
| Dòng fstab | `UUID=...  /điểm-gắn  ext4  defaults,nofail  0  2` |
| Kiểm tra fstab | `sudo findmnt --verify && sudo mount -a` |
