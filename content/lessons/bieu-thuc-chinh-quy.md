---
summary: Biểu thức chính quy (regex) là cách viết một mẫu chữ để tìm số điện thoại, email, mật khẩu đủ mạnh… Bài này học các ký hiệu cơ bản và dùng grep -oE để lọc dữ liệu thật, kèm những chỗ grep khác với regex trong lập trình.
minutes: 40
commands: [grep -E, grep -o, grep -P]
quiz:
  - q: "Trong regex, dấu `.` khớp với gì?"
    options: ["Một ký tự bất kỳ", "Đúng dấu chấm", "Cuối dòng", "Không gì cả"]
    answer: 0
    explain: "`.` khớp **một ký tự bất kỳ**. Muốn khớp đúng dấu chấm phải viết `\\.`."
  - q: "`ab+c` khớp chuỗi nào?"
    options: ["ac", "abc và abbc", "Chỉ abc", "a+bc"]
    answer: 1
    explain: "`+` là lặp **1 lần trở lên**, nên cần ít nhất một `b`. `ac` không khớp; `ab*c` thì khớp cả `ac`."
  - q: "`^Tran` khớp dòng nào?"
    options: ["Dòng có chữ Tran ở bất kỳ đâu", "Dòng kết thúc bằng Tran", "Dòng bắt đầu bằng Tran", "Dòng không có Tran"]
    answer: 2
    explain: "`^` là đầu dòng, `$` là cuối dòng."
  - q: "`grep -E '\\+84\\d{9}'` không ra gì dù file có số `+84912345678`. Vì sao?"
    options: ["Vì thiếu -i", "Vì grep -E không hiểu \\d; phải viết [0-9] hoặc dùng grep -P", "Vì số điện thoại sai", "Vì phải dùng -v"]
    answer: 1
    explain: "`\\d` là cú pháp của Perl, Python, JavaScript. GNU grep chỉ hiểu nó với `-P`. Với `-E`, viết `[0-9]`."
  - q: "`colou?r` khớp với gì?"
    options: ["Chỉ colour", "color và colour", "colouur", "Không khớp gì"]
    answer: 1
    explain: "`?` nghĩa là ký tự đứng trước xuất hiện **0 hoặc 1 lần**."
---

> Bài này đi theo video TITV bài 15.

## Regex là gì

**Biểu thức chính quy** (regular expression, gọi tắt **regex**) là một chuỗi ký tự mô tả **mẫu** của văn bản. Thay vì tìm đúng chữ `0912345678`, bạn mô tả "dấu cộng, 84, rồi 9 chữ số" và tìm mọi số điện thoại khớp mẫu đó.

Regex dùng ở khắp nơi: `grep`, `sed`, `find`, trình soạn thảo, và trong mọi ngôn ngữ lập trình (Python, Java, JavaScript). Không cần thuộc hết; nắm các ký hiệu chính, khi cần thì tra lại.

## Bảng ký hiệu

