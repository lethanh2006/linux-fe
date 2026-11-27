---
summary: cut cắt lấy một phần của mỗi dòng theo vị trí byte, ký tự, hoặc theo cột ngăn bởi dấu phân cách. Dùng với file dữ liệu dạng bảng như danh sách sinh viên, /etc/passwd, và với kết quả của lệnh khác qua đường ống.
minutes: 30
commands: [cut -b, cut -c, cut -d, cut -f, "--complement"]
quiz:
  - q: "`students.txt` có hai cột ngăn bởi phím Tab: họ tên và lớp. Lệnh nào lấy cột lớp?"
    options: ["cut -f 2 students.txt", "cut -c 2 students.txt", "cut -d ' ' -f 2 students.txt", "cut -b 2 students.txt"]
    answer: 0
    explain: "Mặc định `cut -f` dùng Tab làm dấu phân cách, nên `-f 2` lấy cột thứ hai."
  - q: "`cut -d : -f 1 /etc/passwd` in ra gì?"
    options: ["Dòng đầu của file", "Ký tự đầu mỗi dòng", "Tên các tài khoản (cột đầu, ngăn bởi dấu :)", "Số dòng"]
    answer: 2
    explain: "`-d :` đặt dấu phân cách là `:`, `-f 1` lấy cột đầu tiên là tên tài khoản."
  - q: "`cut -b 1,3,5` lấy gì?"
    options: ["Byte từ 1 tới 5", "Byte thứ 1, 3 và 5 của mỗi dòng", "Cột 1, 3, 5", "Dòng 1, 3, 5"]
    answer: 1
    explain: "Dấu phẩy liệt kê từng vị trí, dấu gạch `1-5` là một khoảng."
  - q: "Trên Ubuntu, `echo \"Lê Văn\" | cut -c 1-2` cho kết quả lạ. Vì sao?"
    options: ["Vì tiếng Việt không có trong Linux", "Vì cut của GNU coi -c giống -b, chữ có dấu chiếm nhiều byte nên bị cắt đôi", "Vì thiếu -d", "Vì phải dùng sudo"]
    answer: 1
    explain: "GNU cut chưa xử lý ký tự nhiều byte: `-c` đếm theo byte. Chữ `ê` chiếm 2 byte nên cắt 2 byte đầu chỉ được `L` và nửa chữ `ê`."
  - q: "Dòng không có dấu phân cách thì `cut -d . -f 2` làm gì với dòng đó?"
    options: ["Bỏ qua", "In nguyên dòng", "Báo lỗi", "In dòng trống"]
    answer: 1
    explain: "cut in nguyên các dòng không có dấu phân cách. Thêm `-s` để bỏ qua chúng."
---

> Bài này đi theo video TITV bài 21.

## cut làm gì

`cut` cắt lấy **một phần của mỗi dòng**: vài byte, vài ký tự, hoặc vài cột. Dữ liệu vào là file, hoặc kết quả của lệnh khác qua đường ống `|` (bài 13). `cut` không lọc dòng như `grep`: dòng nào cũng được cắt.

```text
cut TUỲ-CHỌN [FILE]
```

| Tuỳ chọn | Cắt theo |
|---|---|
| `-b danh-sách` | Vị trí **byte** |
| `-c danh-sách` | Vị trí **ký tự** (trên Ubuntu hiện chạy giống `-b`, xem phần dưới) |
| `-f danh-sách` | **Cột** (trường, field) |
| `-d ký-tự` | Dấu phân cách giữa các cột, đi kèm `-f`. Mặc định là phím Tab |
| `--complement` | Lấy phần **còn lại**, bỏ phần được chọn |
| `-s` | Bỏ qua các dòng không có dấu phân cách |

Cách viết danh sách vị trí:

| Cách viết | Nghĩa |
|---|---|
| `2` | Vị trí 2 |
| `1,3,5` | Vị trí 1, 3 và 5 |
| `6-10` | Từ 6 tới 10 |
| `3-` | Từ 3 tới hết dòng |
| `-4` | Từ đầu tới 4 |

## File thực hành

