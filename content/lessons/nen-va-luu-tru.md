---
summary: gzip nén từng file thành .gz, gunzip giải nén. tar gom cả thư mục thành một file và nén luôn bằng gzip. Thuộc hai mẫu tar -czvf để nén và tar -xzvf để giải nén là dùng được hằng ngày.
minutes: 35
commands: [gzip, gunzip, tar -czvf, tar -xzvf, tar -tf, tar -C]
quiz:
  - q: "Sau `gzip baocao.txt`, trong thư mục còn gì?"
    options: ["Cả baocao.txt và baocao.txt.gz", "Chỉ baocao.txt.gz", "Chỉ baocao.txt", "Thư mục baocao"]
    answer: 1
    explain: "gzip thay file gốc bằng file nén `.gz`. Muốn giữ file gốc thì dùng `gzip -c file > file.gz` hoặc `gzip -k`."
  - q: "`gzip -r thu-muc` làm gì?"
    options: ["Nén cả thư mục thành một file .gz", "Nén từng file bên trong thư mục, mỗi file thành một .gz riêng", "Giải nén thư mục", "Báo lỗi vì gzip không nén thư mục"]
    answer: 1
    explain: "gzip chỉ nén từng file. `-r` đi vào thư mục và nén riêng từng file. Muốn gom cả thư mục thành một file thì dùng tar."
  - q: "Lệnh nào nén thư mục `du-an` thành `du-an.tar.gz`?"
    options: ["tar -xzvf du-an.tar.gz du-an", "gzip du-an", "tar -czvf du-an.tar.gz du-an", "tar -tf du-an.tar.gz"]
    answer: 2
    explain: "`c` tạo, `z` nén gzip, `v` in tên file, `f` chỉ tên file kết quả. `x` là giải nén, `t` là xem danh sách."
  - q: "Trong `tar -xzvf a.tar.gz -C tam`, `-C tam` làm gì?"
    options: ["Nén vào thư mục tam", "Giải nén vào thư mục tam thay vì thư mục hiện hành", "Xoá thư mục tam", "Đổi tên file thành tam"]
    answer: 1
    explain: "`-C` đổi thư mục trước khi giải nén. Thư mục `tam` phải có sẵn."
  - q: "`tar -r` dùng để làm gì?"
    options: ["Nén đệ quy", "Thêm file vào cuối một file .tar đã có", "Giải nén đệ quy", "Xoá file khỏi .tar"]
    answer: 1
    explain: "`-r` (append) thêm file vào gói `.tar` chưa nén. Không làm được với `.tar.gz`."
---

> Bài này đi theo video TITV bài 18.

Nén giúp file nhỏ lại để gửi email, tải lên mạng, sao lưu. Trên Linux có hai nhóm lệnh:

| Nhóm | Làm gì | Đuôi file |
|---|---|---|
| `gzip`, `gunzip` | Nén / giải nén **từng file** | `.gz` |
| `tar` | **Gom** nhiều file, cả thư mục, thành một file; nén luôn nếu muốn | `.tar`, `.tar.gz` |

Chuẩn bị (lệnh `seq 1 2000` in các số từ 1 tới 2000, dùng để tạo file có nội dung):

```bash
mkdir -p ~/thuchanh/bai18/folder && cd ~/thuchanh/bai18
for f in f1.txt f2.txt f3.docx; do seq 1 2000 > $f; done
touch folder/a.xlsx folder/b.jpg folder/c.xml
tree
```

```text
.
├── f1.txt
├── f2.txt
├── f3.docx
└── folder
    ├── a.xlsx
    ├── b.jpg
    └── c.xml

2 directories, 6 files
```

## gzip: nén từng file

```text
gzip [tuỳ chọn] file...
```

```bash
ls -l f1.txt
gzip f1.txt
ls -l f1.txt.gz
ls
```

```text
-rw-r--r-- 1 hocvien hocvien 8893 Nov 27 19:33 f1.txt
-rw-r--r-- 1 hocvien hocvien 4225 Nov 27 19:33 f1.txt.gz
f1.txt.gz  f2.txt  f3.docx  folder
```

File 8893 byte nén còn 4225 byte. Lưu ý: **file gốc biến mất**, chỉ còn `f1.txt.gz`.

| Tuỳ chọn | Ý nghĩa |
|---|---|
| `-c` | Ghi kết quả nén ra màn hình (stdout), **giữ nguyên file gốc**. Thường đi kèm `>` để lưu vào file |
| `-d` | Giải nén (**d**ecompress), giống `gunzip` |
| `-f` | Ép làm, không hỏi (**f**orce), kể cả khi file đích đã có |
| `-r` | Đi vào thư mục, nén **từng file** bên trong (**r**ecursive) |
| `-k` | Giữ file gốc (**k**eep) |

