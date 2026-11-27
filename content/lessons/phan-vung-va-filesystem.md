---
summary: Gắn thêm một ổ đĩa mới vào server và dùng được nó — chọn kiểu bảng phân vùng (MBR hay GPT), chia phân vùng bằng fdisk, tạo filesystem (ext4, xfs), tạo swap, và dùng LVM để sau này nới rộng dung lượng mà không phải chia lại ổ.
minutes: 50
commands: [fdisk, gdisk, parted, sfdisk, mkfs.ext4, mkfs.xfs, mkswap, swapon, swapoff, blkid, lsblk -f, pvcreate, vgcreate, lvcreate, lvextend, pvs, vgs, lvs]
quiz:
  - q: Ổ đĩa 4 TB, máy khởi động UEFI. Nên dùng kiểu bảng phân vùng nào?
    options: ["MBR", "GPT", "Không cần bảng phân vùng", "FAT32"]
    answer: 1
    explain: "MBR chỉ quản lý tối đa 2 TB và 4 phân vùng chính. GPT không có các giới hạn đó (tới 128 phân vùng), và là chuẩn đi kèm UEFI. Máy mới nên luôn dùng GPT."
  - q: "Trong fdisk, mọi thay đổi chỉ thật sự ghi xuống ổ khi gõ lệnh nào?"
    options: ["p", "n", "w", "q"]
    answer: 2
    explain: "`w` (write) ghi bảng phân vùng xuống ổ rồi thoát. Trước đó mọi thứ chỉ nằm trong bộ nhớ. `q` thoát mà không ghi, an toàn để huỷ."
  - q: Sau khi chia phân vùng /dev/vdb1, cần làm gì để lưu được file vào đó?
    options: ["Gắn (mount) ngay", "Tạo filesystem (ví dụ mkfs.ext4 /dev/vdb1) rồi mới gắn", "Chạy swapon", "Không cần gì"]
    answer: 1
    explain: "Phân vùng chỉ là một vùng trống. Phải tạo filesystem (định dạng) để có cấu trúc thư mục, inode… rồi gắn vào cây thư mục ([bài 30](/bai/mount-va-fstab))."
  - q: Trong LVM, thứ tự tạo đúng là gì?
    options: ["LV → VG → PV", "PV → VG → LV", "VG → PV → LV", "LV → PV → VG"]
    answer: 1
    explain: "Physical Volume (ổ hoặc phân vùng thật) → gom vào Volume Group (kho dung lượng chung) → cắt ra Logical Volume (dùng như phân vùng, tạo filesystem trên đó)."
  - q: "`lvextend -r -L +200M /dev/vgdata/lvapp` làm gì?"
    options: ["Tạo LV mới 200 MB", "Nới LV thêm 200 MB và nới luôn filesystem bên trong (-r), kể cả khi đang gắn", "Thu nhỏ LV", "Xoá 200 MB dữ liệu"]
    answer: 1
    explain: "`-L +200M` thêm 200 MB lấy từ phần trống của VG. `-r` (resizefs) gọi luôn công cụ nới filesystem (resize2fs, xfs_growfs). Đây là lý do server nên dùng LVM."
  - q: Máy 2 GB RAM hay bị hết bộ nhớ khi build. Cách nhanh nhất để thêm vùng hoán đổi mà không chia lại ổ?
    options: ["Mua thêm RAM", "Tạo swap file: fallocate, chmod 600, mkswap, swapon", "Tạo phân vùng mới", "Xoá /tmp"]
    answer: 1
    explain: "Swap có thể là một file. Tạo file, giới hạn quyền 600, định dạng swap, bật lên. Ghi vào /etc/fstab để giữ sau khi khởi động lại."
---

