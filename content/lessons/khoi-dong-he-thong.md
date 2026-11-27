---
summary: Sáu bước từ lúc bấm nút nguồn tới lúc hiện màn hình đăng nhập (BIOS, MBR, GRUB, kernel, init, đăng nhập). Hai chế độ chạy multi-user và graphical, cách xem và đổi chế độ bằng systemctl, và bảng run level 0–6 với lệnh init.
minutes: 35
commands: [systemctl get-default, systemctl set-default, systemctl isolate, runlevel, init]
quiz:
  - q: "Bước nào kiểm tra phần cứng (RAM, bàn phím, ổ đĩa) ngay khi bật máy?"
    options: ["GRUB", "Kernel", "BIOS/UEFI với POST", "init"]
    answer: 2
    explain: "POST (Power-On Self Test) do BIOS/UEFI chạy đầu tiên. Không thấy ổ khởi động thì báo lỗi kiểu `no boot device found`."
  - q: "Chế độ nào chỉ có dòng lệnh, nhiều người dùng, không có giao diện đồ hoạ?"
    options: ["graphical.target", "multi-user.target", "rescue.target", "poweroff.target"]
    answer: 1
    explain: "multi-user.target ứng với run level 3, graphical.target ứng với run level 5."
  - q: "`sudo systemctl set-default multi-user.target` có tác dụng khi nào?"
    options: ["Ngay lập tức", "Từ lần khởi động sau", "Không bao giờ", "Chỉ khi đăng xuất"]
    answer: 1
    explain: "`set-default` đổi chế độ mặc định cho lần khởi động sau. Chuyển ngay thì dùng `systemctl isolate` (hoặc `init`)."
  - q: "`sudo init 6` làm gì?"
    options: ["Tắt máy", "Chuyển sang dòng lệnh", "Khởi động lại máy", "Chuyển sang đồ hoạ"]
    answer: 2
    explain: "Run level 0 là tắt máy, 6 là khởi động lại, 3 là dòng lệnh, 5 là đồ hoạ."
  - q: Trên Ubuntu hiện nay, tiến trình init (PID 1) là chương trình nào?
    options: ["bash", "grub", "systemd", "kernel"]
    answer: 2
    explain: "`/sbin/init` là link tới systemd. systemd vẫn hiểu lệnh `init` và `runlevel` kiểu cũ."
---

> Bài này đi theo video TITV bài 24. Phần đổi chế độ chạy có cách quay lại ngay bên dưới; đọc hết trước khi thử.

## Sáu bước khởi động

| Bước | Ai làm | Làm gì | Lỗi hay gặp |
|---|---|---|---|
| 1. Khởi động hệ thống | **BIOS** (máy mới: **UEFI**) trên bo mạch chủ | Chạy **POST** kiểm tra phần cứng, tìm ổ đĩa để khởi động | `no boot device found` |
| 2. Trình nạp, giai đoạn 1 | **MBR**: sector đầu tiên (512 byte) của ổ đĩa | Chứa đoạn mã nhỏ chỉ ra chỗ của trình nạp chính | MBR bị ghi đè, ví dụ cài Windows sau Linux |
| 3. Trình nạp, giai đoạn 2 | **GRUB** | Đọc cấu hình, hiện menu chọn hệ điều hành và kernel, nạp kernel vào RAM | Sai cấu hình GRUB |
| 4. Kernel | **Kernel Linux** | Nhận diện phần cứng, gắn ổ gốc `/`, chạy tiến trình đầu tiên | Kernel panic |
| 5. init | **systemd** (PID 1) | Chọn chế độ chạy (target, run level), bật các dịch vụ | Dịch vụ lỗi |
| 6. Đăng nhập | Màn hình đăng nhập | Dòng lệnh hoặc giao diện đồ hoạ, tuỳ chế độ | |

Máy dùng UEFI thì bước 2, 3 khác một chút: UEFI đọc thẳng file trình nạp trong phân vùng EFI, không qua MBR (bài GRUB ở phần mở rộng). Xem lại dấu vết của các bước trên máy đang chạy:

```bash
ls /boot | head
cat /proc/cmdline
```

```text
System.map-6.8.0-147-generic
config-6.8.0-147-generic
efi
grub
initrd.img
initrd.img-6.8.0-147-generic
initrd.img.old
lost+found
vmlinuz
vmlinuz-6.8.0-147-generic
BOOT_IMAGE=/vmlinuz-6.8.0-147-generic root=LABEL=cloudimg-rootfs ro console=tty1 console=ttyS0
```

