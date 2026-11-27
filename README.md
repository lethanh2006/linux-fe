# Học Linux — Frontend

Giao diện web học Linux (Next.js 16, Tailwind 4, SWR). Backend ở repo [linux-be](https://github.com/lethanh2006/linux-be).

Trình duyệt chỉ gọi `/api/*` trên chính web này. Server Next.js chuyển tiếp sang backend theo biến `API_INTERNAL_URL`, nên không cần cấu hình CORS.

## Chạy ở máy mình

Cần chạy backend trước (xem README của linux-be), rồi:

```bash
cp .env.example .env.local   # API_INTERNAL_URL=http://localhost:4001/api
pnpm install
pnpm dev                      # http://localhost:3001
```

Bài học đọc thẳng từ file, nên không có backend vẫn xem được bài. Backend chỉ cần cho phần lưu tiến độ và điểm kiểm tra.

## Các trang

| Đường dẫn | Nội dung |
|---|---|
| `/` | Lộ trình: phần 1 bám video TITV 5–34 (30 bài), phần 2 mở rộng theo LPIC-1; kèm tiến độ và nút học tiếp |
| `/bai/<slug>` | Một bài: giải thích, bảng tách lệnh, thực hành có đáp án ẩn, câu hỏi kiểm tra, đánh dấu đã học |
| `/tra-cuu` | Tìm lệnh đã được giải thích ở bài nào |
| `/tien-do` | Mã học viên, khôi phục tiến độ từ máy khác, điểm từng bài |
| `/nguon` | Các nguồn dùng để soạn bài và để học thêm |

## Thêm hoặc sửa bài

- Lộ trình (thứ tự chặng, bài, mục thi LPIC-1, số video TITV) nằm ở `src/content/curriculum.ts`.
- Nội dung bài nằm ở `content/lessons/<slug>.md`. Bài chưa có file thì lộ trình ghi "Đang viết".
- Đầu file là frontmatter YAML: `summary`, `minutes`, `commands` (cho trang tra cứu), `quiz` (mỗi câu có `q`, `options`, `answer` tính từ 0, `explain`).
- Thân bài là Markdown. Quy ước:
  - Khối ` ```bash ` là lệnh (tự có dấu nhắc `$` và nút Chép), khối ` ```text ` là kết quả in ra.
  - Mỗi lệnh có bảng `| Phần | Ý nghĩa |` tách từng phần.
  - Đáp án thực hành bọc trong `<details><summary>Xem đáp án</summary> … </details>`.
- `pnpm check` kiểm tra frontmatter, câu hỏi, link `/bai/...` và khối code chưa đóng. `pnpm build` tự chạy bước này.

## Lệnh

| Lệnh | Làm gì |
|---|---|
| `pnpm dev` | Chạy chế độ phát triển ở cổng 3001 |
| `pnpm build` | Build bản production |
| `pnpm start` | Chạy bản đã build ở cổng 3001 |
| `pnpm lint` | Kiểm tra code bằng ESLint |
| `pnpm check` | Kiểm tra nội dung bài học |

## Biến môi trường

| Biến | Ý nghĩa |
|---|---|
| `API_INTERNAL_URL` | URL backend, có `/api` ở cuối. Ở máy mình: `http://localhost:4001/api` |

## Deploy

Vercel project `linux-fe` → https://linux-fe.vercel.app (push lên `master` là tự deploy).

Biến môi trường trên Vercel: `API_INTERNAL_URL=https://linux-be.vercel.app/api`.
