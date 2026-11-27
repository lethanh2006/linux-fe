---
summary: find tìm file và thư mục theo tên, loại, kích thước, thời gian sửa, chủ sở hữu và độ sâu, rồi có thể chạy một lệnh trên từng kết quả bằng -exec hoặc in theo ý bằng -printf.
minutes: 40
commands: [find, -name, -type, -size, -mtime, -user, -maxdepth, -exec, -printf]
quiz:
  - q: grep và find khác nhau thế nào?
    options: ["Giống hệt nhau", "grep tìm theo nội dung trong file, find tìm file theo tên và thuộc tính", "find tìm nội dung, grep tìm tên file", "grep chỉ dùng cho thư mục"]
    answer: 1
    explain: "`grep` tìm **chữ bên trong** file. `find` tìm **file** dựa trên tên, loại, kích thước, thời gian, chủ…"
  - q: "Vì sao nên viết `find . -name \"file*.txt\"` có dấu nháy?"
    options: ["Để find chạy nhanh hơn", "Để shell không bung dấu * trước khi find nhận được mẫu", "Vì tên file có dấu cách", "Không cần nháy cũng được"]
    answer: 1
    explain: Không có nháy, shell bung `file*.txt` thành các tên file ở thư mục hiện hành rồi mới đưa cho find, gây kết quả sai hoặc lỗi.
  - q: "`find ~ -type f -size +100M` tìm gì?"
    options: ["Thư mục lớn hơn 100 MB", "File nhỏ hơn 100 MB", "File lớn hơn 100 MB trong thư mục nhà", "File đúng 100 MB"]
    answer: 2
    explain: "`-type f` là file thường, `+100M` là lớn hơn 100 MB. `-100M` là nhỏ hơn."
  - q: "`find . -mtime -1` tìm file nào?"
    options: ["Nội dung được sửa trong vòng 1 ngày qua", "Sửa cách đây hơn 1 ngày", "Tạo đúng 1 ngày trước", "Chưa bao giờ sửa"]
    answer: 0
    explain: "`-mtime` tính số ngày trọn vẹn từ lần sửa nội dung. `-1` là dưới 24 giờ; `+7` cần từ 8 ngày trọn vẹn trở lên vì phần lẻ bị bỏ."
  - q: "Trong `find . -name \"*.log\" -exec rm {} \\;`, `{}` là gì?"
    options: ["Một thư mục rỗng", "Chỗ find đặt tên từng file tìm được", "Ký tự đại diện", "Lỗi cú pháp"]
    answer: 1
    explain: "`{}` được thay bằng tên từng file tìm được. `\\;` đánh dấu hết lệnh."
---

> Bài này đi theo video TITV bài 16.

## find dùng làm gì

`grep` (bài 14) tìm **chữ bên trong file**. `find` thì tìm **chính các file**: theo tên, loại, kích thước, thời gian sửa, chủ sở hữu…

```text
find [nơi-tìm] [điều-kiện] [hành-động]
```

| Phần | Ví dụ | Ý nghĩa |
|---|---|---|
| Nơi tìm | `.`, `~`, `/etc` | Tìm trong thư mục này và **mọi thư mục con** |
| Điều kiện | `-name "*.txt"`, `-size +10M` | Chỉ lấy file thoả điều kiện. Nhiều điều kiện thì phải thoả **tất cả** |
| Hành động | `-exec ...`, `-printf ...` | Làm gì với mỗi kết quả. Mặc định là in đường dẫn |

Chuẩn bị thư mục thực hành:

```bash
mkdir -p ~/thuchanh/bai16/con/chau && cd ~/thuchanh/bai16
touch baitap.txt file1.txt file2.txt "file 1.txt" con/file.txt con/chau/file.txt
truncate -s 12M lon.bin && truncate -s 2M vua.bin
touch -d "10 days ago" baitap.txt con/file.txt
tree
```

| Lệnh | Ý nghĩa |
|---|---|
| `truncate -s 12M lon.bin` | Tạo file `lon.bin` dung lượng 12 MB, để thử tìm theo kích thước |
| `touch -d "10 days ago" ...` | Đặt giờ sửa của hai file về 10 ngày trước, để thử tìm theo thời gian |

```text
.
├── baitap.txt
├── con
│   ├── chau
│   │   └── file.txt
│   └── file.txt
├── file 1.txt
├── file1.txt
├── file2.txt
├── lon.bin
└── vua.bin

3 directories, 8 files
```

## Tìm theo tên: -name

```bash
find . -name baitap.txt
find . -name file.txt
```

```text
./baitap.txt
./con/chau/file.txt
./con/file.txt
```

`find` đi vào mọi thư mục con, nên tìm thấy cả hai file `file.txt`. Giới hạn độ sâu bằng `-maxdepth`:

```bash
find . -maxdepth 2 -name file.txt
```

```text
./con/file.txt
```

