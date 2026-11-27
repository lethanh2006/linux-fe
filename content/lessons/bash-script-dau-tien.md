---
summary: Script Bash là một file chứa các lệnh, chạy lần lượt như khi bạn gõ tay. Bài này dạy viết script đầu tiên (dòng shebang, quyền chạy, cách chạy), in ra màn hình (echo, printf), nhận dữ liệu từ người dùng (read), đọc file từng dòng, và mã thoát của script.
minutes: 35
commands: ["#!/bin/bash", chmod +x, echo, printf, read, exit, "#"]
quiz:
  - q: "Dòng đầu tiên `#!/bin/bash` của script có tác dụng gì?"
    options: ["Là chú thích, không có tác dụng", "Báo cho hệ thống dùng chương trình /bin/bash để chạy file khi gọi ./script.sh", "Bắt buộc phải có để file lưu được", "Bật chế độ gỡ lỗi"]
    answer: 1
    explain: "Dòng shebang (`#!`) chỉ định trình thông dịch. Nhờ đó `./script.sh` biết phải chạy bằng bash. Script Python thì dùng `#!/usr/bin/env python3`."
  - q: Tạo xong script.sh, gõ ./script.sh báo Permission denied. Sửa thế nào?
    options: ["sudo ./script.sh", "chmod +x script.sh", "chown root script.sh", "mv script.sh /tmp"]
    answer: 1
    explain: "File mới tạo không có quyền chạy (x). `chmod +x` thêm quyền đó. Hoặc chạy bằng `bash script.sh` (không cần quyền x)."
  - q: "Lệnh nào hỏi người dùng nhập tên và lưu vào biến ten?"
    options: ["echo ten", "read -p \"Tên: \" ten", "input ten", "scan ten"]
    answer: 1
    explain: "`read` đọc một dòng từ bàn phím vào biến. `-p` in câu hỏi trước. `-s` không hiện chữ khi gõ (dùng cho mật khẩu)."
  - q: "`printf \"%-10s|%5d\\n\" tao 42` in ra gì?"
    options: ["tao|42", "tao       |   42", "%-10s|%5d", "     tao|42   "]
    answer: 1
    explain: "`%-10s` in chuỗi canh trái trong 10 ô, `%5d` in số nguyên canh phải trong 5 ô. printf hợp để in bảng thẳng cột."
  - q: "Script kết thúc bằng `exit 1`. Ý nghĩa là gì?"
    options: ["Script chạy 1 lần", "Script báo kết thúc với lỗi (mã khác 0)", "Script chạy lại", "Script thành công"]
    answer: 1
    explain: "Mã thoát 0 là thành công, khác 0 là lỗi. Chương trình gọi script (cron, CI, `&&`) dựa vào mã này để biết có thành công không."
---

## Script là gì, dùng khi nào

Một **script** là file chữ chứa các lệnh. Chạy script giống như gõ lần lượt từng lệnh trong đó. Dùng script khi:

- Việc phải làm đi làm lại: sao lưu, dọn log, triển khai ứng dụng.
- Việc nhiều bước cần làm đúng thứ tự, không được sót.
- Việc cần chạy tự động bằng cron, systemd timer, CI/CD.

Mọi thứ đã học về lệnh, pipe, chuyển hướng đều dùng được trong script. Các bài từ đây đến [bài 39](/bai/bash-thuc-hanh-va-go-loi) bám theo video TITV bài 44–55.

## Script đầu tiên

Tạo file `chao.sh` bằng vim hoặc nano:

```bash
#!/bin/bash
# Script đầu tiên: chào người dùng
echo "Xin chào, $USER!"
echo "Hôm nay là $(date +%d/%m/%Y)"
echo "Bạn đang ở thư mục: $(pwd)"
```

| Dòng | Ý nghĩa |
|---|---|
| `#!/bin/bash` | **Shebang**: phải là dòng đầu tiên, báo hệ thống chạy file bằng `/bin/bash` |
| `# Script đầu tiên...` | Chú thích: dòng bắt đầu bằng `#` bị bỏ qua |
| `echo "... $USER!"` | In chữ, `$USER` được thay bằng tên user |
| `$(date +%d/%m/%Y)` | Chạy lệnh `date` rồi chèn kết quả vào câu |

### Chạy script

```bash
./chao.sh
chmod +x chao.sh
./chao.sh
```

```text
bash: ./chao.sh: Permission denied
Xin chào, hocvien!
Hôm nay là 27/11/2026
Bạn đang ở thư mục: /home/hocvien
```

