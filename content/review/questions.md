Các câu hỏi dưới đây bám **chặng 1–7**. Tự nói câu trả lời trước khi mở đáp án. Mục tiêu là giải thích được **vì sao**, sau đó chọn một lệnh để chứng minh.

<details>
<summary>1. Kernel, shell và bản phân phối khác nhau thế nào?</summary>

Kernel cung cấp cơ chế quản lý tài nguyên và làm việc với phần cứng. Shell nhận và diễn giải lệnh. Bản phân phối như Ubuntu kết hợp kernel với công cụ, phần mềm và cách quản lý hệ thống. Dùng `uname -r` xem kernel, `/etc/os-release` xem bản phân phối.

</details>

<details>
<summary>2. Đường dẫn tương đối khác tuyệt đối thế nào?</summary>

Tuyệt đối bắt đầu từ `/`. Tương đối được tính từ thư mục hiện hành. Dùng pwd trước khi diễn giải `du-an/data`; `cd ..` lên thư mục cha, còn `cd -` quay về thư mục trước đó.

</details>

<details>
<summary>3. Vì sao wildcard của shell khác regex của grep?</summary>

Shell mở rộng mẫu như `*.txt` thành tên trước khi chạy chương trình. Grep diễn giải regex trên nội dung dòng. `*` ở wildcard không mang cùng nghĩa với `*` trong regex. Đặt regex hoặc mẫu truyền cho find trong nháy để đúng công cụ nhận mẫu.

</details>

<details>
<summary>4. Dấu >, >> và pipe khác nhau ra sao?</summary>

`>` ghi stdout và thay nội dung cũ, `>>` thêm cuối file. Pipe nối stdout tới stdin của chương trình tiếp theo. Stderr là luồng riêng trừ khi chuyển hướng rõ ràng. Ví dụ pipeline cut/sort/uniq biến các dòng dịch vụ thành số lượng theo tên.

</details>

<details>
<summary>5. Grep khác find; which khác whereis như thế nào?</summary>

Grep tìm dòng trong nội dung; find duyệt cây thư mục và chọn theo tên, loại, thời gian, kích thước… Which tìm chương trình trong PATH; whereis tìm các vị trí liên quan như binary và trang man theo cách công cụ được cấu hình. Với shell builtin/alias, dùng thêm `type` hoặc `command -v` để hiểu shell sẽ xử lý tên đó thế nào.

</details>

<details>
<summary>6. Vì sao -mtime +7 không khớp file mới sửa cách đây 7,5 ngày?</summary>

Find bỏ phần lẻ khi tính khoảng ngày 24 giờ: 7,5 thành 7, chưa lớn hơn 7. Từ 8 ngày trọn vẹn trở lên mới khớp. Tương tự, -size làm tròn lên theo đơn vị; có thể dùng đơn vị byte c nếu cần một ranh giới chính xác.

</details>

<details>
<summary>7. Quyền 640 là gì? Muốn xoá file cần quyền nào?</summary>

640 là owner đọc/ghi, group đọc, others không có quyền. Với mô hình rwx cơ bản đang ôn, xoá một tên là thay đổi thư mục chứa tên, thường cần w và x trên thư mục cha. Kiểm tra cả đường dẫn, không chỉ nhìn quyền w của bản thân file.

</details>

<details>
<summary>8. Hard link có phải backup? Symlink tương đối tính từ đâu?</summary>

Hard link cùng dữ liệu nên không phải bản sao lưu độc lập chống sửa nhầm. Symlink giữ đường dẫn riêng; đích tương đối được tính từ thư mục chứa symlink. Chứng minh bằng ls -li, readlink và việc thêm một dòng qua hard link rồi đọc lại tên gốc.

</details>

<details>
<summary>9. Làm sao chứng minh bản nén khôi phục được?</summary>

Tạo archive từ dữ liệu demo, dùng tar -t xem danh sách, giải nén vào thư mục khác, rồi dùng cat đọc bản gốc và bản khôi phục để đối chiếu đủ bốn dòng của bài demo. Chỉ có file .tar.gz chưa chứng minh quy trình khôi phục đúng.

</details>

<details>
<summary>10. User, nhóm chính và nhóm phụ liên quan thế nào?</summary>