`vmlinuz-...` là kernel, `initrd.img-...` là ổ đĩa tạm kernel dùng lúc mới khởi động, `grub/` là cấu hình GRUB. `/proc/cmdline` là dòng lệnh GRUB đã truyền cho kernel.

Tiến trình đầu tiên kernel chạy (PID 1) chính là init, trên Ubuntu là systemd:

```bash
ps -p 1 -o pid,comm
ls -l /sbin/init
```

```text
    PID COMMAND
      1 systemd
lrwxrwxrwx 1 root root 22 Oct 12 14:36 /sbin/init -> ../lib/systemd/systemd
```

## Chế độ chạy: target

systemd gọi chế độ chạy là **target**. Hai target cần nhớ:

| Target | Chế độ |
|---|---|
| `multi-user.target` | Nhiều người dùng, đủ dịch vụ mạng, **chỉ dòng lệnh**. Máy chủ dùng chế độ này |
| `graphical.target` | Như trên, **cộng giao diện đồ hoạ**. Máy để bàn dùng chế độ này |

Máy chủ không cần giao diện đồ hoạ: chạy dòng lệnh tiết kiệm RAM, CPU cho việc chính.

### Xem chế độ mặc định

```bash
systemctl get-default
```

```text
graphical.target
```

### Đổi chế độ mặc định (từ lần khởi động sau)

```bash
sudo systemctl set-default multi-user.target
systemctl get-default
```

```text
Created symlink /etc/systemd/system/default.target → /usr/lib/systemd/system/multi-user.target.
multi-user.target
```

Chế độ mặc định chỉ là một link (bài 32) tên `default.target`. **Đổi lại như cũ** khi thử xong:

```bash
sudo systemctl set-default graphical.target
```

```text
Removed "/etc/systemd/system/default.target".
Created symlink /etc/systemd/system/default.target → /usr/lib/systemd/system/graphical.target.
```

### Chuyển chế độ ngay: isolate

```bash
sudo systemctl isolate multi-user.target
sudo systemctl isolate graphical.target
```

`isolate` chuyển **ngay lập tức**. Trên máy có giao diện, chuyển sang `multi-user.target` sẽ **đóng màn hình đồ hoạ**, mọi cửa sổ đang mở mất theo; bạn đăng nhập ở màn hình chữ, rồi gõ lệnh thứ hai để quay lại giao diện.

| Lệnh | Tác dụng | Khi nào |
|---|---|---|
| `systemctl get-default` | Xem chế độ mặc định | |
| `systemctl set-default X.target` | Đổi mặc định | Lần khởi động sau |
| `systemctl isolate X.target` | Chuyển chế độ | Ngay bây giờ |

## Run level và lệnh init

Trước systemd, Linux dùng **run level** đánh số 0–6. systemd vẫn hiểu cách cũ, và đây là câu hỏi hay gặp trong bài thi:

| Run level | Ý nghĩa | Target tương ứng |
|---|---|---|
| 0 | Tắt máy | `poweroff.target` |
| 1 | Một người dùng (chế độ cứu hộ, sửa lỗi) | `rescue.target` |
| 2 | Nhiều người dùng, không có dịch vụ mạng chia sẻ (NFS) theo kiểu cũ | `multi-user.target` |
| 3 | Nhiều người dùng, đủ dịch vụ, dòng lệnh | `multi-user.target` |
| 4 | Chưa dùng, để người dùng tự định nghĩa | `multi-user.target` |
| 5 | Như 3, cộng giao diện đồ hoạ | `graphical.target` |
| 6 | Khởi động lại | `reboot.target` |

Trên Ubuntu, systemd gộp run level 2, 3, 4 về cùng `multi-user.target`:

```bash
ls -l /usr/lib/systemd/system/runlevel*.target
```

