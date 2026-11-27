---
summary: Mở và đóng terminal, cú pháp ba phần của một câu lệnh (lệnh, tuỳ chọn, đối số), tự tra cứu bằng man, ngắt lệnh bằng Ctrl+C và các phím tắt giúp gõ lệnh nhanh.
minutes: 35
commands: [man, "--help", type, history, Ctrl+C, Tab]
quiz:
  - q: "Trong lệnh `ls -l /etc`, phần `/etc` là gì?"
    options: ["Tên lệnh", "Tuỳ chọn", "Đối số", "Dấu nhắc"]
    answer: 2
    explain: "`ls` là lệnh, `-l` là tuỳ chọn (bắt đầu bằng dấu gạch), `/etc` là đối số: thứ mà lệnh làm việc trên đó."
  - q: Đang đọc trang `man ls`, muốn thoát thì bấm phím nào?
    options: ["q", "Ctrl+Z", "Esc", "x"]
    answer: 0
    explain: "`q` (quit) thoát khỏi trang man. Phím `h` mở trợ giúp, `/từ` để tìm."
  - q: Lệnh `ping google.com` chạy mãi không dừng. Làm sao để dừng nó?
    options: ["Bấm Ctrl+D", "Bấm Ctrl+C", "Gõ exit", "Đóng máy"]
    answer: 1
    explain: "`Ctrl+C` ngắt lệnh đang chạy. `Ctrl+D` và `exit` dùng để thoát shell khi đang ở dấu nhắc."
  - q: "`ls -l -a -h` có thể viết gọn thành gì?"
    options: ["ls -l-a-h", "ls --lah", "ls -lah", "ls lah"]
    answer: 2
    explain: "Tuỳ chọn ngắn (một gạch, một chữ) ghép được với nhau: `-lah`. Tuỳ chọn dài như `--all` thì không ghép được."
  - q: Phím nào tự điền tên lệnh hoặc tên file đang gõ dở?
    options: ["Tab", "Ctrl+A", "Ctrl+R", "Alt+F"]
    answer: 0
    explain: "`Tab` tự hoàn thành. Bấm hai lần để xem các khả năng khi có nhiều tên trùng phần đầu."
---

> Bài này đi theo video TITV bài 7.

## Mở và đóng terminal

**Terminal** là cửa sổ để gõ lệnh. Bên trong terminal có **shell** (`bash`) đọc lệnh bạn gõ rồi chạy (bài 5).

| Việc | Cách làm trên Ubuntu |
|---|---|
| Mở terminal | Bấm `Ctrl+Alt+T`, hoặc mở menu ứng dụng, gõ "Terminal" |
| Mở thêm tab | `Ctrl+Shift+T` |
| Đóng tab | `Ctrl+Shift+W` |
| Đóng terminal | Gõ `exit`, bấm `Ctrl+D` ở dấu nhắc trống, hoặc bấm nút X |

Gõ lệnh xong bấm `Enter` để chạy. Bấm mũi tên `↑` `↓` để lấy lại lệnh đã gõ trước đó, khỏi gõ lại.

> Trong các bài, dấu `$` màu xanh trước mỗi lệnh chỉ là dấu nhắc. Bạn **không gõ** dấu đó. Nút "Chép" chỉ chép phần lệnh.

## Cú pháp một câu lệnh

Một câu lệnh có ba phần, cách nhau bằng dấu cách:

```text
lệnh  [tuỳ chọn]  [đối số]
```

Phần trong `[ ]` là **không bắt buộc**. Ví dụ:

```bash
ls -l /etc/hostname /etc/hosts
```

| Phần | Vai trò | Ý nghĩa trong ví dụ |
|---|---|---|
| `ls` | **Lệnh**: tên chương trình cần chạy, phải viết đúng | Liệt kê file |
| `-l` | **Tuỳ chọn** (option): đổi cách lệnh chạy, bắt đầu bằng `-` | Hiện dạng dài, mỗi file một dòng |
| `/etc/hostname /etc/hosts` | **Đối số** (argument): thứ mà lệnh làm việc trên đó. Có thể có nhiều | Hai file cần xem |

```text
-rw-r--r-- 1 root root   7 Nov 27 19:14 /etc/hostname
-rw-r--r-- 1 root root 166 Nov 27 19:14 /etc/hosts
```

Tuỳ chọn có hai kiểu viết:

| Kiểu | Ví dụ | Ghi chú |
|---|---|---|
| Ngắn: một gạch, một chữ | `-l`, `-a`, `-h` | Ghép được: `-l -a -h` viết thành `-lah` |
| Dài: hai gạch, cả chữ | `--all`, `--help` | Dễ đọc, không ghép được |

Linux **phân biệt chữ hoa, chữ thường**: `ls` khác `LS`, `-r` khác `-R`.

Gõ sai tuỳ chọn, lệnh báo:

```bash
ls -z
```

```text
ls: invalid option -- 'z'
Try 'ls --help' for more information.
```

Gõ sai tên lệnh:

```bash
lss
```

```text
bash: lss: command not found
```