> Cần **máy ảo hoặc VPS** có một ổ đĩa trống. Với Multipass, ổ ảo khó gắn thêm, nên dùng VirtualBox (thêm một ổ ảo 2 GB), hoặc VPS cho phép gắn thêm volume. Kết quả trong bài lấy từ máy ảo Ubuntu 24.04 có ổ trống `/dev/vdb` 2 GB.
>
> **Các lệnh trong bài xoá sạch dữ liệu trên ổ mà chúng chạm vào.** Luôn kiểm tra tên ổ bằng `lsblk` trước. Gõ nhầm `vda` thay vì `vdb` là mất hệ điều hành.

## Các lớp từ ổ đĩa đến file

| Lớp | Là gì | Công cụ |
|---|---|---|
| Ổ đĩa | Thiết bị thật: `/dev/vdb`, `/dev/sdb`, `/dev/nvme1n1` | `lsblk` |
| Bảng phân vùng | Ghi ổ được chia thành những vùng nào | `fdisk`, `gdisk`, `parted` |
| Phân vùng | Một vùng liên tục trên ổ: `/dev/vdb1` | |
| (Tuỳ chọn) LVM | Gom nhiều phân vùng / ổ thành kho chung, cắt ra ổ logic co giãn được | `pvcreate`, `vgcreate`, `lvcreate` |
| Filesystem | Cấu trúc để lưu file, thư mục, quyền: ext4, xfs… | `mkfs` |
| Điểm gắn | Thư mục nơi filesystem xuất hiện trong cây | `mount` ([bài 30](/bai/mount-va-fstab)) |

## MBR và GPT

| | MBR (DOS) | GPT |
|---|---|---|
| Dung lượng ổ tối đa | 2 TB | Gần như không giới hạn |
| Số phân vùng | 4 phân vùng chính (hoặc 3 chính + 1 mở rộng chứa nhiều phân vùng logic) | 128 |
| Đi kèm | BIOS cũ | UEFI |
| An toàn | Một bản bảng phân vùng ở đầu ổ | Có bản sao ở cuối ổ, có kiểm tra lỗi (CRC) |

Máy mới: **luôn dùng GPT**. Xem ổ hệ điều hành của máy ảo đang dùng gì:

```bash
sudo fdisk -l /dev/vda
```

```text
Disk /dev/vda: 12 GiB, 12884901888 bytes, 25165824 sectors
Disklabel type: gpt
...
Device       Start      End  Sectors  Size Type
/dev/vda1  2099200 25165790 23066591   11G Linux filesystem
/dev/vda14    2048    10239     8192    4M BIOS boot
/dev/vda15   10240   227327   217088  106M EFI System
/dev/vda16  227328  2097152  1869825  913M Linux extended boot
```

| Phân vùng | Dùng làm |
|---|---|
| `vda1` (11G) | `/`, chứa toàn bộ hệ điều hành |
| `vda14` (4M) | Chỗ cho GRUB khi máy khởi động kiểu BIOS trên ổ GPT |
| `vda15` (106M) | Phân vùng EFI (FAT32), gắn ở `/boot/efi` |
| `vda16` (913M) | `/boot`: kernel và initramfs |

## Chia phân vùng bằng fdisk

Ổ `vdb` mới tinh, chưa có gì:

```bash
lsblk
sudo fdisk /dev/vdb
```

`fdisk` là chương trình hỏi đáp. Gõ chữ cái lệnh rồi Enter. **Không có gì được ghi xuống ổ cho đến khi gõ `w`**.

| Lệnh trong fdisk | Làm gì |
|---|---|
| `m` | Trợ giúp |
| `p` | In bảng phân vùng hiện tại |
| `g` | Tạo bảng phân vùng GPT mới (rỗng) |
| `o` | Tạo bảng phân vùng MBR mới |
| `n` | Tạo phân vùng mới |
| `d` | Xoá phân vùng |
| `t` | Đổi loại phân vùng (Linux, swap, LVM, EFI…) |
| `w` | **Ghi** xuống ổ và thoát |
| `q` | Thoát **không ghi** (huỷ mọi thay đổi) |

