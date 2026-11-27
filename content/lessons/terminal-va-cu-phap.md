---
summary: Đọc hiểu dấu nhắc lệnh, cấu trúc một câu lệnh (lệnh, tuỳ chọn, đối số), dấu nháy, biến đơn giản, lịch sử lệnh, phím tắt, và quan trọng nhất là cách tự tra cứu bằng --help và man.
minutes: 40
commands: [man, --help, help, type, which, whatis, apropos, history, echo, export, unset, env, clear]
quiz:
  - q: "Trong dấu nhắc `hocvien@lab:~$`, phần `~` nghĩa là gì?"
    options: ["Tên máy", "Bạn đang ở thư mục home của mình", "Bạn là root", "Lệnh trước bị lỗi"]
    answer: 1
    explain: "`~` là cách viết tắt của thư mục home, ở đây là `/home/hocvien`. Tên máy là `lab`, còn `$` cho biết bạn là user thường (root sẽ là `#`)."
  - q: "`ls -la` tương đương với lệnh nào?"
    options: ["ls -l a", "ls -l -a", "ls --la", "ls -l && ls -a"]
    answer: 1
    explain: Nhiều tuỳ chọn ngắn (một gạch, một chữ) có thể ghép chung sau một dấu gạch. `-la` là `-l` cộng `-a`. Tuỳ chọn dài (hai gạch) thì không ghép được.
  - q: "Kết quả của `NAME=Linux; echo 'Xin chào $NAME'` là gì?"
    options: ["Xin chào Linux", "Xin chào $NAME", "Xin chào", "Báo lỗi"]
    answer: 1
    explain: Trong dấu nháy đơn, shell giữ nguyên mọi ký tự, không thay biến. Muốn thay biến thì dùng nháy kép `"Xin chào $NAME"`.
  - q: Muốn đọc tài liệu về định dạng file /etc/passwd (không phải lệnh passwd) thì gõ gì?
    options: ["man passwd", "man 5 passwd", "passwd --help", "help passwd"]
    answer: 1
    explain: Trang man chia theo mục. Mục 1 là lệnh, mục 5 là định dạng file. `man passwd` mở mục 1 (lệnh đổi mật khẩu), còn `man 5 passwd` mở phần mô tả file `/etc/passwd`.
  - q: Biến tạo bằng `SO=5` có được chương trình con (ví dụ một script) nhìn thấy không?
    options: ["Có, luôn luôn", "Không, phải export SO thì chương trình con mới thấy", "Chỉ khi biến là số", "Chỉ khi chạy bằng sudo"]
    answer: 1
    explain: Biến thường chỉ sống trong shell hiện tại. `export` biến nó thành biến môi trường, truyền xuống mọi chương trình con mà shell chạy sau đó.
  - q: Phím tắt nào dừng ngay một lệnh đang chạy mãi không xong?
    options: ["Ctrl+D", "Ctrl+C", "Ctrl+L", "Ctrl+R"]
    answer: 1
    explain: Ctrl+C gửi tín hiệu ngắt, làm dừng lệnh đang chạy. Ctrl+D báo hết dữ liệu nhập (gõ ở dấu nhắc trống thì thoát shell), Ctrl+L xoá màn hình, Ctrl+R tìm trong lịch sử lệnh.
---

## Terminal, shell và dấu nhắc

Ba từ này hay bị dùng lẫn:

| Từ | Là gì |
|---|---|
| **Terminal** | Cửa sổ hiển thị chữ và nhận phím bạn gõ. Ví dụ: Windows Terminal, GNOME Terminal, iTerm2, cửa sổ `ssh` |
| **Shell** | Chương trình chạy bên trong terminal: đọc lệnh, chạy lệnh, in kết quả. Ubuntu dùng `bash` |
| **Console** | Màn hình gắn trực tiếp vào máy (không qua mạng). Ngày nay hay dùng như từ đồng nghĩa với terminal |

Khi shell sẵn sàng nhận lệnh, nó in ra **dấu nhắc** (prompt):

```text
hocvien@lab:~$
```

| Phần | Ý nghĩa |
|---|---|
| `hocvien` | User đang đăng nhập |
| `@lab` | Tên máy (hostname) |
| `:~` | Thư mục đang đứng. `~` là thư mục home của bạn (`/home/hocvien`). Đứng ở `/etc` thì sẽ hiện `:/etc` |
| `$` | Bạn là user thường. Nếu là **root** (quản trị), ký tự này là `#` |

