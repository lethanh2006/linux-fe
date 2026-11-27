---
summary: Mỗi file và thư mục có quyền đọc, ghi, chạy (r, w, x) cho ba đối tượng là chủ, nhóm và người khác. Bài này đọc chuỗi quyền trong ls -l, hiểu r, w, x khác nhau ra sao với file và thư mục, và đổi quyền sang dạng số như 755, 644.
minutes: 35
commands: [ls -l, stat -c %a, umask]
quiz:
  - q: "Chuỗi quyền `rwxr-x---` dạng số là bao nhiêu?"
    options: ["750", "755", "640", "570"]
    answer: 0
    explain: "rwx = 4+2+1 = 7, r-x = 4+0+1 = 5, --- = 0. Ghép lại 750."
  - q: "Quyền `x` trên một **thư mục** cho phép gì?"
    options: ["Chạy thư mục như chương trình", "Đi vào thư mục (cd) và truy cập file bên trong", "Xoá thư mục", "Liệt kê tên file"]
    answer: 1
    explain: "Với thư mục: `r` là xem danh sách tên (ls), `w` là tạo, xoá, đổi tên file bên trong, `x` là đi vào và dùng file bên trong."
  - q: "Quyền đọc và thực thi (không ghi) có số là mấy?"
    options: ["6", "3", "5", "7"]
    answer: 2
    explain: "r = 4, x = 1, cộng lại 5. Đọc và ghi là 4 + 2 = 6."
  - q: "Trong `-rw-r----- 1 root shadow ... /etc/shadow`, người dùng thường (không thuộc nhóm shadow) có quyền gì?"
    options: ["Đọc", "Đọc và ghi", "Không có quyền gì", "Chỉ chạy"]
    answer: 2
    explain: "Ba ký tự cuối `---` là quyền của người khác: không có gì. Vì vậy `cat /etc/shadow` bị từ chối."
  - q: "Bạn có quyền đọc file `bi-mat.txt` của người khác. Điều nào đúng?"
    options: ["Không chép được vì không phải chủ", "Chép được, và bản chép thuộc về bạn, bạn tự đổi quyền bản chép được", "Chép được nhưng bản chép vẫn của chủ cũ", "Chỉ root mới chép được"]
    answer: 1
    explain: Có quyền đọc là đọc được nội dung, nên chép được. File mới do bạn tạo nên bạn là chủ. Vì vậy đừng cho người khác quyền đọc những gì không muốn bị chép.
---

> Bài này đi theo video TITV bài 30. Bài này đọc và hiểu quyền; bài 31 mới học lệnh đổi quyền.

## Vì sao cần phân quyền

Máy Linux có nhiều người dùng chung. Phân quyền giúp:

- **An toàn:** người khác không đọc được thư, mật khẩu, dữ liệu riêng của bạn; người dùng thường không sửa được file hệ thống.
- **Đúng trách nhiệm:** ai làm việc gì thì có đúng quyền cho việc đó, ví dụ nhóm kế toán sửa được sổ sách, nhóm khác chỉ được xem.

## Ba đối tượng, ba quyền

Mỗi file có một **chủ** (user, owner) và một **nhóm** sở hữu. Quyền chia cho ba đối tượng:

| Ký hiệu | Đối tượng | Là ai |
|---|---|---|
| `u` | Chủ (**u**ser) | Người sở hữu file, thường là người tạo ra nó |
| `g` | Nhóm (**g**roup) | Thành viên của nhóm sở hữu file |
| `o` | Người khác (**o**thers) | Tất cả những người còn lại |

Mỗi đối tượng có ba quyền: **r** (đọc), **w** (ghi), **x** (chạy). Dấu `-` là không có quyền đó.

## Đọc chuỗi quyền trong ls -l

```bash
mkdir -p ~/thuchanh/bai30 && cd ~/thuchanh/bai30
touch baocao.txt && mkdir tailieu
ls -l
```

```text
total 4
-rw-r--r-- 1 hocvien hocvien    0 Nov 27 19:49 baocao.txt
drwxr-xr-x 2 hocvien hocvien 4096 Nov 27 19:49 tailieu
```

Chuỗi 10 ký tự đầu dòng gồm **1 ký tự loại file** và **3 cụm, mỗi cụm 3 ký tự**:

