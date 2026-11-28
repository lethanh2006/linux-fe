## [Bài 13. Chuyển hướng và pipe](/bai/chuyen-huong-va-pipe)

| Ký hiệu | Ý nghĩa | Ví dụ |
|---|---|---|
| `>` | Ghi kết quả vào file, ghi đè | `ls > ds.txt` |
| `>>` | Ghi thêm xuống cuối file | `echo hi >> ds.txt` |
| `<` | Lấy dữ liệu từ file | `sort < so.txt` |
| `\|` | Kết quả lệnh trước thành dữ liệu của lệnh sau | `ls -l \| wc -l` |
| `2>` | Ghi thông báo lỗi vào file | `ls /khongco 2> loi.txt` |
| `> file 2>&1` | Ghi cả kết quả lẫn lỗi | `lệnh > ra.txt 2>&1` |
| `/dev/null` | Thùng rác, ghi vào là mất | `lệnh 2> /dev/null` |

`clear` (hoặc `Ctrl+L`) để xoá màn hình.

## [Bài 14. grep](/bai/lenh-grep)

`grep mẫu file` in các dòng có chứa mẫu.

| Tuỳ chọn | Ý nghĩa |
|---|---|
| `-i` | Không phân biệt hoa thường |
| `-v` | In dòng không khớp |
| `-c` | Đếm số dòng khớp |
| `-n` | Kèm số dòng |
| `-r` | Tìm trong cả thư mục |

Ví dụ: `grep root /etc/passwd`, `grep -i bạn *`, `grep error /var/log/syslog | grep camera`, `ls -l | grep file`.

## [Bài 15. Biểu thức chính quy](/bai/bieu-thuc-chinh-quy)

| Ký hiệu | Ý nghĩa |
|---|---|
| `.` | 1 ký tự bất kỳ |
| `[0-9]`, `[a-z]` / `[^0-9]` | 1 ký tự trong khoảng / ngoài khoảng |
| `*` / `+` / `?` | Lặp 0 lần trở lên / 1 lần trở lên / 0 hoặc 1 lần |
| `{9}`, `{2,}` | Lặp đúng 9 lần / ít nhất 2 lần |
| `^` / `$` | Đầu dòng / cuối dòng |
| `\|` | Hoặc |
| `\.`, `\+` | Đúng dấu `.`, dấu `+` |

`grep -oE 'mẫu' file`: `-E` dùng regex mở rộng, `-o` chỉ in phần khớp.

- Số điện thoại: `grep -oE '\+84[0-9]{9}' file`
- Email: `grep -oE '[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' file`

`grep -E` không hiểu `\d`, phải viết `[0-9]` (hoặc dùng `grep -P`).

## [Bài 16. find](/bai/lenh-find)

`find nơi-tìm điều-kiện`, ví dụ `find . -name "*.txt"`. grep tìm chữ trong file, find tìm chính các file.

| Điều kiện | Ý nghĩa |
|---|---|
| `-name "mẫu"` | Theo tên. Mẫu luôn để trong nháy |
| `-maxdepth 2` | Chỉ đi sâu 2 cấp |
| `-type f` / `-type d` | Chỉ file / chỉ thư mục |
| `-size +10M` / `-size -1k` | Lớn hơn 10 MB / nhỏ hơn 1 KB |
| `-mtime -1` / `-mtime +7` | Sửa trong vòng 1 ngày / cách đây hơn 7 ngày |
| `-user tên` | Của người dùng nào |
| `-exec lệnh {} \;` | Chạy lệnh với từng file tìm được |
| `-printf "%f %s\n"` | In tên và kích thước |

## [Bài 17. whereis và which](/bai/whereis-va-which)

| Lệnh | Làm gì |
|---|---|
| `whereis ls` | File chạy, trang man, mã nguồn của lệnh |
| `whereis -b` / `-m` / `-s` | Chỉ file chạy / chỉ trang man / chỉ mã nguồn |
| `which ls` | File sẽ chạy khi gõ lệnh. Không in gì là máy chưa có lệnh đó |
| `which -a grep` | Mọi bản tìm thấy |
| `type cd` | Biết cả lệnh có sẵn trong bash và alias |

## Thử nhanh

Chép cả khối vào terminal để xem các lệnh của chặng chạy thế nào.

```bash
mkdir -p ~/thuchanh/tomtat3
cd ~/thuchanh/tomtat3
printf 'INFO web ready\nERROR api timeout\ninfo web ok\n' > app.log
grep -n ERROR app.log
grep -ic info app.log
grep -v INFO app.log
cat app.log | wc -l
ls /khongco 2> loi.txt
cat loi.txt
echo "Goi +84912345678 hoac +84 987654321" | grep -oE '\+84\s?[0-9]{9}'
find ~/thuchanh -maxdepth 2 -name "*.log"
which ls
whereis -b grep
```

Bạn sẽ thấy:

- `grep -n ERROR` in `2:ERROR api timeout`; `grep -ic info` in `2` vì không phân biệt hoa thường.
- `ls /khongco 2> loi.txt` không in lỗi ra màn hình; lỗi nằm trong `loi.txt`.
- `grep -oE` lấy ra hai số `+84912345678` và `+84 987654321`; `which ls` in `/usr/bin/ls`.
