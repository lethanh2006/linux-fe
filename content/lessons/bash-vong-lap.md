---
summary: Lặp lại công việc với for (qua danh sách, khoảng số, file), while và until (lặp theo điều kiện), đọc file từng dòng, dừng sớm bằng break, bỏ qua bằng continue. Kèm các bẫy hay gặp như vòng lặp qua file không có, biến mất giá trị sau pipe, lặp qua kết quả lệnh bị tách sai.
minutes: 40
commands: [for, while, until, break, continue, seq, "{1..10}", "for ((;;))", "while read"]
quiz:
  - q: "`for i in {0..20..5}; do echo -n \"$i \"; done` in ra gì?"
    options: ["0 1 2 ... 20", "0 5 10 15 20", "5 10 15 20", "0 20 5"]
    answer: 1
    explain: "`{đầu..cuối..bước}` sinh dãy số từ 0 đến 20, bước 5."
  - q: Khác nhau giữa while và until?
    options: ["Không khác", "while lặp khi điều kiện ĐÚNG; until lặp khi điều kiện còn SAI (dừng khi đúng)", "until chỉ chạy một lần", "while không dùng được với số"]
    answer: 1
    explain: "`until [ $n -gt 3 ]` lặp cho đến khi n > 3, tương đương `while [ $n -le 3 ]`. until hợp với kiểu 'thử lại cho đến khi thành công'."
  - q: "Trong vòng lặp, continue làm gì?"
    options: ["Thoát hẳn vòng lặp", "Bỏ qua phần còn lại của lượt này, sang lượt tiếp theo", "Tạm dừng script", "Lặp lại lượt hiện tại"]
    answer: 1
    explain: "`continue` nhảy sang lượt kế tiếp. `break` thoát hẳn vòng lặp."
  - q: "`dem=0; cat file | while read l; do ((dem++)); done; echo $dem` luôn in 0. Vì sao?"
    options: ["File rỗng", "Vế sau của pipe chạy trong shell con; biến dem thay đổi trong shell con rồi mất", "((dem++)) sai cú pháp", "read không đọc được"]
    answer: 1
    explain: "Mỗi vế của đường ống chạy trong một tiến trình con. Viết `while read l; do ...; done < file` để vòng lặp chạy trong shell hiện tại."
  - q: "Cách đúng để đọc một file từng DÒNG (dòng có dấu cách) là gì?"
    options: ["for dong in $(cat file)", "while IFS= read -r dong; do ...; done < file", "for dong in file", "cat file | for dong"]
    answer: 1
    explain: "`for ... in $(cat file)` tách theo mọi khoảng trắng, không theo dòng. `while IFS= read -r` đọc nguyên từng dòng, giữ cả dấu cách đầu dòng và dấu `\\`."
---

## for: lặp qua một danh sách

```bash
for ten in An Binh Chi; do
  echo "Chào $ten"
done
```

```text
Chào An
Chào Binh
Chào Chi
```

| Phần | Ý nghĩa |
|---|---|
| `for ten in ...` | Lần lượt gán từng phần tử của danh sách vào biến `ten` |
| `do ... done` | Thân vòng lặp, chạy một lần cho mỗi phần tử |

Danh sách có thể đến từ nhiều nguồn:

| Nguồn | Ví dụ | Kết quả |
|---|---|---|
| Liệt kê | `for x in a b c` | `a`, `b`, `c` |
| Khoảng số | `for i in {1..5}` | `1 2 3 4 5` |
| Khoảng có bước | `for i in {0..20..5}` | `0 5 10 15 20` |
| `seq` | `for i in $(seq 1 2 9)` | `1 3 5 7 9` (dùng được với biến: `seq 1 $n`) |
| File theo mẫu | `for f in /var/log/*.log` | Mỗi file `.log` |
| Tham số | `for t in "$@"` | Mỗi tham số của script |
| Mảng | `for x in "${ds[@]}"` | Mỗi phần tử ([bài sau](/bai/bash-mang-va-ham)) |

`{1..$n}` **không** chạy được (dấu `{ }` được bung trước khi biến được thay). Dùng `seq 1 $n` hoặc vòng kiểu C dưới đây.

