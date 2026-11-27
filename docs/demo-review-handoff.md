# Bàn giao rà soát mục Ôn tập & demo

## Mục tiêu

Người học cần ôn nhanh những gì đã học trước buổi demo thứ Ba. Mục `/on-tap` hiện bám khoá Linux TITV bài 5–34, với kịch bản gợi ý 15–20 phút. Phạm vi và thời lượng là giả định đã thông báo; có thể điều chỉnh nếu người học bổ sung yêu cầu.

## Nội dung và các file chính

- `content/review/summary.md`: 10 nhóm kiến thức, liên kết tới đủ 30 bài chính, cú pháp, lỗi hay gặp và câu giải thích.
- `content/review/demo.md`: một bộ dữ liệu xuyên suốt; thao tác file, lọc log, find, quyền, link, tar/khôi phục, hệ thống/mạng; mỗi bước có lời nói gợi ý và dấu hiệu cần thấy.
- `content/review/questions.md`: 14 câu hỏi vấn đáp có đáp án ẩn.
- `src/app/on-tap/page.tsx`: trang server; `src/lib/review.ts` đọc các tài liệu.
- `src/components/demo-checklist.tsx`: 8 mục tự kiểm tra, lưu localStorage phiên bản riêng; hỗ trợ reset, dữ liệu lưu lỗi và tương tác trong phiên khi lưu trữ bị chặn.
- Mục điều hướng và thẻ trang chủ dẫn tới `/on-tap`.
- `scripts/check-content.mjs` kiểm tra cả bài học và tài liệu ôn tập.

## Bằng chứng kiểm tra

- Chạy 8 khối bash trong kịch bản theo thứ tự, bằng user thường trên Ubuntu 24.04 trong lab dùng một lần. Kết quả log, thống kê dịch vụ, mode 640, inode chung, symlink và so sánh file khôi phục đều đúng.
- Reviewer tìm được lỗi chuẩn bị dữ liệu tiếp tục ghi khi mktemp/cd thất bại. Đã chuyển toàn bộ setup sang chuỗi &&; 3 ca kiểm tra trong `scripts/review-demo.test.mjs` mô phỏng lỗi mktemp, cd, mkdir và xác nhận dữ liệu cũ còn nguyên. Đã thấy các ca thất bại trước sửa và qua sau sửa.
- `pnpm check`, `pnpm lint`, `pnpm test`: qua; tổng 9 tests.
- `pnpm build`: qua, có route tĩnh `/on-tap`; production trace chứa đủ 3 file Markdown.
- Trình duyệt: 10 nhóm tóm tắt, 14 đáp án ẩn, bàn phím Enter/Space, nút chép lệnh, checklist/reset/refresh, JSON lỗi, lưu trữ bị chặn trên production server, màn hình 320px khi mở đủ 10 nhóm, sáng/tối.

## Trọng tâm cho Claude rà tiếp

1. Đọc lời giải thích theo góc nhìn người mới; mỗi lệnh có đủ ngữ cảnh để tự trình bày.
2. Đối chiếu kịch bản với đúng phạm vi đã học và thời lượng thực tế của buổi demo.
3. Giữ bộ dữ liệu mẫu nhất quán qua các bước, nhất là dòng worker được thêm trước khi nén.
4. Giữ điều kiện dừng của toàn bộ khối chuẩn bị; không làm mất bảo vệ đã được kiểm tra.
5. Phân biệt phần demo tài khoản thường với ví dụ quản trị cần VM; kiểm tra liên kết bài gốc khi đổi slug.

Các kiểm tra lỗi setup cần Bash; tests Node dùng phiên bản 22.6 trở lên. Để xác nhận lại quy trình: `pnpm check`, `pnpm lint`, `pnpm test`, `pnpm build`, rồi chạy kịch bản theo thứ tự trên máy lab.
