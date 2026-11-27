---
summary: Giờ sai trên server làm log lộn xộn, chứng chỉ HTTPS báo lỗi, cron chạy sai lúc, đăng nhập 2 lớp thất bại. Bài này dạy xem và định dạng ngày giờ (date), xem và đặt múi giờ, đồng bộ giờ qua mạng bằng NTP (timedatectl, systemd-timesyncd, chrony), và đồng hồ phần cứng (hwclock).
minutes: 30
commands: [date, timedatectl, hwclock, chronyc, systemd-timesyncd, TZ]
quiz:
  - q: "`date +%F` in ra dạng nào?"
    options: ["27/11/2026", "2026-11-27", "Nov 27", "1795770121"]
    answer: 1
    explain: "`%F` là năm-tháng-ngày (giống `%Y-%m-%d`), hay dùng để đặt tên file sao lưu vì sắp xếp theo tên cũng là theo thời gian."
  - q: Đổi múi giờ của server sang giờ Việt Nam, dùng lệnh nào?
    options: ["date -s Asia/Ho_Chi_Minh", "sudo timedatectl set-timezone Asia/Ho_Chi_Minh", "export TZ=VN", "hwclock --tz VN"]
    answer: 1
    explain: "`timedatectl set-timezone` đổi múi giờ cho cả hệ thống (cập nhật symlink `/etc/localtime`). Biến `TZ` chỉ đổi cho một lệnh hoặc một phiên."
  - q: "`timedatectl` hiện `System clock synchronized: yes` và `NTP service: active`. Nghĩa là gì?"
    options: ["Giờ đặt tay", "Máy đang tự đồng bộ giờ với máy chủ NTP qua mạng và đã đồng bộ xong", "Đồng hồ phần cứng hỏng", "Múi giờ là UTC"]
    answer: 1
    explain: "NTP (Network Time Protocol) liên tục chỉnh giờ theo máy chủ thời gian. Trên Ubuntu, dịch vụ mặc định là `systemd-timesyncd`, trên RHEL/Rocky là `chronyd`."
  - q: Đồng hồ phần cứng (RTC) khác đồng hồ hệ thống thế nào?
    options: ["Giống nhau", "RTC chạy bằng pin trên bo mạch khi máy tắt; đồng hồ hệ thống do kernel giữ khi máy chạy, khởi tạo từ RTC lúc bật máy", "RTC chỉ có trên máy ảo", "Đồng hồ hệ thống lưu trong /etc"]
    answer: 1
    explain: "`hwclock --show` đọc RTC, `hwclock --systohc` ghi giờ hệ thống vào RTC. Server Linux nên để RTC theo UTC."
  - q: Server ở Việt Nam nhưng một số người khuyên để múi giờ server là UTC. Vì sao?
    options: ["UTC nhanh hơn", "Log từ nhiều server ở nhiều nơi cùng một chuẩn giờ, không bị nhảy giờ mùa hè, dễ đối chiếu", "Vì Linux không hỗ trợ giờ Việt Nam", "Để tiết kiệm điện"]
    answer: 1
    explain: Nhiều công ty để mọi server ở UTC, ứng dụng tự đổi sang giờ địa phương khi hiển thị. Việt Nam không có giờ mùa hè nên để Asia/Ho_Chi_Minh cũng không sao, chỉ cần thống nhất.
---

> Phần `date` làm được trong container. Phần đổi múi giờ, NTP, `hwclock` cần máy ảo hoặc VPS. Kết quả lấy từ máy ảo Ubuntu 24.04.

## date: xem và định dạng thời gian

```bash
date
date -u
date "+%Y-%m-%d %H:%M:%S"
date +%F_%H%M
date +%s
```

```text
Fri Nov 27 09:02:01 UTC 2026
Fri Nov 27 09:02:01 UTC 2026
2026-11-27 09:02:01
2026-11-27_0902
1795770121
```

| Phần | Ý nghĩa |
|---|---|
| `date` | Giờ hiện tại theo múi giờ của máy |
| `-u` | Theo giờ UTC (giờ quốc tế, bằng giờ Việt Nam trừ 7) |
| `+định-dạng` | In theo mẫu. Có dấu cách thì đặt trong nháy |

| Mẫu | In ra | Mẫu | In ra |
|---|---|---|---|
| `%Y` | Năm `2026` | `%H` | Giờ 00–23 |
| `%m` | Tháng `11` | `%M` | Phút |
| `%d` | Ngày `27` | `%S` | Giây |
| `%F` | `2026-11-27` | `%T` | `09:02:01` |
| `%A` | Thứ (`Friday`) | `%B` | Tháng bằng chữ |
| `%s` | Số giây kể từ 1/1/1970 UTC (Unix time) | `%Z` | Tên múi giờ |

