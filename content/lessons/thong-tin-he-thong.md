---
summary: Nhận một máy chủ mới, việc đầu tiên là biết nó có gì — hệ điều hành, kernel, CPU, RAM, ổ đĩa, card mạng. Bài này dạy các lệnh xem thông tin hệ thống và phần cứng, cách kernel nhìn thiết bị qua /dev, /proc, /sys, và quản lý module (driver) của kernel.
minutes: 35
commands: [hostnamectl, uname, lscpu, nproc, free, df, lsblk, lspci, lsusb, lsmod, modprobe, modinfo, dmesg, udevadm, /proc, /sys, /dev]
quiz:
  - q: Lệnh nào cho biết máy có bao nhiêu nhân CPU?
    options: ["free -h", "nproc (hoặc lscpu)", "df -h", "lsblk"]
    answer: 1
    explain: "`nproc` in số nhân CPU dùng được. `lscpu` cho chi tiết: kiến trúc, số socket, số nhân, số luồng."
  - q: "`/proc` và `/sys` là gì?"
    options: ["Thư mục chứa chương trình", "Hệ thống file ảo do kernel tạo ra trong bộ nhớ, cho biết thông tin tiến trình và phần cứng", "Thư mục sao lưu", "Ổ đĩa thứ hai"]
    answer: 1
    explain: "Các file trong `/proc` và `/sys` không nằm trên ổ đĩa. Mỗi lần đọc, kernel tạo nội dung ngay lúc đó. Ví dụ `/proc/meminfo`, `/proc/cpuinfo`, `/sys/class/net/`."
  - q: Lệnh nào nạp một module (driver) của kernel, kèm các module mà nó cần?
    options: ["insmod", "modprobe", "lsmod", "modinfo"]
    answer: 1
    explain: "`modprobe tên` tự tìm file module và nạp cả các module phụ thuộc. `insmod` cần đường dẫn file và không lo phụ thuộc. `modprobe -r` để gỡ, `lsmod` để xem module đã nạp."
  - q: "`ls -l /dev/vda` hiện ký tự đầu là `b`. Nghĩa là gì?"
    options: ["File sao lưu", "Thiết bị khối (block device), như ổ đĩa", "File nhị phân", "Thư mục"]
    answer: 1
    explain: "`b` là thiết bị khối (đọc ghi theo khối: ổ đĩa, USB). `c` là thiết bị ký tự (đọc ghi từng byte: terminal, `/dev/null`)."
  - q: Máy vừa cắm một ổ cứng mới, muốn xem kernel đã nhận ra chưa và đặt tên gì, xem ở đâu nhanh nhất?
    options: ["cat /etc/fstab", "lsblk hoặc sudo dmesg | tail", "df -h", "free -h"]
    answer: 1
    explain: "`lsblk` liệt kê mọi thiết bị khối, kể cả ổ chưa chia phân vùng, chưa gắn. `dmesg` cho thấy kernel vừa phát hiện thiết bị gì. `df` chỉ thấy ổ đã gắn (mount)."
---

> Kết quả trong bài lấy từ một máy ảo Ubuntu 24.04 (2 CPU, 2 GB RAM, ổ 12 GB và một ổ phụ 2 GB). Phần lớn lệnh chạy được cả trong container, nhưng container chỉ thấy phần cứng của máy thật một cách hạn chế.

## Hệ điều hành và kernel

```bash
hostnamectl
uname -a
```

```text
 Static hostname: lab
       Icon name: computer-vm
         Chassis: vm 🖴
  Virtualization: kvm
Operating System: Ubuntu 24.04.5 LTS
          Kernel: Linux 6.8.0-147-generic
    Architecture: x86-64
 Hardware Vendor: QEMU
...
Linux lab 6.8.0-147-generic #147-Ubuntu SMP PREEMPT_DYNAMIC Thu Sep 24 11:33:16 UTC 2026 x86_64 x86_64 x86_64 GNU/Linux
```

