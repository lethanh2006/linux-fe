---
summary: Ghép mọi thứ đã học thành các chương trình hoàn chỉnh (kiểm tra số nguyên tố, tìm min/max của mảng, đọc dữ liệu từ file, sắp xếp rồi ghi ra file) theo video TITV bài 52–54. Sau đó học cách gỡ lỗi script — bash -n, bash -x, set -x, set -euo pipefail, trap, shellcheck — theo bài 55.
minutes: 50
commands: [bash -n, bash -x, set -x, set -e, set -u, set -o pipefail, trap, PS4, shellcheck]
quiz:
  - q: Kiểm tra script có lỗi cú pháp không mà KHÔNG chạy nó, dùng lệnh nào?
    options: ["bash -x script.sh", "bash -n script.sh", "bash -e script.sh", "shellcheck -r script.sh"]
    answer: 1
    explain: "`bash -n` (noexec) chỉ đọc và kiểm tra cú pháp. `bash -x` thì chạy thật và in từng lệnh."
  - q: "`bash -x script.sh` in ra các dòng bắt đầu bằng dấu + . Đó là gì?"
    options: ["Lỗi", "Từng lệnh SAU KHI shell đã thay biến, trước khi chạy", "Chú thích", "Kết quả của lệnh"]
    answer: 1
    explain: "Chế độ xtrace in mỗi lệnh đúng như shell sẽ chạy, biến đã được thay bằng giá trị thật. Nhờ vậy thấy ngay biến rỗng hay bị tách sai."
  - q: "Thêm `set -e` vào đầu script có tác dụng gì?"
    options: ["Bật màu", "Dừng script ngay khi một lệnh trả mã lỗi", "In từng lệnh", "Bỏ qua mọi lỗi"]
    answer: 1
    explain: "Không có `set -e`, script chạy tiếp dù lệnh trước lỗi (ví dụ `cd` thất bại rồi `rm -rf *` chạy ở sai thư mục). `-u` báo lỗi khi dùng biến chưa đặt, `-o pipefail` bắt lỗi trong đường ống."
  - q: shellcheck dùng để làm gì?
    options: ["Chạy script nhanh hơn", "Phân tích script và chỉ ra lỗi, thói quen nguy hiểm (thiếu nháy kép...), kèm cách sửa", "Mã hoá script", "Kiểm tra quyền file"]
    answer: 1
    explain: "shellcheck đọc script và cảnh báo các lỗi hay gặp, ví dụ SC2086: biến thiếu nháy kép. Có thể cài bằng `apt install shellcheck`, hoặc dùng trên shellcheck.net."
  - q: Thuật toán kiểm tra n có phải số nguyên tố, chỉ cần thử chia cho các số i với điều kiện nào?
    options: ["i từ 2 đến n", "i từ 2 đến n/2", "i từ 2 trở đi, chừng nào i*i <= n", "i lẻ từ 1 đến n"]
    answer: 2
    explain: "Nếu n có ước lớn hơn căn bậc hai của n thì nó cũng có ước nhỏ hơn. Chỉ cần thử đến khi i*i > n là đủ, nhanh hơn rất nhiều."
---

## Bài 1: kiểm tra số nguyên tố (TITV bài 52)

```bash
#!/bin/bash
# Kiểm tra một số có phải số nguyên tố không
la_nguyen_to() {
  local n=$1 i
  (( n < 2 )) && return 1
  for (( i = 2; i * i <= n; i++ )); do
    (( n % i == 0 )) && return 1
  done
  return 0
}

if [[ ! $1 =~ ^[0-9]+$ ]]; then
  echo "Cách dùng: $0 <số nguyên dương>" >&2
  exit 1
fi
if la_nguyen_to "$1"; then
  echo "$1 là số nguyên tố"
else
  echo "$1 không phải số nguyên tố"
fi
```

```bash
for n in 1 2 17 21 97; do ./nguyento.sh $n; done
./nguyento.sh abc
```

```text
1 không phải số nguyên tố
2 là số nguyên tố
17 là số nguyên tố
21 không phải số nguyên tố
97 là số nguyên tố
Cách dùng: ./nguyento.sh <số nguyên dương>
```

