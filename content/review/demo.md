### Mục tiêu và nhịp trình bày

**Phạm vi: chặng 1–7, bài 5–34.** Chặng cuối là Mạng; kịch bản dùng các thao tác thuộc phạm vi này cùng bước chuẩn bị dữ liệu và kiểm tra khôi phục.

Bạn sẽ tạo một thư mục dự án nhỏ, thao tác file, lọc log, tìm dữ liệu, phân quyền, tạo link, sao lưu/khôi phục và đọc cấu hình máy. **Chạy các bước trong cùng một terminal, theo thứ tự.** Mỗi lần tập lại, chạy bước 0 để có bộ dữ liệu mới.

Gợi ý 15–20 phút: chuẩn bị 1 phút → file 2 phút → lọc/tìm 3 phút → quyền/link 3 phút → sao lưu 2 phút → hệ thống/mạng 2 phút → giải thích và trả lời câu hỏi 2–7 phút. Thời lượng tuỳ tốc độ nói và gõ.

### Bước 0 · Chuẩn bị dữ liệu

Chạy bằng tài khoản thường. Mọi file của phần demo chính nằm trong một thư mục mới dưới home của bạn.

```bash
DEMO_DIR=$(mktemp -d "$HOME/hoc-linux-demo.XXXXXX") && \
cd "$DEMO_DIR" && \
mkdir -p du-an/data du-an/backup && \
printf 'web:an:80\napi:binh:443\nweb:chi:80\n' > du-an/data/dich-vu.txt && \
printf 'INFO web ready\nERROR api timeout\nINFO web ready\n' > du-an/data/app.log && \
pwd
```

**Giải thích:** mktemp -d tạo thư mục riêng với hậu tố ngẫu nhiên; `$(...)` lấy đường dẫn kết quả gán vào DEMO_DIR. `&&` chỉ chạy bước kế khi bước trước thành công; dấu `\` nối dòng. Vì vậy lỗi tạo hoặc vào thư mục sẽ dừng cả phần ghi dữ liệu. Nháy kép giữ đường dẫn thành một đối số. `mkdir -p` tạo thư mục cha còn thiếu. `printf` tạo dữ liệu với `\n` là xuống dòng; `>` ghi nội dung file.

`mktemp` là công cụ phụ để tạo chỗ tập riêng cho mỗi lượt demo, được giải thích ngay ở bước này. Phần kiến thức ôn theo khoá học bắt đầu từ bước 1.

**Cần thấy:** pwd kết thúc bằng `hoc-linux-demo.` cùng hậu tố ngẫu nhiên. Nếu một lệnh chuẩn bị lỗi, dừng kiểm tra trước khi sang bước tiếp theo.

**Nói:** “Em chuẩn bị dữ liệu mẫu trong thư mục riêng, để kết quả có thể lặp lại và dễ kiểm chứng.”

### Bước 1 · Biết đang làm việc ở đâu

```bash
whoami
pwd
uname -r
head -n 3 /etc/os-release
ls -lh du-an/data
```

**Giải thích:** whoami cho biết user hiệu lực; uname -r đọc phiên bản kernel, còn os-release cho biết bản phân phối. ls -l hiện chi tiết, -h dùng đơn vị dễ đọc.

**Cần thấy:** hai file dữ liệu `app.log`, `dich-vu.txt`. Tên user, đường dẫn và phiên bản hệ điều hành tuỳ máy, không cần giống ảnh minh hoạ của người khác.

**Nói:** “Kernel và bản phân phối là hai thông tin khác nhau. Trước khi thao tác em luôn xác nhận user và thư mục.”

### Bước 2 · Chép, đổi tên, tạo và xoá file tạm

```bash
cp du-an/data/dich-vu.txt du-an/backup/ban-sao.txt
mv du-an/backup/ban-sao.txt du-an/backup/danh-sach.txt
touch du-an/backup/tam.txt
ls du-an/backup
rm du-an/backup/tam.txt
ls du-an/backup
```

**Cần thấy:** lần ls đầu có `danh-sach.txt` và `tam.txt`; lần sau chỉ còn `danh-sach.txt`. File gốc trong data vẫn còn.

**Nói:** “Cp tạo bản sao, mv đổi tên bản sao, touch tạo file trống, rm xoá đúng tên tạm. Em kiểm tra lại sau thao tác.”

### Bước 3 · Đọc, lọc và đếm dữ liệu

```bash
cat du-an/data/dich-vu.txt
grep -n '^ERROR' du-an/data/app.log
cut -d ':' -f 1 du-an/data/dich-vu.txt | sort | uniq -c
```

Kết quả grep:

```text
2:ERROR api timeout
```

Kết quả pipeline có một dòng đếm `api` là 1 và một dòng đếm `web` là 2; số khoảng trắng căn cột có thể khác:

```text
      1 api
      2 web
