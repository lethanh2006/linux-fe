---
summary: Linux không có ổ C, ổ D. Mọi file nằm trong một cây bắt đầu từ thư mục gốc /. Bài này giải thích từng thư mục chính chứa gì, các loại file và ký hiệu d, l, c, b, s, p, file ẩn, đường dẫn tuyệt đối và tương đối.
minutes: 30
commands: [tree -L 1 /, ls -l, ls -a]
quiz:
  - q: File cấu hình của hệ thống và ứng dụng thường nằm ở thư mục nào?
    options: ["/bin", "/home", "/var", "/etc"]
    answer: 3
    explain: "`/etc` chứa cấu hình, ví dụ `/etc/hosts`, `/etc/passwd`. `/var` chứa dữ liệu hay thay đổi như log, `/home` chứa dữ liệu của từng người dùng."
  - q: Cắm USB vào máy Linux, thiết bị USB xuất hiện dưới dạng file trong thư mục nào?
    options: ["/dev", "/usr", "/opt", "/tmp"]
    answer: 0
    explain: "`/dev` (device) chứa file đại diện cho thiết bị phần cứng: ổ đĩa `/dev/sda`, USB `/dev/sdb`…"
  - q: Trong kết quả `ls -l`, dòng bắt đầu bằng chữ `l` là gì?
    options: ["File chỉ đọc", "Liên kết (link) trỏ tới file khác", "File log", "Thư mục rỗng"]
    answer: 1
    explain: "Ký tự đầu là loại file: `-` file thường, `d` thư mục, `l` link, `c` thiết bị ký tự, `b` thiết bị khối, `s` socket, `p` pipe."
  - q: File `.bashrc` không hiện ra khi gõ `ls`. Vì sao?
    options: ["Vì file bị khoá", "Vì file nằm ở thư mục khác", "Vì tên bắt đầu bằng dấu chấm nên là file ẩn", "Vì file rỗng"]
    answer: 2
    explain: "Tên bắt đầu bằng `.` là file ẩn. Dùng `ls -a` để thấy."
  - q: Đường dẫn nào là đường dẫn tuyệt đối?
    options: ["du-an/src", "../docs", "/var/log/syslog", "./app.sh"]
    answer: 2
    explain: Đường dẫn tuyệt đối bắt đầu bằng `/` (gốc cây), đúng dù bạn đang đứng ở đâu. Các đường dẫn còn lại tính từ thư mục hiện tại.
---

> Bài này đi theo video TITV bài 6.

## Một cây duy nhất

Windows chia ổ `C:`, `D:`, mỗi ổ một cây thư mục. Linux thì khác: **mọi thứ nằm trong một cây** bắt đầu từ thư mục gốc, viết là `/` (đọc là "root" hoặc "gốc"). Ổ đĩa thứ hai hay USB đều được gắn vào một thư mục nào đó trong cây này.

Linux còn có câu "**mọi thứ đều là file**": tài liệu, chương trình, thư mục, cả ổ đĩa và bàn phím đều được biểu diễn như file.

Xem các thư mục ngay dưới gốc bằng `tree`:

```bash
tree -L 1 /
```

| Phần | Ý nghĩa |
|---|---|
| `tree` | Vẽ cây thư mục. Ubuntu chưa cài sẵn, cài bằng `sudo apt install tree` (bài 8 học `sudo`) |
| `-L 1` | Chỉ vẽ 1 cấp (**L**evel) |
| `/` | Bắt đầu từ thư mục gốc |

```text
/
├── bin -> usr/bin
├── bin.usr-is-merged
├── boot
├── dev
├── etc
├── home
├── lib -> usr/lib
├── lib.usr-is-merged
├── lib64 -> usr/lib64
├── media
├── mnt
├── opt
├── proc
├── root
├── run
├── sbin -> usr/sbin
├── sbin.usr-is-merged
├── srv
├── sys
├── tmp
├── usr
└── var

23 directories, 0 files
```

Máy cài Ubuntu desktop có thể có thêm vài mục như `snap`, `cdrom`, `lost+found`, `swap.img`. Dấu `->` nghĩa là đường tắt (link): `bin -> usr/bin` là `/bin` trỏ tới `/usr/bin`. Các mục `*.usr-is-merged` chỉ là dấu vết khi Ubuntu gộp `/bin` vào `/usr/bin`, không cần để ý.

## Các thư mục chính

