---
summary: Ba bit quyền đặc biệt — SUID (chạy chương trình bằng quyền của chủ file, như passwd), SGID (file tạo trong thư mục chung tự mang nhóm của thư mục), sticky bit (trong /tmp không ai xoá được file của người khác). Cách đặt bằng chmod, cách tìm file SUID để kiểm tra bảo mật, và biết qua ACL.
minutes: 30
commands: [chmod u+s, chmod g+s, chmod +t, find -perm, setfacl, getfacl]
quiz:
  - q: "Vì sao user thường chạy `passwd` sửa được /etc/shadow, một file chỉ root ghi được?"
    options: ["Vì passwd có bit SUID, chạy bằng quyền của chủ file là root", "Vì /etc/shadow có quyền 777", "Vì passwd tự gọi sudo", "Vì user thường thuộc nhóm shadow"]
    answer: 0
    explain: "`/usr/bin/passwd` có quyền `-rwsr-xr-x`, chủ là root. Chữ `s` ở vị trí x của chủ là SUID: ai chạy cũng mang quyền root trong lúc chương trình chạy."
  - q: "`/tmp` có quyền `drwxrwxrwt`. Chữ `t` cuối cho phép gì?"
    options: ["Ai cũng xoá được mọi file", "Ai cũng tạo được file, nhưng chỉ chủ file (hoặc chủ thư mục, root) mới xoá hay đổi tên được file đó", "File trong /tmp tự xoá sau 1 giờ", "Chỉ root được tạo file"]
    answer: 1
    explain: Không có sticky bit, ai có quyền ghi trên thư mục đều xoá được file của người khác. Sticky bit chặn điều đó.
  - q: Thư mục /srv/chung thuộc nhóm webteam, có SGID. User binh (nhóm chính binh) tạo file trong đó. File mang nhóm nào?
    options: ["binh", "webteam", "root", "Không có nhóm"]
    answer: 1
    explain: Bình thường file mang nhóm chính của người tạo. SGID trên thư mục làm file mới mang nhóm của thư mục, nên cả nhóm cùng làm việc được.
  - q: "`chmod 2775 /srv/chung` đặt bit đặc biệt nào?"
    options: ["SUID", "SGID", "Sticky bit", "Không bit nào"]
    answer: 1
    explain: "Chữ số đầu là các bit đặc biệt: 4 = SUID, 2 = SGID, 1 = sticky. 2775 là SGID cộng quyền 775."
  - q: "Thấy `-rwSr--r--` (chữ S hoa) nghĩa là gì?"
    options: ["SUID đang hoạt động bình thường", "Có bit SUID nhưng chủ file không có quyền x, nên SUID vô tác dụng", "File bị hỏng", "File của root"]
    answer: 1
    explain: "Chữ thường `s`/`t` là có cả bit đặc biệt lẫn `x`. Chữ hoa `S`/`T` là có bit đặc biệt nhưng thiếu `x` bên dưới, thường là đặt nhầm."
---

Ngoài `rwx`, mỗi file còn có ba bit đặc biệt. Chúng hiện ra ở vị trí chữ `x` trong `ls -l`.

| Bit | Số | Ký hiệu | Đặt trên | Tác dụng |
|---|---|---|---|---|
| SUID | 4 | `s` ở vị trí x của **chủ** | File chương trình | Chạy bằng quyền của **chủ file** thay vì người chạy |
| SGID | 2 | `s` ở vị trí x của **nhóm** | Chương trình / **thư mục** | Chương trình: chạy bằng quyền của nhóm file. Thư mục: file tạo bên trong mang nhóm của thư mục |
| Sticky | 1 | `t` ở vị trí x của **người khác** | Thư mục | Chỉ chủ file mới xoá hay đổi tên được file của mình |

## SUID: chạy bằng quyền của chủ file

User thường đổi được mật khẩu của mình, tức là ghi được vào `/etc/shadow`, trong khi file đó chỉ root ghi được. Bí mật nằm ở đây:

```bash
ls -l /usr/bin/passwd
stat -c "%a %A %n" /usr/bin/passwd
```

```text
-rwsr-xr-x 1 root root  64152 May 30  2024 /usr/bin/passwd
4755 -rwsr-xr-x /usr/bin/passwd
```

