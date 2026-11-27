---
summary: "Hiểu tài khoản, UID, nhóm chính và ba file passwd, shadow, group. Đọc đúng chín trường của shadow và phân biệt khoá mật khẩu với khoá mọi cách đăng nhập."
minutes: 35
commands: ["whoami", "id", "getent passwd", "getent shadow", "wc"]
quiz:
  - q: "Linux nhận diện chủ sở hữu file bằng giá trị nào?"
    options: ["Tên đầy đủ trong GECOS", "Đường dẫn home", "UID", "Mật khẩu"]
    answer: 2
    explain: "Tên đăng nhập ánh xạ tới UID. Quyền sở hữu file gắn với UID, không phải tên hiển thị."
  - q: "Một dòng /etc/passwd có bao nhiêu trường?"
    options: ["7", "8", "9", "4"]
    answer: 0
    explain: "Bảy trường: tên, trường mật khẩu, UID, GID, thông tin mô tả, home và shell."
  - q: "Một dòng /etc/shadow có bao nhiêu trường?"
    options: ["7", "8", "4", "9"]
    answer: 3
    explain: "Có chín trường, kể cả trường cuối dành dự phòng. Một số trường có thể để trống."
  - q: "Khoá mật khẩu của user có đảm bảo chặn mọi phiên SSH bằng khoá công khai không?"
    options: ["Có, luôn luôn", "Không; còn phụ thuộc cách xác thực và chính sách đăng nhập", "Có, vì SSH chỉ nhận mật khẩu", "Chỉ cần đổi tên user"]
    answer: 1
    explain: "Khoá trường mật khẩu chủ yếu vô hiệu xác thực bằng mật khẩu; phải xét SSH key, phiên đang mở và chính sách dịch vụ."
---

> Bám video TITV bài 26. Bài này đọc cấu trúc tài khoản; bài 27 mới tạo và thay đổi tài khoản thử nghiệm.

## Tài khoản và UID

Linux cho nhiều người và nhiều dịch vụ cùng làm việc. Một tài khoản có tên đăng nhập, một UID để hệ thống nhận diện, một nhóm chính và có thể thuộc thêm nhóm phụ.

```bash
whoami
id
```

`whoami` in tên tài khoản hiệu lực hiện tại. `id` in UID, GID và danh sách nhóm của tài khoản. Tài khoản `root` có UID `0`; quyền quản trị đến từ UID và cơ chế cấp quyền, không phải chỉ vì tên nghe giống quản trị viên.

Tài khoản dịch vụ dùng để chạy chương trình như máy chủ web. Nó thường không có mật khẩu dùng để đăng nhập tương tác và có thể dùng shell `nologin`. Không tự xoá một user chỉ vì bạn không nhận ra tên.

## /etc/passwd: bảy trường

```bash
getent passwd root
```

| Phần | Ý nghĩa |
|---|---|
| `getent` | Tra cứu cơ sở dữ liệu theo cấu hình NSS của hệ thống |
| `passwd` | Chọn cơ sở dữ liệu tài khoản |
| `root` | Chỉ tra tài khoản root |

Dòng minh hoạ cho một tài khoản thực hành:

```text
sv_demo:x:1500:1500:Học viên thử nghiệm:/home/sv_demo:/bin/bash
```

| Trường | Ví dụ | Ý nghĩa |
|---|---|---|
| 1 | `sv_demo` | Tên đăng nhập |
| 2 | `x` | Thông tin mật khẩu nằm ở cơ sở dữ liệu shadow |
| 3 | `1500` | UID |
| 4 | `1500` | GID của nhóm chính |
| 5 | `Học viên thử nghiệm` | Mô tả, thường gọi là GECOS |
| 6 | `/home/sv_demo` | Thư mục home được khai báo |
| 7 | `/bin/bash` | Shell đăng nhập |

`/etc/passwd` thường đọc được bởi người dùng thường. Tên file có chữ “passwd” không có nghĩa mật khẩu đang nằm ở đây. Một dòng khai báo home cũng không chứng minh thư mục đó thực sự tồn tại.

