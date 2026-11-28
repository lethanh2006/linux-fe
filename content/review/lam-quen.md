## [Bài 5. Cấu trúc hệ điều hành](/bai/cau-truc-he-dieu-hanh)

Linux gồm 3 phần: kernel (lõi, điều khiển phần cứng, file, tiến trình, mạng, quyền), shell (nhận lệnh rồi nhờ kernel làm, Ubuntu dùng `bash`) và ứng dụng.

| Lệnh | Làm gì |
|---|---|
| `echo $SHELL` | Xem shell đang dùng |
| `uname -r` | Xem phiên bản kernel |
| `cat /etc/os-release` | Xem bản Linux đang chạy |
| `whoami` | Xem mình là ai |

Dấu nhắc kết thúc bằng `$` là người dùng thường, `#` là root. Cài phần mềm: Ubuntu dùng `apt`, CentOS dùng `yum`, Rocky và Fedora dùng `dnf`.

## [Bài 6. Cây thư mục](/bai/cay-thu-muc)

Mọi file nằm trong một cây bắt đầu từ `/`.

| Thư mục | Chứa gì |
|---|---|
| `/etc` | Cấu hình |
| `/home` | Thư mục nhà của người dùng |
| `/root` | Thư mục nhà của root |
| `/var/log` | Nhật ký |
| `/bin`, `/usr/bin` | Lệnh, chương trình |
| `/dev` | Thiết bị: ổ đĩa, USB |
| `/tmp` | File tạm |
| `/boot` | Kernel, GRUB |

Ký tự đầu của `ls -l` là loại file: `-` file thường, `d` thư mục, `l` link, `c` và `b` thiết bị, `s` socket, `p` pipe. File ẩn có tên bắt đầu bằng `.`, xem bằng `ls -a`.

Đường dẫn tuyệt đối bắt đầu bằng `/`, tương đối thì tính từ chỗ đang đứng. `.` là thư mục hiện tại, `..` là thư mục cha, `~` là thư mục nhà.

## [Bài 7. Terminal và cú pháp lệnh](/bai/terminal-va-cu-phap)

Cú pháp: `lệnh [tuỳ chọn] [đối số]`, ví dụ `ls -l /etc`. Tuỳ chọn ngắn ghép được (`-l -a` thành `-la`). Linux phân biệt chữ hoa, chữ thường.

| Phím, lệnh | Làm gì |
|---|---|
| `man ls` | Đọc hướng dẫn. `/từ` để tìm, `q` để thoát |
| `ls --help` | Xem nhanh cách dùng |
| `Tab` | Tự điền tên lệnh, tên file |
| `↑` `↓`, `Ctrl+R` | Lấy lại lệnh đã gõ |
| `Ctrl+C` | Dừng lệnh đang chạy |
| `Ctrl+A` / `Ctrl+E` | Về đầu / cuối dòng |
| `Ctrl+Alt+T` | Mở terminal |
| `exit`, `Ctrl+D` | Thoát terminal |

## [Bài 8. sudo và root](/bai/sudo-va-root)

| Lệnh | Làm gì |
|---|---|
| `sudo lệnh` | Chạy lệnh bằng quyền root, hỏi mật khẩu của chính bạn |
| `sudo apt update` | Tải danh sách gói mới, chưa cài gì |
| `sudo apt upgrade` | Cài bản mới cho các gói đã có |
| `passwd` | Đổi mật khẩu của mình |
| `sudo passwd tên` | Đặt mật khẩu cho người khác |
| `sudo passwd root` | Đặt mật khẩu cho root |
| `su root` / `exit` | Chuyển sang root / quay lại |

Gõ mật khẩu không hiện gì là bình thường. Người được dùng `sudo` ghi trong `/etc/sudoers` (trên Ubuntu là nhóm `sudo`).

## [Bài 9. pwd và cd](/bai/pwd-va-cd)

| Lệnh | Làm gì |
|---|---|
| `pwd` | In thư mục đang đứng |
| `cd /var/log` | Đi theo đường dẫn tuyệt đối |
| `cd log` | Vào thư mục con |
| `cd ..` / `cd ../..` | Lên 1 cấp / 2 cấp |
| `cd -` | Về thư mục vừa đứng trước đó |
| `cd`, `cd ~`, `cd $HOME` | Về thư mục nhà |
| `cd ~an` | Tới thư mục nhà của `an` |

## Thử nhanh

Chép cả khối vào terminal để xem các lệnh của chặng chạy thế nào.

```bash
whoami
echo $SHELL
uname -r
head -2 /etc/os-release
ls -a ~
ls -ld /etc /dev/null /bin
cd /var/log
pwd
cd ..
pwd
cd -
cd ~
pwd
```

Bạn sẽ thấy:

- `whoami` in tên tài khoản của bạn, `echo $SHELL` in `/bin/bash`.
- `ls -ld` cho thấy `/etc` là thư mục (`d`), `/dev/null` là thiết bị (`c`), `/bin` là link (`l`, `-> usr/bin`).
- `cd ..` từ `/var/log` lên `/var`; `cd -` quay lại và in `/var/log`; `cd ~` về thư mục nhà.
