---
summary: Linux xếp mọi file vào một cây duy nhất bắt đầu từ /. Bài này giải thích từng thư mục chính chứa gì (chuẩn FHS), đường dẫn tuyệt đối và tương đối, cách đi lại bằng cd, và đọc từng cột của ls -l.
minutes: 40
commands: [pwd, cd, ls, tree]
quiz:
  - q: File cấu hình của hệ thống (ví dụ cấu hình nginx, ssh) thường nằm ở đâu?
    options: ["/bin", "/etc", "/var", "/home"]
    answer: 1
    explain: "`/etc` chứa file cấu hình toàn hệ thống, ví dụ `/etc/nginx/`, `/etc/ssh/sshd_config`. `/var` chứa dữ liệu thay đổi liên tục như log, `/home` chứa dữ liệu của từng user."
  - q: Log của hệ thống và các dịch vụ thường nằm ở thư mục nào?
    options: ["/tmp", "/var/log", "/etc/log", "/usr/log"]
    answer: 1
    explain: "`/var` (variable) chứa dữ liệu thay đổi khi hệ thống chạy, trong đó `/var/log` chứa log."
  - q: Bạn đang ở /home/hocvien/du-an/src. Lệnh cd ../.. đưa bạn tới đâu?
    options: ["/home", "/home/hocvien", "/home/hocvien/du-an", "/"]
    answer: 1
    explain: "`..` là thư mục cha. Từ `src` lên một cấp là `du-an`, lên thêm một cấp nữa là `/home/hocvien`."
  - q: Đường dẫn nào là đường dẫn tuyệt đối?
    options: ["du-an/src", "./app.sh", "/var/log/syslog", "../docs"]
    answer: 2
    explain: Đường dẫn tuyệt đối luôn bắt đầu bằng `/` (gốc cây), nên đúng dù bạn đang đứng ở đâu. Các đường dẫn còn lại là tương đối, tính từ thư mục hiện tại.
  - q: Muốn thấy cả file ẩn (tên bắt đầu bằng dấu chấm) như .bashrc thì dùng tuỳ chọn nào của ls?
    options: ["-l", "-a", "-h", "-R"]
    answer: 1
    explain: "`-a` (all) hiện cả file ẩn, kể cả `.` và `..`. `-l` là dạng dài, `-h` là dung lượng dễ đọc, `-R` là liệt kê đệ quy vào thư mục con."
  - q: "Trong dòng `drwxr-xr-x 2 root root 4096 Nov 10 21:48 media`, ký tự `d` đầu tiên cho biết gì?"
    options: ["File đã bị xoá", "Đây là thư mục", "File của root", "File chạy được"]
    answer: 1
    explain: "Ký tự đầu là loại file: `-` là file thường, `d` là thư mục (directory), `l` là liên kết tượng trưng (link)."
---

## Một cây duy nhất

Windows có ổ `C:`, `D:`. Linux không có ổ đĩa riêng rẽ như vậy. **Mọi thứ nằm trong một cây** bắt đầu từ thư mục gốc `/` (root directory). Ổ đĩa thứ hai, USB hay ổ mạng đều được "gắn" (mount) vào một thư mục nào đó trong cây này. Cách gắn ổ được học ở bài [mount và fstab](/bai/mount-va-fstab).

Trên Linux, gần như mọi thứ đều được biểu diễn như file: tài liệu, chương trình, thư mục, thậm chí ổ đĩa (`/dev/sda`) hay thông tin tiến trình (`/proc`).

## Các thư mục chính (chuẩn FHS)

Các bản phân phối xếp thư mục theo cùng một chuẩn, gọi là **FHS** (Filesystem Hierarchy Standard). Nhờ đó, vào máy Linux nào bạn cũng biết file nằm đâu.

```bash
ls /
```

```text
bin                etc                lib64  proc  sbin.usr-is-merged  usr
bin.usr-is-merged  home               media  root  srv                 var
boot               lib                mnt    run   sys
dev                lib.usr-is-merged  opt    sbin  tmp
```

