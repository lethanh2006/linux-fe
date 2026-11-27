---
summary: Gói nhiều file thành một (tar) và nén cho nhỏ (gzip, bzip2, xz, zip). Biết đọc đuôi file .tar.gz, .tgz, .tar.xz, .zip, xem bên trong mà không giải nén, giải nén vào đúng chỗ — việc làm hằng ngày khi sao lưu và tải phần mềm.
minutes: 35
commands: [tar, gzip, gunzip, bzip2, xz, zip, unzip, dd]
quiz:
  - q: Khác nhau giữa tar và gzip là gì?
    options: ["Không khác gì", "tar gom nhiều file thành một, gzip nén một file cho nhỏ", "tar nén, gzip giải nén", "tar dùng cho Windows"]
    answer: 1
    explain: "`tar` chỉ gói (archive) nhiều file và thư mục thành một file `.tar`, không làm nhỏ đi. `gzip` nén một file. Hai việc thường đi chung: `tar -czf` gói rồi nén bằng gzip thành `.tar.gz`."
  - q: "Giải nén file `backup.tar.gz` vào thư mục `/tmp/khoi-phuc` dùng lệnh nào?"
    options: ["tar -czf backup.tar.gz /tmp/khoi-phuc", "tar -xzf backup.tar.gz -C /tmp/khoi-phuc", "gunzip backup.tar.gz /tmp/khoi-phuc", "tar -tzf backup.tar.gz"]
    answer: 1
    explain: "`-x` giải nén, `-z` qua gzip, `-f` chỉ tên file, `-C` chọn thư mục đích (phải tồn tại sẵn). `-c` là tạo mới, `-t` là chỉ liệt kê."
  - q: Xem trong file .tar.gz có những gì mà không giải nén, dùng tuỳ chọn nào?
    options: ["-x", "-c", "-t", "-v"]
    answer: 2
    explain: "`-t` (list) liệt kê nội dung. Thêm `-v` để thấy cả quyền, chủ, dung lượng, thời gian."
  - q: Sau khi chạy `gzip a.log`, file a.log gốc còn không?
    options: ["Còn, có thêm a.log.gz", "Không, bị thay bằng a.log.gz", "Bị xoá luôn cả hai", "Tuỳ dung lượng"]
    answer: 1
    explain: "`gzip` thay file gốc bằng file nén. Muốn giữ file gốc thì thêm `-k` (keep)."
  - q: Với cùng một file log, thuật toán nào thường nén nhỏ nhất nhưng chậm nhất?
    options: ["gzip", "bzip2", "xz", "zip"]
    answer: 2
    explain: "Thứ tự thường gặp về độ nhỏ: xz < bzip2 < gzip. Tốc độ thì ngược lại, gzip nhanh nhất. Trong bài, file log 74 KB nén ra: gzip 4975 byte, bzip2 2563 byte, xz 1236 byte."
---

## Gói và nén là hai việc khác nhau

| Việc | Công cụ | Kết quả |
|---|---|---|
| **Gói** (archive): gom nhiều file và thư mục thành một file, giữ cấu trúc thư mục, quyền, chủ sở hữu | `tar` | `.tar` (không nhỏ đi) |
| **Nén** (compress): làm một file nhỏ lại | `gzip`, `bzip2`, `xz` | `.gz`, `.bz2`, `.xz` |
| Gói và nén cùng lúc | `tar` có tuỳ chọn nén, hoặc `zip` | `.tar.gz` (`.tgz`), `.tar.bz2`, `.tar.xz`, `.zip` |

Trên Linux, kiểu hay gặp nhất là `.tar.gz`: mã nguồn phần mềm, bản sao lưu, file tải về đều dùng kiểu này. `.zip` hay gặp khi trao đổi với người dùng Windows.

Tạo dữ liệu để làm theo:

```bash
cd ~
mkdir -p web/css
for i in $(seq 1 2000); do echo "dong log so $i: GET /index.html 200"; done > web/access.log
echo "body{}" > web/css/style.css
echo "<h1>Hi</h1>" > web/index.html
```

Dòng `for` ghi 2000 dòng giống nhau vào `web/access.log` để có một file log khoảng 74 KB (vòng lặp học ở bài [Vòng lặp](/bai/bash-vong-lap)).

## tar: tạo, xem, giải nén

`tar` có 3 việc chính, mỗi lần dùng chọn **một**:

| Tuỳ chọn | Việc |
|---|---|
| `-c` | Tạo file gói mới (**c**reate) |
| `-t` | Liệt kê nội dung (lis**t**) |
| `-x` | Giải nén ra (e**x**tract) |

Đi kèm các tuỳ chọn bổ trợ:

