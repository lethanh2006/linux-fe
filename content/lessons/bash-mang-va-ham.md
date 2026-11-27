---
summary: Lưu nhiều giá trị trong mảng (mảng chỉ số và mảng kết hợp), xử lý chuỗi ngay trong Bash (cắt, thay, lấy tên file, đuôi file), và viết hàm để chia script thành từng phần dùng lại được — tham số, biến cục bộ, giá trị trả về.
minutes: 45
commands: ["arr=( )", "${arr[@]}", "${#arr[@]}", "declare -A", mapfile, "${s%.*}", "${s##*/}", "${s/a/b}", function, local, return]
quiz:
  - q: "Với `ds=(An Binh \"Chi Mai\")`, `${#ds[@]}` bằng bao nhiêu?"
    options: ["2", "3", "4", "12"]
    answer: 1
    explain: "`${#ds[@]}` là số phần tử. `\"Chi Mai\"` trong nháy là một phần tử, nên có 3 phần tử."
  - q: Lặp qua mọi phần tử của mảng, giữ đúng phần tử có dấu cách, viết thế nào?
    options: ["for x in $ds", "for x in ${ds[@]}", "for x in \"${ds[@]}\"", "for x in ds"]
    answer: 2
    explain: "`\"${ds[@]}\"` (có nháy kép) bung ra mỗi phần tử thành một từ riêng. Thiếu nháy thì `Chi Mai` bị tách làm hai. `$ds` chỉ là phần tử đầu tiên."
  - q: "s=\"backup.tar.gz\". `${s%%.*}` cho kết quả gì?"
    options: ["backup.tar", "backup", "gz", "tar.gz"]
    answer: 1
    explain: "`%%.*` xoá phần dài nhất khớp `.*` tính từ cuối, tức mọi thứ từ dấu chấm đầu tiên. `${s%.*}` (một dấu %) chỉ xoá phần ngắn nhất, ra `backup.tar`."
  - q: Vì sao nên khai báo biến trong hàm bằng local?
    options: ["Cho chạy nhanh hơn", "Để biến chỉ tồn tại trong hàm, không ghi đè biến cùng tên bên ngoài", "Bắt buộc phải có", "Để biến thành hằng số"]
    answer: 1
    explain: "Mặc định mọi biến trong Bash là toàn cục: hàm gán `bien=2` sẽ đổi luôn biến `bien` của script. `local bien=2` giới hạn trong hàm."
  - q: Hàm muốn trả về một chuỗi (ví dụ kết quả tính toán) cho người gọi, cách thông dụng là gì?
    options: ["return \"chuỗi\"", "echo kết quả trong hàm, người gọi lấy bằng kq=$(ten_ham ...)", "Không trả được", "exit chuỗi"]
    answer: 1
    explain: "`return` chỉ trả mã thoát (số 0–255, 0 là thành công). Dữ liệu thì `echo` ra rồi bắt lại bằng `$( )`."
---

## Mảng

Mảng lưu nhiều giá trị trong một biến. Chỉ số bắt đầu từ **0**.

```bash
ds=(An Binh "Chi Mai")
echo "${ds[0]}"
echo "${ds[2]}"
echo "${ds[@]}"
echo "${#ds[@]}"
echo "${!ds[@]}"
```

```text
An
Chi Mai
An Binh Chi Mai
3
0 1 2
```

| Cách viết | Ý nghĩa |
|---|---|
| `ds=(a b "c d")` | Tạo mảng. Phần tử cách nhau bằng dấu cách, có dấu cách thì đặt trong nháy |
| `${ds[0]}` | Phần tử số 0. **Phải có ngoặc nhọn**: `$ds[0]` sai |
| `${ds[-1]}` | Phần tử cuối |
| `${ds[@]}` | Mọi phần tử |
| `${#ds[@]}` | Số phần tử |
| `${!ds[@]}` | Các chỉ số |
| `${ds[@]:1:3}` | Lấy 3 phần tử bắt đầu từ chỉ số 1 |

Thêm, sửa, xoá:

```bash
ds+=(Dung)
ds[1]="Bao"
unset 'ds[0]'
echo "${ds[@]} | chỉ số: ${!ds[@]}"
```

```text
Bao Chi Mai Dung | chỉ số: 1 2 3
```

`unset` xoá phần tử nhưng **không đánh lại số**: chỉ số 0 biến mất, các phần tử khác giữ nguyên số cũ.

### Lặp qua mảng

```bash
for x in "${ds[@]}"; do
  echo "- $x"
done
```

```text
- Bao
- Chi Mai
- Dung
```

Luôn viết `"${ds[@]}"` có nháy kép, để phần tử có dấu cách (`Chi Mai`) không bị tách đôi.

### Tạo mảng từ file và từ lệnh

