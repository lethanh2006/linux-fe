---
summary: Bộ lệnh dùng hằng ngày với file và thư mục. ls để liệt kê, mkdir, tree, du, rmdir cho thư mục, echo, touch, cat để tạo và xem file, cp, mv, rm để chép, di chuyển, xoá.
minutes: 60
commands: [ls, mkdir, tree, du, rmdir, echo, touch, cat, cp, mv, rm]
quiz:
  - q: "`mkdir a/b/c` báo lỗi `No such file or directory` vì `a` chưa có. Thêm tuỳ chọn nào để tạo luôn các thư mục cha?"
    options: ["-r", "-f", "-p", "-a"]
    answer: 2
    explain: "`mkdir -p` (parents) tạo luôn các thư mục cha còn thiếu, và không báo lỗi nếu thư mục đã có."
  - q: "`rmdir thumuc` báo `Directory not empty`. Lệnh nào xoá được thư mục cùng mọi thứ bên trong?"
    options: ["rm -r thumuc", "rmdir -f thumuc", "rm thumuc", "del thumuc"]
    answer: 0
    explain: "`rmdir` chỉ xoá thư mục rỗng. `rm -r` xoá đệ quy cả thư mục lẫn nội dung bên trong."
  - q: "`echo \"abc\" > ghichu.txt` khi `ghichu.txt` đã có nội dung thì sao?"
    options: ["Thêm abc xuống cuối file", "Báo lỗi file đã tồn tại", "Nội dung cũ bị xoá, file chỉ còn abc", "Tạo file ghichu.txt.1"]
    answer: 2
    explain: "`>` ghi đè. Muốn thêm xuống cuối thì dùng `>>`."
  - q: "`cp thumuc2 thumuc4/` báo `-r not specified; omitting directory`. Vì sao?"
    options: ["thumuc4 chưa tồn tại", "Chép thư mục phải thêm -r", "Không có quyền", "Tên thư mục có số"]
    answer: 1
    explain: "`cp` mặc định chỉ chép file. Chép thư mục cùng nội dung phải dùng `cp -r`."
  - q: Lệnh nào đổi tên file `a.txt` thành `b.txt`?
    options: ["cp a.txt b.txt", "rename a.txt", "mv a.txt b.txt", "touch b.txt"]
    answer: 2
    explain: "`mv` vừa di chuyển vừa đổi tên. `cp` sẽ tạo bản sao và giữ nguyên `a.txt`."
  - q: "Muốn `ls` hiện cả file ẩn, dạng dài, dung lượng dễ đọc thì gõ gì?"
    options: ["ls -lah", "ls -R", "ls -tS", "ls --color"]
    answer: 0
    explain: "`-l` dạng dài, `-a` cả file ẩn, `-h` dung lượng dạng K, M, G. Ghép lại thành `-lah`."
---

> Bài này đi theo video TITV bài 10. Video dài khoảng một giờ, nên chia ra học từng phần: liệt kê, thư mục, file, chép, di chuyển, xoá.

Tạo một thư mục riêng để thực hành, mọi lệnh trong bài chạy ở đây:

```bash
mkdir -p ~/thuchanh/bai10
cd ~/thuchanh/bai10
```

## ls: liệt kê file và thư mục

```text
ls [tuỳ chọn] [đường dẫn]
```

Không ghi đường dẫn thì `ls` liệt kê thư mục hiện hành.

```bash
ls /
```

```text
bin		   etc		      lib64  proc  sbin.usr-is-merged  usr
bin.usr-is-merged  home		      media  root  srv		       var
boot		   lib		      mnt    run   sys
dev		   lib.usr-is-merged  opt    sbin  tmp
```

Các tuỳ chọn hay dùng:

