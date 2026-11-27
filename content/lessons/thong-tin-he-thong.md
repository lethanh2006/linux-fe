---
summary: Xem nhanh cấu hình và tình trạng máy bằng lệnh. RAM (free, /proc/meminfo), CPU (/proc/cpuinfo, nproc), kernel (uname), ổ đĩa (df, du), phần cứng chi tiết (dmidecode), tiến trình (top), tên máy (hostname) và địa chỉ IP (ifconfig).
minutes: 30
commands: [free, /proc/meminfo, /proc/cpuinfo, nproc, uname -a, df -h, du -sh, dmidecode, top, hostname, ifconfig]
quiz:
  - q: "Trong kết quả `free -h`, nên nhìn cột nào để biết còn bao nhiêu RAM dùng được cho chương trình mới?"
    options: ["free", "used", "available", "shared"]
    answer: 2
    explain: "Linux dùng RAM trống làm bộ đệm (buff/cache) và nhả ra khi cần. `available` tính cả phần đó."
  - q: "Lệnh nào cho biết phiên bản kernel, tên máy và kiến trúc CPU trong một dòng?"
    options: ["hostname", "uname -a", "df -h", "nproc"]
    answer: 1
    explain: "`uname -a` (all) in tên kernel, tên máy, phiên bản kernel, kiến trúc."
  - q: "`df -h` cho biết gì?"
    options: ["Dung lượng từng thư mục", "Dung lượng đã dùng và còn trống của từng ổ, phân vùng đã gắn", "RAM", "Danh sách file lớn"]
    answer: 1
    explain: "`df` là theo ổ đĩa (filesystem). Dung lượng của một thư mục thì dùng `du -sh`."
  - q: "Lệnh nào cần cài thêm gói `net-tools` trên Ubuntu mới?"
    options: ["ip", "ifconfig", "hostname", "free"]
    answer: 1
    explain: "`ifconfig` thuộc net-tools, gói cũ không còn cài sẵn. Lệnh thay thế có sẵn là `ip a` (bài 33)."
  - q: "`sudo dmidecode -t 4` xem thông tin gì?"
    options: ["BIOS", "Bộ nhớ", "Bộ xử lý (CPU)", "Pin"]
    answer: 2
    explain: "0 BIOS, 1 hệ thống, 2 bo mạch chủ, 4 bộ xử lý, 17 thanh RAM, 22 pin."
---

> Bài này đi theo video TITV bài 25. Kết quả trong bài lấy từ một máy Ubuntu 24.04 có 2 CPU, 2 GB RAM, ổ 12 GB; máy bạn sẽ ra số khác.

## RAM

### /proc/meminfo

```bash
head -5 /proc/meminfo
```

```text
MemTotal:        2014856 kB
MemFree:         1470580 kB
MemAvailable:    1694040 kB
Buffers:           22064 kB
Cached:           329156 kB
```

`/proc` là thư mục "ảo": kernel tạo nội dung ngay lúc bạn đọc (bài 6). `MemTotal` là tổng RAM, `MemFree` là phần hoàn toàn trống, `MemAvailable` là phần dùng được cho chương trình mới. Đơn vị là kB. `cat /proc/meminfo` in đầy đủ hơn 50 dòng.

### free

`free` in gọn hơn, mặc định tính bằng KB:

```bash
free
free -m
free -h
```

```text
               total        used        free      shared  buff/cache   available
Mem:         2014856      320816     1470580         980      378512     1694040
Swap:              0           0           0
               total        used        free      shared  buff/cache   available
Mem:            1967         313        1436           0         369        1654
Swap:              0           0           0
               total        used        free      shared  buff/cache   available
Mem:           1.9Gi       313Mi       1.4Gi       980Ki       369Mi       1.6Gi
Swap:             0B          0B          0B
```

| Tuỳ chọn | Đơn vị |
|---|---|
| `-b` | Byte |
| `-k` | KB (mặc định) |
| `-m` | MB |
| `-g` | GB |
| `--tera` | TB |
| `-h` | Tự chọn đơn vị dễ đọc (**h**uman) |

| Cột | Ý nghĩa |
|---|---|
| `total` | Tổng RAM |
| `used` | Chương trình đang dùng |
| `free` | Hoàn toàn trống |
| `buff/cache` | Linux mượn RAM trống làm bộ đệm đọc ổ đĩa cho nhanh; trả lại ngay khi chương trình cần |
| `available` | RAM **thật sự dùng được** cho chương trình mới. **Nhìn cột này** |
| `Swap` | Vùng trên ổ đĩa dùng tạm khi hết RAM. Máy này không có swap |

`free` thấp không có nghĩa là thiếu RAM: Linux cố tình dùng RAM trống làm bộ đệm.

## CPU

```bash
grep -E "^(processor|vendor_id|model name|cpu cores)" /proc/cpuinfo
nproc
```