| Phần | Ý nghĩa |
|---|---|
| `la_nguyen_to()` | Hàm trả mã 0 (đúng) hoặc 1 (sai), nên dùng trực tiếp trong `if` |
| `local n=$1 i` | Biến cục bộ của hàm ([bài mở rộng 13](/bai/bash-mang-va-ham)) |
| `(( n < 2 )) && return 1` | 0 và 1 không phải số nguyên tố |
| `i * i <= n` | Chỉ thử đến căn bậc hai của n |
| `(( n % i == 0 )) && return 1` | Chia hết cho i thì có ước, không phải số nguyên tố |
| `[[ ! $1 =~ ^[0-9]+$ ]]` | Kiểm tra đầu vào là số nguyên dương ([bài mở rộng 11](/bai/bash-dieu-kien)) |

Mở rộng: in các số nguyên tố đến 50 bằng vòng lặp gọi hàm:

```text
2 3 5 7 11 13 17 19 23 29 31 37 41 43 47
```

## Bài 2: tìm min, max của mảng (TITV bài 53)

```bash
#!/bin/bash
# Tìm số nhỏ nhất và lớn nhất trong các số truyền vào
if (( $# == 0 )); then
  echo "Cách dùng: $0 số1 số2 ..." >&2
  exit 1
fi
so=("$@")
min=${so[0]}; max=${so[0]}
for x in "${so[@]}"; do
  (( x < min )) && min=$x
  (( x > max )) && max=$x
done
echo "Mảng: ${so[*]}"
echo "Nhỏ nhất: $min"
echo "Lớn nhất: $max"
```

```bash
./minmax.sh 15 -3 42 7 0
```

```text
Mảng: 15 -3 42 7 0
Nhỏ nhất: -3
Lớn nhất: 42
```

| Phần | Ý nghĩa |
|---|---|
| `so=("$@")` | Đưa mọi tham số vào mảng |
| `min=${so[0]}` | Lấy phần tử đầu làm giá trị ban đầu (không lấy 0, vì có thể mọi số đều âm) |
| `${so[*]}` | Mọi phần tử gộp thành một chuỗi để in |

## Bài 3: đọc file, sắp xếp, ghi file (TITV bài 54)

File `diem.txt`, mỗi dòng gồm tên và điểm:

```text
Binh 7
An 9
Chi 5
Dung 8
```

```bash
#!/bin/bash
# Đọc tên và điểm từ file, sắp xếp giảm dần theo điểm, ghi ra file kết quả
vao=${1:-diem.txt}
ra=${2:-ketqua.txt}
[ -r "$vao" ] || { echo "Không đọc được $vao" >&2; exit 1; }

ten=(); diem=()
while read -r t d; do
  ten+=("$t"); diem+=("$d")
done < "$vao"
n=${#ten[@]}

# Sắp xếp nổi bọt (bubble sort) theo điểm giảm dần
for (( i = 0; i < n - 1; i++ )); do
  for (( j = 0; j < n - 1 - i; j++ )); do
    if (( diem[j] < diem[j+1] )); then
      tmp=${diem[j]}; diem[j]=${diem[j+1]}; diem[j+1]=$tmp
      tmp=${ten[j]};  ten[j]=${ten[j+1]};   ten[j+1]=$tmp
    fi
  done
done

{
  echo "Bảng xếp hạng ($n học viên)"
  for (( i = 0; i < n; i++ )); do
    printf "%d. %-6s %2d\n" $((i + 1)) "${ten[i]}" "${diem[i]}"
  done
} > "$ra"
echo "Đã ghi kết quả vào $ra"
```

```bash
./sapxep.sh
cat ketqua.txt
```

```text
Đã ghi kết quả vào ketqua.txt
Bảng xếp hạng (4 học viên)
1. An      9
2. Dung    8
3. Binh    7
4. Chi     5
```

| Phần | Ý nghĩa |
|---|---|
| `${1:-diem.txt}` | Tên file vào, mặc định `diem.txt` |
| `while read -r t d ... done < "$vao"` | Đọc từng dòng, tách tên và điểm, thêm vào hai mảng song song |
| Hai vòng `for` lồng nhau | Bubble sort: so từng cặp liền nhau, đổi chỗ nếu sai thứ tự. Sau mỗi lượt, phần tử nhỏ nhất "chìm" xuống cuối |
| Đổi chỗ cả `diem` lẫn `ten` | Giữ tên đi đúng với điểm |
| `{ ... } > "$ra"` | Gom kết quả của cả nhóm lệnh ghi vào một file |

Trong công việc thật, việc sắp xếp này làm bằng một dòng: `sort -k2 -rn diem.txt` ([bài mở rộng 19](/bai/loc-van-ban)). Viết tay thuật toán giúp luyện mảng, vòng lặp và điều kiện.

