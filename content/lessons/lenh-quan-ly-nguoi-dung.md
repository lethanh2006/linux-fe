---
summary: "Tạo tài khoản có home và shell rõ ràng, đổi thuộc tính bằng usermod, đọc chính sách bằng chage, rồi xoá tài khoản thử nghiệm đúng cách."
minutes: 45
commands: ["useradd", "passwd", "usermod", "userdel", "chage", "id", "getent passwd"]
quiz:
  - q: "Muốn useradd tạo thư mục home một cách tường minh, dùng tuỳ chọn nào?"
    options: ["-d", "-c", "-m", "-u"]
    answer: 2
    explain: "-m yêu cầu tạo home. -d chỉ chọn đường dẫn, -c đặt mô tả, -u chọn UID."
  - q: "Muốn thêm nhóm phụ mà giữ các nhóm phụ đang có, dùng gì?"
    options: ["usermod -aG nhóm user", "usermod -G nhóm user", "usermod -g nhóm user", "userdel -r user"]
    answer: 0
    explain: "-a kết hợp -G để bổ sung. -G không có -a thay thế danh sách nhóm phụ."
  - q: "Trong chage, -I viết hoa có nghĩa gì?"
    options: ["In tên đăng nhập", "Đặt UID", "Xem shell", "Khoảng không hoạt động sau khi mật khẩu hết hạn"]
    answer: 3
    explain: "-I là inactive sau khi mật khẩu hết hạn. -l viết thường là xem chính sách."
  - q: "userdel -r sv_xoa có tác động gì?"
    options: ["Chỉ đổi shell", "Xoá tài khoản cùng home và mail spool theo hành vi công cụ, không quét mọi file ở mọi nơi", "Chỉ khoá mật khẩu", "Tạo tài khoản mới"]
    answer: 1
    explain: "-r yêu cầu dọn home và mail spool. Các file ở nơi khác vẫn cần quản trị viên kiểm tra riêng."
---

> Bám video TITV bài 27. Chỉ tạo các tài khoản thực hành mới trong máy Ubuntu lab. Không thử đổi tài khoản đang dùng để quản trị máy thật.

## Tạo user có thể dùng được

Sau bài 26, ta biết một tài khoản cần home và shell. Khai báo chúng rõ ràng:

```bash
sudo useradd -m -s /bin/bash -c 'Tai khoan thuc hanh' sv_demo
getent passwd sv_demo
sudo ls -ld /home/sv_demo
```

| Phần | Ý nghĩa |
|---|---|
| `sudo` | Chạy việc quản trị với quyền được cấp |
| `useradd` | Tạo tài khoản |
| `-m` | Tạo thư mục home nếu cần |
| `-s /bin/bash` | Chọn Bash làm shell đăng nhập |
| `-c 'Tai khoan thuc hanh'` | Đặt mô tả; dấu nháy giữ cả cụm thành một đối số |
| `sv_demo` | Tên tài khoản mới |

UID/GID trong kết quả phụ thuộc máy. Home phải tồn tại thực sự, không chỉ xuất hiện trong dòng passwd. `useradd` không có `-m` có thể không tạo home, tuỳ cấu hình; viết `-m` giúp ý định rõ ràng. Trên Ubuntu, `adduser` là công cụ tương tác thân thiện hơn, nhưng bài này học cú pháp `useradd` như video.

Tài khoản mới chưa có mật khẩu dùng được. Nếu cần thực hành đăng nhập bằng mật khẩu:

```bash
sudo passwd sv_demo
```

Nhập mật khẩu của **tài khoản mới** theo lời nhắc, hai lần. Terminal không hiện ký tự khi gõ là bình thường. Không đặt mật khẩu bằng cách ghi mật khẩu chữ gốc vào đối số `useradd -p`; tuỳ chọn đó nhận giá trị băm, và đối số tiến trình có thể bị người khác nhìn thấy.

Để kiểm tra danh tính trong lab bằng quyền quản trị hiện có, không cần mở đăng nhập root:

```bash
sudo -u sv_demo whoami
```

```text
sv_demo
```

## Đổi thuộc tính bằng usermod

```bash
sudo usermod -c 'Hoc vien lab' sv_demo
getent passwd sv_demo
```

