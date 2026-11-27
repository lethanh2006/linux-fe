---
summary: Link cho một file nhiều tên hoặc nhiều chỗ truy cập mà không chép dữ liệu. Bài này giải thích inode, hard link (cùng inode) và soft link (đường tắt trỏ tới tên file), thực hành tạo, sửa, xoá để thấy hai loại khác nhau ra sao.
minutes: 30
commands: [ls -i, ln, ln -s, readlink]
quiz:
  - q: "Hard link và file gốc có gì giống nhau?"
    options: ["Cùng tên", "Cùng số inode, tức cùng dữ liệu", "Cùng thư mục", "Không giống gì"]
    answer: 1
    explain: "Hard link là thêm một tên trỏ tới cùng inode. `ls -li` thấy hai tên có cùng số inode."
  - q: Xoá file gốc thì hard link ra sao?
    options: ["Hỏng, không đọc được", "Vẫn đọc được bình thường, dữ liệu còn tới khi xoá hết mọi tên", "Tự xoá theo", "Trở thành thư mục"]
    answer: 1
    explain: "Dữ liệu chỉ mất khi số link (cột 2 của `ls -l`) về 0."
  - q: Xoá file gốc thì soft link ra sao?
    options: ["Vẫn đọc được", "Tự trỏ sang file khác", "Thành link hỏng: cat báo No such file or directory", "Bị xoá theo"]
    answer: 2
    explain: "Soft link chỉ lưu **tên** file gốc. Tên đó không còn thì link trỏ vào chỗ trống."
  - q: Loại link nào tạo được cho thư mục?
    options: ["Hard link", "Soft link", "Cả hai", "Không loại nào"]
    answer: 1
    explain: "`ln thumuc ...` báo `hard link not allowed for directory`. `ln -s` thì được."
  - q: "Lệnh nào tạo soft link `web` trỏ tới `/var/www/html`?"
    options: ["ln /var/www/html web", "ln -s web /var/www/html", "ln -s /var/www/html web", "cp -s /var/www/html web"]
    answer: 2
    explain: "Cú pháp giống `cp`: `ln -s đích tên-link`. Thứ tự là cái có sẵn trước, cái mới sau."
---

> Bài này đi theo video TITV bài 32.

## Link để làm gì

**Link** cho một file thêm tên hoặc thêm chỗ truy cập mà **không chép dữ liệu**, không tốn thêm dung lượng. Dùng để:

- Tổ chức file: một file nằm "ở nhiều thư mục" cùng lúc.
- Quản lý phiên bản: tên `python3` trỏ tới `python3.12`, nâng cấp chỉ cần đổi link.
- Dùng chung thư viện, file cấu hình: bật một trang web trong nginx là tạo link từ `sites-enabled` sang `sites-available`.
- Tiết kiệm ổ đĩa.

## inode

Mỗi file có một **inode** (index node): bản ghi chứa mọi thông tin về file trừ tên: kích thước, chủ (UID, GID), quyền, các mốc thời gian, và vị trí các khối dữ liệu trên ổ đĩa (có thể nằm rải rác). Mỗi inode có một **số inode**.

Tên file chỉ là một dòng trong thư mục: "tên này ứng với inode số mấy". Xem số inode bằng `ls -i`:

```bash
mkdir -p ~/thuchanh/bai32 && cd ~/thuchanh/bai32
touch file1.txt file2.txt
ls -li
```

| Phần | Ý nghĩa |
|---|---|
| `-i` | In số inode ở đầu mỗi dòng |
| `-l` | Dạng dài |

```text
total 0
29800315 -rw-r--r-- 1 hocvien hocvien 0 Nov 27 19:51 file1.txt
29800316 -rw-r--r-- 1 hocvien hocvien 0 Nov 27 19:51 file2.txt
```

Hai file khác nhau có số inode khác nhau. Cột thứ 3 (số `1`) là **số tên** đang trỏ tới inode đó.

## Hard link: thêm một tên cho cùng inode

```text
ln file-có-sẵn tên-mới
```

```bash
ln file1.txt file1-hlink.txt
ls -li
```

