---
summary: grep tìm các dòng chứa một chuỗi trong file hoặc cả thư mục. Học các tuỳ chọn -i, -v, -c, -n, -r, cách tìm trong file nhật ký và lọc kết quả của lệnh khác qua đường ống.
minutes: 30
commands: [grep, grep -i, grep -v, grep -c, grep -n, grep -r]
quiz:
  - q: "`grep Bạn file1.txt` không ra gì dù file có chữ `bạn`. Thêm tuỳ chọn nào?"
    options: ["-v", "-c", "-i", "-n"]
    answer: 2
    explain: "grep phân biệt hoa thường. `-i` (ignore case) bỏ qua khác biệt đó."
  - q: "`grep -v nologin /etc/passwd` in ra gì?"
    options: ["Các dòng có chữ nologin", "Các dòng KHÔNG có chữ nologin", "Số dòng có nologin", "Số thứ tự các dòng có nologin"]
    answer: 1
    explain: "`-v` (invert) đảo ngược: in các dòng không khớp."
  - q: "`grep -c chào *` in ra gì?"
    options: ["Số dòng khớp trong từng file", "Các dòng khớp kèm số dòng", "Tên các file khớp", "Tổng số chữ chào"]
    answer: 0
    explain: "`-c` (count) đếm số **dòng** khớp, mỗi file một kết quả dạng `tên:số`."
  - q: Muốn tìm chữ `error` trong mọi file thuộc thư mục `logs` và các thư mục con thì dùng tuỳ chọn nào?
    options: ["-n", "-r", "-c", "-v"]
    answer: 1
    explain: "`-r` (recursive) tìm đệ quy trong thư mục và mọi thư mục con."
  - q: "`ls -l | grep file` làm gì?"
    options: ["Tìm chữ file trong file tên ls", "Xoá các file", "Chỉ giữ lại các dòng của ls -l có chữ file", "Báo lỗi"]
    answer: 2
    explain: Đường ống đưa kết quả `ls -l` vào grep. grep giữ lại các dòng chứa `file`.
---

> Bài này đi theo video TITV bài 14.

## grep là gì

`grep` tìm trong file và in ra những **dòng có chứa** chuỗi cần tìm. Nó tìm trong một file, nhiều file, cả thư mục, hoặc trong kết quả của lệnh khác. Mẫu tìm có thể là chữ thường hoặc biểu thức chính quy (bài 15).

```text
grep [tuỳ chọn] mẫu [file hoặc thư mục]
```

```bash
grep root /etc/passwd
```

| Phần | Ý nghĩa |
|---|---|
| `grep` | Lệnh tìm kiếm |
| `root` | Chuỗi cần tìm |
| `/etc/passwd` | File tìm trong đó |

```text
root:x:0:0:root:/root:/bin/bash
```

Không tìm thấy thì `grep` không in gì.

## Các tuỳ chọn chính

| Tuỳ chọn | Ý nghĩa |
|---|---|
| `-i` | Không phân biệt chữ hoa, chữ thường (**i**gnore case) |
| `-v` | In các dòng **không** khớp (in**v**ert) |
| `-c` | Chỉ đếm số dòng khớp (**c**ount) |
| `-n` | In kèm số thứ tự dòng (line **n**umber) |
| `-r` | Tìm trong cả thư mục và mọi thư mục con (**r**ecursive) |

```bash
grep -n root /etc/passwd
grep -c nologin /etc/passwd
grep -v nologin /etc/passwd
```

```text
1:root:x:0:0:root:/root:/bin/bash
17
root:x:0:0:root:/root:/bin/bash
sync:x:4:65534:sync:/bin:/bin/sync
ubuntu:x:1000:1000:Ubuntu:/home/ubuntu:/bin/bash
hocvien:x:1001:1001::/home/hocvien:/bin/bash
an:x:1002:1002::/home/an:/bin/bash
```

- `-n`: dòng `root` là dòng số 1 của file.
- `-c`: có 17 tài khoản dùng `nologin` (tài khoản hệ thống, không đăng nhập được).
- `-v`: các tài khoản còn lại, phần lớn là người dùng thật.

## Tìm trong file nhật ký

Nhật ký hệ thống nằm trong `/var/log`. Trên Ubuntu desktop, file nhật ký chung là `/var/log/syslog`, rất dài. Xem thử đầu, cuối rồi tìm lỗi:

```bash
head -15 /var/log/syslog
tail -15 /var/log/syslog
grep error /var/log/syslog
grep error /var/log/syslog | grep camera
```

Dòng cuối lọc hai lần: lấy các dòng có `error`, rồi trong số đó giữ dòng có `camera`. Kết quả tuỳ máy bạn.

Ví dụ cùng kiểu trên file nhật ký cài đặt phần mềm `/var/log/dpkg.log`:

```bash
grep "status installed" /var/log/dpkg.log | head -3
grep "status installed" /var/log/dpkg.log | grep tree
```

| Phần | Ý nghĩa |
|---|---|
| `"status installed"` | Chuỗi có dấu cách phải đặt trong nháy |
| <code>&#124; head -3</code> | Chỉ xem 3 dòng đầu |
| <code>&#124; grep tree</code> | Trong các dòng đó, giữ dòng có `tree`: cho biết `tree` được cài lúc nào |