File `students.txt` có hai cột ngăn bởi phím **Tab**: họ tên (có dấu cách) và lớp. Tên trong ví dụ là tên giả.

```bash
mkdir -p ~/thuchanh/bai21 && cd ~/thuchanh/bai21
printf 'Nguyen Van An\tCNTT1\nTran Thi Binh\tKTPM2\nLe Hoang Phuc\tCNTT1\nPham Minh Chau\tHTTT3\n' > students.txt
cat students.txt
```

```text
Nguyen Van An	CNTT1
Tran Thi Binh	KTPM2
Le Hoang Phuc	CNTT1
Pham Minh Chau	HTTT3
```

`\t` trong `printf` là phím Tab, `\n` là xuống dòng. Bạn cũng có thể tự gõ file bằng vi, nhớ bấm Tab giữa hai cột.

## Cắt theo byte: -b

```bash
cut -b 2 students.txt
cut -b 1,3,5 students.txt
```

```text
g
r
e
h
Nue
Ta 
L o
Pa 
```

`-b 2` lấy byte thứ hai của mỗi dòng. `-b 1,3,5` ghép byte 1, 3, 5 lại; dấu cách cũng là một byte.

## Cắt theo ký tự: -c

```bash
cut -c 1-6 students.txt
```

```text
Nguyen
Tran T
Le Hoa
Pham M
```

Với chữ không dấu, mỗi ký tự là một byte nên `-c` và `-b` giống nhau.

### Chữ có dấu: cẩn thận

Theo lý thuyết, `-c` đếm theo ký tự, còn `-b` đếm theo byte. Chữ tiếng Việt có dấu như `ê`, `ă`, `Đ` chiếm 2–3 byte. Nhưng **`cut` trên Ubuntu (GNU coreutils 9.4) chưa xử lý ký tự nhiều byte**: `-c` vẫn đếm theo byte.

```bash
echo "Lê Văn Đức" | cut -c 1-3
echo "Lê Văn Đức" | cut -c 1-2
```

```text
Lê
L�
```

`L` 1 byte + `ê` 2 byte = 3 byte, nên `-c 1-3` ra đúng `Lê`. Còn `-c 1-2` cắt mất nửa chữ `ê`, màn hình hiện ký tự lỗi. Với dữ liệu có dấu, nên **cắt theo cột** (`-d`, `-f`) thay vì theo vị trí:

```bash
echo "Lê Văn Đức" | cut -d ' ' -f 3
```

```text
Đức
```

## Cắt theo cột: -f và -d

Mặc định `cut -f` coi **Tab** là dấu phân cách:

```bash
cut -f 1 students.txt
cut -f 2 students.txt
```

```text
Nguyen Van An
Tran Thi Binh
Le Hoang Phuc
Pham Minh Chau
CNTT1
KTPM2
CNTT1
HTTT3
```

Đổi dấu phân cách bằng `-d`. Lấy từ đầu tiên (họ) bằng dấu cách:

```bash
cut -d ' ' -f 1 students.txt
```

| Phần | Ý nghĩa |
|---|---|
| `-d ' '` | Dấu phân cách là dấu cách. Đặt trong nháy, không thì shell nuốt mất dấu cách |
| `-f 1` | Lấy cột 1 |

```text
Nguyen
Tran
Le
Pham
```

Lấy **tên** (từ thứ ba) thì vướng: sau dấu cách thứ hai là cả `An` lẫn Tab và lớp:

```bash
cut -d ' ' -f 3 students.txt
```

```text
An	CNTT1
Binh	KTPM2
Phuc	CNTT1
Chau	HTTT3
```

Cắt hai lần: lấy cột họ tên trước, rồi mới lấy từ thứ ba:

```bash
cut -f 1 students.txt | cut -d ' ' -f 3
```

```text
An
Binh
Phuc
Chau
```

Cách này chỉ đúng khi tên nào cũng đúng 3 từ. Tên 2 hay 4 từ thì `cut` không đủ sức; bài lọc văn bản ở phần mở rộng dùng `awk '{print $NF}'` để lấy từ cuối.

### Lưu kết quả và cắt kết quả của lệnh khác