```text
processor	: 0
vendor_id	: GenuineIntel
model name	: QEMU Virtual CPU version 2.5+
cpu cores	: 2
processor	: 1
vendor_id	: GenuineIntel
model name	: QEMU Virtual CPU version 2.5+
cpu cores	: 2
2
```

`/proc/cpuinfo` có **một khối cho mỗi CPU** (mỗi nhân, mỗi luồng). Mỗi khối dài vài chục dòng; lệnh trên dùng `grep` (bài 14) lọc vài dòng chính.

| Dòng | Ý nghĩa |
|---|---|
| `processor` | Số thứ tự CPU, bắt đầu từ 0 |
| `vendor_id` | Hãng: `GenuineIntel` hoặc `AuthenticAMD` |
| `model name` | Tên CPU. Máy trong bài là máy ảo nên ghi `QEMU Virtual CPU`; máy thật sẽ ghi kiểu `Intel(R) Core(TM) i5-...` |
| `cpu MHz`, `cache size` | Tốc độ, bộ nhớ đệm (không in ở trên) |
| `cpu cores` | Số nhân |

`nproc` in thẳng số CPU dùng được. `lscpu` in tóm tắt dễ đọc hơn `/proc/cpuinfo`.

## Kernel: uname

```bash
uname
uname -a
uname -r
```

```text
Linux
Linux ubuntu 6.8.0-147-generic #147-Ubuntu SMP PREEMPT_DYNAMIC Thu Sep 24 11:33:16 UTC 2026 x86_64 x86_64 x86_64 GNU/Linux
6.8.0-147-generic
```

| Phần của `uname -a` | Ý nghĩa |
|---|---|
| `Linux` | Tên kernel (cũng là thứ `uname` trơn in ra) |
| `ubuntu` | Tên máy |
| `6.8.0-147-generic` | Phiên bản kernel (`uname -r`) |
| `x86_64` | Kiến trúc: x86 64-bit. Máy ARM in `aarch64` |

## Ổ đĩa: df

```bash
df -h
```

```text
Filesystem      Size  Used Avail Use% Mounted on
tmpfs           197M  976K  196M   1% /run
/dev/vda1        11G  1.7G  9.0G  16% /
tmpfs           984M     0  984M   0% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock
/dev/vda16      881M   64M  756M   8% /boot
/dev/vda15      105M  6.2M   99M   6% /boot/efi
tmpfs           197M   12K  197M   1% /run/user/1000
```

| Cột | Ý nghĩa |
|---|---|
| `Filesystem` | Phân vùng. `/dev/vda1`, `/dev/sda1`, `/dev/nvme0n1p1` là phân vùng trên ổ thật; `tmpfs` là ổ tạm nằm trong RAM |
| `Size`, `Used`, `Avail` | Tổng, đã dùng, còn trống |
| `Use%` | Phần trăm đã dùng. Gần 100% là phải dọn |
| `Mounted on` | Gắn vào thư mục nào trong cây (giống ổ C, D trên Windows) |

Chỉ xem ổ chứa `/`: `df -h /`.

## Phần cứng chi tiết: dmidecode

`dmidecode` đọc bảng thông tin phần cứng do BIOS cung cấp. Cần `sudo`. `-t số` chọn loại:

| Số | Loại |
|---|---|
| 0 | BIOS |
| 1 | Hệ thống: hãng, tên máy, số serial |
| 2 | Bo mạch chủ |
| 4 | Bộ xử lý |
| 17 | Từng thanh RAM |
| 22 | Pin (máy xách tay) |

```bash
sudo dmidecode -t 1
```

```text
# dmidecode 3.5
Getting SMBIOS data from sysfs.
SMBIOS 3.0.0 present.

Handle 0x0100, DMI type 1, 27 bytes
System Information
	Manufacturer: QEMU
	Product Name: Ubuntu 24.04 PC v2 (i440FX + PIIX, arch_caps fix, 1996)
	Version: pc-i440fx-noble-v2
	Serial Number: Not Specified
	UUID: Not Settable
	Wake-up Type: Power Switch
	SKU Number: Not Specified
	Family: Not Specified
```

Máy ảo thì nhiều mục để trống hoặc ghi tên phần mềm ảo hoá (QEMU). Máy thật sẽ có hãng (Dell, HP, Lenovo…), tên dòng máy, số serial.

## Tiến trình: top

`top` giống Task Manager trên Windows: liệt kê tiến trình đang chạy, tự cập nhật vài giây một lần. Bấm `q` để thoát.

```bash
top
```

