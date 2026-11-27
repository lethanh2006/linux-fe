---
summary: Cho script ra quyết định — if, elif, else, case — dựa trên mã thoát của lệnh. Học các phép so sánh số, so sánh chuỗi, kiểm tra file của test/[ ], cú pháp [[ ]] và (( )) của bash, cùng các bẫy hay gặp như quên nháy kép hay so sánh số như chuỗi.
minutes: 45
commands: [if, elif, else, case, test, "[ ]", "[[ ]]", "(( ))", "&&", "||", "-eq", "-lt", "-f", "-d", "-z", "-n"]
quiz:
  - q: Trong Bash, if dựa vào cái gì để quyết định?
    options: ["Giá trị true/false của biến", "Mã thoát của lệnh sau if: 0 là đúng, khác 0 là sai", "Số dòng lệnh in ra", "Kết quả của echo"]
    answer: 1
    explain: "`if lệnh; then` chạy nhánh then khi lệnh trả mã 0. `[ ... ]` cũng chỉ là một lệnh (tên khác của `test`), trả 0 khi điều kiện đúng. Vì vậy `if grep -q x file` dùng được trực tiếp."
  - q: So sánh hai SỐ a lớn hơn b trong [ ] viết thế nào?
    options: ["[ $a > $b ]", "[ \"$a\" -gt \"$b\" ]", "[ $a gt $b ]", "[ $a => $b ]"]
    answer: 1
    explain: "Trong `[ ]`, số dùng `-eq -ne -lt -le -gt -ge`. Dấu `>` trong `[ ]` là chuyển hướng (sẽ tạo file tên `$b`!). Hoặc dùng `(( a > b ))`."
  - q: "`v=\"\"; [ $v = \"x\" ]` báo `unary operator expected`. Vì sao?"
    options: ["Thiếu then", "Biến rỗng không có nháy kép nên biến mất, lệnh thành [ = \"x\" ]", "Không so sánh được chuỗi", "Phải dùng -eq"]
    answer: 1
    explain: "Luôn bọc biến trong nháy kép trong `[ ]`: `[ \"$v\" = \"x\" ]`. Hoặc dùng `[[ ]]` của bash, ở đó không cần nháy."
  - q: Kiểm tra /etc/nginx/nginx.conf có tồn tại và là file thường?
    options: ["[ -d /etc/nginx/nginx.conf ]", "[ -f /etc/nginx/nginx.conf ]", "[ -z /etc/nginx/nginx.conf ]", "[ -x /etc/nginx/nginx.conf ]"]
    answer: 1
    explain: "`-f` là file thường, `-d` là thư mục, `-e` là tồn tại (loại gì cũng được), `-x` là chạy được, `-z` là chuỗi rỗng."
  - q: Khi nào nên dùng case thay vì nhiều elif?
    options: ["Khi so sánh số", "Khi so một giá trị với nhiều mẫu (start/stop/restart, đuôi file...)", "Khi có vòng lặp", "Không bao giờ"]
    answer: 1
    explain: "`case \"$1\" in start) ...;; stop) ...;; *) ...;; esac` gọn hơn nhiều elif, và hỗ trợ mẫu như `*.jpg|*.png`."
---

## if dựa vào mã thoát

Trong Bash, `if` **không** kiểm tra true/false, mà chạy một lệnh và xem **mã thoát** của nó: `0` là đúng, khác `0` là sai.

```bash
if grep -q hocvien /etc/passwd; then
  echo "có user hocvien"
fi
if ! id khongco > /dev/null 2>&1; then
  echo "không có user khongco"
fi
```

```text
có user hocvien
không có user khongco
```

| Phần | Ý nghĩa |
|---|---|
| `if lệnh; then` | Nếu lệnh trả mã 0 thì chạy phần sau `then` |
| `fi` | Kết thúc `if` (chữ `if` viết ngược) |
| `!` | Đảo ngược: đúng thành sai và ngược lại |
| `grep -q` | Không in gì, chỉ trả mã thoát ([bài 14](/bai/lenh-grep)) |

Cấu trúc đầy đủ:

```bash
if điều-kiện-1; then
  lệnh...
elif điều-kiện-2; then
  lệnh...
else
  lệnh...
fi
```

`then` có thể xuống dòng thay cho dấu `;`. Thụt lề 2 hoặc 4 dấu cách cho dễ đọc (không bắt buộc).

## test và [ ]: so sánh và kiểm tra

`[ ... ]` thực chất là lệnh `test`, trả 0 khi điều kiện đúng:

```bash
[ 5 -gt 3 ]; echo $?
[ 5 -lt 3 ]; echo $?
test -f /etc/passwd; echo $?
```

```text
0
1
0
```

> **Dấu cách là bắt buộc**: `[ 5 -gt 3 ]`, không phải `[5 -gt 3]`. Vì `[` là tên lệnh và `]` là đối số cuối cùng của nó.

### So sánh số