| Tuỳ chọn | Ý nghĩa |
|---|---|
| `-l` | Dạng dài (**l**ong): quyền, chủ, nhóm, dung lượng, ngày sửa, tên |
| `-a` | Cả file ẩn (**a**ll), kể cả `.` và `..` |
| `-h` | Dung lượng dễ đọc (**h**uman): `1.4M`, `139K`. Đi kèm `-l` |
| `-R` | Liệt kê cả thư mục con, cháu (**R**ecursive) |
| `-t` | Sắp theo thời gian sửa, mới nhất lên đầu (**t**ime) |
| `-r` | Đảo ngược thứ tự (**r**everse) |
| `-S` | Sắp theo dung lượng, lớn nhất lên đầu (**S**ize) |
| `--color` | Tô màu theo loại file (Ubuntu bật sẵn) |
| `--group-directories-first` | Liệt kê thư mục trước, file sau |

Tuỳ chọn ngắn ghép được với nhau: `ls -l -a -h` viết thành `ls -lah`.

### Dạng dài: ls -l

```bash
ls -la ~
```

```text
total 20
drwxr-x--- 2 hocvien hocvien 4096 Nov 27 16:23 .
drwxr-xr-x 1 root    root    4096 Nov 27 19:25 ..
-rw-r--r-- 1 hocvien hocvien  220 Mar 31  2024 .bash_logout
-rw-r--r-- 1 hocvien hocvien 3771 Mar 31  2024 .bashrc
-rw-r--r-- 1 hocvien hocvien  807 Mar 31  2024 .profile
```

Đọc dòng `-rw-r--r-- 1 hocvien hocvien 3771 Mar 31  2024 .bashrc`:

| Cột | Giá trị | Ý nghĩa |
|---|---|---|
| 1 | `-rw-r--r--` | Ký tự đầu là loại file (bài 6), 9 ký tự sau là quyền (bài 30) |
| 2 | `1` | Số tên (hard link) trỏ tới file này (bài 32) |
| 3 | `hocvien` | Người dùng sở hữu |
| 4 | `hocvien` | Nhóm sở hữu |
| 5 | `3771` | Dung lượng, tính bằng byte |
| 6 | `Mar 31  2024` | Lần sửa cuối. File sửa trong 6 tháng gần đây thì hiện giờ thay cho năm |
| 7 | `.bashrc` | Tên |

Dòng `total 20` là tổng dung lượng các file, tính bằng khối 1 KB.

### Dung lượng dễ đọc, sắp theo thời gian

```bash
ls -lh /usr/bin/bash /usr/bin/ls
```

```text
-rwxr-xr-x 1 root root 1.4M Mar 31  2024 /usr/bin/bash
-rwxr-xr-x 1 root root 139K Aug 25 22:09 /usr/bin/ls
```

```bash
ls -ltr /etc | tail -3
```

| Phần | Ý nghĩa |
|---|---|
| `-ltr` | Dạng dài, sắp theo thời gian, đảo ngược: file mới sửa nhất nằm **cuối** |
| <code>&#124; tail -3</code> | Chỉ lấy 3 dòng cuối (đường ống học ở bài 13, `tail` ở bài 12) |

```text
-rw-r----- 1 root shadow   532 Nov 27 19:25 gshadow
-rw-r--r-- 1 root root      57 Nov 27 19:25 subuid
-rw-r--r-- 1 root root      57 Nov 27 19:25 subgid
```

`ls -ltr` hay dùng để tìm file vừa thay đổi, ví dụ file nhật ký mới nhất.

> **Mẹo Tab:** gõ `cd /us` rồi bấm `Tab`, shell tự điền thành `cd /usr/`. Có nhiều tên trùng phần đầu thì bấm `Tab` hai lần để xem danh sách.

## mkdir: tạo thư mục

`mkdir` (**m**a**k**e **dir**ectory) tạo một hoặc nhiều thư mục:

```bash
mkdir thumuc1
ls
mkdir thumuc2 thumuc3 thumuc4
ls
```

```text
thumuc1
thumuc1  thumuc2  thumuc3  thumuc4
```

Tạo thư mục lồng nhau khi thư mục cha chưa có thì lỗi:

```bash
mkdir a/b/c
```

```text
mkdir: cannot create directory ‘a/b/c’: No such file or directory
```

