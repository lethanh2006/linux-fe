# Bàn giao rà soát mục Ôn tập & demo

## Mục tiêu

Người học cần ôn nhanh những gì đã học trước buổi demo thứ Ba. Người dùng đã chốt phạm vi đến hết **chặng 7**. Theo curriculum hiện tại, đó là chặng 1–7, bài 5–34; chặng cuối là Mạng. Mục `/on-tap` dùng kịch bản gợi ý 15–20 phút trong phạm vi này.

## Nội dung và các file chính

- `content/review/summary.md`: 7 chặng kiến thức, liên kết tới đủ 30 bài chính, cú pháp, lỗi hay gặp và câu giải thích.
- `content/review/demo.md`: một bộ dữ liệu xuyên suốt; thao tác file, lọc log, find, quyền, link, tar/khôi phục, hệ thống/mạng; mỗi bước có lời nói gợi ý và dấu hiệu cần thấy.
- `content/review/questions.md`: 18 câu hỏi vấn đáp có đáp án ẩn.
- `src/app/on-tap/page.tsx`: trang server; `src/lib/review.ts` đọc các tài liệu.
- `src/components/demo-checklist.tsx`: 8 mục tự kiểm tra, lưu localStorage phiên bản riêng; hỗ trợ reset, dữ liệu lưu lỗi và tương tác trong phiên khi lưu trữ bị chặn.
- Mục điều hướng và thẻ trang chủ dẫn tới `/on-tap`.
- `scripts/check-content.mjs` kiểm tra cả bài học và tài liệu ôn tập.

## Bằng chứng kiểm tra

- Chạy 8 khối bash trong kịch bản theo thứ tự, bằng user thường trên Ubuntu 24.04 trong lab dùng một lần. Kết quả log, thống kê dịch vụ, mode 640, inode chung, symlink và hai phần dữ liệu gốc/khôi phục đều có cùng bốn dòng.
- Reviewer tìm được lỗi chuẩn bị dữ liệu tiếp tục ghi khi mktemp/cd thất bại. Đã chuyển toàn bộ setup sang chuỗi &&; 3 ca kiểm tra trong `scripts/review-demo.test.mjs` mô phỏng lỗi mktemp, cd, mkdir và xác nhận dữ liệu cũ còn nguyên. Đã thấy các ca thất bại trước sửa và qua sau sửa.
- `pnpm check`, `pnpm lint`, `pnpm test`: qua; tổng 9 tests.
- `pnpm build`: qua, có route tĩnh `/on-tap`; production trace chứa đủ 3 file Markdown.
- Trình duyệt: 7 chặng tóm tắt, 14 đáp án ẩn, bàn phím Enter/Space, nút chép lệnh, checklist/reset/refresh, JSON lỗi, lưu trữ bị chặn trên production server, màn hình 320px khi mở đủ 7 chặng, sáng/tối.

## Trọng tâm cho Claude rà tiếp

1. Đọc lời giải thích theo góc nhìn người mới; mỗi lệnh có đủ ngữ cảnh để tự trình bày.
2. Đối chiếu kịch bản với đúng phạm vi đã học và thời lượng thực tế của buổi demo.
3. Giữ bộ dữ liệu mẫu nhất quán qua các bước, nhất là dòng worker được thêm trước khi nén.
4. Giữ điều kiện dừng của toàn bộ khối chuẩn bị; không làm mất bảo vệ đã được kiểm tra.
5. Phân biệt phần demo tài khoản thường với ví dụ quản trị cần VM; kiểm tra liên kết bài gốc khi đổi slug.

Các kiểm tra lỗi setup cần Bash; tests Node dùng phiên bản 22.6 trở lên. Để xác nhận lại quy trình: `pnpm check`, `pnpm lint`, `pnpm test`, `pnpm build`, rồi chạy kịch bản theo thứ tự trên máy lab.

## Claude đã rà (27/11, 23:20)

**Đã kiểm chứng:** chạy trọn các khối bash của `demo.md` theo thứ tự, bằng user thường trên Ubuntu 24.04. Mọi kết quả "Cần thấy" đều khớp, gồm `2:ERROR api timeout`, đếm `1 api` / `2 web`, `640 -rw-r-----`, cùng inode, `worker:demo:9000`, `Khoi phuc khop`.

**Cần sửa.** Sau khi Codex commit phần giới hạn chặng 7, Claude sẽ tự sửa từng chỗ nhỏ.

1. **Bỏ chữ "VM lab", "lab".** Người dùng đã yêu cầu bỏ hết chữ Docker/VPS/VM. Các chỗ còn chữ này:
   - `summary.md` chặng 4: "thư mục lab riêng"
   - `summary.md` chặng 5: "cần VM lab có console"
   - `summary.md` chặng 6: "trong VM lab"
   - `summary.md` chặng 7: "sau reboot trong VM"
   - `demo.md` bước 8: "cần VM lab"
   - `questions.md` câu 9 và câu 13

   Viết lại thành "thử trên máy riêng trước, không làm trên máy đang demo".
2. **Sửa tham chiếu cũ.** `demo.md` bước 8 ghi "xem nhóm 8 ở phần tóm tắt"; đúng ra là "chặng 6".
3. **Nói rõ hơn về cut** (chặng 4). GNU cut 9.4 trên Ubuntu đếm `-c` theo byte, nên `echo "Lê Văn Đức" | cut -c 1-2` ra `L` cùng một ký tự lỗi. Bài 21 có ví dụ chạy thật.
4. **Chỉnh và bổ sung chặng 7:**
   - `ip address add` **thêm** địa chỉ, không thay địa chỉ cũ; `ifconfig card IP` thì thay.
   - File netplan phải `chmod 600`, nếu không `netplan apply` cảnh báo "Permissions ... too open".
   - Gateway viết bằng `routes: - to: default via:`. Cách viết `gateway4` đã cũ và bị cảnh báo deprecated.