Ubuntu desktop còn gợi ý thêm lệnh có tên gần giống (`Command 'lss' not found, did you mean: ...`).

## man: tài liệu của lệnh

Không ai nhớ hết tuỳ chọn. Lệnh `man` (**man**ual) mở tài liệu hướng dẫn của một lệnh:

```bash
man ls
```

| Phần | Ý nghĩa |
|---|---|
| `man` | Mở tài liệu |
| `ls` | Tên lệnh cần tra |

Trang man có các mục `NAME` (tên, một câu mô tả), `SYNOPSIS` (cú pháp), `DESCRIPTION` (giải thích từng tuỳ chọn). Cách đi lại:

| Phím | Làm gì |
|---|---|
| `↑` `↓` | Cuộn từng dòng |
| `PgUp` `PgDn` hoặc `Space` | Lên, xuống một trang |
| `/từ-khoá` rồi `Enter` | Tìm. `n` tới kết quả sau, `N` về kết quả trước |
| `h` | Xem trợ giúp về các phím |
| `q` | Thoát |

Thử tra `man cp` để biết `cp` chép thư mục cần tuỳ chọn gì (gợi ý: tìm `/recursive`).

## Chạy, xem lại và ngắt lệnh

Có lệnh chạy mãi cho tới khi bạn dừng nó, ví dụ `ping` gửi gói tin kiểm tra mạng liên tục:

```bash
ping localhost
```

Bấm `Ctrl+C` để dừng. `ping` in bảng thống kê rồi trả lại dấu nhắc:

```text
PING localhost (::1) 56 data bytes
64 bytes from localhost (::1): icmp_seq=1 ttl=64 time=0.027 ms
64 bytes from localhost (::1): icmp_seq=2 ttl=64 time=0.096 ms
64 bytes from localhost (::1): icmp_seq=3 ttl=64 time=0.151 ms
^C
--- localhost ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2044ms
rtt min/avg/max/mdev = 0.027/0.091/0.151/0.050 ms
```

`^C` là terminal hiện lại phím `Ctrl+C` bạn vừa bấm.

## Phím tắt nên thuộc

| Phím | Làm gì |
|---|---|
| `Tab` | Tự điền tên lệnh, tên file, thư mục. Bấm 2 lần để xem các khả năng. **Dùng liên tục**, vừa nhanh vừa tránh gõ sai |
| `↑` / `↓` | Lấy lại lệnh trước / sau |
| `Ctrl+R` rồi gõ chữ | Tìm trong các lệnh đã gõ. `Ctrl+R` tiếp để xem kết quả cũ hơn, `Enter` để chạy |
| `Ctrl+C` | Dừng lệnh đang chạy |
| `Ctrl+A` / `Ctrl+E` | Đưa con trỏ về đầu / cuối dòng |
| `Ctrl+U` / `Ctrl+K` | Xoá từ con trỏ về đầu dòng / tới cuối dòng |
| `Alt+B` / `Alt+F` | Lùi / tiến một từ |
| `Ctrl+L` | Xoá màn hình, giống lệnh `clear` |
| `Ctrl+Shift+C` / `Ctrl+Shift+V` | Chép / dán trong terminal (`Ctrl+C` đã dùng để ngắt lệnh) |
| `Ctrl+Shift++` / `Ctrl+-` | Phóng to / thu nhỏ chữ |

## Mở rộng (chuẩn LPIC-1)

Chuẩn LPIC-1 mục 103.1 yêu cầu dùng thạo dòng lệnh. Ngoài `man`, còn mấy cách tra cứu và mẹo sau.

### --help: xem nhanh

Hầu hết lệnh hiểu tuỳ chọn `--help`: in tóm tắt cách dùng rồi thoát, nhanh hơn mở `man`.

```bash
ls --help
```

```text
Usage: ls [OPTION]... [FILE]...
List information about the FILEs (the current directory by default).
...
```

Cách đọc dòng `Usage`: phần trong `[ ]` là không bắt buộc, `...` là có thể lặp lại nhiều lần.

### Mục của trang man

Trang man chia thành các **mục** (section). Một tên có thể có ở nhiều mục:

```bash
whatis passwd
```

```text
passwd (1)           - change user password
passwd (1ssl)        - OpenSSL application commands
passwd (5)           - the password file
```

| Mục | Chứa gì | Ví dụ |
|---|---|---|
| 1 | Lệnh cho mọi người dùng | `man 1 passwd`: lệnh đổi mật khẩu |
| 5 | Định dạng file cấu hình | `man 5 passwd`: cấu trúc file `/etc/passwd` |
| 8 | Lệnh quản trị (thường cần root) | `man 8 useradd` |

Quên tên lệnh thì tìm theo từ khoá trong phần mô tả: `apropos "từ khoá"` (giống `man -k`).

### type: lệnh này là gì

Một số lệnh như `cd`, `echo` nằm sẵn trong bash (**builtin**), không có trang man riêng; tra bằng `help cd`. Hỏi bash xem một lệnh là loại gì:

```bash
type cd ls ll
```

```text
cd is a shell builtin
ls is aliased to `ls --color=auto'
ll is aliased to `ls -alF'
```

