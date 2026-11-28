## [Bài 22. Ngày giờ](/bai/ngay-gio-he-thong)

| Lệnh | Làm gì |
|---|---|
| `date` | Xem ngày giờ |
| `date +%d/%m/%Y` | In theo định dạng, phải có dấu `+` |
| `date -d tomorrow`, `date -d "next monday"` | Tính ngày tương đối, không đổi đồng hồ |
| `date +%s` | Số giây kể từ 1/1/1970 |
| `timedatectl` | Xem giờ, múi giờ, đồng bộ giờ (NTP) |
| `sudo timedatectl set-ntp false` | Tắt đồng bộ tự động. Phải tắt mới đặt giờ tay được |
| `sudo timedatectl set-time "2030-01-01 01:01:01"` | Đặt giờ |
| `sudo timedatectl set-timezone Asia/Ho_Chi_Minh` | Đặt múi giờ (viết `+07` sẽ bị từ chối) |

Mã định dạng: `%Y` năm, `%m` tháng, `%d` ngày, `%H` giờ, `%M` phút, `%S` giây, `%F` là `%Y-%m-%d`.

## [Bài 23. Tắt và khởi động lại](/bai/tat-va-khoi-dong-lai)

| Lệnh | Làm gì |
|---|---|
| `sudo reboot` | Khởi động lại ngay |
| `sudo shutdown -h now` | Tắt ngay |
| `sudo shutdown -r +10 "lời nhắn"` | Khởi động lại sau 10 phút, gửi lời nhắn cho mọi người |
| `sudo shutdown -h 18:00` | Tắt lúc 18 giờ |
| `sudo shutdown -c` | Huỷ lịch |

## [Bài 24. Quá trình khởi động](/bai/khoi-dong-he-thong)

6 bước: BIOS kiểm tra phần cứng (POST) → MBR → GRUB → kernel → init (systemd) → màn hình đăng nhập.

| Run level | Ý nghĩa | Target |
|---|---|---|
| 0 | Tắt máy | `poweroff.target` |
| 1 | Một người dùng, cứu hộ | `rescue.target` |
| 3 | Nhiều người dùng, dòng lệnh | `multi-user.target` |
| 5 | Có giao diện đồ hoạ | `graphical.target` |
| 6 | Khởi động lại | `reboot.target` |

| Lệnh | Làm gì |
|---|---|
| `systemctl get-default` | Xem chế độ mặc định |
| `sudo systemctl set-default multi-user.target` | Đổi mặc định, có tác dụng từ lần khởi động sau |
| `sudo systemctl isolate graphical.target` | Chuyển chế độ ngay |
| `sudo init 3` | Chuyển sang run level 3 |
| `runlevel` | In run level trước và hiện tại |

## [Bài 25. Thông tin hệ thống](/bai/thong-tin-he-thong)

| Muốn biết | Lệnh |
|---|---|
| RAM | `free -h` (nhìn cột `available`), `cat /proc/meminfo` |
| CPU | `nproc`, `cat /proc/cpuinfo` |
| Kernel | `uname -a`, `uname -r` |
| Ổ đĩa còn trống | `df -h` |
| Dung lượng thư mục | `du -sh thư-mục` |
| Phần cứng | `sudo dmidecode -t 1` (0 BIOS, 1 hệ thống, 4 CPU, 17 RAM) |
| Tiến trình | `top`, bấm `q` để thoát |
| Tên máy | `hostname` |
| Địa chỉ IP | `ip a`, `ifconfig` (phải cài gói `net-tools`) |

## Thử nhanh

Chép cả khối vào terminal để xem các lệnh của chặng chạy thế nào.

```bash
date
date +%d/%m/%Y
date -d "next monday" +%A
timedatectl
uname -a
free -h
df -h /
du -sh ~
systemctl get-default
runlevel
sudo shutdown -r +30 "Thu hen gio"
sudo shutdown -c
```

Bạn sẽ thấy:

- `date -d "next monday" +%A` in `Monday`, đồng hồ máy không đổi.
- `timedatectl` có dòng `Time zone: Asia/Ho_Chi_Minh` và `NTP service: active`.
- `systemctl get-default` in `graphical.target` (máy có giao diện) và `runlevel` in `N 5`.
- `shutdown -r +30` báo `Reboot scheduled for ...`, dòng ngay sau huỷ lịch. Hai lệnh này phải chạy cùng nhau.