> Trong các bài, dấu `$` màu xanh trước mỗi lệnh chỉ là dấu nhắc. Bạn **không gõ** dấu đó. Nút "Chép" chỉ chép phần lệnh.

## Cấu trúc một câu lệnh

```text
lệnh  [tuỳ chọn]  [đối số]
```

Ví dụ:

```bash
ls -l /etc
```

| Phần | Vai trò | Ý nghĩa trong ví dụ |
|---|---|---|
| `ls` | **Lệnh**: tên chương trình cần chạy | Liệt kê file |
| `-l` | **Tuỳ chọn** (option): thay đổi cách lệnh chạy, bắt đầu bằng `-` | Hiện dạng dài, mỗi file một dòng kèm quyền, chủ, dung lượng |
| `/etc` | **Đối số** (argument): thứ mà lệnh làm việc trên đó | Thư mục cần liệt kê |

Quy tắc về tuỳ chọn:

| Kiểu | Ví dụ | Ghi chú |
|---|---|---|
| Ngắn: một gạch, một chữ | `-l`, `-a`, `-h` | Ghép được: `-l -a -h` viết thành `-lah` |
| Dài: hai gạch, cả chữ | `--all`, `--human-readable` | Dễ đọc, hay dùng trong script. Không ghép được |
| Có giá trị đi kèm | `-n 5`, `--lines=5` | Giá trị đi sau tuỳ chọn |

Linux **phân biệt chữ hoa, chữ thường**: `ls` khác `LS`, `-r` khác `-R`, file `Bao-cao.txt` khác `bao-cao.txt`.

Gõ sai tuỳ chọn, lệnh sẽ báo:

```text
ls: invalid option -- 'z'
Try 'ls --help' for more information.
```

Gõ sai tên lệnh:

```text
bash: lss: command not found
```

## Tự tra cứu: phần quan trọng nhất

Không ai nhớ hết các tuỳ chọn. Người làm lâu năm cũng tra liên tục. Có 4 cách, dùng từ nhanh đến kỹ:

### --help: xem nhanh

```bash
ls --help
```

| Phần | Ý nghĩa |
|---|---|
| `ls` | Lệnh cần tra |
| `--help` | Hầu hết lệnh đều hiểu tuỳ chọn này: in tóm tắt cách dùng và danh sách tuỳ chọn rồi thoát |

```text
Usage: ls [OPTION]... [FILE]...
List information about the FILEs (the current directory by default).
...
```

Cách đọc dòng `Usage`: phần trong `[ ]` là **không bắt buộc**, `...` là **có thể lặp lại nhiều lần**. Vậy `ls [OPTION]... [FILE]...` nghĩa là có thể gõ `ls` trơn, hoặc kèm nhiều tuỳ chọn, nhiều file.

### man: tài liệu đầy đủ

```bash
man ls
```

`man` (**man**ual) mở tài liệu chính thức của lệnh. Trong trang man:

| Phím | Làm gì |
|---|---|
| `↑` `↓` hoặc `j` `k` | Cuộn từng dòng |
| `Space` / `b` | Xuống / lên một trang |
| `/từ-khoá` rồi `Enter` | Tìm từ khoá. `n` tới kết quả sau, `N` về kết quả trước |
| `g` / `G` | Về đầu / xuống cuối |
| `q` | Thoát |

Trang man chia làm các **mục** (section). Ba mục hay dùng:

| Mục | Chứa gì | Ví dụ |
|---|---|---|
| 1 | Lệnh cho mọi user | `man 1 passwd`: lệnh đổi mật khẩu |
| 5 | Định dạng file cấu hình | `man 5 passwd`: cấu trúc file `/etc/passwd` |
| 8 | Lệnh quản trị (thường cần root) | `man 8 useradd` |

Một tên có thể có ở nhiều mục. Xem bằng `whatis`:

```bash
whatis passwd
```

```text
passwd (1)           - change user password
passwd (1ssl)        - OpenSSL application commands
passwd (5)           - the password file
```

### apropos / man -k: quên tên lệnh

Biết việc cần làm nhưng không nhớ tên lệnh, thì tìm theo từ khoá trong phần mô tả:

```bash
apropos -s 1 "list directory"
```

| Phần | Ý nghĩa |
|---|---|
| `apropos` | Tìm trang man có mô tả chứa từ khoá (giống `man -k`) |
| `-s 1` | Chỉ tìm trong mục 1 (lệnh) |
| `"list directory"` | Từ khoá. Có dấu cách nên phải đặt trong nháy |

```text
dir (1)              - list directory contents
ls (1)               - list directory contents
vdir (1)             - list directory contents
```