| Thư mục | Chứa gì | Ví dụ |
|---|---|---|
| `/bin` | Các lệnh cơ bản cần để khởi động và dùng hệ thống | `ls`, `cp`, `bash` |
| `/boot` | File khởi động máy: kernel, trình nạp khởi động GRUB | `/boot/vmlinuz-...` |
| `/dev` | File đại diện cho thiết bị phần cứng. Cắm USB, thẻ nhớ thì chúng xuất hiện ở đây | `/dev/sda` (ổ đĩa), `/dev/null` |
| `/etc` | **Cấu hình** của hệ thống và ứng dụng | `/etc/hosts`, `/etc/passwd` |
| `/home` | Thư mục riêng của từng người dùng | `/home/hocvien` |
| `/root` | Thư mục riêng của tài khoản root (không nằm trong `/home`) | |
| `/lib`, `/lib64` | Thư viện dùng chung cho các chương trình | |
| `/opt` | Phần mềm bên thứ ba cài nguyên khối; có người đặt cả website ở đây | `/opt/google/chrome` |
| `/tmp` | File tạm, ai cũng ghi được, bị xoá khi khởi động lại | |
| `/usr` | Chương trình, thư viện, tài liệu dùng chung cho mọi người dùng | `/usr/bin`, `/usr/share/man` |
| `/var` | Dữ liệu **thay đổi** thường xuyên | `/var/log` (nhật ký), `/var/www` (web) |

> **Ba thư mục cần nhớ đầu tiên:** `/etc` (cấu hình), `/var/log` (nhật ký), `/home` (dữ liệu người dùng). Một chương trình chạy lỗi, bạn sẽ mở cấu hình ở `/etc` và đọc nhật ký ở `/var/log`.

## Các loại file

Linux chia file thành ba nhóm:

| Nhóm | Là gì |
|---|---|
| File thường (regular file) | Văn bản, ảnh, chương trình… |
| Thư mục (directory) | File đặc biệt chứa danh sách các file khác |
| File đặc biệt (special file) | Thiết bị, link, socket, pipe. Phần lớn nằm trong `/dev` |

Lệnh `ls -l` (bài 10) cho biết loại file bằng **ký tự đầu tiên** của mỗi dòng:

```bash
ls -ld /etc /etc/hostname /bin /dev/null
```

| Phần | Ý nghĩa |
|---|---|
| `ls` | Liệt kê file |
| `-l` | Dạng dài, mỗi file một dòng (**l**ong) |
| `-d` | Với thư mục thì in chính thư mục đó, không in nội dung bên trong (**d**irectory) |

```text
lrwxrwxrwx 1 root root    7 Apr 22  2024 /bin -> usr/bin
crw-rw-rw- 1 root root 1, 3 Nov 27 19:14 /dev/null
drwxr-xr-x 1 root root 4096 Nov 27 19:14 /etc
-rw-r--r-- 1 root root    7 Nov 27 19:14 /etc/hostname
```

| Ký tự đầu | Loại | Ví dụ |
|---|---|---|
| `-` | File thường | `/etc/hostname` |
| `d` | Thư mục (**d**irectory) | `/etc` |
| `l` | Link, đường tắt tới file khác (bài 32) | `/bin -> usr/bin` |
| `c` | Thiết bị ký tự (**c**haracter device), đọc ghi từng ký tự: bàn phím, terminal | `/dev/null`, `/dev/tty` |
| `b` | Thiết bị khối (**b**lock device), đọc ghi từng khối: ổ đĩa, USB | `/dev/sda` |
| `s` | Socket, cửa để các chương trình nói chuyện với nhau | `/run/systemd/journal/stdout` |
| `p` | Pipe có tên (named **p**ipe), ống chuyền dữ liệu giữa hai chương trình | tạo bằng `mkfifo` |

Trên một máy Ubuntu thật, ổ đĩa và socket trông như sau:

```text
brw-rw---- 1 root disk 8, 0 Nov 27 12:34 /dev/sda
srw-rw-rw- 1 root root    0 Nov 27 12:34 /run/systemd/journal/stdout
```

Chín ký tự sau ký tự đầu (`rwxr-xr-x`…) là quyền truy cập, học ở bài 30.

## File và thư mục ẩn

Tên bắt đầu bằng dấu chấm `.` là **file ẩn**. Thường đó là file cấu hình riêng của người dùng, ví dụ `.bashrc`. Lệnh `ls` không hiện chúng; thêm `-a` (**a**ll) để thấy:

```bash
ls ~
ls -a ~
```

```text
.
..
.bash_logout
.bashrc
.profile
```

`ls ~` không in gì vì thư mục nhà còn trống, nhưng `ls -a ~` thấy năm mục. `.` là chính thư mục này, `..` là thư mục cha. Hai mục này thư mục nào cũng có.

