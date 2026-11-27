---
summary: Đọc file mà không cần trình soạn thảo — in cả file (cat), cuộn từng trang (less), xem đầu và cuối file (head, tail), theo dõi log đang ghi (tail -f), đếm dòng (wc), đánh số dòng (nl), kiểm tra file có bị thay đổi không (sha256sum), đọc file nén (zcat).
minutes: 35
commands: [cat, less, head, tail, tail -f, wc, nl, tac, sha256sum, md5sum, zcat]
quiz:
  - q: Muốn xem 20 dòng cuối của file log thì gõ gì?
    options: ["head -n 20 app.log", "tail -n 20 app.log", "cat -20 app.log", "less -20 app.log"]
    answer: 1
    explain: "`tail` lấy phần cuối file, `-n 20` là 20 dòng. `head` lấy phần đầu."
  - q: Lệnh nào theo dõi file log, in thêm dòng mới ngay khi chương trình ghi vào?
    options: ["cat -f app.log", "tail -f app.log", "less app.log", "wc -l app.log"]
    answer: 1
    explain: "`tail -f` (follow) không thoát sau khi in, mà chờ và in tiếp mỗi khi file có dòng mới. Bấm Ctrl+C để dừng."
  - q: Trong less, phím nào để tìm từ "error"?
    options: [":error", "/error rồi Enter", "Ctrl+F error", "find error"]
    answer: 1
    explain: "Gõ `/` rồi từ khoá, bấm Enter. `n` nhảy tới kết quả kế tiếp, `N` về kết quả trước, `q` để thoát."
  - q: "`wc -l app.log` in ra `5 app.log`. Số 5 là gì?"
    options: ["Số từ", "Số dòng", "Số byte", "Số lỗi"]
    answer: 1
    explain: "`-l` đếm số dòng (lines). `-w` đếm từ, `-c` đếm byte. Không có tuỳ chọn thì in cả ba."
  - q: Tải một file cài đặt về, làm sao chắc chắn file không bị hỏng hay bị sửa?
    options: ["So kích thước file", "Tính sha256sum và so với mã nhà cung cấp công bố", "Mở bằng cat xem thử", "Đổi tên file"]
    answer: 1
    explain: Chỉ cần đổi một byte là mã băm SHA-256 thay đổi hoàn toàn. So mã tính được với mã trên trang tải về là biết file còn nguyên vẹn.
---

Tạo một file mẫu để làm theo:

```bash
cd ~
printf "dong 1: khoi dong\ndong 2: ket noi database\ndong 3: loi timeout\ndong 4: thu lai\ndong 5: thanh cong\n" > app.log
```

| Phần | Ý nghĩa |
|---|---|
| `printf "...\n..."` | In chuỗi ra, `\n` là xuống dòng |
| `> app.log` | Ghi kết quả vào file `app.log` thay vì in ra màn hình |

## cat: in cả file

```bash
cat app.log
cat -n app.log
```

| Phần | Ý nghĩa |
|---|---|
| `cat` | In nội dung file ra màn hình. Tên đầy đủ là con**cat**enate (nối), vì nó nối nhiều file: `cat a.txt b.txt` |
| `-n` | Đánh số mọi dòng (**n**umber) |

```text
     1	dong 1: khoi dong
     2	dong 2: ket noi database
     3	dong 3: loi timeout
     4	dong 4: thu lai
     5	dong 5: thanh cong
```

`cat` hợp với file **ngắn**. File dài hàng nghìn dòng thì chữ trôi vèo qua màn hình, nên dùng `less`. Đừng `cat` file chương trình (ELF): màn hình sẽ đầy ký tự rác, có khi làm rối cả terminal (gõ `reset` để sửa).

`tac` (chữ `cat` viết ngược) in file từ dòng cuối lên dòng đầu.

## less: đọc file dài

```bash
less /etc/services
```

`less` mở file theo từng trang, không tải cả file vào bộ nhớ, nên mở được cả file log vài GB.

