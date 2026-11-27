---
summary: Tìm dòng chứa chữ cần tìm trong file và thư mục bằng grep, với các tuỳ chọn dùng nhiều nhất (-i, -v, -n, -c, -r, -o, -A/-B). Sau đó học biểu thức chính quy (regex) — ngôn ngữ mô tả mẫu chữ dùng chung cho grep, sed, awk, vim và hầu hết ngôn ngữ lập trình.
minutes: 50
commands: [grep, grep -E, grep -F, grep -r, regex]
quiz:
  - q: Lệnh nào in các dòng KHÔNG chứa chữ 200?
    options: ["grep 200 file", "grep -v 200 file", "grep -n 200 file", "grep -c 200 file"]
    answer: 1
    explain: "`-v` (invert) đảo ngược: in những dòng không khớp. `-n` in kèm số dòng, `-c` chỉ đếm số dòng khớp."
  - q: Tìm chữ TODO trong mọi file của thư mục src, kèm tên file và số dòng?
    options: ["grep TODO src", "grep -rn TODO src", "find src TODO", "grep -c TODO src"]
    answer: 1
    explain: "`-r` tìm đệ quy vào mọi file trong thư mục, `-n` in số dòng. Kết quả có dạng `file:số-dòng:nội dung`."
  - q: "Trong regex, `^#` khớp với dòng nào?"
    options: ["Dòng có dấu # ở bất kỳ đâu", "Dòng bắt đầu bằng #", "Dòng kết thúc bằng #", "Dòng không có #"]
    answer: 1
    explain: "`^` là neo đầu dòng, `$` là neo cuối dòng. `^#` là dòng bắt đầu bằng `#`, thường là dòng chú thích trong file cấu hình."
  - q: "Mẫu `ab*c` (regex) có khớp với chuỗi `ac` không?"
    options: ["Có, vì * nghĩa là ký tự trước nó lặp 0 hoặc nhiều lần", "Không, vì phải có ít nhất một b", "Chỉ khi dùng -E", "Không, vì * là ký tự đại diện của shell"]
    answer: 0
    explain: "Trong regex, `*` lặp **ký tự đứng trước** 0 lần trở lên, nên `ac`, `abc`, `abbc` đều khớp. Khác với `*` của shell (khớp mọi chuỗi). Muốn ít nhất một `b` thì dùng `ab+c` với `grep -E`."
  - q: "Vì sao `grep \"ab+c\"` không khớp với `abc`, còn `grep -E \"ab+c\"` thì khớp?"
    options: ["Vì grep thường không hỗ trợ chữ c", "grep thường dùng regex cơ bản (BRE), ở đó + là chữ bình thường; -E bật regex mở rộng (ERE), + mới là 'một hoặc nhiều lần'", "Vì -E nhanh hơn", "Vì phải có nháy đơn"]
    answer: 1
    explain: "Trong BRE, các ký tự `+ ? | ( ) { }` là chữ thường, phải viết `\\+` mới có nghĩa đặc biệt. Dùng `grep -E` cho dễ đọc."
  - q: "Tìm chuỗi `a.b` đúng từng ký tự (dấu chấm là dấu chấm thật), cách nào đúng?"
    options: ["grep a.b", "grep -F a.b hoặc grep 'a\\.b'", "grep -E a.b", "grep -w a.b"]
    answer: 1
    explain: "Trong regex, `.` khớp mọi ký tự, nên `grep a.b` khớp cả `axb`. `-F` coi mẫu là chuỗi cố định, không phải regex. Hoặc thoát dấu chấm bằng `\\.`."
---

Tạo dữ liệu thử:

```bash
cd ~
cat > access.log <<EOF
192.168.1.10 GET /index.html 200 512
10.0.0.5 GET /login 200 1024
192.168.1.10 POST /login 302 128
172.16.0.7 GET /admin 403 256
10.0.0.5 GET /index.html 200 512
192.168.1.10 GET /khongco 404 64
EOF
cat > app.conf <<EOF
# Cau hinh ung dung
port=3000

host=0.0.0.0
# debug=true
log_level=info
Email: admin@example.com
EOF
```

