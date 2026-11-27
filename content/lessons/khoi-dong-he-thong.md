---
summary: "Theo dõi từ firmware tới bootloader, kernel và systemd. Hiểu runlevel truyền thống, target hiện nay và khác biệt giữa xem, đổi mặc định, chuyển target ngay."
minutes: 35
commands: ["systemctl get-default", "systemctl list-units", "runlevel", "who -r", "systemctl set-default", "systemctl isolate"]
quiz:
  - q: "Trên máy systemd, systemctl get-default trả về gì?"
    options: ["Danh sách file home", "Tên user hiện tại", "Target khởi động mặc định", "IP mặc định"]
    answer: 2
    explain: "Lệnh đọc target được cấu hình làm mặc định, thường multi-user.target hoặc graphical.target."
  - q: "systemctl set-default khác isolate như thế nào?"
    options: ["set-default chọn mặc định cho lần khởi động; isolate chuyển trạng thái ngay", "Hai lệnh luôn chỉ xem", "isolate chỉ đổi tên", "set-default luôn tắt máy ngay"]
    answer: 0
    explain: "Thay mặc định không tự thực hiện đầy đủ chuyển target ngay. isolate có thể dừng các unit không thuộc target đích."
  - q: "Trong lớp tương thích systemd thông thường, runlevel 2, 3, 4 ánh xạ tới đâu?"
    options: ["poweroff.target", "graphical.target", "reboot.target", "multi-user.target"]
    answer: 3
    explain: "Không áp bảng nghĩa runlevel của một distro SysV cũ cho mọi Ubuntu/systemd hiện tại."
  - q: "Điều gì có thể xảy ra khi isolate multi-user.target trên VM đang chạy desktop?"
    options: ["Tự cài thêm GUI", "Phiên đồ hoạ và một số dịch vụ có thể bị dừng", "Không thể thay đổi gì", "Chỉ đổi màu màn hình"]
    answer: 1
    explain: "isolate thay tập unit hoạt động. Phải lưu công việc và có console trước khi thử."
---

> Bám video TITV bài 24. Thực hành xem thông tin trên Ubuntu VM có systemd. Các lệnh thay target có thể đóng phiên đồ hoạ nên không phải bài tập để thử trên máy đang làm việc.

## Từ nút nguồn tới màn hình đăng nhập

| Bước | Vai trò |
|---|---|
| Firmware BIOS/UEFI | Khởi tạo phần cứng và chọn đường khởi động |
| Bootloader, ví dụ GRUB | Nạp kernel và dữ liệu cần cho giai đoạn đầu |
| Kernel và initramfs | Khởi tạo hệ thống, driver cần thiết, tìm/gắn root filesystem |
| Trình init, thường systemd trên Ubuntu | Khởi động các unit/dịch vụ theo quan hệ phụ thuộc |
| Target và dịch vụ đăng nhập | Đưa máy tới trạng thái sử dụng đã cấu hình |

Đây là sơ đồ khái quát; cách khởi động chi tiết có thể khác giữa firmware, bản phân phối và cấu hình. Một container thường chạy ứng dụng chính của nó, không lặp lại đầy đủ quá trình boot như một VM.

## Runlevel truyền thống

Video giới thiệu các mức 0 đến 6 và lệnh `init`. Đây là mô hình từ SysV init. Ý nghĩa một số mức phụ thuộc bản phân phối; không có một bảng 2/3/4 áp dụng giống nhau cho mọi Linux.

Với lớp tương thích systemd thông thường:

| Runlevel | Target tương ứng |
|---|---|
| 0 | `poweroff.target` |
| 1 | `rescue.target` |
| 2, 3, 4 | `multi-user.target` |
| 5 | `graphical.target` |
| 6 | `reboot.target` |

`multi-user.target` là trạng thái nhiều người dùng không yêu cầu desktop; `graphical.target` bổ sung phần đồ hoạ theo cấu hình đã cài. Rescue là chế độ bảo trì, không phải một terminal người dùng thông thường.

## Xem trạng thái trước

```bash
systemctl get-default
systemctl list-units --type=target
runlevel
who -r
```

| Phần | Ý nghĩa |
|---|---|
| `systemctl` | Công cụ giao tiếp với systemd |
| `get-default` | Đọc target mặc định |
| `list-units --type=target` | Liệt kê các target đã được nạp, theo bộ lọc mặc định của lệnh |
| `runlevel` | Xem thông tin runlevel theo cơ chế tương thích |
| `who -r` | Đọc thông tin runlevel từ bản ghi hệ thống nếu có |

Máy có thể trả `graphical.target` hoặc `multi-user.target`; hãy so với loại cài đặt của mình. `runlevel` có thể hiện `N` khi không có mức trước, hoặc không đủ dữ liệu trong một số môi trường. Không lấy đầu ra của VM này làm quy tắc bắt buộc cho máy khác.

Muốn xem cả target không hoạt động, thêm `--all` vào lệnh list-units. Target **mặc định** và trạng thái **đang hoạt động** là hai thông tin khác nhau.

## Đổi mặc định khác chuyển ngay

Hai mẫu lệnh cần hiểu:

```bash
sudo systemctl set-default multi-user.target
sudo systemctl isolate multi-user.target
```

Dòng đầu thay mặc định cho những lần khởi động về sau; không phải nút chuyển desktop ngay lập tức. Dòng thứ hai yêu cầu chuyển ngay tập unit và có thể dừng những unit không cần cho target đích. Vì vậy có thể đóng desktop, dịch vụ hoặc phiên đang dùng.

Chỉ thử khi có console VM, đã lưu công việc và biết target ban đầu. Muốn khôi phục mặc định đồ hoạ trên VM vốn có desktop, dùng `sudo systemctl set-default graphical.target`. Muốn chuyển ngay về đồ hoạ đã được cài, dùng `sudo systemctl isolate graphical.target`. Máy server chưa cài desktop không tự có giao diện chỉ vì đặt target này.

Các lệnh `init 3`, `init 5` trong video có thể đi qua lớp tương thích trên systemd. Học ý nghĩa nhưng ưu tiên cú pháp systemctl rõ ràng khi quản lý Ubuntu hiện nay. `init 0` hoặc `init 6` có thể tắt/khởi động lại máy, không phải lệnh xem trạng thái.

## Thực hành

Bài tập bắt buộc chỉ đọc:

1. Ghi target mặc định của VM.
2. Liệt kê target đang hoạt động và tìm multi-user/graphical nếu có.
3. Giải thích tác động của set-default so với isolate, không cần chạy lệnh thay đổi để trả lời.

<details>
<summary>Xem cách làm</summary>

```bash
systemctl get-default
systemctl list-units --type=target
```

Set-default thay cấu hình mặc định; isolate thay tập unit hoạt động ngay. Nếu máy không chạy systemd làm trình init, chuyển sang VM Ubuntu đầy đủ cho phần này thay vì cố áp cùng đầu ra cho container.

</details>

## Đọc thêm

[Tài liệu runlevel của systemd](https://www.freedesktop.org/software/systemd/man/257/runlevel.html) giải thích lớp tương thích và bảng ánh xạ.

## Tóm tắt

Hiểu các giai đoạn boot và vai trò init. Runlevel là cách diễn đạt truyền thống; target là cách làm việc hiện nay trên systemd. Xem cấu hình, đổi mặc định và chuyển trạng thái ngay là ba hành động khác nhau.