Tính ngày:

```bash
date -d @1700000000
date -d "next monday" +%F
date -d "2026-12-25" +%A
```

```text
Tue Nov 14 22:13:20 UTC 2023
2026-11-30
Friday
```

| Phần | Ý nghĩa |
|---|---|
| `-d @số` | Đổi Unix time ra ngày giờ (log, database hay lưu dạng này) |
| `-d "next monday"` | Hiểu cả chữ: `yesterday`, `tomorrow`, `3 days ago`, `+2 weeks` |
| `-d "2026-12-25" +%A` | Ngày đó là thứ mấy |

Dùng trong script: tên file sao lưu `backup-$(date +%F).tar.gz`, đo thời gian chạy bằng hiệu hai lần `date +%s`.

## Múi giờ

```bash
timedatectl
```

```text
               Local time: Fri 2026-11-27 09:02:01 UTC
           Universal time: Fri 2026-11-27 09:02:01 UTC
                 RTC time: Fri 2026-11-27 09:02:01
                Time zone: Etc/UTC (UTC, +0000)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no
```

| Dòng | Ý nghĩa |
|---|---|
| `Local time` | Giờ theo múi giờ của máy |
| `Universal time` | Giờ UTC |
| `RTC time` | Giờ của đồng hồ phần cứng |
| `Time zone` | Múi giờ hiện tại. VPS thường để mặc định `Etc/UTC` |
| `System clock synchronized` | Đã đồng bộ được với máy chủ NTP chưa |
| `NTP service` | Dịch vụ đồng bộ giờ đang bật không |
| `RTC in local TZ: no` | Đồng hồ phần cứng giữ giờ UTC (nên như vậy trên Linux) |

Đổi múi giờ:

```bash
timedatectl list-timezones | grep -E "Ho_Chi_Minh|Bangkok"
sudo timedatectl set-timezone Asia/Ho_Chi_Minh
timedatectl | grep "Time zone"
date
ls -l /etc/localtime
```

```text
Asia/Bangkok
Asia/Ho_Chi_Minh
                Time zone: Asia/Ho_Chi_Minh (+07, +0700)
Fri Nov 27 16:02:01 +07 2026
lrwxrwxrwx 1 root root 36 Nov 27 16:02 /etc/localtime -> /usr/share/zoneinfo/Asia/Ho_Chi_Minh
```

| Phần | Ý nghĩa |
|---|---|
| `list-timezones` | Mọi múi giờ có trong `/usr/share/zoneinfo/` |
| `set-timezone` | Đổi múi giờ cả hệ thống |
| `/etc/localtime` | Symlink tới file múi giờ. Đây là nơi hệ thống thật sự đọc |

Cách khác: `sudo dpkg-reconfigure tzdata` (chọn từ menu, Debian/Ubuntu), `tzselect` (hỏi đáp để tìm tên múi giờ). Các dịch vụ đang chạy (cron, ứng dụng) cần khởi động lại mới nhận múi giờ mới.

Đổi múi giờ cho **một lệnh** bằng biến `TZ`:

```bash
TZ=UTC date
TZ=America/New_York date
```

```text
Fri Nov 27 09:02:01 UTC 2026
Fri Nov 27 04:02:01 EST 2026
```

## Đồng bộ giờ qua mạng: NTP

Đồng hồ máy tính chạy lệch dần (vài giây mỗi ngày). **NTP** (Network Time Protocol) liên tục so giờ với các máy chủ thời gian trên Internet và chỉnh lại.

| Dịch vụ | Có trên | Ghi chú |
|---|---|---|
| `systemd-timesyncd` | Ubuntu (mặc định) | Nhẹ, chỉ làm máy khách |
| `chronyd` (gói `chrony`) | RHEL, Rocky (mặc định), cài thêm trên Ubuntu | Chính xác hơn, làm được cả máy chủ NTP cho mạng nội bộ |
| `ntpd` | Hệ thống cũ | Đã được thay bằng chrony |

```bash
timedatectl timesync-status
```

```text
       Server: 91.189.91.157 (ntp.ubuntu.com)
Poll interval: 8min 32s (min: 32s; max 34min 8s)
         Leap: normal
      Version: 4
      Stratum: 2
    Reference: 84A36001
    Precision: 1us (-24)
Root distance: 23.139ms (max: 5s)
```

| Dòng | Ý nghĩa |
|---|---|
| `Server` | Máy chủ NTP đang dùng (Ubuntu mặc định là `ntp.ubuntu.com`) |
| `Poll interval` | Bao lâu hỏi lại một lần |
| `Stratum` | Tầng: 1 là máy chủ nối thẳng với đồng hồ chuẩn (GPS, đồng hồ nguyên tử), 2 là đồng bộ từ tầng 1… |

