---
summary: vi là trình soạn thảo có sẵn trên gần như mọi máy Linux, dùng để sửa file ngay trong terminal. Bài này học hai chế độ của vi, cách lưu và thoát, rồi các nhóm lệnh chèn, di chuyển, xoá, tìm, thay thế, chép dán.
minutes: 40
commands: [vi, ":wq", ":q!", dd, yy, p, u, "/từ", ":%s/cũ/mới/g"]
quiz:
  - q: Vừa mở file bằng vi, bạn đang ở chế độ nào?
    options: ["Chế độ gõ chữ (Insert)", "Chế độ lệnh (Command)", "Chế độ chỉ đọc", "Chế độ đồ hoạ"]
    answer: 1
    explain: "vi mở ra ở chế độ lệnh: mỗi phím là một lệnh. Bấm `i` để vào chế độ gõ chữ, `Esc` để quay lại."
  - q: Lệnh nào thoát vi mà KHÔNG lưu thay đổi?
    options: [":wq", ":x", ":q!", ":w"]
    answer: 2
    explain: "`:q!` thoát và bỏ mọi thay đổi. `:wq` và `:x` lưu rồi thoát, `:w` chỉ lưu."
  - q: Phím `o` ở chế độ lệnh làm gì?
    options: ["Mở file khác", "Thêm dòng mới bên dưới và vào chế độ gõ chữ", "Thêm dòng mới bên trên", "Xoá dòng"]
    answer: 1
    explain: "`o` mở dòng mới bên dưới, `O` mở dòng mới bên trên. Cả hai đều chuyển sang chế độ gõ chữ."
  - q: "Lệnh nào thay mọi chữ `dòng` thành `hàng` trong **toàn file**?"
    options: [":s/dòng/hàng/", ":s/dòng/hàng/g", ":%s/dòng/hàng/g", "/dòng/hàng"]
    answer: 2
    explain: "`%` là mọi dòng, `g` là mọi chỗ trên mỗi dòng. Thiếu `%` thì chỉ thay trên dòng đang đứng."
  - q: Chép dòng hiện tại rồi dán xuống dưới thì bấm gì?
    options: ["yy rồi p", "dd rồi p", "cc rồi p", "yw rồi P"]
    answer: 0
    explain: "`yy` chép (yank) dòng, `p` dán bên dưới. `dd` rồi `p` là cắt rồi dán."
---

> Bài này đi theo video TITV bài 19. Bài 20 là phần thực hành tiếp theo.

## Vì sao phải biết vi

Máy chủ Linux thường không có giao diện đồ hoạ, nên không mở được Text Editor hay VS Code. Sửa file cấu hình phải làm ngay trong terminal. **vi** là trình soạn thảo "theo màn hình" có sẵn trên gần như mọi máy Linux và Unix. **vim** (vi improved) là bản vi hiện đại hơn.

Mở một file:

```bash
mkdir -p ~/thuchanh/bai19 && cd ~/thuchanh/bai19
vi mydocument.txt
```

| Phần | Ý nghĩa |
|---|---|
| `vi` | Mở trình soạn thảo |
| `mydocument.txt` | File cần mở. Chưa có thì dòng cuối màn hình ghi `[New]` (file mới); file chỉ thật sự được tạo khi bạn lưu |

Dòng `~` ở đầu mỗi dòng trống là chỗ chưa có nội dung.

> **Trên Ubuntu desktop,** `vi` mặc định là bản rút gọn `vim.tiny` chạy ở chế độ giống vi cũ: không hiện chữ `-- INSERT --`, `u` chỉ hoàn tác được 1 bước, phím mũi tên khi gõ chữ có thể sinh ra ký tự lạ. Nên cài bản đầy đủ: `sudo apt install vim`. Sau đó gõ `vi` hay `vim` đều chạy bản đầy đủ.

## Hai chế độ của vi

Điều làm người mới bối rối: vi **có chế độ**. Cùng một phím, ở chế độ khác nhau làm việc khác nhau.

| Chế độ | Để làm gì | Vào bằng |
|---|---|---|
| **Lệnh** (Command) | Di chuyển, xoá, chép, tìm, lưu, thoát. Mỗi phím là một lệnh | Mở vi là ở đây. Từ chế độ gõ chữ, bấm `Esc` |
| **Gõ chữ** (Insert, Text) | Gõ nội dung như trình soạn thảo bình thường | Bấm `i`, `a`, `o`… từ chế độ lệnh, hoặc phím `Insert` |

Ở chế độ lệnh, gõ `:` thì con trỏ nhảy xuống dòng cuối để bạn gõ lệnh dài như `:wq`, `:set nu`. Gõ `/` để tìm.

