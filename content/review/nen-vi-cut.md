## [Bài 18. Nén và giải nén](/bai/nen-va-luu-tru)

| Lệnh | Làm gì |
|---|---|
| `gzip file` | Nén thành `file.gz`, file gốc mất |
| `gzip -c file > file.gz` | Nén, giữ file gốc |
| `gzip -r thư-mục` | Nén từng file trong thư mục |
| `gunzip file.gz`, `gzip -d file.gz` | Giải nén |
| `tar -czvf goi.tar.gz thư-mục` | Gom cả thư mục và nén |
| `tar -tzvf goi.tar.gz` | Xem trong gói có gì |
| `tar -xzvf goi.tar.gz` | Giải nén ra thư mục hiện tại |
| `tar -xzvf goi.tar.gz -C nơi` | Giải nén vào thư mục khác |
| `tar -rvf goi.tar file` | Thêm file vào gói `.tar` |

Chữ trong tuỳ chọn tar: `c` tạo, `x` giải nén, `t` liệt kê, `z` gzip, `v` in tên file, `f` tên gói (đặt cuối cụm).

## [Bài 19. Trình soạn thảo vi](/bai/trinh-soan-thao-vi)

vi có 2 chế độ: chế độ lệnh (mở ra là ở đây) và chế độ gõ chữ (bấm `i` để vào, `Esc` để ra).

| Việc | Phím |
|---|---|
| Lưu / lưu và thoát / thoát không lưu | `:w` / `:wq` hoặc `:x` / `:q!` |
| Gõ chữ trước / sau con trỏ | `i` / `a` |
| Thêm dòng dưới / trên | `o` / `O` |
| Di chuyển | `h` `j` `k` `l`, `w` `b`, `0` `$`, `gg` `G`, `:20` |
| Xoá ký tự / cả dòng | `x` / `dd` |
| Xoá về đầu dòng / tới cuối dòng | `d^` / `d$` |
| Chép dòng / dán | `yy` / `p` |
| Hoàn tác | `u` |
| Tìm | `/từ`, rồi `n`, `N` |
| Thay trên dòng / cả file | `:s/cũ/mới/g` / `:%s/cũ/mới/g` |
| Hiện / ẩn số dòng | `:set nu` / `:set nonu` |

## [Bài 20. Thực hành vi](/bai/thuc-hanh-vi)

Tự làm lại cho thuộc: thêm dòng trên và dưới, xoá nửa dòng về đầu hoặc tới cuối, tìm một từ, thay trong cả file rồi hoàn tác, bật số dòng, lưu và thoát. Không biết đang ở chế độ nào thì bấm `Esc`.

## [Bài 21. cut](/bai/lenh-cut)

| Lệnh | Làm gì |
|---|---|
| `cut -b 1,3 file` | Lấy byte 1 và 3 của mỗi dòng |
| `cut -c 1-6 file` | Lấy ký tự 1 tới 6 |
| `cut -f 2 file` | Lấy cột 2, các cột ngăn bằng Tab |
| `cut -d : -f 1,7 /etc/passwd` | Lấy cột 1 và 7, ngăn bằng `:` |
| `cut -d ' ' -f 1 file` | Lấy từ đầu tiên |
| `cut --complement -f 2 file` | Lấy mọi cột trừ cột 2 |

Trên Ubuntu, `cut -c` vẫn đếm theo byte nên cắt chữ có dấu sẽ bị hỏng. Dữ liệu có dấu thì cắt theo cột.

## Thử nhanh

Chép cả khối vào terminal để xem các lệnh của chặng chạy thế nào.

```bash
mkdir -p ~/thuchanh/tomtat4/du-an
cd ~/thuchanh/tomtat4
seq 1 1000 > du-an/so.txt
tar -czvf du-an.tar.gz du-an
tar -tzvf du-an.tar.gz
mkdir khoi-phuc
tar -xzvf du-an.tar.gz -C khoi-phuc
ls khoi-phuc/du-an
gzip -c du-an/so.txt > so.txt.gz
ls -lh du-an/so.txt so.txt.gz
cut -d : -f 1,7 /etc/passwd | head -3
printf 'An\tCNTT1\nBinh\tKTPM2\n' | cut -f 2
```

Bạn sẽ thấy:

- Gói `du-an.tar.gz` chứa `du-an/` và `du-an/so.txt`; giải nén vào `khoi-phuc` thấy lại `so.txt`.
- `so.txt.gz` nhỏ hơn khoảng một nửa `so.txt`, và `so.txt` vẫn còn vì dùng `gzip -c`.
- `cut -f 2` in `CNTT1`, `KTPM2`.
- Tập vi: `vi ghichu.txt`, bấm `i`, gõ một dòng, `Esc`, gõ `:wq`, rồi `cat ghichu.txt` để xem đã lưu chưa.
