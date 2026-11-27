---
summary: Tìm file theo tên, loại, dung lượng, thời gian sửa, chủ sở hữu bằng find, rồi xử lý hàng loạt kết quả (-exec, -delete). Tìm nhanh trong cơ sở dữ liệu bằng locate. Tìm chương trình nằm đâu bằng which, whereis, type.
minutes: 40
commands: [find, locate, updatedb, which, whereis, type]
quiz:
  - q: "Vì sao nên viết `find . -name \"*.log\"` (có nháy) thay vì `find . -name *.log`?"
    options: ["Cho đẹp", "Để shell không bung *.log theo file ở thư mục hiện tại trước khi find chạy", "Vì find không hiểu dấu *", "Để tìm nhanh hơn"]
    answer: 1
    explain: "Không có nháy, shell bung `*.log` thành tên các file `.log` trong thư mục hiện tại, và `find` nhận sai đối số. Có nháy thì `find` nhận nguyên mẫu `*.log` và tự so khớp ở mọi cấp thư mục."
  - q: Tìm các file lớn hơn 100 MB trong /var dùng lệnh nào?
    options: ["find /var -size 100M", "find /var -size +100M", "find /var -big 100M", "locate -size +100M /var"]
    answer: 1
    explain: "`+100M` là lớn hơn 100 MB, `-100M` là nhỏ hơn, không có dấu là đúng bằng. Đơn vị: `k`, `M`, `G`."
  - q: "`find logs -mtime +7` tìm gì?"
    options: ["File sửa trong 7 ngày qua", "File sửa cách đây hơn 7 ngày", "File lớn hơn 7 KB", "7 file đầu tiên"]
    answer: 1
    explain: "`-mtime` tính theo ngày từ lần sửa cuối. `+7` là hơn 7 ngày trước (file cũ), `-1` là trong vòng 1 ngày qua (file mới)."
  - q: "`locate nginx.conf` không ra kết quả, dù file vừa được tạo. Vì sao?"
    options: ["locate chỉ tìm thư mục", "Cơ sở dữ liệu của locate chưa được cập nhật, phải chạy sudo updatedb", "File bị ẩn", "locate phân biệt chữ hoa"]
    answer: 1
    explain: "`locate` không quét ổ đĩa mà tra một cơ sở dữ liệu, thường được cập nhật mỗi ngày một lần. File mới tạo chưa có trong đó cho đến khi chạy `sudo updatedb`."
  - q: "Trong `find . -name \"*.tmp\" -exec rm {} \\;`, phần `{}` là gì?"
    options: ["Một thư mục rỗng", "Chỗ find điền đường dẫn từng file tìm được", "Ký tự đại diện như *", "Mã lỗi"]
    answer: 1
    explain: "`{}` được thay bằng đường dẫn của từng file tìm thấy. `\\;` kết thúc lệnh `-exec`, dấu `\\` để shell không hiểu `;` là dấu ngăn lệnh."
  - q: Muốn biết gõ `python3` thì chương trình ở đường dẫn nào được chạy, dùng lệnh nào?
    options: ["find python3", "which python3", "locate -run python3", "file python3"]
    answer: 1
    explain: "`which` tìm trong các thư mục của biến `PATH` và in đường dẫn chương trình sẽ được chạy. `type` còn cho biết thêm nếu đó là alias hay builtin."
---

## find: tìm theo mọi tiêu chí

`find` đi qua từng thư mục, kiểm tra từng file theo điều kiện bạn đặt. Chậm hơn `locate` nhưng luôn chính xác và tìm được theo mọi thuộc tính.

Cấu trúc:

```text
find  [nơi bắt đầu]  [điều kiện...]  [hành động]
```

Tạo dữ liệu thử:

```bash
cd ~
mkdir -p web/{css,js,img} logs
touch web/index.html web/css/style.css web/js/app.js web/img/logo.png logs/app.log logs/Error.LOG
head -c 2M /dev/urandom > logs/big.log
touch -d "10 days ago" logs/app.log
```

| Lệnh | Tạo ra |
|---|---|
| `head -c 2M /dev/urandom > logs/big.log` | File 2 MB chứa byte ngẫu nhiên (`/dev/urandom` là nguồn số ngẫu nhiên vô tận) |
| `touch -d "10 days ago" logs/app.log` | Đặt thời gian sửa của `app.log` lùi về 10 ngày trước |

### Theo tên: -name, -iname

```bash
find ~ -name "*.log"
find ~ -iname "*.log"
```

| Phần | Ý nghĩa |
|---|---|
| `find` | Lệnh tìm |
| `~` | Bắt đầu tìm từ thư mục home, đi vào mọi thư mục con |
| `-name "*.log"` | Tên khớp mẫu `*.log`, **phân biệt** hoa thường. Luôn để mẫu trong nháy |
| `-iname` | Như `-name` nhưng **không phân biệt** hoa thường (**i**gnore case) |

```text
/home/hocvien/logs/app.log
/home/hocvien/logs/big.log
```

Với `-iname`, kết quả có thêm `Error.LOG`.

### Theo loại: -type

