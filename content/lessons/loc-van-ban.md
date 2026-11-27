---
summary: Các bộ lọc văn bản để cắt cột (cut), sắp xếp (sort), gộp và đếm dòng trùng (uniq), đổi ký tự (tr), ghép file (paste), sửa hàng loạt (sed) và tính toán theo cột (awk). Ghép chúng bằng pipe để phân tích log, file cấu hình, file CSV ngay trên server.
minutes: 50
commands: [cut, sort, uniq, tr, paste, sed, awk, split, od]
quiz:
  - q: "Lấy cột thứ nhất (tên user) trong /etc/passwd, nơi các cột cách nhau bằng dấu `:`."
    options: ["cut -f1 /etc/passwd", "cut -d: -f1 /etc/passwd", "cut -c1 /etc/passwd", "sort -k1 /etc/passwd"]
    answer: 1
    explain: "`-d:` chọn dấu `:` làm ký tự phân cách, `-f1` lấy cột 1. Không có `-d`, `cut` mặc định tách theo ký tự Tab."
  - q: "Vì sao trước `uniq` gần như luôn có `sort`?"
    options: ["Cho đẹp", "uniq chỉ gộp các dòng trùng nằm liền nhau", "uniq không đọc được file", "sort làm uniq chạy nhanh hơn"]
    answer: 1
    explain: "`uniq` chỉ so mỗi dòng với dòng ngay trước nó. Các dòng giống nhau nằm rải rác sẽ không được gộp. `sort` đưa chúng về cạnh nhau trước."
  - q: "`printf \"10\\n9\\n100\\n\" | sort` in ra thứ tự nào?"
    options: ["9 10 100", "10 100 9", "100 10 9", "9 100 10"]
    answer: 1
    explain: "`sort` mặc định so như chữ, từng ký tự từ trái sang: \"1\" đứng trước \"9\". Muốn so như số thì dùng `sort -n`, kết quả 9 10 100."
  - q: Lệnh nào thay mọi chữ http thành https trong file config.txt, sửa thẳng vào file?
    options: ["sed 's/http/https/g' config.txt", "sed -i 's/http/https/g' config.txt", "tr http https config.txt", "cut -i http https config.txt"]
    answer: 1
    explain: "Không có `-i`, `sed` chỉ in kết quả ra màn hình, file không đổi. `-i` (in-place) ghi thẳng vào file. `-i.bak` còn giữ lại bản cũ tên `config.txt.bak`."
  - q: "`awk '$4 >= 400' access.log` làm gì?"
    options: ["In cột 4", "In các dòng có cột 4 lớn hơn hoặc bằng 400", "Xoá các dòng lỗi", "Đếm số dòng"]
    answer: 1
    explain: "Trong awk, `$4` là cột thứ 4. Một điều kiện đứng một mình (không có `{ }`) nghĩa là in những dòng thoả điều kiện. Với log web, đó là các request lỗi (mã 4xx, 5xx)."
  - q: "Đếm mỗi IP xuất hiện bao nhiêu lần, nhiều nhất lên đầu: điền vào `cut -d' ' -f1 access.log | ____`"
    options: ["uniq -c | sort", "sort | uniq -c | sort -rn", "sort -rn | uniq", "uniq | sort -c"]
    answer: 1
    explain: "`sort` đưa IP giống nhau về cạnh nhau, `uniq -c` gộp lại kèm số lần, `sort -rn` sắp theo số giảm dần. Đây là chuỗi lệnh kinh điển để phân tích log."
---

