---
summary: Từ lúc bấm nút nguồn đến khi có dấu nhắc lệnh, máy Linux đi qua firmware (BIOS/UEFI), trình nạp khởi động (GRUB), kernel và initramfs, rồi systemd. Bài này giải thích từng bước, target thay cho runlevel cũ, cách xem và đổi target, chế độ cứu hộ, và các lệnh tắt, khởi động lại máy an toàn.
minutes: 35
commands: [systemctl get-default, systemctl set-default, systemctl isolate, runlevel, shutdown, reboot, poweroff, systemd-analyze, dmesg, journalctl -b]
quiz:
  - q: Thứ tự đúng của quá trình khởi động là gì?
    options: ["Kernel → GRUB → UEFI → systemd", "UEFI/BIOS → GRUB → kernel + initramfs → systemd", "systemd → kernel → GRUB", "GRUB → UEFI → systemd → kernel"]
    answer: 1
    explain: Firmware kiểm tra phần cứng rồi nạp trình khởi động GRUB. GRUB nạp kernel và initramfs. Kernel khởi tạo phần cứng, gắn ổ gốc, rồi chạy tiến trình đầu tiên là systemd (PID 1).
  - q: Target nào tương ứng với runlevel 3 cũ (nhiều người dùng, có mạng, không giao diện đồ hoạ)?
    options: ["graphical.target", "multi-user.target", "rescue.target", "poweroff.target"]
    answer: 1
    explain: "runlevel 3 ↔ multi-user.target, runlevel 5 ↔ graphical.target, runlevel 1 ↔ rescue.target, 0 ↔ poweroff, 6 ↔ reboot."
  - q: Lệnh nào hẹn tắt máy sau 10 phút và báo cho mọi người đang đăng nhập?
    options: ["poweroff 10", "shutdown -h +10 \"Bảo trì\"", "reboot +10", "halt -t 10"]
    answer: 1
    explain: "`shutdown -h +10` hẹn tắt sau 10 phút và gửi lời nhắn tới mọi terminal. Huỷ bằng `shutdown -c`. `-r` để khởi động lại thay vì tắt."
  - q: initramfs dùng để làm gì?
    options: ["Lưu mật khẩu root", "Một hệ thống file nhỏ nạp vào RAM, chứa driver cần thiết để kernel gắn được ổ đĩa gốc", "Cấu hình GRUB", "Lưu log khởi động"]
    answer: 1
    explain: Kernel có thể chưa có sẵn driver cho ổ đĩa (RAID, LVM, mã hoá…). initramfs mang theo các driver đó, giúp kernel gắn ổ gốc rồi chuyển giao cho systemd.
  - q: Muốn máy luôn khởi động vào chế độ không giao diện đồ hoạ, dùng lệnh nào?
    options: ["systemctl isolate multi-user.target", "systemctl set-default multi-user.target", "init 3", "systemctl start multi-user"]
    answer: 1
    explain: "`set-default` đổi target mặc định cho các lần khởi động sau. `isolate` chỉ chuyển ngay lúc này, khởi động lại sẽ về target mặc định."
---

> Bài này cần **máy ảo, WSL hoặc VPS**. Container Docker không trải qua quá trình khởi động, và thường không chạy systemd. Dùng Multipass như [bài 2](/bai/moi-truong-thuc-hanh): `multipass launch 24.04 --name lab` rồi `multipass shell lab`.

## Các bước khởi động

| Bước | Thành phần | Làm gì |
|---|---|---|
| 1 | **Firmware**: BIOS (cũ) hoặc UEFI (mới) | Kiểm tra phần cứng (POST), tìm thiết bị khởi động theo thứ tự đã cài, nạp trình khởi động |
| 2 | **Bootloader**: GRUB 2 | Hiện menu chọn hệ điều hành / kernel, nạp kernel và initramfs vào RAM, truyền tham số cho kernel |
| 3 | **Kernel** | Khởi tạo CPU, bộ nhớ, thiết bị. Giải nén initramfs |
| 4 | **initramfs** | Hệ thống file nhỏ trong RAM, chứa driver để gắn được ổ đĩa gốc (`/`), kể cả ổ RAID, LVM, mã hoá |
| 5 | **init**: systemd (PID 1) | Gắn các ổ đĩa, bật mạng, chạy các dịch vụ theo thứ tự phụ thuộc, đến khi đạt **target** mặc định |
| 6 | Đăng nhập | Dấu nhắc trên màn hình (getty), SSH, hoặc màn hình đăng nhập đồ hoạ |