| Kết quả | Ý nghĩa |
|---|---|
| `shell builtin` | Lệnh nằm sẵn trong bash. Tra bằng `help` |
| `aliased to` | Tên tắt (alias) của lệnh khác. Trên Ubuntu, `ls` thật ra là `ls --color=auto` (để có màu), `ll` là `ls -alF` |

Muốn thấy file chương trình thật đằng sau, dùng `type -a ls`: dòng thứ hai là `ls is /usr/bin/ls`. Lệnh có file riêng thì tra bằng `man`.

### Lịch sử lệnh

Bash nhớ các lệnh bạn đã gõ (lưu ở file `~/.bash_history` khi thoát).

| Cách | Làm gì |
|---|---|
| `history` | In danh sách lệnh đã gõ, có số thứ tự |
| `!123` | Chạy lại lệnh số 123 trong `history` |
| `!!` | Chạy lại lệnh vừa gõ. Hay dùng `sudo !!` khi quên `sudo` |

### Nối nhiều lệnh trên một dòng

| Ký hiệu | Ý nghĩa | Ví dụ |
|---|---|---|
| `;` | Chạy lần lượt, không quan tâm lệnh trước thành công hay lỗi | `cd /tmp; ls` |
| `&&` | Chỉ chạy lệnh sau nếu lệnh trước **thành công** | `mkdir web && cd web` |
| <code>&#124;&#124;</code> | Chỉ chạy lệnh sau nếu lệnh trước **lỗi** | <code>ls /khongco &#124;&#124; echo "không có"</code> |

Mỗi lệnh khi kết thúc trả về một **mã thoát**: `0` là thành công, khác `0` là lỗi. Xem mã của lệnh vừa chạy bằng `echo $?`. Ví dụ `ls -z` trả về `2`, lệnh không tồn tại trả về `127`.

### Dấu nháy

Shell coi dấu cách là ranh giới giữa các phần của lệnh. Muốn một đối số có dấu cách thì bọc trong nháy:

| Cách viết | Kết quả |
|---|---|
| `touch bao cao.txt` | Tạo **hai** file `bao` và `cao.txt` |
| `touch "bao cao.txt"` | Tạo một file tên `bao cao.txt` |
| `echo "Nhà: $HOME"` | Nháy kép vẫn thay biến: `Nhà: /home/hocvien` |
| `echo 'Nhà: $HOME'` | Nháy đơn giữ nguyên mọi thứ: `Nhà: $HOME` |

## Thực hành

1. Dùng `man ls` tìm tuỳ chọn sắp xếp file theo thời gian sửa, và tuỳ chọn đảo ngược thứ tự.

   <details>
   <summary>Xem đáp án</summary>

   Trong `man ls`, gõ `/time` rồi `Enter`, bấm `n` để tìm tiếp. `-t` sắp theo thời gian sửa, mới nhất lên đầu. `-r` đảo ngược. Ghép lại `ls -ltr` cho file mới sửa nằm **cuối** danh sách.

   </details>

2. Tách ba phần của lệnh `cp -r anh/ sao-luu/`.

   <details>
   <summary>Xem đáp án</summary>

   Lệnh `cp` (chép), tuỳ chọn `-r` (chép cả thư mục), đối số `anh/` (nguồn) và `sao-luu/` (đích).

   </details>

3. Chạy `ping localhost`, để vài giây rồi dừng nó. Sau đó bấm `↑` để lấy lại lệnh mà không gõ lại.

   <details>
   <summary>Xem đáp án</summary>

   Bấm `Ctrl+C` để dừng. Bấm `↑` một lần thấy lại `ping localhost`.

   </details>

4. Gõ `cd /us`, bấm `Tab`, rồi gõ `sh` và bấm `Tab` thêm lần nữa. Kết quả là gì?

   <details>
   <summary>Xem đáp án</summary>

   `Tab` lần đầu điền thành `cd /usr/`. Gõ tiếp `sh` rồi `Tab` thành `cd /usr/share/`. Bấm `Enter` để đi tới đó.

   </details>

5. Gõ `cd /khongco && echo "tới rồi"`. Vì sao không in "tới rồi"? `echo $?` ra bao nhiêu?

   <details>
   <summary>Xem đáp án</summary>

   `cd /khongco` lỗi vì thư mục không tồn tại. `&&` chỉ chạy lệnh sau khi lệnh trước thành công, nên `echo` bị bỏ qua. Mã thoát là `1`.

   </details>

## Tóm tắt

| Việc | Cách |
|---|---|
| Mở / đóng terminal | `Ctrl+Alt+T` / `exit` hoặc `Ctrl+D` |
| Cú pháp | `lệnh [tuỳ chọn] [đối số]` |
| Đọc tài liệu | `man lệnh`, thoát bằng `q` |
| Xem nhanh cách dùng | `lệnh --help` |
| Dừng lệnh đang chạy | `Ctrl+C` |
| Tự điền tên | `Tab` |
| Tìm lệnh đã gõ | `↑`, `Ctrl+R`, `history` |
