---
summary: Dùng ? (đúng một ký tự) và * (chuỗi bất kỳ) để chọn nhiều file theo mẫu tên khi chép, chuyển, xoá. Hiểu shell bung mẫu trước khi chạy lệnh để không xoá nhầm.
minutes: 25
commands: ["*", "?", "[ ]", "{ }"]
quiz:
  - q: Thư mục có `file1.txt`, `file2.txt`, `file12.txt`. `ls file?.txt` in ra gì?
    options: ["Cả ba file", "file12.txt", "Không file nào", "file1.txt và file2.txt"]
    answer: 3
    explain: "`?` khớp đúng **một** ký tự. `12` có hai ký tự nên `file12.txt` không khớp."
  - q: Mẫu nào chọn được cả `bao-cao.doc` lẫn `bao-cao.docx`?
    options: ["*.doc", "*.doc*", "*.docx", "?.doc"]
    answer: 1
    explain: "`*.doc*` khớp mọi tên chứa `.doc` rồi tới gì cũng được (kể cả không có gì), nên bắt được cả `.doc` và `.docx`."
  - q: "`*` có khớp với chuỗi rỗng không? Ví dụ `file*.txt` có khớp `file.txt` không?"
    options: ["Có", "Không", "Chỉ khi có -r", "Chỉ với thư mục"]
    answer: 0
    explain: "`*` khớp chuỗi bất kỳ, **kể cả rỗng**, nên `file*.txt` khớp cả `file.txt`."
  - q: Vì sao `ls *` không liệt kê file `.bashrc`?
    options: ["Vì .bashrc bị khoá", "Vì .bashrc nằm ở thư mục khác", "Vì * không khớp tên bắt đầu bằng dấu chấm", "Vì ls không đọc được file ẩn"]
    answer: 2
    explain: "Mặc định `*` bỏ qua file ẩn. Muốn chọn file ẩn, viết rõ `.*`."
  - q: Có `file1.txt`, `file12.txt`, `fileab.log`, `file5a.docx`. `rm file??.*` xoá những file nào?
    options: ["Chỉ file12.txt", "file12.txt và fileab.log", "file12.txt, fileab.log và file5a.docx", "Cả bốn file"]
    answer: 2
    explain: "`??` là đúng hai ký tự: `12`, `ab`, `5a` đều khớp. `file1.txt` chỉ có một ký tự sau `file` nên được giữ lại."
---

> Bài này đi theo video TITV bài 11.

## Hai ký tự đại diện chính

Muốn chép mọi file `.txt` hay xoá mọi file bắt đầu bằng `file`, không ai gõ từng tên. Bạn viết một **mẫu** (pattern), shell tự tìm các tên khớp mẫu.

| Ký tự | Khớp với | Ví dụ | Khớp | Không khớp |
|---|---|---|---|---|
| `?` | Đúng **một** ký tự bất kỳ | `file?.txt` | `file1.txt`, `file2.txt` | `file12.txt`, `file.txt` |
| `*` | Chuỗi bất kỳ, **kể cả rỗng** | `*.txt` | `a.txt`, `file12.txt` | `a.doc`, file ẩn `.ghichu.txt` |

Ghép lại được nhiều kiểu: `file*` (bắt đầu bằng `file`), `*.doc*` (chứa `.doc`), `??.*` (tên đúng hai ký tự trước dấu chấm).

## Chuẩn bị thư mục thực hành

```bash
mkdir -p ~/thuchanh/bai11/documents ~/thuchanh/bai11/backup
cd ~/thuchanh/bai11/documents
touch file1.txt file2.txt file3.txt file4.doc file5a.docx
cd ..
tree
```

```text
.
├── backup
└── documents
    ├── file1.txt
    ├── file2.txt
    ├── file3.txt
    ├── file4.doc
    └── file5a.docx

3 directories, 5 files
```

## Shell bung mẫu trước khi chạy lệnh

Điều quan trọng nhất: **shell thay mẫu bằng danh sách tên khớp, rồi mới chạy lệnh**. Lệnh `cp` hay `rm` không hề thấy dấu `*`. Thấy rõ bằng `echo`, lệnh chỉ in lại những gì nó nhận:

```bash
echo documents/*.txt
```

```text
documents/file1.txt documents/file2.txt documents/file3.txt
```

Vì vậy, trước khi `rm` với mẫu, hãy chạy `ls` hoặc `echo` với **cùng mẫu** để xem sẽ xoá những gì.

## Dùng * và ?

### Chép mọi file .txt

```bash
cp documents/*.txt backup/
ls backup
```

| Phần | Ý nghĩa |
|---|---|
| `documents/*.txt` | Mọi file trong `documents` có đuôi `.txt` |
| `backup/` | Thư mục đích |

```text
file1.txt  file2.txt  file3.txt
```

### Xoá mọi file bắt đầu bằng "file"

```bash
rm backup/file*
ls backup
```

`ls backup` không in gì: thư mục đã rỗng.

### ? chỉ khớp đúng một ký tự

```bash
ls documents/file?.*
```

```text
documents/file1.txt  documents/file3.txt
documents/file2.txt  documents/file4.doc
```

`file5a.docx` không khớp vì sau `file` có **hai** ký tự `5a` trước dấu chấm.

### Chuyển mọi file Word (.doc và .docx)