```bash
find web -type d
find . -type f -name "*.css"
```

| Giá trị | Loại |
|---|---|
| `-type f` | File thường (**f**ile) |
| `-type d` | Thư mục (**d**irectory) |
| `-type l` | Liên kết tượng trưng (**l**ink) |

```text
web
web/img
web/js
web/css
./web/css/style.css
```

### Theo dung lượng: -size

```bash
find ~ -type f -size +1M
```

| Phần | Ý nghĩa |
|---|---|
| `-size +1M` | Lớn hơn 1 MB. `-1M` là nhỏ hơn. Đơn vị `k` (KB), `M` (MB), `G` (GB) |

```text
/home/hocvien/logs/big.log
```

Lệnh hay dùng khi ổ đầy: `sudo find / -type f -size +500M 2>/dev/null` để tìm các file lớn hơn 500 MB.

### Theo thời gian sửa: -mtime, -mmin

```bash
find logs -type f -mtime +7
find logs -type f -mtime -1
```

| Điều kiện | Ý nghĩa |
|---|---|
| `-mtime +7` | Sửa lần cuối **hơn** 7 ngày trước (file cũ) |
| `-mtime -1` | Sửa trong vòng 1 ngày qua (file mới) |
| `-mmin -30` | Sửa trong vòng 30 phút qua |

```text
logs/app.log
logs/Error.LOG
logs/big.log
```

Dòng đầu là kết quả của `-mtime +7` (chỉ `app.log`, file đã bị lùi ngày). Hai dòng sau là kết quả của `-mtime -1`.

### Theo chủ sở hữu, quyền, độ sâu

| Điều kiện | Ý nghĩa |
|---|---|
| `-user hocvien` | File thuộc user `hocvien` |
| `-group www-data` | File thuộc nhóm `www-data` |
| `-perm -4000` | File có bit SUID (học ở bài [Quyền đặc biệt](/bai/quyen-dac-biet)) |
| `-empty` | File hoặc thư mục rỗng |
| `-maxdepth 1` | Chỉ tìm ở cấp đầu tiên, không đi sâu vào thư mục con. Đặt ngay sau nơi bắt đầu |

```bash
find / -maxdepth 1 -type l
```

```text
/lib
/lib64
/sbin
/bin
```

### Kết hợp điều kiện

Nhiều điều kiện viết liền nhau nghĩa là **và**. Muốn **hoặc** thì dùng `-o`, phủ định dùng `!`:

```bash
find web \( -name "*.css" -o -name "*.js" \)
find web -type f ! -name "*.png"
```

