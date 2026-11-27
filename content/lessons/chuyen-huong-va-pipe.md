---
summary: Mỗi lệnh có ba luồng dữ liệu — đầu vào, đầu ra, lỗi. Bài này dạy ghi kết quả vào file (>, >>), tách riêng lỗi (2>), vứt bỏ kết quả (/dev/null), nối lệnh bằng đường ống (|), vừa xem vừa ghi (tee), và biến kết quả thành đối số (xargs). Đây là sức mạnh lớn nhất của dòng lệnh Linux.
minutes: 45
commands: [">", ">>", "2>", "2>&1", "&>", "<", "<<", "|", tee, xargs, /dev/null]
quiz:
  - q: "Khác nhau giữa `>` và `>>` là gì?"
    options: ["Không khác", "> ghi đè file, >> ghi nối vào cuối file", "> ghi lỗi, >> ghi kết quả", ">> nhanh hơn"]
    answer: 1
    explain: "`>` xoá sạch nội dung cũ rồi ghi. `>>` giữ nội dung cũ và ghi thêm vào cuối. Nhầm `>` thay cho `>>` là mất dữ liệu."
  - q: "Lệnh `find / -name x > ketqua.txt` vẫn in đầy `Permission denied` ra màn hình. Vì sao?"
    options: ["Vì find bị lỗi", "Vì thông báo lỗi đi qua luồng stderr (số 2), còn > chỉ chuyển luồng stdout (số 1)", "Vì file ketqua.txt chỉ đọc", "Vì thiếu sudo"]
    answer: 1
    explain: "`>` là viết tắt của `1>`, chỉ chuyển stdout. Lỗi đi qua stderr. Muốn chuyển cả lỗi thì thêm `2>file`, hoặc `2>/dev/null` để vứt bỏ."
  - q: "Cách nào ghi CẢ kết quả lẫn lỗi vào cùng file log.txt?"
    options: ["lệnh 2>&1 > log.txt", "lệnh > log.txt 2>&1", "lệnh 2> log.txt", "lệnh | log.txt"]
    answer: 1
    explain: "Shell xử lý chuyển hướng từ trái sang phải. `> log.txt` trỏ stdout vào file trước, rồi `2>&1` trỏ stderr vào cùng chỗ với stdout. Viết ngược thứ tự thì stderr vẫn ra màn hình. Cách ngắn hơn trong bash: `&> log.txt`."
  - q: "Dấu `|` làm gì?"
    options: ["Ghi vào file", "Đưa stdout của lệnh trước làm stdin của lệnh sau", "Chạy hai lệnh song song không liên quan", "Hoặc logic"]
    answer: 1
    explain: "Đường ống nối đầu ra của lệnh trái với đầu vào của lệnh phải, không cần file trung gian. Ví dụ `ls /etc | wc -l` đếm số mục trong /etc."
  - q: Muốn vừa xem kết quả trên màn hình vừa lưu vào file, dùng lệnh nào ở cuối đường ống?
    options: ["cat", "tee", "xargs", "less"]
    answer: 1
    explain: "`tee file` chép dữ liệu nhận được ra hai hướng: màn hình (stdout) và file. Thêm `-a` để ghi nối thay vì ghi đè."
  - q: "`find . -name \"*.tmp\" | rm` không xoá được gì. Cần sửa thế nào?"
    options: ["find . -name \"*.tmp\" | rm -f", "find . -name \"*.tmp\" | xargs rm", "find . -name \"*.tmp\" > rm", "rm < find . -name \"*.tmp\""]
    answer: 1
    explain: "`rm` không đọc tên file từ stdin, nó chỉ nhận đối số. `xargs` đọc danh sách từ stdin và đặt chúng làm đối số cho `rm`."
---

## Ba luồng dữ liệu

Mỗi chương trình khi chạy được mở sẵn ba "ống":

| Số | Tên | Mặc định nối với | Ví dụ |
|---|---|---|---|
| 0 | **stdin** (đầu vào chuẩn) | Bàn phím | Chữ bạn gõ cho `read`, `cat` không có đối số |
| 1 | **stdout** (đầu ra chuẩn) | Màn hình | Danh sách file của `ls` |
| 2 | **stderr** (lỗi chuẩn) | Màn hình | `ls: cannot access '/khongco': No such file or directory` |