5. **Bổ sung chặng 5.** Video 24 nhấn mạnh và hay hỏi bảng run level (0 tắt, 1 cứu hộ, 3 dòng lệnh, 5 đồ hoạ, 6 khởi động lại) cùng `sudo init N`. Thêm hai ý:
   - Phải `timedatectl set-ntp false` rồi mới `set-time` được.
   - Múi giờ viết dạng `Asia/Ho_Chi_Minh`; viết `+07` sẽ bị từ chối.
6. **Bổ sung chặng 6.** Thêm các tuỳ chọn của `chage`: `-m`, `-M`, `-W`, `-I`, `-E`. Trong video, `-I` bị đọc nhầm thành `-l`.
7. **Diễn đạt lại `demo.md` bước 7.** "Df xem filesystem chứa dấu chấm" đổi thành "filesystem chứa thư mục hiện tại (`.`)".
8. **Thêm 4 câu vấn đáp** bám video:
   - Hai chế độ của vi; cách lưu và thoát.
   - Run level 0, 3, 5, 6 và `init`.
   - IP tạm thời và IP lâu dài: `ip addr` khác netplan thế nào.
   - `/etc/hosts` khác `/etc/resolv.conf` thế nào.

## Phối hợp Claude khi chốt chặng 7

Claude đã đối chiếu curriculum và các bài gốc: chặng 7 là Mạng (33–34), chặng 8 bắt đầu phần mở rộng. Đã sửa tham chiếu nhóm 8 thành chặng 6; tập trung câu hỏi về quyền rwx và cấu hình link/IP/route/DNS. Các phần sticky bit, ACL và tường lửa thuộc mở rộng đã được rút khỏi nội dung ôn. Giữ mktemp như công cụ chuẩn bị được giải thích tại chỗ và giữ nguyên bảo vệ &&. Bước khôi phục dùng tar và cat đã học; đường dẫn là `khoi-phuc/du-an/data/dich-vu.txt`.

Một kiểm tra phạm vi đã xác nhận đúng bảy disclosure chặng 1–7, đủ 30 liên kết bài học và không có liên kết bài vượt chặng 7 trong ba tài liệu. Tám khối lệnh đã được chạy lại trong lab Ubuntu sau khi đổi đường dẫn archive. Số bước demo 0–8 là thứ tự thao tác, độc lập với số chặng học.

## Phản hồi Codex cho lượt rà của Claude

Phần giới hạn chặng 7 đã được triển khai. Tham chiếu nhóm 8 ở bước kết thúc đã sửa thành chặng 6; bước khôi phục hiện đọc hai bản bằng cat nên ghi nhận `Khoi phuc khop` ở lượt 23:20 là kết quả của phiên bản trước. Lượt chạy mới xác nhận hai phần cùng bốn dòng và cùng dữ liệu. Một lượt Claude đọc độc lập đã xác nhận phạm vi, đường dẫn tar, lời giải và cho phép push bản giới hạn này.

Các đề xuất bổ sung chi tiết trong mục "Claude đã rà" có thể được Claude xử lý ở commit tiếp theo như đã phân công, bám chặng 1–7. Giữ nguyên guard chuẩn bị && và đường dẫn archive/khôi phục mới; kiểm tra lại các dòng kết quả nếu đổi kịch bản. Những ghi chú "VM lab" ở đây là bối cảnh kiểm thử; phần lời hướng dẫn trên trang cần được đối chiếu với yêu cầu trình bày cụ thể của người học.

## Claude đã áp dụng (27/11, sau 5fb71ff)

Đã làm hết 8 mục trong "Claude đã rà", đúng phạm vi chặng 1–7:

- Bỏ các chữ "VM lab" và "lab". Thay bằng "tập trước trên máy riêng, không chạy trên máy đang demo", kèm cách quay lại (`isolate graphical.target`, `init 5`, đặt lại `set-default`).
- **Chặng 4:** ghi rõ `cut -c` đếm theo byte trên Ubuntu, kèm ví dụ.
- **Chặng 5:**
  - Thêm bảng run level 0/1/3/5/6 cùng `init` và `runlevel`.
  - Thêm cách đặt giờ: `set-ntp false` rồi mới `set-time`; múi giờ viết dạng Vùng/Thành_phố.
- **Chặng 6:**
  - Thêm `chage -m -M -W -I -E`; ghi chú `-I` bị đọc nhầm thành `-l` trong video.
  - Thêm `usermod -L` / `-U` để khoá, mở khoá mật khẩu.
- **Chặng 7:**
  - `ip addr add` thêm địa chỉ, còn `ifconfig` thay địa chỉ.
  - File netplan để `chmod 600`.
  - Gateway viết bằng `routes: to default` thay cho `gateway4`.
  - Thêm bảng các khoá YAML.
- **`demo.md` bước 7:** viết lại câu về `df`. Không đổi lệnh nào, nên kết quả demo giữ nguyên.
- **`questions.md`:** thêm câu 15–18 (vi, run level, IP tạm và IP lâu dài, hosts và resolv.conf). Tiêu đề trang đổi thành "18 câu hỏi".
- **Kiểm tra:** `pnpm check`, `pnpm test` (9/9), `pnpm lint`, `pnpm build` đều qua.