| Toán tử | Nghĩa | Ví dụ |
|---|---|---|
| `-eq` | bằng (**eq**ual) | `[ "$a" -eq 0 ]` |
| `-ne` | khác (**n**ot **e**qual) | |
| `-lt` / `-le` | nhỏ hơn / nhỏ hơn hoặc bằng (**l**ess **t**han / **e**qual) | |
| `-gt` / `-ge` | lớn hơn / lớn hơn hoặc bằng (**g**reater) | |

```bash
n=7
if [ $((n % 2)) -eq 0 ]; then
  echo "$n chẵn"
else
  echo "$n lẻ"
fi
```

```text
7 lẻ
```

### So sánh chuỗi

| Toán tử | Nghĩa |
|---|---|
| `"$a" = "$b"` | Bằng nhau (`==` cũng được trong bash) |
| `"$a" != "$b"` | Khác nhau |
| `-z "$a"` | Chuỗi rỗng (**z**ero length) |
| `-n "$a"` | Chuỗi không rỗng (**n**on-zero) |

**Bẫy: dùng toán tử chuỗi cho số.** So sánh như chuỗi thì `"10" < "9"` (vì ký tự `1` đứng trước `9`). Số phải dùng `-lt`, `-gt`… hoặc `(( ))`.

**Bẫy: quên nháy kép.** Biến rỗng không có nháy sẽ biến mất khỏi lệnh:

```bash
v=""
[ $v = "x" ]
[ "$v" = "x" ]
```

```text
bash: [: =: unary operator expected
```

Lệnh đầu thành `[ = "x" ]`, sai cú pháp. Lệnh sau đúng (trả mã 1 vì không bằng). **Luôn bọc biến trong nháy kép** khi dùng `[ ]`.

### Kiểm tra file

| Toán tử | Đúng khi |
|---|---|
| `-e đường` | Tồn tại (loại gì cũng được) |
| `-f đường` | Là file thường |
| `-d đường` | Là thư mục |
| `-L đường` | Là symbolic link |
| `-s đường` | Tồn tại và không rỗng |
| `-r` / `-w` / `-x` | Bạn có quyền đọc / ghi / chạy |
| `a -nt b` | File a mới hơn b (**n**ewer **t**han) |

```bash
f=/etc/hosts
if [ -f "$f" ]; then
  echo "$f là file"
fi
[ -e /khongco ] || echo "không tồn tại"
```

```text
/etc/hosts là file
không tồn tại
```

### Kết hợp điều kiện

| Cách viết | Ý nghĩa |
|---|---|
| `[ đk1 ] && [ đk2 ]` | Và |
| <code>[ đk1 ] &#124;&#124; [ đk2 ]</code> | Hoặc |
| `[ ! đk ]` | Phủ định |
| `[ đk1 -a đk2 ]`, `[ đk1 -o đk2 ]` | Và / hoặc kiểu cũ, gặp trong script cũ, nên tránh |

## [[ ]]: điều kiện của bash

Bash có thêm `[[ ]]`, an toàn và mạnh hơn `[ ]` (nhưng không chạy được với `sh`):

```bash
s="hello.log"
[[ $s == *.log ]] && echo "đuôi log"
[[ $s =~ ^h.*o ]] && echo "regex khớp"
v=""
[[ -n $v ]] || echo "v rỗng (không cần nháy)"
```

```text
đuôi log
regex khớp
v rỗng (không cần nháy)
```

| Ưu điểm của `[[ ]]` | Ví dụ |
|---|---|
| Biến rỗng không làm hỏng lệnh, không bắt buộc nháy | `[[ $v = x ]]` |
| So khớp mẫu kiểu ký tự đại diện với `==` | `[[ $f == *.jpg ]]` |
| So khớp regex với `=~` | `[[ $x =~ ^[0-9]+$ ]]` |
| Viết `&&`, `\|\|` ngay bên trong | `[[ -f $f && -r $f ]]` |

Ví dụ hay dùng: kiểm tra một giá trị có phải số nguyên không.

```bash
for x in 42 -3 4a ""; do
  if [[ $x =~ ^-?[0-9]+$ ]]; then echo "[$x] là số"; else echo "[$x] không phải số"; fi
done
```

```text
[42] là số
[-3] là số
[4a] không phải số
[] không phải số
```

## (( )): điều kiện số học

Với số, `(( ))` dễ đọc nhất, dùng được `> < >= <= == != && ||` như ngôn ngữ lập trình khác:

```bash
n=15
if (( n > 10 && n < 20 )); then
  echo "trong khoảng"
fi
```

```text
trong khoảng
```

| Dùng | Khi |
|---|---|
| `(( ))` | So sánh số |
| `[[ ]]` | Chuỗi, file, mẫu, regex (trong script bash) |
| `[ ]` | Script cần chạy được với `sh` |

## && và ||: if viết gọn

```bash
[ -d /tmp ] && echo "có /tmp" || echo "không"
mkdir -p /srv/app && cd /srv/app
[ -f config.env ] || { echo "Thiếu config.env" >&2; exit 1; }
```

