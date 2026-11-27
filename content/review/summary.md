Phạm vi ôn tập là **chặng 1 đến hết chặng 7** trong lộ trình hiện tại: từ bài 5 đến bài 34. Chặng 7 kết thúc ở phần cấu hình mạng và địa chỉ IP.

Mỗi chặng có ba việc cần nắm: **nó giải quyết vấn đề gì, đọc lệnh thế nào, và kiểm tra kết quả ra sao**. Đọc ý chính trước; mở bài gốc khi có chỗ chưa hiểu. Các ví dụ dùng bộ dữ liệu ở [bước chuẩn bị demo](#kich-ban).

<details>
<summary>Chặng 1 · Làm quen với Linux · Bài 5–9</summary>

### Cần hiểu và nói được

- **Kernel** quản lý tài nguyên và cung cấp các cơ chế để chương trình làm việc với phần cứng. **Shell** như Bash đọc lệnh; **ứng dụng** thực hiện công việc. Ubuntu là một bản phân phối gồm kernel và nhiều thành phần khác.
- Một lệnh thường có **tên lệnh + tuỳ chọn + đối số**. Trong `ls -lh du-an`, `ls` là lệnh, `-l`/`-h` là tuỳ chọn, `du-an` là đối số.
- `/` là gốc của cây thư mục; `~` là home; `.` là thư mục hiện tại; `..` là thư mục cha. Đường dẫn tuyệt đối bắt đầu bằng `/`, đường dẫn tương đối tính từ vị trí đang đứng.
- `sudo` chạy lệnh theo quyền được cấp. Mật khẩu gõ vào terminal thường không hiện ký tự. Dấu `$`/`#` là quy ước hiển thị thường gặp, không thay thế việc kiểm tra bằng `id`.

| Lệnh | Dùng khi nào | Điều cần đọc |
|---|---|---|
| `pwd` | Biết đang ở đâu trước khi sửa/xoá file | Đường dẫn hiện hành |
| `ls -la` | Xem cả file ẩn và thông tin dài | Quyền, chủ, nhóm, kích thước, tên |
| `cd "$DEMO_DIR"` | Quay về thư mục demo đã tạo | Sau đó dùng `pwd` để xác nhận |
| `cd -` | Quay về thư mục vừa đứng trước đó | Khác `cd ..` là đi lên thư mục cha |
| `man ls` | Tự tra tuỳ chọn của ls | `/từ-khoá` tìm, `q` thoát |
| `id` | Xem danh tính và nhóm | UID, GID chính, các nhóm |

Tab giúp hoàn thành tên; Ctrl+C ngắt lệnh đang chạy; mũi tên lên gọi lại lệnh cũ. `clear` hoặc Ctrl+L chỉ làm gọn màn hình, không xoá lịch sử hay dữ liệu.

**Câu nói khi demo:** “Em xác nhận vị trí bằng pwd, rồi đọc lệnh theo ba phần để biết chính xác nó sẽ tác động vào đâu.”

Đọc thêm: [cấu trúc Linux](/bai/cau-truc-he-dieu-hanh), [cây thư mục](/bai/cay-thu-muc), [terminal](/bai/terminal-va-cu-phap), [sudo](/bai/sudo-va-root), [pwd và cd](/bai/pwd-va-cd).

</details>

<details>
<summary>Chặng 2 · File và thư mục · Bài 10–12</summary>

### Cần hiểu và nói được

Thư mục tổ chức tên file. `cp` tạo bản sao; `mv` di chuyển hoặc đổi tên; `rm` xoá tên file, không đưa vào thùng rác như thao tác thường gặp trên desktop. Đọc rõ nguồn và đích trước khi gõ.

| Lệnh mẫu | Ý nghĩa |
|---|---|
| `mkdir -p du-an/data` | Tạo cả các thư mục cha còn thiếu |
| `touch ghi-chu.txt` | Tạo file rỗng nếu chưa có; nếu đã có thì cập nhật thời gian |
| `cp nguon.txt ban-sao.txt` | Chép file; đích đã có có thể bị ghi đè |
| `cp -r thu-muc ban-sao` | Chép cây thư mục |
| `mv cu.txt moi.txt` | Đổi tên trong cùng thư mục |
| `rm tam.txt` | Xoá file thử nghiệm có tên đó |
| `rmdir thu-muc-rong` | Chỉ xoá được thư mục rỗng |
| `du -sh du-an` | Tổng dung lượng cây thư mục, đơn vị dễ đọc |

`*` khớp một chuỗi ký tự, có thể rỗng; `?` khớp một ký tự theo cách shell xử lý. Shell mở rộng wildcard **trước khi** chương trình nhận đối số. Ví dụ `ls du-an/data/*.txt` chọn tên có đuôi txt. Wildcard này khác biểu thức chính quy của grep. File bắt đầu bằng dấu chấm thường không được `*` chọn mặc định.

| Muốn xem gì? | Công cụ |
|---|---|
| Toàn bộ file nhỏ | `cat file` |
| Đọc từng trang, tìm trong file | `less file`, `/từ-khoá`, `q` |
| N dòng đầu/cuối | `head -n N file`, `tail -n N file` |
| Theo dõi file log đang được ghi | `tail -f file`, Ctrl+C để dừng |

**Lỗi dễ mắc:** tên có khoảng trắng phải được đặt trong nháy; thiếu `-r` khi chép thư mục; nhầm đích của mv; chạy rm từ sai thư mục. Với dữ liệu demo, dùng `pwd` và `ls` kiểm tra trước và sau thao tác.

Đọc thêm: [quản lý file](/bai/quan-ly-file-thu-muc), [wildcard](/bai/ky-tu-dai-dien), [đọc nội dung](/bai/xem-noi-dung-file).

</details>

<details>
<summary>Chặng 3 · Luồng dữ liệu và tìm kiếm · Bài 13–17</summary>

### Cần hiểu và nói được

Một chương trình thường nhận dữ liệu qua stdin, in kết quả qua stdout và báo lỗi qua stderr. **Pipe** nối stdout của lệnh trước vào stdin của lệnh sau; không tự nối stderr.

| Cú pháp | Tác dụng |
|---|---|
| `> file` | Ghi stdout vào file, thay nội dung cũ |
| `>> file` | Thêm stdout vào cuối file |
| `< file` | Đọc stdin từ file |
| `2> loi.txt` | Ghi stderr vào file |
| `lenh1 \| lenh2` | Nối luồng dữ liệu giữa hai lệnh |
| `2>&1` | Đưa stderr tới nơi stdout đang trỏ ở thời điểm đó |

Trong `grep -n '^ERROR' du-an/data/app.log`, `grep` chọn dòng khớp, `-n` in số dòng, `^ERROR` là mẫu bắt đầu dòng bằng ERROR, đối số cuối là file đầu vào.

```bash
grep -n '^ERROR' du-an/data/app.log
grep -E '^(web|api):' du-an/data/dich-vu.txt
```

| Mẫu/tuỳ chọn | Hiểu thế nào |
|---|---|
| `^` / `$` | Đầu/cuối dòng |
| `.` / `.*` | Một ký tự / chuỗi lặp của ký tự bất kỳ theo regex |
| `[0-9]` | Một chữ số |
| `-E` | Dùng extended regex, ví dụ nhóm và phép hoặc |
| `-i` / `-v` | Không phân biệt hoa thường / chọn dòng không khớp |
| `-F` | Tìm chuỗi cố định, không diễn giải regex |

Đặt regex trong nháy để shell không diễn giải trước. `\d` không phải cách viết chữ số dùng chung cho mọi chế độ grep; với grep -E, dùng `[0-9]`. Khi tìm nguyên văn ký tự như dấu chấm trong tên file, cân nhắc `grep -F`.

**Câu nói khi demo:** “Em lọc dòng lỗi, lấy cột cần thiết rồi nối các lệnh; mỗi lệnh làm một việc nhỏ.”

Đọc thêm: [luồng dữ liệu](/bai/chuyen-huong-va-pipe), [grep](/bai/lenh-grep), [regex](/bai/bieu-thuc-chinh-quy).

### Tìm file và tìm chương trình

`grep` tìm **trong nội dung**; `find` tìm **đối tượng trong cây thư mục**. `which` hỏi chương trình trong PATH; `whereis` tìm một số vị trí liên quan như binary và man page. Đây là những câu hỏi khác nhau.

```bash
find du-an -type f -name '*.txt' | sort
command -v ls
whereis ls
```

| Phần của find | Ý nghĩa |
|---|---|
| `du-an` | Điểm bắt đầu, nên giới hạn đúng phạm vi |
| `-type f` | Chỉ file thường; `-type d` là thư mục |
| `-name '*.txt'` | Mẫu tên, đặt trong nháy để find nhận nguyên mẫu |
| `-size +1M` | Kích thước lớn hơn 1 MiB |
| `-mtime -1` | Sửa nội dung dưới 24 giờ qua |
| `-exec ... {} \;` | Chạy lệnh cho mỗi kết quả; chỉ dùng khi hiểu rõ tác động |

**Điểm dễ bị hỏi:** find làm tròn kích thước lên theo đơn vị; `-size -5M` không khớp mọi file dưới 5 MiB. Muốn nhỏ hơn đúng 5 MiB theo byte, dùng `-size -5242880c`. Với thời gian, find bỏ phần ngày lẻ: `-mtime +7` khớp từ 8 ngày trọn vẹn trở lên, không khớp file 7,5 ngày tuổi. `-ctime` là thay đổi trạng thái inode, không phải thời gian tạo file.

Muốn xoá theo kết quả tìm kiếm, trước hết chạy cùng điều kiện để xem danh sách. Trong buổi demo, chỉ cần tìm và giải thích; thao tác xoá tên tạm đã có ở phần file.

Đọc thêm: [find](/bai/lenh-find), [whereis và which](/bai/whereis-va-which).

</details>

<details>
<summary>Chặng 4 · Nén file, vi và cut · Bài 18–21</summary>

### Cần hiểu và nói được

`tar` gom file/thư mục thành archive; tuỳ chọn `-z` dùng gzip để nén. Gzip một file và đóng gói một cây thư mục là hai ý khác nhau.

| Lệnh | Dùng làm gì |
|---|---|
| `tar -czf backup.tar.gz thu-muc/` | Tạo archive nén gzip |
| `tar -tzf backup.tar.gz` | Xem danh sách trước khi giải nén |
| `tar -xzf backup.tar.gz -C noi-khoi-phuc` | Giải nén vào thư mục đã tạo |
| `gzip file` / `gunzip file.gz` | Nén/giải nén một file; hành vi mặc định có thể thay file nguồn |

`c` là create, `x` extract, `t` list, `z` gzip, `f` chọn tên archive. Với cách viết trên, tên archive đứng sau cụm có `f`. Khi demo, chỉ giải nén gói mình vừa tạo vào một thư mục riêng (`-C thư-mục`), để không ghi đè file đang có.

**Vi cần thuộc một vòng thao tác:** mở file → vào Insert bằng `i` → gõ → Esc về Normal → `:wq` lưu và thoát. `:q!` bỏ các thay đổi chưa lưu. Không gõ lệnh Normal khi còn ở Insert.

| Phím ở Normal | Tác dụng |
|---|---|
| `h j k l` | Trái, xuống, lên, phải |
| `0` / `$` | Đầu/cuối dòng |
| `dd` / `yy` / `p` | Xoá dòng / chép dòng / dán |
| `/từ` rồi Enter | Tìm; `n` tới kết quả tiếp theo |
| `u` | Undo; kiểm tra lại vị trí con trỏ sau đó |

**Phần tập ngắn:** mở `vi ghi-chu.txt`, bấm `i`, gõ một câu, Esc, gõ `:wq`, Enter rồi dùng `cat ghi-chu.txt` xác nhận. Đừng chỉ nói đã lưu mà không kiểm tra file.

Đọc thêm: [tar/gzip](/bai/nen-va-luu-tru), [vi](/bai/trinh-soan-thao-vi), [thực hành vi](/bai/thuc-hanh-vi).

### Cắt cột bằng cut

Với dòng `web:an:80`, dấu `:` tách ba trường. `cut -d ':' -f 1` lấy trường đầu, còn `-f 1,3` lấy trường đầu và thứ ba. `-f 1-3` là dải ba trường liên tiếp.

```bash
cut -d ':' -f 1 du-an/data/dich-vu.txt | sort | uniq -c
```

Pipeline lấy tên dịch vụ, sắp xếp rồi đếm các dòng trùng kề nhau. `uniq -c` không tự đếm mọi dòng giống nhau nằm rải rác nếu chưa sắp xếp cho chúng đứng cạnh nhau.

`-f` chọn trường, `-d` chọn delimiter; mặc định delimiter là Tab. `-b` chọn byte, `-c` theo lý thuyết chọn ký tự. Nhưng `cut` trên Ubuntu (GNU coreutils 9.4) vẫn đếm `-c` theo **byte**: chữ có dấu chiếm 2–3 byte nên bị cắt đôi, ví dụ `echo "Lê Văn Đức" | cut -c 1-2` ra `L` kèm một ký tự lỗi. Dữ liệu có dấu thì cắt theo trường (`-d`, `-f`).

**Lỗi dễ mắc:** `-d ' '` là một dấu cách, không tự gom nhiều dấu cách căn cột. `cut -d ','` cũng không phải bộ đọc CSV đầy đủ vì không xử lý các quy tắc nháy/escape của CSV.

Đọc thêm: [cut](/bai/lenh-cut).

</details>

<details>
<summary>Chặng 5 · Hệ thống · Bài 22–25</summary>

### Cần hiểu và nói được

| Câu hỏi | Lệnh đọc thông tin |
|---|---|
| Ngày giờ hiện tại? | `date '+%F %T %Z'` |
| Giờ UTC? | `date -u '+%F %T UTC'` |
| Kernel/kiến trúc? | `uname -r`, `uname -m` |
| Tên bản phân phối? | `cat /etc/os-release` |
| RAM và bộ nhớ còn có thể cấp? | `free -h`, chú ý `available` |
| Filesystem còn bao nhiêu chỗ? | `df -h .` |
| Thư mục chiếm bao nhiêu? | `du -sh du-an` |
| Tiến trình đang dùng tài nguyên? | `top`, `q` để thoát |

`%m` là tháng, `%M` là phút. `date -d tomorrow` tính thời điểm để **hiển thị**, không đổi đồng hồ. Múi giờ là cách hiển thị thời điểm; giờ UTC và giờ Việt Nam có thể khác trên màn hình nhưng vẫn cùng một thời điểm.

Boot đi khái quát từ firmware → bootloader → kernel/initramfs → init/systemd → các dịch vụ và target. Trên systemd, `systemctl get-default` đọc target mặc định. `multi-user.target` không yêu cầu desktop; `graphical.target` thêm phần đồ hoạ theo cấu hình.

**Ba thao tác phải phân biệt:** get-default chỉ xem, set-default đổi mặc định cho lần boot sau, isolate chuyển tập unit ngay và có thể đóng desktop. Runlevel là cách diễn đạt truyền thống; trên systemd các mức 2/3/4 thường cùng ánh xạ multi-user.target.

| Run level | Ý nghĩa | Lệnh chuyển |
|---|---|---|
| 0 | Tắt máy | `sudo init 0` |
| 1 | Một người dùng, chế độ cứu hộ | `sudo init 1` |
| 3 | Nhiều người dùng, dòng lệnh (`multi-user.target`) | `sudo init 3` |
| 5 | Như 3 cộng giao diện đồ hoạ (`graphical.target`) | `sudo init 5` |
| 6 | Khởi động lại | `sudo init 6` |

`runlevel` in hai số: mức trước và mức hiện tại (`N 5` là từ lúc khởi động chưa đổi, đang ở 5).

**Đặt giờ:** khi đồng bộ tự động (NTP) đang bật, `sudo timedatectl set-time "..."` báo `Automatic time synchronization is enabled`; phải `sudo timedatectl set-ntp false` trước, thử xong `set-ntp true`. Múi giờ viết dạng Vùng/Thành_phố: `sudo timedatectl set-timezone Asia/Ho_Chi_Minh`; viết `+07` bị từ chối.

`shutdown -r +10` lên lịch reboot sau 10 phút; `shutdown -c` huỷ lịch còn chờ. Các lệnh shutdown, reboot, isolate, init hoặc đặt đồng hồ làm thay đổi cả máy: tập trước trên máy riêng, không chạy trên máy đang dùng để demo. Với kịch bản chính, trình bày ý nghĩa và đọc trạng thái là đủ để chứng minh hiểu.

Đọc thêm: [ngày giờ](/bai/ngay-gio-he-thong), [tắt/khởi động lại](/bai/tat-va-khoi-dong-lai), [boot/target](/bai/khoi-dong-he-thong), [thông tin hệ thống](/bai/thong-tin-he-thong).

</details>

<details>
<summary>Chặng 6 · Người dùng, nhóm và phân quyền · Bài 26–32</summary>

### Cần hiểu và nói được

User được nhận diện bằng UID, nhóm bằng GID. Mỗi user có một nhóm chính và có thể thuộc nhiều nhóm phụ. Nhóm sở hữu file là một thuộc tính của file, không phải danh sách mọi người đã từng đọc file.

| Cần xem | Lệnh |
|---|---|
| Danh tính và nhóm hiện tại | `id` |
| Dòng tài khoản | `getent passwd "$(whoami)"` |
| Nhóm chính theo tên | `id -gn` |
| Mọi nhóm theo tên | `id -nG` |
| Định nghĩa một nhóm | `getent group TEN_NHOM` |

`/etc/passwd` có 7 trường: tên, trường mật khẩu, UID, GID chính, mô tả, home, shell. `/etc/shadow` có 9 trường về xác thực và tuổi mật khẩu, kể cả trường dự phòng. Không đưa hash mật khẩu thật lên màn hình chia sẻ để “chứng minh có file”. `/etc/group` có 4 trường; danh sách cuối không nhất thiết liệt kê lại người dùng nhóm đó làm nhóm chính.

**Cần thuộc cú pháp quản trị**, tập trước trên máy riêng với tài khoản, nhóm tạo mới trong bài (không đụng tài khoản đang dùng):

| Lệnh mẫu | Ý nghĩa và điểm cần nhớ |
|---|---|
| `sudo useradd -m -s /bin/bash demo_user` | Tạo home rõ ràng và chọn shell |
| `sudo passwd demo_user` | Đặt mật khẩu tương tác; không đặt mật khẩu chữ gốc vào `useradd -p` |
| `sudo groupadd demo_group` | Tạo nhóm |
| `sudo usermod -aG demo_group demo_user` | Thêm nhóm phụ, giữ các nhóm phụ cũ |
| `sudo chage -l demo_user` | Đọc chính sách tuổi mật khẩu |
| `sudo chage -m 5 -M 90 -W 14 -I 10 -E 2030-04-30 demo_user` | `-m` tối thiểu, `-M` tối đa số ngày giữa hai lần đổi mật khẩu, `-W` báo trước, `-I` (chữ i hoa, video đọc nhầm là `-l`) khoá sau khi hết hạn bao nhiêu ngày, `-E` ngày tài khoản hết hiệu lực |
| `sudo usermod -L demo_user` / `-U` | Khoá / mở khoá mật khẩu: thêm / bỏ dấu `!` trước mật khẩu mã hoá trong `/etc/shadow` |
| `sudo userdel -r demo_user` | Xoá user thử nghiệm và home/mail spool; không tự quét mọi file khắp máy |
| `sudo groupdel demo_group` | Xoá định nghĩa nhóm; cần xử lý nếu đang là nhóm chính |

`-G` thiếu `-a` có thể thay danh sách nhóm phụ. Nhóm mới có thể cần phiên đăng nhập mới để có hiệu lực. Khoá trường mật khẩu không nhất thiết chặn SSH key hay đóng các phiên đang mở.

Đọc thêm: [user](/bai/quan-tri-nguoi-dung), [lệnh user](/bai/lenh-quan-ly-nguoi-dung), [nhóm](/bai/quan-tri-nhom), [lệnh nhóm](/bai/lenh-quan-tri-nhom).

### Quyền rwx và liên kết

Chuỗi `-rw-r-----` gồm loại file `-`, rồi ba cụm owner/group/others. `r=4`, `w=2`, `x=1`; vì vậy chuỗi trên tương ứng 640.

| Quyền | File | Thư mục |
|---|---|---|
| r | Đọc nội dung | Liệt kê tên |
| w | Sửa nội dung | Đổi các tên bên trong; thường cần thêm x |
| x | Thực thi trực tiếp nếu các điều kiện khác phù hợp | Tra cứu/đi xuyên, cd vào |

Với mô hình rwx cơ bản đang ôn, xoá tên file là thay đổi thư mục cha; quyền ghi của riêng file không quyết định toàn bộ. Kiểm tra cả đường dẫn khi gặp lỗi quyền. Không dùng 777 cho mọi thứ để hết lỗi.

| Lệnh | Ý nghĩa |
|---|---|
| `chmod 640 file` | Đặt quyền cơ bản rõ ràng |
| `chmod u+x file` | Thêm execute cho owner |
| `chmod g+w file` | Chỉ thêm write cho group, không tự thêm read |
| `chown user:group file` | Đổi chủ và nhóm, thường cần quyền quản trị |
| `chgrp group file` | Đổi nhóm sở hữu |
| `stat -c '%a %A %n' file` | Kiểm tra mode sau khi đổi |

**Hard link:** nhiều tên cùng inode trên cùng filesystem. Sửa nội dung qua một tên thì tên kia thấy cùng dữ liệu; không phải bản sao lưu độc lập. Xoá một tên chưa làm dữ liệu mất nếu vẫn còn tham chiếu phù hợp.

**Symlink:** inode riêng chứa đường dẫn. Dùng được cho thư mục và qua filesystem khác. Đích tương đối tính từ thư mục chứa symlink; xoá/di chuyển đích có thể làm link bị treo. Xem bằng `ls -li` và `readlink`.

Đọc thêm: [quyền](/bai/phan-quyen-file), [chmod/chown/chgrp](/bai/lenh-phan-quyen), [hard link/symlink](/bai/hard-link-soft-link).

</details>

<details>
<summary>Chặng 7 · Mạng · Bài 33–34</summary>

### Cần hiểu và nói được

| Thành phần | Nó trả lời gì? | Lệnh quan sát |
|---|---|---|
| Link/giao diện | Card nào, trạng thái nào? | `ip -br link` |
| Address | Đang gắn IP/prefix nào? | `ip -br address` |
| Route | Đi tới mạng khác qua đâu? | `ip route` |
| Phân giải tên | Tên được tra ra địa chỉ nào? | `getent hosts localhost` |

UP không bảo đảm đã có IP, route hay DNS đúng. Các thông tin này cần được đọc riêng; một kết quả không thay thế việc kiểm tra những mục còn lại. Xác định tên card thật của máy trước khi giải thích cấu hình.

`/etc/hosts` là ánh xạ cục bộ; DNS là cơ chế phân giải tên theo cấu hình hệ thống. `/etc/resolv.conf` có thể do dịch vụ quản lý; `127.0.0.53` thường là stub cục bộ của systemd-resolved. Dùng `resolvectl status` trên máy có dịch vụ đó để xem DNS theo giao diện.

`ip address add IP/PREFIX dev CARD` **thêm** một địa chỉ vào cấu hình đang chạy (giữ địa chỉ cũ); `ifconfig CARD IP netmask ...` thì **thay** địa chỉ cũ. Cả hai đều mất khi khởi động lại. Netplan/NetworkManager quản lý cấu hình lưu lâu dài. Với Netplan: xác định card và cấu hình hiện có → sao lưu → sửa YAML đúng file trong `/etc/netplan/` → `sudo chmod 600` file đó (không thì `netplan apply` cảnh báo `Permissions ... are too open`) → `sudo netplan generate` → thử bằng `sudo netplan try` → kiểm tra IP/route/kết nối, và kiểm tra lại sau khi khởi động lại. Cần ngồi trước máy (hoặc có console) để phục hồi; không xem rollback là lời bảo đảm cho mọi trường hợp.

| YAML netplan | Ý nghĩa |
|---|---|
| `addresses: [192.168.1.100/24]` | IP tĩnh và prefix |
| `routes:` → `- to: default` / `via: 192.168.1.1` | Gateway. Cách viết cũ `gateway4:` nay bị báo deprecated |
| `nameservers: addresses: [8.8.8.8]` | Máy chủ DNS |
| Thụt lề | Chỉ dùng dấu cách, không dùng Tab |

Video có `ifconfig`, `route -n`; trên Ubuntu mới nên biết thêm `ip`. Trong demo chính, dùng các lệnh đọc để giải thích cấu hình, tránh đổi IP của card đang phục vụ kết nối.

Đọc thêm: [mạng](/bai/cau-hinh-mang), [địa chỉ IP](/bai/cau-hinh-dia-chi-ip).

</details>