## grep: tìm dòng khớp mẫu

```bash
grep login access.log
```

| Phần | Ý nghĩa |
|---|---|
| `grep` | In các dòng có chứa mẫu. Tên lấy từ lệnh **g**lobal **re**gular expression **p**rint của trình soạn thảo cổ `ed` |
| `login` | Mẫu cần tìm (là một biểu thức chính quy) |
| `access.log` | File để tìm. Bỏ trống thì đọc stdin, nên dùng được sau `\|` |

```text
10.0.0.5 GET /login 200 1024
192.168.1.10 POST /login 302 128
```

Trên Ubuntu, `grep` là alias của `grep --color=auto` nên phần khớp được tô màu.

### Các tuỳ chọn dùng nhiều nhất

| Tuỳ chọn | Ý nghĩa | Ví dụ |
|---|---|---|
| `-i` | Không phân biệt hoa thường (**i**gnore case) | `grep -i error app.log` |
| `-v` | Đảo ngược: in dòng **không** khớp (in**v**ert) | `grep -v 200 access.log` |
| `-n` | In kèm số dòng | `grep -n POST access.log` → `3:192.168.1.10 POST ...` |
| `-c` | Chỉ đếm số dòng khớp (**c**ount) | `grep -c 192.168.1.10 access.log` → `3` |
| `-w` | Khớp nguyên từ (**w**ord): `cat` không khớp `catalog` | `grep -w cat` |
| `-r` | Tìm đệ quy trong mọi file của thư mục | `grep -rn TODO src/` |
| `-l` | Chỉ in tên file có chứa mẫu (**l**ist) | `grep -rl TODO src/` |
| `-o` | Chỉ in phần khớp, không in cả dòng (**o**nly) | lấy IP, email ra khỏi log |
| `-A 2` / `-B 2` / `-C 2` | In thêm 2 dòng sau (**A**fter) / trước (**B**efore) / cả hai phía (**C**ontext) | xem bối cảnh quanh dòng lỗi |
| `-e` | Nhiều mẫu, khớp mẫu nào cũng được | `grep -e 403 -e 404` |
| `-q` | Im lặng, chỉ trả mã thoát (**q**uiet): 0 nếu có khớp, 1 nếu không | dùng trong `if` của script |
| `-E` | Dùng regex mở rộng (xem bên dưới) | `grep -E "403\|404"` |
| `-F` | Coi mẫu là chuỗi cố định, không phải regex (**F**ixed) | `grep -F "a.b"` |

```bash
grep -A1 -B1 403 access.log
grep -rn TODO proj
```

```text
192.168.1.10 POST /login 302 128
172.16.0.7 GET /admin 403 256
10.0.0.5 GET /index.html 200 512
proj/README:1:TODO nua
proj/src/a.js:1:TODO: sua loi
```

Kết quả `-r` có dạng `file:số-dòng:nội-dung`.

Ví dụ hay dùng trên server:

```bash
# Có bao nhiêu lần đăng nhập SSH sai mật khẩu?
sudo grep -c "Failed password" /var/log/auth.log
# Xem lỗi trong log nginx, kèm 3 dòng sau mỗi lỗi
grep -i -A3 error /var/log/nginx/error.log
# Process nginx có đang chạy không?
ps aux | grep nginx
```

## Biểu thức chính quy (regex)

**Regex** là cách mô tả một **mẫu** chữ thay vì một chữ cố định: "dòng bắt đầu bằng #", "ba chữ số liền nhau", "một địa chỉ email". Regex dùng ở grep, sed, awk, vim, và hầu hết ngôn ngữ lập trình (JavaScript, Python…).

> **Đừng nhầm với ký tự đại diện của shell** ([bài 7](/bai/ky-tu-dai-dien)). Trong shell, `*` khớp mọi chuỗi. Trong regex, `*` nghĩa là "ký tự đứng trước lặp 0 hoặc nhiều lần", còn "mọi chuỗi" phải viết là `.*`. Vì vậy luôn đặt regex trong **nháy đơn** để shell không bung nó.

### Các ký tự cơ bản