`usermod` sửa thuộc tính của user có sẵn. Một số tuỳ chọn quan trọng:

| Phần | Ý nghĩa |
|---|---|
| `-c mô-tả` | Đổi mô tả |
| `-s shell` | Đổi shell đăng nhập |
| `-d home-mới` | Đổi đường dẫn home khai báo |
| `-m` kết hợp `-d` | Di chuyển nội dung home theo cơ chế công cụ |
| `-g nhóm` | Đổi nhóm chính; nhóm phải tồn tại |
| `-aG nhóm` | Thêm nhóm phụ, giữ nhóm phụ cũ |
| `-L` | Khoá trường mật khẩu |
| `-U` | Bỏ khoá trường mật khẩu theo trạng thái phù hợp |

Không đổi home hoặc UID của user đang có tiến trình hoạt động trong bài tập người mới. Đổi một thuộc tính có thể kéo theo quyền sở hữu file cần kiểm tra.

Đặc biệt, `usermod -G nhom_moi user` thay danh sách nhóm phụ. Thiếu `-a` có thể làm user mất nhóm phụ khác. Bài 29 sẽ dùng `-aG` với nhóm thực hành mới.

Khoá mật khẩu không phải bảo đảm chặn mọi phương thức truy cập; cần xem thêm SSH key, chính sách dịch vụ và các phiên còn mở. Đừng thử khoá chính tài khoản đang dùng để kết nối.

## Chính sách tuổi mật khẩu: chage

```bash
sudo chage -m 0 -M 90 -W 7 -I 14 sv_demo
sudo chage -l sv_demo
```

| Phần | Ý nghĩa |
|---|---|
| `chage` | Quản lý tuổi mật khẩu |
| `-m 0` | Không bắt chờ giữa hai lần đổi |
| `-M 90` | Tuổi tối đa 90 ngày |
| `-W 7` | Cảnh báo trước 7 ngày |
| `-I 14` | Khoảng không hoạt động 14 ngày sau khi mật khẩu hết hạn |
| `-l` | Liệt kê chính sách hiện tại |

`-E YYYY-MM-DD` đặt ngày tài khoản hết hạn; nó khác ngày mật khẩu hết hạn. Các giá trị trên là bài tập đọc tuỳ chọn, không phải một chính sách chung phù hợp cho mọi tổ chức. Chú ý `-I` viết hoa khác `-l` viết thường.

## Xoá một tài khoản thử nghiệm

Giữ `sv_demo` để dùng trong các bài nhóm/quyền sau. Tạo tài khoản riêng để học xoá:

```bash
sudo useradd -m -s /bin/bash sv_xoa
sudo userdel -r sv_xoa
```

`userdel` xoá tài khoản. `-r` yêu cầu xoá home và mail spool; file thuộc user ở các vị trí khác không được tự động quét sạch. Hãy kiểm tra đúng tên và sao lưu dữ liệu cần giữ trước khi dùng trên hệ thống thật. Nếu user đang có tiến trình, công cụ có thể từ chối; không thêm `-f` chỉ để bỏ qua nguyên nhân.

## Thực hành

1. Tạo `sv_tap` với home và Bash.
2. Đổi mô tả thành `Bai tap user`.
3. Đặt tuổi mật khẩu tối đa 60 ngày, cảnh báo trước 5 ngày, rồi đọc lại.
4. Xoá **sv_tap**, giữ `sv_demo` để học tiếp.

<details>
<summary>Xem đáp án</summary>

```bash
sudo useradd -m -s /bin/bash sv_tap
sudo usermod -c 'Bai tap user' sv_tap
sudo chage -M 60 -W 5 sv_tap
getent passwd sv_tap
sudo chage -l sv_tap
sudo userdel -r sv_tap
```

Nếu máy báo không có mail spool để xoá, kiểm tra tài khoản và home đã được xử lý ra sao; không suy ra rằng mọi bước đều thất bại chỉ từ cảnh báo đó.

</details>

## Tóm tắt

`useradd` tạo, `usermod` sửa, `passwd` quản lý mật khẩu, `chage` quản lý tuổi mật khẩu, `userdel` xoá. Luôn kiểm tra lại bằng `id`, `getent` và trạng thái home thay vì chỉ tin rằng lệnh đã chạy.
