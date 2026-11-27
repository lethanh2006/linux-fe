---
summary: Linux là hệ nhiều người dùng. Bài này giải thích tài khoản, UID, nhóm, tài khoản hệ thống và root, rồi đọc từng cột của hai file /etc/passwd và /etc/shadow.
minutes: 30
commands: [/etc/passwd, /etc/shadow, id, getent passwd, su]
quiz:
  - q: Tài khoản root có UID bằng bao nhiêu?
    options: ["1000", "0", "1", "65534"]
    answer: 1
    explain: "root luôn có UID = 0 và GID = 0. Người dùng thường trên Ubuntu bắt đầu từ UID 1000."
  - q: "File `/etc/passwd` mỗi dòng có mấy cột, ngăn bởi dấu gì?"
    options: ["7 cột, ngăn bởi dấu :", "9 cột, ngăn bởi dấu ,", "4 cột, ngăn bởi Tab", "7 cột, ngăn bởi dấu cách"]
    answer: 0
    explain: "Tên : mật khẩu (x) : UID : GID : mô tả : thư mục nhà : shell."
  - q: "Cột mật khẩu trong `/etc/passwd` ghi `x` nghĩa là gì?"
    options: ["Tài khoản bị khoá", "Mật khẩu là chữ x", "Mật khẩu (đã mã hoá) nằm trong /etc/shadow", "Không cần mật khẩu"]
    answer: 2
    explain: "`/etc/passwd` ai cũng đọc được, nên mật khẩu được chuyển sang `/etc/shadow`, chỉ root đọc."
  - q: "Trong `/etc/shadow`, cột mật khẩu là `!` hoặc `*` nghĩa là gì?"
    options: ["Mật khẩu rỗng", "Không đăng nhập bằng mật khẩu được (khoá hoặc chưa đặt)", "Mật khẩu là dấu !", "Tài khoản là root"]
    answer: 1
    explain: "Không có chuỗi mã hoá hợp lệ thì không mật khẩu nào khớp. Cột rỗng hẳn mới là không cần mật khẩu."
  - q: "Người dùng thường gõ `cat /etc/shadow` thì sao?"
    options: ["In ra mật khẩu dạng chữ thường", "Báo Permission denied", "Xoá file", "In ra file rỗng"]
    answer: 1
    explain: "Chỉ root (hoặc nhóm shadow) đọc được `/etc/shadow`. Dùng `sudo` để xem."
---

> Bài này đi theo video TITV bài 26. Bài này chỉ đọc và hiểu; bài 27 mới tạo, sửa, xoá tài khoản.

## Vì sao cần quản trị người dùng

Linux sinh ra cho máy chủ nhiều người dùng chung: mỗi người một tài khoản, mỗi tài khoản chỉ được làm đúng việc của mình. Máy để bàn cũng có thể có nhiều người dùng.

Có hai loại tài khoản:

| Loại | Dùng làm gì | Ví dụ |
|---|---|---|
| Người dùng thật | Người đăng nhập để làm việc | `hocvien`, `an` |
| Tài khoản hệ thống | Chạy dịch vụ, chương trình nền của hệ điều hành. Thường không đăng nhập được | `daemon`, `www-data` (máy chủ web), `nobody` |

**root** là tài khoản quản trị tối cao (super user): làm được mọi thứ, không đổi tên, không xoá được. Chỉ dùng root khi quản trị (bài 8).

Đặc điểm của tài khoản:

- **Tên đăng nhập** là duy nhất và phân biệt chữ hoa, chữ thường (`an` khác `An`).
- Mỗi tài khoản có một số **UID** (user ID). Hệ thống làm việc với UID, tên chỉ để người đọc.
- Mỗi tài khoản thuộc **một nhóm chính** và có thể thuộc **nhiều nhóm phụ** (bài 28). Ví dụ một giảng viên vừa thuộc nhóm khoa CNTT, vừa thuộc nhóm phòng đào tạo.
- **root có UID = 0, GID = 0.**

```bash
id
id root
```

```text
uid=1001(hocvien) gid=1001(hocvien) groups=1001(hocvien),27(sudo)
uid=0(root) gid=0(root) groups=0(root)
```

| Phần | Ý nghĩa |
|---|---|
| `uid=1001(hocvien)` | UID và tên tài khoản |
| `gid=1001(hocvien)` | Nhóm chính. Ubuntu tạo cho mỗi người một nhóm cùng tên |
| `groups=...,27(sudo)` | Mọi nhóm tài khoản thuộc về. Có nhóm `sudo` nên dùng được `sudo` |

