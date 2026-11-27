---
summary: Đưa kết quả lệnh vào file bằng > và >>, lấy dữ liệu từ file bằng <, nối nhiều lệnh thành một dây chuyền bằng đường ống |. Kèm cách tách riêng thông báo lỗi, /dev/null và tee.
minutes: 35
commands: [">", ">>", "<", "|", "2>", "2>&1", tee, clear]
quiz:
  - q: "`hello.txt` đang có 2 dòng. Chạy `echo \"Hi\" > hello.txt`. File còn gì?"
    options: ["Chỉ dòng Hi", "3 dòng: 2 dòng cũ và Hi", "2 dòng cũ, không đổi", "File bị xoá"]
    answer: 0
    explain: "`>` ghi đè: nội dung cũ mất, file chỉ còn `Hi`. Muốn thêm xuống cuối thì dùng `>>`."
  - q: "`ls -l | wc -l` làm gì?"
    options: ["Liệt kê file rồi xoá", "Đếm số dòng mà ls -l in ra", "Ghi danh sách file vào file wc", "Báo lỗi vì wc không nhận file"]
    answer: 1
    explain: "Đường ống `|` đưa kết quả của `ls -l` làm dữ liệu vào cho `wc -l`, lệnh này đếm số dòng."
  - q: "`sort < so.txt` khác `sort so.txt` ở chỗ nào?"
    options: ["Kết quả khác nhau", "Lệnh đầu xoá so.txt", "Không khác về kết quả; cách đầu do shell mở file rồi đưa vào sort", "Lệnh đầu sắp giảm dần"]
    answer: 2
    explain: "Với `<`, shell mở file và đưa nội dung vào đầu vào chuẩn của `sort`. Với `sort so.txt`, `sort` tự mở file. Kết quả sắp xếp như nhau."
  - q: "`ls /khongco > loi.txt` vẫn in lỗi ra màn hình và `loi.txt` rỗng. Vì sao?"
    options: ["Vì > chỉ chuyển kết quả thường (stdout), lỗi đi đường stderr riêng", "Vì ls hỏng", "Vì thiếu quyền ghi", "Vì phải dùng >>"]
    answer: 0
    explain: "Lỗi đi đường số 2 (stderr). Muốn ghi lỗi vào file dùng `2> loi.txt`."
  - q: Muốn vừa thấy kết quả trên màn hình vừa lưu vào file thì dùng lệnh nào?
    options: ["cat", "tee", "wc", "sort"]
    answer: 1
    explain: "`lệnh | tee file` in ra màn hình đồng thời ghi vào file."
---

> Bài này đi theo video TITV bài 13.

Mặc định, lệnh lấy dữ liệu từ **bàn phím** và in kết quả ra **màn hình**. Bài này học cách đổi hướng hai dòng chảy đó: in vào file, đọc từ file, hoặc đưa thẳng sang lệnh khác.

```bash
mkdir -p ~/thuchanh/bai13 && cd ~/thuchanh/bai13
```

## > : xuất ra file, ghi đè

```bash
echo "Hello" > hello.txt
cat hello.txt
echo "Xin chao" > hello.txt
cat hello.txt
```

| Phần | Ý nghĩa |
|---|---|
| `echo "Hello"` | Bình thường in `Hello` ra màn hình |
| `> hello.txt` | Thay vì in ra màn hình, ghi vào `hello.txt`. Chưa có thì tạo, **có rồi thì xoá sạch nội dung cũ** |

```text
Hello
Xin chao
```

Lần ghi thứ hai xoá mất `Hello`. Dùng `>` với file quan trọng phải cẩn thận.

## >> : ghi thêm xuống cuối

```bash
echo "Xin chao nua" >> hello.txt
cat hello.txt
```

```text
Xin chao
Xin chao nua
```

`>>` giữ nội dung cũ và thêm vào cuối. File chưa có thì tạo mới.

Mọi lệnh in ra màn hình đều chuyển vào file được, không riêng `echo`. Ví dụ lưu cây thư mục của hai bài trước vào một file:

```bash
tree ~/thuchanh/bai11 > cay.txt
tree ~/thuchanh/bai12 >> cay.txt
cat cay.txt
```

```text
/home/hocvien/thuchanh/bai11
├── backup
│   └── file4.doc
└── documents

3 directories, 1 file
/home/hocvien/thuchanh/bai12
├── test.sha256
├── test.txt
└── test.txt.gz

1 directory, 3 files
```

## < : lấy dữ liệu từ file

`<` đưa nội dung file vào làm dữ liệu nhập cho lệnh, thay cho bàn phím. Ví dụ sắp xếp các số trong file:

```bash
printf '3\n1\n3\n0\n' > so.txt
sort < so.txt
```

| Phần | Ý nghĩa |
|---|---|
| `printf '3\n1\n3\n0\n' > so.txt` | Tạo file 4 dòng: 3, 1, 3, 0 (`\n` là xuống dòng) |
| `sort` | Sắp xếp các dòng nhận được |
| `< so.txt` | Lấy dữ liệu từ `so.txt` |

```text
0
1
3
3
```

`sort so.txt` cho cùng kết quả: `sort` tự mở file khi có tên file ở đối số. `<` có ích với lệnh chỉ đọc từ bàn phím. Lưu ý `echo` không đọc dữ liệu nhập, nên `echo < file` không in gì.

Màn hình đầy chữ thì gõ `clear` (hoặc `Ctrl+L`) cho sạch.

## | : đường ống

Đường ống `|` nối **kết quả của lệnh bên trái** vào **dữ liệu nhập của lệnh bên phải**. Không cần file trung gian.

```bash
ls -l
ls -l | wc -l
```

```text
total 16
-rw-r--r-- 1 hocvien hocvien 231 Nov 27 19:28 cay.txt
-rw-r--r-- 1 hocvien hocvien  22 Nov 27 19:28 hello.txt
-rw-r--r-- 1 hocvien hocvien  17 Nov 27 19:28 moi.txt
-rw-r--r-- 1 hocvien hocvien   8 Nov 27 19:28 so.txt
5
```

| Phần | Ý nghĩa |
|---|---|
| `ls -l` | Liệt kê dạng dài, in 5 dòng (kể cả dòng `total`) |
| <code>&#124;</code> | Đưa 5 dòng đó sang lệnh sau |
| `wc -l` | Đếm số dòng nhận được |

Nối được nhiều lệnh liên tiếp. Mỗi lệnh làm một việc nhỏ, nối lại thành việc lớn:

```bash
cat so.txt | sort
cat /etc/passwd | head -3 | tail -1
```

```text
0
1
3
3
bin:x:2:2:bin:/bin:/usr/sbin/nologin
```

`head -3 | tail -1` lấy 3 dòng đầu, rồi lấy dòng cuối trong ba dòng đó: chính là dòng thứ 3. Từ bài sau, đường ống xuất hiện liên tục: `grep` (bài 14), `cut` (bài 21).

## Mở rộng (chuẩn LPIC-1)

Chuẩn LPIC-1 mục 103.4 yêu cầu hiểu ba luồng dữ liệu và cách tách lỗi.

### Ba luồng dữ liệu

| Số | Tên | Mặc định nối với |
|---|---|---|
| 0 | **stdin**, đầu vào chuẩn | Bàn phím |
| 1 | **stdout**, đầu ra chuẩn | Màn hình |
| 2 | **stderr**, lỗi chuẩn | Màn hình |

Kết quả thường và thông báo lỗi cùng hiện trên màn hình nên trông như một, nhưng chúng đi **hai đường riêng**. `>` chỉ chuyển đường số 1:

```bash
ls /khongco > loi.txt
cat loi.txt
```

```text
ls: cannot access '/khongco': No such file or directory
```

Lỗi vẫn hiện ra màn hình, còn `loi.txt` rỗng. Muốn chuyển lỗi, ghi số 2 trước dấu `>`:

| Cách viết | Ý nghĩa |
|---|---|
| `lệnh 2> loi.txt` | Ghi lỗi vào file, kết quả thường vẫn ra màn hình |
| `lệnh > ra.txt 2>&1` | Ghi cả kết quả lẫn lỗi vào `ra.txt`. `2>&1` là "đưa đường 2 vào cùng chỗ với đường 1" |
| `lệnh &> ra.txt` | Cách viết tắt của dòng trên (bash) |
| `lệnh 2> /dev/null` | Vứt bỏ lỗi. `/dev/null` là "thùng rác": ghi gì vào cũng mất |

```bash
ls /etc/hostname /khongco > ketqua.txt 2>&1
cat ketqua.txt
```

```text
ls: cannot access '/khongco': No such file or directory
/etc/hostname
```

Thứ tự viết quan trọng: `> file 2>&1` đúng, còn `2>&1 > file` thì lỗi vẫn ra màn hình.

### tee: vừa xem vừa ghi

```bash
echo "luu ca hai" | tee ghi.txt
```

```text
luu ca hai
```

`tee` nhận dữ liệu, in ra màn hình **và** ghi vào file (như chữ T: một vào, hai ra). `tee -a` ghi thêm thay vì ghi đè. `tee` còn giải bẫy `sudo` ở bài 8: `echo "127.0.0.1 web" | sudo tee -a /etc/hosts`.

### Heredoc: đưa nhiều dòng vào lệnh

```bash
cat <<EOF > cauhinh.txt
host=localhost
port=5432
EOF
```

`<<EOF` đọc các dòng tiếp theo làm dữ liệu nhập, tới dòng chỉ có chữ `EOF` thì dừng. Hay dùng trong script để tạo file cấu hình.

### xargs và $(...)

Một số lệnh như `rm`, `mkdir` không đọc dữ liệu nhập, chỉ nhận đối số. `xargs` biến dữ liệu nhập thành đối số:

```bash
ls x/*.tmp | xargs rm -v
```

```text
removed 'x/a.tmp'
removed 'x/b.tmp'
```

`$(lệnh)` chạy lệnh rồi thay bằng kết quả của nó:

```bash
echo "Co $(ls /etc | wc -l) muc trong /etc"
```

```text
Co 127 muc trong /etc
```

## Thực hành

1. Ghi ba dòng `cam`, `tao`, `buoi` vào `traicay.txt` (mỗi lệnh `echo` một dòng). Kiểm tra file có đủ ba dòng.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   echo "cam" > traicay.txt
   echo "tao" >> traicay.txt
   echo "buoi" >> traicay.txt
   cat traicay.txt
   ```

   Dòng đầu dùng `>` để tạo file mới, hai dòng sau dùng `>>` để thêm.

   </details>

2. In nội dung `traicay.txt` đã sắp xếp theo thứ tự chữ cái, theo hai cách.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sort < traicay.txt
   cat traicay.txt | sort
   ```

   Kết quả: `buoi`, `cam`, `tao`.

   </details>

3. Đếm xem `/etc` có bao nhiêu file và thư mục con, rồi lưu con số vào `dem.txt`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ls /etc | wc -l > dem.txt
   cat dem.txt
   ```

   </details>

4. Chạy `ls /etc/hostname /khongco`, cho kết quả vào `ok.txt` và lỗi vào `loi.txt`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ls /etc/hostname /khongco > ok.txt 2> loi.txt
   cat ok.txt
   cat loi.txt
   ```

   </details>

## Tóm tắt

| Ký hiệu | Ý nghĩa |
|---|---|
| `>` | Ghi kết quả vào file, ghi đè |
| `>>` | Ghi thêm xuống cuối file |
| `<` | Lấy dữ liệu nhập từ file |
| <code>&#124;</code> | Kết quả lệnh trước thành dữ liệu nhập của lệnh sau |
| `2>` | Ghi thông báo lỗi vào file |
| `> file 2>&1` | Ghi cả kết quả lẫn lỗi |
| `/dev/null` | Thùng rác |
| `tee file` | Vừa in ra màn hình vừa ghi file |
| `clear` | Xoá màn hình |