```text
2026-11-10 14:48:51 status installed base-passwd:amd64 3.6.3build1
2026-11-10 14:48:51 status installed base-files:amd64 13ubuntu10
2026-11-10 14:48:51 status installed dpkg:amd64 1.22.6ubuntu6
2026-11-27 16:23:15 status installed tree:amd64 2.1.1-2ubuntu3.24.04.2
```

## Thực hành theo video

```bash
mkdir -p ~/thuchanh/bai14 && cd ~/thuchanh/bai14
echo "Xin chào bạn" > file1.txt
echo "Chào bạn sinh viên" > file2.txt
```

### Phân biệt hoa thường

```bash
grep bạn file1.txt
grep Bạn file1.txt
grep -i Bạn file1.txt
```

```text
Xin chào bạn
Xin chào bạn
```

`grep Bạn` không in gì vì file chỉ có `bạn` viết thường. Thêm `-i` thì tìm được.

### Tìm trong nhiều file

```bash
grep -i bạn *
grep -c chào *
grep -ic chào *
```

```text
file1.txt:Xin chào bạn
file2.txt:Chào bạn sinh viên
file1.txt:1
file2.txt:0
file1.txt:1
file2.txt:1
```

Tìm nhiều file thì mỗi dòng có tên file đứng trước. `grep -c chào` đếm 0 ở `file2.txt` vì file đó viết hoa `Chào`; thêm `-i` thì đếm được.

### Lọc kết quả của lệnh khác

```bash
ls -l | grep file
```

```text
-rw-r--r-- 1 hocvien hocvien 16 Nov 27 19:29 file1.txt
-rw-r--r-- 1 hocvien hocvien 23 Nov 27 19:29 file2.txt
```

### Tìm trong cả thư mục

```bash
cd ..
grep -r -i -n chào bai14
```

| Phần | Ý nghĩa |
|---|---|
| `-r` | Tìm trong thư mục `bai14` và các thư mục con |
| `-i` | Không phân biệt hoa thường |
| `-n` | Kèm số dòng |
| `bai14` | Thư mục cần tìm. Bỏ trống thì `-r` tìm từ thư mục hiện hành |

```text
bai14/file1.txt:1:Xin chào bạn
bai14/file2.txt:1:Chào bạn sinh viên
```

Mỗi dòng có dạng `file:số-dòng:nội-dung`.

## Mở rộng (chuẩn LPIC-1)

Chuẩn LPIC-1 mục 103.7 còn có các tuỳ chọn sau:

| Tuỳ chọn | Ý nghĩa | Ví dụ |
|---|---|---|
| `-l` | Chỉ in tên file có khớp (**l**ist) | `grep -rl chào .` → `./bai14/file1.txt` |
| `-w` | Chỉ khớp nguyên từ (**w**ord): tìm `ban` không khớp `banh` | `grep -w ban` |
| `-o` | Chỉ in phần khớp, không in cả dòng (**o**nly) | `grep -o "bạn" file1.txt` → `bạn` |
| `-A 2`, `-B 2`, `-C 2` | In thêm 2 dòng sau / trước / quanh dòng khớp | `grep -A1 "^root" /etc/passwd` |
| `-E` | Dùng biểu thức chính quy mở rộng (bài 15). `egrep` là tên cũ | `grep -E "^(root\|an):" /etc/passwd` |
| `-F` | Tìm đúng chuỗi, không hiểu ký tự đặc biệt. `fgrep` là tên cũ | `grep -F "a.b"` không khớp `axb` |
| `--color` | Tô màu phần khớp (Ubuntu bật sẵn) | |

```bash
grep -A1 "^root" /etc/passwd
```

```text
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
```

`^root` nghĩa là "dòng bắt đầu bằng root". Ký hiệu `^` thuộc biểu thức chính quy, học ở bài sau.

Mã thoát của grep: `0` là có kết quả, `1` là không tìm thấy, `2` là lỗi (ví dụ file không tồn tại). Script dựa vào mã này để rẽ nhánh.

## Thực hành

1. Trong `/etc/passwd`, tìm dòng của tài khoản của bạn, kèm số dòng.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   grep -n $USER /etc/passwd
   ```

   `$USER` là biến chứa tên người dùng hiện tại.

   </details>

2. Đếm số tài khoản dùng shell `/bin/bash`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   grep -c /bin/bash /etc/passwd
   ```

   </details>

3. Trong thư mục `bai14`, in các dòng **không** chứa chữ `sinh`, không phân biệt hoa thường.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   grep -iv sinh ~/thuchanh/bai14/*
   ```

   Chỉ còn dòng `Xin chào bạn` của `file1.txt`.

   </details>

4. Tìm trong toàn bộ `/etc` các file có chứa chữ `localhost`, chỉ in tên file, giấu thông báo lỗi.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   grep -rl localhost /etc 2> /dev/null
   ```

   Một số file trong `/etc` người dùng thường không đọc được, gây lỗi `Permission denied`. `2> /dev/null` (bài 13) giấu các lỗi đó.

   </details>

## Tóm tắt

| Lệnh | Làm gì |
|---|---|
| `grep mẫu file` | In các dòng chứa mẫu |
| `grep -i` | Không phân biệt hoa thường |
| `grep -v` | In dòng không khớp |
| `grep -c` | Đếm số dòng khớp |
| `grep -n` | Kèm số dòng |
| `grep -r mẫu thư-mục` | Tìm trong cả thư mục |
| <code>lệnh &#124; grep mẫu</code> | Lọc kết quả của lệnh khác |
