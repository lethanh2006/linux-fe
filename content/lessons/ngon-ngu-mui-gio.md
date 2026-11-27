---
summary: Locale quyết định ngôn ngữ thông báo, cách hiển thị ngày tháng, số, thứ tự sắp xếp chữ và bảng mã ký tự. Bài này giải thích các biến LANG, LC_*, LC_ALL, cách tạo và đổi locale (locale-gen, localectl), bảng mã UTF-8 và cách chuyển bảng mã bằng iconv — để tiếng Việt có dấu hiển thị đúng. Kèm cách gõ tiếng Việt trên Ubuntu desktop (TITV bài 36).
minutes: 30
commands: [locale, locale -a, locale-gen, localectl, LANG, LC_ALL, iconv, file -i]
quiz:
  - q: Biến nào có quyền ưu tiên cao nhất, ghi đè mọi thiết lập ngôn ngữ khác?
    options: ["LANG", "LC_TIME", "LC_ALL", "LANGUAGE"]
    answer: 2
    explain: "Thứ tự ưu tiên: `LC_ALL` > từng `LC_*` (LC_TIME, LC_NUMERIC…) > `LANG`. `LC_ALL` thường chỉ đặt tạm cho một lệnh, ví dụ `LC_ALL=C sort`."
  - q: "Vì sao trong script người ta hay viết `LC_ALL=C sort` hoặc `LANG=C`?"
    options: ["Cho chạy nhanh hơn và kết quả giống nhau trên mọi máy (thứ tự byte, thông báo tiếng Anh)", "Để hiện tiếng Việt", "Để tắt màu", "Bắt buộc phải có"]
    answer: 0
    explain: "Kết quả của `sort`, `ls`, thông báo lỗi thay đổi theo locale. Locale `C` cho kết quả cố định, giúp script không chạy khác nhau giữa các máy."
  - q: "Gõ `LC_TIME=vi_VN.UTF-8 date` báo không có locale. Cần làm gì?"
    options: ["Cài lại Linux", "Tạo locale đó: sudo locale-gen vi_VN.UTF-8", "Đổi múi giờ", "Cài font tiếng Việt"]
    answer: 1
    explain: "Locale phải được tạo (generate) trước khi dùng. Xem những locale đã có bằng `locale -a`."
  - q: File văn bản từ Windows cũ hiển thị tiếng Việt thành ký tự lạ. Công cụ nào chuyển bảng mã sang UTF-8?
    options: ["tr", "iconv -f CP1258 -t UTF-8", "dos2unix", "gzip"]
    answer: 1
    explain: "`iconv` chuyển giữa các bảng mã. Kiểm tra bảng mã hiện tại bằng `file -i`. (CP1258 là bảng mã tiếng Việt của Windows. Văn bản cũ còn hay dùng bảng mã TCVN3 hoặc VNI.)"
---

## Locale là gì

**Locale** là bộ thiết lập về ngôn ngữ và văn hoá: thông báo hiện bằng tiếng gì, ngày viết `27/11/2026` hay `11/27/2026`, số dùng dấu phẩy hay dấu chấm, chữ được sắp xếp theo thứ tự nào, bảng mã ký tự là gì.

Tên locale có dạng `ngôn-ngữ_QUỐC-GIA.BẢNG-MÃ`:

| Locale | Ý nghĩa |
|---|---|
| `vi_VN.UTF-8` | Tiếng Việt, Việt Nam, bảng mã UTF-8 |
| `en_US.UTF-8` | Tiếng Anh, Mỹ, UTF-8. Phổ biến nhất trên server |
| `C.UTF-8` | Locale tối thiểu (tiếng Anh, sắp xếp theo byte) nhưng hiểu UTF-8. Mặc định của Ubuntu bản server tối giản |
| `C` (hay `POSIX`) | Locale tối thiểu, chỉ hiểu ASCII |

## Xem locale hiện tại

```bash
locale
```

```text
LANG=C.UTF-8
LANGUAGE=
LC_CTYPE="C.UTF-8"
LC_NUMERIC="C.UTF-8"
LC_TIME="C.UTF-8"
LC_COLLATE="C.UTF-8"
LC_MONETARY="C.UTF-8"
LC_MESSAGES="C.UTF-8"
...
LC_ALL=
```