stdout và stderr cùng hiện trên màn hình nên trông như một. Nhưng chúng là **hai đường riêng**, và có thể chuyển hướng riêng từng đường.

## Chuyển hướng đầu ra: > và >>

```bash
echo "dong 1" > f.txt
echo "dong 2" > f.txt
cat f.txt
echo "dong 3" >> f.txt
cat f.txt
```

| Ký hiệu | Ý nghĩa |
|---|---|
| `> file` | Ghi stdout vào file. File chưa có thì tạo, **có rồi thì xoá sạch nội dung cũ** |
| `>> file` | Ghi stdout **nối** vào cuối file |

```text
dong 2
dong 2
dong 3
```

Lần ghi thứ hai bằng `>` đã xoá mất `dong 1`.

> **Chống ghi đè nhầm:** `set -o noclobber` khiến `>` từ chối ghi vào file đã có (`cannot overwrite existing file`). Khi thật sự muốn ghi đè thì dùng `>|`.

## Chuyển hướng lỗi: 2>

```bash
ls /etc/hostname /khongco > out.txt
cat out.txt
```

```text
ls: cannot access '/khongco': No such file or directory
/etc/hostname
```

Dòng lỗi **vẫn hiện ra màn hình**, vì `>` chỉ chuyển stdout. File `out.txt` chỉ có `/etc/hostname`.

| Cách viết | stdout đi đâu | stderr đi đâu |
|---|---|---|
| `lệnh > out.txt` | `out.txt` | Màn hình |
| `lệnh 2> err.txt` | Màn hình | `err.txt` |
| `lệnh > out.txt 2> err.txt` | `out.txt` | `err.txt` |
| `lệnh > all.txt 2>&1` | `all.txt` | `all.txt` (cùng chỗ với stdout) |
| `lệnh &> all.txt` | `all.txt` | `all.txt` (cách viết ngắn của bash) |
| `lệnh 2>/dev/null` | Màn hình | Vứt bỏ |
| `lệnh > /dev/null 2>&1` | Vứt bỏ | Vứt bỏ (chạy im lặng, chỉ quan tâm mã thoát) |

Đọc `2>&1`:

| Phần | Ý nghĩa |
|---|---|
| `2>` | Chuyển hướng luồng số 2 (stderr) |
| `&1` | Tới **nơi luồng số 1 đang trỏ**. Có dấu `&` để phân biệt với file tên là `1` |

**Thứ tự quan trọng.** Shell đọc chuyển hướng từ trái sang phải:

```bash
ls /etc/hostname /khongco 2>&1 > wrong.txt
```

```text
ls: cannot access '/khongco': No such file or directory
```

Ở đây `2>&1` chạy trước, lúc đó stdout vẫn đang trỏ ra màn hình, nên stderr cũng trỏ ra màn hình. Sau đó `> wrong.txt` mới đổi riêng stdout sang file. Viết đúng là `> file 2>&1`.

### /dev/null: thùng rác

`/dev/null` là một file đặc biệt: ghi gì vào cũng biến mất, đọc ra thì rỗng. Dùng để vứt bỏ những kết quả không cần:

```bash
find / -name "ssh_config" 2>/dev/null
```

## Chuyển hướng đầu vào: <, <<, <<<

```bash
wc -l < /etc/passwd
wc -l /etc/passwd
```

```text
21
21 /etc/passwd
```

| Cách viết | Ý nghĩa |
|---|---|
| `wc -l < file` | Shell mở file và đưa nội dung vào **stdin** của `wc`. `wc` không biết tên file nên chỉ in con số |
| `wc -l file` | `wc` tự mở file theo đối số, nên in kèm tên file |

**Heredoc** (`<<`) đưa nhiều dòng chữ vào stdin. Rất hay dùng để tạo file cấu hình trong script:

```bash
cat <<EOF > cfg.txt
host=localhost
port=5432
EOF
cat cfg.txt
```