| Thư mục | Chứa gì | Ví dụ bạn sẽ gặp |
|---|---|---|
| `/etc` | **Cấu hình** của hệ thống và dịch vụ (file chữ, sửa được) | `/etc/nginx/`, `/etc/ssh/sshd_config`, `/etc/passwd`, `/etc/hosts` |
| `/home` | Thư mục riêng của từng user | `/home/hocvien` |
| `/root` | Thư mục home của user root (không nằm trong `/home`) | |
| `/var` | Dữ liệu **thay đổi** khi hệ thống chạy | `/var/log` (log), `/var/lib/postgresql` (dữ liệu database), `/var/www` (web) |
| `/tmp` | File tạm, ai cũng ghi được, thường bị xoá khi khởi động lại | |
| `/usr` | Chương trình và thư viện cài từ bản phân phối (chỉ đọc khi chạy) | `/usr/bin/ls`, `/usr/lib`, `/usr/share/man` |
| `/usr/local` | Phần mềm bạn **tự cài** (không qua `apt`) | `/usr/local/bin` |
| `/opt` | Phần mềm của bên thứ ba, cài nguyên khối | `/opt/google/chrome` |
| `/bin`, `/sbin` | Chương trình cơ bản / chương trình quản trị | Trên Ubuntu mới, đây chỉ là đường tắt tới `/usr/bin`, `/usr/sbin` |
| `/lib`, `/lib64` | Thư viện dùng chung | Cũng là đường tắt tới `/usr/lib`, `/usr/lib64` |
| `/boot` | Kernel và file khởi động (GRUB) | `/boot/vmlinuz-...` |
| `/dev` | File đại diện cho thiết bị | `/dev/sda` (ổ đĩa), `/dev/null` (thùng rác) |
| `/proc`, `/sys` | File ảo do kernel tạo ra, cho biết thông tin tiến trình và phần cứng | `/proc/cpuinfo`, `/proc/meminfo` |
| `/run` | Dữ liệu lúc chạy (PID, socket), mất khi tắt máy | |
| `/mnt`, `/media` | Chỗ gắn ổ đĩa tạm / USB | |
| `/srv` | Dữ liệu do máy chủ phục vụ ra ngoài (ít dùng) | |

> **Ba thư mục cần nhớ đầu tiên:** `/etc` (cấu hình), `/var/log` (log), `/home` (dữ liệu user). Khi một dịch vụ lỗi, bạn sẽ mở cấu hình ở `/etc` và đọc log ở `/var/log`.

Các mục `bin.usr-is-merged`… chỉ là dấu vết của việc Ubuntu gộp `/bin` vào `/usr/bin`. Bạn không cần để ý chúng.

## Đường dẫn tuyệt đối và tương đối

**Đường dẫn** là địa chỉ của một file trong cây, các cấp cách nhau bằng `/`.

| Loại | Bắt đầu bằng | Tính từ đâu | Ví dụ |
|---|---|---|---|
| **Tuyệt đối** | `/` | Gốc cây. Đúng dù bạn đang đứng ở đâu | `/home/hocvien/du-an/README.md` |
| **Tương đối** | Tên thư mục, `.` hoặc `..` | Thư mục hiện tại | `du-an/README.md`, `../docs` |

Các ký hiệu đặc biệt:

| Ký hiệu | Nghĩa |
|---|---|
| `.` | Thư mục hiện tại |
| `..` | Thư mục cha (lên một cấp) |
| `~` | Thư mục home của bạn (`/home/hocvien`) |
| `~user` | Thư mục home của user khác, ví dụ `~root` là `/root` |
| `-` | (Chỉ dùng với `cd`) thư mục vừa đứng trước đó |

Ví dụ với cây sau:

```text
/home/hocvien/du-an
|-- README.md
|-- docs
`-- src
    `-- app.sh
```

Đang đứng ở `/home/hocvien/du-an/src`:

| Muốn tới | Tuyệt đối | Tương đối |
|---|---|---|
| `app.sh` | `/home/hocvien/du-an/src/app.sh` | `app.sh` hoặc `./app.sh` |
| `README.md` | `/home/hocvien/du-an/README.md` | `../README.md` |
| thư mục `docs` | `/home/hocvien/du-an/docs` | `../docs` |