Thêm `-p` (**p**arents) để tạo luôn các thư mục cha:

```bash
mkdir -p a/b/c
```

`-p` cũng không báo lỗi khi thư mục đã có, nên hay dùng trong script.

## tree: xem cây thư mục

`tree` vẽ cây cho dễ nhìn. Chưa có thì cài bằng `sudo apt install tree`.

```bash
tree
```

```text
.
├── a
│   └── b
│       └── c
├── thumuc1
├── thumuc2
├── thumuc3
└── thumuc4

8 directories, 0 files
```

| Tuỳ chọn | Ý nghĩa |
|---|---|
| `-L 2` | Chỉ vẽ tới cấp 2 (**L**evel) |
| `-d` | Chỉ vẽ thư mục, bỏ file (**d**irectory) |
| `-a` | Vẽ cả file ẩn |

```bash
tree -d -L 1 /usr
```

```text
/usr
├── bin
├── games
├── include
├── lib
├── lib64
├── libexec
├── local
├── sbin
├── share
└── src

11 directories
```

Vẽ cả cây lớn như `tree /` sẽ chạy rất lâu; bấm `Ctrl+C` để dừng.

## du: dung lượng thư mục

`du` (**d**isk **u**sage) tính dung lượng của thư mục và mọi thứ bên trong:

```bash
du -h
```

```text
4.0K	./thumuc1
4.0K	./a/b/c
8.0K	./a/b
12K	./a
4.0K	./thumuc2
4.0K	./thumuc4
4.0K	./thumuc3
32K	.
```

| Tuỳ chọn | Ý nghĩa |
|---|---|
| `-h` | Dễ đọc: K, M, G. Thiếu `-h` thì số tính bằng KB |
| `-s` | Chỉ in tổng (**s**ummary), không in từng thư mục con |

```bash
du -sh /usr/share/doc
```

```text
11M	/usr/share/doc
```

Thư mục rỗng vẫn chiếm 4.0K, là chỗ lưu danh sách tên bên trong nó.

## rmdir: xoá thư mục rỗng

```bash
rmdir thumuc1
rmdir a
```

```text
rmdir: failed to remove 'a': Directory not empty
```

`rmdir` (**r**e**m**ove **dir**ectory) **chỉ xoá thư mục rỗng**. `a` còn `b` bên trong nên không xoá được. `-p` xoá thư mục cuối rồi lần ngược lên các thư mục cha (nếu chúng rỗng):

```bash
rmdir -p a/b/c
ls
```

```text
thumuc2  thumuc3  thumuc4
```

`rmdir -p a/b/c` xoá `c`, rồi `b`, rồi `a`.

## Tạo file: echo và touch

`echo` in chữ ra màn hình. Thêm `>` để ghi chữ vào file thay vì in ra:

```bash
echo "Hoc Linux moi ngay" > ghichu.txt
cat ghichu.txt
echo "Dong thu hai" >> ghichu.txt
cat ghichu.txt
```

```text
Hoc Linux moi ngay
Hoc Linux moi ngay
Dong thu hai
```

| Ký hiệu | Ý nghĩa |
|---|---|
| `>` | Ghi vào file. Chưa có file thì tạo; **có rồi thì xoá nội dung cũ** |
| `>>` | Thêm xuống cuối file. Chưa có thì tạo |

Thử `>` lần nữa, nội dung cũ mất sạch:

```bash
echo "Ghi de" > ghichu.txt
cat ghichu.txt
```

```text
Ghi de
```

Bài 13 học kỹ về `>` và `>>`.

`touch` tạo **file rỗng** (0 byte). File đã có thì `touch` chỉ cập nhật giờ sửa, không đụng tới nội dung:

```bash
touch baocao.doc
ls -l
```