```

**Giải thích:** `^` neo đầu dòng, -n in số dòng. Cut dùng `:` tách trường và lấy trường 1; sort đưa các giá trị giống nhau về cạnh nhau; uniq -c đếm từng nhóm dòng kề nhau. Pipe truyền stdout, không phải chuỗi lệnh chạy độc lập cho có thứ tự.

**Nói:** “Em biến dữ liệu thô thành thống kê bằng cách nối các công cụ nhỏ, rồi đối chiếu với ba dòng dữ liệu gốc.”

### Bước 4 · Tìm theo tên, không nhầm với tìm nội dung

```bash
find du-an -type f -name '*.txt' | sort
```

```text
du-an/backup/danh-sach.txt
du-an/data/dich-vu.txt
```

**Giải thích:** du-an là phạm vi tìm, -type f chỉ file thường, -name nhận mẫu tên đã đặt trong nháy. Grep tìm bên trong file; find duyệt các đối tượng trong cây thư mục.

**Nếu bị hỏi:** `-mtime +7` dùng ngày đã làm tròn xuống nên cần từ 8 ngày trọn vẹn; `-size` cũng có quy tắc làm tròn theo đơn vị. Không thử ghép -delete vào một lệnh chưa kiểm tra danh sách.

### Bước 5 · Đọc quyền và chứng minh hard link/symlink

```bash
chmod 640 du-an/data/dich-vu.txt
stat -c '%a %A' du-an/data/dich-vu.txt
ln du-an/data/dich-vu.txt cung-du-lieu.txt
ln -s du-an/data/dich-vu.txt loi-tat.txt
ls -li du-an/data/dich-vu.txt cung-du-lieu.txt loi-tat.txt
readlink loi-tat.txt
printf 'worker:demo:9000\n' >> cung-du-lieu.txt
tail -n 1 du-an/data/dich-vu.txt
```

Kết quả stat và tail lần lượt:

```text
640 -rw-r-----
worker:demo:9000
```

**Giải thích:** owner có rw-, group có r--, others không có quyền. Hai hard link có cùng inode trên cùng filesystem; số inode cụ thể không cố định. Symlink có inode riêng và lưu chuỗi đường dẫn `du-an/data/dich-vu.txt`.

**Nói:** “Em ghi qua tên hard link và đọc lại tên gốc để chứng minh chúng dùng chung dữ liệu. Đây không phải hai bản sao độc lập. Symlink thì giữ một đường dẫn tham chiếu.”

### Bước 6 · Tạo bản nén và khôi phục có kiểm tra

```bash
tar -czf du-an/backup/du-lieu.tar.gz du-an/data
tar -tzf du-an/backup/du-lieu.tar.gz
mkdir khoi-phuc
tar -xzf du-an/backup/du-lieu.tar.gz -C khoi-phuc
printf 'Ban goc:\n'
cat du-an/data/dich-vu.txt
printf 'Ban khoi phuc:\n'
cat khoi-phuc/du-an/data/dich-vu.txt
```

Hai phần cần hiện cùng bốn dòng dữ liệu:

```text
Ban goc:
web:an:80
api:binh:443
web:chi:80
worker:demo:9000
Ban khoi phuc:
web:an:80
api:binh:443
web:chi:80
worker:demo:9000
```

**Giải thích:** c tạo, z dùng gzip, f chọn archive, t xem danh sách, x giải nén. Chỉ `du-an/data` được đóng gói, nên archive trong backup không tự được đưa vào chính nó. `-C khoi-phuc` chỉ đích giải nén đã tạo; đường dẫn bên trong archive vẫn là `du-an/data`, nên file khôi phục nằm ở `khoi-phuc/du-an/data/dich-vu.txt`. Dùng cat để đọc cả hai file và đối chiếu từng dòng, gồm dòng worker vừa thêm qua hard link.

**Nói:** “Em liệt kê nội dung archive, khôi phục vào thư mục khác rồi đọc lại file. Hai phần đều có đủ bốn dòng, kể cả dòng worker vừa thêm.”

### Bước 7 · Đọc tài nguyên và cấu hình mạng

```bash
free -h
df -h .
ip -br address
ip route
getent hosts localhost
```

**Cần giải thích:** free xem RAM, available hữu ích khi đánh giá bộ nhớ có thể cấp thêm. Df xem filesystem chứa thư mục hiện tại (`.`), không phải tổng dung lượng mọi file trong du-an (việc đó là của `du -sh du-an`). Ip address xem địa chỉ; ip route xem đường đi; getent tra tên theo cấu hình phân giải của máy.

Tên card, RAM, dung lượng và route phụ thuộc môi trường. Máy không có default route vẫn có thể đọc và giải thích trạng thái đó; không cần đổi mạng để tạo ra một kết quả giống mẫu.

**Nói:** “Em tách riêng trạng thái card, IP, route và phân giải tên. Một thông tin đúng chưa đủ chứng minh mọi tầng mạng đều hoạt động.”

### Bước 8 · Kết thúc và phần hỏi thêm

Tóm tắt theo trình tự: **xác định môi trường → tổ chức file → xử lý dữ liệu → kiểm tra quyền/link → sao lưu và xác minh → đọc hệ thống/mạng**. Giữ lại thư mục demo để người xem kiểm tra; `pwd` cho biết vị trí của nó.

Nếu cần minh hoạ vi: tại thư mục demo, mở `vi ghi-chu.txt`, bấm i, gõ một câu, Esc, `:wq`, Enter, rồi `cat ghi-chu.txt`. Phần này là tương tác bàn phím, không phải một khối lệnh dán hàng loạt.

Nếu cần trình bày user/nhóm, trước hết dùng `id`, `id -gn`, `getent passwd "$(whoami)"`. Các thao tác tạo/xoá user cần quyền quản trị và chỉ nên tập trước trên máy riêng, với tài khoản tạo mới; xem chặng 6 ở phần tóm tắt và các bài 26–29. Không cần reboot, đổi target hay đổi IP của card đang dùng để hoàn thành kịch bản chính.

### Khi gặp lỗi giữa buổi demo

| Tình huống | Cách xử lý và lời giải thích |
|---|---|
| No such file or directory | Chạy pwd và ls; quay lại `cd "$DEMO_DIR"`; kiểm tra đã chạy bước chuẩn bị |
| Link/File exists khi tập lại một bước | Xem đối tượng đã có. Muốn chạy lại toàn bộ, bắt đầu bước 0 để tạo một thư mục mới |
| Permission denied | Xem `id`, `ls -l`, `ls -ld` thư mục cha. Không thêm sudo hoặc 777 theo phản xạ |
| Không thoát được vi | Bấm Esc, rồi `:q!` Enter nếu chấp nhận bỏ phần chưa lưu; `:wq` nếu muốn lưu |
| Không có ip/tar | Chuẩn bị công cụ trước buổi trình bày; đó là phần mềm trên máy, không phải lỗi của dữ liệu mẫu |
| Quên lệnh | Nói rõ mục tiêu, mở trợ giúp hoặc mục tóm tắt; giải thích cách tra cũng là một kỹ năng |

Trước buổi demo, chạy trọn kịch bản một lần trên đúng máy sẽ dùng. Không đợi tới lúc trình bày mới kiểm tra công cụ hoặc quyền truy cập.