```bash
files=(/etc/host*)
echo "${#files[@]} file: ${files[@]}"
mapfile -t dong < /etc/hostname
echo "dong[0]=${dong[0]}"
```

```text
3 file: /etc/host.conf /etc/hostname /etc/hosts
dong[0]=lab
```

| Cách | Ý nghĩa |
|---|---|
| `files=(/etc/host*)` | Mảng từ ký tự đại diện, mỗi file một phần tử |
| `mapfile -t dong < file` | Đọc file vào mảng, mỗi dòng một phần tử. `-t` bỏ ký tự xuống dòng ở cuối. Tên khác: `readarray` |

### Mảng kết hợp (key → value)

```bash
declare -A ip
ip[web]=10.0.0.1
ip[db]=10.0.0.2
echo "${ip[web]}"
for k in "${!ip[@]}"; do echo "$k=${ip[$k]}"; done
```

```text
10.0.0.1
db=10.0.0.2
web=10.0.0.1
```

| Phần | Ý nghĩa |
|---|---|
| `declare -A ip` | Khai báo mảng kết hợp (chỉ số là chuỗi). **Bắt buộc** khai báo trước |
| `${!ip[@]}` | Danh sách các key |

Thứ tự key khi lặp **không** theo thứ tự thêm vào. Cần thứ tự thì nối thêm `| sort`.

## Xử lý chuỗi ngay trong Bash

Không cần gọi `sed`, `cut` cho những việc nhỏ:

```bash
s="backup-2026-11-27.tar.gz"
p="/var/log/nginx/access.log"
```

| Cách viết | Ý nghĩa | Kết quả |
|---|---|---|
| `${#s}` | Độ dài | `24` |
| `${s:0:6}` | Cắt từ vị trí 0, lấy 6 ký tự | `backup` |
| `${s%.tar.gz}` | Xoá đuôi khớp mẫu (ngắn nhất, từ cuối) | `backup-2026-11-27` |
| `${s%%.*}` | Xoá đuôi khớp mẫu (dài nhất, từ cuối) | `backup-2026-11-27` |
| `${s#*-}` | Xoá đầu khớp mẫu (ngắn nhất, từ đầu) | `2026-11-27.tar.gz` |
| `${s##*.}` | Xoá đầu khớp mẫu (dài nhất): lấy **đuôi file** | `gz` |
| `${s/2026/2027}` | Thay lần đầu tiên (`//` để thay mọi chỗ) | `backup-2027-11-27.tar.gz` |
| `${s^^}` / `${s,,}` | Viết hoa / viết thường | `BACKUP-2026-11-27.TAR.GZ` |
| `${p##*/}` | Lấy **tên file** từ đường dẫn (như `basename`) | `access.log` |
| `${p%/*}` | Lấy **thư mục** (như `dirname`) | `/var/log/nginx` |

Cách nhớ: `#` đứng **trước** `$` trên bàn phím nên xoá ở **đầu**, `%` đứng **sau** nên xoá ở **cuối**. Một ký hiệu là ngắn nhất, hai ký hiệu là dài nhất.

## Hàm

Hàm gom một nhóm lệnh có tên, gọi lại nhiều lần:

```bash
chao() {
  echo "Xin chào, $1! Bạn có $# tham số."
}
chao An
chao "Binh Minh" x
```

```text
Xin chào, An! Bạn có 1 tham số.
Xin chào, Binh Minh! Bạn có 2 tham số.
```

| Phần | Ý nghĩa |
|---|---|
| `chao() { ... }` | Định nghĩa hàm. Cách viết khác: `function chao { ... }` |
| `chao An` | Gọi hàm như gọi lệnh, tham số cách nhau bằng dấu cách |
| `$1`, `$2`, `$#`, `$@` | Bên trong hàm, đây là tham số **của hàm** (không phải của script) |

Hàm phải được **định nghĩa trước** khi gọi (đặt các hàm ở đầu script).

### Trả kết quả: echo và return

```bash
tong() {
  local kq=$(( $1 + $2 ))
  echo "$kq"
}
t=$(tong 3 4)
echo "t=$t"
```

```text
t=7
```

| Cách | Dùng để | Lấy bằng |
|---|---|---|
| `echo` trong hàm | Trả **dữ liệu** (số, chuỗi) | `kq=$(ten_ham ...)` |
| `return N` | Trả **mã thoát** 0–255: 0 là thành công, khác 0 là thất bại | `$?`, hoặc dùng hàm trực tiếp trong `if` |

Hàm kiểm tra dùng `return` (hoặc mã thoát của lệnh cuối cùng):

```bash
la_so() { [[ $1 =~ ^[0-9]+$ ]]; }
la_so 42 && echo "42 là số"
la_so abc || echo "abc không phải số"
```

```text
42 là số
abc không phải số
```

### Biến cục bộ: local

Biến trong Bash mặc định là **toàn cục**:

```bash
bien=1
doi() { bien=2; }
doi
echo "bien=$bien"
bien=1
doi2() { local bien=2; }
doi2
echo "bien=$bien"
```

```text
bien=2
bien=1
```

Luôn dùng `local` cho biến tạm trong hàm, để không vô tình ghi đè biến của script.

### Truyền mảng cho hàm

```bash
in_ds() { for x in "$@"; do echo "* $x"; done; }
ds=(a "b c")
in_ds "${ds[@]}"
```

```text
* a
* b c
```

### Hàm hay dùng trong script

```bash
log() { echo "[$(date +%H:%M:%S)] $*"; }
die() { echo "LỖI: $*" >&2; exit 1; }

log "Bắt đầu sao lưu"
[ -d /srv/data ] || die "không có thư mục /srv/data"
```

```text
[10:15:42] Bắt đầu sao lưu
LỖI: không có thư mục /srv/data
```

| Hàm | Ý nghĩa |
|---|---|
| `log` | In kèm giờ, dễ đọc khi xem log của cron |
| `die` | In lỗi ra stderr và thoát với mã 1 |
| `$*` | Mọi tham số gộp thành một chuỗi (vừa đủ cho việc in ra) |

### Đệ quy

Hàm có thể gọi chính nó:

```bash
giaithua() {
  if (( $1 <= 1 )); then
    echo 1
  else
    echo $(( $1 * $(giaithua $(( $1 - 1 ))) ))
  fi
}
giaithua 5
```

```text
120
```

Xem các hàm đang có: `declare -F`. Xem nội dung một hàm: `type ten_ham`.

## Thực hành

1. Tạo mảng 6 số `4 8 15 16 23 42`. In số phần tử, phần tử đầu, phần tử cuối, và tổng.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   so=(4 8 15 16 23 42)
   echo "Số phần tử: ${#so[@]}"
   echo "Đầu: ${so[0]}, cuối: ${so[-1]}"
   tong=0
   for x in "${so[@]}"; do ((tong += x)); done
   echo "Tổng: $tong"
   ```

   Tổng là `108`.

   </details>

2. Cho `f="/home/hocvien/anh/he-2026.JPG"`. Chỉ dùng xử lý chuỗi của Bash, in ra: thư mục, tên file, tên không có đuôi, đuôi viết thường.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   f="/home/hocvien/anh/he-2026.JPG"
   echo "${f%/*}"
   ten="${f##*/}"; echo "$ten"
   echo "${ten%.*}"
   duoi="${f##*.}"; echo "${duoi,,}"
   ```

   Kết quả: `/home/hocvien/anh`, `he-2026.JPG`, `he-2026`, `jpg`.

   </details>

3. Viết hàm `max` nhận nhiều số, in ra số lớn nhất.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   max() {
     local m=$1 x
     for x in "$@"; do
       (( x > m )) && m=$x
     done
     echo "$m"
   }
   max 4 42 8 15
   ```

   </details>

4. Dùng mảng kết hợp lưu 3 dịch vụ và cổng (`ssh=22`, `http=80`, `https=443`), in ra theo thứ tự cổng tăng dần.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   declare -A cong=([ssh]=22 [http]=80 [https]=443)
   for k in "${!cong[@]}"; do echo "${cong[$k]} $k"; done | sort -n
   ```

   </details>

5. Viết hàm `kiem_tra_dich_vu` nhận tên dịch vụ, trả mã 0 nếu tiến trình có tên đó đang chạy (dùng `pgrep -x`), rồi dùng nó với `if` để in "đang chạy" hoặc "không chạy" cho `bash` và `nginx`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   kiem_tra_dich_vu() { pgrep -x "$1" > /dev/null; }
   for dv in bash nginx; do
     if kiem_tra_dich_vu "$dv"; then echo "$dv: đang chạy"; else echo "$dv: không chạy"; fi
   done
   ```

   </details>

## Tóm tắt

| Việc | Cách viết |
|---|---|
| Tạo mảng / thêm phần tử | `a=(x y z)` / `a+=(w)` |
| Một phần tử / tất cả / số lượng | `${a[0]}` / `"${a[@]}"` / `${#a[@]}` |
| File vào mảng | `mapfile -t a < file` |
| Mảng kết hợp | `declare -A m; m[key]=val; "${!m[@]}"` |
| Tên file / thư mục / đuôi | `${p##*/}` / `${p%/*}` / `${p##*.}` |
| Bỏ đuôi / thay chuỗi | `${s%.txt}` / `${s//cũ/mới}` |
| Định nghĩa / gọi hàm | `ten() { ...; }` / `ten tham-số` |
| Biến trong hàm | `local x=...` |
| Trả dữ liệu / trả trạng thái | `echo` + `$(ten ...)` / `return 0` hoặc `1` |