> **Quy tắc vàng:** không biết đang ở chế độ nào thì bấm `Esc` một hai lần. Bạn sẽ về chế độ lệnh.

## Nhóm lệnh tối thiểu

Chỉ cần thuộc bảng này là sửa file được:

| Lệnh | Làm gì |
|---|---|
| `i` | Vào chế độ gõ chữ |
| `Esc` | Về chế độ lệnh |
| `:w` | Lưu (**w**rite) |
| `:wq` hoặc `:x` | Lưu rồi thoát |
| `:q` | Thoát. Còn thay đổi chưa lưu thì vi không cho thoát |
| `:q!` | Thoát, **bỏ** mọi thay đổi |
| `:set nu` / `:set nonu` | Hiện / ẩn số dòng |
| `:20` | Nhảy tới dòng 20 |
| `dd` | Xoá dòng đang đứng |
| `dG` | Xoá từ dòng đang đứng tới cuối file |
| `u` | Hoàn tác (**u**ndo) |
| `/từ` rồi `Enter` | Tìm xuôi. `n` kết quả sau, `N` kết quả trước |
| `?từ` rồi `Enter` | Tìm ngược lên |

Các lệnh bắt đầu bằng `:` phải bấm `Enter` mới chạy.

## Nhóm chèn: vào chế độ gõ chữ

| Phím | Bắt đầu gõ ở đâu |
|---|---|
| `i` | Trước con trỏ (**i**nsert) |
| `I` | Đầu dòng |
| `a` | Sau con trỏ (**a**ppend) |
| `A` | Cuối dòng |
| `o` | Dòng mới **bên dưới** |
| `O` | Dòng mới **bên trên** |
| `r` + ký tự | Thay một ký tự dưới con trỏ, rồi ở lại chế độ lệnh |
| `R` | Gõ đè lên chữ cũ cho tới khi bấm `Esc` |

## Nhóm di chuyển (chế độ lệnh)

Phím mũi tên, `Home`, `End` vẫn dùng được. vi còn có các phím riêng để tay khỏi rời hàng phím chữ:

| Phím | Đi tới |
|---|---|
| `h` `l` | Trái, phải một ký tự |
| `j` `k` | Xuống, lên một dòng |
| `w` / `b` | Đầu từ kế tiếp / đầu từ trước |
| `0` / `$` | Đầu dòng / cuối dòng |
| `(` / `)` | Đầu câu trước / câu sau |
| `{` / `}` | Đầu đoạn trước / đoạn sau |
| `gg` / `G` | Dòng đầu / dòng cuối file |

## Nhóm xoá (chế độ lệnh)

| Phím | Xoá |
|---|---|
| `x` | Một ký tự dưới con trỏ |
| `dd` | Cả dòng |
| `5dd` | 5 dòng, tính từ dòng đang đứng |
| `dw` | Tới hết từ |
| `d0` hoặc `d^` | Từ con trỏ về đầu dòng |
| `d$` | Từ con trỏ tới cuối dòng |

Quy luật: `d` (delete) đi kèm một **phím di chuyển** cho biết xoá tới đâu. `dw` là xoá tới đầu từ sau, `d$` là xoá tới cuối dòng, `dG` là xoá tới cuối file. Gõ `dd` là áp cho cả dòng.

## Tìm và thay thế

| Lệnh | Làm gì |
|---|---|
| `:s/cũ/mới/` | Thay chữ `cũ` **đầu tiên** trên dòng đang đứng |
| `:s/cũ/mới/g` | Thay **mọi** chữ `cũ` trên dòng đang đứng |
| `:%s/cũ/mới/g` | Thay mọi chữ `cũ` trong **toàn file** |

| Phần của `:%s/cũ/mới/g` | Ý nghĩa |
|---|---|
| `:` | Gõ lệnh ở dòng cuối |
| `%` | Phạm vi: mọi dòng trong file |
| `s` | Thay thế (**s**ubstitute) |
| `/cũ/` | Chữ cần tìm (là biểu thức chính quy, bài 15) |
| `mới/` | Chữ thay vào |
| `g` | Thay mọi chỗ trên mỗi dòng, không chỉ chỗ đầu tiên |

## Chép và dán

| Phím | Làm gì |
|---|---|
| `yy` | Chép (**y**ank) dòng đang đứng |
| `3yy` | Chép 3 dòng |
| `y$` | Chép từ con trỏ tới cuối dòng |
| `p` | Dán bên dưới (hoặc sau con trỏ nếu chép một đoạn trong dòng) |
| `P` | Dán bên trên |
| `dd` rồi `p` | Cắt rồi dán: chuyển một dòng đi chỗ khác |

## Làm theo video

Gõ từng bước, sau mỗi bước nhìn kết quả trên màn hình.