| Ký hiệu | Khớp với | Ví dụ | Khớp | Không khớp |
|---|---|---|---|---|
| `.` | Một ký tự bất kỳ | `l.g` | `log`, `lag` | `lg` |
| `^` | Đầu dòng | `^#` | `# chu thich` | `port=3000 # x` |
| `$` | Cuối dòng | `\.conf$` | `nginx.conf` | `nginx.conf.bak` |
| `^$` | Dòng trống | | | |
| `[abc]` | Một ký tự trong danh sách | `[Gg]et` | `Get`, `get` | `set` |
| `[0-9]` | Một chữ số | `[0-9][0-9]` | `42` | `4a` |
| `[^0-9]` | Một ký tự **không** phải chữ số (`^` đứng **trong** ngoặc là phủ định) | | | |
| `*` | Ký tự trước lặp **0 lần trở lên** | `ab*c` | `ac`, `abc`, `abbc` | `adc` |
| `.*` | Chuỗi bất kỳ, kể cả rỗng | `GET.*200` | `GET /login 200` | |
| `\` | Bỏ nghĩa đặc biệt của ký tự sau | `\.` | dấu chấm thật | |
| `\b` | Ranh giới từ | `\bcat\b` | `cat` | `catalog` |

Lớp ký tự dùng được trong ngoặc: `[[:digit:]]` chữ số, `[[:alpha:]]` chữ cái, `[[:space:]]` khoảng trắng, `[[:upper:]]` chữ hoa.

Ví dụ rất hay dùng: **xem file cấu hình bỏ hết chú thích và dòng trống**

```bash
grep -v '^#' app.conf | grep -v '^$'
grep -vE '^(#|$)' app.conf
```

```text
port=3000
host=0.0.0.0
log_level=info
Email: admin@example.com
```

| Phần | Ý nghĩa |
|---|---|
| `-v '^#'` | Bỏ dòng bắt đầu bằng `#` |
| `-v '^$'` | Bỏ dòng trống (đầu dòng nối liền cuối dòng) |
| `-vE '^(#\|$)'` | Gộp hai điều kiện bằng regex mở rộng: dòng bắt đầu bằng `#` **hoặc** dòng trống |

### Regex mở rộng (ERE): grep -E

Có hai "phương ngữ" regex:

- **BRE** (cơ bản): mặc định của `grep` và `sed`. Các ký tự `+ ? | ( ) { }` là chữ thường, muốn dùng nghĩa đặc biệt phải thêm `\` phía trước.
- **ERE** (mở rộng): bật bằng `grep -E` hoặc `sed -E`. Các ký tự trên có nghĩa đặc biệt luôn, dễ đọc hơn.

| Ký hiệu (ERE) | Ý nghĩa | Ví dụ | Khớp |
|---|---|---|---|
| `+` | Ký tự trước lặp **1 lần trở lên** | `ab+c` | `abc`, `abbc` (không khớp `ac`) |
| `?` | Ký tự trước có hoặc không (0 hoặc 1 lần) | `colou?r` | `color`, `colour` |
| `{n}` | Lặp đúng n lần | `[0-9]{3}` | `200`, `404` |
| `{n,m}` | Lặp từ n đến m lần | `[0-9]{1,3}` | `1`, `10`, `192` |
| <code>a&#124;b</code> | `a` hoặc `b` | <code>403&#124;404</code> | dòng có 403 hoặc 404 |
| `( )` | Nhóm | <code>(GET&#124;POST) /login</code> | `GET /login`, `POST /login` |

```bash
printf "abc\nab+c\n" | grep "ab+c"
printf "abc\nab+c\n" | grep -E "ab+c"
```

Lệnh đầu (BRE) chỉ khớp chuỗi `ab+c` theo đúng từng chữ. Lệnh sau (ERE) khớp `abc`.

`egrep` và `fgrep` là tên cũ của `grep -E` và `grep -F`. Nên dùng tên mới.

### Lấy dữ liệu ra bằng -o

`-o` kết hợp regex để rút đúng phần cần:

```bash
grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' access.log | sort -u
grep -oE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}' app.conf
```

```text
10.0.0.5
172.16.0.7
192.168.1.10
admin@example.com
```

Đọc mẫu địa chỉ IP `[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+`:

| Phần | Ý nghĩa |
|---|---|
| `[0-9]+` | Một hoặc nhiều chữ số |
| `\.` | Một dấu chấm thật (thoát bằng `\`, vì `.` trơn khớp mọi ký tự) |
| Lặp 4 lần | Bốn nhóm số cách nhau bằng dấu chấm |

(Mẫu này khớp cả `999.1.1.1` vốn không phải IP hợp lệ. Để tìm trong log thì vậy là đủ.)

### Regex trong sed

`sed` dùng chung regex. Thêm `-E` để dùng ERE. Phần trong `( )` được nhớ lại và chèn vào chuỗi thay thế bằng `\1`, `\2`…:

```bash
sed -E 's/^([0-9.]+) .*$/IP=\1/' access.log | head -2
```

```text
IP=192.168.1.10
IP=10.0.0.5
```

| Phần | Ý nghĩa |
|---|---|
| `^([0-9.]+)` | Từ đầu dòng, nhóm 1 gồm chữ số và dấu chấm (địa chỉ IP) |
| ` .*$` | Một dấu cách rồi mọi thứ đến cuối dòng |
| `IP=\1` | Thay cả dòng bằng `IP=` + nội dung nhóm 1 |

## Thực hành

1. Đếm số request **không** thành công (mã khác 200) trong `access.log`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   grep -vc ' 200 ' access.log
   ```

   Có dấu cách quanh `200` để không khớp nhầm các số như `1200` ở cột byte. Kết quả `3`.

   </details>

2. In các dòng có mã 4xx (400–499) bằng một regex.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   grep -E ' 4[0-9]{2} ' access.log
   ```

   </details>

3. Xem `/etc/login.defs` (file cấu hình gần 400 dòng) mà bỏ hết chú thích và dòng trống. Còn bao nhiêu dòng thật sự có tác dụng?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   grep -vE '^(#|$)' /etc/login.defs
   grep -vcE '^(#|$)' /etc/login.defs
   ```

   Trên Ubuntu 24.04: 395 dòng nhưng chỉ 37 dòng có tác dụng.

   </details>

4. Liệt kê tên các file trong `/etc` (tìm đệ quy) có chứa chữ `hocvien`, không hiện lỗi quyền.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   grep -rl hocvien /etc 2>/dev/null
   ```

   Có `/etc/passwd`, `/etc/group`, `/etc/group-` (bản dự phòng), `/etc/subuid`, `/etc/subgid`. Đọc được hết thì chạy bằng `sudo` (sẽ có thêm `/etc/shadow`).

   </details>

5. Viết lệnh kiểm tra im lặng: nếu `access.log` có dòng chứa `/admin` thì in "Có người vào trang admin".

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   grep -q '/admin' access.log && echo "Có người vào trang admin"
   ```

   </details>

6. Rút ra mọi đường dẫn (cột 3, bắt đầu bằng `/`) của các request `GET`, không trùng lặp, chỉ dùng `grep -o` và `sort`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   grep -oE 'GET /[^ ]*' access.log | sort -u
   ```

   `[^ ]*` là chuỗi không chứa dấu cách. Kết quả còn chữ `GET ` phía trước. Muốn bỏ thì nối thêm `| cut -d' ' -f2`.

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Tìm, không phân biệt hoa thường, có số dòng | `grep -in mẫu file` |
| Dòng không khớp / đếm | `grep -v` / `grep -c` |
| Tìm trong cả thư mục | `grep -rn mẫu thư-mục` |
| Chỉ lấy phần khớp | `grep -oE 'regex' file` |
| Xem bối cảnh | `grep -C 3 mẫu file` |
| Bỏ chú thích và dòng trống | `grep -vE '^(#\|$)' file` |
| Regex: đầu / cuối dòng / ký tự bất kỳ / lặp | `^` / `$` / `.` / `*` `+` `?` `{n}` |
| Tìm chuỗi có ký tự đặc biệt | `grep -F 'a.b'` |
