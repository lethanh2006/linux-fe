---
summary: date in ngày giờ theo định dạng tuỳ ý và tính ngày tương đối (ngày mai, năm sau, thứ Hai tới). timedatectl xem và đặt giờ, múi giờ, bật tắt đồng bộ giờ tự động (NTP).
minutes: 30
commands: [date, date +FORMAT, date -d, timedatectl, timedatectl set-time, timedatectl set-timezone, timedatectl set-ntp]
quiz:
  - q: "Lệnh nào in ngày theo kiểu Việt Nam, ví dụ `27/11/2026`?"
    options: ["date %d/%m/%Y", "date +%d/%m/%Y", "date -d %d/%m/%Y", "date +%Y-%m-%d"]
    answer: 1
    explain: "Định dạng phải bắt đầu bằng dấu `+`. `%d` ngày, `%m` tháng, `%Y` năm 4 chữ số."
  - q: "`date -d tomorrow` có đổi đồng hồ của máy không?"
    options: ["Có, đổi sang ngày mai", "Không, chỉ tính và in ra ngày mai", "Chỉ khi chạy bằng sudo", "Có, nhưng chỉ 1 ngày"]
    answer: 1
    explain: "`-d` chỉ hiểu chuỗi thời gian rồi in ra. Đặt giờ thật là `date -s` hoặc `timedatectl set-time`."
  - q: "`sudo timedatectl set-time ...` báo `Automatic time synchronization is enabled`. Phải làm gì?"
    options: ["Khởi động lại máy", "Tắt đồng bộ tự động bằng `sudo timedatectl set-ntp false` rồi đặt lại", "Dùng date -d", "Đổi múi giờ"]
    answer: 1
    explain: "Khi NTP đang bật, hệ thống không cho đặt giờ tay. Nhớ bật lại bằng `set-ntp true`."
  - q: "Lệnh nào đặt múi giờ Việt Nam?"
    options: ["sudo timedatectl set-timezone +07", "sudo timedatectl set-timezone Asia/Ho_Chi_Minh", "sudo date -s +07", "sudo timedatectl set-time Asia/Ho_Chi_Minh"]
    answer: 1
    explain: "Múi giờ ghi theo dạng Vùng/Thành_phố. Viết `+07` bị báo `Invalid or not installed time zone`."
  - q: "`date +%s` in ra gì?"
    options: ["Số giây của phút hiện tại", "Số giây tính từ 0 giờ 1/1/1970 (UTC) tới giờ", "Số ngày trong năm", "Giờ theo UTC"]
    answer: 1
    explain: "Đây là \"giờ Unix\" (epoch), hay dùng để tính khoảng thời gian và đặt tên file không trùng."
---

> Bài này đi theo video TITV bài 22.

## date: xem ngày giờ

```bash
date
```

```text
Fri Nov 27 19:52:41 +07 2026
```

`date` in thứ, tháng, ngày, giờ, múi giờ (`+07` là giờ Việt Nam, UTC + 7 tiếng) và năm. Xem cách dùng đầy đủ bằng `man date`.

| Tuỳ chọn | Ý nghĩa |
|---|---|
| `+ĐỊNH-DẠNG` | In theo định dạng tự chọn |
| `-d "chuỗi"` | Hiểu một chuỗi thời gian rồi in ra (**d**ate string), không đổi đồng hồ |
| `-r file` | In giờ sửa lần cuối của file (**r**eference) |
| `-f file` | Đọc nhiều chuỗi thời gian từ file, mỗi dòng một chuỗi |
| `-s "chuỗi"` | Đặt giờ hệ thống (**s**et), cần root |
| `-u` | Hiện giờ UTC |

### Định dạng: phải có dấu +

```bash
date "+%Y-%m-%d %H:%M:%S"
date +%d/%m/%Y
date "+Hom nay la %A, ngay %d thang %m"
```

```text
2026-11-27 19:52:41
27/11/2026
Hom nay la Friday, ngay 27 thang 11
```