| Phần | `-rw-r--r--` (baocao.txt) | `drwxr-xr-x` (tailieu) |
|---|---|---|
| Ký tự 1: loại | `-` file thường | `d` thư mục |
| Ký tự 2–4: chủ (`hocvien`) | `rw-` đọc, ghi | `rwx` đọc, ghi, vào |
| Ký tự 5–7: nhóm (`hocvien`) | `r--` chỉ đọc | `r-x` đọc, vào |
| Ký tự 8–10: người khác | `r--` chỉ đọc | `r-x` đọc, vào |

Ký tự loại file (bài 6): `-` file thường, `d` thư mục, `l` link, `b` thiết bị khối, `c` thiết bị ký tự, `p` pipe, `s` socket.

Tập đọc thêm, tách thành 3 cụm:

| Chuỗi | Chủ | Nhóm | Người khác |
|---|---|---|---|
| `rwxrw----` | đọc, ghi, chạy | đọc, ghi | không gì |
| `rw-r-----` | đọc, ghi | đọc | không gì |
| `rwxr-xr--` | đọc, ghi, chạy | đọc, chạy | đọc |

## r, w, x với file và với thư mục

Cùng một chữ nhưng nghĩa khác nhau tuỳ là file hay thư mục:

| Quyền | Với file | Với thư mục |
|---|---|---|
| `r` | Xem nội dung (`cat`, `less`, chép file) | Liệt kê tên các file bên trong (`ls`) |
| `w` | Sửa nội dung | Tạo, xoá, đổi tên file **bên trong**, kể cả file không phải của mình |
| `x` | Chạy file như một chương trình | Đi vào thư mục (`cd`) và dùng các file bên trong |

Vài điểm cần nhớ:

- Linux không dựa vào đuôi file để biết file có chạy được không (không có chuyện `.exe`). File chạy được là file có quyền `x`.
- Xoá một file là sửa **thư mục** chứa nó, nên quyền xoá file phụ thuộc quyền `w` của thư mục, không phải của file.
- Thư mục thường cần `r` và `x` đi cùng nhau.

Xem quyền một số file hệ thống:

```bash
ls -ld /etc /etc/passwd /etc/shadow /tmp
```

```text
drwxr-xr-x 1 root root    4096 Nov 27 19:49 /etc
-rw-r--r-- 1 root root    1099 Nov 27 19:49 /etc/passwd
-rw-r----- 1 root shadow   761 Nov 27 19:49 /etc/shadow
drwxrwxrwt 1 root root    4096 Nov 27 19:49 /tmp
```

`/etc/passwd` ai cũng đọc được (`r--` cho người khác). `/etc/shadow` người khác không có quyền gì (`---`), nên người dùng thường bị từ chối:

```bash
cat /etc/shadow
```

```text
cat: /etc/shadow: Permission denied
```

`/tmp` cho mọi người ghi (`rwx`), chữ `t` cuối là quyền đặc biệt, xem phần mở rộng.

## Quyền dạng số

Mỗi quyền có một giá trị: **r = 4, w = 2, x = 1**, không có = 0. Cộng lại cho từng đối tượng:

| Số | Quyền | Cách tính |
|---|---|---|
| 7 | `rwx` | 4 + 2 + 1 |
| 6 | `rw-` | 4 + 2 |
| 5 | `r-x` | 4 + 1 |
| 4 | `r--` | 4 |
| 0 | `---` | 0 |

Ghép ba số cho chủ, nhóm, người khác:

| Số | Chuỗi | Hay dùng cho |
|---|---|---|
| `755` | `rwxr-xr-x` | Thư mục, chương trình |
| `644` | `rw-r--r--` | File thường |
| `700` | `rwx------` | Thư mục riêng tư |
| `600` | `rw-------` | File bí mật (khoá SSH) |
| `760` | `rwxrw----` | |
| `664` | `rw-rw-r--` | File làm chung trong nhóm |
| `754` | `rwxr-xr--` | |

Xem quyền dạng số bằng `stat`:

```bash
stat -c %a baocao.txt
stat -c "%a %A %n" baocao.txt tailieu /etc/shadow
```

| Phần | Ý nghĩa |
|---|---|
| `stat` | Xem thông tin chi tiết của file |
| `-c` | Chỉ in theo định dạng tự chọn |
| `%a` | Quyền dạng số |
| `%A` | Quyền dạng chữ |
| `%n` | Tên file |

