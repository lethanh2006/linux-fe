---
summary: Phần lớn chương trình không chứa hết mã của mình mà dùng chung các thư viện (.so) với chương trình khác. Bài này giải thích thư viện dùng chung, xem một chương trình cần thư viện nào (ldd), sửa lỗi "error while loading shared libraries" bằng ldconfig hoặc LD_LIBRARY_PATH.
minutes: 20
commands: [ldd, ldconfig, ldconfig -p, LD_LIBRARY_PATH, /etc/ld.so.conf]
quiz:
  - q: "Chạy một chương trình thì báo `error while loading shared libraries: libcurl.so.4: cannot open shared object file`. Nghĩa là gì?"
    options: ["Chương trình bị hỏng", "Không tìm thấy thư viện dùng chung libcurl.so.4 mà chương trình cần", "Thiếu quyền chạy", "Hết RAM"]
    answer: 1
    explain: "Trình nạp (ld.so) không tìm thấy file thư viện ở các thư mục nó biết. Cài gói chứa thư viện đó, hoặc báo cho trình nạp biết thư mục chứa nó."
  - q: Lệnh nào liệt kê các thư viện dùng chung mà /usr/bin/curl cần?
    options: ["ldconfig curl", "ldd /usr/bin/curl", "file /usr/bin/curl", "rpm -ql curl"]
    answer: 1
    explain: "`ldd` in từng thư viện kèm đường dẫn tìm được, hoặc `not found` nếu thiếu."
  - q: Vừa thêm thư mục /opt/app/lib vào /etc/ld.so.conf.d/app.conf, phải làm gì để có hiệu lực?
    options: ["Khởi động lại máy", "Chạy sudo ldconfig", "Chạy ldd", "Không cần gì"]
    answer: 1
    explain: "`ldconfig` đọc lại danh sách thư mục và dựng lại bộ nhớ đệm `/etc/ld.so.cache` mà trình nạp dùng để tìm thư viện nhanh."
  - q: LD_LIBRARY_PATH dùng khi nào?
    options: ["Luôn đặt cho mọi user", "Tạm thời chỉ thêm thư mục thư viện cho một lệnh hoặc một phiên, không cần quyền root", "Để cài thư viện", "Để xoá thư viện"]
    answer: 1
    explain: "Ví dụ `LD_LIBRARY_PATH=/opt/lib ./app`. Hợp để thử nghiệm. Cấu hình lâu dài nên dùng `/etc/ld.so.conf.d/` và `ldconfig`."
---

## Thư viện dùng chung là gì

Rất nhiều chương trình cần cùng một chức năng: đọc ghi file, mã hoá, nén, gọi HTTP. Thay vì mỗi chương trình tự mang một bản, chức năng đó nằm trong **thư viện dùng chung** (shared library), là file đuôi `.so` (**s**hared **o**bject, giống `.dll` trên Windows). Nhiều chương trình cùng nạp một file thư viện khi chạy.

| Lợi ích | Ý nghĩa |
|---|---|
| Tiết kiệm | Một bản trên đĩa và trong RAM cho mọi chương trình |
| Vá một lần | Lỗi bảo mật trong OpenSSL chỉ cần cập nhật gói thư viện, mọi chương trình dùng nó được vá theo (sau khi khởi động lại chương trình) |

Ngược lại, chương trình **liên kết tĩnh** (static) gói hết thư viện vào trong file, chạy được ở mọi nơi nhưng to hơn. Ví dụ các chương trình viết bằng Go thường là liên kết tĩnh.

Tên thư viện có quy ước:

```bash
ls -l /lib/x86_64-linux-gnu/libz.so*
```

```text
lrwxrwxrwx 1 root root     11 Oct 22 03:56 /lib/x86_64-linux-gnu/libz.so.1 -> libz.so.1.3
-rw-r--r-- 1 root root 113000 Oct 22 03:56 /lib/x86_64-linux-gnu/libz.so.1.3
```

| Tên | Là gì |
|---|---|
| `libz.so.1.3` | File thật, phiên bản đầy đủ |
| `libz.so.1` | Symlink theo **phiên bản chính** (soname). Chương trình ghi nhớ tên này, nên thư viện được nâng cấp lên `1.4` mà chương trình không cần biên dịch lại |

## ldd: chương trình cần thư viện nào

```bash
ldd /usr/bin/ls
```

```text
	linux-vdso.so.1 (0x00007703ae0d1000)
	libselinux.so.1 => /lib/x86_64-linux-gnu/libselinux.so.1 (0x00007703ae074000)
	libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007703ade61000)
	libpcre2-8.so.0 => /lib/x86_64-linux-gnu/libpcre2-8.so.0 (0x00007703addc7000)
	/lib64/ld-linux-x86-64.so.2 (0x00007703ae0d3000)
```

| Dòng | Ý nghĩa |
|---|---|
| `libc.so.6 => /lib/.../libc.so.6` | Thư viện chương trình cần `=>` file tìm được trên máy |
| `libc.so.6` | Thư viện C chuẩn, hầu như chương trình nào cũng cần |
| `/lib64/ld-linux-x86-64.so.2` | **Trình nạp động** (dynamic loader): chương trình chạy trước, đi tìm và nạp các thư viện khác |
| `linux-vdso.so.1` | Thư viện ảo do kernel cung cấp, không có file thật |
| `(0x...)` | Địa chỉ nạp trong bộ nhớ, mỗi lần chạy một khác |