Phiên làm việc tạo bảng GPT và phân vùng 512 MB đầu tiên (chữ sau dấu `:` là phần mình gõ, bấm Enter trống là chọn mặc định):

```text
Welcome to fdisk (util-linux 2.39.3).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

Device does not contain a recognized partition table.
Created a new DOS (MBR) disklabel with disk identifier 0x66644e65.

Command (m for help): g
Created a new GPT disklabel (GUID: D02440EB-3F09-4537-A149-7E29D1E6A8FC).

Command (m for help): n
Partition number (1-128, default 1):
First sector (2048-4194270, default 2048):
Last sector, +/-sectors or +/-size{K,M,G,T,P} (2048-4194270, default 4192255): +512M

Created a new partition 1 of type 'Linux filesystem' and of size 512 MiB.

Command (m for help): w
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.
```

Hai dòng `Device does not contain...` chỉ là fdisk báo ổ đang trống và tạm dựng sẵn một bảng MBR trong bộ nhớ. Lệnh `g` thay nó bằng bảng GPT.

| Câu hỏi | Trả lời |
|---|---|
| `Partition number` | Enter: lấy số kế tiếp |
| `First sector` | Enter: bắt đầu ngay sau phân vùng trước |
| `Last sector` | `+512M` để tạo 512 MB. Enter trống là lấy hết phần còn lại |

Làm tiếp tương tự để có 4 phân vùng (phân vùng 3 đổi loại thành swap bằng `t` → `3` → `swap`):

```bash
sudo fdisk -l /dev/vdb
```

```text
Device       Start     End Sectors  Size Type
/dev/vdb1     2048 1050623 1048576  512M Linux filesystem
/dev/vdb2  1050624 2099199 1048576  512M Linux filesystem
/dev/vdb3  2099200 2623487  524288  256M Linux swap
/dev/vdb4  2623488 4192255 1568768  766M Linux filesystem
```

Công cụ khác:

| Công cụ | Ghi chú |
|---|---|
| `gdisk` | Giống `fdisk` nhưng chỉ cho GPT |
| `parted` | Có thể ra lệnh một dòng, tiện cho script: `sudo parted /dev/vdb print`, `sudo parted -s /dev/vdb mklabel gpt mkpart data ext4 1MiB 100%` |
| `sfdisk` | Đọc cấu hình từ stdin, dùng trong script |
| `cfdisk` | Có menu chọn bằng phím mũi tên, dễ dùng nhất |

## Tạo filesystem

| Filesystem | Đặc điểm | Hay dùng cho |
|---|---|---|
| **ext4** | Mặc định của Ubuntu, Debian. Ổn định, thu nhỏ và nới rộng được | Hầu hết trường hợp |
| **xfs** | Mặc định của RHEL, Rocky. Mạnh với file lớn, chỉ nới rộng được (không thu nhỏ) | Database, file lớn |
| **btrfs** | Có snapshot, nén, kiểm tra toàn vẹn | Fedora, openSUSE, máy cá nhân |
| **vfat** (FAT32) | Đọc được ở mọi hệ điều hành | Phân vùng EFI, USB |

```bash
sudo mkfs.ext4 -L dulieu /dev/vdb1
sudo mkfs.xfs -L web /dev/vdb2
```

| Phần | Ý nghĩa |
|---|---|
| `mkfs.ext4` | Tạo filesystem ext4 (viết cách khác: `mkfs -t ext4`) |
| `-L dulieu` | Đặt nhãn (**L**abel) để nhận ra phân vùng |
| `/dev/vdb1` | Phân vùng cần định dạng. **Mọi dữ liệu cũ trên đó sẽ mất** |

```text
mke2fs 1.47.0 (5-Feb-2023)
Creating filesystem with 131072 4k blocks and 32768 inodes
Filesystem UUID: 718511e2-3f47-4c11-8572-b957cb8096d5
Superblock backups stored on blocks:
	32768, 98304
...
Writing superblocks and filesystem accounting information: done
```