```text
total 16
-rw-r--r-- 1 hocvien hocvien    0 Nov 27 19:25 baocao.doc
-rw-r--r-- 1 hocvien hocvien    7 Nov 27 19:25 ghichu.txt
drwxr-xr-x 2 hocvien hocvien 4096 Nov 27 19:25 thumuc2
drwxr-xr-x 2 hocvien hocvien 4096 Nov 27 19:25 thumuc3
drwxr-xr-x 2 hocvien hocvien 4096 Nov 27 19:25 thumuc4
```

`cat tên-file` in nội dung file ra màn hình. Bài 12 học thêm `more`, `less`, `head`, `tail`.

## cp: chép

```text
cp [tuỳ chọn] nguồn đích
```

```bash
cp ghichu.txt ghichu-ban-sao.txt
cp ghichu.txt thumuc2/
cp ghichu.txt thumuc2/ten-moi.txt
tree
```

| Lệnh | Kết quả |
|---|---|
| `cp ghichu.txt ghichu-ban-sao.txt` | Bản sao tên mới, cùng thư mục |
| `cp ghichu.txt thumuc2/` | Bản sao giữ tên cũ, nằm trong `thumuc2` |
| `cp ghichu.txt thumuc2/ten-moi.txt` | Bản sao trong `thumuc2`, đặt tên mới |

```text
.
├── baocao.doc
├── ghichu-ban-sao.txt
├── ghichu.txt
├── thumuc2
│   ├── ghichu.txt
│   └── ten-moi.txt
├── thumuc3
└── thumuc4

4 directories, 5 files
```

Chép thư mục phải có `-r` (**r**ecursive, chép cả bên trong):

```bash
cp thumuc2 thumuc4/
cp -r thumuc2 thumuc4/
tree thumuc4
```

```text
cp: -r not specified; omitting directory 'thumuc2'
thumuc4
└── thumuc2
    ├── ghichu.txt
    └── ten-moi.txt

2 directories, 2 files
```

> **Cẩn thận:** nếu file đích đã có, `cp` **ghi đè không hỏi**. Thêm `-i` để được hỏi trước.

## mv: di chuyển và đổi tên

`mv` (**m**o**v**e) giống "cắt rồi dán": file chuyển sang chỗ mới, chỗ cũ không còn. Đích nằm cùng thư mục thì đó là **đổi tên**.

```bash
mv ghichu-ban-sao.txt thumuc3/
mv baocao.doc baocao-2026.doc
ls
```

```text
baocao-2026.doc  ghichu.txt  thumuc2  thumuc3  thumuc4
```

`mv` chuyển cả thư mục mà không cần `-r`:

```bash
mv thumuc4 thumuc3/
tree
```

```text
.
├── baocao-2026.doc
├── ghichu.txt
├── thumuc2
│   ├── ghichu.txt
│   └── ten-moi.txt
└── thumuc3
    ├── ghichu-ban-sao.txt
    └── thumuc4
        └── thumuc2
            ├── ghichu.txt
            └── ten-moi.txt

5 directories, 7 files
```

Khi đích đã có file cùng tên, `mv` mặc định **ghi đè không hỏi**:

| Tuỳ chọn | Ý nghĩa |
|---|---|
| `-i` | Hỏi trước khi ghi đè (**i**nteractive). Gõ `y` để đồng ý, `n` để thôi |
| `-f` | Ghi đè, không hỏi (**f**orce) |

```bash
mv -i ghichu.txt thumuc2/ghichu.txt
```

```text
mv: overwrite 'thumuc2/ghichu.txt'? n
```

## rm: xoá

```bash
rm thumuc2/ten-moi.txt
rm thumuc3
rm -r thumuc3
ls
```

```text
rm: cannot remove 'thumuc3': Is a directory
baocao-2026.doc  ghichu.txt  thumuc2
```

| Tuỳ chọn | Ý nghĩa |
|---|---|
| (không có) | Xoá file. Không xoá được thư mục |
| `-r` | Xoá thư mục cùng mọi thứ bên trong (**r**ecursive) |
| `-i` | Hỏi trước từng file |
| `-f` | Không hỏi, không báo lỗi nếu file không tồn tại (**f**orce) |

```bash
rm -i thumuc2/ghichu.txt
```