### help: lệnh có sẵn trong shell

Một số lệnh như `cd`, `echo`, `export`, `history` là **lệnh nội bộ** (builtin) của bash, không phải file chương trình riêng. Tra bằng `help`:

```bash
help cd
```

Kiểm tra một lệnh là loại gì bằng `type`:

```bash
type cd ls ll
```

```text
cd is a shell builtin
ls is /usr/bin/ls
ll is aliased to `ls -alF'
```

| Kết quả | Ý nghĩa |
|---|---|
| `shell builtin` | Lệnh nằm sẵn trong bash. Tra bằng `help cd` |
| `is /usr/bin/ls` | Chương trình là file `/usr/bin/ls`. Tra bằng `man ls` |
| `aliased to` | Tên tắt (alias) của một lệnh khác. `ll` là `ls -alF` |

`which ls` cũng in đường dẫn file chương trình (`/usr/bin/ls`), nhưng không biết về builtin và alias. Vì vậy `type` cho nhiều thông tin hơn.

## Dấu nháy và ký tự đặc biệt

Shell coi dấu cách là ranh giới giữa các phần của lệnh. Một số ký tự như `$ * ? ; & | > <` cũng có nghĩa đặc biệt. Muốn dùng chúng như chữ thường thì phải bọc trong nháy:

| Cách viết | Shell làm gì | Ví dụ → kết quả |
|---|---|---|
| `"..."` nháy kép | Giữ dấu cách, **vẫn thay biến** `$...` và lệnh `$(...)` | `echo "Xin chào $NAME"` → `Xin chào Linux` |
| `'...'` nháy đơn | Giữ nguyên **tất cả**, không thay gì | `echo 'Xin chào $NAME'` → `Xin chào $NAME` |
| `\` gạch ngược | Bỏ nghĩa đặc biệt của **một** ký tự ngay sau nó | `echo Gia\ \$5` → `Gia $5` |
| `$(lệnh)` | Chạy lệnh bên trong, thay bằng kết quả | `echo "Hôm nay: $(date +%A)"` → `Hôm nay: Friday` |

Ví dụ hay gặp: tạo file có dấu cách trong tên, `touch bao cao.txt` sẽ tạo **hai** file `bao` và `cao.txt`. Phải viết `touch "bao cao.txt"`.

## Biến trong shell

```bash
NAME=Linux
echo $NAME
echo "Tôi học ${NAME}101"
```

| Phần | Ý nghĩa |
|---|---|
| `NAME=Linux` | Gán giá trị cho biến. **Không có dấu cách** quanh `=` (viết `NAME = Linux` là sai) |
| `$NAME` | Lấy giá trị biến |
| `${NAME}101` | Ngoặc nhọn tách tên biến khỏi chữ phía sau. Thiếu ngoặc, shell sẽ tìm biến tên `NAME101` |

Biến thường chỉ sống trong shell hiện tại. Muốn chương trình con (script, lệnh khác) thấy được thì `export`:

```bash
SO=5
bash -c 'echo "con thấy: [$SO]"'
export SO
bash -c 'echo "con thấy: [$SO]"'
unset SO
```

```text
con thấy: []
con thấy: [5]
```

| Lệnh | Ý nghĩa |
|---|---|
| `bash -c '...'` | Chạy một shell con thực hiện đoạn lệnh trong nháy |
| `export SO` | Đưa biến vào **môi trường**, để mọi chương trình con nhận được |
| `unset SO` | Xoá biến |
| `env` | Liệt kê các biến môi trường đang có |
| `set` | Liệt kê tất cả biến của shell (cả biến thường lẫn biến môi trường) và các hàm |

Một số biến môi trường có sẵn: `HOME` (thư mục home), `USER` (tên user), `PATH` (nơi shell tìm chương trình), `SHELL`, `PWD` (thư mục hiện tại). Biến môi trường được học kỹ hơn ở bài [Môi trường shell](/bai/moi-truong-shell).

## Nối nhiều lệnh trên một dòng

| Ký hiệu | Ý nghĩa | Ví dụ |
|---|---|---|
| `;` | Chạy lần lượt, không quan tâm lệnh trước thành công hay lỗi | `cd /tmp; ls` |
| `&&` | Chỉ chạy lệnh sau nếu lệnh trước **thành công** | `mkdir web && cd web` |
| <code>&#124;&#124;</code> | Chỉ chạy lệnh sau nếu lệnh trước **lỗi** | <code>ls /khongco &#124;&#124; echo "không có"</code> |

Mỗi lệnh khi kết thúc trả về một **mã thoát** (exit code): `0` là thành công, khác `0` là lỗi. Xem mã của lệnh vừa chạy bằng `echo $?`. Ví dụ `ls -z` trả về `2`, gõ lệnh không tồn tại trả về `127`.

## Lịch sử lệnh và phím tắt

Bash nhớ các lệnh bạn đã gõ. Khi thoát shell, lịch sử được lưu vào file `~/.bash_history`.

| Cách | Làm gì |
|---|---|
| `↑` / `↓` | Lấy lại lệnh trước / sau |
| `history` | In danh sách lệnh đã gõ, có số thứ tự |
| `!123` | Chạy lại lệnh số 123 trong `history` |
| `!!` | Chạy lại lệnh vừa gõ. Hay dùng: `sudo !!` khi quên `sudo` |
| `Ctrl+R` rồi gõ chữ | Tìm ngược trong lịch sử. Bấm `Ctrl+R` tiếp để xem kết quả cũ hơn, `Enter` để chạy |

Phím tắt nên thuộc ngay:

| Phím | Làm gì |
|---|---|
| `Tab` | Tự điền tên lệnh, tên file. Bấm 2 lần để xem các khả năng. **Dùng liên tục**, vừa nhanh vừa tránh gõ sai |
| `Ctrl+C` | Dừng lệnh đang chạy |
| `Ctrl+D` | Báo hết dữ liệu nhập. Ở dấu nhắc trống thì thoát shell (giống `exit`) |
| `Ctrl+L` | Xoá màn hình (giống lệnh `clear`) |
| `Ctrl+A` / `Ctrl+E` | Đưa con trỏ về đầu / cuối dòng |
| `Ctrl+U` | Xoá từ con trỏ về đầu dòng |
| `Ctrl+W` | Xoá một từ phía trước con trỏ |

## Thực hành

1. Tra xem tuỳ chọn nào của `ls` sắp xếp file theo thời gian sửa đổi, và tuỳ chọn nào đảo ngược thứ tự. Dùng cả `--help` lẫn `man`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ls --help | grep -i time
   man ls
   ```

   Trong `man ls`, gõ `/-t` rồi `Enter` để tìm. Đáp án: `-t` sắp theo thời gian sửa, mới nhất lên đầu. `-r` đảo ngược. Ghép lại `ls -ltr` liệt kê dạng dài, file mới sửa nằm **cuối** danh sách. Kiểu này hay dùng để xem file log mới nhất.

   </details>