```bash
gzip -c f2.txt > f2.txt.gz
gzip f3.docx
gzip -r folder
tree
```

```text
.
├── f1.txt.gz
├── f2.txt
├── f2.txt.gz
├── f3.docx.gz
└── folder
    ├── a.xlsx.gz
    ├── b.jpg.gz
    └── c.xml.gz

2 directories, 7 files
```

- `gzip -c f2.txt > f2.txt.gz`: có file nén mà `f2.txt` vẫn còn. Đừng chạy `gzip -c` không kèm `>`: dữ liệu nén là ký tự lạ, in ra làm rối màn hình.
- `gzip -r folder`: thư mục vẫn là thư mục, từng file bên trong thành `.gz` riêng. gzip **không** gom thư mục thành một file.

## gunzip: giải nén

```bash
gunzip f1.txt.gz
gzip -d f3.docx.gz
gunzip -r folder
tree
```

```text
.
├── f1.txt
├── f2.txt
├── f2.txt.gz
├── f3.docx
└── folder
    ├── a.xlsx
    ├── b.jpg
    └── c.xml

2 directories, 7 files
```

`gunzip` có các tuỳ chọn `-c`, `-f`, `-r` giống `gzip`. Giải nén mà file đích đã có thì gzip hỏi:

```bash
gunzip f2.txt.gz
```

```text
gzip: f2.txt already exists; do you wish to overwrite (y or n)? n
	not overwritten
```

Gõ `y` để ghi đè, hoặc dùng `gunzip -f` để khỏi hỏi.

## tar: gom và nén cả thư mục

```text
tar [tuỳ chọn] tên-file-kết-quả thư-mục-hoặc-file...
```

| Tuỳ chọn | Ý nghĩa |
|---|---|
| `-c` | Tạo gói mới (**c**reate) |
| `-x` | Giải nén, bung gói (e**x**tract) |
| `-t` | Liệt kê nội dung gói, không bung (lis**t**) |
| `-f tên` | Tên file gói (**f**ile). Đặt `f` **cuối** cụm tuỳ chọn, ngay trước tên file |
| `-v` | In tên từng file đang xử lý (**v**erbose) |
| `-z` | Nén / giải nén qua gzip, cho file `.tar.gz` |
| `-r` | Thêm file vào cuối một gói `.tar` đã có (append). Chỉ dùng với `.tar` chưa nén |
| `-C thư-mục` | Bung vào thư mục khác thay vì thư mục hiện hành |

### Nén: tar -czvf

```bash
tar -czvf filenen.tar.gz folder
```

| Phần | Ý nghĩa |
|---|---|
| `c` | Tạo gói |
| `z` | Nén bằng gzip |
| `v` | In tên từng file |
| `f filenen.tar.gz` | Tên file kết quả |
| `folder` | Thư mục cần nén. Ghi được nhiều thư mục, file cách nhau bằng dấu cách |

```text
folder/
folder/a.xlsx
folder/b.jpg
folder/c.xml
```

Bỏ `z` thì chỉ gom, không nén:

```bash
tar -cvf filenen2.tar folder
ls -l filenen*
```

```text
folder/
folder/a.xlsx
folder/b.jpg
folder/c.xml
-rw-r--r-- 1 hocvien hocvien   177 Nov 27 19:33 filenen.tar.gz
-rw-r--r-- 1 hocvien hocvien 10240 Nov 27 19:33 filenen2.tar
```

`.tar` chưa nén còn to hơn tổng các file (tar thêm thông tin quản lý cho từng file). Nén `z` thì còn 177 byte.

### Xem trong gói có gì: tar -tf

```bash
tar -tzvf filenen.tar.gz
```

```text
drwxr-xr-x hocvien/hocvien   0 2026-11-27 19:33 folder/
-rw-r--r-- hocvien/hocvien   0 2026-11-27 19:33 folder/a.xlsx
-rw-r--r-- hocvien/hocvien   0 2026-11-27 19:33 folder/b.jpg
-rw-r--r-- hocvien/hocvien   0 2026-11-27 19:33 folder/c.xml
```

Nên xem trước khi giải nén file tải từ mạng về, để biết nó sẽ bung ra những gì và ở đâu.

### Thêm file vào gói: tar -r

```bash
tar -rvf filenen2.tar f1.txt
tar -tf filenen2.tar
```

```text
f1.txt
folder/
folder/a.xlsx
folder/b.jpg
folder/c.xml
f1.txt
```

`-r` là thêm vào (append), không phải đệ quy. Không thêm được vào `.tar.gz`, phải giải nén ra trước.

