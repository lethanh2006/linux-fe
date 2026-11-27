---
summary: "Dùng chmod dạng số và ký hiệu, chown đổi chủ, chgrp đổi nhóm. Thực hành trong thư mục riêng và kiểm tra kết quả bằng stat."
minutes: 40
commands: ["chmod", "chown", "chgrp", "stat", "ls -l"]
quiz:
  - q: "chmod u+x script.sh làm gì?"
    options: ["Thêm quyền ghi cho nhóm", "Xoá quyền của others", "Thêm quyền thực thi cho owner", "Đổi chủ sang root"]
    answer: 2
    explain: "u chọn owner, + thêm quyền, x là execute. Các quyền không được chọn giữ nguyên."
  - q: "chmod u=rw,g=r,o= file tương ứng mức quyền cơ bản nào?"
    options: ["640", "644", "740", "777"]
    answer: 0
    explain: "Owner rw-=6, group r--=4, others ---=0."
  - q: "Lệnh nào đổi cả chủ và nhóm sở hữu?"
    options: ["chmod user:group file", "chown user:group file", "chgrp user:group file", "stat user:group file"]
    answer: 1
    explain: "chown nhận owner:group. chmod đổi mode, chgrp chỉ đổi nhóm."
  - q: "Vì sao không nên chmod -R 777 một cây dữ liệu để chữa mọi lỗi quyền?"
    options: ["Vì 777 là quyền chỉ đọc", "Vì chỉ root đọc được sau đó", "Vì tự xoá dữ liệu", "Vì cấp quyền quá rộng và gán cả quyền thực thi không cần thiết; cần phân tích file và thư mục"]
    answer: 3
    explain: "Đệ quy tác động mọi phần tử. File dữ liệu và thư mục thường cần các quyền khác nhau."
---

> Bám video TITV bài 31. Chỉ đổi quyền trong `~/thuc-hanh/bai31`. Các ví dụ đổi chủ/nhóm dùng user `sv_demo` và nhóm `du_an_lab` đã tạo ở bài 27, 29.

## Chuẩn bị file của mình

```bash
mkdir -p ~/thuc-hanh/bai31
cd ~/thuc-hanh/bai31
printf 'Bao cao thu nghiem\n' > bao-cao.txt
chmod 640 bao-cao.txt
stat -c '%a %A %n' bao-cao.txt
```

Kết quả:

```text
640 -rw-r----- bao-cao.txt
```

| Phần | Ý nghĩa |
|---|---|
| `chmod` | Đổi các bit quyền |
| `640` | Owner đọc/ghi, group đọc, others không có quyền |
| `bao-cao.txt` | File cần thay đổi |
| `stat -c` | In thuộc tính theo định dạng mình chọn |

Chủ file thường có thể chmod file của mình. Có quyền ghi nội dung không tự động cho phép chmod file của người khác.

## Dạng ký hiệu: chọn ai, làm gì, quyền nào

```bash
chmod g+w bao-cao.txt
stat -c '%a %A' bao-cao.txt
chmod o-rwx bao-cao.txt
chmod u=rw,g=r,o= bao-cao.txt
```

| Phần | Ý nghĩa |
|---|---|
| `u`, `g`, `o`, `a` | Owner, group, others, tất cả |
| `+` | Thêm các quyền được chọn |
| `-` | Bỏ các quyền được chọn |
| `=` | Đặt rõ các quyền của lớp được chọn |
| `g+w` | Thêm quyền ghi cho group |
| `o-rwx` | Bỏ cả ba quyền của others |
| `u=rw,g=r,o=` | Đặt quyền cơ bản thành 640 |

Ngay sau `g+w`, quyền từ 640 thành 660. Dạng ký hiệu giúp thay một phần mà không viết lại toàn bộ quyền.

Viết `chmod +x file` mà bỏ đối tượng chịu ảnh hưởng của `umask`; nó không phải lúc nào cũng giống chính xác `chmod a+x file`. Khi muốn nói rõ owner hay mọi người, dùng `u+x` hoặc `a+x`.

## Thử quyền thực thi

```bash
printf '#!/bin/sh\nprintf "Chay duoc\\n"\n' > chao.sh
chmod u+x chao.sh
./chao.sh
```

```text
Chay duoc
```

`u+x` cấp quyền thực thi cho owner. `./` yêu cầu chạy file trong thư mục hiện tại; shell không nhất thiết tìm thư mục hiện tại trong PATH. Nếu chạy `sh chao.sh`, bạn đang nhờ trình thông dịch đọc file, một cơ chế khác với thực thi trực tiếp `./chao.sh`.

## chown đổi chủ, chgrp đổi nhóm

Trước tiên xác nhận tài khoản và nhóm lab tồn tại:

```bash
getent passwd sv_demo
getent group du_an_lab
sudo chown sv_demo:du_an_lab bao-cao.txt
ls -l bao-cao.txt
```

| Phần | Ý nghĩa |
|---|---|
| `chown` | Đổi chủ, có thể đồng thời đổi nhóm |
| `sv_demo:du_an_lab` | Owner mới và group mới, ngăn bằng `:` |
| `chgrp` | Chỉ đổi nhóm sở hữu |
| `sudo` | Cần quyền quản trị để đổi owner sang tài khoản khác |

Muốn đưa file thử nghiệm về chính chủ và nhóm chính của bạn:

```bash
sudo chown "$(id -un):$(id -gn)" bao-cao.txt
```

`$(...)` lấy kết quả lệnh bên trong. `id -un` in tên user hiệu lực, `id -gn` in tên nhóm chính. Sau khi owner đã trở lại là bạn, có thể thử `chgrp "$(id -gn)" bao-cao.txt`; người dùng thường chỉ được đổi sang nhóm mà mình thuộc, tuỳ cơ chế hệ thống.

## Đệ quy và tên có khoảng trắng

`-R` áp dụng cho cả cây thư mục. Một lệnh sai ở đây tác động nhiều file. Không thực hành `chmod -R` hay `chown -R` lên `/`, `/etc`, home của người khác hoặc dữ liệu dịch vụ.

File có khoảng trắng cần được đặt trong nháy: `chmod 600 'ghi chu.txt'`. Quyền file dữ liệu thường khác quyền thư mục: thư mục cần `x` để đi vào; file văn bản thường không cần `x`. Đừng dùng 777 cho tất cả chỉ để hết lỗi Permission denied.

## Thực hành

1. Tạo `rieng.txt` chỉ owner đọc/ghi.
2. Tạo thư mục `nhom-doc` cho owner đủ quyền, group đọc/đi vào, others không có quyền.
3. Thêm quyền ghi cho group của `rieng.txt`, rồi kiểm tra bằng stat.

<details>
<summary>Xem đáp án</summary>

```bash
touch rieng.txt
chmod 600 rieng.txt
mkdir nhom-doc
chmod 750 nhom-doc
chmod g+w rieng.txt
stat -c '%a %A %n' rieng.txt nhom-doc
```

Quyền cuối: `rieng.txt` là 620, `nhom-doc` là 750. Thêm riêng `g+w` không tự thêm quyền đọc cho group.

</details>

## Tóm tắt

Chmod đổi mode, chown đổi owner/group, chgrp đổi group. Đọc kết quả sau mỗi lần thay đổi; phân biệt quyền trên file với quyền trên thư mục và chỉ dùng đệ quy khi hiểu rõ phạm vi.