| Tuỳ chọn | Ý nghĩa |
|---|---|
| `-f tên` | Tên file gói (**f**ile). Luôn có, và để **cuối cùng** trong nhóm tuỳ chọn, vì ngay sau `f` phải là tên file |
| `-v` | In từng file đang xử lý (**v**erbose) |
| `-z` | Nén / giải nén qua gzip → `.tar.gz` |
| `-j` | Qua bzip2 → `.tar.bz2` |
| `-J` | Qua xz → `.tar.xz` |
| `-C thư-mục` | Làm việc trong thư mục khác: giải nén vào đó, hoặc lấy file từ đó |

### Tạo

```bash
tar -czf web.tar.gz web
```

| Phần | Ý nghĩa |
|---|---|
| `tar` | Lệnh gói |
| `-c` | Tạo mới |
| `-z` | Nén bằng gzip |
| `-f web.tar.gz` | Tên file kết quả |
| `web` | Thư mục (hoặc nhiều file, thư mục) cần gói |

So sánh cùng dữ liệu với các kiểu nén:

```bash
tar -cf web.tar web
tar -cjf web.tar.bz2 web
tar -cJf web.tar.xz web
ls -l web.tar*
```

```text
-rw-r--r-- 1 hocvien hocvien 81920 Nov 27 15:06 web.tar
-rw-r--r-- 1 hocvien hocvien  2731 Nov 27 15:06 web.tar.bz2
-rw-r--r-- 1 hocvien hocvien  5331 Nov 27 15:06 web.tar.gz
-rw-r--r-- 1 hocvien hocvien  1384 Nov 27 15:06 web.tar.xz
```

File log toàn chữ lặp lại nên nén rất tốt: 80 KB chỉ còn 1–5 KB. Ảnh, video, file đã nén sẵn thì gần như không nhỏ đi được nữa.

Bỏ bớt file khi gói bằng `--exclude`:

```bash
tar -czf nolog.tar.gz --exclude="*.log" web
```

### Xem bên trong

```bash
tar -tzf web.tar.gz
tar -tvzf web.tar.gz
```

```text
web/
web/index.html
web/access.log
web/css/
web/css/style.css
```

Có `-v` thì in thêm quyền, chủ, dung lượng, thời gian:

```text
drwxr-xr-x hocvien/hocvien   0 2026-11-27 15:06 web/
-rw-r--r-- hocvien/hocvien  12 2026-11-27 15:06 web/index.html
-rw-r--r-- hocvien/hocvien 74893 2026-11-27 15:06 web/access.log
...
```

> **Luôn xem trước khi giải nén file lạ.** Có file gói chứa sẵn đường dẫn kiểu `web/...`, giải nén ra sẽ tạo thư mục `web`. Có file lại chứa file nằm ngay ở gốc, giải nén ra sẽ bày đầy thư mục hiện tại.

### Giải nén

```bash
mkdir giai
tar -xzf web.tar.gz -C giai
find giai
```

| Phần | Ý nghĩa |
|---|---|
| `-x` | Giải nén |
| `-z` | Qua gzip |
| `-f web.tar.gz` | File cần giải nén |
| `-C giai` | Giải nén vào thư mục `giai` (phải có sẵn). Không có `-C` thì giải nén vào thư mục hiện tại |

```text
giai
giai/web
giai/web/index.html
giai/web/access.log
giai/web/css
giai/web/css/style.css
```

Chỉ lấy một file: ghi đường dẫn **đúng như trong `tar -t`** ở cuối lệnh: `tar -xzf web.tar.gz -C giai web/index.html`.

`tar` bản mới tự nhận ra kiểu nén khi **giải nén**, nên `tar -xf file.tar.xz` cũng chạy được, không cần nhớ `-z`/`-j`/`-J`. Khi **tạo**, dùng `-a` để `tar` chọn kiểu nén theo đuôi tên file: `tar -caf web.tar.xz web`.

### Mẹo nhớ

| Câu cần nhớ | Lệnh |
|---|---|
| **C**reate **z**ip **f**ile | `tar -czf ten.tar.gz thư-mục` |
| e**X**tract **z**ip **f**ile | `tar -xzf ten.tar.gz` |
| lis**T** **z**ip **f**ile | `tar -tzf ten.tar.gz` |

## gzip, bzip2, xz: nén một file

```bash
gzip -v a.log
gunzip a.log.gz
gzip -k a.log
gzip -l a.log.gz
```

| Lệnh | Làm gì |
|---|---|
| `gzip -v a.log` | Nén thành `a.log.gz`, **xoá file gốc**. `-v` in tỉ lệ nén |
| `gunzip a.log.gz` | Giải nén, trả lại `a.log` (giống `gzip -d`) |
| `gzip -k a.log` | Nén nhưng giữ (**k**eep) file gốc |
| `gzip -l a.log.gz` | Xem dung lượng trước và sau khi nén |

```text
a.log:	 93.4% -- replaced with a.log.gz
         compressed        uncompressed  ratio uncompressed_name
               4975               74893  93.4% a.log
```