`-maxdepth 1` là chỉ thư mục hiện hành, `2` là thêm một cấp con. Nên đặt `-maxdepth` **trước** các điều kiện khác; bản `find` cũ sẽ cảnh báo nếu đặt sau.

### Tên có dấu cách

```bash
find . -name "file 1.txt"
find . -name file\ 1.txt
```

```text
./file 1.txt
./file 1.txt
```

Đặt tên trong nháy, hoặc thêm `\` trước dấu cách.

### Ký tự đại diện: luôn để trong nháy

```bash
find . -name "file*.txt"
find . -name file*.txt
```

```text
./con/chau/file.txt
./con/file.txt
./file1.txt
./file 1.txt
./file2.txt
find: paths must precede expression: `file1.txt'
find: possible unquoted pattern after predicate `-name'?
```

Có nháy, `find` nhận nguyên mẫu `file*.txt` và tự so với mọi file. Không nháy, shell bung `file*.txt` thành `file1.txt file 1.txt file2.txt` (các file ở thư mục hiện hành) rồi mới đưa cho `find`, nên lỗi. Nhớ lại bài 11: shell bung ký tự đại diện trước khi chạy lệnh.

`-iname` giống `-name` nhưng không phân biệt hoa thường: `find . -iname "BAITAP.TXT"` vẫn tìm ra `./baitap.txt`.

## Tìm theo loại: -type

| Điều kiện | Loại |
|---|---|
| `-type f` | File thường |
| `-type d` | Thư mục |
| `-type l` | Link |

```bash
find . -type d
```

```text
.
./con
./con/chau
```

## Tìm theo kích thước: -size

```bash
find . -type f -size +10M
find . -type f -size +1M -size -5M
```

| Phần | Ý nghĩa |
|---|---|
| `-size +10M` | Lớn hơn 10 MiB |
| `-size -5M` | Số khối MiB sau khi làm tròn lên nhỏ hơn 5; không phải mọi file dưới 5 MiB |
| `-size 10M` | Số khối MiB sau khi làm tròn lên bằng 10; gồm file trên 9 MiB đến hết 10 MiB |
| Đơn vị | `c` là byte; `k`, `M`, `G` lần lượt là KiB, MiB, GiB. Không ghi đơn vị thì tính theo khối 512 byte |

```text
./lon.bin
./vua.bin
```

Hai điều kiện `-size +1M -size -5M` phải cùng thoả: lớn hơn 1 MiB và không quá 4 MiB. GNU find làm tròn kích thước lên theo đơn vị trước khi so sánh, nên file 4,5 MiB không khớp `-size -5M`. Muốn so chính xác nhỏ hơn 5 MiB theo byte, dùng `-size -5242880c`.

Ổ đầy, tìm file lớn hơn 1 GiB trong thư mục nhà: `find ~ -type f -size +1G`. Tìm trên cả máy có thể cần `sudo` để đọc thư mục bị giới hạn quyền và có thể chạy lâu (bấm `Ctrl+C` để dừng).

## Tìm theo thời gian: -mtime, -atime, -ctime

| Điều kiện | Ý nghĩa |
|---|---|
| `-mtime` | Lần **sửa nội dung** cuối (**m**odify) |
| `-atime` | Lần **đọc** cuối (**a**ccess) |
| `-ctime` | Lần **đổi trạng thái** cuối (**c**hange): sửa nội dung, đổi tên, đổi quyền, đổi chủ. Không phải "thời gian tạo" |

Số đi kèm tính theo số khoảng **24 giờ trọn vẹn**, bỏ phần lẻ: `-1` là dưới 24 giờ, còn `+7` cần từ 8 ngày trọn vẹn trở lên. File sửa cách đây 7,5 ngày chưa khớp `+7`; `-mtime 1` khớp tuổi từ 24 đến dưới 48 giờ. Mặc định đây không phải mốc nửa đêm của ngày trên lịch.

```bash
find . -mtime +7
find . -type f -mtime -1 | wc -l
```

```text
./baitap.txt
./con/file.txt
6
```

Hai file đã chỉnh giờ về 10 ngày trước khớp `+7`. Sáu file còn lại vừa tạo nên khớp `-1`. Muốn tính theo phút thì dùng `-mmin`, ví dụ `-mmin -30`.

## Tìm theo chủ sở hữu: -user, -group

```bash
find /home -type f -user hocvien -name "*.bin"
```

```text
find: ‘/home/ubuntu’: Permission denied
/home/hocvien/thuchanh/bai16/lon.bin
/home/hocvien/thuchanh/bai16/vua.bin
find: ‘/home/an’: Permission denied
```

Thư mục nhà của người khác không vào được nên báo `Permission denied`. Có hai cách: chạy bằng `sudo find ...`, hoặc giấu lỗi bằng `2> /dev/null` (bài 13). `-group tên-nhóm` tìm theo nhóm sở hữu.

## Làm gì đó với kết quả

### -exec: chạy lệnh trên từng file

```bash
find . -name "*.bin" -exec ls -lh {} \;
```

| Phần | Ý nghĩa |
|---|---|
| `-exec` | Chạy lệnh sau đó trên **từng** file tìm được |
| `ls -lh` | Lệnh cần chạy |
| `{}` | Chỗ `find` đặt đường dẫn file tìm được |
| `\;` | Đánh dấu hết lệnh. Phải có `\` để shell không hiểu `;` theo nghĩa riêng của nó |

```text
-rw-r--r-- 1 hocvien hocvien 12M Nov 27 19:31 ./lon.bin
-rw-r--r-- 1 hocvien hocvien 2.0M Nov 27 19:31 ./vua.bin
```

Kết quả của `-exec` chuyển hướng vào file được như mọi lệnh khác:

```bash
find . -name "file*.txt" -exec echo "Tim thay: {}" \; > ketqua.txt
cat ketqua.txt
```

```text
Tim thay: ./con/chau/file.txt
Tim thay: ./con/file.txt
Tim thay: ./file1.txt
Tim thay: ./file 1.txt
Tim thay: ./file2.txt
```

> **Cẩn thận** với `-exec rm {} \;`: chạy `find` **không có** `-exec` trước để xem danh sách sẽ bị xoá.

### -printf: in theo định dạng

```bash
find . -name "*.bin" -printf "%f %s\n"
```

| Mã | Ý nghĩa |
|---|---|
| `%f` | Tên file (không có đường dẫn) |
| `%p` | Đường dẫn đầy đủ |
| `%s` | Kích thước, tính bằng byte |
| `\n` | Xuống dòng |

```text
lon.bin 12582912
vua.bin 2097152
```

## Mở rộng (chuẩn LPIC-1)

Chuẩn LPIC-1 mục 104.7 còn có:

| Lệnh, điều kiện | Ý nghĩa |
|---|---|
| `-perm 644` | Quyền đúng bằng 644 (quyền học ở bài 30) |
| `-empty` | File hoặc thư mục rỗng |
| `-newer mau.txt` | Sửa sau file `mau.txt` |
| `! -name "*.txt"` | Phủ định: không phải `.txt` |
| `-o` | Hoặc: `-name "*.jpg" -o -name "*.png"` |
| `-delete` | Xoá các file tìm được (nguy hiểm như `rm`) |
| `-exec ... {} +` | Gom nhiều file vào một lần chạy lệnh, nhanh hơn `\;` |
| `locate tên` | Tìm theo tên trong một cơ sở dữ liệu dựng sẵn, nhanh hơn `find` nhiều. Cài gói `plocate`, cập nhật dữ liệu bằng `sudo updatedb` |

Tìm `passwd` trên cả máy, giấu các lỗi không có quyền:

```bash
find / -name passwd -type f 2> /dev/null
```

```text
/usr/share/bash-completion/completions/passwd
/usr/share/lintian/overrides/passwd
/usr/bin/passwd
/etc/passwd
/etc/pam.d/passwd
```

## Thực hành

1. Tìm trong `/etc` (chỉ cấp đầu tiên) các file có đuôi `.conf`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   find /etc -maxdepth 1 -type f -name "*.conf"
   ```

   </details>

