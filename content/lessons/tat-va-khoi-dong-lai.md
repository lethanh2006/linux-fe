---
summary: reboot khởi động lại ngay. shutdown tắt hoặc khởi động lại ngay, sau vài phút, hoặc vào giờ hẹn, kèm lời nhắn cho người đang dùng máy, và huỷ được lịch bằng shutdown -c.
minutes: 20
commands: [reboot, shutdown -h, shutdown -r, shutdown -c, poweroff]
quiz:
  - q: "`sudo shutdown -r +10` làm gì?"
    options: ["Tắt máy sau 10 giây", "Khởi động lại sau 10 phút", "Khởi động lại 10 lần", "Tắt máy lúc 10 giờ"]
    answer: 1
    explain: "`-r` là reboot, `+10` là 10 phút nữa. Giờ hẹn cụ thể viết dạng `hh:mm`, ví dụ `18:00`."
  - q: Lệnh nào huỷ lịch tắt hoặc khởi động lại đang chờ?
    options: ["shutdown -h", "shutdown -c", "reboot -c", "shutdown now"]
    answer: 1
    explain: "`-c` (cancel) huỷ lịch."
  - q: Tắt máy ngay lập tức thì gõ gì?
    options: ["sudo shutdown -h now", "sudo shutdown -c", "sudo shutdown -r +1", "sudo reboot"]
    answer: 0
    explain: "`-h` (halt, tắt), `now` là ngay bây giờ. `reboot` là khởi động lại chứ không tắt."
  - q: "`sudo shutdown -h 18:00` khi bây giờ đã là 19 giờ thì máy tắt lúc nào?"
    options: ["Ngay lập tức", "18:00 ngày mai", "Báo lỗi", "Không bao giờ"]
    answer: 1
    explain: "Giờ hẹn đã qua trong hôm nay thì shutdown hẹn vào giờ đó của ngày hôm sau."
  - q: "Lời nhắn trong `shutdown -r +10 \"Bao tri he thong\"` dùng để làm gì?"
    options: ["Đặt tên cho máy", "Gửi tới terminal của mọi người đang đăng nhập", "Ghi vào /etc/hostname", "Không có tác dụng"]
    answer: 1
    explain: Mọi người đang đăng nhập nhận được thông báo để kịp lưu công việc.
---

> Bài này đi theo video TITV bài 23. Thử trên máy của riêng bạn; lệnh có lịch hẹn thì luôn huỷ bằng `shutdown -c` sau khi xem kết quả.

Máy chủ hiếm khi phải **tắt**, nhưng thường phải **khởi động lại**, ví dụ sau khi cập nhật kernel. Tắt hay khởi động lại máy đều cần quyền root, nên dùng `sudo`.

## reboot: khởi động lại ngay

```bash
sudo reboot
```

Máy khởi động lại ngay lập tức, không hỏi lại. Lưu công việc trước khi gõ.

## shutdown: tắt, khởi động lại, hẹn giờ

```text
shutdown [tuỳ chọn] [thời-gian] [lời-nhắn]
```

| Tuỳ chọn | Ý nghĩa |
|---|---|
| `-h` | Tắt máy (**h**alt, poweroff) |
| `-r` | Khởi động lại (**r**eboot) |
| `-c` | Huỷ lịch đang chờ (**c**ancel) |

| Thời gian | Ý nghĩa |
|---|---|
| `now` | Ngay bây giờ |
| `+m` | Sau m phút, ví dụ `+10` |
| `hh:mm` | Vào giờ đó, ví dụ `18:00` |

Không ghi thời gian thì mặc định là `+1` (một phút nữa).

### Hẹn khởi động lại, kèm lời nhắn

```bash
sudo shutdown -r +10 "Restart after 10 minutes"
```

| Phần | Ý nghĩa |
|---|---|
| `-r` | Khởi động lại |
| `+10` | Sau 10 phút |
| `"Restart after 10 minutes"` | Lời nhắn gửi tới mọi người đang đăng nhập |

```text
Reboot scheduled for Fri 2026-11-27 20:03:34 +07, use 'shutdown -c' to cancel.
```