| Cách chạy | Ghi chú |
|---|---|
| `./chao.sh` | Cần quyền `x` (`chmod +x`) và dòng shebang. `./` nghĩa là "file ở thư mục hiện tại", vì `.` không có trong PATH |
| `bash chao.sh` | Không cần quyền `x`, không cần shebang |
| `/home/hocvien/chao.sh` | Đường dẫn tuyệt đối, chạy được từ bất cứ đâu |
| `chao.sh` | Chỉ được nếu thư mục chứa nó nằm trong PATH ([bài 33](/bai/moi-truong-shell)) |
| `source chao.sh` | Chạy trong **shell hiện tại** (biến tạo ra còn lại sau khi chạy). Dùng cho file cấu hình, không dùng cho script thường |

Một số dạng shebang:

| Shebang | Dùng khi |
|---|---|
| `#!/bin/bash` | Script dùng tính năng của bash. Dùng cho mọi bài trong khoá này |
| `#!/bin/sh` | Script tương thích POSIX, chạy được trên máy không có bash (Alpine). Trên Ubuntu, `sh` là `dash`, nhẹ hơn và **không** hỗ trợ một số cú pháp của bash |
| `#!/usr/bin/env bash` | Tìm `bash` theo PATH (hợp khi bash nằm chỗ khác, ví dụ macOS cài qua Homebrew) |
| `#!/usr/bin/env python3` | Script Python |

## In ra màn hình: echo và printf

```bash
echo "a" "b"
echo -n "khong xuong dong"; echo
echo -e "cot1\tcot2\ndong2"
printf "%-10s|%5d|%.2f\n" "tao" 42 3.14159
```

```text
a b
khong xuong dong
cot1	cot2
dong2
tao       |   42|3.14
```

| Lệnh | Ý nghĩa |
|---|---|
| `echo "a" "b"` | In các đối số cách nhau bằng dấu cách, rồi xuống dòng |
| `echo -n` | Không xuống dòng ở cuối |
| `echo -e` | Hiểu các ký tự đặc biệt: `\n` xuống dòng, `\t` Tab |
| `printf "mẫu" giá-trị...` | In theo mẫu, **không** tự xuống dòng (phải có `\n`) |

Mẫu của `printf`:

| Mẫu | In ra |
|---|---|
| `%s` | Chuỗi |
| `%d` | Số nguyên |
| `%.2f` | Số thực, 2 chữ số sau dấu phẩy |
| `%10s` / `%-10s` | Chuỗi chiếm 10 ô, canh phải / canh trái |
| `%5d` | Số nguyên chiếm 5 ô |
| `%%` | Dấu `%` |

`printf` hợp để in bảng thẳng cột, và chạy giống nhau ở mọi shell. `echo -e` thì mỗi shell xử lý một kiểu.

## Nhập dữ liệu: read

Script `hoi.sh`:

```bash
#!/bin/bash
read -p "Tên bạn là gì? " ten
read -p "Bạn bao nhiêu tuổi? " tuoi
echo "Chào $ten, sang năm bạn $((tuoi + 1)) tuổi."
read -s -p "Nhập mật khẩu: " mk
echo
echo "Mật khẩu dài ${#mk} ký tự."
```

Chạy và gõ `An`, `20`, `bimat123`:

```text
Tên bạn là gì? An
Bạn bao nhiêu tuổi? 20
Chào An, sang năm bạn 21 tuổi.
Nhập mật khẩu:
Mật khẩu dài 8 ký tự.
```

| Phần | Ý nghĩa |
|---|---|
| `read ten` | Đọc một dòng từ bàn phím, lưu vào biến `ten` |
| `-p "..."` | In câu hỏi (**p**rompt) trước khi đọc |
| `-s` | Không hiện chữ khi gõ (**s**ilent), dùng cho mật khẩu |
| `-t 10` | Chỉ chờ 10 giây (**t**imeout), quá thì `read` trả mã lỗi |
| `$((tuoi + 1))` | Tính toán số học ([bài sau](/bai/bash-tinh-toan-tham-so)) |
| `${#mk}` | Độ dài chuỗi trong biến `mk` |
| `echo` (trơn) | Xuống dòng, vì `read -s` không in dấu xuống dòng khi bạn bấm Enter |

### Đọc nhiều biến, tách theo ký tự

```bash
echo "Nguyen Van An" | { read ho dem ten; echo "ho=$ho dem=$dem ten=$ten"; }
echo "an:20:hanoi" | { IFS=: read ten tuoi tp; echo "$ten|$tuoi|$tp"; }
```

```text
ho=Nguyen dem=Van ten=An
an|20|hanoi
```

| Phần | Ý nghĩa |
|---|---|
| `read ho dem ten` | Tách dòng theo khoảng trắng, từ 1 vào `ho`, từ 2 vào `dem`, phần còn lại vào biến cuối |
| `IFS=:` | Đổi ký tự phân tách thành `:` (chỉ cho lệnh `read` này). IFS là **I**nternal **F**ield **S**eparator |

### Đọc file từng dòng