```text
total 0
29800315 -rw-r--r-- 2 hocvien hocvien 0 Nov 27 19:51 file1-hlink.txt
29800315 -rw-r--r-- 2 hocvien hocvien 0 Nov 27 19:51 file1.txt
29800316 -rw-r--r-- 1 hocvien hocvien 0 Nov 27 19:51 file2.txt
```

`file1.txt` và `file1-hlink.txt` có **cùng số inode** `29800315`, và số tên tăng lên `2`. Không có cái nào là "gốc" hay "bản sao": cả hai đều là tên ngang hàng của cùng một dữ liệu.

### Sửa qua tên này, tên kia thấy ngay

```bash
echo "Xin chao hard link" > file1.txt
cat file1-hlink.txt
echo "Them tu ten thu hai" >> file1-hlink.txt
cat file1.txt
```

```text
Xin chao hard link
Xin chao hard link
Them tu ten thu hai
```

Vì vậy hard link **không phải bản sao lưu**: lỡ sửa hỏng qua tên này thì tên kia cũng hỏng theo.

### Xoá một tên, dữ liệu vẫn còn

```bash
rm file1.txt
ls -li
cat file1-hlink.txt
```

```text
total 4
29800315 -rw-r--r-- 1 hocvien hocvien 39 Nov 27 19:51 file1-hlink.txt
29800316 -rw-r--r-- 1 hocvien hocvien  0 Nov 27 19:51 file2.txt
Xin chao hard link
Them tu ten thu hai
```

Số tên giảm về `1`, dữ liệu vẫn còn nguyên. Dữ liệu chỉ thật sự bị xoá khi **tên cuối cùng** bị xoá. Lỡ tay `rm` một tên thì dữ liệu vẫn còn ở tên kia.

## Soft link: đường tắt trỏ tới tên file

**Soft link** (symbolic link, symlink) giống **shortcut** trên Windows: một file nhỏ riêng (inode riêng), bên trong chỉ ghi **tên** (đường dẫn) của file đích.

```text
ln -s đích tên-link
```

```bash
ln -s file2.txt file2-slink.txt
ls -li
```

```text
total 4
29800315 -rw-r--r-- 1 hocvien hocvien 39 Nov 27 19:51 file1-hlink.txt
29800317 lrwxrwxrwx 1 hocvien hocvien  9 Nov 27 19:51 file2-slink.txt -> file2.txt
29800316 -rw-r--r-- 1 hocvien hocvien  0 Nov 27 19:51 file2.txt
```

| Dấu hiệu | Ý nghĩa |
|---|---|
| Số inode `29800317` | Khác file đích: soft link là một file riêng |
| `l` ở đầu | Loại file là link |
| `-> file2.txt` | Trỏ tới đâu |
| Kích thước `9` | Đúng 9 byte của chuỗi `file2.txt` |
| `rwxrwxrwx` | Quyền của link không có ý nghĩa; quyền thật là của file đích |

Ghi qua link là ghi vào file đích:

```bash
echo F2 > file2-slink.txt
cat file2.txt
```

```text
F2
```

Xoá link không ảnh hưởng file đích:

```bash
rm file2-slink.txt
ls
```

```text
file1-hlink.txt  file2.txt
```

### Xoá file đích: link hỏng

```bash
ln -s file2.txt file2-slink.txt
rm file2.txt
ls -l
cat file2-slink.txt
```

```text
total 4
-rw-r--r-- 1 hocvien hocvien 39 Nov 27 19:51 file1-hlink.txt
lrwxrwxrwx 1 hocvien hocvien  9 Nov 27 19:51 file2-slink.txt -> file2.txt
cat: file2-slink.txt: No such file or directory
```

Link vẫn còn nhưng trỏ vào tên không còn tồn tại: **link hỏng** (broken link). Trong terminal có màu, `ls` tô link hỏng màu đỏ. Tạo lại `file2.txt` thì link tự "sống" lại.

## Thư mục và ổ đĩa khác

```bash
mkdir thumuc
ln thumuc thumuc-hlink
ln -s thumuc tm-link
ls -ld tm-link
```

