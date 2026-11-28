## [Bài 10. Quản lý file và thư mục](/bai/quan-ly-file-thu-muc)

| Lệnh | Làm gì |
|---|---|
| `ls -la` | Liệt kê dạng dài, cả file ẩn |
| `ls -lh` / `-lt` / `-lS` / `-R` | Dung lượng dễ đọc / theo thời gian / theo kích thước / cả thư mục con |
| `mkdir a b` | Tạo thư mục |
| `mkdir -p a/b/c` | Tạo luôn thư mục cha |
| `tree -L 2` | Vẽ cây 2 cấp (cài bằng `sudo apt install tree`) |
| `du -sh thư-mục` | Dung lượng thư mục |
| `rmdir thư-mục` | Xoá thư mục rỗng |
| `echo "chữ" > file` / `>> file` | Ghi đè / ghi thêm vào file |
| `touch file` | Tạo file rỗng |
| `cat file` | Xem nội dung |
| `cp a b` / `cp -r thư-mục đích` | Chép file / chép thư mục |
| `mv a b` | Di chuyển hoặc đổi tên. `-i` hỏi trước khi ghi đè |
| `rm file` / `rm -r thư-mục` | Xoá file / xoá thư mục. `-i` hỏi, `-f` không hỏi |

`rm` không có thùng rác, xoá là mất.

## [Bài 11. Ký tự đại diện](/bai/ky-tu-dai-dien)

| Mẫu | Khớp với | Ví dụ |
|---|---|---|
| `*` | Chuỗi bất kỳ, kể cả rỗng | `cp *.txt backup/` |
| `?` | Đúng 1 ký tự | `file?.txt` khớp `file1.txt`, không khớp `file12.txt` |
| `[abc]`, `[0-9]` | 1 ký tự trong danh sách | `data_[a-c].csv` |
| `*.doc*` | Cả `.doc` và `.docx` | `mv *.doc* backup/` |

Shell bung mẫu thành danh sách tên rồi mới chạy lệnh. Trước khi `rm` theo mẫu, chạy `ls` với cùng mẫu để xem trước. `*` không khớp file ẩn.

## [Bài 12. Xem nội dung file](/bai/xem-noi-dung-file)

| Lệnh | Làm gì |
|---|---|
| `cat file` | In cả file |
| `more file` | Xem từng trang, chỉ đi tới |
| `less file` | Xem từng trang, đi lùi được. `/từ` để tìm, `q` để thoát |
| `head -n 5 file` | 5 dòng đầu (mặc định 10) |
| `tail -n 5 file` | 5 dòng cuối (mặc định 10) |
| `tail -f file` | Theo dõi dòng mới ghi vào |
| `wc -l file` | Đếm số dòng |

## Thử nhanh

Chép cả khối vào terminal để xem các lệnh của chặng chạy thế nào.

```bash
mkdir -p ~/thuchanh/tomtat2/documents ~/thuchanh/tomtat2/backup
cd ~/thuchanh/tomtat2
touch documents/file1.txt documents/file2.txt documents/file12.txt documents/baocao.doc documents/baocao.docx
ls documents/file?.txt
cp documents/*.txt backup/
mv documents/*.doc* backup/
tree
echo "dong 1" > ghichu.txt
echo "dong 2" >> ghichu.txt
cat ghichu.txt
tail -1 ghichu.txt
du -sh .
rm -r backup
ls
```

Bạn sẽ thấy:

- `ls documents/file?.txt` chỉ ra `file1.txt` và `file2.txt`, không có `file12.txt` vì `?` là đúng 1 ký tự.
- `tree` cho thấy `backup` có 3 file `.txt` (bản chép) và 2 file `.doc`, `.docx` (đã chuyển sang).
- `cat ghichu.txt` có 2 dòng: `>` tạo file, `>>` thêm dòng. Cuối cùng chỉ còn `documents` và `ghichu.txt`.