### Giải nén: tar -xzvf

```bash
tar -xzvf filenen.tar.gz
```

Bung ra thư mục hiện hành. File trùng tên sẽ bị **ghi đè không hỏi**. Muốn bung vào chỗ khác, dùng `-C`:

```bash
mkdir tam
tar -xzvf filenen.tar.gz -C tam
tree tam
```

```text
folder/
folder/a.xlsx
folder/b.jpg
folder/c.xml
tam
└── folder
    ├── a.xlsx
    ├── b.jpg
    └── c.xml

2 directories, 3 files
```

> **Mẹo nhớ:** **c**reate **z**ip **v**erbose **f**ile để nén (`-czvf`), e**x**tract **z**ip **v**erbose **f**ile để giải nén (`-xzvf`). Hai lệnh chỉ khác chữ đầu.

## Mở rộng (chuẩn LPIC-1)

Chuẩn LPIC-1 mục 103.3 yêu cầu biết thêm các kiểu nén khác. Trên CentOS, Rocky hay gặp `bzip2`; nhiều phần mềm phát hành dạng `.tar.xz`.

| Kiểu | Lệnh nén từng file | Giải nén | Tuỳ chọn trong tar | Đuôi |
|---|---|---|---|---|
| gzip | `gzip` | `gunzip` | `-z` | `.tar.gz`, `.tgz` |
| bzip2 | `bzip2` | `bunzip2` | `-j` | `.tar.bz2` |
| xz | `xz` | `unxz` | `-J` | `.tar.xz` |

```bash
tar -czf filenen.tar.gz folder f1.txt f2.txt
tar -cjf filenen.tar.bz2 folder f1.txt f2.txt
tar -cJf filenen.tar.xz folder f1.txt f2.txt
ls -l filenen.tar.*
```

```text
-rw-r--r-- 1 hocvien hocvien 4963 Nov 27 19:33 filenen.tar.bz2
-rw-r--r-- 1 hocvien hocvien 4646 Nov 27 19:33 filenen.tar.gz
-rw-r--r-- 1 hocvien hocvien 1240 Nov 27 19:33 filenen.tar.xz
```

`xz` nén nhỏ nhất nhưng chậm nhất, `gzip` nhanh nhất. Khi giải nén, `tar -xf` tự nhận ra kiểu nén nên không cần nhớ `z`, `j` hay `J`.

Ngoài ra: `zip` / `unzip` cho file `.zip` (dùng chung với Windows), phải cài bằng `sudo apt install zip unzip`. Lệnh `cpio` và `dd` cũng nằm trong mục này nhưng ít gặp hơn.

## Thực hành

1. Nén `f2.txt` thành `f2.txt.gz` nhưng giữ lại file gốc, theo hai cách.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   gzip -c f2.txt > f2.txt.gz
   gzip -kf f2.txt
   ```

   Cách hai dùng `-k` (giữ file gốc) và `-f` (ghi đè `f2.txt.gz` có sẵn từ cách một).

   </details>

2. Nén cả thư mục `~/thuchanh/bai16` thành `bai16.tar.gz` đặt trong `~/thuchanh/bai18`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   cd ~/thuchanh
   tar -czvf bai18/bai16.tar.gz bai16
   ```

   Đứng ở `~/thuchanh` để đường dẫn trong gói là `bai16/...`, gọn hơn đường dẫn đầy đủ.

   </details>

3. Xem trong `bai16.tar.gz` có bao nhiêu file và thư mục, không giải nén.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   tar -tzf ~/thuchanh/bai18/bai16.tar.gz | wc -l
   ```

   </details>

4. Giải nén `bai16.tar.gz` vào thư mục mới `~/khoiphuc`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   mkdir ~/khoiphuc
   tar -xzvf ~/thuchanh/bai18/bai16.tar.gz -C ~/khoiphuc
   tree ~/khoiphuc
   ```

   </details>

## Tóm tắt

| Lệnh | Làm gì |
|---|---|
| `gzip file` | Nén file, thay file gốc bằng `file.gz` |
| `gzip -c file > file.gz` | Nén, giữ file gốc |
| `gzip -r thư-mục` | Nén từng file trong thư mục |
| `gunzip file.gz`, `gzip -d` | Giải nén |
| `tar -czvf gói.tar.gz thư-mục` | Gom và nén |
| `tar -tzvf gói.tar.gz` | Xem trong gói có gì |
| `tar -xzvf gói.tar.gz` | Giải nén vào thư mục hiện hành |
| `tar -xzvf gói.tar.gz -C nơi` | Giải nén vào thư mục khác |
| `tar -rvf gói.tar file` | Thêm file vào gói `.tar` |