```text
ln: thumuc: hard link not allowed for directory
lrwxrwxrwx 1 hocvien hocvien 6 Nov 27 19:51 tm-link -> thumuc
```

Hard link không tạo được cho thư mục, và không vượt qua ổ đĩa (phân vùng) khác, vì số inode chỉ có nghĩa trong một ổ. Soft link làm được cả hai, vì nó chỉ ghi đường dẫn.

## So sánh

| | Hard link | Soft link |
|---|---|---|
| Lệnh | `ln đích tên` | `ln -s đích tên` |
| Inode | Cùng inode với đích | Inode riêng |
| Trỏ tới | Dữ liệu (inode) | Tên (đường dẫn) |
| Xoá đích | Vẫn dùng được | Thành link hỏng |
| Thư mục | Không | Được |
| Khác ổ đĩa | Không | Được |
| Nhận ra trong `ls -l` | Số tên ở cột 2 lớn hơn 1 | Chữ `l` đầu dòng và `->` |
| Tốc độ | Như file thường | Chậm hơn chút vì phải đọc đường dẫn rồi mới tìm file |

## Mở rộng (chuẩn LPIC-1)

Chuẩn LPIC-1 mục 104.6 còn có:

| Lệnh | Làm gì |
|---|---|
| `readlink tm-link` | In đích của soft link (`thumuc`) |
| `readlink -f tên` | In đường dẫn tuyệt đối cuối cùng, đi qua mọi tầng link |
| `ln -sf đích tên` | Ghi đè link cũ (**f**orce), dùng khi đổi link sang phiên bản mới |
| `find . -type l` | Tìm mọi soft link |
| `find . -xtype l` | Tìm link hỏng |
| `ls -l` trên thư mục | Cột 2 của thư mục là số tên trỏ tới nó: chính nó, `.` bên trong, và `..` của mỗi thư mục con |

Đường dẫn trong soft link được hiểu **tính từ chỗ đặt link**. `ln -s file2.txt /tmp/x` tạo link `/tmp/x` trỏ tới `/tmp/file2.txt`, không phải file ở thư mục hiện hành. Muốn chắc, dùng đường dẫn tuyệt đối: `ln -s /etc/hostname ten-may`.

## Thực hành

1. Tạo `original.txt`, tạo hard link `hlink.txt`. Ghi một dòng vào `hlink.txt`, xem nội dung cả hai. Xoá `original.txt` rồi kiểm tra `hlink.txt`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   touch original.txt
   ln original.txt hlink.txt
   ls -li original.txt hlink.txt
   echo "dong moi" > hlink.txt
   cat original.txt hlink.txt
   rm original.txt
   cat hlink.txt
   ```

   Cùng số inode; nội dung giống nhau; xoá `original.txt` thì `hlink.txt` vẫn còn `dong moi`.

   </details>

2. Tạo soft link `tenmay` trỏ tới `/etc/hostname`, đọc tên máy qua link. Vì sao bạn đọc được nhưng không ghi được qua link này?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ln -s /etc/hostname tenmay
   cat tenmay
   echo test > tenmay
   ```

   Quyền thật là của `/etc/hostname` (`rw-r--r--`, chủ là root): bạn chỉ được đọc. Lệnh ghi báo `Permission denied`.

   </details>

3. Tạo soft link `nhanh` trỏ tới thư mục `~/thuchanh`, rồi `cd nhanh` và `pwd`. Kết quả là gì?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ln -s ~/thuchanh ~/nhanh
   cd ~/nhanh
   pwd
   ```

   `pwd` in `/home/tên-bạn/nhanh`: shell nhớ đường đi qua link. `pwd -P` in đường thật `/home/tên-bạn/thuchanh`.

   </details>

## Tóm tắt

| Lệnh | Làm gì |
|---|---|
| `ls -i`, `ls -li` | Xem số inode |
| `ln đích tên` | Tạo hard link |
| `ln -s đích tên` | Tạo soft link |
| `readlink tên` | Xem soft link trỏ tới đâu |
| Hard link | Cùng inode, xoá đích vẫn còn, không cho thư mục |
| Soft link | Inode riêng, xoá đích thì hỏng, dùng được cho thư mục và khác ổ |