## pwd: đang đứng ở đâu

```bash
pwd
```

| Phần | Ý nghĩa |
|---|---|
| `pwd` | In thư mục hiện tại (**p**rint **w**orking **d**irectory) dưới dạng đường dẫn tuyệt đối |

```text
/home/hocvien
```

## cd: đi tới thư mục khác

```bash
cd /var/log
cd ..
cd -
cd
```

| Lệnh | Đi tới | Kết quả `pwd` sau mỗi lệnh |
|---|---|---|
| `cd /var/log` | Thư mục `/var/log` (đường dẫn tuyệt đối) | `/var/log` |
| `cd ..` | Thư mục cha | `/var` |
| `cd -` | Thư mục vừa đứng trước đó (và in nó ra) | `/var/log` |
| `cd` | Không có đối số: về thư mục home | `/home/hocvien` |
| `cd ~` | Cũng là về home | `/home/hocvien` |

`cd` tới thư mục không tồn tại sẽ báo `No such file or directory`. Dùng phím `Tab` để điền tên thư mục, đỡ gõ sai.

## ls: xem trong thư mục có gì

```bash
ls
ls /etc
ls -la ~
```

| Tuỳ chọn | Ý nghĩa |
|---|---|
| (không có) | Liệt kê thư mục hiện tại, chỉ tên |
| `-l` | Dạng dài (**l**ong): quyền, chủ, dung lượng, thời gian |
| `-a` | Hiện cả file ẩn (**a**ll). File ẩn là file có tên bắt đầu bằng `.` |
| `-h` | Dung lượng dễ đọc (**h**uman): `13K`, `2.1M` thay vì số byte. Đi cùng `-l` |
| `-t` | Sắp theo thời gian sửa, mới nhất lên đầu |
| `-r` | Đảo ngược thứ tự (**r**everse) |
| `-S` | Sắp theo dung lượng, lớn nhất lên đầu |
| `-R` | Liệt kê cả thư mục con, đệ quy (**R**ecursive) |
| `-d` | Hiện chính thư mục đó, không liệt kê bên trong (`ls -ld /etc`) |
| `-1` | Mỗi file một dòng |

```bash
ls -la ~
```

```text
total 20
drwxr-x--- 2 hocvien hocvien 4096 Nov 27 14:46 .
drwxr-xr-x 1 root    root    4096 Nov 27 14:46 ..
-rw-r--r-- 1 hocvien hocvien  220 Mar 31  2024 .bash_logout
-rw-r--r-- 1 hocvien hocvien 3771 Mar 31  2024 .bashrc
-rw-r--r-- 1 hocvien hocvien  807 Mar 31  2024 .profile
```

Ba file `.bash_logout`, `.bashrc`, `.profile` là file ẩn, nên `ls` trơn không hiện. Chúng là file cấu hình shell của bạn.

### Đọc một dòng ls -l

Lấy dòng `-rw-r--r-- 1 hocvien hocvien 3771 Mar 31  2024 .bashrc`:

| Cột | Giá trị | Ý nghĩa |
|---|---|---|
| 1 (ký tự đầu) | `-` | Loại file: `-` file thường, `d` thư mục, `l` liên kết tượng trưng |
| 1 (9 ký tự sau) | `rw-r--r--` | Quyền của chủ / nhóm / người khác. Học kỹ ở bài [Phân quyền](/bai/phan-quyen-file) |
| 2 | `1` | Số liên kết cứng (hard link). Với thư mục là số mục con trỏ tới nó |
| 3 | `hocvien` | User sở hữu file |
| 4 | `hocvien` | Nhóm sở hữu file |
| 5 | `3771` | Dung lượng, tính bằng byte. Thêm `-h` để có dạng `3.7K` |
| 6 | `Mar 31  2024` | Thời gian sửa lần cuối. Nếu trong 6 tháng gần đây thì hiện giờ, ví dụ `Nov 27 14:46` |
| 7 | `.bashrc` | Tên file |

