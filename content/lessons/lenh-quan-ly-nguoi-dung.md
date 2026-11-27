---
summary: Tạo tài khoản bằng useradd, đặt mật khẩu bằng passwd, sửa và khoá bằng usermod, xoá bằng userdel, đặt thời hạn mật khẩu và tài khoản bằng chage. Mọi lệnh cần quyền root.
minutes: 40
commands: [useradd, passwd, usermod, userdel, chage]
quiz:
  - q: "`sudo useradd binh` xong, `/home/binh` không tồn tại. Vì sao?"
    options: ["useradd bị lỗi", "Thiếu -m nên useradd không tạo thư mục nhà", "Phải khởi động lại máy", "Thư mục nhà nằm ở /root"]
    answer: 1
    explain: "Trên Ubuntu, `useradd` không tạo thư mục nhà nếu thiếu `-m`. Lệnh `adduser` thì tạo luôn và hỏi mật khẩu."
  - q: Tuỳ chọn nào của useradd đặt nhóm phụ cho tài khoản mới?
    options: ["-g", "-G", "-s", "-c"]
    answer: 1
    explain: "`-g` là nhóm chính (một nhóm), `-G` là danh sách nhóm phụ."
  - q: "`sudo usermod -L chau` làm gì với `/etc/shadow`?"
    options: ["Xoá dòng của chau", "Thêm dấu ! trước mật khẩu mã hoá, khoá đăng nhập bằng mật khẩu", "Đổi shell thành nologin", "Đặt mật khẩu rỗng"]
    answer: 1
    explain: "`-L` (lock) thêm `!` trước chuỗi mã hoá nên không mật khẩu nào khớp. `-U` bỏ dấu `!`."
  - q: "`sudo userdel -r dung` khác `sudo userdel dung` ở đâu?"
    options: ["Không khác", "-r xoá luôn thư mục nhà và hộp thư của dung", "-r chỉ khoá tài khoản", "-r xoá cả nhóm sudo"]
    answer: 1
    explain: "Không có `-r`, tài khoản bị xoá nhưng thư mục nhà vẫn nằm lại."
  - q: "Tuỳ chọn nào của `chage` đặt số ngày bị khoá sau khi mật khẩu hết hạn?"
    options: ["-E", "-M", "-W", "-I"]
    answer: 3
    explain: "`-I` (inactive). `-E` là ngày tài khoản hết hạn, `-M` là số ngày tối đa của mật khẩu, `-W` là số ngày báo trước."
---

> Bài này đi theo video TITV bài 27. Chỉ tạo, sửa, xoá các tài khoản thử trong bài (`binh`, `chau`, `dung`); đừng thử trên tài khoản đang dùng.

Mọi lệnh quản trị tài khoản sửa file hệ thống nên cần root. Thiếu `sudo` sẽ bị từ chối:

```bash
useradd binh
```

```text
useradd: Permission denied.
useradd: cannot lock /etc/passwd; try again later.
```

Trong video, thầy chuyển hẳn sang root bằng `su root` rồi gõ lệnh không cần `sudo`. Ở đây dùng `sudo` trước từng lệnh (bài 8).

## useradd: tạo tài khoản

```text
useradd [tuỳ chọn] tên
```

| Tuỳ chọn | Ý nghĩa |
|---|---|
| `-c "chú thích"` | Mô tả, thường là họ tên đầy đủ (cột 5 của `/etc/passwd`) |
| `-m` | Tạo thư mục nhà, chép các file mẫu từ `/etc/skel` vào |
| `-d đường-dẫn` | Thư mục nhà khác mặc định `/home/tên` |
| `-u UID` | Chọn UID thay vì để hệ thống tự cấp |
| `-g nhóm` | Nhóm chính. Không ghi thì tạo nhóm mới trùng tên |
| `-G nhóm1,nhóm2` | Các nhóm phụ |
| `-s shell` | Shell đăng nhập, ví dụ `/bin/bash` |

### Thiếu -m thì không có thư mục nhà

```bash
sudo useradd -c "Tran Thi Binh" binh
tail -1 /etc/passwd
ls -ld /home/binh
```

```text
binh:x:1003:1003:Tran Thi Binh:/home/binh:/bin/sh
ls: cannot access '/home/binh': No such file or directory
```

`/etc/passwd` ghi thư mục nhà là `/home/binh` nhưng thư mục đó **chưa được tạo**, và shell mặc định là `/bin/sh` (đơn sơ hơn bash). Đây chính là chỗ video gặp: tạo xong tài khoản nhưng `cd /home/...` không vào được.

### Tạo đúng cách

```bash
sudo useradd -m -c "Pham Minh Chau" -s /bin/bash chau
tail -1 /etc/passwd
sudo ls -la /home/chau
```