```bash
mv documents/*.doc* backup/
tree
```

```text
.
├── backup
│   ├── file4.doc
│   └── file5a.docx
└── documents
    ├── file1.txt
    ├── file2.txt
    └── file3.txt

3 directories, 5 files
```

`*.doc*` bắt được cả hai, vì `*` ở cuối khớp cả chuỗi rỗng lẫn chữ `x`.

## Khi không có file nào khớp

```bash
ls documents/*.pdf
```

```text
ls: cannot access 'documents/*.pdf': No such file or directory
```

Không có file khớp, bash để nguyên chữ `documents/*.pdf` và đưa cho `ls`. `ls` đi tìm file có tên đúng như vậy, không thấy nên báo lỗi.

## Mở rộng (chuẩn LPIC-1)

Chuẩn LPIC-1 mục 103.3 yêu cầu biết thêm mẫu `[ ]` và cách sinh tên bằng `{ }`.

### Dấu ngoặc vuông: một ký tự trong danh sách

```bash
mkdir -p ~/glob && cd ~/glob
touch anh1.jpg anh2.png Anh3.jpg data_a.csv data_b.csv data_c.csv .an.txt
ls [aA]nh*
ls data_[!a].csv
```

```text
Anh3.jpg  anh1.jpg  anh2.png
data_b.csv  data_c.csv
```

| Mẫu | Khớp với | Ví dụ |
|---|---|---|
| `[abc]` | Một ký tự trong danh sách | `[aA]nh*` khớp `anh1.jpg`, `Anh3.jpg` |
| `[a-c]` | Một ký tự trong khoảng | `data_[a-b].csv` khớp `data_a.csv`, `data_b.csv` |
| `[!a]` hoặc `[^a]` | Một ký tự **không** nằm trong danh sách | `data_[!a].csv` khớp `data_b.csv`, `data_c.csv` |
| `[0-9]` | Một chữ số | `file[0-9].txt` |

### File ẩn không khớp với *

```bash
echo *
echo .*
```

```text
Anh3.jpg anh1.jpg anh2.png data_a.csv data_b.csv data_c.csv
.an.txt
```

`*` bỏ qua tên bắt đầu bằng dấu chấm. Nhờ vậy `rm *` không xoá nhầm file cấu hình ẩn, nhưng cũng vì vậy `cp * nơi-khác/` **bỏ sót** file ẩn.

### Dấu nháy tắt ký tự đại diện

```bash
echo "*.csv"
```

```text
*.csv
```

Trong dấu nháy (hoặc sau `\`), shell không bung mẫu. Lệnh `find` ở bài 16 cần điều này.

### Dấu ngoặc nhọn: sinh ra nhiều tên

`{ }` trông giống ký tự đại diện nhưng **không tìm file**: nó sinh chuỗi theo mẫu, kể cả khi file chưa có. Dùng để tạo hàng loạt:

```bash
echo file{01..03}.log
mkdir -p thang{01..03}
ls -d thang*
```

```text
file01.log file02.log file03.log
thang01  thang02  thang03
```

| Mẫu | Bung thành |
|---|---|
| `anh.{jpg,png}` | `anh.jpg anh.png` |
| `{1..5}` | `1 2 3 4 5` |
| `file{01..03}.log` | `file01.log file02.log file03.log` |

Mẹo: `cp cauhinh.conf{,.bak}` bung thành `cp cauhinh.conf cauhinh.conf.bak`, sao lưu nhanh một file.

## Thực hành

Làm tiếp trong `~/thuchanh/bai11` sau các bước ở trên.

1. Xoá mọi file `.txt` trong `documents`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ls documents/*.txt
   rm documents/*.txt
   ls documents
   ```

   Chạy `ls` với cùng mẫu trước để chắc sẽ xoá đúng ba file `file1.txt`, `file2.txt`, `file3.txt`.

   </details>

2. Tạo thêm `backup/file12.txt` và `backup/fileab.log`. Xoá trong `backup` các file có tên gồm `file`, đúng **hai** ký tự, dấu chấm, rồi phần đuôi bất kỳ. File nào còn lại?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   touch backup/file12.txt backup/fileab.log
   ls backup/file??.*
   rm backup/file??.*
   ls backup
   ```

   ```text
   file4.doc
   ```

   Bị xoá: `file12.txt`, `fileab.log` và cả `file5a.docx` (vì `5a` cũng là hai ký tự). Chỉ còn `file4.doc`.

   </details>

3. Trong `~/glob`, liệt kê các ảnh `.jpg` và `.png` bằng một lệnh.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ls ~/glob/*.{jpg,png}
   ```

   Hoặc `ls ~/glob/*.jpg ~/glob/*.png`.

   </details>

## Tóm tắt

| Mẫu | Ý nghĩa |
|---|---|
| `?` | Đúng một ký tự |
| `*` | Chuỗi bất kỳ, kể cả rỗng. Không khớp file ẩn |
| `[abc]`, `[a-z]`, `[!a]` | Một ký tự trong / ngoài danh sách |
| `{a,b}`, `{1..5}` | Sinh nhiều chuỗi, không cần file có sẵn |
| `"*"` | Trong nháy thì không bung |
| Trước khi `rm` với mẫu | Chạy `ls` cùng mẫu để xem trước |