```text
lrwxrwxrwx 1 root root 15 Oct 12 14:36 /usr/lib/systemd/system/runlevel0.target -> poweroff.target
lrwxrwxrwx 1 root root 13 Oct 12 14:36 /usr/lib/systemd/system/runlevel1.target -> rescue.target
lrwxrwxrwx 1 root root 17 Oct 12 14:36 /usr/lib/systemd/system/runlevel2.target -> multi-user.target
lrwxrwxrwx 1 root root 17 Oct 12 14:36 /usr/lib/systemd/system/runlevel3.target -> multi-user.target
lrwxrwxrwx 1 root root 17 Oct 12 14:36 /usr/lib/systemd/system/runlevel4.target -> multi-user.target
lrwxrwxrwx 1 root root 16 Oct 12 14:36 /usr/lib/systemd/system/runlevel5.target -> graphical.target
lrwxrwxrwx 1 root root 13 Oct 12 14:36 /usr/lib/systemd/system/runlevel6.target -> reboot.target
```

### Xem run level

```bash
runlevel
who -r
```

```text
N 5
         run-level 5  Nov 27 19:48
```

`runlevel` in hai số: run level **trước** và **hiện tại**. `N` là "không có" (từ lúc khởi động chưa đổi lần nào).

### Đổi run level bằng init

```bash
sudo init 3
runlevel
```

```text
5 3
```

Trước là 5, giờ là 3. Trong video, `sudo init 3` làm màn hình đồ hoạ tắt, hiện màn hình đăng nhập dòng lệnh. Đăng nhập rồi gõ `sudo init 5` để quay lại giao diện.

| Lệnh | Tác dụng |
|---|---|
| `sudo init 0` | Tắt máy |
| `sudo init 3` | Sang chế độ dòng lệnh |
| `sudo init 5` | Sang chế độ đồ hoạ |
| `sudo init 6` | Khởi động lại |

## Mở rộng (chuẩn LPIC-1)

Chuẩn LPIC-1 mục 101.2, 101.3 còn có:

| Lệnh, mục | Ý nghĩa |
|---|---|
| `systemd-analyze` | Thời gian khởi động: phần kernel, phần dịch vụ |
| `systemctl list-units --type=target` | Các target đang hoạt động |
| `systemctl rescue` | Vào chế độ cứu hộ (như run level 1) |
| `dmesg`, `journalctl -b` | Thông báo của kernel và nhật ký từ lần khởi động này (bài Nhật ký hệ thống, phần mở rộng) |
| Thêm `systemd.unit=rescue.target` | Gõ vào dòng kernel trong menu GRUB (bấm `e`) để khởi động thẳng vào chế độ cứu hộ khi máy hỏng |
| SysVinit, Upstart | Các hệ thống init cũ trước systemd; file `/etc/inittab` thuộc SysVinit |

```bash
systemd-analyze
```

```text
Startup finished in 2.842s (kernel) + 12.010s (userspace) = 14.853s 
graphical.target reached after 6min 6.901s in userspace.
```

(Dòng thứ hai dài bất thường vì máy chạy thử đã đổi qua lại giữa các chế độ trước khi đo.)

## Thực hành

1. Xem chế độ mặc định và run level hiện tại của máy bạn.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   systemctl get-default
   runlevel
   ```

   </details>

2. Đặt chế độ mặc định là dòng lệnh, kiểm tra, rồi đặt lại như cũ (không cần khởi động lại).

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo systemctl set-default multi-user.target
   systemctl get-default
   sudo systemctl set-default graphical.target
   ```

   </details>

3. Trả lời: run level 0, 1, 3, 5, 6 là gì? Lệnh `init` nào khởi động lại máy?

   <details>
   <summary>Xem đáp án</summary>

   0 tắt máy, 1 một người dùng (cứu hộ), 3 dòng lệnh nhiều người dùng, 5 đồ hoạ, 6 khởi động lại. Lệnh `sudo init 6`.

   </details>

4. Kernel đang chạy là bản nào, nằm ở file nào trong `/boot`?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   uname -r
   ls /boot/vmlinuz-$(uname -r)
   ```

   </details>

## Tóm tắt

| Ý | Ghi nhớ |
|---|---|
| Sáu bước | BIOS/POST → MBR → GRUB → kernel → init (systemd) → đăng nhập |
| Hai target chính | `multi-user.target` (dòng lệnh), `graphical.target` (đồ hoạ) |
| Xem / đặt mặc định | `systemctl get-default` / `sudo systemctl set-default X.target` |
| Chuyển ngay | `sudo systemctl isolate X.target` hoặc `sudo init N` |
| Run level | 0 tắt, 1 cứu hộ, 3 dòng lệnh, 5 đồ hoạ, 6 khởi động lại |
| `runlevel` | In run level trước và hiện tại |