```text
top - 19:55:28 up 7 min,  1 user,  load average: 0.16, 0.06, 0.01
Tasks: 112 total,   1 running, 111 sleeping,   0 stopped,   0 zombie
%Cpu(s):  0.0 us,  4.3 sy,  0.0 ni, 91.3 id,  4.3 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   1967.6 total,   1442.1 free,    306.8 used,    370.2 buff/cache
MiB Swap:      0.0 total,      0.0 free,      0.0 used.   1660.8 avail Mem

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
   2823 hocvien   20   0   11928   5268   3152 R  10.0   0.3   0:00.01 top
      1 root      20   0   22632  13708   9464 S   0.0   0.7   0:02.88 systemd
      2 root      20   0       0      0      0 S   0.0   0.0   0:00.00 kthreadd
...
```

Dòng đầu: giờ, máy đã chạy bao lâu (`up 7 min`), số người đăng nhập, độ tải. Hai dòng `MiB Mem`, `MiB Swap` giống `free -m`. Bài Tiến trình ở phần mở rộng học kỹ `top`.

## Dung lượng thư mục: du

```bash
du -sh ~
sudo du -sh /etc
```

```text
36K	/home/hocvien
6.0M	/etc
```

`-s` chỉ in tổng, `-h` dễ đọc (bài 10). Thư mục có file bạn không đọc được thì cần `sudo`.

## Tên máy và địa chỉ IP

```bash
hostname
```

```text
ubuntu
```

`ifconfig` xem địa chỉ IP. Ubuntu mới không cài sẵn, phải cài gói `net-tools`:

```bash
sudo apt install net-tools
ifconfig
```

```text
ens3: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.0.2.15  netmask 255.255.255.0  broadcast 10.0.2.255
        inet6 fe80::5054:ff:fe12:3456  prefixlen 64  scopeid 0x20<link>
        inet6 fec0::5054:ff:fe12:3456  prefixlen 64  scopeid 0x40<site>
        ether 52:54:00:12:34:56  txqueuelen 1000  (Ethernet)
        RX packets 887  bytes 369349 (369.3 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 724  bytes 129689 (129.6 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 230  bytes 19739 (19.7 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 230  bytes 19739 (19.7 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

`ens3` là card mạng, IP `10.0.2.15` (trong video cũng ra đúng địa chỉ này). `lo` là card ảo nội bộ của máy (`127.0.0.1`). Bài 33 học kỹ mạng và lệnh `ip` thay cho `ifconfig`.

## Mở rộng (chuẩn LPIC-1)

Chuẩn LPIC-1 mục 101.1 (phần cứng) còn có:

| Lệnh | Cho biết |
|---|---|
| `lscpu` | CPU tóm tắt: kiến trúc, số nhân, số luồng, tính năng |
| `lsblk` | Mọi ổ đĩa và phân vùng dạng cây, kể cả ổ chưa gắn |
| `lspci` | Thiết bị cắm trên khe PCI: card mạng, card đồ hoạ |
| `lsusb` | Thiết bị USB |
| `lsmod` | Các module (driver) kernel đang nạp |
| `modprobe tên`, `modprobe -r tên` | Nạp, gỡ module kernel |
| `dmesg` | Thông báo của kernel, ví dụ vừa cắm USB thì thấy dòng nhận thiết bị |
| `hostnamectl` | Tên máy, hệ điều hành, kernel, loại máy (máy ảo hay máy thật) |
| `/sys` | Thư mục ảo chứa cây thiết bị, ví dụ `/sys/class/net/` liệt kê card mạng (bài 33) |

## Thực hành

1. Máy bạn có bao nhiêu RAM, còn dùng được bao nhiêu? Xem bằng hai cách.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   free -h
   grep -E "MemTotal|MemAvailable" /proc/meminfo
   ```

   </details>

2. Máy bạn có mấy CPU, tên CPU là gì?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   nproc
   grep "model name" /proc/cpuinfo | head -1
   ```

   </details>

3. Ổ chứa `/` còn trống bao nhiêu phần trăm? Thư mục nhà của bạn chiếm bao nhiêu?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   df -h /
   du -sh ~
   ```

   Cột `Use%` là phần đã dùng; phần còn trống là 100% trừ đi số đó.

   </details>

4. Xem thông tin BIOS và hãng sản xuất máy của bạn.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo dmidecode -t 0
   sudo dmidecode -t 1
   ```

   </details>

## Tóm tắt

| Muốn biết | Lệnh |
|---|---|
| RAM | `free -h`, `cat /proc/meminfo` |
| CPU | `nproc`, `cat /proc/cpuinfo`, `lscpu` |
| Kernel, kiến trúc | `uname -a`, `uname -r` |
| Ổ đĩa còn trống | `df -h` |
| Dung lượng thư mục | `du -sh thư-mục` |
| Phần cứng chi tiết | `sudo dmidecode -t số` |
| Tiến trình, tải máy | `top` (bấm `q` để thoát) |
| Tên máy | `hostname` |
| Địa chỉ IP | `ifconfig` (gói net-tools), `ip a` |
