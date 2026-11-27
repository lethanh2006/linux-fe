---
summary: vi/vim có mặt trên mọi máy Linux, kể cả server tối giản không có giao diện. Bài này dạy các chế độ của vim, cách mở, sửa, lưu, thoát, di chuyển, xoá, chép, dán, tìm và thay thế — đủ để sửa file cấu hình trên server. Kèm nano cho người mới.
minutes: 45
commands: [vi, vim, nano, vimtutor]
quiz:
  - q: Vừa mở vim, gõ chữ mà không thấy chữ hiện ra, con trỏ nhảy lung tung. Vì sao?
    options: ["vim bị lỗi", "Đang ở chế độ Normal, các phím là lệnh chứ không phải chữ", "File chỉ đọc", "Bàn phím hỏng"]
    answer: 1
    explain: Vim mở ra ở chế độ Normal, mỗi phím là một lệnh (`j` xuống dòng, `x` xoá ký tự…). Bấm `i` để vào chế độ Insert rồi mới gõ chữ.
  - q: Thoát vim mà KHÔNG lưu thay đổi thì gõ gì?
    options: [":wq", ":q!", ":w", "ZZ"]
    answer: 1
    explain: "`:q!` thoát và bỏ mọi thay đổi. `:wq`, `:x` và `ZZ` đều lưu rồi thoát, còn `:w` chỉ lưu."
  - q: Trong chế độ Normal, `dd` làm gì?
    options: ["Xoá một ký tự", "Xoá (cắt) cả dòng hiện tại", "Nhân đôi dòng", "Xuống dòng cuối"]
    answer: 1
    explain: "`dd` xoá cả dòng và giữ nó trong bộ nhớ tạm, nên dán lại được bằng `p`. Xoá một ký tự là `x`."
  - q: "Lệnh nào thay mọi chữ `cu.local` bằng `moi.local` trong toàn file?"
    options: ["/cu.local/moi.local", ":s/cu.local/moi.local/", ":%s/cu.local/moi.local/g", ":replace cu.local moi.local"]
    answer: 2
    explain: "`%` là toàn file, `s` là thay thế, `g` (global) là mọi chỗ trên mỗi dòng. Thiếu `%` thì chỉ thay ở dòng hiện tại, thiếu `g` thì chỉ thay chỗ đầu tiên của mỗi dòng."
  - q: Lỡ xoá nhầm một đoạn trong vim, làm sao lấy lại?
    options: ["Ctrl+Z", "Bấm u ở chế độ Normal", ":back", "Không lấy lại được"]
    answer: 1
    explain: "`u` (undo) hoàn tác thao tác vừa làm, bấm nhiều lần để lùi nhiều bước. `Ctrl+R` làm lại (redo). Đừng bấm Ctrl+Z, phím đó đẩy vim xuống chạy nền."
  - q: Biến môi trường nào quyết định trình soạn thảo mà các lệnh như crontab -e, visudo, git commit mở ra?
    options: ["SHELL", "EDITOR", "VIM", "PATH"]
    answer: 1
    explain: "Các lệnh này mở trình soạn thảo theo biến `EDITOR` (hoặc `VISUAL`). Ví dụ `export EDITOR=vim` trong `~/.bashrc`."
---

## Vì sao phải biết vi

Server không có giao diện đồ hoạ, không có VS Code. Sửa file cấu hình nginx, ssh, cron… đều làm ngay trong terminal. **vi** có sẵn trên gần như mọi máy Unix/Linux, kể cả image Docker tối giản hay máy đang ở chế độ cứu hộ. **vim** (vi improved) là bản vi hiện đại. Trên Ubuntu, gõ `vi` là chạy vim.

Không cần thành thạo vim. Chỉ cần làm được: mở file, sửa, lưu, thoát, tìm, thay thế. Bài này dạy đúng chừng đó.

## Bốn chế độ của vim

Đây là chỗ người mới hay vấp: vim **có chế độ**. Cùng một phím, ở chế độ khác nhau làm việc khác nhau.

| Chế độ | Để làm gì | Vào bằng | Nhận biết |
|---|---|---|---|
| **Normal** | Di chuyển, xoá, chép, dán. Mỗi phím là một lệnh | Mở vim là ở đây. Bấm `Esc` từ chế độ khác | Góc dưới trống |
| **Insert** | Gõ chữ như trình soạn thảo bình thường | `i`, `a`, `o`… từ Normal | Góc dưới hiện `-- INSERT --` |
| **Command-line** | Lưu, thoát, tìm, thay thế | `:` (hoặc `/`) từ Normal | Con trỏ xuống dòng cuối, có dấu `:` |
| **Visual** | Bôi đen một vùng để xoá, chép | `v` (theo ký tự), `V` (theo dòng) | Góc dưới hiện `-- VISUAL --` |

> **Quy tắc vàng:** không biết đang ở chế độ nào thì bấm `Esc` một hai lần. Bạn sẽ về Normal.

## Mở, lưu, thoát

```bash
vim ghichu.txt
```

| Phần | Ý nghĩa |
|---|---|
| `vim` | Mở trình soạn thảo vim (gõ `vi` cũng được) |
| `ghichu.txt` | File cần mở. Chưa có thì vim tạo khi bạn lưu |