Dòng `total 20` ở đầu là tổng dung lượng các file, tính bằng khối 1 KB.

Một dòng có loại `l`:

```bash
ls -l /bin
```

```text
lrwxrwxrwx 1 root root 7 Apr 22  2024 /bin -> usr/bin
```

`/bin -> usr/bin` nghĩa là `/bin` là đường tắt (symbolic link) trỏ tới `/usr/bin`.

## tree: xem cây thư mục

`tree` vẽ cây thư mục cho dễ nhìn. Nó không có sẵn trên mọi máy (trên Ubuntu cài bằng `sudo apt install tree`).

```bash
mkdir -p ~/du-an/{src,docs}
touch ~/du-an/src/app.sh ~/du-an/README.md
tree ~/du-an
```

| Phần | Ý nghĩa |
|---|---|
| `mkdir -p` | Tạo thư mục, `-p` tạo luôn các thư mục cha nếu chưa có |
| `~/du-an/{src,docs}` | Dấu `{ }` được shell bung thành hai đường dẫn `~/du-an/src` và `~/du-an/docs` |
| `touch` | Tạo file rỗng (nếu chưa có) |
| `tree ~/du-an` | Vẽ cây thư mục `du-an` |

```text
/home/hocvien/du-an
|-- README.md
|-- docs
`-- src
    `-- app.sh

3 directories, 2 files
```

## Thực hành

1. Đi tới `/var/log`, in ra thư mục hiện tại, liệt kê các file dạng dài với dung lượng dễ đọc, file mới sửa nhất nằm cuối.

   <details>
   <summary>Xem cách làm</summary>

   ```bash
   cd /var/log
   pwd
   ls -lhtr
   ```

   `-t` sắp theo thời gian (mới nhất lên đầu), thêm `-r` để đảo ngược, file mới nhất xuống cuối, ngay trên dấu nhắc.

   </details>

2. Từ `/var/log`, về thư mục home bằng 3 cách khác nhau.

   <details>
   <summary>Xem đáp án</summary>

   `cd`, `cd ~`, `cd /home/hocvien`. Cách thứ tư là đường dẫn tương đối `cd ../../home/hocvien`.

   </details>

3. Tạo cây `du-an` như trong bài. Đứng ở `~/du-an/src`, dùng **đường dẫn tương đối** để liệt kê thư mục `docs` và xem file `README.md` có trong `du-an` hay không.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   cd ~/du-an/src
   ls ../docs
   ls -l ../README.md
   ```

   </details>

4. Không mở tài liệu, trả lời: muốn sửa cấu hình SSH thì vào thư mục nào? Database PostgreSQL lưu dữ liệu ở đâu? Phần mềm tự biên dịch nên cài vào đâu? Sau đó kiểm tra bằng `ls -d /etc/ssh /usr/local/bin`.

   <details>
   <summary>Xem đáp án</summary>

   Cấu hình SSH ở `/etc/ssh/`. Dữ liệu database ở `/var/lib/postgresql/` (thuộc `/var` vì thay đổi liên tục). Phần mềm tự cài vào `/usr/local/` hoặc `/opt/`.

   </details>

5. Liệt kê thông tin của **chính** thư mục `/etc` (không liệt kê bên trong). Ai là chủ? Đây là file hay thư mục?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ls -ld /etc
   ```

   Kết quả `drwxr-xr-x 1 root root 4096 ... /etc`: ký tự đầu `d` cho biết là thư mục, chủ là `root`, nhóm `root`.

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Đang ở đâu | `pwd` |
| Đi tới thư mục | `cd đường-dẫn` |
| Lên một cấp / về home / quay lại chỗ cũ | `cd ..` / `cd` / `cd -` |
| Liệt kê, kể cả file ẩn, dạng dài | `ls -la` |
| Xem file mới sửa nhất (nằm cuối) | `ls -ltr` |
| Xem thông tin chính thư mục | `ls -ld thư-mục` |
| Xem cây thư mục | `tree` |