| Ký hiệu | Ý nghĩa | Ví dụ | Khớp |
|---|---|---|---|
| `.` | Một ký tự bất kỳ | `l.g` | `lag`, `log`, `leg` |
| `[abc]` | Một ký tự trong danh sách | `[aeiou]` | một nguyên âm |
| `[a-z]`, `[A-Z]`, `[0-9]` | Một ký tự trong khoảng | `[0-9]` | một chữ số |
| `[^abc]` | Một ký tự **không** có trong danh sách | `[^0-9]` | không phải chữ số |
| `\w` / `\W` | Chữ, số hoặc `_` / ngược lại | `\w+` | một từ |
| `\s` / `\S` | Khoảng trắng (dấu cách, tab) / ngược lại | `\s?` | có hoặc không có dấu cách |
| `\b` | Ranh giới từ | `\bcat\b` | `cat` nhưng không khớp `catch` |
| `*` | Ký tự trước lặp **0 lần trở lên** | `ab*c` | `ac`, `abc`, `abbc` |
| `+` | Lặp **1 lần trở lên** | `ab+c` | `abc`, `abbc` |
| `?` | Lặp **0 hoặc 1 lần** | `colou?r` | `color`, `colour` |
| `{n}`, `{min,max}`, `{min,}` | Lặp đúng n lần / từ min tới max / ít nhất min | `[0-9]{9}` | 9 chữ số |
| `( )` | Gom nhóm | `(ab)+` | `ab`, `abab` |
| <code>&#124;</code> | Hoặc | <code>cat&#124;bird</code> | `cat` hoặc `bird` |
| `^` | Đầu dòng | `^Tran` | dòng bắt đầu bằng `Tran` |
| `$` | Cuối dòng | `[0-9]$` | dòng kết thúc bằng chữ số |
| `\` | Bỏ nghĩa đặc biệt của ký tự sau | `\.`, `\+` | đúng dấu `.`, dấu `+` |

> **Chỗ khác giữa grep và regex trong lập trình:** `\d` (chữ số), `\D` và "nhìn trước" `(?=...)` là cú pháp kiểu Perl. GNU grep chỉ hiểu chúng khi dùng `grep -P`. Với `grep -E`, viết `[0-9]` thay cho `\d`.

## grep với regex

| Tuỳ chọn | Ý nghĩa |
|---|---|
| `-E` | Dùng regex **mở rộng** (Extended): `+`, `?`, `{}`, `( )`, <code>&#124;</code> có nghĩa đặc biệt mà không cần `\` |
| `-o` | Chỉ in **phần khớp**, mỗi phần một dòng, thay vì in cả dòng |
| `-P` | Dùng regex kiểu Perl: hiểu `\d`, `(?=...)` |

Luôn đặt mẫu trong **nháy đơn** `'...'` để shell không động vào các ký tự `*`, `?`, `$`, `\`.

### Từng ký hiệu một

```bash
echo "lag log lug leg" | grep -oE 'l.g'
echo "ac abc abbc" | grep -oE 'ab*c'
echo "ac abc abbc" | grep -oE 'ab+c'
echo "color colour" | grep -oE 'colou?r'
echo "cat dog bird" | grep -oE 'cat|bird'
```

```text
lag
log
lug
leg
ac
abc
abbc
abc
abbc
color
colour
cat
bird
```

Dấu `.` khớp mọi thứ, nên muốn tìm đúng dấu chấm phải thoát nó bằng `\`:

```bash
echo "gia 5.000 hoac 5x000" | grep -oE '5.000'
echo "gia 5.000 hoac 5x000" | grep -oE '5\.000'
```

```text
5.000
5x000
5.000
```

## Thực hành: lọc số điện thoại và email

Tạo file danh bạ (tên người trong ví dụ là tên giả):

```bash
mkdir -p ~/thuchanh/bai15 && cd ~/thuchanh/bai15
printf '%s\n' "Lien he: Nguyen Van An, email an.nguyen@gmail.com, so dien thoai +84912345678" "Tran Thi Binh: binh_tran@yahoo.com.vn, +84 987654321" "Pham Minh Chau - chau.pham@congty.vn - (+84) 903123456" "Sai dinh dang: abc@com, +8412345" > lienhe.txt
cat lienhe.txt
```

```text
Lien he: Nguyen Van An, email an.nguyen@gmail.com, so dien thoai +84912345678
Tran Thi Binh: binh_tran@yahoo.com.vn, +84 987654321
Pham Minh Chau - chau.pham@congty.vn - (+84) 903123456
Sai dinh dang: abc@com, +8412345
```

### Số điện thoại: viết dần từng bước

Bước 1: dấu `+`, số `84`, rồi đúng 9 chữ số.

```bash
grep -oE '\+84[0-9]{9}' lienhe.txt
```

| Phần | Ý nghĩa |
|---|---|
| `\+` | Đúng dấu `+` (không có `\` thì `+` là "lặp 1 lần trở lên") |
| `84` | Đúng chữ `84` |
| `[0-9]{9}` | 9 chữ số |

```text
+84912345678
```

Bước 2: cho phép có hoặc không có dấu cách sau `+84`:

```bash
grep -oE '\+84\s?[0-9]{9}' lienhe.txt
```

```text
+84912345678
+84 987654321
```

Bước 3: cho phép thêm dấu ngoặc quanh `+84`:

```bash
grep -oE '\(?\+84\)?\s?[0-9]{9}' lienhe.txt
```

```text
+84912345678
+84 987654321
(+84) 903123456
```

`\(?` là "có hoặc không có dấu `(`". Số `+8412345` chỉ có 5 chữ số sau `84` nên không khớp: đúng ý ta.

Thử viết kiểu lập trình với `\d`:

```bash
grep -oE '\+84\d{9}' lienhe.txt
grep -oP '\+84\d{9}' lienhe.txt
```

```text
+84912345678
```

Lệnh đầu không in gì vì `grep -E` không hiểu `\d`. Lệnh sau dùng `-P` nên chạy được.

### Email

```bash
grep -oE '\b[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b' lienhe.txt
```

| Phần | Ý nghĩa |
|---|---|
| `\b` | Ranh giới từ, để không dính vào chữ đứng trước |
| `[A-Za-z0-9._-]+` | Phần tên: chữ, số, dấu `.`, `_`, `-`, ít nhất 1 ký tự |
| `@` | Đúng dấu `@` |
| `[A-Za-z0-9.-]+` | Tên miền, ví dụ `gmail`, `yahoo.com` |
| `\.[A-Za-z]{2,}` | Dấu chấm rồi đuôi ít nhất 2 chữ cái: `.com`, `.vn` |

```text
an.nguyen@gmail.com
binh_tran@yahoo.com.vn
chau.pham@congty.vn
```

`abc@com` bị loại vì thiếu phần `.đuôi`.

### Đầu dòng và cuối dòng

```bash
grep -E '^Tran' lienhe.txt
```

```text
Tran Thi Binh: binh_tran@yahoo.com.vn, +84 987654321
```

## Ví dụ: kiểm tra mật khẩu

```bash
printf '%s\n' abc12345 Abc12345 'Passw0rd!' ngan > matkhau.txt
grep -E '^.{8,}$' matkhau.txt
```

| Phần | Ý nghĩa |
|---|---|
| `^` ... `$` | Cả dòng, từ đầu tới cuối |
| `.{8,}` | Ít nhất 8 ký tự bất kỳ |

```text
abc12345
Abc12345
Passw0rd!
```

Thêm điều kiện "có ít nhất một chữ hoa". Trong lập trình hay viết bằng "nhìn trước" `(?=.*[A-Z])`, chỉ chạy với `grep -P`:

```bash
grep -P '^(?=.*[A-Z]).{8,}$' matkhau.txt
```

```text
Abc12345
Passw0rd!
```

Không có `-P` thì nối hai lần grep, mỗi lần một điều kiện, cho cùng kết quả:

```bash
grep '[A-Z]' matkhau.txt | grep -E '^.{8,}$'
```

## Mở rộng (chuẩn LPIC-1)

Chuẩn LPIC-1 mục 103.7 phân biệt hai kiểu regex của công cụ Unix:

| Kiểu | Dùng ở | Khác biệt |
|---|---|---|
| Cơ bản (BRE) | `grep`, `sed` mặc định | `+ ? { } ( ) \|` là chữ thường; muốn dùng nghĩa đặc biệt phải viết `\+`, `\{3\}`, `\(` `\)` |
| Mở rộng (ERE) | `grep -E`, `sed -E` | Viết thẳng `+ ? {3} ( ) \|` |

Ví dụ `grep 'ab\+c'` (BRE) và `grep -E 'ab+c'` (ERE) cho cùng kết quả. Dùng `-E` cho dễ đọc. Lệnh `sed` dùng regex để tìm và thay thế, học ở phần mở rộng (bài lọc văn bản).

## Thực hành

1. In các dòng của `lienhe.txt` có đuôi email `.vn`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   grep -E '@[A-Za-z0-9.-]+\.vn\b' lienhe.txt
   ```

   Ra dòng của Tran Thi Binh (`yahoo.com.vn`) và Pham Minh Chau (`congty.vn`).

   </details>

2. Lấy riêng các tên người viết hoa chữ cái đầu mỗi từ, gồm 3 từ, như `Nguyen Van An`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   grep -oE '[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+' lienhe.txt
   ```

   Mỗi từ là một chữ hoa `[A-Z]` theo sau bởi các chữ thường `[a-z]+`.

   </details>

3. Trong `matkhau.txt`, in mật khẩu có ít nhất một ký tự đặc biệt (không phải chữ, không phải số).

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   grep '[^A-Za-z0-9]' matkhau.txt
   ```

   Chỉ `Passw0rd!` có dấu `!`.

   </details>

4. Đếm số dòng trong `/etc/passwd` kết thúc bằng `nologin`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   grep -c 'nologin$' /etc/passwd
   ```

   </details>

## Tóm tắt

| Ký hiệu | Ý nghĩa |
|---|---|
| `.` | Một ký tự bất kỳ |
| `[0-9]`, `[^0-9]` | Một chữ số / không phải chữ số |
| `*`, `+`, `?` | Lặp 0+ / 1+ / 0 hoặc 1 lần |
| `{n,m}` | Lặp từ n tới m lần |
| `^`, `$` | Đầu dòng, cuối dòng |
| `\` | Thoát ký tự đặc biệt |
| `grep -oE 'mẫu'` | Chỉ in phần khớp, regex mở rộng |
| `grep -P` | Cần khi dùng `\d`, `(?=...)` |