| Dòng | Ý nghĩa |
|---|---|
| `Static hostname` | Tên máy. Đổi bằng `sudo hostnamectl set-hostname tên-mới` |
| `Chassis: vm`, `Virtualization: kvm` | Đây là máy ảo chạy trên KVM. Máy thật sẽ ghi `desktop`, `laptop`, `server` |
| `Operating System`, `Kernel` | Bản phân phối và kernel (như `/etc/os-release` và `uname -r` ở [bài 1](/bai/linux-la-gi)) |
| `Hardware Vendor` | Hãng phần cứng (Dell, HP, Lenovo…, ở đây là phần mềm ảo hoá QEMU) |

## CPU

```bash
nproc
lscpu
```

```text
2
Architecture:                            x86_64
CPU op-mode(s):                          32-bit, 64-bit
CPU(s):                                  2
Vendor ID:                               GenuineIntel
Thread(s) per core:                      1
Core(s) per socket:                      2
Socket(s):                               1
...
```

| Dòng | Ý nghĩa |
|---|---|
| `nproc` | Số nhân CPU dùng được. So với load average trong `top` để biết máy có quá tải không |
| `CPU(s)` | Tổng số CPU logic = socket × nhân mỗi socket × luồng mỗi nhân |
| `Thread(s) per core` | 2 nghĩa là có siêu phân luồng (Hyper-Threading) |
| `Flags` | Các tính năng CPU hỗ trợ. Ví dụ có `vmx` (Intel) hoặc `svm` (AMD) thì chạy được máy ảo KVM |

Cùng thông tin dạng thô: `cat /proc/cpuinfo`.

## Bộ nhớ

```bash
free -h
head -3 /proc/meminfo
```

```text
               total        used        free      shared  buff/cache   available
Mem:           1.9Gi       296Mi       1.5Gi       996Ki       320Mi       1.6Gi
Swap:             0B          0B          0B
MemTotal:        2014832 kB
MemFree:         1534228 kB
MemAvailable:    1710944 kB
```

| Cột | Ý nghĩa |
|---|---|
| `total` | Tổng RAM |
| `used` | Đang dùng bởi chương trình |
| `free` | Hoàn toàn trống |
| `buff/cache` | Linux dùng RAM trống làm bộ đệm đọc đĩa cho nhanh. Phần này được nhả ra ngay khi chương trình cần |
| `available` | RAM **thật sự dùng được** cho chương trình mới. **Nhìn cột này** để biết còn bao nhiêu RAM |
| `Swap` | Vùng trên đĩa dùng khi hết RAM ([bài sau](/bai/phan-vung-va-filesystem)). Máy ảo cloud thường không có swap |

`free` thấp không có nghĩa là thiếu RAM: Linux cố tình dùng hết RAM trống làm cache.

## Ổ đĩa

```bash
lsblk
df -h -x tmpfs
```