User có UID, một nhóm chính và có thể nhiều nhóm phụ. Xem bằng id. Dùng usermod -aG để thêm nhóm phụ mà giữ nhóm cũ; -G thiếu -a có thể thay danh sách. Phiên đăng nhập đang mở có thể chưa nhận nhóm mới.

</details>

<details>
<summary>11. Passwd, shadow và group có bao nhiêu trường?</summary>

Passwd có 7, shadow có 9 kể cả trường dự phòng, group có 4. Passwd khai báo home không chứng minh home đã tồn tại; useradd -m thể hiện rõ yêu cầu tạo home. Không chia sẻ nội dung shadow thật trong buổi trình bày.

</details>

<details>
<summary>12. Free khác df và du như thế nào?</summary>

Free xem bộ nhớ; chú ý available bên cạnh used/free. Df xem dung lượng filesystem, du cộng dung lượng file/thư mục. Hai số df/du có thể khác do phạm vi đo, điểm gắn, file đã xoá nhưng còn mở và cách tính.

</details>

<details>
<summary>13. Set-default khác isolate? Vì sao không thử reboot trên máy đang làm việc?</summary>

Set-default đổi target mặc định cho lần khởi động sau; isolate chuyển tập unit ngay và có thể đóng desktop/dịch vụ. Reboot/tắt máy làm mất phiên và ảnh hưởng công việc đang chạy. Muốn thực hành thao tác thay đổi thì tập trên máy riêng, ngồi trước máy, và nhớ cách quay lại: `sudo systemctl isolate graphical.target` hoặc `sudo init 5`; đã `set-default` thì đặt lại như cũ.

</details>

<details>
<summary>14. Card ở trạng thái UP đã có IP, route và DNS đúng chưa?</summary>

Chưa. Trong phạm vi chặng 7, cần đọc riêng trạng thái link, IP/prefix, route/gateway và phân giải tên. Ip address, ip route, getent trả lời các câu khác nhau. Thay IP bằng ip là cấu hình đang chạy; cấu hình lưu lâu dài thuộc Netplan/NetworkManager phù hợp với máy.

</details>

<details>
<summary>15. vi có mấy chế độ? Lưu và thoát thế nào?</summary>

Hai chế độ chính: chế độ lệnh (mở vi là ở đây; di chuyển, xoá, tìm, lưu) và chế độ gõ chữ (vào bằng `i`, `a`, `o`; về lại chế độ lệnh bằng Esc). Lưu và thoát: `:wq` hoặc `:x`; thoát không lưu: `:q!`; chỉ lưu: `:w`. Không biết đang ở chế độ nào thì bấm Esc.

</details>

<details>
<summary>16. Run level 0, 3, 5, 6 là gì? Chuyển bằng lệnh nào?</summary>

0 tắt máy, 3 nhiều người dùng chế độ dòng lệnh (`multi-user.target`), 5 thêm giao diện đồ hoạ (`graphical.target`), 6 khởi động lại. Chuyển ngay bằng `sudo init N` hoặc `sudo systemctl isolate X.target`; xem bằng `runlevel` (in mức trước và mức hiện tại).

</details>

<details>
<summary>17. Đặt IP tạm thời khác đặt IP lâu dài thế nào?</summary>

Tạm thời: `sudo ip addr add 192.168.1.100/24 dev CARD` (thêm địa chỉ) hoặc `sudo ifconfig CARD 192.168.1.100 netmask 255.255.255.0 up` (thay địa chỉ); mất khi khởi động lại. Lâu dài: ghi vào file YAML trong `/etc/netplan/` (quyền 600) rồi `sudo netplan apply`, hoặc `sudo netplan try` để tự quay lại nếu mất kết nối.

</details>

<details>
<summary>18. /etc/hosts khác /etc/resolv.conf thế nào?</summary>

`/etc/hosts` tự gán tên cho IP ngay trên máy, được tra trước DNS; ví dụ thêm `127.0.0.1 titv.vn` thì máy này hiểu titv.vn là chính nó. `/etc/resolv.conf` ghi máy chủ DNS mà máy hỏi (`nameserver`); trên Ubuntu là `127.0.0.53` của systemd-resolved, DNS thật xem bằng `resolvectl dns`.

</details>