| Phần | Ý nghĩa |
|---|---|
| `rws` (chủ) | Chữ `s` thay chỗ `x`: có SUID và có quyền chạy |
| `root` | Chủ file là root, nên ai chạy `passwd` cũng mang quyền root trong lúc nó chạy |
| `4755` | Chữ số đầu `4` là SUID |

`passwd` tự kiểm tra để bạn chỉ đổi được mật khẩu của chính mình. `sudo`, `su`, `mount` cũng dùng SUID.

**SUID là điểm nhạy cảm về bảo mật**: một chương trình SUID root có lỗi là kẻ tấn công lên được root. Vì vậy:

- Không bao giờ tự đặt SUID cho script hay chương trình tự viết (kernel Linux cũng bỏ qua SUID trên script).
- Định kỳ kiểm tra danh sách file SUID, phát hiện file lạ.

```bash
find / -perm -4000 -type f 2>/dev/null
```

| Phần | Ý nghĩa |
|---|---|
| `-perm -4000` | File có bit SUID (dấu `-` nghĩa là "có ít nhất các bit này") |
| `-type f` | Chỉ file |
| `2>/dev/null` | Bỏ lỗi quyền |

```text
/usr/bin/passwd
/usr/bin/umount
/usr/bin/mount
/usr/bin/gpasswd
/usr/bin/chsh
/usr/bin/newgrp
/usr/bin/su
/usr/bin/chfn
/usr/bin/at
/usr/bin/sudo
```

Đây là danh sách bình thường của Ubuntu. Thấy một file SUID nằm trong `/tmp` hay trong home của ai đó là dấu hiệu bị xâm nhập.

## SGID trên thư mục: làm việc chung trong nhóm

Tình huống: nhóm `webteam` cùng sửa mã nguồn trong `/srv/chung`. Bình thường file mỗi người tạo ra mang **nhóm chính của người đó**, nên người khác trong nhóm không sửa được. SGID trên thư mục giải quyết việc này.

Chạy bằng root để dựng thử:

```bash
sudo groupadd webteam
sudo useradd -m binh
sudo usermod -aG webteam binh
sudo mkdir /srv/chung
sudo chown root:webteam /srv/chung
sudo chmod 775 /srv/chung
sudo -u binh touch /srv/chung/khong-sgid.txt
sudo chmod 2775 /srv/chung
sudo -u binh touch /srv/chung/co-sgid.txt
ls -ld /srv/chung
ls -l /srv/chung
```

```text
drwxrwsr-x 2 root webteam 4096 Nov 27 15:15 /srv/chung
-rw-rw-r-- 1 binh webteam 0 Nov 27 15:15 co-sgid.txt
-rw-rw-r-- 1 binh binh    0 Nov 27 15:15 khong-sgid.txt
```

| Dòng | Ý nghĩa |
|---|---|
| `drwxrwsr-x` | Chữ `s` ở vị trí x của nhóm: thư mục có SGID |
| `khong-sgid.txt` | Tạo trước khi bật SGID: mang nhóm `binh` (nhóm chính của người tạo) |
| `co-sgid.txt` | Tạo sau khi bật SGID: mang nhóm `webteam` của thư mục |

Thư mục con tạo bên trong cũng tự có SGID, nên quy tắc áp cho cả cây.

## Sticky bit: không xoá file của người khác

Ở [bài trước](/bai/phan-quyen-file): ai có quyền ghi trên thư mục thì xoá được **mọi** file trong đó, kể cả file của người khác. `/tmp` cho mọi người ghi, vậy ai cũng xoá được file tạm của nhau? Không, nhờ sticky bit:

```bash
ls -ld /tmp
```

```text
drwxrwxrwt 2 root root 4096 Nov 10 21:56 /tmp
```

Chữ `t` cuối là sticky bit (dạng số `1777`). Thử với thư mục của mình:

```bash
sudo mkdir /srv/tam
sudo chmod 1777 /srv/tam
sudo -u binh touch /srv/tam/cua-binh
rm -f /srv/tam/cua-binh
```

```text
rm: cannot remove '/srv/tam/cua-binh': Operation not permitted
```

Bỏ sticky bit (`sudo chmod 0777 /srv/tam`) thì `hocvien` xoá được file của `binh`.

## Đặt và gỡ bit đặc biệt