| Cách viết | Nghĩa |
|---|---|
| `A && B` | A thành công thì chạy B |
| <code>A &#124;&#124; B</code> | A thất bại thì chạy B |
| `{ lệnh1; lệnh2; }` | Gom nhiều lệnh thành một nhóm |

Cẩn thận với `A && B || C`: nếu B thất bại thì C cũng chạy. Khi nhánh "đúng" có thể lỗi, dùng `if` cho rõ ràng.

## case: chọn theo mẫu

Khi so một giá trị với nhiều khả năng:

```bash
case "$1" in
  start)
    echo "Bắt đầu" ;;
  stop|halt)
    echo "Dừng" ;;
  *)
    echo "Không hiểu: $1" ;;
esac
```

Chạy với `start`, `stop`, `xyz`:

```text
Bắt đầu
Dừng
Không hiểu: xyz
```

| Phần | Ý nghĩa |
|---|---|
| `case "$1" in` | So giá trị của `$1` |
| `start)` | Mẫu. Khớp thì chạy các lệnh đến `;;` |
| `stop\|halt)` | Nhiều mẫu, khớp cái nào cũng được |
| `*)` | Mặc định: không khớp mẫu nào ở trên |
| `;;` | Kết thúc một nhánh |
| `esac` | Kết thúc `case` (chữ `case` viết ngược) |

Mẫu dùng ký tự đại diện như của shell:

```bash
for f in a.jpg b.PNG c.txt; do
  case "$f" in
    *.jpg|*.png|*.PNG) echo "$f: ảnh" ;;
    *) echo "$f: khác" ;;
  esac
done
```

```text
a.jpg: ảnh
b.PNG: ảnh
c.txt: khác
```

## Thực hành

1. Viết script `chanle.sh` nhận một số, kiểm tra có phải số nguyên không, rồi in chẵn hay lẻ.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   #!/bin/bash
   n=$1
   if [[ ! $n =~ ^-?[0-9]+$ ]]; then
     echo "'$n' không phải số nguyên" >&2
     exit 1
   fi
   if (( n % 2 == 0 )); then
     echo "$n là số chẵn"
   else
     echo "$n là số lẻ"
   fi
   ```

   </details>

2. Viết script `xeploai.sh` nhận điểm (số nguyên 0–10), in: Giỏi (≥ 8), Khá (≥ 7), Trung bình (≥ 5), Yếu (còn lại). Điểm ngoài 0–10 thì báo lỗi.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   #!/bin/bash
   d=$1
   if (( d < 0 || d > 10 )); then
     echo "Điểm phải từ 0 đến 10" >&2; exit 1
   elif (( d >= 8 )); then
     echo "Giỏi"
   elif (( d >= 7 )); then
     echo "Khá"
   elif (( d >= 5 )); then
     echo "Trung bình"
   else
     echo "Yếu"
   fi
   ```

   </details>

3. Viết script `kiemtra.sh` nhận một đường dẫn và cho biết: không tồn tại / là thư mục (kèm số mục bên trong) / là file (kèm dung lượng, và có chạy được không).

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   #!/bin/bash
   p=$1
   if [ ! -e "$p" ]; then
     echo "$p không tồn tại"
   elif [ -d "$p" ]; then
     echo "$p là thư mục, có $(ls -A "$p" | wc -l) mục"
   elif [ -f "$p" ]; then
     echo "$p là file, $(stat -c %s "$p") byte"
     [ -x "$p" ] && echo "và chạy được"
   fi
   ```

   </details>

4. Viết script `dichvu.sh` nhận `start|stop|status` và in hành động tương ứng (dùng `case`). Không có tham số hoặc tham số sai thì in `Cách dùng: dichvu.sh {start|stop|status}` và thoát với mã 1.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   #!/bin/bash
   case "$1" in
     start)  echo "Đang khởi động..." ;;
     stop)   echo "Đang dừng..." ;;
     status) echo "Đang chạy" ;;
     *)
       echo "Cách dùng: $(basename "$0") {start|stop|status}" >&2
       exit 1 ;;
   esac
   ```

   `basename "$0"` lấy tên file của script, bỏ phần đường dẫn.

   </details>

## Tóm tắt

| Việc | Cách viết |
|---|---|
| Cấu trúc | `if ...; then ...; elif ...; then ...; else ...; fi` |
| So sánh số | `(( a > b ))`, hoặc `[ "$a" -gt "$b" ]` |
| So sánh chuỗi | `[[ $a == "$b" ]]`, `[ "$a" = "$b" ]` |
| Chuỗi rỗng / không rỗng | `-z "$s"` / `-n "$s"` |
| File / thư mục / tồn tại | `-f` / `-d` / `-e` |
| Khớp mẫu, regex | `[[ $f == *.log ]]`, `[[ $x =~ ^[0-9]+$ ]]` |
| Dùng lệnh làm điều kiện | `if grep -q mẫu file; then` |
| Chọn theo mẫu | `case "$x" in a) ...;; *) ...;; esac` |
| Viết gọn | `đk && lệnh`, `đk \|\| { echo lỗi; exit 1; }` |