## File /etc/passwd

Danh sách tài khoản nằm trong `/etc/passwd`. **Mọi người dùng đều đọc được** file này; chỉ root sửa được.

```bash
cat /etc/passwd
```

```text
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin
_apt:x:42:65534::/nonexistent:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
ubuntu:x:1000:1000:Ubuntu:/home/ubuntu:/bin/bash
systemd-network:x:998:998:systemd Network Management:/:/usr/sbin/nologin
hocvien:x:1001:1001::/home/hocvien:/bin/bash
an:x:1002:1002::/home/an:/bin/bash
```

Mỗi dòng là một tài khoản. root luôn ở dòng đầu, tài khoản người dùng tạo sau nằm cuối. Mỗi dòng có **7 cột ngăn bởi dấu `:`**. Đọc dòng của `root` và `hocvien`:

| Cột | `root` | `hocvien` | Ý nghĩa |
|---|---|---|---|
| 1 | `root` | `hocvien` | Tên đăng nhập |
| 2 | `x` | `x` | Mật khẩu. `x` nghĩa là mật khẩu (đã mã hoá) nằm trong `/etc/shadow` |
| 3 | `0` | `1001` | UID |
| 4 | `0` | `1001` | GID của nhóm chính |
| 5 | `root` | (trống) | Mô tả, thường là họ tên đầy đủ (trường GECOS) |
| 6 | `/root` | `/home/hocvien` | Thư mục nhà |
| 7 | `/bin/bash` | `/bin/bash` | Shell chạy khi đăng nhập. `/usr/sbin/nologin` là không cho đăng nhập |

### Bài tập: máy có bao nhiêu tài khoản?

Mỗi dòng là một tài khoản, nên đếm số dòng:

```bash
wc -l /etc/passwd
cat /etc/passwd | wc -l
```

```text
22 /etc/passwd
22
```

Đếm riêng tài khoản đăng nhập được bằng bash: `grep -c /bin/bash /etc/passwd` (ra `4`: `root`, `ubuntu`, `hocvien`, `an`).

## File /etc/shadow

Mật khẩu đã mã hoá và chính sách mật khẩu nằm trong `/etc/shadow`. File này **chỉ root đọc được**:

```bash
cat /etc/shadow
```

```text
cat: /etc/shadow: Permission denied
```

Trong video, thầy đặt mật khẩu root (`sudo passwd root`), chuyển sang root (`su root`, dấu nhắc thành `#`) rồi mới `cat /etc/shadow`. Cách gọn hơn là dùng `sudo` (bài 8). Xem vài dòng:

```bash
sudo grep -E "^(root|daemon|hocvien|an):" /etc/shadow
```

```text
root:*:20767:0:99999:7:::
daemon:*:20767:0:99999:7:::
hocvien:$y$j9T$BFTT0qNxZr8ar6sk41ZzP0$bU8YuYNm03K59LtuqGtq5Qz6/fjocbfglq71DEKMdh1:20784:0:99999:7:::
an:!:20784:0:99999:7:::
```

Mỗi dòng có **9 cột ngăn bởi dấu `:`** (video nói 8 cột; cột thứ 9 để dành, luôn trống). Đọc dòng của `hocvien`:

| Cột | Giá trị | Ý nghĩa |
|---|---|---|
| 1 | `hocvien` | Tên đăng nhập |
| 2 | `$y$j9T$...` | Mật khẩu đã mã hoá (băm). `$y$` là thuật toán yescrypt |
| 3 | `20784` | Ngày đổi mật khẩu lần cuối, tính bằng **số ngày kể từ 1/1/1970** |
| 4 | `0` | Số ngày tối thiểu phải chờ trước khi được đổi mật khẩu lần nữa. `0` là đổi lúc nào cũng được |
| 5 | `99999` | Số ngày mật khẩu có hiệu lực. `99999` là coi như vô hạn |
| 6 | `7` | Báo trước bao nhiêu ngày khi mật khẩu sắp hết hạn |
| 7 | (trống) | Số ngày sau khi mật khẩu hết hạn thì khoá hẳn tài khoản |
| 8 | (trống) | Ngày tài khoản hết hiệu lực (cũng tính từ 1/1/1970) |
| 9 | (trống) | Để dành, chưa dùng |

