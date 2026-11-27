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

Trang chủ có ô trạng thái: xanh là backend và MongoDB đều chạy.

## Lệnh

| Lệnh | Làm gì |
|---|---|
| `pnpm dev` | Chạy chế độ phát triển ở cổng 3001 |
| `pnpm build` | Build bản production |
| `pnpm start` | Chạy bản đã build ở cổng 3001 |
| `pnpm lint` | Kiểm tra code bằng ESLint |

## Biến môi trường

| Biến | Ý nghĩa |
|---|---|
| `API_INTERNAL_URL` | URL backend, có `/api` ở cuối. Ở máy mình: `http://localhost:4001/api` |