1. `vi mydocument.txt`, bấm `i`, gõ `Hello Vi Editor`, bấm `Esc`, gõ `:wq` rồi `Enter`. Kiểm tra bằng `cat mydocument.txt`.
2. Mở lại file. Bấm `o`, gõ `dòng 2`, `Enter`, `dòng 3`, `Enter`, `dòng 4`, bấm `Esc`, gõ `:w` để lưu.
3. Đang ở dòng `dòng 4`, bấm `O`, gõ `dòng 3A`, `Esc`, rồi `:x`. File lúc này:

   ```text
   Hello Vi Editor
   dòng 2
   dòng 3
   dòng 3A
   dòng 4
   ```

4. Mở lại, gõ `:4` rồi `Enter` để tới dòng `dòng 3A`, bấm `dd` để xoá.
5. Gõ `?dòng` để tìm ngược, `/o` để tìm xuôi chữ `o`, bấm `n` vài lần.
6. Gõ `:2`, rồi `:s/dòng/hàng/`: chỉ dòng 2 đổi thành `hàng 2`. Tiếp theo `:%s/dòng/hàng/g`: mọi dòng còn lại đều đổi.
7. Gõ `:1`, bấm `yy`, `G` (xuống cuối), `p`: dòng `Hello Vi Editor` được chép xuống cuối. Lưu bằng `:wq`.

   ```text
   Hello Vi Editor
   hàng 2
   hàng 3
   hàng 4
   Hello Vi Editor
   ```

## Mở rộng (chuẩn LPIC-1)

Chuẩn LPIC-1 mục 103.8 yêu cầu dùng vi cơ bản và biết trình soạn thảo mặc định.

| Lệnh | Làm gì |
|---|---|
| `ZZ` | Lưu rồi thoát, giống `:x` |
| `:w tên-khác` | Lưu ra file khác |
| `:e!` | Bỏ mọi thay đổi, đọc lại file từ đĩa |
| `vi +20 file` | Mở file và nhảy thẳng tới dòng 20 |
| `v` / `V` | Chế độ chọn (Visual) theo ký tự / theo dòng (chỉ có ở vim). Chọn xong bấm `d` để xoá, `y` để chép |
| `vimtutor` | Bài học tương tác khoảng 30 phút, có sẵn khi cài vim. Cách học vim nhanh nhất |

**nano** là trình soạn thảo dễ hơn: mở ra là gõ được, phím tắt hiện sẵn ở dưới màn hình (`^` là phím `Ctrl`). `Ctrl+O` rồi `Enter` để lưu, `Ctrl+X` để thoát, `Ctrl+W` để tìm.

Các lệnh như `crontab -e`, `visudo` mở trình soạn thảo theo biến `EDITOR`. Muốn mặc định dùng vim, thêm dòng `export EDITOR=vim` vào cuối file `~/.bashrc`.

## Thực hành

1. Tạo file `~/thuchanh/bai19/cauhinh.txt` bằng vi, nội dung ba dòng: `host=cu.local`, `port=80`, `root=/var/www/cu`. Lưu và thoát.

   <details>
   <summary>Xem cách làm</summary>

   `vi ~/thuchanh/bai19/cauhinh.txt` → `i` → gõ ba dòng → `Esc` → `:wq` → `Enter`. Kiểm tra bằng `cat`.

   </details>

2. Mở lại file, bằng một lệnh thay mọi chữ `cu` thành `shop`, hiện số dòng, rồi lưu.

   <details>
   <summary>Xem đáp án</summary>

   ```text
   :%s/cu/shop/g
   :set nu
   :wq
   ```

   </details>

3. Mở lại file, sửa `port=80` thành `port=8080` rồi thoát **không lưu**. Kiểm tra file vẫn là `port=80`.

   <details>
   <summary>Xem cách làm</summary>

   `:2` để tới dòng 2 → `A` để gõ ở cuối dòng → gõ `80` → `Esc` → `:q!`. `cat` lại vẫn thấy `port=80`.

   </details>

## Tóm tắt

| Việc | Trong vi |
|---|---|
| Vào gõ chữ / về chế độ lệnh | `i` / `Esc` |
| Lưu / lưu và thoát / thoát bỏ thay đổi | `:w` / `:wq` / `:q!` |
| Dòng mới dưới / trên | `o` / `O` |
| Đầu file / cuối file / dòng N | `gg` / `G` / `:N` |
| Xoá dòng / chép dòng / dán | `dd` / `yy` / `p` |
| Hoàn tác | `u` |
| Tìm | `/từ`, `n`, `N` |
| Thay toàn file | `:%s/cũ/mới/g` |
| Hiện số dòng | `:set nu` |