| Phím | Làm gì |
|---|---|
| `Space` / `b` | Xuống / lên một trang |
| `↓` `↑` hoặc `j` `k` | Xuống / lên một dòng |
| `g` / `G` | Về đầu file / xuống cuối file |
| `/từ` rồi `Enter` | Tìm xuôi. `n` kết quả sau, `N` kết quả trước |
| `?từ` rồi `Enter` | Tìm ngược lên trên |
| `-N` rồi `Enter` | Bật/tắt số dòng |
| `F` | Theo dõi file như `tail -f` (Ctrl+C để thôi theo dõi) |
| `q` | Thoát |

`man` cũng dùng `less` để hiển thị, nên các phím trên dùng được trong trang man. Lệnh `more` cũ hơn và ít tính năng hơn `less`.

## head: xem phần đầu

```bash
head -n 2 app.log
head -3 /etc/passwd
```

| Phần | Ý nghĩa |
|---|---|
| `head` | In phần đầu file, mặc định 10 dòng |
| `-n 2` | Lấy 2 dòng. Viết tắt `-2` cũng được |

```text
dong 1: khoi dong
dong 2: ket noi database
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
```

`head -c 100 file` lấy 100 **byte** đầu thay vì dòng.

## tail: xem phần cuối và theo dõi log

```bash
tail -n 2 app.log
tail -n +4 app.log
```

| Phần | Ý nghĩa |
|---|---|
| `tail` | In phần cuối file, mặc định 10 dòng |
| `-n 2` | 2 dòng cuối |
| `-n +4` | Từ dòng thứ 4 đến hết file (có dấu `+`) |

```text
dong 4: thu lai
dong 5: thanh cong
```

### tail -f: xem log đang được ghi

Đây là lệnh dùng nhiều nhất khi gỡ lỗi server: mở log, rồi thao tác trên web để xem log chạy theo thời gian thực.

```bash
tail -f app.log
```

| Phần | Ý nghĩa |
|---|---|
| `-f` | **f**ollow: in 10 dòng cuối rồi **không thoát**, chờ và in tiếp mỗi dòng mới được ghi vào |
| `-F` | Như `-f` nhưng vẫn theo dõi nếu file bị xoá rồi tạo lại (khi log được xoay vòng hằng ngày) |

Thử: mở **hai** terminal vào container (terminal thứ hai gõ `docker exec -it lab bash`). Terminal 1 chạy `tail -f ~/app.log`. Terminal 2 gõ:

```bash
echo "dong 6: co request moi" >> ~/app.log
```

Terminal 1 lập tức hiện thêm dòng mới. Bấm `Ctrl+C` để dừng `tail`.

Kết hợp hay dùng: `tail -n 100 -f /var/log/nginx/error.log` để xem 100 dòng cuối rồi theo dõi tiếp.

## wc: đếm dòng, từ, byte

```bash
wc app.log
wc -l app.log
wc -l /etc/passwd /etc/group
```

| Phần | Ý nghĩa |
|---|---|
| `wc` | Đếm (**w**ord **c**ount) |
| (không tuỳ chọn) | In số dòng, số từ, số byte |
| `-l` | Chỉ đếm dòng (**l**ines) |
| `-w` | Chỉ đếm từ (**w**ords) |
| `-c` | Chỉ đếm byte |

```text
 5 21 98 app.log
5 app.log
  21 /etc/passwd
  45 /etc/group
  66 total
```

`wc -l /etc/passwd` cho biết máy có bao nhiêu tài khoản (mỗi dòng một tài khoản). `wc` hay đứng cuối đường ống để đếm kết quả, ví dụ `ls | wc -l` đếm số file (đường ống học ở [bài 13](/bai/chuyen-huong-va-pipe)).

## nl: đánh số dòng

```bash
printf "a\n\nb\n" > nl.txt
nl nl.txt
```

```text
     1	a
       
     2	b
```

Khác `cat -n`: `nl` mặc định **bỏ qua dòng trống**, không đánh số chúng. `cat -n` đánh số cả dòng trống.

## sha256sum: kiểm tra file có bị thay đổi không

Mã băm (hash) là một chuỗi tính từ nội dung file. Chỉ cần sửa một byte là chuỗi thay đổi hoàn toàn. Dùng để kiểm tra file tải về còn nguyên vẹn, hoặc file cấu hình có bị ai sửa không.

```bash
sha256sum app.log
sha256sum app.log > app.log.sha256
sha256sum -c app.log.sha256
```