| Biến | Điều khiển |
|---|---|
| `LANG` | Giá trị mặc định cho mọi mục chưa được đặt riêng |
| `LC_CTYPE` | Bảng mã, phân loại ký tự (chữ hoa / thường) |
| `LC_NUMERIC` | Định dạng số |
| `LC_TIME` | Định dạng ngày giờ |
| `LC_COLLATE` | Thứ tự sắp xếp chữ |
| `LC_MONETARY` | Định dạng tiền tệ |
| `LC_MESSAGES` | Ngôn ngữ của thông báo |
| `LC_ALL` | **Ghi đè tất cả** các mục trên |
| `LANGUAGE` | Danh sách ngôn ngữ dự phòng cho thông báo (GNU) |

Thứ tự ưu tiên: **`LC_ALL` > `LC_xxx` > `LANG`**.

> Khi SSH vào server, máy của bạn có thể gửi kèm các biến `LANG`, `LC_*` của nó. Nếu server chưa tạo locale đó, bạn sẽ gặp cảnh báo kiểu `setlocale: LC_ALL: cannot change locale`. Cách sửa: tạo locale đó trên server, hoặc bỏ dòng `SendEnv LANG LC_*` trong `/etc/ssh/ssh_config` trên máy của bạn.

## Tạo và dùng locale

```bash
locale -a
sudo locale-gen vi_VN.UTF-8
locale -a
```

```text
C
C.utf8
POSIX
en_US.utf8
  vi_VN.UTF-8... done
Generation complete.
C
C.utf8
POSIX
en_US.utf8
vi_VN
vi_VN.utf8
```

| Lệnh | Làm gì |
|---|---|
| `locale -a` | Liệt kê các locale đã được tạo trên máy |
| `sudo locale-gen vi_VN.UTF-8` | Tạo locale (Ubuntu, Debian). Trên Rocky: `sudo dnf install glibc-langpack-vi` |

Dùng thử cho một lệnh:

```bash
LC_TIME=vi_VN.UTF-8 date
LC_ALL=vi_VN.UTF-8 date +"%A, %d %B %Y"
```

```text
Thứ sáu, 27 Tháng 11 năm 2026 16:02:18 +07
Thứ sáu, 27 Tháng 11 2026
```

### Đổi locale cho cả hệ thống

```bash
sudo localectl set-locale LANG=en_US.UTF-8
cat /etc/default/locale
```

```text
LANG=en_US.UTF-8
```

| Cách | Phạm vi |
|---|---|
| `localectl set-locale LANG=...` | Cả hệ thống, ghi vào `/etc/default/locale` (Ubuntu) hoặc `/etc/locale.conf` (RHEL). Có hiệu lực từ lần đăng nhập sau |
| `export LANG=vi_VN.UTF-8` trong `~/.bashrc` | Riêng một user |
| `LANG=... lệnh` | Một lệnh |

Trên server, nên để `en_US.UTF-8` hoặc `C.UTF-8`: thông báo lỗi bằng tiếng Anh dễ tra cứu trên mạng hơn.

### Locale ảnh hưởng tới kết quả lệnh

```bash
printf "b\nA\na\nB\n" | LC_ALL=C sort | tr '\n' ' '
printf "b\nA\na\nB\n" | LC_ALL=en_US.UTF-8 sort | tr '\n' ' '
```

```text
A B a b
a A b B
```

Cùng một lệnh `sort` mà thứ tự khác nhau. Trong locale `C`, mọi chữ hoa đứng trước chữ thường (so theo mã byte). Trong `en_US.UTF-8`, chữ được xếp theo bảng chữ cái. Vì vậy trong script cần kết quả ổn định, người ta viết `LC_ALL=C sort`. Locale `C` cũng giúp `sort`, `grep` chạy nhanh hơn với file lớn.

## Bảng mã: UTF-8 và iconv

Máy tính lưu chữ dưới dạng số. **Bảng mã** quy định số nào là chữ nào:

| Bảng mã | Ghi chú |
|---|---|
| ASCII | 128 ký tự tiếng Anh, mỗi ký tự 1 byte. Không có chữ có dấu |
| **UTF-8** | Mã hoá Unicode, chứa mọi chữ viết trên thế giới. ASCII giữ nguyên 1 byte, chữ có dấu dùng 2–4 byte. **Chuẩn trên Linux và web** |
| UTF-16 | Unicode, mỗi ký tự 2 hoặc 4 byte. Windows dùng bên trong |
| ISO-8859-1 (Latin-1) | Chữ Tây Âu, 1 byte |
| Windows-1258 (CP1258) | Tiếng Việt kiểu Windows cũ |

Chữ `ế` trong UTF-8 chiếm 3 byte:

```bash
printf "ế" | od -An -tx1
```

```text
 e1 ba bf
```

Kiểm tra bảng mã và chuyển đổi:

```bash
printf "Tiếng Việt có dấu\n" > utf8.txt
file -i utf8.txt
iconv -f UTF-8 -t UTF-16 utf8.txt -o utf16.txt
file -i utf16.txt
iconv -f UTF-16 -t UTF-8 utf16.txt
printf "Tiếng Việt\n" | iconv -f UTF-8 -t ASCII//TRANSLIT
```

```text
utf8.txt: text/plain; charset=utf-8
utf16.txt: text/plain; charset=utf-16le
Tiếng Việt có dấu
Tieng Viet
```

| Phần | Ý nghĩa |
|---|---|
| `file -i` | Đoán bảng mã của file |
| `iconv -f A -t B` | Chuyển từ bảng mã A (**f**rom) sang B (**t**o) |
| `-o file` | Ghi ra file (không có thì in ra màn hình) |
| `ASCII//TRANSLIT` | Chuyển sang ASCII, thay chữ có dấu bằng chữ gần giống. Tiện để tạo tên file, đường dẫn URL không dấu |
| `iconv -l` | Danh sách bảng mã hỗ trợ |

File soạn trên Windows còn hay có ký tự xuống dòng `\r\n` thay vì `\n`, làm script lỗi lạ. Sửa bằng `sed -i 's/\r$//' file` hoặc `dos2unix file` ([bài mở rộng 19](/bai/loc-van-ban)).

## Gõ tiếng Việt trên Ubuntu desktop (TITV bài 36)

Phần này chỉ dành cho máy có giao diện đồ hoạ (Ubuntu Desktop). Server không cần.

| Bước | Làm gì |
|---|---|
| 1 | Cài bộ gõ: `sudo apt install ibus-unikey` (hoặc `ibus-bamboo` từ kho của nhà phát triển) |
| 2 | Đăng xuất rồi đăng nhập lại (hoặc chạy `ibus restart`) |
| 3 | Vào **Settings → Keyboard → Input Sources**, bấm **+**, chọn **Vietnamese** → **Unikey** (hoặc Bamboo) |
| 4 | Chuyển qua lại giữa bàn phím tiếng Anh và tiếng Việt bằng `Super + Space` |

## Thực hành

1. Xem locale hiện tại và danh sách locale đã có. Máy có `vi_VN.UTF-8` chưa?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   locale
   locale -a
   ```

   Máy mới cài thường chỉ có `C`, `C.utf8`, `POSIX`, `en_US.utf8`. Chưa có `vi_VN.UTF-8` thì tạo như phần trên.

   </details>

2. In thứ, ngày, tháng, năm hôm nay bằng tiếng Việt.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   LC_TIME=vi_VN.UTF-8 date +"%A, ngày %d %B năm %Y"
   ```

   </details>

3. In thông báo lỗi của `ls /khongco` với `LANG=C`. Nếu đã cài gói ngôn ngữ tiếng Việt (`language-pack-vi`), thử thêm `LANGUAGE=vi`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   LANG=C ls /khongco
   ```

   Thông báo bằng tiếng Anh: `ls: cannot access '/khongco': No such file or directory`. Bản dịch thông báo nằm trong gói ngôn ngữ, nên máy không cài gói tiếng Việt thì vẫn hiện tiếng Anh.

   </details>

4. Tạo file tiếng Việt có dấu, chuyển sang UTF-16, kiểm tra bằng `file -i`, rồi chuyển ngược lại. Thử tạo tên file không dấu từ chuỗi "Báo cáo tháng 11".

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   echo "Báo cáo tháng 11" > bc.txt
   iconv -f UTF-8 -t UTF-16 bc.txt -o bc16.txt
   file -i bc.txt bc16.txt
   echo "Báo cáo tháng 11" | iconv -f UTF-8 -t ASCII//TRANSLIT | tr ' ' '-' | tr 'A-Z' 'a-z'
   ```

   Lệnh cuối in `bao-cao-thang-11`.

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Xem locale đang dùng / đã có | `locale` / `locale -a` |
| Tạo locale | `sudo locale-gen vi_VN.UTF-8` |
| Đổi locale hệ thống | `sudo localectl set-locale LANG=en_US.UTF-8` |
| Locale cho một lệnh | `LC_ALL=C sort file` |
| Ưu tiên | `LC_ALL` > `LC_*` > `LANG` |
| Xem bảng mã file | `file -i file` |
| Đổi bảng mã | `iconv -f CP1258 -t UTF-8 vao.txt -o ra.txt` |
| Bỏ dấu | `iconv -f UTF-8 -t ASCII//TRANSLIT` |