Máy báo giờ sẽ khởi động lại và nhắc cách huỷ. Ai đang đăng nhập (kể cả qua SSH) sẽ thấy lời nhắn hiện lên terminal của họ để kịp lưu việc.

### Huỷ lịch

```bash
sudo shutdown -c
```

Không in gì là đã huỷ xong.

### Hẹn theo giờ và tắt ngay

```bash
sudo shutdown -h 18:00
sudo shutdown -c
```

```text
Shutdown scheduled for Sat 2026-11-28 18:00:00 +07, use 'shutdown -c' to cancel.
```

Lúc chạy lệnh đã quá 18 giờ, nên lịch rơi vào 18 giờ **ngày mai**.

| Lệnh | Làm gì |
|---|---|
| `sudo shutdown -h now` | Tắt máy ngay |
| `sudo shutdown -h +1` | Tắt sau 1 phút |
| `sudo shutdown -r now` | Khởi động lại ngay, giống `sudo reboot` |
| `sudo shutdown -h 18:00` | Tắt lúc 18 giờ |

Thiếu `sudo` thì bị từ chối:

```bash
shutdown -r +10
```

```text
Failed to schedule shutdown: Interactive authentication required.
```

Khi nào nên hẹn giờ? Ví dụ đang cài bản cập nhật trên máy chủ, muốn khởi động lại vào lúc ít người dùng (đêm khuya), hoặc cần báo trước cho mọi người lưu công việc.

## Mở rộng (chuẩn LPIC-1)

Chuẩn LPIC-1 mục 101.3 còn có:

| Lệnh | Làm gì |
|---|---|
| `poweroff` | Tắt máy ngay |
| `halt` | Dừng hệ thống |
| `systemctl reboot`, `systemctl poweroff` | Cách viết của systemd |
| `wall "lời nhắn"` | Gửi lời nhắn tới mọi terminal đang mở, không tắt máy |

Trên Ubuntu, `reboot`, `shutdown`, `poweroff`, `halt` đều là đường tắt (link, bài 32) tới `systemctl`:

```bash
ls -l /usr/sbin/reboot /usr/sbin/shutdown /usr/sbin/poweroff /usr/sbin/halt
```

```text
lrwxrwxrwx 1 root root 16 Oct 12 14:36 /usr/sbin/halt -> ../bin/systemctl
lrwxrwxrwx 1 root root 16 Oct 12 14:36 /usr/sbin/poweroff -> ../bin/systemctl
lrwxrwxrwx 1 root root 16 Oct 12 14:36 /usr/sbin/reboot -> ../bin/systemctl
lrwxrwxrwx 1 root root 16 Oct 12 14:36 /usr/sbin/shutdown -> ../bin/systemctl
```

Lệnh `init 0` (tắt) và `init 6` (khởi động lại) cũng làm được việc này, học ở bài 24.

> Máy chủ ở xa: tắt máy (`-h`) là mất kết nối, chỉ bật lại được qua trang quản trị của nhà cung cấp. Muốn khởi động lại thì dùng `-r`, không dùng `-h`.

## Thực hành

1. Hẹn tắt máy sau 30 phút với lời nhắn "May se tat luc 30 phut nua", xem thông báo, rồi huỷ.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo shutdown -h +30 "May se tat luc 30 phut nua"
   sudo shutdown -c
   ```

   </details>

2. Hẹn khởi động lại lúc 23 giờ 30 hôm nay, rồi huỷ.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo shutdown -r 23:30
   sudo shutdown -c
   ```

   </details>

3. Khởi động lại máy ngay theo hai cách khác nhau (chỉ chạy một cách, khi đã lưu hết công việc).

   <details>
   <summary>Xem đáp án</summary>

   `sudo reboot` hoặc `sudo shutdown -r now`.

   </details>

## Tóm tắt

| Lệnh | Làm gì |
|---|---|
| `sudo reboot` | Khởi động lại ngay |
| `sudo shutdown -h now` | Tắt ngay |
| `sudo shutdown -r +10 "lời nhắn"` | Khởi động lại sau 10 phút, kèm lời nhắn |
| `sudo shutdown -h 18:00` | Tắt lúc 18 giờ |
| `sudo shutdown -c` | Huỷ lịch |