Tạo file log mẫu để làm theo (mỗi dòng: IP, phương thức, đường dẫn, mã trạng thái, số byte):

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
```

## cut: cắt lấy cột

```bash
cut -d' ' -f1 access.log
cut -d: -f1,7 /etc/passwd | head -3
```

| Phần | Ý nghĩa |
|---|---|
| `cut` | Cắt lấy một phần của mỗi dòng |
| `-d' '` | Ký tự phân cách giữa các cột (**d**elimiter) là dấu cách. Không ghi thì mặc định là Tab |
| `-f1` | Lấy cột (**f**ield) số 1 |
| `-d:` | Phân cách bằng dấu `:` |
| `-f1,7` | Lấy cột 1 và 7. Viết `-f2-4` để lấy cột 2 đến 4 |

```text
192.168.1.10
10.0.0.5
192.168.1.10
172.16.0.7
10.0.0.5
192.168.1.10
root:/bin/bash
daemon:/usr/sbin/nologin
bin:/usr/sbin/nologin
```

`-c1-8` cắt theo vị trí ký tự (ký tự 1 đến 8) thay vì theo cột.

Hạn chế: `cut` coi **mỗi** dấu cách là một ranh giới. Nếu các cột cách nhau bằng nhiều dấu cách (như kết quả của `ps`, `ls -l`), `cut` sẽ lấy sai cột. Lúc đó dùng `awk` (ở dưới) hoặc ép dấu cách bằng `tr -s ' '` trước.

## sort: sắp xếp dòng

```bash
cut -d' ' -f1 access.log | sort
sort -k5 -n access.log | head -2
sort -k5 -rn access.log | head -2
```

| Tuỳ chọn | Ý nghĩa |
|---|---|
| (không có) | Sắp theo thứ tự chữ |
| `-n` | So như **số** (**n**umeric) |
| `-r` | Đảo ngược, lớn lên đầu (**r**everse) |
| `-k5` | Sắp theo cột 5 (**k**ey). Cột mặc định cách nhau bằng khoảng trắng |
| `-t:` | Đổi ký tự phân cách cột thành `:` (dùng với `-k`) |
| `-u` | Bỏ dòng trùng (**u**nique) |
| `-h` | So dung lượng dạng người đọc: `512 < 1K < 2M < 3G` (**h**uman) |

```text
192.168.1.10 GET /khongco 404 64
192.168.1.10 POST /login 302 128
10.0.0.5 GET /login 200 1024
192.168.1.10 GET /index.html 200 512
```

Hai dòng đầu: hai request ít byte nhất. Hai dòng sau (có `-r`): hai request nhiều byte nhất.

Bẫy so chữ và so số:

```bash
printf "10\n9\n100\n" | sort
printf "10\n9\n100\n" | sort -n
```

```text
10
100
9
9
10
100
```

Ví dụ thực tế: `du -sh /var/* 2>/dev/null | sort -h | tail -5` cho biết 5 thư mục chiếm nhiều chỗ nhất trong `/var`.

## uniq: gộp dòng trùng liền nhau

```bash
cut -d' ' -f1 access.log | sort | uniq
cut -d' ' -f1 access.log | sort | uniq -c | sort -rn
```

| Tuỳ chọn | Ý nghĩa |
|---|---|
| (không có) | Gộp các dòng giống nhau **nằm liền nhau** thành một |
| `-c` | In kèm số lần xuất hiện (**c**ount) |
| `-d` | Chỉ in những dòng có lặp lại (**d**uplicate) |
| `-u` | Chỉ in những dòng không lặp lại |

```text
10.0.0.5
172.16.0.7
192.168.1.10
      3 192.168.1.10
      2 10.0.0.5
      1 172.16.0.7
```

Chuỗi `sort | uniq -c | sort -rn` là **công thức đếm** dùng rất nhiều: IP nào truy cập nhiều nhất, trang nào lỗi nhiều nhất, user nào đăng nhập sai nhiều nhất.

Quên `sort` thì `uniq` không gộp được các dòng nằm rải rác:

```text
192.168.1.10
10.0.0.5
192.168.1.10
...
```

## tr: đổi hoặc xoá ký tự

`tr` chỉ đọc **stdin** (không nhận tên file), nên luôn đứng sau `|` hoặc `<`.

```bash
echo "Xin Chao" | tr a-z A-Z
echo "a,b,c" | tr ',' '\n'
echo "aaa   bbb" | tr -s ' '
echo "abc123" | tr -d '0-9'
```

| Lệnh | Làm gì | Kết quả |
|---|---|---|
| `tr a-z A-Z` | Đổi chữ thường thành chữ hoa | `XIN CHAO` |
| `tr ',' '\n'` | Đổi dấu phẩy thành xuống dòng | `a`, `b`, `c` trên 3 dòng |
| `tr -s ' '` | Ép nhiều dấu cách liền nhau thành một (**s**queeze) | `aaa bbb` |
| `tr -d '0-9'` | Xoá mọi chữ số (**d**elete) | `abc` |

## paste: ghép file theo cột

```bash
printf "an\nbinh\n" > ten.txt
printf "20\n25\n" > tuoi.txt
paste ten.txt tuoi.txt
paste -d, ten.txt tuoi.txt
paste -sd, ten.txt
```

```text
an	20
binh	25
an,20
binh,25
an,binh
```

| Phần | Ý nghĩa |
|---|---|
| `paste a b` | Ghép dòng 1 của a với dòng 1 của b…, cách nhau bằng Tab |
| `-d,` | Dùng dấu phẩy làm ký tự nối |
| `-s` | Ghép mọi dòng của **một** file thành một dòng (**s**erial) |

## sed: sửa hàng loạt

`sed` (**s**tream **ed**itor) đọc từng dòng, sửa theo lệnh rồi in ra. Việc dùng nhiều nhất là **thay thế**.

```bash
sed 's/GET/LAY/' access.log | head -2
```

```text
192.168.1.10 LAY /index.html 200 512
10.0.0.5 LAY /login 200 1024
```

Đọc lệnh `s/GET/LAY/g`:

| Phần | Ý nghĩa |
|---|---|
| `s` | Thay thế (**s**ubstitute) |
| `/GET/` | Mẫu cần tìm (là biểu thức chính quy, học ở [bài sau](/bai/grep-va-regex)) |
| `LAY/` | Chuỗi thay vào |
| `g` | Thay mọi chỗ trên dòng. Không có `g` thì chỉ thay chỗ đầu tiên của mỗi dòng |

Các cách dùng khác:

| Lệnh | Làm gì |
|---|---|
| `sed -n '2,3p' file` | Chỉ in dòng 2 đến 3. `-n` tắt việc tự in mọi dòng, `p` là in (**p**rint) |
| `sed '/404/d' file` | Xoá (không in) các dòng chứa `404` (**d**elete) |
| `sed -i 's/cũ/mới/g' file` | Sửa **thẳng vào file** (**i**n-place) |
| `sed -i.bak 's/cũ/mới/g' file` | Sửa thẳng vào file, giữ bản cũ là `file.bak` |
| `sed 's#/var/www#/srv/web#g'` | Dùng `#` thay `/` làm dấu ngăn khi chuỗi chứa sẵn `/`, đỡ phải viết `\/` |

Ví dụ thực tế: đổi cổng trong file cấu hình mà không cần mở trình soạn thảo:

```bash
sudo sed -i.bak 's/^Port 22$/Port 2222/' /etc/ssh/sshd_config
```

`^` là đầu dòng, `$` là cuối dòng. Mẫu này chỉ khớp dòng có đúng nội dung `Port 22`.

> Không có `-i`, file **không thay đổi**: `sed` chỉ in kết quả ra màn hình. Hãy chạy thử không có `-i` để xem trước, đúng rồi mới thêm `-i`.

## awk: xử lý theo cột và tính toán

`awk` tự tách mỗi dòng thành các cột (theo khoảng trắng, dù có bao nhiêu dấu cách). `$1` là cột 1, `$2` là cột 2…, `$0` là cả dòng, `NF` là số cột.

```bash
awk '{print $1, $4}' access.log | head -3
awk '$4 >= 400' access.log
awk '{tong += $5} END {print tong}' access.log
awk -F: '$3 >= 1000 {print $1, $3}' /etc/passwd
```

| Lệnh | Làm gì |
|---|---|
| `awk '{print $1, $4}'` | In cột 1 và cột 4 của mỗi dòng |
| `awk '$4 >= 400'` | In dòng có cột 4 lớn hơn hoặc bằng 400 (điều kiện không kèm `{ }` thì mặc định in dòng) |
| `awk '{tong += $5} END {print tong}'` | Cộng dồn cột 5 qua mọi dòng. Khối `END` chạy một lần sau dòng cuối |
| `awk -F: '...'` | Đổi ký tự phân cách thành `:` (**F**ield separator) |
| `$3 >= 1000 {print $1, $3}` | Dòng nào cột 3 ≥ 1000 thì in cột 1 và 3 |

```text
192.168.1.10 200
10.0.0.5 200
192.168.1.10 302
172.16.0.7 GET /admin 403 256
192.168.1.10 GET /khongco 404 64
2496
nobody 65534
ubuntu 1000
hocvien 1001
```

Dòng cuối liệt kê các user thật (UID từ 1000 trở lên trên Ubuntu). `nobody` là user đặc biệt có UID 65534.

Luôn đặt chương trình awk trong **nháy đơn**, để shell không thay `$1`, `$4` bằng biến của shell.

## split và od (biết qua)

| Lệnh | Làm gì |
|---|---|
| `split -l 4 so.txt phan_` | Chia file thành nhiều file nhỏ, mỗi file 4 dòng: `phan_aa`, `phan_ab`, `phan_ac` |
| `split -b 100M file.iso phan_` | Chia theo dung lượng, mỗi phần 100 MB. Ghép lại bằng `cat phan_* > file.iso` |
| `od -c file` | In từng byte của file dưới dạng ký tự, để thấy ký tự ẩn như `\t`, `\r`, `\n` |
| `cat -A file` | Cách nhanh hơn để thấy ký tự ẩn: Tab hiện là `^I`, cuối dòng hiện `$` |

`cat -A` rất hữu ích khi script lỗi lạ vì file được soạn trên Windows: mỗi cuối dòng hiện `^M$` (ký tự `\r` thừa).

## Thực hành

Dùng `~/access.log` và `/etc/passwd`.

1. In danh sách các mã trạng thái (cột 4) khác nhau trong log, mỗi mã một lần.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   cut -d' ' -f4 access.log | sort -u
   ```

   Kết quả: `200`, `302`, `403`, `404`.

   </details>

2. Đếm số request theo từng đường dẫn (cột 3), nhiều nhất lên đầu.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   awk '{print $3}' access.log | sort | uniq -c | sort -rn
   ```

   `/index.html` và `/login` mỗi trang 2 lần, `/admin` và `/khongco` mỗi trang 1 lần.

   </details>

3. In những request lỗi (mã ≥ 400) dạng `IP -> đường dẫn (mã)`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   awk '$4 >= 400 {print $1 " -> " $3 " (" $4 ")"}' access.log
   ```

   ```text
   172.16.0.7 -> /admin (403)
   192.168.1.10 -> /khongco (404)
   ```

   </details>

4. Tính tổng số byte mà IP `192.168.1.10` đã tải.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   awk '$1 == "192.168.1.10" {tong += $5} END {print tong}' access.log
   ```

   Kết quả `704` (512 + 128 + 64).

   </details>

5. Liệt kê tên các user có shell là `/bin/bash`, dạng một dòng cách nhau bằng dấu phẩy.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   awk -F: '$7 == "/bin/bash" {print $1}' /etc/passwd | paste -sd,
   ```

   Kết quả `root,ubuntu,hocvien`.

   </details>

6. Chép `access.log` thành `access2.log`, rồi dùng `sed` đổi mọi `GET` thành `get` ngay trong file `access2.log`, giữ bản cũ đuôi `.bak`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   cp access.log access2.log
   sed -i.bak 's/GET/get/g' access2.log
   head -2 access2.log access2.log.bak
   ```

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Lấy cột (phân cách 1 ký tự) | `cut -d: -f1,3 file` |
| Lấy cột (nhiều khoảng trắng) | `awk '{print $1, $3}' file` |
| Sắp xếp theo số, giảm dần, theo cột | `sort -k5 -rn` |
| Đếm số lần xuất hiện | `sort \| uniq -c \| sort -rn` |
| Đổi / xoá ký tự | `tr a-z A-Z`, `tr -d '\r'` |
| Thay chữ trong file | `sed -i.bak 's/cũ/mới/g' file` |
| In dòng thoả điều kiện | `awk '$4 >= 400' file` |
| Cộng một cột | `awk '{s += $5} END {print s}' file` |