## Đường dẫn tuyệt đối và tương đối

**Đường dẫn** là địa chỉ của một file trong cây. Các cấp ngăn nhau bằng dấu `/`.

| Loại | Bắt đầu bằng | Tính từ đâu | Ví dụ |
|---|---|---|---|
| **Tuyệt đối** | `/` | Từ gốc cây. Đúng dù bạn đang đứng ở đâu | `/home/hocvien/du-an/README.md` |
| **Tương đối** | Tên thư mục, `.` hoặc `..` | Từ thư mục đang đứng | `du-an/README.md`, `../docs` |

Ví dụ với cây sau:

```text
/home/hocvien/du-an
├── README.md
├── docs
└── src
    └── app.sh
```

Đang đứng ở `/home/hocvien/du-an/src`:

| Muốn tới | Tuyệt đối | Tương đối |
|---|---|---|
| `app.sh` | `/home/hocvien/du-an/src/app.sh` | `app.sh` hoặc `./app.sh` |
| `README.md` | `/home/hocvien/du-an/README.md` | `../README.md` |
| Thư mục `docs` | `/home/hocvien/du-an/docs` | `../docs` |

> **Dấu gạch:** Linux dùng gạch chéo `/`, Windows dùng gạch ngược `\` (ví dụ `C:\Users`). Linux cũng **phân biệt chữ hoa, chữ thường**: `Docs` và `docs` là hai thư mục khác nhau.

## Mở rộng (chuẩn LPIC-1)

Chuẩn LPIC-1 mục 104.7 yêu cầu biết cách các bản Linux xếp thư mục. Cách xếp này có tên là **FHS** (Filesystem Hierarchy Standard). Nhờ chuẩn chung, vào máy Linux nào bạn cũng biết file nằm đâu. Thêm vài thư mục video chưa nói:

| Thư mục | Chứa gì |
|---|---|
| `/sbin` | Lệnh quản trị hệ thống (thường cần root), nay trỏ tới `/usr/sbin` |
| `/usr/local` | Phần mềm bạn **tự cài** (không qua `apt`), ví dụ `/usr/local/bin` |
| `/proc`, `/sys` | File ảo do kernel tạo ra, cho biết tiến trình và phần cứng, ví dụ `/proc/cpuinfo` (bài 25) |
| `/run` | Dữ liệu lúc máy chạy (số tiến trình, socket), mất khi tắt máy |
| `/mnt`, `/media` | Chỗ gắn ổ đĩa tạm thời, chỗ gắn USB tự động |
| `/srv` | Dữ liệu máy chủ phục vụ ra ngoài (web, FTP) |

## Thực hành

1. Dùng `tree` vẽ 1 cấp của `/etc`, đếm xem có bao nhiêu thư mục và file.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   tree -L 1 /etc
   ```

   Dòng cuối kết quả, dạng `... directories, ... files`, cho biết số thư mục và số file.

   </details>

2. Xem loại file của `/dev/null`, `/home` và `/lib`. Mỗi cái thuộc loại gì?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ls -ld /dev/null /home /lib
   ```

   `/dev/null` bắt đầu bằng `c` (thiết bị ký tự), `/home` bắt đầu bằng `d` (thư mục), `/lib` bắt đầu bằng `l` (link, trỏ tới `usr/lib`).

   </details>

3. Thư mục nhà của bạn có những file ẩn nào?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ls -a ~
   ```

   Thường có `.bashrc`, `.profile`, `.bash_logout`, cùng hai mục `.` và `..`.

   </details>

4. Đang đứng ở `/var/log`. Viết đường dẫn tuyệt đối và tương đối tới file `/etc/hosts`.

   <details>
   <summary>Xem đáp án</summary>

   Tuyệt đối: `/etc/hosts`. Tương đối: `../../etc/hosts` (lên hai cấp tới `/`, rồi vào `etc`).

   </details>

## Tóm tắt

| Ý | Ghi nhớ |
|---|---|
| Thư mục gốc | `/`, mọi file nằm trong một cây |
| `/etc`, `/var/log`, `/home` | Cấu hình, nhật ký, dữ liệu người dùng |
| `/dev` | File đại diện cho thiết bị |
| Loại file | `-` thường, `d` thư mục, `l` link, `c` ký tự, `b` khối, `s` socket, `p` pipe |
| File ẩn | Tên bắt đầu bằng `.`, xem bằng `ls -a` |
| Đường dẫn tuyệt đối | Bắt đầu bằng `/` |
| Đường dẫn tương đối | Tính từ chỗ đang đứng; `..` là thư mục cha |