`bzip2` / `bunzip2` và `xz` / `unxz` dùng giống hệt (`-k`, `-d`, `-v`). So sánh cùng file log:

| Công cụ | Đuôi | Dung lượng (từ 74893 byte) | Đặc điểm |
|---|---|---|---|
| `gzip` | `.gz` | 4975 | Nhanh nhất, phổ biến nhất |
| `bzip2` | `.bz2` | 2563 | Nhỏ hơn, chậm hơn |
| `xz` | `.xz` | 1236 | Nhỏ nhất, chậm nhất. Hay dùng để phát hành phần mềm |

Ba công cụ này **chỉ nén từng file**, không gom được thư mục. Muốn nén thư mục thì dùng `tar` kèm `-z`/`-j`/`-J`.

## zip và unzip

```bash
zip -r web.zip web
unzip -l web.zip
unzip -q web.zip -d z
```

| Phần | Ý nghĩa |
|---|---|
| `zip -r web.zip web` | Tạo `web.zip` chứa thư mục `web`. `-r` để lấy cả thư mục con |
| `unzip -l web.zip` | Liệt kê nội dung (**l**ist) |
| `unzip -q web.zip -d z` | Giải nén vào thư mục `z` (**d**irectory, tự tạo nếu chưa có), `-q` không in từng file |

```text
Archive:  web.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
        0  2026-11-27 15:06   web/
       12  2026-11-27 15:06   web/index.html
    74893  2026-11-27 15:06   web/access.log
...
```

Trên Ubuntu, nếu chưa có thì cài bằng `sudo apt install zip unzip`. Khác `tar`: file zip không giữ chủ sở hữu và một số quyền của Linux. Vì vậy sao lưu trên server nên dùng `tar`.

## dd: chép từng byte (biết qua)

`dd` chép dữ liệu thô từng khối. Hay dùng để tạo file có dung lượng cố định, hoặc ghi file ISO ra USB.

```bash
dd if=/dev/zero of=zero.img bs=1M count=5
```

| Phần | Ý nghĩa |
|---|---|
| `if=/dev/zero` | Nguồn đọc (**i**nput **f**ile). `/dev/zero` cho ra byte 0 vô tận |
| `of=zero.img` | Nơi ghi (**o**utput **f**ile) |
| `bs=1M` | Mỗi khối 1 MB (**b**lock **s**ize) |
| `count=5` | Chép 5 khối, tức 5 MB |

```text
5+0 records in
5+0 records out
5242880 bytes (5.2 MB, 5.0 MiB) copied, 0.00494366 s, 1.1 GB/s
```

> `dd` ghi đè không hỏi. Ghi nhầm `of=/dev/sda` là mất cả ổ đĩa. Chỉ dùng khi hiểu rõ mình đang ghi vào đâu.

## Thực hành

1. Sao lưu thư mục `~/web` thành file `web-NGAY.tar.gz`, trong đó NGAY là ngày hôm nay dạng `2026-11-27`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   tar -czf web-$(date +%F).tar.gz web
   ls web-*.tar.gz
   ```

   `$(date +%F)` được shell thay bằng ngày hiện tại dạng năm-tháng-ngày. Đây là cách đặt tên file sao lưu rất hay dùng.

   </details>

2. Không giải nén, cho biết file vừa tạo có chứa `web/css/style.css` không.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   tar -tzf web-*.tar.gz | grep style.css
   ```

   </details>

3. Xoá `~/web/index.html`, rồi khôi phục **chỉ file đó** từ bản sao lưu.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   rm ~/web/index.html
   tar -xzf web-*.tar.gz web/index.html
   cat web/index.html
   ```

   Đứng ở `~` nên file được giải nén về đúng `~/web/index.html`.

   </details>

4. Tạo bản sao lưu **không chứa file `.log`** bằng xz, so sánh dung lượng với bản gzip có log.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   tar -cJf web-nolog.tar.xz --exclude="*.log" web
   ls -l web-*.tar.*
   ```

   </details>

5. Tạo file `bao-cao.zip` chứa thư mục `web`, giải nén nó vào `/tmp/bc`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   zip -r bao-cao.zip web
   unzip bao-cao.zip -d /tmp/bc
   ls /tmp/bc/web
   ```

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Gói và nén thư mục | `tar -czf ten.tar.gz thư-mục` (`-j` bzip2, `-J` xz) |
| Xem bên trong | `tar -tzf ten.tar.gz` |
| Giải nén vào thư mục | `tar -xf ten.tar.gz -C đích` |
| Nén một file, giữ bản gốc | `gzip -k file` |
| Giải nén `.gz` | `gunzip file.gz` |
| Zip / unzip | `zip -r ten.zip thư-mục` / `unzip ten.zip -d đích` |