> Chỉ chạy `ldd` với chương trình bạn tin tưởng. Với một số file độc hại, `ldd` có thể khiến mã trong đó chạy. Kiểm tra file lạ thì dùng `file` hoặc `objdump -p`.

## Trình nạp tìm thư viện ở đâu

Thứ tự tìm:

1. Thư mục trong biến môi trường `LD_LIBRARY_PATH` (nếu có).
2. Bộ nhớ đệm `/etc/ld.so.cache`, được dựng từ các thư mục ghi trong `/etc/ld.so.conf` và `/etc/ld.so.conf.d/*.conf`.
3. Các thư mục mặc định `/lib`, `/usr/lib` (và bản 64-bit).

```bash
cat /etc/ld.so.conf
cat /etc/ld.so.conf.d/*.conf
```

```text
include /etc/ld.so.conf.d/*.conf
/usr/local/lib
/usr/local/lib/x86_64-linux-gnu
/lib/x86_64-linux-gnu
/usr/lib/x86_64-linux-gnu
```

## ldconfig: cập nhật bộ nhớ đệm

```bash
ldconfig -p | head -3
ldconfig -p | grep libz
```

```text
147 libs found in cache `/etc/ld.so.cache'
	libzstd.so.1 (libc6,x86-64) => /lib/x86_64-linux-gnu/libzstd.so.1
	libz.so.1 (libc6,x86-64) => /lib/x86_64-linux-gnu/libz.so.1
```

| Lệnh | Làm gì |
|---|---|
| `ldconfig -p` | In các thư viện có trong bộ nhớ đệm (**p**rint) |
| `sudo ldconfig` | Quét lại các thư mục, tạo symlink soname còn thiếu, dựng lại `/etc/ld.so.cache` |

Trình quản lý gói tự chạy `ldconfig` sau khi cài thư viện. Bạn chỉ cần chạy tay khi **tự cài** thư viện vào chỗ khác (ví dụ biên dịch từ mã nguồn vào `/usr/local/lib`, hoặc phần mềm mang thư viện riêng trong `/opt`).

## Sửa lỗi thiếu thư viện

Tái hiện lỗi bằng cách chuyển thư viện của `curl` sang chỗ khác (chỉ làm trên máy thử nghiệm, vì nó làm hỏng `curl`):

```bash
sudo mkdir /opt/lib
sudo mv /lib/x86_64-linux-gnu/libcurl.so.4* /opt/lib/
sudo ldconfig
curl --version
ldd /usr/bin/curl | grep "not found"
```

```text
curl: error while loading shared libraries: libcurl.so.4: cannot open shared object file: No such file or directory
	libcurl.so.4 => not found
```

Ba cách sửa, tuỳ tình huống:

| Cách | Lệnh | Khi nào dùng |
|---|---|---|
| Cài gói chứa thư viện | `sudo apt install libcurl4t64` (tìm tên gói bằng `apt-file search libcurl.so.4` hoặc `dnf provides '*/libcurl.so.4'`) | Thư viện có trong kho. **Cách nên dùng nhất** |
| Thêm thư mục cho cả hệ thống | `echo /opt/lib \| sudo tee /etc/ld.so.conf.d/opt.conf` rồi `sudo ldconfig` | Phần mềm tự mang thư viện riêng trong một thư mục |
| Tạm thời cho một lệnh | `LD_LIBRARY_PATH=/opt/lib curl --version` | Thử nghiệm, không cần root |

Sau cách thứ hai:

```text
	libcurl.so.4 (libc6,x86-64) => /opt/lib/libcurl.so.4
curl 8.5.0 (x86_64-pc-linux-gnu) libcurl
```

## Thực hành

1. Chương trình `/usr/bin/ssh` cần những thư viện nào? Có thư viện nào về mã hoá không?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ldd /usr/bin/ssh
   ```

   Có `libcrypto.so.3` (OpenSSL) dùng để mã hoá.

   </details>

2. Thư viện `libc.so.6` thực chất là file nào? Thuộc gói nào?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ls -l /lib/x86_64-linux-gnu/libc.so.6
   readlink -f /lib/x86_64-linux-gnu/libc.so.6
   dpkg -S $(readlink -f /lib/x86_64-linux-gnu/libc.so.6)
   ```

   File thật là `/usr/lib/x86_64-linux-gnu/libc.so.6`, thuộc gói `libc6`. Phải đưa đường dẫn thật cho `dpkg -S`. Hỏi bằng `/lib/...` sẽ báo `no path found`, vì trên Ubuntu mới `/lib` chỉ là symlink tới `/usr/lib` ([bài 6](/bai/cay-thu-muc)).

   </details>

3. Trên máy thử nghiệm, chạy bằng root: tái hiện lỗi thiếu `libcurl.so.4` như trong bài, rồi sửa bằng cả `LD_LIBRARY_PATH` lẫn `/etc/ld.so.conf.d/`.

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Chương trình cần thư viện nào | `ldd /đường/dẫn/chương-trình` |
| Thư viện trong bộ nhớ đệm | `ldconfig -p` |
| Thêm thư mục thư viện lâu dài | file trong `/etc/ld.so.conf.d/` rồi `sudo ldconfig` |
| Thêm tạm cho một lệnh | `LD_LIBRARY_PATH=/thư/mục lệnh` |
| Lỗi hay gặp | `error while loading shared libraries: X: cannot open shared object file` |