### Vòng kiểu C

```bash
for ((i=1; i<=3; i++)); do
  echo "Lần $i"
done
```

```text
Lần 1
Lần 2
Lần 3
```

| Phần | Ý nghĩa |
|---|---|
| `i=1` | Khởi tạo |
| `i<=3` | Điều kiện để tiếp tục lặp |
| `i++` | Chạy sau mỗi lượt |

### Lặp qua file

```bash
for f in d/*.log; do
  echo "Xử lý $f"
done
```

```text
Xử lý d/a.log
Xử lý d/b.log
```

**Bẫy:** nếu không có file nào khớp, bash giữ nguyên mẫu ([bài 7](/bai/ky-tu-dai-dien)) và vòng lặp chạy một lần với chính chuỗi mẫu:

```text
Gặp: d/*.pdf
```

Cách xử lý: kiểm tra trong vòng lặp `[ -e "$f" ] || continue`, hoặc bật `shopt -s nullglob` để mẫu không khớp thành danh sách rỗng.

## while: lặp khi điều kiện còn đúng

```bash
n=1
while [ $n -le 3 ]; do
  echo "n=$n"
  ((n++))
done
```

```text
n=1
n=2
n=3
```

Quên tăng biến (`((n++))`) là vòng lặp chạy mãi. Bấm `Ctrl+C` để dừng.

### until: lặp cho đến khi điều kiện đúng

```bash
n=1
until [ $n -gt 3 ]; do
  echo "n=$n"
  ((n++))
done
```

Kết quả giống hệt ví dụ `while` ở trên. `until` đọc tự nhiên với kiểu "thử lại cho đến khi được":

```bash
until curl -sf http://localhost:3000/health > /dev/null; do
  echo "Chờ ứng dụng khởi động..."
  sleep 2
done
echo "Ứng dụng đã chạy"
```

### Vòng lặp vô hạn

```bash
while true; do
  # kiểm tra gì đó mỗi 60 giây
  sleep 60
done
```

`true` là lệnh luôn trả mã 0. Dùng cho script theo dõi chạy mãi. Thoát bằng `break` khi gặp điều kiện, hoặc `Ctrl+C`.

## break và continue

```bash
for i in {1..10}; do
  if (( i % 2 == 0 )); then continue; fi
  if (( i > 7 )); then break; fi
  echo -n "$i "
done
echo
```

```text
1 3 5 7
```

| Lệnh | Làm gì |
|---|---|
| `continue` | Bỏ qua phần còn lại của lượt này, sang lượt tiếp theo (ở đây bỏ qua số chẵn) |
| `break` | Thoát hẳn vòng lặp (ở đây dừng khi `i > 7`) |
| `break 2` | Thoát 2 vòng lặp lồng nhau |

## Đọc file từng dòng

Mẫu chuẩn:

```bash
printf "web1 10.0.0.1\nweb2 10.0.0.2\n" > may.txt
while read ten ip; do
  echo "$ten có IP $ip"
done < may.txt
```

```text
web1 có IP 10.0.0.1
web2 có IP 10.0.0.2
```