Thêm `+20` để mở và nhảy thẳng tới dòng 20: `vim +20 /etc/nginx/nginx.conf`. Rất tiện khi log báo lỗi ở dòng nào đó.

Ở chế độ Normal, gõ:

| Lệnh | Làm gì |
|---|---|
| `:w` | Lưu (**w**rite) |
| `:q` | Thoát (**q**uit). Nếu còn thay đổi chưa lưu, vim không cho thoát |
| `:wq` hoặc `:x` hoặc `ZZ` | Lưu rồi thoát |
| `:q!` | Thoát và **bỏ** mọi thay đổi |
| `:w!` | Ép lưu (khi file chỉ đọc nhưng bạn có quyền ghi) |
| `:w ten-khac.txt` | Lưu ra file khác |

Sửa file của root mà quên `sudo`, vim báo `E45: 'readonly' option is set` hoặc không lưu được. Cách xử lý: `:q!` rồi mở lại bằng `sudo vim file`.

## Vào chế độ Insert để gõ chữ

| Phím | Bắt đầu gõ ở đâu |
|---|---|
| `i` | Trước con trỏ (**i**nsert) |
| `a` | Sau con trỏ (**a**ppend) |
| `I` | Đầu dòng |
| `A` | Cuối dòng |
| `o` | Mở dòng mới **bên dưới** |
| `O` | Mở dòng mới **bên trên** |

Gõ xong bấm `Esc` để về Normal.

## Di chuyển (chế độ Normal)

Phím mũi tên dùng được, nhưng biết thêm vài phím sau sẽ nhanh hơn nhiều:

| Phím | Đi tới |
|---|---|
| `h` `j` `k` `l` | Trái, xuống, lên, phải |
| `w` / `b` | Đầu từ kế tiếp / đầu từ trước |
| `0` / `$` | Đầu dòng / cuối dòng |
| `gg` / `G` | Dòng đầu file / dòng cuối file |
| `:20` rồi `Enter` (hoặc `20G`) | Dòng 20 |
| `Ctrl+F` / `Ctrl+B` | Xuống / lên một trang |

## Xoá, chép, dán, hoàn tác (chế độ Normal)

| Phím | Làm gì |
|---|---|
| `x` | Xoá ký tự dưới con trỏ |
| `dd` | Xoá (cắt) cả dòng |
| `3dd` | Xoá 3 dòng |
| `dw` | Xoá đến hết từ |
| `D` | Xoá từ con trỏ đến cuối dòng |
| `yy` | Chép (**y**ank) cả dòng |
| `3yy` | Chép 3 dòng |
| `p` / `P` | Dán sau / trước con trỏ (dòng thì dán dưới / trên) |
| `cw` | Xoá đến hết từ rồi vào Insert để gõ từ mới (**c**hange **w**ord) |
| `cc` | Xoá cả dòng rồi vào Insert |
| `r` + ký tự | Thay ký tự dưới con trỏ bằng ký tự gõ vào |
| `u` | Hoàn tác (**u**ndo) |
| `Ctrl+R` | Làm lại (**r**edo) |
| `.` | Lặp lại thao tác sửa vừa làm |

Quy luật: `d` (delete), `y` (yank), `c` (change) đi kèm một **chuyển động**. `dw` là xoá một từ, `d$` là xoá đến cuối dòng, `dG` là xoá đến cuối file. Gõ hai lần (`dd`, `yy`, `cc`) là áp cho cả dòng.

Bôi đen bằng chế độ Visual: bấm `V`, dùng `j`/`k` chọn nhiều dòng, rồi `d` để xoá hoặc `y` để chép.

## Tìm và thay thế

| Lệnh | Làm gì |
|---|---|
| `/listen` rồi `Enter` | Tìm xuôi chữ `listen`. `n` kết quả sau, `N` kết quả trước |
| `?listen` rồi `Enter` | Tìm ngược lên |
| `:s/cu/moi/` | Thay chữ `cu` đầu tiên trên **dòng hiện tại** |
| `:s/cu/moi/g` | Thay mọi chữ `cu` trên dòng hiện tại |
| `:%s/cu/moi/g` | Thay mọi chữ `cu` trong **toàn file** |
| `:%s/cu/moi/gc` | Như trên nhưng hỏi xác nhận từng chỗ (`y`/`n`) |

Đọc lệnh `:%s/cu.local/moi.local/g`:

| Phần | Ý nghĩa |
|---|---|
| `:` | Vào chế độ Command-line |
| `%` | Phạm vi: mọi dòng trong file. Có thể ghi `10,20` để chỉ thay từ dòng 10 đến 20 |
| `s` | Thay thế (**s**ubstitute) |
| `/cu.local/` | Chuỗi cần tìm (thực chất là biểu thức chính quy, dấu `.` khớp mọi ký tự) |
| `moi.local/` | Chuỗi thay vào |
| `g` | Thay mọi chỗ trên mỗi dòng, không chỉ chỗ đầu tiên |

Ví dụ file `t.conf` trước và sau khi chạy lệnh trên:

```text
server {
  listen 80;
  server_name cu.local;
}
```

```text
server {
  listen 80;
  server_name moi.local;
}
```

## Vài thiết lập hữu ích

| Lệnh | Làm gì |
|---|---|
| `:set number` (`:set nu`) | Hiện số dòng |
| `:set nonumber` | Tắt số dòng |
| `:set paste` | Bật trước khi dán đoạn chữ từ ngoài vào, để vim không tự thụt lề lung tung |
| `:syntax on` | Tô màu theo cú pháp |

Muốn giữ lâu dài, ghi các dòng (không có dấu `:`) vào file `~/.vimrc`, ví dụ `set number`.

## Luyện tập với vimtutor

```bash
vimtutor
```

`vimtutor` là bài học tương tác có sẵn khi cài vim, khoảng 30 phút, vừa đọc vừa làm ngay trong vim. Đây là cách học vim nhanh nhất. Nên làm một lần ngay sau bài này.

## nano: trình soạn thảo cho người mới

`nano` dễ dùng hơn: mở ra là gõ được, các phím tắt hiện sẵn ở hai dòng cuối màn hình (`^` nghĩa là phím Ctrl).

```bash
nano ghichu.txt
```

| Phím | Làm gì |
|---|---|
| Gõ bình thường | Thêm chữ |
| `Ctrl+O` rồi `Enter` | Lưu |
| `Ctrl+X` | Thoát (nếu chưa lưu sẽ hỏi `Y`/`N`) |
| `Ctrl+W` | Tìm |
| `Ctrl+K` / `Ctrl+U` | Cắt dòng / dán |
| `Alt+U` | Hoàn tác |

nano đủ cho việc sửa nhanh. Nhưng vẫn nên biết vim, vì có những máy chỉ có `vi`.

## Chọn trình soạn thảo mặc định

Các lệnh như `crontab -e`, `visudo`, `git commit` mở trình soạn thảo theo biến môi trường `EDITOR`. Trên Ubuntu, khi biến này chưa đặt thì mặc định là `nano`. Muốn dùng vim:

```bash
echo 'export EDITOR=vim' >> ~/.bashrc
source ~/.bashrc
```

| Phần | Ý nghĩa |
|---|---|
| `echo '...' >> ~/.bashrc` | Thêm dòng cấu hình vào cuối file `.bashrc`, file này chạy mỗi khi mở shell |
| `export EDITOR=vim` | Đặt biến môi trường `EDITOR` là `vim` |
| `source ~/.bashrc` | Chạy lại `.bashrc` ngay trong shell hiện tại để có hiệu lực luôn |

## Thực hành

1. Chạy `vimtutor` và làm hết bài 1 (Lesson 1). Phần này dạy di chuyển, thoát, xoá ký tự, chèn chữ.

2. Tạo file `~/nginx-thu.conf` bằng vim với nội dung sau, lưu và thoát:

   ```text
   server {
       listen 80;
       server_name cu.local;
       root /var/www/cu;
   }
   ```

   <details>
   <summary>Xem cách làm</summary>

   `vim ~/nginx-thu.conf` → bấm `i` → gõ nội dung → `Esc` → `:wq` → `Enter`. Kiểm tra bằng `cat ~/nginx-thu.conf`.

   </details>

3. Mở lại file, bằng **một** lệnh thay mọi chữ `cu` thành `shop`. Sau đó hiện số dòng.

   <details>
   <summary>Xem đáp án</summary>

   ```text
   :%s/cu/shop/g
   :set number
   ```

   Kết quả: `server_name shop.local;` và `root /var/www/shop;`.

   </details>

4. Vẫn trong file đó: chép dòng `listen 80;`, dán ngay bên dưới, rồi sửa bản sao thành `listen 443;`. Cuối cùng hoàn tác hết rồi thoát mà không lưu.

   <details>
   <summary>Xem cách làm</summary>

   Đưa con trỏ tới dòng `listen 80;` (ví dụ gõ `:2` rồi `Enter`) → `yy` → `p` → ở dòng mới, đưa con trỏ tới số `80` (gõ `/80` rồi `Enter`) → `cw` → gõ `443` → `Esc`. Bấm `u` vài lần để hoàn tác, rồi `:q!`.

   </details>

5. Đặt vim làm trình soạn thảo mặc định, rồi kiểm tra bằng `echo $EDITOR`.

## Tóm tắt

| Việc | Trong vim |
|---|---|
| Vào gõ chữ / về Normal | `i` / `Esc` |
| Lưu / thoát / lưu và thoát / thoát bỏ thay đổi | `:w` / `:q` / `:wq` / `:q!` |
| Đầu file / cuối file / dòng N | `gg` / `G` / `:N` |
| Xoá dòng / chép dòng / dán | `dd` / `yy` / `p` |
| Hoàn tác / làm lại | `u` / `Ctrl+R` |
| Tìm | `/từ`, `n`, `N` |
| Thay toàn file | `:%s/cũ/mới/g` |
| Hiện số dòng | `:set number` |
| nano: lưu / thoát | `Ctrl+O` / `Ctrl+X` |