Cột 2 có vài giá trị đặc biệt:

| Giá trị | Ý nghĩa |
|---|---|
| `*` hoặc `!` | Không đăng nhập bằng mật khẩu được. `root:*` là root của Ubuntu chưa có mật khẩu; `an:!` là tài khoản vừa tạo, chưa đặt mật khẩu |
| `!` đứng trước chuỗi mã hoá | Mật khẩu bị khoá (bài 27, `usermod -L`) |
| Trống hẳn | Không cần mật khẩu. Rất nguy hiểm |

Đổi số ngày `20784` ra ngày tháng:

```bash
date -d "1970-01-01 + 20784 days" +%F
```

```text
2026-11-27
```

## Mở rộng (chuẩn LPIC-1)

Chuẩn LPIC-1 mục 107.1 còn yêu cầu:

| Mục | Nội dung |
|---|---|
| Dải UID | `0` là root. `1`–`999` dành cho tài khoản hệ thống. Người dùng thường từ `1000` (`UID_MIN` trong `/etc/login.defs`) |
| `getent passwd tên` | Tra tài khoản qua mọi nguồn (file `/etc/passwd`, hoặc máy chủ tài khoản tập trung như LDAP). Kết quả cùng định dạng 7 cột |
| `/etc/login.defs` | Giá trị mặc định khi tạo tài khoản: dải UID, thời hạn mật khẩu (`PASS_MAX_DAYS`), quyền thư mục nhà (`HOME_MODE 0750`) |
| `/etc/skel` | Thư mục mẫu: file trong đây được chép vào thư mục nhà của tài khoản mới (`.bashrc`, `.profile`…) |
| `nologin` | Shell `/usr/sbin/nologin` in một câu báo lỗi rồi thoát, dùng cho tài khoản hệ thống |
| Khoá mật khẩu | Chỉ chặn đăng nhập **bằng mật khẩu**. Người dùng có SSH key vẫn vào được; muốn chặn hẳn thì phải xét cả cách đăng nhập khác (bài 27) |

```bash
getent passwd hocvien root
```

```text
hocvien:x:1001:1001::/home/hocvien:/bin/bash
root:x:0:0:root:/root:/bin/bash
```

## Thực hành

1. Tìm dòng của tài khoản bạn trong `/etc/passwd`. UID, nhóm chính, thư mục nhà, shell là gì?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   grep $USER /etc/passwd
   id
   ```

   Đọc theo bảng 7 cột ở trên. Tài khoản tạo lúc cài Ubuntu thường có UID 1000.

   </details>

2. Liệt kê tên các tài khoản có UID từ 1000 trở lên (người dùng thật).

   <details>
   <summary>Xem đáp án</summary>

   Dùng `cut` (bài 21) lấy cột tên và UID, rồi đọc:

   ```bash
   cut -d : -f 1,3 /etc/passwd
   ```

   Cách gọn hơn dùng `awk` (phần mở rộng): `awk -F: '$3 >= 1000 && $3 < 65534 {print $1}' /etc/passwd`. Kết quả ở máy trong bài là `ubuntu`, `hocvien`, `an`.

   </details>

3. Tài khoản `www-data` có đăng nhập được không? Vì sao?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   grep www-data /etc/passwd
   ```

   Không. Cột 7 là `/usr/sbin/nologin`. Đây là tài khoản hệ thống để chạy máy chủ web.

   </details>

4. Xem dòng của bạn trong `/etc/shadow`, cho biết mật khẩu được đổi lần cuối ngày nào.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo grep $USER /etc/shadow
   ```

   Lấy số ở cột 3, đổi ra ngày bằng `date -d "1970-01-01 + SỐ days" +%F`.

   </details>

## Tóm tắt

| Ý | Ghi nhớ |
|---|---|
| root | UID 0, toàn quyền, không xoá được |
| Tài khoản hệ thống | UID 1–999, chạy dịch vụ, shell `nologin` |
| Người dùng thường | UID từ 1000 |
| `/etc/passwd` | 7 cột: tên, x, UID, GID, mô tả, thư mục nhà, shell. Ai cũng đọc được |
| `/etc/shadow` | 9 cột: tên, mật khẩu mã hoá, các mốc ngày và thời hạn. Chỉ root đọc |
| `id` | Xem UID, GID, nhóm của mình |
