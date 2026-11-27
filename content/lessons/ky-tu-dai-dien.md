---
summary: Dùng *, ?, [ ] để chọn nhiều file theo mẫu tên, và { } để sinh ra nhiều tên cùng lúc. Hiểu shell bung các ký tự này trước khi chạy lệnh, để tránh xoá nhầm.
minutes: 25
commands: ["*", "?", "[ ]", "{ }"]
quiz:
  - q: "Thư mục có `bao-cao-1.txt`, `bao-cao-2.txt`, `bao-cao-10.txt`. `ls bao-cao-?.txt` in ra gì?"
    options: ["Cả 3 file", "bao-cao-1.txt và bao-cao-2.txt", "Chỉ bao-cao-10.txt", "Không file nào"]
    answer: 1
    explain: "`?` khớp đúng **một** ký tự. `10` có hai ký tự nên `bao-cao-10.txt` không khớp."
  - q: "`data_[!a].csv` khớp với file nào?"
    options: ["data_a.csv", "data_b.csv và data_c.csv", "Mọi file .csv", "Không file nào"]
    answer: 1
    explain: "`[!a]` (hoặc `[^a]`) khớp một ký tự **bất kỳ trừ** `a`."
  - q: "Vì sao `ls *` không liệt kê file `.bashrc`?"
    options: ["Vì .bashrc bị khoá", "Vì * không khớp với tên bắt đầu bằng dấu chấm", "Vì ls không đọc được file ẩn", "Vì .bashrc nằm ở thư mục khác"]
    answer: 1
    explain: "Mặc định `*` bỏ qua tên bắt đầu bằng `.` (file ẩn). Muốn chọn file ẩn, viết rõ `.*` hoặc dùng `ls -a`."
  - q: "`echo file{01..03}.log` in ra gì?"
    options: ["file{01..03}.log", "file01.log file02.log file03.log", "file1.log file2.log file3.log", "Báo lỗi vì không có file"]
    answer: 1
    explain: "Dấu `{ }` không cần file có sẵn. Shell sinh ra mọi tên theo mẫu. `01..03` giữ số 0 ở đầu."
  - q: "`ls *.pdf` khi thư mục không có file pdf nào thì sao?"
    options: ["In ra danh sách rỗng, không báo gì", "Báo cannot access '*.pdf': No such file or directory", "Liệt kê mọi file", "Xoá các file khác"]
    answer: 1
    explain: Khi không có file nào khớp, bash để nguyên chữ `*.pdf` và truyền cho `ls`. `ls` đi tìm file có tên đúng là `*.pdf`, không thấy nên báo lỗi.
---

## Ký tự đại diện là gì

Muốn xoá mọi file `.log`, chép mọi ảnh `.jpg`, không ai gõ từng tên một. Bạn viết một **mẫu** (pattern), shell tự tìm các file có tên khớp mẫu.

Điều quan trọng nhất: **shell bung mẫu thành danh sách tên trước, rồi mới chạy lệnh**. Lệnh `ls` hay `rm` không hề thấy dấu `*`, nó chỉ nhận danh sách tên đã bung. Việc này gọi là *globbing*.

Thấy rõ bằng `echo`:

```bash
cd ~/glob
echo *
```

```text
Anh3.jpg anh1.jpg anh2.png bao-cao-1.txt bao-cao-10.txt bao-cao-2.txt data_a.csv data_b.csv data_c.csv ghi-chu.md
```

`echo` chỉ in lại những gì nó nhận. Nó in ra tên file, nghĩa là shell đã thay `*` bằng danh sách file trước khi gọi `echo`.

Tạo thư mục thực hành để làm theo:

```bash
mkdir -p ~/glob && cd ~/glob
touch bao-cao-1.txt bao-cao-2.txt bao-cao-10.txt anh1.jpg anh2.png Anh3.jpg ghi-chu.md .an.txt data_a.csv data_b.csv data_c.csv
```

## Bảng ký tự đại diện

| Mẫu | Khớp với | Ví dụ | Khớp |
|---|---|---|---|
| `*` | Chuỗi ký tự bất kỳ, kể cả rỗng | `*.txt` | `bao-cao-1.txt`, `bao-cao-10.txt`, `bao-cao-2.txt` |
| `?` | Đúng **một** ký tự bất kỳ | `bao-cao-?.txt` | `bao-cao-1.txt`, `bao-cao-2.txt` |
| `??` | Đúng hai ký tự | `bao-cao-??.txt` | `bao-cao-10.txt` |
| `[abc]` | Một ký tự trong danh sách | `[aA]nh*` | `Anh3.jpg`, `anh1.jpg`, `anh2.png` |
| `[a-c]` | Một ký tự trong khoảng | `data_[a-c].csv` | `data_a.csv`, `data_b.csv`, `data_c.csv` |
| `[!a]` hoặc `[^a]` | Một ký tự **không** nằm trong danh sách | `data_[!a].csv` | `data_b.csv`, `data_c.csv` |
| `[[:digit:]]` | Một chữ số (tương tự `[0-9]`) | `x[[:digit:]]` | `x1`, `x2` (không khớp `xa`) |

Một số lớp ký tự khác: `[[:alpha:]]` chữ cái, `[[:upper:]]` chữ hoa, `[[:lower:]]` chữ thường, `[[:space:]]` khoảng trắng.

### Ví dụ chạy thật