```text
chau:x:1004:1004:Pham Minh Chau:/home/chau:/bin/bash
total 24
drwxr-x--- 2 chau chau 4096 Nov 27 19:46 .
drwxr-xr-x 1 root root 4096 Nov 27 19:46 ..
-rw-r--r-- 1 chau chau  220 Mar 31  2024 .bash_logout
-rw-r--r-- 1 chau chau 3771 Mar 31  2024 .bashrc
-rw-r--r-- 1 chau chau  807 Mar 31  2024 .profile
```

Thư mục nhà có sẵn ba file chép từ `/etc/skel`. Quyền `drwxr-x---` nghĩa là chỉ `chau` (và nhóm của `chau`) vào được, nên phải `sudo ls`.

Dùng nhiều tuỳ chọn cùng lúc:

```bash
sudo useradd -m -u 1500 -d /home/dung-home -s /bin/bash -G sudo dung
grep dung /etc/passwd
id dung
```

```text
dung:x:1500:1500::/home/dung-home:/bin/bash
uid=1500(dung) gid=1500(dung) groups=1500(dung),27(sudo)
```

UID là 1500 như yêu cầu, thư mục nhà là `/home/dung-home`, và `dung` thuộc nhóm phụ `sudo`.

## passwd: đặt mật khẩu

Tài khoản mới chưa có mật khẩu (cột 2 của `/etc/shadow` là `!`) nên chưa đăng nhập được:

```bash
sudo passwd chau
```

```text
New password:
Retype new password:
passwd: password updated successfully
```

Đặt mật khẩu xong, có thể đăng nhập bằng tài khoản mới: trên giao diện chọn **Switch User**, hoặc trong terminal gõ `su - chau`.

## usermod: sửa tài khoản

`usermod` dùng **cùng các tuỳ chọn** như `useradd` (`-c`, `-d`, `-g`, `-G`, `-s`, `-u`) để sửa tài khoản đã có, cộng thêm:

| Tuỳ chọn | Ý nghĩa |
|---|---|
| `-aG nhóm` | **Thêm** vào nhóm phụ, giữ các nhóm cũ. Thiếu `-a` thì danh sách nhóm phụ bị **thay** hẳn |
| `-L` | Khoá mật khẩu (**L**ock) |
| `-U` | Mở khoá (**U**nlock) |
| `-l tên-mới` | Đổi tên đăng nhập |

```bash
sudo usermod -c "Pham Minh Chau (KTPM)" -s /bin/sh chau
grep chau /etc/passwd
sudo usermod -aG sudo chau
id chau
```

```text
chau:x:1004:1004:Pham Minh Chau (KTPM):/home/chau:/bin/sh
uid=1004(chau) gid=1004(chau) groups=1004(chau),27(sudo)
```

### Khoá và mở khoá

```bash
sudo usermod -L chau
sudo grep ^chau: /etc/shadow | cut -c 1-40
sudo passwd -S chau
```

```text
chau:!$y$j9T$9ajYzaKa9g2GpTfmYrJEh0$YXSa
chau L 2026-11-27 0 99999 7 -1
```

`-L` thêm dấu `!` trước mật khẩu mã hoá, nên không mật khẩu nào khớp. `/etc/passwd` không thay đổi gì. `passwd -S` hiện `L` (locked). Mở khoá bằng `sudo usermod -U chau`: dấu `!` biến mất, `passwd -S` hiện `P`.

Khoá mật khẩu chỉ chặn đăng nhập **bằng mật khẩu**. Nếu tài khoản có SSH key thì vẫn vào được; muốn chặn hẳn, đặt ngày hết hạn tài khoản (`chage -E 0`, xem dưới) hoặc đổi shell thành `/usr/sbin/nologin`.

## userdel: xoá tài khoản

```bash
sudo userdel binh
sudo userdel -r dung
ls /home
```

```text
userdel: dung mail spool (/var/mail/dung) not found
an  chau  hocvien  ubuntu
```

| Lệnh | Kết quả |
|---|---|
| `userdel binh` | Xoá tài khoản, **giữ lại** thư mục nhà (nếu có) |
| `userdel -r dung` | Xoá tài khoản **và** thư mục nhà, hộp thư. Dòng báo "mail spool not found" chỉ là thông tin: `dung` chưa có hộp thư |

Nếu tài khoản đang có tiến trình chạy (đang đăng nhập), `userdel` từ chối và báo `user ... is currently used by process ...`. Phải đăng xuất hoặc dừng các tiến trình đó trước.

## chage: thời hạn mật khẩu và tài khoản

`chage` (**ch**ange **age**, không phải "change") đặt các cột 4–8 của `/etc/shadow`.

```bash
sudo chage -l chau
```

```text
Last password change					: Nov 27, 2026
Password expires					: never
Password inactive					: never
Account expires						: never
Minimum number of days between password change		: 0
Maximum number of days between password change		: 99999
Number of days of warning before password expires	: 7
```