`cat /etc/passwd | wc -l` đếm dòng tài khoản cục bộ trong file, không phải số người đang đăng nhập. Trên hệ thống có LDAP hoặc nguồn NSS khác, `getent passwd` có thể trả thêm tài khoản ngoài file cục bộ.

## /etc/shadow: chín trường

File này chứa thông tin xác thực nhạy cảm và chính sách tuổi mật khẩu. Người dùng thường không được đọc nội dung của mọi tài khoản. Chỉ quan sát tài khoản thử nghiệm trong lab; không chép nội dung shadow thật lên chat hay diễn đàn.

Ví dụ cấu trúc minh hoạ, trường mật khẩu đã bị khoá:

```text
sv_demo:!:20000:0:90:7:14::
```

| Trường | Ý nghĩa |
|---|---|
| 1 | Tên đăng nhập |
| 2 | Giá trị băm mật khẩu hoặc ký hiệu đặc biệt như `!`, `*` |
| 3 | Ngày đổi mật khẩu gần nhất, tính theo số ngày từ mốc Unix |
| 4 | Số ngày tối thiểu giữa hai lần đổi mật khẩu |
| 5 | Tuổi tối đa của mật khẩu |
| 6 | Số ngày cảnh báo trước khi mật khẩu hết hạn |
| 7 | Khoảng không hoạt động sau khi mật khẩu hết hạn |
| 8 | Ngày tài khoản hết hạn |
| 9 | Dự phòng, thường trống |

Các dấu `:` ở cuối vẫn tạo ra trường trống. Vì vậy bảng có chín trường dù không phải cả chín đều có chữ hoặc số.

Mật khẩu không được lưu dạng chữ gốc; hệ thống kiểm tra giá trị băm theo cơ chế xác thực. `!` hoặc `*` có ý nghĩa đặc biệt đối với xác thực mật khẩu, nhưng không nên diễn giải thành “user không thể vào bằng bất kỳ cách nào”. SSH key và các chính sách đăng nhập khác cần được xem riêng.

## Nhóm và root

GID trong trường thứ tư của passwd là **nhóm chính**. Nhóm phụ được khai báo qua cơ sở dữ liệu nhóm, học ở [bài 28](/bai/quan-tri-nhom).

Video có thao tác đặt mật khẩu root và chuyển sang root. Trên Ubuntu thường dùng `sudo` hoặc `sudo -i` với tài khoản được cấp quyền, không cần bật đăng nhập mật khẩu root chỉ để đọc bài. Thoát shell quản trị bằng `exit` khi xong.

## Thực hành

1. Dùng `id` xác định UID và nhóm chính của bạn.
2. Tra một dòng của chính tài khoản hiện tại và tách đủ bảy trường.
3. Với dòng shadow minh hoạ ở trên, chỉ ra trường hết hạn tài khoản và trường dự phòng. Không đọc shadow thật để nộp bài.

<details>
<summary>Xem cách làm</summary>

```bash
id
getent passwd "$(whoami)"
```

Nhóm chính hiện dưới mục `gid=` của `id`. Trong dòng passwd, home ở trường 6 và shell ở trường 7. Trong shadow, hết hạn tài khoản ở trường 8, trường 9 dự phòng. Dấu `!` trong ví dụ cho biết trường mật khẩu đang bị khoá, không phải mật khẩu chữ gốc của user.

</details>

## Đọc thêm

[shadow(5)](https://man7.org/linux/man-pages/man5/shadow.5.html) mô tả chính xác chín trường và các trường hợp đặc biệt.

## Tóm tắt

UID nhận diện tài khoản; GID xác định nhóm. Passwd có bảy trường thông tin tài khoản, shadow có chín trường về xác thực và tuổi mật khẩu. Đọc file hệ thống để hiểu cấu trúc, dùng công cụ quản trị ở bài sau để thay đổi.