```text
644
644 -rw-r--r-- baocao.txt
755 drwxr-xr-x tailieu
640 -rw-r----- /etc/shadow
```

Trên Ubuntu, file mới tạo có quyền **644**, thư mục mới có quyền **755**.

## Quyền đọc là chép được

Có quyền đọc một file là đọc được nội dung, nên **chép được**. Bản chép do bạn tạo nên thuộc về bạn:

```bash
cp /etc/hosts banchep.txt
ls -l /etc/hosts banchep.txt
```

```text
-rw-r--r-- 1 root    root    166 Nov 27 19:25 /etc/hosts
-rw-r--r-- 1 hocvien hocvien 166 Nov 27 19:49 banchep.txt
```

File gốc của `root`, bản chép của `hocvien`. Chủ bản chép tự đổi quyền được, kể cả thêm quyền chạy. Vì vậy, file nào không muốn người khác có bản sao thì đừng cho họ quyền đọc.

## Mở rộng (chuẩn LPIC-1)

Chuẩn LPIC-1 mục 104.5 còn có:

| Mục | Nội dung |
|---|---|
| `umask` | "Mặt nạ" bớt quyền khi tạo file. Ubuntu là `0022`: file mới 666 − 022 = **644**, thư mục mới 777 − 022 = **755** |
| Quyền đặc biệt | SUID (`s` ở cụm chủ, như `/usr/bin/passwd`: `-rwsr-xr-x`), SGID (`s` ở cụm nhóm), sticky bit (`t` ở cuối, như `/tmp`). Học ở bài Quyền đặc biệt, phần mở rộng |
| root | Kernel không kiểm tra quyền `r`, `w` với root |
| Thứ tự kiểm tra | Bạn là chủ thì chỉ xét cụm chủ; không phải chủ mà thuộc nhóm thì xét cụm nhóm; còn lại xét cụm người khác |

```bash
umask
stat baocao.txt
```

```text
0022
  File: baocao.txt
  Size: 0         	Blocks: 0          IO Block: 4096   regular empty file
Device: 0,51	Inode: 29803233    Links: 1
Access: (0644/-rw-r--r--)  Uid: ( 1001/ hocvien)   Gid: ( 1001/ hocvien)
Access: 2026-11-27 19:49:47.925598525 +0700
Modify: 2026-11-27 19:49:47.925598525 +0700
Change: 2026-11-27 19:49:47.925598525 +0700
 Birth: 2026-11-27 19:49:47.925598525 +0700
```

`stat` không có `-c` in đủ: quyền, UID, GID, inode (bài 32), các mốc thời gian (bài 16).

## Thực hành

1. Đổi các chuỗi quyền sau ra số: `rwxr-x---`, `rw-rw-r--`, `r--------`.

   <details>
   <summary>Xem đáp án</summary>

   `750`, `664`, `400`.

   </details>

2. Đổi các số sau ra chuỗi: `711`, `640`, `777`.

   <details>
   <summary>Xem đáp án</summary>

   `rwx--x--x`, `rw-r-----`, `rwxrwxrwx`.

   </details>

3. Xem quyền dạng số của thư mục nhà bạn và của `/etc/hostname`. Ai đọc được chúng?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   stat -c "%a %A %U %n" ~ /etc/hostname
   ```

   Thư mục nhà trên Ubuntu 24.04 là `750`: chỉ bạn và nhóm của bạn vào được. `/etc/hostname` là `644`: ai cũng đọc được, chỉ root sửa.

   </details>

4. Một thư mục có quyền `rw-rw-rw-` (666). Mọi người có `cd` vào được không?

   <details>
   <summary>Xem đáp án</summary>

   Không. Thiếu `x` thì không đi vào thư mục được, dù có `r` và `w`.

   </details>

## Tóm tắt

| Ý | Ghi nhớ |
|---|---|
| Ba đối tượng | `u` chủ, `g` nhóm, `o` người khác |
| Ba quyền | `r` đọc, `w` ghi, `x` chạy hoặc vào thư mục |
| Chuỗi quyền | 1 ký tự loại + 3 cụm `rwx` |
| Dạng số | r = 4, w = 2, x = 1. `755`, `644`, `700`, `600` |
| Xem quyền | `ls -l`, `stat -c %a file` |
| Mặc định Ubuntu | File 644, thư mục 755, thư mục nhà 750 |