```bash
ls bao-cao-?.txt
ls data_[!a].csv
```

```text
bao-cao-1.txt
bao-cao-2.txt
data_b.csv
data_c.csv
```

## File ẩn không khớp với *

```bash
ls *
echo .*
```

`ls *` không có `.an.txt`. Muốn chọn file ẩn phải viết rõ dấu chấm:

```text
.an.txt
```

Nhờ vậy `rm *` không xoá nhầm các file cấu hình ẩn như `.bashrc`. Nhưng cũng vì vậy mà `cp * backup/` **bỏ sót** file ẩn. Muốn chép đủ cả thư mục, dùng `cp -a thư-mục/. backup/`.

## Khi không có file nào khớp

```bash
ls *.pdf
echo *.pdf
```

```text
ls: cannot access '*.pdf': No such file or directory
*.pdf
```

Bash giữ nguyên chữ `*.pdf` khi không tìm được file khớp. `ls` nhận đúng chữ `*.pdf`, đi tìm file có tên như vậy, không thấy nên báo lỗi.

## Dấu { }: sinh ra nhiều tên

`{ }` trông giống ký tự đại diện nhưng khác hẳn: nó **không tìm file**, mà **sinh chuỗi** theo mẫu, kể cả khi file chưa tồn tại. Vì vậy dùng được với `mkdir`, `touch` để tạo hàng loạt.

| Mẫu | Bung thành |
|---|---|
| `{jpg,png}` | `jpg png` |
| `anh.{jpg,png}` | `anh.jpg anh.png` |
| `{1..5}` | `1 2 3 4 5` |
| `file{01..03}.log` | `file01.log file02.log file03.log` |
| `{a..e}` | `a b c d e` |

```bash
echo file{01..03}.log
mkdir -p thang{01..03}
ls -d thang*
```

```text
file01.log file02.log file03.log
thang01
thang02
thang03
```

Mẹo sao lưu nhanh: `cp nginx.conf{,.bak}` bung thành `cp nginx.conf nginx.conf.bak`.

Kết hợp với `*`: `ls *.{jpg,png}` liệt kê mọi ảnh jpg và png.

## Tắt ký tự đại diện bằng dấu nháy

Trong dấu nháy (đơn hoặc kép) hoặc sau dấu `\`, shell không bung `*`, `?`, `[ ]`:

```bash
echo "*.txt"
echo \*.txt
```

```text
*.txt
*.txt
```

Điều này quan trọng khi truyền mẫu cho lệnh **tự xử lý mẫu**, như `find -name "*.log"` (bài [Tìm file](/bai/tim-kiem-file)). Nếu quên nháy, shell bung `*.log` theo file ở thư mục hiện tại trước, và `find` nhận sai đối số.

## Luôn xem trước khi xoá

Trước khi `rm` với ký tự đại diện, chạy `ls` (hoặc `echo`) với **đúng mẫu đó** để xem sẽ xoá những gì:

```bash
ls data_*.csv
rm -v data_*.csv
```

```text
data_a.csv  data_b.csv  data_c.csv
removed 'data_a.csv'
removed 'data_b.csv'
removed 'data_c.csv'
```

Lỗi kinh điển: định gõ `rm *.log` nhưng gõ thành `rm * .log` (thừa dấu cách). Dấu `*` đứng riêng khớp **mọi file**.

## Thực hành

Làm trong thư mục `~/glob` đã tạo ở trên.

1. Liệt kê mọi file có đuôi `.jpg`, cả viết hoa lẫn viết thường ở chữ đầu.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ls *.jpg
   ```

   Kết quả `Anh3.jpg anh1.jpg`. `*` khớp được cả chữ hoa lẫn thường ở đầu tên, chỉ phần đuôi `.jpg` phải đúng.

   </details>

2. Liệt kê các file `bao-cao-*.txt` có số **một chữ số**, chỉ dùng `[ ]`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ls bao-cao-[0-9].txt
   ```

   </details>

3. Tạo 12 thư mục `thang01` đến `thang12` trong `~/glob/2026`, mỗi thư mục có file `bao-cao.txt`. Dùng hai lệnh.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   mkdir -p 2026/thang{01..12}
   touch 2026/thang{01..12}/bao-cao.txt
   ls 2026
   ```

   </details>

4. Dùng `echo` để xem trước lệnh `rm *.csv` sẽ xoá những file nào, mà không xoá thật.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   echo rm *.csv
   ```

   Shell bung `*.csv` rồi `echo` in ra cả câu lệnh. Đây là cách kiểm tra an toàn trước khi chạy lệnh thật.

   </details>

5. Chép file `ghi-chu.md` thành `ghi-chu.md.bak` bằng dấu `{ }`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   cp ghi-chu.md{,.bak}
   ls ghi-chu*
   ```

   </details>

## Tóm tắt

| Mẫu | Ý nghĩa |
|---|---|
| `*` | Chuỗi bất kỳ (không khớp file ẩn) |
| `?` | Đúng một ký tự |
| `[abc]`, `[a-z]` | Một ký tự trong danh sách / khoảng |
| `[!abc]` | Một ký tự không thuộc danh sách |
| `{a,b}`, `{1..5}` | Sinh nhiều chuỗi, không cần file có sẵn |
| `"*"`, `\*` | Tắt ký tự đại diện |
| `echo mẫu` | Xem trước mẫu bung ra những gì |
