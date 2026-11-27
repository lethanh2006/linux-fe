---
summary: "Đọc chuỗi quyền rwx, phân biệt owner/group/others và hiểu quyền trên thư mục khác quyền trên file. Tính được các mức quyền 640, 644, 750 và 755."
minutes: 35
commands: ["ls -l", "ls -ld", "stat"]
quiz:
  - q: "Trong -rw-r-----, nhóm sở hữu có quyền gì?"
    options: ["Đọc và ghi", "Chạy", "Chỉ đọc", "Không có quyền"]
    answer: 2
    explain: "Sau ký tự loại file, ba cụm là rw- cho owner, r-- cho group và --- cho others."
  - q: "Trên thư mục, quyền x chủ yếu cho phép gì?"
    options: ["Đi xuyên/tra cứu tên bên trong thư mục và cd vào khi có đủ quyền liên quan", "Xoá toàn bộ ổ đĩa", "Đọc mọi nội dung file bên trong", "Chạy mọi file bất chấp quyền file"]
    answer: 0
    explain: "x trên thư mục là quyền search/traverse. Liệt kê tên cần r; đọc nội dung file còn cần quyền của chính file và đường dẫn."
  - q: "Mã quyền 640 tương ứng gì?"
    options: ["rwxr-----", "rw-r-----", "rw-r--r--", "rwxr-x---"]
    answer: 1
    explain: "6=4+2 là rw-, 4 là r--, 0 là ---."
  - q: "Trong trường hợp thông thường không có sticky bit hay hạn chế bổ sung, muốn xoá một tên file cần quyền gì?"
    options: ["Chỉ quyền ghi của file", "Chỉ là chủ file", "Quyền đọc của file", "Quyền w và x trên thư mục chứa tên file đó"]
    answer: 3
    explain: "Xoá tên là thay đổi thư mục. Quyền file khác quyền trên thư mục; sticky bit và cơ chế bổ sung có thể hạn chế thao tác."
---

> Bám video TITV bài 30. Ta đọc và hiểu quyền trước; bài 31 mới dùng chmod, chown, chgrp để thay đổi.

## Ba nhóm đối tượng

Mỗi file có một chủ sở hữu (owner) và một nhóm sở hữu (group). Các quyền cơ bản được chia cho ba lớp:

| Lớp | Ký hiệu | Áp dụng cho |
|---|---|---|
| Owner | `u` | User sở hữu file |
| Group | `g` | Người thuộc nhóm sở hữu của file |
| Others | `o` | Những người còn lại |

Hệ thống chọn lớp phù hợp với người truy cập, không cộng quyền của cả ba lớp lại. ACL, quyền quản trị và các cơ chế bảo mật khác có thể bổ sung quy tắc; bài này tập trung vào quyền Unix cơ bản.

## Đọc ls -l

```bash
ls -l /etc/hostname
ls -ld /tmp
```

| Phần | Ý nghĩa |
|---|---|
| `ls -l` | Hiện thông tin dạng dài, gồm quyền, owner và group |
| `-d` | Xem chính thư mục, không liệt kê nội dung của nó |
| `/etc/hostname` | File cần quan sát |
| `/tmp` | Thư mục cần quan sát |

Ví dụ chuỗi quyền của một file:

```text
-rw-r-----
```

Tách thành `-` + `rw-` + `r--` + `---`. Ký tự đầu chỉ loại file: `-` là file thường, `d` là thư mục, `l` là symbolic link. Các loại khác gồm `c`, `b`, `p`, `s` cho thiết bị ký tự, thiết bị khối, pipe và socket. Chín ký tự sau là ba cụm quyền.

## Quyền của file và của thư mục

| Quyền | File thường | Thư mục |
|---|---|---|
| `r` – read | Đọc nội dung | Liệt kê tên bên trong |
| `w` – write | Sửa nội dung | Thay đổi các tên bên trong: tạo, xoá, đổi tên; thường cần thêm `x` |
| `x` – execute | Cho phép thực thi trực tiếp, nếu định dạng và các điều kiện khác phù hợp | Tra cứu tên, đi xuyên thư mục, `cd` vào |

Biết một tên file và có `x` trên thư mục có thể cho phép truy cập tên đó dù không có `r` để liệt kê cả thư mục. Muốn đọc file vẫn phải có quyền đọc file cùng quyền đi qua các thư mục của đường dẫn.

Một file chỉ đọc vẫn có thể bị xoá tên nếu người dùng có quyền phù hợp trên thư mục cha. Ngược lại, được ghi nội dung file chưa đủ để đổi tên file trong một thư mục không cho thay đổi. Đây là điểm dễ nhầm nhất của bài.

Riêng `/tmp` thường có sticky bit, hiện thành `t` ở cuối chuỗi quyền. Nó bổ sung hạn chế xoá/đổi tên trong thư mục dùng chung; không lấy `/tmp` làm ví dụ duy nhất để suy ra quy tắc của mọi thư mục.

## Đổi rwx sang số

`r = 4`, `w = 2`, `x = 1`. Cộng các quyền trong từng lớp rồi ghép ba chữ số.

| Số | Quyền |
|---|---|
| `7` | `rwx` |
| `6` | `rw-` |
| `5` | `r-x` |
| `4` | `r--` |
| `0` | `---` |

Ví dụ `640` là owner đọc/ghi, group chỉ đọc, others không có quyền. `755` là owner đủ quyền, group và others đọc/thực thi. `644` thường dùng cho file dữ liệu; `755` có thể phù hợp cho thư mục cần cho người khác đi qua. Không dùng một mức quyền cho mọi tình huống.

```bash
stat -c '%a %A %n' /etc/hostname
```

| Phần | Ý nghĩa |
|---|---|
| `stat` | Xem thuộc tính file |
| `-c` | Chọn định dạng đầu ra |
| `%a` | Quyền dạng số |
| `%A` | Quyền dạng ký hiệu |
| `%n` | Tên file |

Số thực tế phụ thuộc cấu hình máy. Để xem bài tập với quyền xác định, sang bài 31 tạo file trong thư mục riêng rồi dùng chmod.

## Thực hành

1. Giải thích `drwxr-x---`.
2. Đổi `rw-r--r--` sang số.
3. Giải thích vì sao quyền ghi file không đồng nghĩa được xoá file đó.

<details>
<summary>Xem đáp án</summary>

1. `d` là thư mục. Owner có `rwx`, nhóm có `r-x`, others không có quyền. Owner và thành viên nhóm có thể đi vào; chỉ owner có quyền thay đổi tên bên trong theo các quyền cơ bản này.
2. `644`: `rw-` bằng 6, `r--` bằng 4, `r--` bằng 4.
3. Sửa nội dung tác động tới file. Xoá tên tác động tới thư mục chứa nó, thường cần `w` và `x` ở thư mục đó; sticky bit và các cơ chế bổ sung còn có thể hạn chế.

</details>

## Tóm tắt

Đọc ký tự loại file rồi ba cụm owner/group/others. Quyền `rwx` trên thư mục mang ý nghĩa khác trên file. Tính số theo `4 + 2 + 1`, và luôn xét cả đường dẫn khi giải thích lỗi Permission denied.
