Tự nói câu trả lời trước khi mở đáp án. Mục tiêu là giải thích được **vì sao**, sau đó chọn một lệnh để chứng minh.

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

640 là owner đọc/ghi, group đọc, others không có quyền. Xoá một tên là thay đổi thư mục chứa tên, thường cần w và x trên thư mục cha; sticky bit và cơ chế bổ sung có thể hạn chế thêm. Không chỉ nhìn quyền w của bản thân file.

</details>

<details>
<summary>8. Hard link có phải backup? Symlink tương đối tính từ đâu?</summary>

Hard link cùng dữ liệu nên không phải bản sao lưu độc lập chống sửa nhầm. Symlink giữ đường dẫn riêng; đích tương đối được tính từ thư mục chứa symlink. Chứng minh bằng ls -li, readlink và việc thêm một dòng qua hard link rồi đọc lại tên gốc.

</details>

<details>
<summary>9. Làm sao chứng minh bản nén khôi phục được?</summary>

Tạo archive từ dữ liệu lab, dùng tar -t xem danh sách, giải nén vào thư mục khác, rồi so sánh file bằng cmp hoặc diff. Chỉ có file .tar.gz chưa chứng minh quy trình khôi phục đúng.

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

Set-default đổi target mặc định cho lần khởi động sau; isolate chuyển tập unit ngay và có thể đóng desktop/dịch vụ. Reboot/tắt máy làm mất phiên và ảnh hưởng công việc đang chạy. Phần này cần VM lab có console nếu muốn thực hành thao tác thay đổi.

</details>

<details>
<summary>14. Có IP rồi vì sao vẫn chưa mở được website?</summary>

Còn phải xét trạng thái link, prefix/route/gateway, phân giải tên, cổng, dịch vụ và tường lửa. Ip address, ip route, getent trả lời các câu khác nhau. Thay IP bằng ip là cấu hình đang chạy; cấu hình lưu lâu dài thuộc Netplan/NetworkManager phù hợp với máy.

</details>