| Dạng chữ | Dạng số | Làm gì |
|---|---|---|
| `chmod u+s file` | `chmod 4755 file` | Bật SUID |
| `chmod g+s thư-mục` | `chmod 2775 thư-mục` | Bật SGID |
| `chmod +t thư-mục` | `chmod 1777 thư-mục` | Bật sticky |
| `chmod u-s`, `g-s`, `-t` | chữ số đầu là `0` | Gỡ |

Chữ số đầu là tổng các bit đặc biệt, ví dụ `6755` là SUID + SGID.

**Chữ hoa `S`, `T`** nghĩa là có bit đặc biệt nhưng **thiếu quyền `x`** bên dưới, nên bit đó vô tác dụng:

```text
-rw-r-Sr-- 1 hocvien hocvien    0 Nov 27 15:15 k
drwxrwx--T 2 hocvien hocvien 4096 Nov 27 15:15 t
```

## ACL: cấp quyền cho từng người (biết qua)

`rwx` chỉ chia được cho một chủ, một nhóm, và những người còn lại. Muốn cấp riêng cho thêm một user mà không đổi nhóm thì dùng **ACL** (Access Control List):

```bash
touch acl.txt
setfacl -m u:binh:r acl.txt
ls -l acl.txt
getfacl acl.txt
```

```text
-rw-r--r--+ 1 hocvien hocvien 0 Nov 27 15:15 acl.txt
# file: acl.txt
# owner: hocvien
# group: hocvien
user::rw-
user:binh:r--
group::r--
mask::r--
other::r--
```

| Phần | Ý nghĩa |
|---|---|
| `setfacl -m u:binh:r` | Thêm (**m**odify) quyền đọc cho user `binh` |
| `+` cuối chuỗi quyền | Dấu hiệu file có ACL |
| `getfacl` | Xem đầy đủ ACL |
| `setfacl -x u:binh acl.txt` | Gỡ ACL của `binh` |

ACL ít dùng hằng ngày. Chỉ cần nhận ra dấu `+` trong `ls -l` và biết lệnh xem là `getfacl`.

## Thực hành

1. Tìm mọi file có SGID trong `/usr/bin`. Chúng thuộc nhóm nào?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   find /usr/bin -perm -2000 -type f -exec ls -l {} +
   ```

   Ví dụ `chage` thuộc nhóm `shadow` (để đọc `/etc/shadow`), `crontab` thuộc nhóm `crontab`.

   </details>

2. Tạo thư mục dùng chung `/srv/duan` cho nhóm `duan`: thành viên nhóm đọc ghi được, file mới tự mang nhóm `duan`, người ngoài không vào được.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo groupadd duan
   sudo usermod -aG duan hocvien
   sudo mkdir /srv/duan
   sudo chown root:duan /srv/duan
   sudo chmod 2770 /srv/duan
   ls -ld /srv/duan
   ```

   Kết quả `drwxrws---`. `hocvien` phải đăng nhập lại (hoặc `newgrp duan`) thì nhóm mới có hiệu lực.

   </details>

3. Tạo thư mục `/srv/nop-bai` mà ai cũng nộp được file vào, nhưng không ai xoá được bài của người khác.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo mkdir /srv/nop-bai
   sudo chmod 1777 /srv/nop-bai
   ls -ld /srv/nop-bai
   ```

   </details>

4. Cho biết các quyền sau có bit đặc biệt nào: `-rwsr-xr-x`, `drwxrwsr-x`, `drwxrwxrwt`, `-rwxr-sr-x`. Viết dạng số.

   <details>
   <summary>Xem đáp án</summary>

   SUID 4755. SGID trên thư mục 2775. Sticky 1777. SGID trên file 2755.

   </details>

## Tóm tắt

| Bit | Thấy ở | Ví dụ thật | Đặt bằng |
|---|---|---|---|
| SUID (4) | `rws------` | `/usr/bin/passwd` | `chmod u+s` |
| SGID (2) | `---rws---` | thư mục làm việc chung | `chmod g+s` |
| Sticky (1) | `------rwt` | `/tmp` | `chmod +t` |
| Tìm file SUID | | | `find / -perm -4000 -type f 2>/dev/null` |
| ACL | dấu `+` trong `ls -l` | | `setfacl -m u:tên:r file`, `getfacl file` |