2. Trong `~/thuchanh`, tìm các file sửa trong vòng 1 ngày qua và lớn hơn 1 MB.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   find ~/thuchanh -type f -mtime -1 -size +1M
   ```

   Ra `lon.bin` và `vua.bin`.

   </details>

3. Tìm mọi thư mục con trong `~/thuchanh` và đếm xem có bao nhiêu.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   find ~/thuchanh -type d | wc -l
   ```

   Con số bao gồm cả chính thư mục `~/thuchanh`.

   </details>

4. In tên và kích thước (byte) của mọi file `.txt` trong `bai16`, lưu vào `kichthuoc.txt`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   cd ~/thuchanh/bai16
   find . -name "*.txt" -printf "%f %s\n" > kichthuoc.txt
   cat kichthuoc.txt
   ```

   </details>

5. Xoá các file `.bin` trong `bai16`, xem trước rồi mới xoá.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   find ~/thuchanh/bai16 -name "*.bin"
   find ~/thuchanh/bai16 -name "*.bin" -exec rm {} \;
   ```

   </details>

## Tóm tắt

| Điều kiện | Ý nghĩa |
|---|---|
| `-name "mẫu"` | Theo tên, luôn để mẫu trong nháy |
| `-maxdepth N` | Chỉ đi sâu N cấp |
| `-type f` / `-type d` | Chỉ file / chỉ thư mục |
| `-size +10M` / `-size -1024c` | Lớn hơn 10 MiB / nhỏ hơn 1024 byte |
| `-mtime -1` / `+7` | Sửa dưới 24 giờ / từ 8 ngày trọn vẹn trở lên |
| `-user tên` | Theo chủ sở hữu |
| `-exec lệnh {} \;` | Chạy lệnh trên từng file |
| `-printf "%f %s\n"` | In tên và kích thước |