Mẫu rất hay dùng:

```bash
printf "an 20\nbinh 25\n" > ds.txt
while read ten tuoi; do
  echo "$ten - $tuoi"
done < ds.txt
```

```text
an - 20
binh - 25
```

`< ds.txt` đưa file vào stdin của cả vòng `while`, mỗi vòng `read` lấy một dòng. Vòng lặp học kỹ ở [bài 37](/bai/bash-vong-lap).

## Mã thoát của script

Script trả về mã thoát của **lệnh cuối cùng** nó chạy, hoặc giá trị ghi trong `exit`:

```bash
#!/bin/bash
if [ ! -f /etc/nginx/nginx.conf ]; then
  echo "Chưa cài nginx" >&2
  exit 1
fi
echo "Đã có nginx"
exit 0
```

| Phần | Ý nghĩa |
|---|---|
| `exit 1` | Kết thúc script ngay, mã thoát 1 (lỗi). `if` học ở [bài 36](/bai/bash-dieu-kien) |
| `exit 0` | Kết thúc thành công |
| `>&2` | In thông báo ra **stderr** thay vì stdout. Thông báo lỗi nên đi đường này |

Kiểm tra bằng `./script.sh; echo $?`, hoặc dùng trong chuỗi: `./kiemtra.sh && ./trienkhai.sh`.

## Thói quen tốt khi viết script

| Thói quen | Vì sao |
|---|---|
| Luôn có shebang | Biết chắc script chạy bằng gì |
| Chú thích đầu file: script làm gì, cách dùng | Ba tháng sau đọc lại vẫn hiểu |
| Bọc biến trong nháy kép: `"$ten"` | Giá trị có dấu cách không làm hỏng lệnh |
| Đặt tên biến chữ thường cho biến của mình | Tránh trùng với biến môi trường viết hoa (`PATH`, `HOME`) |
| In lỗi ra stderr và `exit` khác 0 khi lỗi | cron, CI biết script đã thất bại |
| Thử với `bash -n script.sh` | Kiểm tra cú pháp mà không chạy ([bài 39](/bai/bash-thuc-hanh-va-go-loi)) |

## Thực hành

1. Viết script `thongtin.sh` in ra: tên máy, user, ngày giờ, số tiến trình đang chạy, dung lượng còn trống của `/`. Cho chạy được bằng `./thongtin.sh`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   #!/bin/bash
   # In thông tin nhanh về máy
   echo "Máy: $(hostname)"
   echo "User: $(whoami)"
   echo "Thời gian: $(date '+%d/%m/%Y %H:%M:%S')"
   echo "Số tiến trình: $(ps -e --no-headers | wc -l)"
   echo "Ổ / còn trống: $(df -h / | awk 'NR==2 {print $4}')"
   ```

   Lưu lại, rồi `chmod +x thongtin.sh && ./thongtin.sh`.

   </details>

2. Viết script hỏi tên và năm sinh, in ra "Xin chào TÊN, năm nay bạn N tuổi" (dùng năm hiện tại từ `date +%Y`).

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   #!/bin/bash
   read -p "Tên của bạn: " ten
   read -p "Năm sinh: " namsinh
   namnay=$(date +%Y)
   echo "Xin chào $ten, năm nay bạn $((namnay - namsinh)) tuổi."
   ```

   </details>

3. Dùng `printf` in bảng 3 dòng gồm tên sản phẩm (canh trái, 12 ô) và giá (canh phải, 8 ô, có 2 số thập phân).

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   printf "%-12s %8s\n" "San pham" "Gia"
   printf "%-12s %8.2f\n" "But bi" 5.5 "So tay" 12 "Balo" 250.75
   ```

   `printf` lặp lại mẫu khi có nhiều giá trị hơn số chỗ trong mẫu.

   </details>

4. Đọc file `/etc/passwd` từng dòng (tách theo dấu `:`) và in "user → shell" cho các user có UID ≥ 1000.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   #!/bin/bash
   while IFS=: read user x uid gid mota home shell; do
     if [ "$uid" -ge 1000 ] && [ "$uid" -lt 65534 ]; then
       echo "$user → $shell"
     fi
   done < /etc/passwd
   ```

   </details>

## Tóm tắt

| Việc | Cách viết |
|---|---|
| Dòng đầu script | `#!/bin/bash` |
| Cho chạy được / chạy | `chmod +x s.sh` / `./s.sh` |
| Chú thích | `# ...` |
| In ra | `echo "..."`, `printf "%s\n" "..."` |
| In lỗi | `echo "lỗi" >&2` |
| Hỏi người dùng | `read -p "Câu hỏi: " bien` (`-s` cho mật khẩu) |
| Đọc file từng dòng | `while read dong; do ...; done < file` |
| Kết thúc với mã | `exit 0` / `exit 1` |
