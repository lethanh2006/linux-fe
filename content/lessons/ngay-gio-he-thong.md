---
summary: "Định dạng ngày giờ bằng date, tính thời gian với -d, phân biệt UTC với múi giờ. Dùng timedatectl để đọc cấu hình trên máy có systemd."
minutes: 30
commands: ["date", "timedatectl"]
quiz:
  - q: "date +%F thường in định dạng nào?"
    options: ["Ngày/tháng", "Giờ phút giây", "Tên thứ", "Năm-tháng-ngày"]
    answer: 3
    explain: "%F tương đương %Y-%m-%d."
  - q: "date -d tomorrow có tự đổi đồng hồ hệ thống không?"
    options: ["Không, nó phân tích thời điểm và in kết quả", "Có, đổi sang ngày mai", "Chỉ root mới được đọc", "Nó đổi múi giờ"]
    answer: 0
    explain: "-d chọn thời điểm để hiển thị, không đặt đồng hồ như thao tác quản trị set-time."
  - q: "Lệnh nào hiển thị giờ UTC?"
    options: ["date +%u", "date -u", "date -s", "date -r"]
    answer: 1
    explain: "-u chọn UTC cho việc hiển thị. %u là số thứ trong tuần, không phải tuỳ chọn UTC."
  - q: "Vì sao timedatectl có thể lỗi trong container thông thường?"
    options: ["Vì Linux không có múi giờ", "Vì date không được cài", "Vì container có thể không chạy systemd cùng dịch vụ cần thiết", "Vì phải đổi hostname"]
    answer: 2
    explain: "timedatectl giao tiếp với dịch vụ hệ thống; container chỉ chạy một ứng dụng thường không có môi trường systemd đầy đủ."
---

> Bám video TITV bài 22. Phần date chạy được trong nhiều môi trường; phần timedatectl cần máy có systemd và các dịch vụ liên quan, thường là VM Ubuntu đầy đủ.

## Đọc và định dạng ngày giờ

```bash
date
date '+%Y-%m-%d %H:%M:%S %Z'
date -u '+%F %T UTC'
```

| Phần | Ý nghĩa |
|---|---|
| `date` | Đọc hoặc định dạng thời gian |
| `+...` | Chuỗi định dạng đầu ra |
| `%Y`, `%m`, `%d` | Năm, tháng, ngày |
| `%H`, `%M`, `%S` | Giờ24h, phút, giây |
| `%F`, `%T` | Viết gọn ngày ISO và giờ |
| `%Z` | Tên/ký hiệu múi giờ theo môi trường |
| `-u` | Hiển thị theo UTC |

Dấu nháy giữ chuỗi định dạng có khoảng trắng trong cùng một đối số. Chú ý `%m` là tháng, `%M` viết hoa là phút.

## Xem thời điểm khác mà không đổi đồng hồ

```bash
date -d '2025-01-02' +%F
date -d 'tomorrow' +%F
date -d 'next monday' '+%A %F'
TZ=UTC date -d '2000-01-01 00:00:00' +%s
```

Lệnh đầu và cuối cho kết quả cố định:

```text
2025-01-02
946684800
```

`-d` phân tích chuỗi thời gian để in ra, **không đặt lại đồng hồ**. `tomorrow` và `next monday` phụ thuộc ngày hiện tại. `%s` là Unix timestamp; cùng một giờ ghi trên lịch nhưng múi giờ khác nhau có thể chỉ tới các thời điểm khác nhau. Ví dụ cuối đặt `TZ=UTC` để mốc giờ không bị hiểu theo múi giờ của máy.

## Múi giờ và thời điểm

Một thời điểm có thể hiển thị khác nhau ở Việt Nam và UTC. Đổi múi giờ không có nghĩa ta muốn đồng hồ vật lý nhảy sang một thời điểm khác.

```bash
TZ=Asia/Ho_Chi_Minh date '+%F %T %Z'
TZ=UTC date '+%F %T %Z'
```

Gán `TZ=...` ngay trước lệnh chỉ chọn môi trường cho lần chạy đó; không sửa múi giờ toàn hệ thống. Đây là cách đơn giản để thực hành việc hiển thị.

## timedatectl trên máy đầy đủ

```bash
timedatectl status
timedatectl list-timezones | grep 'Ho_Chi_Minh'
```

Đọc các mục local time, universal time, time zone, trạng thái đồng bộ và dịch vụ thời gian. Trên VM lab, muốn đổi múi giờ hiển thị của cả máy:

```bash
sudo timedatectl set-timezone Asia/Ho_Chi_Minh
```

`set-timezone` cần một tên múi giờ hợp lệ như trong danh sách, không phải chuỗi `+07` tuỳ ý. Ghi lại múi giờ cũ để khôi phục sau bài tập nếu VM phục vụ mục đích khác.

Video còn giới thiệu đặt thời gian thủ công. Cú pháp là `timedatectl set-time 'YYYY-MM-DD HH:MM:SS'` với giá trị thời gian thực tế cần đặt, có quyền quản trị. Khi đồng bộ tự động đang bật, công cụ có thể từ chối. Việc tắt/bật đồng bộ dùng `set-ntp false/true`, nhưng cơ chế cụ thể còn phụ thuộc dịch vụ thời gian được cài.

Không cần đặt một ngày tuỳ ý để hoàn thành bài này: đổi đồng hồ có thể ảnh hưởng chứng chỉ TLS, log và tác vụ hẹn giờ. Trong VM thử nghiệm đặt giờ thủ công, phải trả về thời gian đúng và bật lại cơ chế đồng bộ phù hợp sau khi xong.

Nếu container báo không khởi động bằng systemd hoặc không kết nối được bus, dùng date cho phần đọc thời gian và chuyển sang VM cho timedatectl; đó không phải lỗi cú pháp date.

## Thực hành

1. In ngày hiện tại theo `YYYY-MM-DD`.
2. In giờ hiện tại theo UTC và Asia/Ho_Chi_Minh mà không đổi cấu hình máy.
3. In ngày mai; giải thích vì sao kết quả thay đổi theo ngày chạy.

<details>
<summary>Xem đáp án</summary>

```bash
date +%F
TZ=UTC date '+%F %T %Z'
TZ=Asia/Ho_Chi_Minh date '+%F %T %Z'
date -d tomorrow +%F
```

Các lệnh chỉ hiển thị. Chúng không đặt lại đồng hồ hoặc thay múi giờ toàn hệ thống.

</details>

## Tóm tắt

Đọc/định dạng bằng date; `-d` tính thời điểm để xem. Phân biệt UTC, múi giờ và đồng hồ thực. Timedatectl điều khiển cấu hình hệ thống nên cần môi trường đầy đủ và hiểu tác động của thay đổi.