| Mã | Ý nghĩa | Ví dụ |
|---|---|---|
| `%Y` | Năm 4 chữ số | `2026` |
| `%m` | Tháng 01–12 | `11` |
| `%d` | Ngày 01–31 | `27` |
| `%H`, `%M`, `%S` | Giờ (00–23), phút, giây | `19`, `52`, `41` |
| `%A` | Tên thứ | `Friday` |
| `%F` | Viết tắt của `%Y-%m-%d` | `2026-11-27` |
| `%s` | Số giây kể từ 1/1/1970 | `1795783961` |

Định dạng có dấu cách thì đặt cả cụm trong nháy kép. Tên thứ in tiếng Anh vì ngôn ngữ máy là tiếng Anh; phần mở rộng có bài đổi ngôn ngữ.

### Ngày giờ tương đối: -d

```bash
date -d now
date -d "next year" +%F
date -d "2 years ago" +%F
date -d tomorrow +%F
date -d "next monday" "+%A %d/%m/%Y"
```

```text
Fri Nov 27 19:52:41 +07 2026
2027-11-27
2024-11-27
2026-11-28
Monday 30/11/2026
```

`date -d` hiểu khá nhiều cách viết tiếng Anh: `yesterday`, `3 days ago`, `next week`, `last friday`, `2026-12-31`. Dùng để tính hạn chót, đặt tên file sao lưu theo ngày hôm qua…

### Giờ Unix: %s

Linux đếm thời gian bằng **số giây kể từ 0 giờ ngày 1/1/1970 theo giờ UTC** (gọi là epoch). Tính số giây tới 0 giờ ngày 1/1/2000 (giờ Việt Nam):

```bash
date -d 2000-01-01 +%s
date -d @946659600
```

```text
946659600
Sat Jan  1 00:00:00 +07 2000
```

`-d @số` làm ngược lại: đổi số giây ra ngày giờ.

## timedatectl: xem và đặt giờ hệ thống

`timedatectl` là công cụ của systemd, ổn định hơn `date` khi cần **đặt** giờ, múi giờ.

```bash
timedatectl status
```

```text
               Local time: Fri 2026-11-27 19:52:41 +07
           Universal time: Fri 2026-11-27 12:52:41 UTC
                 RTC time: Fri 2026-11-27 12:52:41
                Time zone: Asia/Ho_Chi_Minh (+07, +0700)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no
```

| Dòng | Ý nghĩa |
|---|---|
| `Local time` | Giờ địa phương theo múi giờ của máy |
| `Universal time` | Giờ UTC (giờ quốc tế) |
| `RTC time` | Giờ của đồng hồ phần cứng trên bo mạch chủ, chạy cả khi tắt máy |
| `Time zone` | Múi giờ đang đặt |
| `System clock synchronized` | Đồng hồ đã khớp với máy chủ giờ trên mạng chưa |
| `NTP service: active` | Đang bật tự đồng bộ giờ qua mạng (NTP) |
| `RTC in local TZ: no` | Đồng hồ phần cứng giữ giờ UTC (chuẩn trên Linux) |

`timedatectl` gõ trơn cũng in đúng như `timedatectl status`.

### Đặt giờ bằng tay: set-time

```bash
sudo timedatectl set-time "2030-01-01 01:01:01"
```

```text
Failed to set time: Automatic time synchronization is enabled
```

Máy đang tự đồng bộ giờ qua mạng nên không cho đặt tay. Tắt đồng bộ trước:

```bash
sudo timedatectl set-ntp false
sudo timedatectl set-time "2030-01-01 01:01:01"
date
```

```text
Tue Jan  1 01:01:01 +07 2030
```

Thử xong **nhớ bật lại** đồng bộ, đồng hồ sẽ tự chỉnh về giờ đúng:

```bash
sudo timedatectl set-ntp true
timedatectl | grep -E "Local time|NTP|synchronized"
```

```text
               Local time: Fri 2026-11-27 19:52:45 +07
System clock synchronized: yes
              NTP service: active
```

> Giờ sai trên máy chủ gây nhiều lỗi khó hiểu: chứng chỉ HTTPS bị báo hết hạn, nhật ký ghi sai thứ tự, lịch chạy việc chạy nhầm giờ. Luôn để NTP bật.

### Đặt múi giờ: set-timezone

Múi giờ viết theo dạng **Vùng/Thành_phố**, không viết `+07`:

```bash
timedatectl list-timezones | grep -E "Ho_Chi|Bangkok|Tokyo"
sudo timedatectl set-timezone +07
```

```text
Asia/Bangkok
Asia/Ho_Chi_Minh
Asia/Tokyo
Failed to set time zone: Invalid or not installed time zone '+07'
```

```bash
sudo timedatectl set-timezone Asia/Tokyo
date
sudo timedatectl set-timezone Asia/Ho_Chi_Minh
date
```

```text
Fri Nov 27 21:52:45 JST 2026
Fri Nov 27 19:52:45 +07 2026
```

Đổi sang Tokyo (UTC + 9) đồng hồ chạy sớm hơn 2 tiếng; đổi lại Hồ Chí Minh thì trở về như cũ. Đổi múi giờ không làm thay đổi thời điểm thật, chỉ đổi cách hiển thị.

## Mở rộng (chuẩn LPIC-1)

Chuẩn LPIC-1 mục 108.1 (giữ giờ hệ thống) còn có:

| Mục | Nội dung |
|---|---|
| Giờ hệ thống và giờ phần cứng | Kernel giữ giờ hệ thống khi máy chạy; đồng hồ phần cứng (RTC) giữ giờ khi tắt máy. Lệnh `hwclock` (Ubuntu 24.04 phải cài gói `util-linux-extra`): `sudo hwclock --show` xem RTC, `sudo hwclock --systohc` ghi giờ hệ thống xuống RTC |
| NTP | Giao thức đồng bộ giờ qua mạng. Ubuntu dùng `systemd-timesyncd`; máy chủ hay dùng `chrony` (`chronyc tracking`, `chronyc sources`) |
| `/etc/localtime` | Link tới file múi giờ trong `/usr/share/zoneinfo/` |
| `date -u` | Giờ UTC |
| `date -r file` | Giờ sửa file |

```bash
ls -l /etc/localtime
date -u
```

```text
lrwxrwxrwx 1 root root 36 Nov 27 19:52 /etc/localtime -> /usr/share/zoneinfo/Asia/Ho_Chi_Minh
Fri Nov 27 12:52:41 UTC 2026
```

`set-timezone` thực chất là đổi link `/etc/localtime` (bài 32).

## Thực hành

1. In ngày giờ hiện tại theo dạng `27-11-2026 19h52`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   date "+%d-%m-%Y %Hh%M"
   ```

   </details>

2. Ngày 1/1 năm sau là thứ mấy? Còn 100 ngày nữa là ngày nào?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   date -d "$(date -d 'next year' +%Y)-01-01" +%A
   date -d "100 days" +%d/%m/%Y
   ```

   Lệnh đầu lồng `$(...)` (bài 13): lấy năm sau trước, rồi ghép thành ngày 1/1 của năm đó.

   </details>

3. Tạo file sao lưu rỗng có tên chứa ngày hôm nay, ví dụ `saoluu-2026-11-27.tar.gz`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   touch saoluu-$(date +%F).tar.gz
   ls saoluu-*
   ```

   </details>

4. Xem máy bạn đang ở múi giờ nào, có đồng bộ giờ tự động không. Nếu chưa phải giờ Việt Nam thì đặt lại.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   timedatectl
   sudo timedatectl set-timezone Asia/Ho_Chi_Minh
   ```

   Nếu `NTP service` là `inactive`, bật bằng `sudo timedatectl set-ntp true`.

   </details>

## Tóm tắt

| Lệnh | Làm gì |
|---|---|
| `date` | Xem ngày giờ |
| `date +%d/%m/%Y` | In theo định dạng (phải có `+`) |
| `date -d "next monday"` | Tính ngày tương đối, không đổi đồng hồ |
| `date +%s`, `date -d @số` | Giờ Unix và đổi ngược |
| `timedatectl` | Xem giờ, múi giờ, trạng thái NTP |
| `sudo timedatectl set-ntp false` / `true` | Tắt / bật đồng bộ giờ tự động |
| `sudo timedatectl set-time "..."` | Đặt giờ tay (khi NTP tắt) |
| `sudo timedatectl set-timezone Vùng/Thành_phố` | Đặt múi giờ |