```text
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
fd0       2:0    1    4K  0 disk
sr0      11:0    1 1024M  1 rom
vda     253:0    0   12G  0 disk
|-vda1  253:1    0   11G  0 part /
|-vda14 253:14   0    4M  0 part
|-vda15 253:15   0  106M  0 part /boot/efi
`-vda16 259:0    0  913M  0 part /boot
vdb     253:16   0    2G  0 disk
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda1        11G  1.7G  9.0G  16% /
/dev/vda16      881M   64M  756M   8% /boot
/dev/vda15      105M  6.2M   99M   6% /boot/efi
```

| Lệnh | Cho biết |
|---|---|
| `lsblk` | **Mọi** thiết bị khối dạng cây: ổ đĩa (`disk`), phân vùng (`part`), ổ CD (`rom`), kể cả ổ chưa chia, chưa gắn như `vdb` |
| `df -h` | Chỉ các filesystem **đã gắn**, kèm dung lượng đã dùng / còn trống. `-x tmpfs` bỏ các filesystem tạm trong RAM |

Tên ổ đĩa phụ thuộc loại kết nối:

| Tên | Loại |
|---|---|
| `sda`, `sdb`… | Ổ SATA, SAS, USB, ổ SCSI ảo |
| `nvme0n1`, `nvme0n1p1` | Ổ NVMe và phân vùng của nó |
| `vda`, `vdb`… | Ổ ảo virtio (KVM, nhiều VPS) |
| `xvda` | Ổ ảo của Xen (một số máy AWS đời cũ) |
| `sda1`, `vda1`… | Phân vùng số 1 của ổ |

Chia phân vùng, tạo filesystem, gắn ổ: [bài 29](/bai/phan-vung-va-filesystem), [bài 30](/bai/mount-va-fstab). Dung lượng: [bài 31](/bai/dung-luong-va-sua-loi).

## Thiết bị gắn vào máy: lspci, lsusb

```bash
lspci
```

```text
00:00.0 Host bridge: Intel Corporation 440FX - 82441FX PMC [Natoma] (rev 02)
00:02.0 VGA compatible controller: Device 1234:1111 (rev 02)
00:03.0 Ethernet controller: Red Hat, Inc. Virtio network device
00:04.0 SCSI storage controller: Red Hat, Inc. Virtio block device
...
```

| Lệnh | Làm gì |
|---|---|
| `lspci` | Liệt kê thiết bị trên bus PCI: card mạng, card đồ hoạ, bộ điều khiển ổ đĩa |
| `lspci -k` | Kèm driver (module kernel) đang dùng cho từng thiết bị |
| `ethtool -i tên-card` | Driver của một card mạng |
| `lsusb` | Thiết bị USB (máy ảo trên không có, nên không in gì) |
| `sudo lshw -short` | Tóm tắt toàn bộ phần cứng |
| `sudo dmidecode -t memory` | Thông tin từ BIOS: thanh RAM, số khe, hãng máy |

## Kernel nhìn phần cứng: /dev, /proc, /sys

| Thư mục | Chứa | Ví dụ |
|---|---|---|
| `/dev` | File đại diện cho thiết bị. Do **udev** tạo khi phát hiện thiết bị | `/dev/vda`, `/dev/null`, `/dev/sr0` |
| `/proc` | File ảo: thông tin tiến trình và kernel | `/proc/cpuinfo`, `/proc/meminfo`, `/proc/1/` (tiến trình PID 1) |
| `/sys` | File ảo: cây thiết bị, driver, tham số kernel | `/sys/class/net/ens3/address` (địa chỉ MAC) |

```bash
ls -l /dev/vda /dev/null /dev/sr0
cat /sys/class/net/ens3/address
```

```text
crw-rw-rw- 1 root root    1, 3 Nov 27 08:39 /dev/null
brw-rw---- 1 root cdrom  11, 0 Nov 27 08:39 /dev/sr0
brw-rw---- 1 root disk  253, 0 Nov 27 08:39 /dev/vda
52:54:00:12:34:56
```

| Phần | Ý nghĩa |
|---|---|
| `c` / `b` đầu dòng | Thiết bị ký tự (đọc ghi từng byte) / thiết bị khối (đọc ghi theo khối, như ổ đĩa) |
| `253, 0` | Số major (loại driver), minor (thiết bị thứ mấy) thay cho dung lượng |
| `root disk` | Nhóm `disk` được đọc ghi thẳng vào ổ, tương đương quyền root với dữ liệu |

**udev** là dịch vụ theo dõi sự kiện phần cứng: cắm ổ, cắm USB, tạo file trong `/dev`, đặt tên ổn định trong `/dev/disk/by-uuid/`. Xem thông tin udev về một thiết bị: `udevadm info /dev/vdb`.

Thông báo của kernel khi phát hiện thiết bị:

```bash
sudo dmesg | grep -i vda
```

```text
[    0.460751] virtio_blk virtio1: [vda] 25165824 512-byte logical blocks (12.9 GB/12.0 GiB)
[    0.465607]  vda: vda1 vda14 vda15 vda16
```

`sudo dmesg -w` theo dõi trực tiếp: cắm USB vào là thấy kernel nhận thiết bị gì, tên là gì.

## Module kernel (driver)

Phần lớn driver không nằm sẵn trong kernel mà là **module**, được nạp khi cần.

```bash
lsmod | head -6
modinfo -F description virtio_net
```

```text
Module                  Size  Used by
tls                   155648  0
isofs                  61440  0
binfmt_misc            24576  1
kvm_intel             487424  0
ppdev                  24576  0
Virtio network driver
```

| Lệnh | Làm gì |
|---|---|
| `lsmod` | Các module đang nạp. Cột `Used by` cho biết bao nhiêu thứ đang dùng module đó |
| `modinfo tên` | Thông tin module: file, mô tả, tham số. `-F description` chỉ in mô tả |
| `sudo modprobe tên` | Nạp module **và** các module nó phụ thuộc |
| `sudo modprobe -r tên` | Gỡ module (khi không còn ai dùng) |
| `insmod file.ko` / `rmmod tên` | Nạp / gỡ cấp thấp, không lo phụ thuộc. Hầu như chỉ dùng `modprobe` |

Thử nạp rồi gỡ module `dummy` (driver card mạng ảo, vô hại):

```bash
sudo modprobe dummy
lsmod | grep dummy
sudo modprobe -r dummy
```

```text
dummy                  12288  0
```

Cấu hình module lâu dài nằm trong `/etc/modprobe.d/`. Ví dụ chặn một driver gây lỗi: tạo file `/etc/modprobe.d/chan.conf` có dòng `blacklist tên-module`. Muốn nạp module mỗi khi khởi động: ghi tên vào một file trong `/etc/modules-load.d/`.

## Thời gian chạy và tải

```bash
uptime
uptime -p
```

```text
 08:41:44 up 2 min,  1 user,  load average: 0.01, 0.02, 0.00