| Phần | Ý nghĩa |
|---|---|
| `<<EOF` | Đọc các dòng tiếp theo làm stdin, đến khi gặp dòng chỉ có chữ `EOF`. Có thể dùng chữ khác thay `EOF` |
| `> cfg.txt` | Ghi stdout của `cat` vào file |
| `EOF` (dòng cuối) | Kết thúc heredoc. Phải đứng một mình, không có dấu cách phía trước |

Trong heredoc, biến như `$HOME` vẫn được thay. Viết `<<'EOF'` (có nháy) thì giữ nguyên mọi chữ.

**Here string** (`<<<`) đưa một chuỗi vào stdin: `wc -w <<< "mot hai ba"` in ra `3`.

## Đường ống: |

Đường ống nối **stdout** của lệnh bên trái vào **stdin** của lệnh bên phải. Mỗi lệnh làm một việc nhỏ, nối lại thành việc lớn. Đây là triết lý cốt lõi của Unix.

```bash
ls /etc | wc -l
cat /etc/passwd | head -3 | tail -1
```

| Phần | Ý nghĩa |
|---|---|
| `ls /etc` | Liệt kê `/etc`, kết quả đưa vào ống |
| `\| wc -l` | `wc -l` đếm số dòng nhận được |
| `head -3 \| tail -1` | Lấy 3 dòng đầu, rồi lấy dòng cuối trong số đó, tức dòng thứ 3 |

```text
126
bin:x:2:2:bin:/bin:/usr/sbin/nologin
```

Ví dụ thực tế (các lệnh lọc học ở hai bài tiếp theo):

```bash
# 5 tiến trình tốn RAM nhất
ps aux --sort=-%mem | head -6
# Các IP truy cập nhiều nhất trong log nginx
cut -d' ' -f1 /var/log/nginx/access.log | sort | uniq -c | sort -rn | head
```

Đường ống chỉ chuyển **stdout**. Lỗi (stderr) vẫn ra màn hình. Muốn đưa cả lỗi vào ống thì viết `lệnh 2>&1 | lệnh2` (bash có cách viết tắt `|&`).

### Mã thoát của đường ống

Mã thoát (`$?`) của đường ống là mã của **lệnh cuối cùng**:

```bash
false | true
echo $?
set -o pipefail
false | true
echo $?
```

```text
0
1
```

| Phần | Ý nghĩa |
|---|---|
| `false` / `true` | Hai lệnh không làm gì, chỉ trả mã thoát 1 / 0 |
| `set -o pipefail` | Bật chế độ: đường ống thất bại nếu **bất kỳ** lệnh nào thất bại. Nên bật trong script |

## tee: vừa xem vừa ghi

```bash
ls /etc | head -3 | tee list.txt
echo "them" | tee -a list.txt > /dev/null
```

| Phần | Ý nghĩa |
|---|---|
| `tee list.txt` | Nhận stdin, ghi ra **cả** màn hình **lẫn** file `list.txt` (như chữ T: một vào, hai ra) |
| `-a` | Ghi nối thay vì ghi đè |
| `> /dev/null` | Không cần in ra màn hình, chỉ cần ghi file |

`tee` còn giải quyết bẫy `sudo` với chuyển hướng (đã gặp ở [bài 5](/bai/sudo-va-root)):

```bash
echo "127.0.0.1 web.local" | sudo tee -a /etc/hosts
```

`sudo echo ... >> /etc/hosts` không được vì `>>` do shell của user thường thực hiện. Còn `sudo tee` chạy bằng root nên ghi được.

## xargs: biến stdin thành đối số

Nhiều lệnh như `rm`, `ls`, `mkdir` **không đọc stdin**, chỉ nhận đối số. `xargs` đọc danh sách từ stdin rồi đặt vào làm đối số:

```bash
find x -name "*.tmp" | xargs ls -l
find x -name "*.tmp" | xargs rm -v
```

```text
-rw-r--r-- 1 hocvien hocvien 0 Nov 27 15:08 x/a.tmp
-rw-r--r-- 1 hocvien hocvien 0 Nov 27 15:08 x/b.tmp
removed 'x/a.tmp'
removed 'x/b.tmp'
```

