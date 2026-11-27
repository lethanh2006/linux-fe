---
summary: "Hiểu nhóm chính, nhóm phụ, GID và bốn trường của /etc/group. Dùng id, groups và getent để biết một tài khoản thuộc nhóm nào."
minutes: 25
commands: ["id", "groups", "getent group", "cat /etc/group"]
quiz:
  - q: "Một tài khoản có bao nhiêu nhóm chính tại một thời điểm?"
    options: ["Không giới hạn", "Đúng một", "Luôn hai", "Không có nhóm chính"]
    answer: 1
    explain: "Mỗi tài khoản có một GID nhóm chính trong passwd, đồng thời có thể thuộc nhiều nhóm phụ."
  - q: "Trường thứ ba của một dòng /etc/group là gì?"
    options: ["UID", "Tên người tạo nhóm", "Đường dẫn home", "GID"]
    answer: 3
    explain: "Bốn trường lần lượt là tên nhóm, trường mật khẩu nhóm, GID, danh sách thành viên."
  - q: "Danh sách thành viên trống trong /etc/group có chứng minh không ai dùng nhóm đó làm nhóm chính không?"
    options: ["Không", "Có", "Có nếu GID trên 1000", "Chỉ root biết"]
    answer: 0
    explain: "Thành viên có nhóm chính này được xác định từ GID trong passwd; không nhất thiết được liệt kê lại ở trường thành viên của group."
  - q: "Cách nào giúp kiểm tra đủ nhóm chính và nhóm phụ của một user?"
    options: ["Chỉ nhìn tên thư mục home", "Đếm dòng /etc/group", "id tên-user", "cat /etc/hostname"]
    answer: 2
    explain: "id cho thấy UID, GID chính và danh sách nhóm đã tra được của tài khoản."
---

> Bám video TITV bài 28. Bài 29 sẽ thực hành tạo, đổi tên và xoá nhóm thử nghiệm.

## Vì sao cần nhóm

Giả sử một thư mục dùng chung cho nhóm làm website. Thay vì cấp quyền riêng cho từng người, ta gán thư mục cho một nhóm rồi thêm những người phù hợp vào nhóm đó. Nhóm giúp tổ chức quyền truy cập, không tự động làm mọi thành viên có quyền quản trị.

Mỗi nhóm có tên và GID. File lưu quyền sở hữu nhóm bằng GID; tên nhóm giúp con người dễ đọc. Một tài khoản có một nhóm chính và có thể thuộc nhiều nhóm phụ.

## Xem nhóm của mình

```bash
id
groups
id -gn
id -nG
```

| Phần | Ý nghĩa |
|---|---|
| `id` | Xem UID, GID và các nhóm |
| `groups` | In tên các nhóm |
| `id -g` | In GID của nhóm chính |
| `id -gn` | `-n` đổi từ mã số sang tên nhóm |
| `id -nG` | `-G` viết hoa chọn toàn bộ nhóm, kết hợp `-n` để in tên |

Nếu tra người khác, thêm tên user làm đối số, ví dụ `id sv_demo`. Lệnh chỉ xem thông tin; nó không thêm tài khoản đó vào nhóm nào.

## /etc/group có bốn trường

```bash
getent group root
```

Trên hệ thống có nhóm root thông thường:

```text
root:x:0:
```

Một ví dụ minh hoạ khác:

```text
du_an_lab:x:1600:sv_demo,sv_phu
```

| Trường | Ví dụ | Ý nghĩa |
|---|---|---|
| 1 | `du_an_lab` | Tên nhóm |
| 2 | `x` | Trường mật khẩu nhóm; thông tin bảo vệ có thể nằm trong gshadow |
| 3 | `1600` | GID |
| 4 | `sv_demo,sv_phu` | Danh sách thành viên được khai báo, ngăn cách bằng dấu phẩy |

`getent group` tra cơ sở dữ liệu nhóm theo NSS, nên phù hợp hơn giả định mọi nhóm đều chỉ nằm trong `/etc/group`. `cat /etc/group` vẫn hữu ích để đọc file nhóm cục bộ như trong video.

Đặc biệt: trường thành viên trống không đồng nghĩa nhóm không có ai sử dụng. Một user có GID nhóm chính là `1600` có thể không được ghi lại ở trường thành viên của nhóm `1600`. Hãy kiểm tra tài khoản bằng `id` và dòng passwd của user đó.

## Nhóm chính, nhóm phụ và phiên đăng nhập

Nhóm chính được khai báo trong `/etc/passwd`. Khi tạo file, nhóm sở hữu thường theo nhóm hiệu lực của tiến trình; thư mục có bit setgid có thể làm file mới thừa hưởng nhóm của thư mục. Bài phân quyền mở rộng sẽ giải thích trường hợp này.

Khi quản trị viên thêm user vào nhóm phụ, các tiến trình của phiên đăng nhập cũ thường vẫn giữ danh sách nhóm cũ. Đăng xuất rồi đăng nhập lại là cách dễ hiểu để nhận nhóm mới. Đừng kết luận lệnh thêm nhóm thất bại chỉ vì terminal đang mở chưa nhận thay đổi.

Nhóm `sudo` trên Ubuntu thường được cấu hình để cấp khả năng dùng sudo, nhưng chính sách nằm ở cấu hình sudo; tên nhóm không phải phép màu có hiệu lực giống nhau trên mọi bản Linux.

## Thực hành

1. Xem tên nhóm chính và danh sách tất cả nhóm của bạn.
2. Tra nhóm chính bằng `getent group`.
3. Giải thích vì sao danh sách thành viên ở cuối một dòng group có thể trống mà user vẫn thuộc nhóm đó.

<details>
<summary>Xem cách làm</summary>

```bash
id -gn
id -nG
getent group "$(id -gn)"
getent passwd "$(whoami)"
```

So sánh GID nhóm chính trong passwd với GID của dòng group. Thành viên nhóm chính được xác định qua GID đó; trường cuối của group không phải danh sách duy nhất của mọi quan hệ thành viên.

</details>

## Tóm tắt

Tên nhóm ánh xạ tới GID. Dòng group có bốn trường. Dùng `id` để xem nhóm của user; dùng `getent group` để tra nhóm. Phân biệt nhóm chính, nhóm phụ và nhóm đã có hiệu lực trong phiên hiện tại.