## Gỡ lỗi script (TITV bài 55)

Script mẫu có lỗi `loi.sh`:

```bash
#!/bin/bash
thumuc=$1
so_file=$(ls $thumuc | wc -l)
echo "Thư mục $thumuc có $so_file file"
if [ $so_file -gt 5 ]; then
  echo "Nhiều file"
fi
```

Chạy với một thư mục có dấu cách (`"thu muc"` chứa 2 file) thì in sai: `Thư mục thu muc có 0 file`.

### bash -n: kiểm tra cú pháp

```bash
printf 'if [ 1 -eq 1 ]\n  echo ok\nfi\n' > cuphap.sh
bash -n cuphap.sh
```

```text
cuphap.sh: line 3: syntax error near unexpected token `fi'
cuphap.sh: line 3: `fi'
```

`-n` đọc script mà không chạy. Lỗi ở đây là thiếu `then`. Bash báo dòng 3 (nơi nó phát hiện ra sai), còn chỗ sai thật nằm phía trên.

### bash -x: xem từng lệnh thật sự chạy

```bash
bash -x loi.sh "thu muc"
```

```text
+ thumuc='thu muc'
++ ls thu muc
++ wc -l
ls: cannot access 'thu': No such file or directory
ls: cannot access 'muc': No such file or directory
+ so_file=0
+ echo 'Thư mục thu muc có 0 file'
Thư mục thu muc có 0 file
+ '[' 0 -gt 5 ']'
```

| Dấu hiệu | Ý nghĩa |
|---|---|
| `+` | Một lệnh, đã thay biến, sắp được chạy |
| `++` | Lệnh chạy bên trong `$( )` (cấp lồng sâu hơn) |
| `ls thu muc` | Thấy ngay lỗi: `$thumuc` không có nháy nên bị tách thành hai đối số |

Sửa: `ls "$thumuc"`. Bài học: **luôn bọc biến trong nháy kép**.

Chỉ bật xtrace cho một đoạn trong script:

```bash
set -x
# đoạn nghi có lỗi
set +x
```

Thêm số dòng vào mỗi dòng xtrace bằng biến `PS4`:

```bash
PS4='+ dòng ${LINENO}: ' bash -x p.sh
```

```text
+ dòng 1: x=5
+ dòng 2: y=10
+ dòng 3: echo 10
10
```

### set -euo pipefail: dừng ngay khi có lỗi

Mặc định script **chạy tiếp** dù một lệnh bị lỗi. Điều này rất nguy hiểm:

```bash
cd /srv/app/cache
rm -rf *
```

Nếu `cd` thất bại (thư mục không tồn tại), `rm -rf *` sẽ chạy ở thư mục hiện tại!

Đặt ngay sau dòng shebang:

```bash
#!/bin/bash
set -euo pipefail
```

| Tuỳ chọn | Ý nghĩa | Ví dụ hành vi |
|---|---|---|
| `-e` | Dừng script khi một lệnh trả mã lỗi | `ls /khongco` lỗi, script dừng ngay với mã 2 |
| `-u` | Báo lỗi và dừng khi dùng biến chưa đặt | `echo $tenn` (gõ nhầm) → `tenn: unbound variable` |
| `-o pipefail` | Đường ống thất bại nếu **bất kỳ** lệnh nào trong đó thất bại | `false \| true` trả mã 1 thay vì 0 |

Kết quả thử:

```text
ls: cannot access '/khongco': No such file or directory
bash: line 1: tenn: unbound variable
```

Lưu ý khi dùng `set -e`:

- Lệnh trong điều kiện `if`, `while`, hoặc trước `&&`, `||` không làm dừng script (vì lỗi ở đó là có chủ đích).
- Lệnh được phép lỗi thì viết `lệnh || true`.
- Với `set -u`, dùng `${1:-}` khi tham số có thể không có.

### trap: làm gì đó khi có lỗi hoặc khi thoát

```bash
trap 'echo "Lỗi ở dòng $LINENO"' ERR
trap 'rm -f "$tmp"' EXIT
```

| Tín hiệu | Chạy khi |
|---|---|
| `ERR` | Một lệnh trả mã lỗi (kết hợp với `set -e` để biết lỗi ở đâu) |
| `EXIT` | Script kết thúc vì bất kỳ lý do gì. Dùng để dọn file tạm |
| `INT` | Người dùng bấm Ctrl+C |

### shellcheck: "người soát lỗi" cho script