| Phần | Ý nghĩa |
|---|---|
| `sha256sum app.log` | Tính mã SHA-256 của file |
| `> app.log.sha256` | Lưu mã vào file |
| `-c app.log.sha256` | Tính lại và so với mã đã lưu (**c**heck) |

```text
0fe1ea809798bc8c28435cfdc78d3445fcfb99c98a1f915fd2f4e886cf58ea8e  app.log
app.log: OK
```

Sửa file rồi kiểm tra lại:

```text
app.log: FAILED
sha256sum: WARNING: 1 computed checksum did NOT match
```

`md5sum` làm việc tương tự nhưng thuật toán MD5 đã cũ, không còn an toàn để chống giả mạo. Nên dùng `sha256sum` (hoặc `sha512sum`).

## zcat, bzcat, xzcat: đọc file nén

Log cũ thường được nén lại (đuôi `.gz`). Không cần giải nén ra mới đọc được:

```bash
gzip -k app.log
zcat app.log.gz | head -2
```

| Phần | Ý nghĩa |
|---|---|
| `gzip -k app.log` | Nén file thành `app.log.gz`, giữ (**k**eep) file gốc |
| `zcat` | Giải nén ra màn hình (như `cat` cho file `.gz`), file nén vẫn giữ nguyên |
| `\| head -2` | Chỉ lấy 2 dòng đầu |

Tương tự: `bzcat` cho `.bz2`, `xzcat` cho `.xz`, `zless` để cuộn file `.gz` như `less`. Nén và giải nén học kỹ ở bài [Nén và lưu trữ](/bai/nen-va-luu-tru).

## Thực hành

1. File `/etc/services` có bao nhiêu dòng? Xem 5 dòng đầu và 5 dòng cuối.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   wc -l /etc/services
   head -n 5 /etc/services
   tail -n 5 /etc/services
   ```

   </details>

2. Mở `/etc/services` bằng `less`, tìm dòng có chữ `ssh`. SSH dùng cổng mấy?

   <details>
   <summary>Xem đáp án</summary>

   Trong `less` gõ `/ssh` rồi `Enter`. Dòng tìm được là `ssh 22/tcp # SSH Remote Login Protocol`: SSH dùng cổng **22**. Bấm `q` để thoát.

   </details>

3. In dòng thứ 3 của `app.log` bằng cách kết hợp `head` và `tail`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   head -n 3 app.log | tail -n 1
   ```

   `head -n 3` lấy 3 dòng đầu, rồi `tail -n 1` lấy dòng cuối trong 3 dòng đó. Dấu `|` chuyển kết quả của lệnh trước làm đầu vào cho lệnh sau.

   </details>

4. Mở hai terminal. Một bên chạy `tail -f ~/app.log`, bên kia ghi thêm 3 dòng vào file. Quan sát rồi dừng `tail`.

   <details>
   <summary>Xem cách làm</summary>

   Terminal 2: `docker exec -it lab bash`, rồi:

   ```bash
   for i in 1 2 3; do echo "request $i" >> ~/app.log; sleep 1; done
   ```

   Terminal 1 hiện từng dòng cách nhau 1 giây. Bấm `Ctrl+C` ở terminal 1 để dừng.

   </details>

5. Lưu mã SHA-256 của `/etc/passwd` vào `~/passwd.sha256`. Kiểm tra lại ngay (phải OK). Bài [Lệnh quản lý người dùng](/bai/lenh-quan-ly-nguoi-dung) sẽ tạo user mới, lúc đó kiểm tra lại sẽ thấy FAILED.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sha256sum /etc/passwd > ~/passwd.sha256
   sha256sum -c ~/passwd.sha256
   ```

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| In cả file ngắn, có số dòng | `cat -n file` |
| Đọc file dài, tìm kiếm | `less file`, trong đó `/từ`, `q` |
| N dòng đầu / cuối | `head -n N file` / `tail -n N file` |
| Theo dõi log | `tail -f file` (Ctrl+C để dừng) |
| Đếm dòng | `wc -l file` |
| Kiểm tra file nguyên vẹn | `sha256sum file`, `sha256sum -c file.sha256` |
| Đọc file `.gz` | `zcat file.gz`, `zless file.gz` |