| Dòng | Ý nghĩa |
|---|---|
| `131072 4k blocks` | Chia thành 131072 khối, mỗi khối 4 KB (= 512 MB) |
| `32768 inodes` | Tối đa 32768 file (mỗi file cần một inode, [bài 12](/bai/hard-link-soft-link)) |
| `Filesystem UUID` | Mã định danh duy nhất, dùng trong `/etc/fstab` |
| `Superblock backups` | Các bản sao thông tin quan trọng, dùng khi sửa lỗi ([bài 31](/bai/dung-luong-va-sua-loi)) |

Xem kết quả:

```bash
lsblk -f /dev/vdb
sudo blkid /dev/vdb1
```

```text
NAME   FSTYPE FSVER LABEL   UUID                                 FSAVAIL FSUSE% MOUNTPOINTS
vdb
|-vdb1 ext4   1.0   dulieu  718511e2-3f47-4c11-8572-b957cb8096d5
|-vdb2 xfs          web     8cea9187-1bc2-4a5d-bad5-c8249dc871f4
|-vdb3 swap   1     hoandoi 94a58add-6872-4b84-ac31-ec61bbfa9c36
`-vdb4
/dev/vdb1: LABEL="dulieu" UUID="718511e2-3f47-4c11-8572-b957cb8096d5" BLOCK_SIZE="4096" TYPE="ext4" PARTUUID="5eb765e3-3de7-4a12-86cc-2f79eed935fe"
```

| Lệnh | Cho biết |
|---|---|
| `lsblk -f` | Loại filesystem, nhãn, UUID, chỗ gắn của từng phân vùng |
| `blkid` | UUID, nhãn, loại filesystem (dạng dễ đưa vào script) |

## Swap: vùng hoán đổi

Khi RAM đầy, kernel đẩy bớt dữ liệu ít dùng ra **swap** trên đĩa. Swap chậm hơn RAM rất nhiều, nhưng giúp máy không bị giết tiến trình khi thiếu RAM đột ngột.

### Swap trên phân vùng

```bash
sudo mkswap -L hoandoi /dev/vdb3
sudo swapon /dev/vdb3
swapon --show
free -h | grep Swap
```

```text
Setting up swapspace version 1, size = 256 MiB (268431360 bytes)
LABEL=hoandoi, UUID=94a58add-6872-4b84-ac31-ec61bbfa9c36
NAME      TYPE      SIZE USED PRIO
/dev/vdb3 partition 256M   0B   -2
Swap:          255Mi          0B       255Mi
```

| Lệnh | Làm gì |
|---|---|
| `mkswap` | Định dạng phân vùng làm swap |
| `swapon /dev/vdb3` | Bật swap |
| `swapon --show` | Xem các vùng swap đang dùng |
| `swapoff /dev/vdb3` | Tắt swap |

### Swap file: cách nhanh trên VPS

VPS thường không có swap. Không cần chia lại ổ, tạo một file làm swap:

```bash
sudo fallocate -l 512M /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
swapon --show
```

```text
NAME      TYPE SIZE USED PRIO
/swapfile file 512M   0B   -2
```

| Lệnh | Ý nghĩa |
|---|---|
| `fallocate -l 512M /swapfile` | Tạo file 512 MB ngay lập tức (cấp chỗ trên đĩa) |
| `chmod 600` | Chỉ root đọc ghi được, vì swap có thể chứa dữ liệu nhạy cảm từ RAM |
| `mkswap`, `swapon` | Định dạng và bật |

Swap bật bằng `swapon` sẽ mất khi khởi động lại. Muốn giữ, thêm vào `/etc/fstab` ([bài sau](/bai/mount-va-fstab)): `/swapfile none swap sw 0 0`.

## LVM: dung lượng co giãn được

Chia phân vùng cố định có nhược điểm: phân vùng đầy thì rất khó nới (phải còn chỗ trống liền kề phía sau). **LVM** (Logical Volume Manager) thêm một lớp ở giữa:

| Khái niệm | Viết tắt | Là gì | Ví dụ |
|---|---|---|---|
| Physical Volume | PV | Ổ hoặc phân vùng thật được giao cho LVM | `/dev/vdb4` |
| Volume Group | VG | Kho dung lượng gom từ một hoặc nhiều PV | `vgdata` |
| Logical Volume | LV | "Phân vùng ảo" cắt ra từ VG, tạo filesystem trên đó | `/dev/vgdata/lvapp` |

Hết chỗ? Gắn thêm ổ mới, thêm vào VG, rồi nới LV. Không cần dừng máy, không cần chia lại.

```bash
sudo pvcreate /dev/vdb4
sudo vgcreate vgdata /dev/vdb4
sudo lvcreate -n lvapp -L 300M vgdata
sudo lvs
```

```text
  Physical volume "/dev/vdb4" successfully created.
  Volume group "vgdata" successfully created
  Logical volume "lvapp" created.
  LV    VG     Attr       LSize   Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
  lvapp vgdata -wi-a----- 300.00m