| Phần | Ý nghĩa |
|---|---|
| `\( ... \)` | Nhóm điều kiện. Dấu `\` để shell không hiểu ngoặc theo nghĩa riêng của nó |
| `-o` | Hoặc (**o**r) |
| `!` | Phủ định: tên **không** khớp `*.png` |

### Ẩn lỗi "Permission denied"

Tìm từ `/` bằng user thường sẽ gặp nhiều thư mục không có quyền đọc:

```text
find: '/root': Permission denied
```

Có hai cách: chạy bằng `sudo`, hoặc vứt thông báo lỗi đi bằng `2>/dev/null`:

```bash
find / -name "ssh_config" 2>/dev/null
```

```text
/etc/ssh/ssh_config
```

| Phần | Ý nghĩa |
|---|---|
| `2>` | Chuyển hướng luồng **lỗi** (luồng số 2) |
| `/dev/null` | "Thùng rác" của Linux: ghi gì vào cũng biến mất |

Luồng lỗi và chuyển hướng được học kỹ ở [bài 13](/bai/chuyen-huong-va-pipe).

### Hành động với kết quả: -exec, -delete

Mặc định `find` chỉ in đường dẫn. Thêm hành động để xử lý hàng loạt:

```bash
find logs -name "*.log" -exec ls -lh {} \;
```

| Phần | Ý nghĩa |
|---|---|
| `-exec` | Chạy một lệnh với mỗi file tìm được |
| `ls -lh` | Lệnh cần chạy |
| `{}` | Chỗ `find` điền đường dẫn từng file |
| `\;` | Kết thúc lệnh `-exec`. Chạy lệnh **một lần cho mỗi file** |

```text
-rw-r--r-- 1 hocvien hocvien 0 Nov 17 15:05 logs/app.log
-rw-r--r-- 1 hocvien hocvien 2.0M Nov 27 15:05 logs/big.log
```

| Cách kết thúc | Khác nhau |
|---|---|
| `-exec lệnh {} \;` | Chạy lệnh N lần, mỗi lần một file |
| `-exec lệnh {} +` | Gom nhiều file vào **một** lần chạy (nhanh hơn nhiều khi có hàng nghìn file) |

`-delete` xoá các file tìm được. Ví dụ xoá log cũ hơn 30 ngày (cách dọn log thủ công rất hay gặp):

```bash
find /var/log/myapp -name "*.log" -mtime +30 -delete
```

> **Luôn chạy thử không có `-delete` trước** để xem danh sách sẽ bị xoá. Và đặt `-delete` ở **cuối** lệnh. Đặt nó trước điều kiện, `find` sẽ xoá mọi thứ nó đi qua.

## locate: tìm tên thật nhanh

`locate` không quét ổ đĩa. Nó tra một cơ sở dữ liệu chứa tên mọi file, nên trả kết quả gần như tức thì. Đổi lại, cơ sở dữ liệu chỉ được cập nhật định kỳ (thường mỗi ngày), nên file mới tạo chưa có.

```bash
sudo updatedb
locate style.css
locate -i "STYLE.CSS"
locate -c bash
```

| Phần | Ý nghĩa |
|---|---|
| `sudo updatedb` | Cập nhật cơ sở dữ liệu ngay (cần root để đọc mọi thư mục) |
| `locate style.css` | In mọi đường dẫn **chứa** chuỗi `style.css` |
| `-i` | Không phân biệt hoa thường |
| `-c` | Chỉ đếm số kết quả (**c**ount) |

```text
/home/hocvien/web/css/style.css
/home/hocvien/web/css/style.css
931
```

Trên Ubuntu, `locate` đến từ gói `plocate` (cài bằng `sudo apt install plocate`).

| | `find` | `locate` |
|---|---|---|
| Tốc độ | Chậm (quét ổ đĩa) | Rất nhanh (tra cơ sở dữ liệu) |
| Thấy file mới tạo | Có | Không, phải `updatedb` trước |
| Tìm theo | Mọi thứ: tên, loại, dung lượng, thời gian, quyền… | Chỉ tên |
| Xử lý kết quả | Có (`-exec`, `-delete`) | Không |

## which, whereis, type: chương trình nằm đâu

```bash
which bash ls
whereis passwd
type -a ls
```

| Lệnh | Làm gì |
|---|---|
| `which bash` | Tìm trong các thư mục của biến `PATH`, in đường dẫn chương trình **sẽ được chạy** khi gõ `bash` |
| `whereis passwd` | In vị trí chương trình, trang man và file liên quan |
| `type -a ls` | In **mọi** nơi có `ls` theo thứ tự shell tìm, kể cả alias và builtin |

```text
/usr/bin/bash
/usr/bin/ls
passwd: /usr/bin/passwd /etc/passwd /usr/share/man/man1/passwd.1.gz /usr/share/man/man1/passwd.1ssl.gz /usr/share/man/man5/passwd.5.gz
ls is /usr/bin/ls
ls is /bin/ls
```

`which` không in gì (và trả mã thoát 1) khi chương trình chưa được cài. Đây là cách nhanh để kiểm tra máy đã có một công cụ chưa: `which docker`.

## Thực hành

Dùng dữ liệu `~/web` và `~/logs` đã tạo ở trên.

1. Tìm mọi file `.png` và `.jpg` trong home, không phân biệt hoa thường.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   find ~ -type f \( -iname "*.png" -o -iname "*.jpg" \)
   ```

   </details>

2. Tìm các file **rỗng** trong `~/web` và in chi tiết (`ls -l`) của chúng bằng một lần gọi `ls`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   find ~/web -type f -empty -exec ls -l {} +
   ```

   Dấu `+` gom tất cả file vào một lần chạy `ls -l`.

   </details>

3. Tìm các file trong `/etc` có tên kết thúc bằng `.conf`, chỉ ở cấp đầu tiên, rồi đếm có bao nhiêu file.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   find /etc -maxdepth 1 -type f -name "*.conf"
   find /etc -maxdepth 1 -type f -name "*.conf" | wc -l
   ```

   </details>

4. Tìm file lớn hơn 1 MB ở **toàn máy**, không hiện lỗi Permission denied.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   find / -type f -size +1M 2>/dev/null
   ```

   Hoặc chạy bằng `sudo` để đọc được cả thư mục của root. Kết quả có cả `~/logs/big.log` và các file chương trình lớn trong `/usr`.

   </details>

5. Tạo file `~/moi-tao.txt`, thử `locate moi-tao.txt` (không ra), rồi làm cho nó ra.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   touch ~/moi-tao.txt
   locate moi-tao.txt
   sudo updatedb
   locate moi-tao.txt
   ```

   </details>

6. Kiểm tra máy đã có `curl`, `git`, `python3` chưa, chỉ bằng một lệnh.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   which curl git python3
   ```

   Chỉ in đường dẫn những chương trình đã cài. Trong container lab, `curl` và `python3` có, còn `git` không có.

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Tìm theo tên (không phân biệt hoa thường) | `find nơi -iname "mẫu"` |
| Chỉ file / chỉ thư mục | `-type f` / `-type d` |
| Lớn hơn 100 MB | `-size +100M` |
| Sửa hơn 7 ngày trước / trong 1 ngày qua | `-mtime +7` / `-mtime -1` |
| Chạy lệnh với kết quả | `-exec lệnh {} +` |
| Xoá kết quả (chạy thử trước!) | `-delete` ở cuối |
| Ẩn lỗi quyền | `2>/dev/null` |
| Tìm tên thật nhanh | `locate tên` (cập nhật: `sudo updatedb`) |
| Chương trình nằm đâu | `which`, `type -a`, `whereis` |