up 2 minutes
```

Load average đã giải thích ở [bài Tiến trình](/bai/tien-trinh).

## Thực hành

1. Viết một chuỗi lệnh in ra "báo cáo nhanh" về máy: tên máy, bản phân phối, kernel, số CPU, RAM tổng và còn dùng được, dung lượng ổ `/`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   echo "May: $(hostname)"
   echo "He dieu hanh: $(grep PRETTY_NAME /etc/os-release | cut -d'"' -f2)"
   echo "Kernel: $(uname -r)"
   echo "CPU: $(nproc) nhan"
   free -h | awk '/Mem/ {print "RAM: " $2 " tong, con dung duoc " $7}'
   df -h / | awk 'NR==2 {print "O /: " $3 " / " $2 " (" $5 ")"}'
   ```

   </details>

2. Liệt kê các ổ đĩa và phân vùng. Có ổ nào chưa được gắn vào đâu không?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   lsblk
   ```

   Những dòng có cột `MOUNTPOINTS` trống là chưa gắn. Trong máy ảo ở bài, ổ `vdb` (2 GB) chưa có phân vùng và chưa gắn. Bài sau sẽ dùng ổ này.

   </details>

3. Card mạng của máy dùng driver nào? Địa chỉ MAC là gì?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ip link
   ethtool -i ens3
   ```

   Thay `ens3` bằng tên card mạng trên máy bạn (xem trong `ip link`). Máy ảo trong bài dùng driver `virtio_net` (dòng `driver:` của `ethtool -i`). Địa chỉ MAC nằm sau chữ `link/ether` trong `ip link`.

   </details>

4. Xem module `dummy` nhận tham số gì. Nạp nó kèm tham số để tạo một card mạng ảo `dummy0`, kiểm tra trong `ip link`, rồi gỡ module.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   modinfo -p dummy
   sudo modprobe dummy numdummies=1
   ip -br link show dummy0
   sudo modprobe -r dummy
   ip -br link show dummy0
   ```

   `modinfo -p` in tham số `numdummies` (số card ảo cần tạo). Nạp với `numdummies=1` thì có `dummy0`. Sau khi gỡ, lệnh cuối báo `Device "dummy0" does not exist.`

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Hệ điều hành, kernel, tên máy | `hostnamectl`, `uname -a` |
| CPU | `nproc`, `lscpu` |
| RAM (nhìn cột available) | `free -h` |
| Ổ đĩa và phân vùng / dung lượng | `lsblk` / `df -h` |
| Thiết bị PCI, USB | `lspci -k`, `lsusb` |
| Thông báo kernel | `sudo dmesg`, `journalctl -k` |
| Module | `lsmod`, `modinfo`, `sudo modprobe`, `sudo modprobe -r` |
| Thời gian chạy | `uptime` |