Muốn lấy **nguyên dòng** (giữ dấu cách ở đầu dòng và dấu `\`), viết đầy đủ:

```bash
while IFS= read -r dong; do
  echo "[$dong]"
done < file.txt
```

| Phần | Ý nghĩa |
|---|---|
| `IFS=` | Không cắt khoảng trắng ở đầu và cuối dòng |
| `-r` | Giữ nguyên dấu `\`, không coi là ký tự thoát (**r**aw) |
| `< file.txt` | Đưa file vào stdin của cả vòng lặp |

### Bẫy 1: lặp qua $(cat file)

```bash
for dong in $(cat may.txt); do echo "[$dong]"; done
```

```text
[web1]
[10.0.0.1]
[web2]
[10.0.0.2]
```

`$(cat ...)` bị tách theo **mọi** khoảng trắng chứ không theo dòng. Đọc theo dòng thì dùng `while read`.

### Bẫy 2: biến mất giá trị sau pipe

```bash
dem=0
cat may.txt | while read l; do ((dem++)); done
echo "dem (pipe) = $dem"
dem=0
while read l; do ((dem++)); done < may.txt
echo "dem (<) = $dem"
```

```text
dem (pipe) = 0
dem (<) = 2
```

Vế sau của `|` chạy trong **shell con**. Biến `dem` tăng trong shell con rồi mất khi vòng lặp kết thúc. Dùng `< file` để vòng lặp chạy ngay trong shell hiện tại.

Khi dữ liệu đến từ một lệnh (không phải file), dùng **process substitution**:

```bash
while read pid cmd; do
  echo "$pid: $cmd"
done < <(ps -eo pid,comm --no-headers)
```

`<(lệnh)` biến kết quả của lệnh thành một "file" để đưa vào bằng `<`.

## Vòng lặp lồng nhau

```bash
for i in 1 2 3; do
  for j in 1 2 3; do
    echo -n "$((i*j))	"
  done
  echo
done
```

```text
1	2	3
2	4	6
3	6	9
```

## Ví dụ thực tế

Kiểm tra nhiều máy chủ còn sống không:

```bash
for host in 8.8.8.8 1.1.1.1 10.255.255.1; do
  if ping -c 1 -W 1 "$host" > /dev/null 2>&1; then
    echo "$host: sống"
  else
    echo "$host: không trả lời"
  fi
done
```

Đổi đuôi hàng loạt file `.txt` thành `.md`:

```bash
for f in *.txt; do
  [ -e "$f" ] || continue
  mv -v "$f" "${f%.txt}.md"
done
```

`${f%.txt}` là giá trị của `f` bỏ đuôi `.txt` ([bài sau](/bai/bash-mang-va-ham) có thêm các phép xử lý chuỗi).

## Thực hành

1. Tính tổng các số từ 1 đến 100 bằng vòng `for`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   tong=0
   for i in {1..100}; do ((tong += i)); done
   echo "Tổng 1..100 = $tong"
   ```

   Kết quả `5050`.

   </details>

2. Viết script `bangcuuchuong.sh` nhận số n (mặc định 9), in bảng cửu chương của n dạng `n x i = kết quả` với i từ 1 đến 10.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   #!/bin/bash
   n=${1:-9}
   for ((i=1; i<=10; i++)); do
     echo "$n x $i = $((n * i))"
   done
   ```

   </details>

3. Viết script đếm ngược từ số giây được truyền vào (mặc định 5), mỗi giây in một số, cuối cùng in "Hết giờ!". Dùng `while`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   #!/bin/bash
   s=${1:-5}
   while (( s > 0 )); do
     echo "$s"
     sleep 1
     ((s--))
   done
   echo "Hết giờ!"
   ```

   </details>

4. Viết script liệt kê mọi file `.log` trong `/var/log` (chỉ cấp đầu), in tên và số dòng của từng file. Bỏ qua file không đọc được.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   #!/bin/bash
   for f in /var/log/*.log; do
     [ -r "$f" ] || continue
     echo "$f: $(wc -l < "$f") dòng"
   done
   ```

   </details>

5. Viết script đọc file `may.txt` (mỗi dòng: tên máy và IP) và in "Máy thứ N: tên (IP)", cuối cùng in tổng số máy.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   #!/bin/bash
   n=0
   while read ten ip; do
     ((n++))
     echo "Máy thứ $n: $ten ($ip)"
   done < may.txt
   echo "Tổng: $n máy"
   ```

   </details>

## Tóm tắt

| Việc | Cách viết |
|---|---|
| Lặp qua danh sách | `for x in a b c; do ...; done` |
| Lặp qua khoảng số | `for i in {1..10}`, `for ((i=0; i<n; i++))` |
| Lặp qua file | `for f in *.log; do [ -e "$f" ] \|\| continue; ...; done` |
| Lặp khi đúng / đến khi đúng | `while đk; do ...; done` / `until đk; do ...; done` |
| Lặp mãi | `while true; do ...; done` |
| Bỏ lượt / thoát | `continue` / `break` |
| Đọc file từng dòng | `while IFS= read -r dong; do ...; done < file` |
| Đọc kết quả lệnh từng dòng | `while read ...; do ...; done < <(lệnh)` |