```bash
cut -f 1 students.txt > names.txt
cut -d : -f 1,7 /etc/passwd | head -3
```

```text
root:/bin/bash
daemon:/usr/sbin/nologin
bin:/usr/sbin/nologin
```

`/etc/passwd` ngăn cột bằng `:`. `-f 1,7` lấy tên tài khoản và shell (bài 26 giải thích 7 cột). Khi lấy nhiều cột, `cut` nối chúng lại bằng chính dấu phân cách.

Cắt kết quả của `tree`, lấy phần sau dấu chấm đầu tiên (đuôi file):

```bash
tree | cut -d . -f 2
```

```text

txt
txt

1 directory, 2 files
```

Dòng đầu của `tree` chỉ là `.` nên phần sau dấu chấm rỗng. Dòng cuối không có dấu chấm nào: `cut` **in nguyên** những dòng không có dấu phân cách. Thêm `-s` để bỏ chúng đi.

## Mở rộng (chuẩn LPIC-1)

Chuẩn LPIC-1 mục 103.2 xếp `cut` chung với các bộ lọc văn bản. Thêm vài điều cần biết:

```bash
cut -f 2 --complement students.txt | head -2
cut -c 1-4 --complement students.txt | head -2
```

```text
Nguyen Van An
Tran Thi Binh
en Van An	CNTT1
 Thi Binh	KTPM2
```

- `--complement` lấy phần còn lại: bỏ cột 2, hoặc bỏ 4 ký tự đầu.
- `-d ' '` là **đúng một** dấu cách. Hai dấu cách liền nhau tạo ra một cột rỗng ở giữa, nên `cut` không hợp với bảng căn lề bằng nhiều dấu cách (như kết quả của `ls -l`). Khi đó dùng `awk`.
- Không dùng `cut -d ','` để đọc file CSV thật: một ô CSV có thể chứa dấu phẩy nằm trong dấu nháy, `cut` sẽ cắt sai.

Các bộ lọc hay đi cùng `cut` trong đường ống (học kỹ ở bài lọc văn bản, phần mở rộng):

| Lệnh | Làm gì | Ví dụ |
|---|---|---|
| `sort` | Sắp xếp dòng | `cut -f 2 students.txt \| sort` |
| `uniq` | Bỏ dòng trùng **liền nhau** (nên `sort` trước) | `cut -f 2 students.txt \| sort \| uniq` |
| `uniq -c` | Đếm số lần lặp | đếm số sinh viên mỗi lớp |
| `paste` | Ghép các file theo cột | `paste a.txt b.txt` |
| `tr` | Đổi ký tự | `tr 'a-z' 'A-Z'` đổi sang chữ hoa |

## Thực hành

1. Lấy danh sách lớp, mỗi lớp chỉ một lần.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   cut -f 2 students.txt | sort | uniq
   ```

   ```text
   CNTT1
   HTTT3
   KTPM2
   ```

   </details>

2. Lấy cột tên tài khoản và thư mục nhà (cột 6) trong `/etc/passwd`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   cut -d : -f 1,6 /etc/passwd
   ```

   </details>

3. Lấy 3 ký tự đầu của mỗi lớp (ví dụ `CNT`, `KTP`).

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   cut -f 2 students.txt | cut -c 1-3
   ```

   </details>

4. Lấy tên đệm (từ thứ hai) của mọi sinh viên, lưu vào `tendem.txt`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   cut -d ' ' -f 2 students.txt > tendem.txt
   cat tendem.txt
   ```

   Từ thứ hai không dính Tab nên cắt một lần là đủ.

   </details>

## Tóm tắt

| Lệnh | Làm gì |
|---|---|
| `cut -b 1,3` | Lấy byte 1 và 3 mỗi dòng |
| `cut -c 1-6` | Lấy ký tự 1 tới 6 (trên Ubuntu tính theo byte) |
| `cut -f 2` | Lấy cột 2, ngăn bởi Tab |
| `cut -d : -f 1,7` | Lấy cột 1 và 7, ngăn bởi `:` |
| `--complement` | Lấy phần còn lại |
| `-s` | Bỏ dòng không có dấu phân cách |
