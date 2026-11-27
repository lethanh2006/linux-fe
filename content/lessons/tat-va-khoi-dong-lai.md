---
summary: "Hiểu shutdown, reboot, poweroff và halt; lên lịch khởi động lại có thông báo rồi huỷ lịch. Phân biệt thao tác trên VM lab với máy đang dùng thật."
minutes: 25
commands: ["shutdown", "reboot", "poweroff", "halt", "systemctl reboot"]
quiz:
  - q: "shutdown -r +10 yêu cầu gì?"
    options: ["Tắt Wi-Fi 10 giây", "Khởi động lại sau 10 phút", "Đọc10 dòng log", "Đổi runlevel vĩnh viễn"]
    answer: 1
    explain: "-r là reboot, +10 là số phút tính từ hiện tại."
  - q: "Lệnh nào huỷ lịch shutdown đang chờ?"
    options: ["shutdown -c", "shutdown -r", "reboot -f", "halt -p"]
    answer: 0
    explain: "-c huỷ lịch đang chờ; nó không hoàn tác được một máy đã tắt xong."
  - q: "Khác biệt thường thấy giữa halt và poweroff trên systemd là gì?"
    options: ["halt luôn khởi động lại", "Hai lệnh luôn chỉ in giờ", "poweroff chỉ thoát shell", "halt dừng hệ thống, poweroff yêu cầu tắt nguồn; còn phụ thuộc phần cứng/môi trường"]
    answer: 3
    explain: "Đừng đồng nhất dừng hệ thống với cắt nguồn. VM/container còn có lớp quản lý bên ngoài."
  - q: "Trước khi thử reboot ở bài này cần môi trường nào?"
    options: ["VPS sản xuất đang có khách", "Máy đang ghi dữ liệu quan trọng", "VM lab có console và chấp nhận bị ngắt", "Chỉ cần đổi màu terminal"]
    answer: 2
    explain: "Reboot thực sự ngắt phiên và công việc. VM lab có console giúp quan sát và phục hồi trong phạm vi thí nghiệm."
---

> Bám video TITV bài 23. Các lệnh trong bài có thể dừng cả máy. Chỉ thử thao tác thay đổi trạng thái trên VM lab có console; không thử trên máy đang dùng để làm việc hoặc phục vụ người khác.

## Tắt, dừng và khởi động lại

| Lệnh | Ý nghĩa thông thường |
|---|---|
| `reboot` | Khởi động lại |
| `poweroff` | Dừng hệ thống và yêu cầu tắt nguồn |
| `halt` | Dừng hệ thống; không đồng nghĩa chắc chắn cắt nguồn |
| `shutdown` | Sắp lịch tắt hoặc khởi động lại, có thể gửi thông báo |

Trên Ubuntu dùng systemd, nhiều lệnh truyền thống đi qua cơ chế tương thích của systemd. `sudo systemctl reboot` và `sudo systemctl poweroff` diễn đạt rõ thao tác. Môi trường desktop có thể cho người đăng nhập cục bộ thực hiện qua chính sách phân quyền mà không gõ sudo, nhưng không giả định mọi môi trường đều như vậy.

Đây không phải lệnh đóng một cửa sổ terminal. Thoát shell bằng `exit` hoặc Ctrl+D khác với tắt máy.

## Cú pháp shutdown

Mẫu là `shutdown [tuỳ-chọn] THỜI_GIAN [thông-báo]`.

| Phần | Ý nghĩa |
|---|---|
| `-r` | Khởi động lại |
| `-P` | Tắt nguồn |
| `-h` | Trên systemd thường tương ứng poweroff trừ khi được chọn halt rõ ràng |
| `now` | Thực hiện ngay |
| `+10` | Sau10 phút |
| `18:30` | Một giờ theo đồng hồ địa phương, không phải thời lượng |
| `-c` | Huỷ lịch đang chờ |

Đọc `shutdown --help` trên máy để biết hành vi đúng của bản đang dùng. Nếu không chỉ thời gian, công cụ có thể có thời gian mặc định; trong bài hãy viết rõ ý định thay vì dựa vào mặc định.

## Thử lên lịch rồi huỷ trên VM lab

Sau khi lưu công việc và xác nhận đang ở đúng VM, chạy cả cặp lệnh:

```bash
sudo shutdown -r +10 'Khoi dong lai VM lab'
sudo shutdown -c
```

| Phần | Ý nghĩa |
|---|---|
| `sudo` | Xin quyền quản trị cho thao tác hệ thống |
| `shutdown -r` | Chọn reboot |
| `+10` | Đợi 10 phút |
| Chuỗi trong nháy | Thông báo gửi tới người dùng theo cơ chế hệ thống |
| `shutdown -c` | Huỷ yêu cầu còn đang chờ |

Sau lệnh đầu, công cụ thường báo lịch và nhắc dùng `shutdown -c` để huỷ. Dòng giờ cụ thể phụ thuộc đồng hồ và múi giờ của VM. Không bỏ VM đó chạy với lịch thử nghiệm còn treo.

Lệnh `sudo reboot` hoặc `sudo shutdown -P now` không có khoảng chờ để thao tác huỷ bằng dòng tiếp theo. Chỉ đọc ý nghĩa nếu không muốn thực sự mất phiên.

## Các lỗi dễ nhầm

- Đang SSH nhưng tưởng terminal là máy cá nhân: shutdown tác động tới máy mà shell đang chạy trên đó. Kiểm tra `hostname` và console trước.
- Tưởng `+10` là 10 giây: cú pháp ở đây là phút.
- Dùng `-f` để vượt qua lỗi không hiểu: ép tắt có thể bỏ qua quy trình dừng sạch và ảnh hưởng dữ liệu.
- Chạy trong container mặc định rồi thấy lỗi systemd: container có thể không có trình quản lý hệ thống đầy đủ. Thực hành shutdown/reboot ở VM, không cố cấp thêm quyền chỉ để làm lệnh chạy.

## Thực hành

1. Đọc `shutdown --help` và tìm tuỳ chọn reboot/cancel.
2. Viết lệnh reboot sau 15 phút có thông báo, rồi lệnh huỷ. Chỉ thực sự chạy cặp lệnh nếu đang ở VM lab đúng như điều kiện của bài.
3. Giải thích vì sao `exit` không thay thế poweroff.

<details>
<summary>Xem đáp án</summary>

```bash
shutdown --help
```

Cặp lệnh cho VM:

```bash
sudo shutdown -r +15 'Thu lenh trong VM lab'
sudo shutdown -c
```

`exit` kết thúc shell hiện tại. Poweroff yêu cầu dừng cả hệ thống và tắt nguồn; đó là hai phạm vi khác nhau.

</details>

## Tóm tắt

Nói rõ muốn reboot, halt hay poweroff. Với shutdown, đọc đúng thời gian và luôn huỷ lịch thử nghiệm. Lệnh thay đổi trạng thái hệ thống cần đúng máy, đúng mục đích và công việc đã được lưu.
