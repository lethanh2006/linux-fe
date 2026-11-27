---
summary: Tính toán số nguyên trong Bash bằng $(( )), tính số thực bằng bc hoặc awk, và nhận tham số khi chạy script ($1, $2, $#, $@, shift, giá trị mặc định) để viết script dùng lại được cho nhiều trường hợp.
minutes: 35
commands: ["$(( ))", "(( ))", let, expr, bc, "$1", "$#", "$@", "$*", "$0", shift, "${1:-mặc định}"]
quiz:
  - q: "`echo $((17 / 5))` in ra gì?"
    options: ["3.4", "3", "4", "Báo lỗi"]
    answer: 1
    explain: "Bash chỉ tính số nguyên, phép chia bỏ phần thập phân. Muốn 3.40 thì dùng `echo \"scale=2; 17/5\" | bc` hoặc awk."
  - q: "Chạy `./s.sh an \"binh minh\" 3`. Giá trị của `$#` và `$2` là gì?"
    options: ["4 và binh", "3 và binh minh", "3 và an", "2 và 3"]
    answer: 1
    explain: "`$#` là số tham số (3, vì `\"binh minh\"` trong nháy là một tham số). `$2` là tham số thứ hai."
  - q: "Khác nhau giữa \"$@\" và \"$*\" trong vòng for?"
    options: ["Không khác", "\"$@\" giữ mỗi tham số riêng biệt (kể cả có dấu cách); \"$*\" gộp tất cả thành một chuỗi", "\"$*\" nhanh hơn", "\"$@\" chỉ lấy tham số đầu"]
    answer: 1
    explain: "Với tham số `\"a b\" c`: `\"$@\"` cho hai phần tử `[a b]` và `[c]`, còn `\"$*\"` cho một phần tử `[a b c]`. Gần như luôn dùng `\"$@\"`."
  - q: "`ten=${1:-khach}` làm gì?"
    options: ["Xoá tham số 1", "Lấy tham số 1, nếu không có hoặc rỗng thì dùng chữ khach", "Gán khach vào tham số 1", "Báo lỗi nếu thiếu tham số"]
    answer: 1
    explain: "`${bien:-mặc định}` trả về giá trị mặc định khi biến rỗng hoặc chưa đặt. Rất hay dùng cho tham số không bắt buộc."
  - q: "Muốn lấy tham số thứ 10 thì viết thế nào?"
    options: ["$10", "${10}", "$(10)", "$[10]"]
    answer: 1
    explain: "`$10` bị hiểu là `$1` rồi đến chữ `0`. Từ tham số thứ 10 trở đi phải có ngoặc nhọn: `${10}`."
---

## Tính toán số nguyên: $(( ))

Mọi biến trong Bash là chuỗi. Muốn tính toán, đặt biểu thức trong `$(( ))`:

```bash
a=17; b=5
echo "$((a + b)) $((a - b)) $((a * b)) $((a / b)) $((a % b)) $((a ** 2))"
echo $(( (a + b) * 2 ))
```

```text
22 12 85 3 2 289
44
```

| Phép toán | Ý nghĩa | `a=17, b=5` |
|---|---|---|
| `+` `-` `*` | Cộng, trừ, nhân | `22`, `12`, `85` |
| `/` | Chia lấy phần nguyên | `3` |
| `%` | Chia lấy dư | `2` |
| `**` | Luỹ thừa | `289` |
| `( )` | Nhóm, tính trước | |

Trong `$(( ))`, biến không cần `$` phía trước (`$((a + b))` = `$(($a + $b))`).

### Thay đổi giá trị biến: (( ))

```bash
i=0
((i++))
((i += 10))
echo "i=$i"
```

```text
i=11
```

| Cách viết | Ý nghĩa |
|---|---|
| `((i++))` | Tăng `i` thêm 1. `((i--))` giảm 1 |
| `((i += 10))` | `i = i + 10`. Tương tự `-=`, `*=`, `/=` |
| `(( ))` (không có `$`) | Chỉ tính, không trả ra kết quả. Mã thoát là 0 nếu kết quả khác 0, nên dùng được trong `if` ([bài sau](/bai/bash-dieu-kien)) |

Cách cũ hơn mà bạn sẽ gặp trong script cũ và trong video:

| Cách | Ví dụ | Ghi chú |
|---|---|---|
| `let` | `let "c = a * 2"` | Tương đương `((c = a * 2))` |
| `expr` | `expr 17 + 5`, `expr 17 \* 5` | Chương trình ngoài, phải có dấu cách giữa các phần, phải thoát dấu `*` |

Nên dùng `$(( ))`: ngắn, nhanh, không phải thoát ký tự.

Chuỗi không phải số được coi là 0: `x="abc"; echo $((x + 1))` in ra `1`. Bash không báo lỗi, nên script cần tự kiểm tra đầu vào ([bài sau](/bai/bash-dieu-kien)).

## Số thực: bc và awk

Bash không tính được số thực. Dùng chương trình khác:

```bash
echo "17 / 5" | bc
echo "scale=2; 17 / 5" | bc
awk 'BEGIN {printf "%.2f\n", 17/5}'
```

```text
3
3.40
3.40
```

| Phần | Ý nghĩa |
|---|---|
| `bc` | Máy tính dòng lệnh, đọc biểu thức từ stdin (Ubuntu: `sudo apt install bc`) |
| `scale=2` | Lấy 2 chữ số sau dấu phẩy. Mặc định `scale=0` nên chia ra số nguyên |
| `awk 'BEGIN {...}'` | Chạy đoạn awk mà không cần file đầu vào. awk tính số thực sẵn |

Dùng trong script: `tb=$(echo "scale=2; $tong / $n" | bc)`.

## Tham số của script

Thay vì sửa script mỗi lần, cho người dùng truyền giá trị khi chạy: `./tinh.sh 17 5`.

```bash
#!/bin/bash
echo "Tên script: $0"
echo "Tham số 1: $1"
echo "Tham số 2: $2"
echo "Số tham số: $#"
echo "Tất cả (\$@): $@"
for t in "$@"; do echo " - [$t]"; done
```

```bash
./thamso.sh an "binh minh" 3
```

```text
Tên script: ./thamso.sh
Tham số 1: an
Tham số 2: binh minh
Số tham số: 3
Tất cả ($@): an binh minh 3
 - [an]
 - [binh minh]
 - [3]
```

| Biến | Ý nghĩa |
|---|---|
| `$0` | Tên script (đúng như cách bạn gọi) |
| `$1` … `$9` | Tham số thứ 1 đến 9 |
| `${10}`, `${11}` | Từ tham số thứ 10 trở đi phải có `{ }`. `$10` bị hiểu là `$1` nối với chữ `0` |
| `$#` | Số tham số |
| `"$@"` | Mọi tham số, **mỗi tham số giữ riêng** (kể cả có dấu cách) |
| `"$*"` | Mọi tham số gộp thành **một** chuỗi |
| `$?` | Mã thoát của lệnh vừa chạy |
| `$$` | PID của chính script (hay dùng đặt tên file tạm) |

Tham số có dấu cách phải đặt trong nháy khi gọi (`"binh minh"`), nếu không nó thành hai tham số.

### "$@" khác "$*"

```bash
#!/bin/bash
echo 'Với "$@":'; for t in "$@"; do echo "  [$t]"; done
echo 'Với "$*":'; for t in "$*"; do echo "  [$t]"; done
```

Chạy với `"a b" c`:

```text
Với "$@":
  [a b]
  [c]
Với "$*":
  [a b c]
```

Gần như luôn dùng `"$@"` (có nháy kép), nhất là khi chuyển tham số cho lệnh khác: `ls -l "$@"`.

### shift: dịch tham số

```bash
#!/bin/bash
echo "Đầu tiên: $1"
shift
echo "Sau shift, \$1=$1, còn $# tham số"
```

Chạy với `x y z`:

```text
Đầu tiên: x
Sau shift, $1=y, còn 2 tham số
```

`shift` bỏ tham số đầu tiên, `$2` thành `$1`, `$#` giảm 1. Dùng khi xử lý lần lượt từng tham số trong vòng lặp. `shift 2` bỏ hai tham số.

### Giá trị mặc định và kiểm tra thiếu tham số

```bash
ten=${1:-khach}
echo "Chào $ten"
```

Chạy không có tham số in `Chào khach`. Chạy với `An` in `Chào An`.

| Cách viết | Ý nghĩa |
|---|---|
| `${bien:-mặc định}` | Biến rỗng hoặc chưa có thì dùng giá trị mặc định (biến không đổi) |
| `${bien:=mặc định}` | Như trên, và **gán** luôn giá trị mặc định vào biến |
| `${bien:?thông báo}` | Biến rỗng thì in thông báo lỗi và thoát script |

Script cần đủ tham số thì kiểm tra `$#` ngay đầu, in cách dùng:

```bash
#!/bin/bash
if [ $# -lt 2 ]; then
  echo "Cách dùng: $0 <so1> <so2>" >&2
  exit 1
fi
echo "Tổng: $(( $1 + $2 ))"
```

```text
Cách dùng: canthamso.sh <so1> <so2>
Tổng: 7
```

(Dòng đầu khi chạy `bash canthamso.sh 3`, mã thoát 1. Dòng sau khi chạy `bash canthamso.sh 3 4`.)

## Ví dụ tổng hợp: máy tính nhỏ

```bash
#!/bin/bash
a=$1; b=$2
echo "$a + $b = $((a + b))"
echo "$a - $b = $((a - b))"
echo "$a * $b = $((a * b))"
echo "$a / $b = $((a / b)) (dư $((a % b)))"
echo "$a / $b = $(echo "scale=2; $a / $b" | bc)"
```

```bash
./tinh.sh 17 5
```

```text
17 + 5 = 22
17 - 5 = 12
17 * 5 = 85
17 / 5 = 3 (dư 2)
17 / 5 = 3.40
```

## Thực hành

1. Viết script `dientich.sh` nhận chiều dài và chiều rộng hình chữ nhật, in chu vi và diện tích. Thiếu tham số thì in cách dùng và thoát với mã 1.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   #!/bin/bash
   if [ $# -ne 2 ]; then
     echo "Cách dùng: $0 <dai> <rong>" >&2
     exit 1
   fi
   dai=$1; rong=$2
   echo "Chu vi: $(( (dai + rong) * 2 ))"
   echo "Diện tích: $(( dai * rong ))"
   ```

   </details>

2. Viết script `doinhiet.sh` đổi độ C sang độ F (`F = C × 9 / 5 + 32`), lấy 1 chữ số thập phân. Nếu không truyền tham số thì mặc định là 100.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   #!/bin/bash
   c=${1:-100}
   f=$(echo "scale=1; $c * 9 / 5 + 32" | bc)
   echo "$c°C = $f°F"
   ```

   `./doinhiet.sh 37` in `37°C = 98.6°F`.

   </details>

3. Viết script `dem.sh` in số tham số và liệt kê từng tham số kèm số thứ tự, dùng `shift` trong vòng `while`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   #!/bin/bash
   echo "Có $# tham số"
   i=1
   while [ $# -gt 0 ]; do
     echo "$i: $1"
     shift
     ((i++))
   done
   ```

   </details>

4. Viết script `sinhvien.sh` nhận tên và 3 điểm, in điểm trung bình với 2 chữ số thập phân.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   #!/bin/bash
   ten=$1
   tb=$(echo "scale=2; ($2 + $3 + $4) / 3" | bc)
   echo "$ten: điểm trung bình $tb"
   ```

   `./sinhvien.sh An 8 7 9` in `An: điểm trung bình 8.00`.

   </details>

## Tóm tắt

| Việc | Cách viết |
|---|---|
| Tính số nguyên | `$((a + b))`, `$((a % b))`, `$((a ** 2))` |
| Tăng biến | `((i++))`, `((i += 5))` |
| Số thực | `echo "scale=2; $a / $b" \| bc` |
| Tham số thứ n | `$1`, `$2`, …, `${10}` |
| Số tham số / tất cả | `$#` / `"$@"` |
| Tên script | `$0` |
| Bỏ tham số đầu | `shift` |
| Giá trị mặc định | `${1:-mặc định}` |