```

| Lệnh | Làm gì |
|---|---|
| `pvcreate /dev/vdb4` | Đánh dấu phân vùng làm PV |
| `vgcreate vgdata /dev/vdb4` | Tạo VG tên `vgdata` từ PV đó (có thể ghi nhiều PV) |
| `lvcreate -n lvapp -L 300M vgdata` | Tạo LV tên (**n**ame) `lvapp`, dung lượng 300 MB, lấy từ `vgdata`. `-l 100%FREE` để lấy hết chỗ trống |
| `pvs`, `vgs`, `lvs` | Xem tóm tắt PV, VG, LV. `pvdisplay`, `vgdisplay`, `lvdisplay` cho chi tiết |

LV dùng như một phân vùng bình thường, có hai tên trỏ cùng một thiết bị: `/dev/vgdata/lvapp` và `/dev/mapper/vgdata-lvapp`.

```bash
sudo mkfs.ext4 /dev/vgdata/lvapp
sudo mkdir -p /srv/app
sudo mount /dev/vgdata/lvapp /srv/app
df -h /srv/app
```

```text
Filesystem                Size  Used Avail Use% Mounted on
/dev/mapper/vgdata-lvapp  265M   24K  244M   1% /srv/app
```

### Nới rộng khi đang chạy

```bash
sudo lvextend -r -L +200M /dev/vgdata/lvapp
df -h /srv/app
```

```text
  Size of logical volume vgdata/lvapp changed from 300.00 MiB (75 extents) to 500.00 MiB (125 extents).
  Logical volume vgdata/lvapp successfully resized.
Filesystem at /dev/mapper/vgdata-lvapp is mounted on /srv/app; on-line resizing required
The filesystem on /dev/mapper/vgdata-lvapp is now 128000 (4k) blocks long.

Filesystem                Size  Used Avail Use% Mounted on
/dev/mapper/vgdata-lvapp  459M   24K  435M   1% /srv/app
```

| Phần | Ý nghĩa |
|---|---|
| `lvextend` | Nới rộng LV |
| `-L +200M` | Thêm 200 MB (không có dấu `+` là đặt thành đúng dung lượng đó). `-l +100%FREE` để lấy hết chỗ trống của VG |
| `-r` | Nới luôn filesystem bên trong (**r**esizefs). Quên `-r` thì LV to ra nhưng `df` vẫn thấy cũ, phải chạy thêm `resize2fs` (ext4) hoặc `xfs_growfs` (xfs) |

Khi VG hết chỗ: thêm ổ mới bằng `pvcreate /dev/vdc` rồi `vgextend vgdata /dev/vdc`.

```bash
lsblk /dev/vdb
```

```text
NAME             MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
vdb              253:16   0    2G  0 disk
|-vdb1           253:17   0  512M  0 part
|-vdb2           253:18   0  512M  0 part
|-vdb3           253:19   0  256M  0 part
`-vdb4           253:20   0  766M  0 part
  `-vgdata-lvapp 252:0    0  500M  0 lvm  /srv/app