| Lệnh | Làm gì |
|---|---|
| `sudo timedatectl set-ntp true` / `false` | Bật / tắt đồng bộ NTP |
| `sudo timedatectl set-time "2026-11-27 16:10:00"` | Đặt giờ bằng tay (phải tắt NTP trước) |
| Sửa `/etc/systemd/timesyncd.conf` (dòng `NTP=`) | Đổi máy chủ NTP, rồi `sudo systemctl restart systemd-timesyncd` |

Với chrony:

| Lệnh | Làm gì |
|---|---|
| `chronyc sources -v` | Các máy chủ NTP và độ lệch |
| `chronyc tracking` | Độ lệch hiện tại của đồng hồ máy |
| `/etc/chrony/chrony.conf` (Ubuntu), `/etc/chrony.conf` (Rocky) | Cấu hình, dòng `pool` hoặc `server` |

NTP dùng cổng **UDP 123**. Tường lửa chặn cổng này thì máy không đồng bộ được giờ.

## Đồng hồ phần cứng: hwclock

Máy có hai đồng hồ:

| Đồng hồ | Ở đâu | Chạy khi |
|---|---|---|
| Đồng hồ phần cứng (RTC, CMOS) | Chip trên bo mạch, chạy bằng pin | Cả khi máy tắt |
| Đồng hồ hệ thống | Do kernel giữ trong bộ nhớ | Khi máy chạy. Lúc khởi động, nó lấy giờ từ RTC |

```bash
sudo hwclock --show
sudo hwclock --systohc
```

```text
2026-11-27 16:04:16.967177+07:00
```

| Lệnh | Làm gì |
|---|---|
| `hwclock --show` (hoặc `-r`) | Đọc giờ RTC |
| `hwclock --systohc` (hoặc `-w`) | Ghi giờ hệ thống vào RTC (**sys**tem **to** **h**ardware **c**lock) |
| `hwclock --hctosys` (hoặc `-s`) | Ngược lại: lấy giờ RTC đặt cho hệ thống |

Trên Ubuntu 24.04 bản tối giản, `hwclock` nằm trong gói `util-linux-extra`. Khi NTP đang chạy, systemd tự cập nhật RTC định kỳ, nên ít khi phải dùng lệnh này.

## Thực hành

1. In ngày giờ hiện tại dạng `27/11/2026 16:02:01`, và cho biết 100 ngày nữa là ngày nào, thứ mấy.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   date "+%d/%m/%Y %H:%M:%S"
   date -d "+100 days" "+%d/%m/%Y %A"
   ```

   </details>

2. Đo xem lệnh `find / -name "*.conf" 2>/dev/null` mất bao nhiêu giây, bằng `date +%s`. Sau đó làm lại bằng lệnh `time`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   bd=$(date +%s)
   find / -name "*.conf" > /dev/null 2>&1
   echo "Mất $(( $(date +%s) - bd )) giây"
   time find / -name "*.conf" > /dev/null 2>&1
   ```

   `time` in `real` (thời gian thực), `user` và `sys` (thời gian CPU).

   </details>

3. (Máy ảo) Xem múi giờ hiện tại, đổi sang `Asia/Ho_Chi_Minh`, kiểm tra symlink `/etc/localtime`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   timedatectl
   sudo timedatectl set-timezone Asia/Ho_Chi_Minh
   ls -l /etc/localtime
   date
   ```

   </details>

4. (Máy ảo) Máy đang đồng bộ với máy chủ NTP nào? Dịch vụ đồng bộ tên gì, có đang chạy không?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   timedatectl timesync-status
   systemctl status systemd-timesyncd
   ```

   Trên Rocky Linux thì dùng `chronyc sources -v` và `systemctl status chronyd`.

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Giờ hiện tại / giờ UTC | `date` / `date -u` |
| Định dạng cho tên file | `date +%F`, `date +%F_%H%M` |
| Đổi Unix time ra ngày | `date -d @1700000000` |
| Xem múi giờ, trạng thái NTP | `timedatectl` |
| Đổi múi giờ | `sudo timedatectl set-timezone Asia/Ho_Chi_Minh` |
| Múi giờ cho một lệnh | `TZ=UTC lệnh` |
| Bật / tắt NTP | `sudo timedatectl set-ntp true` / `false` |
| Trạng thái đồng bộ | `timedatectl timesync-status`, `chronyc tracking` |
| Đồng hồ phần cứng | `sudo hwclock --show`, `sudo hwclock --systohc` |