```text
rm: remove regular file 'thumuc2/ghichu.txt'? n
```

> **Nguy hiểm:** Linux **không có thùng rác** khi xoá bằng `rm`. Xoá là mất. Đặc biệt cẩn thận với `rm -rf` và với `sudo rm`: gõ nhầm `sudo rm -rf /var` có thể làm hỏng cả máy. Trước khi xoá bằng ký tự đại diện (bài 11), chạy `ls` với cùng mẫu để xem sẽ xoá những gì.

## Mở rộng (chuẩn LPIC-1)

Chuẩn LPIC-1 mục 103.3 còn yêu cầu mấy tuỳ chọn sau:

| Lệnh | Làm gì |
|---|---|
| `cp -a nguồn đích` | Chép giữ nguyên quyền, chủ, thời gian, link (**a**rchive). Dùng khi sao lưu |
| `cp -p` | Giữ quyền và thời gian (**p**reserve) |
| `cp -u`, `mv -u` | Chỉ chép, chuyển khi nguồn mới hơn đích (**u**pdate) |
| `mv -n` | Không bao giờ ghi đè (**n**o-clobber) |
| `cp -v`, `mv -v`, `rm -v` | In ra từng file đã xử lý (**v**erbose) |
| `file tên` | Cho biết nội dung file thuộc loại gì (văn bản, ảnh, chương trình), không dựa vào đuôi file |

```bash
file ghichu.txt /usr/bin/ls /etc
```

```text
ghichu.txt:  ASCII text
/usr/bin/ls: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=44900829b39271d878615772bb2a6ffa422f0891, for GNU/Linux 3.2.0, stripped
/etc:        directory
```

## Thực hành

Bài tập làm lần lượt, giống cuối video. Đoán trước kết quả rồi mới chạy.

1. Tạo thư mục `~/thuchanh/bt10` và đi vào đó.
2. Tạo hai file rỗng `a.txt`, `b.txt`.
3. Liệt kê dạng dài để chắc hai file đã có.
4. Chép `a.txt` thành `a-sao.txt`.
5. Tạo thư mục con `luu`.
6. Chuyển `a-sao.txt` vào `luu`.
7. Đi vào `luu`, liệt kê.
8. Quay lại thư mục cha.
9. Đổi tên `b.txt` thành `c.txt`.
10. Xem dung lượng thư mục `bt10`.
11. Xoá thư mục `luu`, có hỏi xác nhận từng file.

<details>
<summary>Xem đáp án</summary>

```bash
mkdir -p ~/thuchanh/bt10
cd ~/thuchanh/bt10
touch a.txt b.txt
ls -l
cp a.txt a-sao.txt
mkdir luu
mv a-sao.txt luu/
cd luu
ls
cd ..
mv b.txt c.txt
du -sh .
rm -ri luu
```

`rm -ri luu` hỏi `descend into directory 'luu'?`, rồi hỏi từng file, cuối cùng hỏi xoá chính thư mục. Gõ `y` cho mỗi câu.

</details>

## Tóm tắt

| Lệnh | Làm gì |
|---|---|
| `ls -lah` | Liệt kê dạng dài, cả file ẩn, dung lượng dễ đọc |
| `ls -ltr` | File mới sửa nhất nằm cuối |
| `mkdir -p a/b/c` | Tạo thư mục, kể cả thư mục cha |
| `tree -L 2` | Vẽ cây 2 cấp |
| `du -sh thư-mục` | Tổng dung lượng thư mục |
| `rmdir thư-mục` | Xoá thư mục rỗng |
| `echo "chữ" > file` / `>>` | Ghi đè / thêm vào file |
| `touch file` | Tạo file rỗng |
| `cat file` | Xem nội dung |
| `cp nguồn đích`, `cp -r` | Chép file, chép thư mục |
| `mv nguồn đích` | Di chuyển hoặc đổi tên |
| `rm file`, `rm -r thư-mục` | Xoá file, xoá thư mục. Không có thùng rác |