| Tuỳ chọn | Ý nghĩa | Ví dụ |
|---|---|---|
| (mặc định) | Gom mọi mục vào một lần chạy | `... \| xargs rm` thành `rm a b c` |
| `-n 1` | Mỗi lần chạy chỉ lấy 1 mục | `echo a b c \| xargs -n 1 echo hello` in 3 dòng |
| `-I {}` | Đặt mục vào đúng chỗ `{}` | `... \| xargs -I {} cp {} /backup/` |
| `-0` | Các mục cách nhau bằng ký tự NUL. Đi cùng `find -print0` để xử lý đúng tên file có dấu cách | `find . -name "*.log" -print0 \| xargs -0 rm` |

## Thay lệnh bằng kết quả: $(...)

Không phải chuyển hướng, nhưng hay đi cùng: `$(lệnh)` chạy lệnh rồi thay bằng kết quả của nó.

```bash
echo "Co $(ls /etc | wc -l) muc trong /etc"
```

```text
Co 126 muc trong /etc
```

## Thực hành

1. Ghi danh sách file trong `/etc` vào `~/etc.txt`, rồi **nối** thêm danh sách `/var` vào cùng file. File có bao nhiêu dòng?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ls /etc > ~/etc.txt
   ls /var >> ~/etc.txt
   wc -l ~/etc.txt
   ```

   </details>

2. Chạy `find /etc -name "*.conf"` bằng user thường: kết quả đúng vào `~/conf.txt`, thông báo lỗi vào `~/conf-loi.txt`. Mỗi file có bao nhiêu dòng?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   find /etc -name "*.conf" > ~/conf.txt 2> ~/conf-loi.txt
   wc -l ~/conf.txt ~/conf-loi.txt
   ```

   </details>

3. Kiểm tra im lặng xem user `www-data` có tồn tại không: không in gì ra màn hình, chỉ in "có" hoặc "không".

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   id www-data > /dev/null 2>&1 && echo "có" || echo "không"
   ```

   `id` in thông tin user hoặc báo lỗi. Ta vứt cả hai, chỉ dùng mã thoát để quyết định in gì.

   </details>

4. Tạo file `~/app.env` có 3 dòng `APP_PORT=3000`, `APP_ENV=production`, `APP_HOME=` + đường dẫn home thật, bằng **một** heredoc.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   cat <<EOF > ~/app.env
   APP_PORT=3000
   APP_ENV=production
   APP_HOME=$HOME
   EOF
   cat ~/app.env
   ```

   Dòng cuối thành `APP_HOME=/home/hocvien`, vì heredoc không có nháy nên `$HOME` được thay.

   </details>

5. Đếm xem `/etc` có bao nhiêu **thư mục con** (chỉ cấp đầu), bằng `find` và đường ống.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   find /etc -mindepth 1 -maxdepth 1 -type d | wc -l
   ```

   `-mindepth 1` để không đếm chính `/etc`.

   </details>

6. Tạo 5 file `~/x/so1.txt` … `~/x/so5.txt` bằng `seq` và `xargs`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   mkdir -p ~/x
   seq 1 5 | xargs -I {} touch ~/x/so{}.txt
   ls ~/x
   ```

   `seq 1 5` in các số từ 1 đến 5, mỗi số một dòng.

   </details>

## Tóm tắt

| Việc | Cách viết |
|---|---|
| Ghi đè / ghi nối kết quả vào file | `> file` / `>> file` |
| Ghi lỗi vào file | `2> file` |
| Cả kết quả lẫn lỗi vào một file | `> file 2>&1` hoặc `&> file` |
| Vứt bỏ lỗi / vứt bỏ hết | `2>/dev/null` / `> /dev/null 2>&1` |
| Lấy đầu vào từ file / nhiều dòng | `< file` / `<<EOF ... EOF` |
| Nối lệnh | `lệnh1 \| lệnh2` |
| Vừa xem vừa ghi file | `\| tee file` (`-a` để nối) |
| Danh sách thành đối số | `\| xargs lệnh` |
| Chèn kết quả lệnh vào câu | `$(lệnh)` |