2. Cho biết `echo`, `pwd`, `cat`, `ll` là builtin, file hay alias.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   type echo pwd cat ll
   ```

   `echo` và `pwd` là builtin (`pwd` còn có bản file `/usr/bin/pwd`, xem bằng `type -a pwd`). `cat` là file `/usr/bin/cat`. `ll` là alias của `ls -alF`.

   </details>

3. Đoán trước kết quả rồi chạy thử:

   ```bash
   TEN=hocvien
   echo "Xin chào $TEN"
   echo 'Xin chào $TEN'
   echo "Thư mục home: $HOME, hôm nay là $(date +%d/%m/%Y)"
   ```

4. Tìm bằng `apropos` lệnh để "change file owner" (đổi chủ sở hữu file).

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   apropos "file owner"
   ```

   Kết quả có `chown (1) - change file owner and group`. Lệnh này học ở bài Phân quyền.

   </details>

5. Gõ `mkdir thu && cd thu && pwd`, sau đó gõ `cd /khongco && echo "tới rồi"`. Vì sao lần hai không in "tới rồi"? Mã thoát (`echo $?`) là bao nhiêu?

   <details>
   <summary>Xem đáp án</summary>

   `cd /khongco` lỗi vì thư mục không tồn tại. `&&` chỉ chạy lệnh sau khi lệnh trước thành công, nên `echo` bị bỏ qua. Mã thoát là `1`.

   </details>

## Tóm tắt

| Việc | Cách |
|---|---|
| Xem nhanh cách dùng lệnh | `lệnh --help` |
| Đọc tài liệu đầy đủ | `man lệnh`, `man 5 tên-file` |
| Quên tên lệnh | `apropos "từ khoá"` |
| Tra lệnh builtin | `help lệnh` |
| Lệnh là gì, ở đâu | `type lệnh` |
| Giữ nguyên chuỗi / vẫn thay biến | `'...'` / `"..."` |
| Tạo, xem, export, xoá biến | `X=1`, `echo $X`, `export X`, `unset X` |
| Lịch sử lệnh | `history`, `Ctrl+R`, `!!` |