| Tuỳ chọn | Ý nghĩa | Cột trong shadow |
|---|---|---|
| `-l` | Xem chính sách hiện tại (**l**ist) | |
| `-m số` | Số ngày tối thiểu giữa hai lần đổi mật khẩu | 4 |
| `-M số` | Số ngày tối đa mật khẩu còn hiệu lực | 5 |
| `-W số` | Báo trước bao nhiêu ngày khi sắp hết hạn | 6 |
| `-I số` | Hết hạn mật khẩu bao nhiêu ngày thì khoá hẳn (**I**nactive, chữ i hoa) | 7 |
| `-E ngày` | Ngày tài khoản hết hiệu lực, dạng `YYYY-MM-DD` | 8 |

```bash
sudo chage -E 2030-04-30 -m 5 -M 90 -I 10 -W 14 chau
sudo chage -l chau
sudo grep ^chau: /etc/shadow | cut -d: -f1,3-
```

```text
Last password change					: Nov 27, 2026
Password expires					: Feb 25, 2027
Password inactive					: Mar 07, 2027
Account expires						: Apr 30, 2030
Minimum number of days between password change		: 5
Maximum number of days between password change		: 90
Number of days of warning before password expires	: 14
chau:20784:5:90:14:10:22034:
```

Mật khẩu đổi ngày 27/11/2026, hiệu lực 90 ngày nên hết hạn 25/2/2027; quá 10 ngày nữa (7/3/2027) thì bị khoá. Tài khoản hết hiệu lực ngày 30/4/2030, lưu trong shadow là `22034` (số ngày kể từ 1/1/1970). Lệnh `cut -d: -f1,3-` bỏ cột 2 (mật khẩu mã hoá) cho gọn.

> Video gọi tuỳ chọn khoá sau hết hạn là `-l`; đúng ra là `-I` (chữ **i** hoa). `-l` là xem chính sách.

## Mở rộng (chuẩn LPIC-1)

| Lệnh, file | Ý nghĩa |
|---|---|
| `adduser tên` | Lệnh thân thiện của Debian/Ubuntu: tự tạo thư mục nhà, hỏi mật khẩu, họ tên. Dùng tay thì tiện; trong script thường dùng `useradd` |
| `/etc/skel` | File mẫu chép vào thư mục nhà mới khi có `-m` |
| `/etc/default/useradd` | Giá trị mặc định của `useradd` (shell, thư mục chứa nhà) |
| `passwd -l` / `-u` | Khoá / mở khoá mật khẩu, giống `usermod -L` / `-U` |
| `passwd -e tên` | Bắt đổi mật khẩu ở lần đăng nhập sau |
| `chage -E 0 tên` | Cho tài khoản hết hạn ngay, chặn mọi cách đăng nhập |
| `usermod -s /usr/sbin/nologin tên` | Không cho mở shell |

## Thực hành

Làm với tài khoản thử, xong thì xoá.

1. Tạo tài khoản `thu1` có thư mục nhà, shell bash, họ tên "Nguoi Thu Mot". Đặt mật khẩu, rồi đăng nhập thử bằng `su - thu1`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo useradd -m -s /bin/bash -c "Nguoi Thu Mot" thu1
   sudo passwd thu1
   su - thu1
   whoami
   exit
   ```

   </details>

2. Thêm `thu1` vào nhóm phụ `sudo` mà không mất nhóm cũ, kiểm tra bằng `id`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo usermod -aG sudo thu1
   id thu1
   ```

   </details>

3. Đặt cho `thu1`: mật khẩu hết hạn sau 60 ngày, báo trước 7 ngày, tài khoản hết hiệu lực ngày 31/12/2027. Xem lại chính sách.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo chage -M 60 -W 7 -E 2027-12-31 thu1
   sudo chage -l thu1
   ```

   </details>

4. Khoá `thu1`, xem dấu hiệu trong `/etc/shadow`, mở khoá, rồi xoá hẳn `thu1` cùng thư mục nhà.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo usermod -L thu1
   sudo grep ^thu1: /etc/shadow
   sudo usermod -U thu1
   sudo userdel -r thu1
   ```

   Khi khoá, cột mật khẩu bắt đầu bằng `!`.

   </details>

## Tóm tắt

| Lệnh | Làm gì |
|---|---|
| `useradd -m -s /bin/bash tên` | Tạo tài khoản có thư mục nhà |
| `useradd -c -u -d -g -G -s` | Họ tên, UID, thư mục nhà, nhóm chính, nhóm phụ, shell |
| `passwd tên` | Đặt mật khẩu |
| `usermod -aG nhóm tên` | Thêm nhóm phụ |
| `usermod -L` / `-U` | Khoá / mở khoá mật khẩu |
| `userdel -r tên` | Xoá tài khoản và thư mục nhà |
| `chage -l tên` | Xem thời hạn |
| `chage -m -M -W -I -E` | Tối thiểu, tối đa, báo trước, khoá sau hết hạn, ngày hết hiệu lực |
