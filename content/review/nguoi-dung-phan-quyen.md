## [Bài 26. Quản trị người dùng](/bai/quan-tri-nguoi-dung)

root có UID 0. Tài khoản hệ thống có UID 1–999, người dùng thường từ 1000.

`/etc/passwd` có 7 cột ngăn bằng `:`. Ví dụ `hocvien:x:1001:1001::/home/hocvien:/bin/bash`:

| Cột | Ý nghĩa |
|---|---|
| 1 | Tên đăng nhập |
| 2 | `x`, mật khẩu nằm ở `/etc/shadow` |
| 3 | UID |
| 4 | GID của nhóm chính |
| 5 | Mô tả, họ tên |
| 6 | Thư mục nhà |
| 7 | Shell |

`/etc/shadow` chỉ root đọc được, có 9 cột: tên, mật khẩu đã mã hoá, ngày đổi mật khẩu (tính từ 1/1/1970), số ngày tối thiểu, tối đa, số ngày báo trước, số ngày khoá sau khi hết hạn, ngày tài khoản hết hạn, cột để dành. Cột mật khẩu là `!` hoặc `*` thì không đăng nhập bằng mật khẩu được.

`id` xem UID và nhóm của mình. `wc -l /etc/passwd` đếm số tài khoản.

## [Bài 27. Lệnh quản trị người dùng](/bai/lenh-quan-ly-nguoi-dung)

| Lệnh | Làm gì |
|---|---|
| `sudo useradd -m -s /bin/bash tên` | Tạo tài khoản có thư mục nhà. Thiếu `-m` thì không có thư mục nhà |
| `-c "Họ tên"`, `-u UID`, `-d thư-mục`, `-g nhóm`, `-G nhóm-phụ` | Các tuỳ chọn khác của `useradd` |
| `sudo passwd tên` | Đặt mật khẩu |
| `sudo usermod -aG nhóm tên` | Thêm nhóm phụ, giữ nhóm cũ |
| `sudo usermod -L tên` / `-U` | Khoá / mở khoá mật khẩu |
| `sudo userdel -r tên` | Xoá tài khoản cùng thư mục nhà |
| `sudo chage -l tên` | Xem thời hạn mật khẩu |
| `sudo chage -m 5 -M 90 -W 14 -I 10 -E 2030-04-30 tên` | Tối thiểu, tối đa, báo trước, khoá sau khi hết hạn, ngày hết hiệu lực |

`-I` là chữ i hoa (video đọc nhầm là `-l`).

## [Bài 28. Quản trị nhóm](/bai/quan-tri-nhom)

Mỗi tài khoản có 1 nhóm chính (cột 4 của `/etc/passwd`) và có thể thuộc nhiều nhóm phụ. Tạo tài khoản mà không có `-g` thì được một nhóm riêng trùng tên.

`/etc/group` có 4 cột: tên nhóm, `x`, GID, danh sách thành viên phụ. Ví dụ `sudo:x:27:ubuntu,hocvien`.

`groups` hoặc `id` để xem nhóm của mình.

## [Bài 29. Lệnh quản trị nhóm](/bai/lenh-quan-tri-nhom)

| Lệnh | Làm gì |
|---|---|
| `sudo groupadd marketing` | Tạo nhóm |
| `sudo groupadd -g 555 sales` | Tạo nhóm với GID chọn trước |
| `sudo groupmod -g 666 sales` | Đổi GID |
| `sudo groupmod -n accounting sales` | Đổi tên: tên mới trước, tên cũ sau |
| `sudo groupdel accounting` | Xoá nhóm |
| `sudo useradd -g marketing nv1` | Tạo tài khoản với nhóm chính có sẵn |
| `sudo gpasswd -a tên nhóm` / `-d` | Thêm / bớt thành viên |

Không xoá được nhóm đang là nhóm chính của một tài khoản. Phải xoá tài khoản đó (hoặc đổi nhóm chính của nó) trước.

## [Bài 30. Phân quyền](/bai/phan-quyen-file)

Trong `-rwxr-xr--`, ký tự đầu là loại file, sau đó là 3 cụm quyền cho chủ (u), nhóm (g), người khác (o).

| Quyền | Số | Với file | Với thư mục |
|---|---|---|---|
| `r` | 4 | Đọc nội dung | Xem danh sách file |
| `w` | 2 | Sửa nội dung | Tạo, xoá, đổi tên file bên trong |
| `x` | 1 | Chạy | Đi vào (`cd`) |

Cộng lại: 7 là rwx, 6 là rw-, 5 là r-x, 4 là r--. Hay dùng: 755 cho thư mục và chương trình, 644 cho file, 700 và 600 cho đồ riêng tư. Xem quyền dạng số: `stat -c %a file`.

## [Bài 31. chmod, chown, chgrp](/bai/lenh-phan-quyen)

| Lệnh | Làm gì |
|---|---|
| `chmod u+x file` | Thêm quyền chạy cho chủ |
| `chmod go-w file` | Bớt quyền ghi của nhóm và người khác |
| `chmod u=rwx,g=r,o= file` | Gán đúng quyền, giống `chmod 740` |
| `chmod 740 file` | Gán quyền bằng số |
| `sudo chown an file` | Đổi chủ |
| `sudo chown an:sudo file` | Đổi chủ và nhóm |
| `sudo chgrp nhóm file` | Đổi nhóm |
| `-R` | Áp cho cả thư mục và mọi thứ bên trong |

## [Bài 32. Hard link và soft link](/bai/hard-link-soft-link)

| | Hard link | Soft link |
|---|---|---|
| Lệnh | `ln gốc tên` | `ln -s gốc tên` |
| Inode | Cùng inode với gốc | Inode riêng |
| Xoá file gốc | Vẫn dùng được | Thành link hỏng |
| Dùng cho thư mục | Không | Được |

`ls -li` để xem số inode. Sửa qua tên nào cũng thấy cùng dữ liệu, nên hard link không phải bản sao lưu.

## Thử nhanh

Chép cả khối vào terminal để xem các lệnh của chặng chạy thế nào.

```bash
id
grep "^$USER:" /etc/passwd
sudo grep "^$USER:" /etc/shadow | cut -d : -f 1,3-
sudo groupadd nhomthu
sudo useradd -m -s /bin/bash -G nhomthu thu1
id thu1
sudo chage -l thu1 | head -4
mkdir -p ~/thuchanh/tomtat6
cd ~/thuchanh/tomtat6
touch rs.txt
chmod 740 rs.txt
stat -c "%a %A" rs.txt
chmod o+r rs.txt
ls -l rs.txt
sudo chown thu1:nhomthu rs.txt
ls -l rs.txt
echo "du lieu" > goc.txt
ln goc.txt hard.txt
ln -s goc.txt soft.txt
ls -li goc.txt hard.txt soft.txt
sudo userdel -r thu1
sudo groupdel nhomthu
```

Bạn sẽ thấy:

- `id thu1` cho thấy `thu1` có nhóm riêng `thu1` và nhóm phụ `nhomthu`.
- `stat` in `740 -rwxr-----`; sau `chmod o+r` thành `-rwxr--r--`; sau `chown` file thuộc `thu1`, nhóm `nhomthu`.
- `goc.txt` và `hard.txt` cùng số inode, số link là `2`; `soft.txt -> goc.txt` có inode riêng.
- Hai lệnh cuối dọn tài khoản và nhóm thử. Dòng `mail spool ... not found` chỉ là thông báo.