| | BIOS | UEFI |
|---|---|---|
| Đọc trình khởi động từ | 512 byte đầu ổ đĩa (MBR) | File `.efi` trong phân vùng EFI (FAT32, gắn ở `/boot/efi`) |
| Kiểu chia ổ đi kèm | MBR | GPT |
| Secure Boot | Không | Có (chỉ chạy bootloader và kernel có chữ ký) |

Kernel, initramfs và cấu hình GRUB nằm trong `/boot`. GRUB học kỹ ở bài [Trình nạp khởi động](/bai/trinh-nap-khoi-dong).

## Xem lại quá trình khởi động

```bash
ps -p 1 -o pid,cmd
systemd-analyze
systemd-analyze blame | head -5
```

```text
    PID CMD
      1 /sbin/init
Startup finished in 288ms (userspace)
graphical.target reached after 278ms in userspace.
91ms networkd-dispatcher.service
84ms chrony.service
70ms rsyslog.service
58ms systemd-logind.service
53ms systemd-resolved.service
```

| Lệnh | Làm gì |
|---|---|
| `ps -p 1 -o pid,cmd` | Xem tiến trình số 1. `/sbin/init` là đường tắt tới systemd |
| `systemd-analyze` | Tổng thời gian khởi động. Máy thật hiện thêm thời gian của firmware, bootloader, kernel |
| `systemd-analyze blame` | Dịch vụ nào khởi động lâu nhất, giúp tìm nguyên nhân máy bật chậm |

(Kết quả trên lấy từ một container chạy systemd nên chỉ có phần userspace. Trên máy ảo bạn sẽ thấy dạng `Startup finished in 2.1s (kernel) + 5.3s (userspace) = 7.4s`.)

Thông báo của kernel lúc khởi động: `sudo dmesg | less`, hoặc `journalctl -k`. Toàn bộ log từ lần khởi động hiện tại: `journalctl -b`. Lần khởi động trước: `journalctl -b -1` (hữu ích khi máy vừa bị treo rồi khởi động lại).

## Target thay cho runlevel

Hệ init cũ (SysV init) dùng **runlevel** đánh số 0–6. systemd thay bằng **target**: một nhóm dịch vụ cần chạy để máy đạt một trạng thái. Để tương thích, mỗi runlevel cũ được nối sang một target:

```bash
ls -l /usr/lib/systemd/system/runlevel*.target
```

```text
/usr/lib/systemd/system/runlevel0.target -> poweroff.target
/usr/lib/systemd/system/runlevel1.target -> rescue.target
/usr/lib/systemd/system/runlevel2.target -> multi-user.target
/usr/lib/systemd/system/runlevel3.target -> multi-user.target
/usr/lib/systemd/system/runlevel4.target -> multi-user.target
/usr/lib/systemd/system/runlevel5.target -> graphical.target
/usr/lib/systemd/system/runlevel6.target -> reboot.target
```

| Runlevel | Target | Trạng thái |
|---|---|---|
| 0 | `poweroff.target` | Tắt máy |
| 1 | `rescue.target` | Cứu hộ: một người dùng (root), không mạng, ít dịch vụ |
| 3 | `multi-user.target` | Nhiều người dùng, có mạng, **không** giao diện đồ hoạ. Trạng thái bình thường của server |
| 5 | `graphical.target` | Như 3 cộng giao diện đồ hoạ |
| 6 | `reboot.target` | Khởi động lại |
| | `emergency.target` | Khẩn cấp: chỉ shell root, ổ gốc gắn chỉ đọc. Ít hơn cả rescue |

## Xem và đổi target

```bash
systemctl get-default
runlevel
```

```text
graphical.target
N 5
```

| Lệnh | Làm gì |
|---|---|
| `systemctl get-default` | Target mặc định khi khởi động |
| `sudo systemctl set-default multi-user.target` | Đổi target mặc định (có hiệu lực từ lần khởi động sau) |
| `sudo systemctl isolate multi-user.target` | Chuyển **ngay** sang target đó, dừng những dịch vụ không thuộc target |
| `sudo systemctl isolate rescue.target` | Vào chế độ cứu hộ ngay (cẩn thận khi đang SSH: mạng sẽ bị tắt) |
| `runlevel` | Runlevel trước và hiện tại (`N 5`: trước đó không có, hiện tại 5) |
| `systemctl list-units --type=target` | Các target đang hoạt động |

Ubuntu Server để mặc định là `graphical.target`, nhưng vì không cài giao diện nên thực chất chạy như `multi-user.target`.

### Vào chế độ cứu hộ khi máy không khởi động được

Khi máy hỏng tới mức không vào được (ví dụ sửa sai `/etc/fstab`), bạn dừng ở menu GRUB, bấm `e` để sửa dòng bắt đầu bằng `linux`, thêm vào cuối dòng:

| Thêm | Vào |
|---|---|
| `systemd.unit=rescue.target` | Chế độ cứu hộ |
| `systemd.unit=emergency.target` | Chế độ khẩn cấp |

Rồi bấm `Ctrl+X` để khởi động. Việc sửa này chỉ áp dụng cho một lần.

## Tắt và khởi động lại máy

```bash
sudo shutdown -h +10 "Bảo trì hệ thống, vui lòng lưu công việc"
sudo shutdown -c
sudo shutdown -r now
```

| Phần | Ý nghĩa |
|---|---|
| `shutdown` | Tắt máy có báo trước. Gửi lời nhắn tới mọi người đang đăng nhập, không cho đăng nhập mới trong 5 phút cuối |
| `-h` | Tắt (**h**alt, thực tế là tắt nguồn). `-P` là tắt nguồn, `-r` là khởi động lại (**r**eboot) |
| `+10` | Sau 10 phút. Có thể ghi `now` hoặc giờ cụ thể như `23:30` |
| `"..."` | Lời nhắn gửi tới mọi terminal |
| `shutdown -c` | Huỷ lịch tắt máy (**c**ancel) |

Các lệnh ngắn:

| Lệnh | Làm gì |
|---|---|
| `sudo reboot` | Khởi động lại ngay (= `systemctl reboot`) |
| `sudo poweroff` | Tắt nguồn ngay (= `systemctl poweroff`) |
| `sudo halt` | Dừng hệ thống nhưng có thể không tắt nguồn |
| `wall "lời nhắn"` | Gửi lời nhắn tới mọi terminal đang đăng nhập (**w**rite **all**) |

Lệnh cũ `init 0` (tắt) và `init 6` (khởi động lại) vẫn chạy được nhờ tương thích ngược.

> **Trên VPS:** `poweroff` là tắt hẳn, bạn phải vào trang quản trị của nhà cung cấp để bật lại. Muốn máy quay lại thì dùng `reboot`. Trước khi khởi động lại server đang chạy dịch vụ, hãy chắc các dịch vụ quan trọng đã `enable` để tự bật lại ([bài sau](/bai/systemd-dich-vu)).

## Thực hành

Làm trên máy ảo Multipass hoặc WSL.

1. Xem target mặc định, runlevel hiện tại, và máy mất bao lâu để khởi động. Dịch vụ nào khởi động lâu nhất?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   systemctl get-default
   runlevel
   systemd-analyze
   systemd-analyze blame | head -3
   ```

   </details>

2. Xem 20 dòng log đầu tiên của kernel trong lần khởi động này. Kernel phiên bản nào, khởi động với tham số gì?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   journalctl -k -b --no-pager | head -20
   cat /proc/cmdline
   ```

   Dòng `Linux version ...` cho biết phiên bản kernel. `/proc/cmdline` là các tham số GRUB truyền cho kernel (ví dụ `root=...`, `ro`, `quiet`).

   </details>

3. Hẹn khởi động lại máy sau 5 phút kèm lời nhắn, xem lời nhắn hiện ra, rồi huỷ.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo shutdown -r +5 "Khoi dong lai de cap nhat kernel"
   sudo shutdown -c
   ```

   </details>

4. Đổi target mặc định sang `multi-user.target`, kiểm tra, rồi đổi lại như cũ.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo systemctl set-default multi-user.target
   systemctl get-default
   sudo systemctl set-default graphical.target
   ```

   `set-default` thực chất đổi symlink `/etc/systemd/system/default.target`. Kiểm tra bằng `ls -l /etc/systemd/system/default.target`.

   </details>

5. Khởi động lại máy ảo bằng `sudo reboot`, đăng nhập lại, xem log của lần khởi động **trước**.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo reboot
   ```

   Với Multipass: `multipass shell lab` để vào lại. Sau đó:

   ```bash
   journalctl --list-boots
   journalctl -b -1 -n 20 --no-pager
   ```

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Các bước khởi động | firmware → GRUB → kernel + initramfs → systemd → target |
| Thời gian khởi động / dịch vụ chậm | `systemd-analyze` / `systemd-analyze blame` |
| Log kernel / log lần khởi động này / lần trước | `journalctl -k` / `journalctl -b` / `journalctl -b -1` |
| Target mặc định: xem / đổi | `systemctl get-default` / `sudo systemctl set-default tên.target` |
| Chuyển target ngay | `sudo systemctl isolate tên.target` |
| Hẹn tắt / khởi động lại / huỷ | `shutdown -h +10` / `shutdown -r now` / `shutdown -c` |
| Khởi động lại / tắt ngay | `sudo reboot` / `sudo poweroff` |