```

## Chia ổ cho server: gợi ý

| Cách | Khi nào |
|---|---|
| Một phân vùng `/` cho tất cả | VPS nhỏ, máy thử nghiệm. Đơn giản nhất (cloud image của Ubuntu làm vậy) |
| Tách `/var` hoặc `/var/lib/<database>` ra ổ / LV riêng | Server có log hoặc database lớn: log đầy không làm đầy `/` và treo cả máy |
| Ổ hệ điều hành riêng + ổ dữ liệu riêng (volume gắn thêm) | Cloud: hỏng máy thì gỡ ổ dữ liệu gắn sang máy khác |
| Dùng LVM | Khi không đoán trước được dung lượng cần |

## Thực hành

Trên máy ảo có ổ trống (thay `vdb` bằng tên ổ trống của bạn, kiểm tra bằng `lsblk`).

1. Tạo bảng GPT trên ổ trống với 2 phân vùng: 1 GB và phần còn lại. Kiểm tra bằng `lsblk`.

   <details>
   <summary>Xem đáp án</summary>

   `sudo fdisk /dev/vdb` → `g` → `n`, Enter, Enter, `+1G` → `n`, Enter, Enter, Enter → `p` để kiểm tra → `w`. Rồi `lsblk /dev/vdb`.

   </details>

2. Định dạng phân vùng 1 bằng ext4, nhãn `backup`. Lấy UUID của nó.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo mkfs.ext4 -L backup /dev/vdb1
   sudo blkid /dev/vdb1
   lsblk -f /dev/vdb
   ```

   </details>

3. Dùng phân vùng 2 làm LVM: tạo PV, VG `vgthu`, LV `lvdata` lấy 50% dung lượng VG. Định dạng xfs, gắn vào `/mnt/data`, rồi nới LV lấy hết phần còn lại.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo pvcreate /dev/vdb2
   sudo vgcreate vgthu /dev/vdb2
   sudo lvcreate -n lvdata -l 50%VG vgthu
   sudo mkfs.xfs /dev/vgthu/lvdata
   sudo mkdir -p /mnt/data
   sudo mount /dev/vgthu/lvdata /mnt/data
   df -h /mnt/data
   sudo lvextend -r -l +100%FREE /dev/vgthu/lvdata
   df -h /mnt/data
   ```

   Nếu phân vùng từng có filesystem, `lvcreate` có thể hỏi `WARNING: ext4 signature detected ... Wipe it? [y/n]`. Gõ `y` để xoá dấu vết cũ.

   </details>

4. Tạo swap file 256 MB, bật nó, kiểm tra bằng `free -h`, rồi tắt và xoá file.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo fallocate -l 256M /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   free -h
   sudo swapoff /swapfile
   sudo rm /swapfile
   ```

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Xem ổ và phân vùng | `lsblk`, `sudo fdisk -l` |
| Chia phân vùng | `sudo fdisk /dev/vdb` (`g`, `n`, `t`, `p`, `w`) |
| Tạo filesystem | `sudo mkfs.ext4 -L nhãn /dev/vdb1`, `sudo mkfs.xfs /dev/vdb2` |
| Xem UUID, loại filesystem | `lsblk -f`, `sudo blkid` |
| Swap | `mkswap`, `swapon`, `swapoff`, `swapon --show` |
| Swap file | `fallocate -l 1G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile` |
| LVM | `pvcreate` → `vgcreate` → `lvcreate` → `mkfs` |
| Nới LV và filesystem | `sudo lvextend -r -L +10G /dev/vg/lv` |