```bash
sudo apt install shellcheck
shellcheck loi.sh
```

```text
In loi.sh line 3:
so_file=$(ls $thumuc | wc -l)
          ^--------^ SC2012 (info): Use find instead of ls to better handle non-alphanumeric filenames.
             ^-----^ SC2086 (info): Double quote to prevent globbing and word splitting.

Did you mean:
so_file=$(ls "$thumuc" | wc -l)


In loi.sh line 5:
if [ $so_file -gt 5 ]; then
     ^------^ SC2086 (info): Double quote to prevent globbing and word splitting.

Did you mean:
if [ "$so_file" -gt 5 ]; then
```

shellcheck chỉ đúng chỗ, giải thích lý do, gợi ý cách sửa. Mỗi mã lỗi (SC2086…) có trang giải thích trên shellcheck.net. Nên chạy shellcheck cho mọi script trước khi đưa lên server. Trình soạn thảo VS Code có tiện ích ShellCheck để báo lỗi ngay khi gõ.

### Quy trình gỡ lỗi

1. `bash -n script.sh`: sửa lỗi cú pháp.
2. `shellcheck script.sh`: sửa các cảnh báo.
3. `bash -x script.sh tham-số`: xem lệnh nào chạy sai, biến nào rỗng.
4. Thêm `echo "DEBUG: bien=$bien" >&2` ở chỗ nghi ngờ.
5. Viết script mới thì luôn bắt đầu bằng `set -euo pipefail`.

## Thực hành

1. Viết script in **n** số nguyên tố đầu tiên (n là tham số, mặc định 10).

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   #!/bin/bash
   set -euo pipefail
   la_nguyen_to() {
     local n=$1 i
     (( n < 2 )) && return 1
     for (( i = 2; i * i <= n; i++ )); do
       (( n % i == 0 )) && return 1
     done
     return 0
   }
   can=${1:-10}; dem=0; so=2
   while (( dem < can )); do
     if la_nguyen_to "$so"; then echo -n "$so "; ((dem++)) || true; fi
     ((so++)) || true
   done
   echo
   ```

   Với `set -e`, `((dem++))` khi `dem` đang là 0 trả mã 1 (vì giá trị biểu thức là 0), làm script dừng. `|| true` tránh điều đó. Kết quả với n = 10: `2 3 5 7 11 13 17 19 23 29`.

   </details>

2. Viết script nhận các số, in ra trung bình cộng (2 chữ số thập phân), số nhỏ nhất, số lớn nhất.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   #!/bin/bash
   set -euo pipefail
   (( $# > 0 )) || { echo "Cách dùng: $0 số..." >&2; exit 1; }
   min=$1; max=$1; tong=0
   for x in "$@"; do
     (( x < min )) && min=$x
     (( x > max )) && max=$x
     tong=$(( tong + x ))
   done
   echo "Trung bình: $(echo "scale=2; $tong / $#" | bc)"
   echo "Nhỏ nhất: $min, lớn nhất: $max"
   ```

   Ở đây `(( x < min )) && min=$x` không làm dừng script dù điều kiện sai, vì lệnh đứng trước `&&` được `set -e` bỏ qua.

   </details>

3. Sửa `loi.sh` cho đúng với thư mục có dấu cách, thêm `set -euo pipefail`, chạy `shellcheck` cho đến khi sạch cảnh báo.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   #!/bin/bash
   set -euo pipefail
   thumuc=${1:?Cần truyền tên thư mục}
   so_file=$(find "$thumuc" -mindepth 1 -maxdepth 1 | wc -l)
   echo "Thư mục $thumuc có $so_file file"
   if [ "$so_file" -gt 5 ]; then
     echo "Nhiều file"
   fi
   ```

   </details>

4. Chạy script sắp xếp điểm ở trên bằng `bash -x` và quan sát hai mảng thay đổi qua từng lần đổi chỗ.

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Kiểm tra cú pháp | `bash -n script.sh` |
| In từng lệnh khi chạy | `bash -x script.sh`, hoặc `set -x` … `set +x` |
| Thêm số dòng vào xtrace | `PS4='+ dòng ${LINENO}: '` |
| Dừng khi có lỗi | `set -euo pipefail` ở đầu script |
| Cho phép một lệnh lỗi | `lệnh \|\| true` |
| Dọn dẹp khi thoát | `trap 'rm -f "$tmp"' EXIT` |
| Soát lỗi tĩnh | `shellcheck script.sh` |
