---
summary: Linux là hệ nhiều người dùng. Bài này giải thích user, UID, nhóm, GID, tài khoản hệ thống, rồi đọc từng cột của bốn file lưu tài khoản — /etc/passwd, /etc/shadow, /etc/group, /etc/gshadow — và các lệnh xem mình là ai, ai đang đăng nhập.
minutes: 35
commands: [id, groups, getent, who, w, whoami, /etc/passwd, /etc/shadow, /etc/group]
quiz:
  - q: "Trong dòng `hocvien:x:1001:1001::/home/hocvien:/bin/bash`, chữ `x` ở cột 2 nghĩa là gì?"
    options: ["User bị khoá", "Mật khẩu đã mã hoá được cất trong /etc/shadow", "User không có mật khẩu", "User là quản trị"]
    answer: 1
    explain: "Ngày xưa mật khẩu mã hoá nằm ngay cột 2 của /etc/passwd, file mà ai cũng đọc được. Nay cột đó chỉ ghi `x`, còn mật khẩu mã hoá chuyển sang `/etc/shadow`, chỉ root đọc được."
  - q: "User `www-data` có shell là `/usr/sbin/nologin`. Điều này nghĩa là gì?"
    options: ["User chưa đặt mật khẩu", "Không ai đăng nhập vào shell bằng user này được, nó chỉ dùng để chạy dịch vụ", "User bị xoá", "User là root"]
    answer: 1
    explain: "`nologin` in ra `This account is currently not available.` rồi thoát. Tài khoản hệ thống như `www-data` (nginx, apache dùng) chỉ để chạy chương trình, không cho đăng nhập."
  - q: Trên Ubuntu, UID của user thường bắt đầu từ bao nhiêu?
    options: ["0", "100", "1000", "65534"]
    answer: 2
    explain: "`/etc/login.defs` có `UID_MIN 1000`. UID 0 là root, 1–999 là tài khoản hệ thống, 65534 là `nobody`."
  - q: "Trong /etc/shadow, dòng `root:*:20767:0:99999:7:::` cho biết gì về root?"
    options: ["Mật khẩu root là dấu *", "Không có mật khẩu nào đăng nhập được vào root", "root không có hạn dùng", "root bị xoá"]
    answer: 1
    explain: "Cột 2 là `*` hoặc `!` nghĩa là không có mật khẩu hợp lệ, không đăng nhập bằng mật khẩu được. Trên Ubuntu, root bị khoá như vậy, phải dùng sudo."
  - q: Mỗi user có bao nhiêu nhóm chính (primary group)?
    options: ["Không có", "Đúng một, ghi ở cột 4 của /etc/passwd", "Tối đa 16", "Bằng số nhóm phụ"]
    answer: 1
    explain: "Mỗi user có đúng một nhóm chính (GID ở cột 4 của /etc/passwd). File user tạo ra mang nhóm này. Ngoài ra user có thể thuộc nhiều nhóm phụ, ghi ở cột 4 của /etc/group."
---

## Vì sao có nhiều user

Linux sinh ra cho máy chủ dùng chung. Mỗi người, mỗi dịch vụ chạy dưới **một user riêng**, nên:

- File của ai người nấy giữ, người khác không đọc trộm, không xoá nhầm được.
- Dịch vụ bị tấn công (ví dụ web server) thì kẻ tấn công chỉ có quyền của user dịch vụ đó, không có quyền trên cả máy.

Kernel không làm việc với tên user mà với **số**:

| Khái niệm | Là gì | Ví dụ |
|---|---|---|
| **UID** | Số hiệu user | `0` là root, `1001` là hocvien |
| **GID** | Số hiệu nhóm | `27` là nhóm sudo |
| **Nhóm chính** | Mỗi user có đúng một. File user tạo ra mang nhóm này | Ubuntu tạo cho mỗi user một nhóm cùng tên |
| **Nhóm phụ** | User có thể thuộc thêm nhiều nhóm để được chia quyền | hocvien thuộc thêm nhóm `sudo` |

Ba loại tài khoản:

| Loại | UID (Ubuntu) | Dùng để | Ví dụ |
|---|---|---|---|
| root | 0 | Quản trị toàn quyền | `root` |
| Tài khoản hệ thống | 1–999 | Chạy dịch vụ, không ai đăng nhập | `www-data` (web), `postgres`, `daemon` |
| User thường | 1000 trở lên | Người dùng thật | `hocvien`, `ubuntu` |
| nobody | 65534 | Chạy những thứ cần ít quyền nhất | `nobody` |

Các mốc này ghi trong `/etc/login.defs` (`UID_MIN 1000`, `UID_MAX 60000`).

## Mình là ai: id, groups, whoami

```bash
id
id root
groups
```

```text
uid=1001(hocvien) gid=1001(hocvien) groups=1001(hocvien),27(sudo)
uid=0(root) gid=0(root) groups=0(root)
hocvien sudo
```

| Lệnh | In ra |
|---|---|
| `id` | UID, nhóm chính (gid), các nhóm (groups) của bạn |
| `id tenuser` | Thông tin của user khác |
| `id -un` / `id -gn` | Chỉ tên user / tên nhóm chính |
| `groups` | Tên các nhóm bạn thuộc về |
| `whoami` | Tên user hiện tại |

## /etc/passwd: danh sách tài khoản

Mỗi dòng là một tài khoản, 7 cột cách nhau bằng dấu `:`. Ai cũng đọc được file này.

```bash
grep -E '^(root|www-data|hocvien|nobody):' /etc/passwd
```

```text
root:x:0:0:root:/root:/bin/bash
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
hocvien:x:1001:1001::/home/hocvien:/bin/bash
```

Đọc dòng `hocvien:x:1001:1001::/home/hocvien:/bin/bash`:

| Cột | Giá trị | Ý nghĩa |
|---|---|---|
| 1 | `hocvien` | Tên đăng nhập |
| 2 | `x` | Mật khẩu được cất ở `/etc/shadow` |
| 3 | `1001` | UID |
| 4 | `1001` | GID của nhóm chính |
| 5 | (trống) | Thông tin mô tả (GECOS): họ tên, số điện thoại… |
| 6 | `/home/hocvien` | Thư mục home |
| 7 | `/bin/bash` | Shell khi đăng nhập. `/usr/sbin/nologin` là cấm đăng nhập |

Tài khoản dịch vụ dùng shell `nologin`:

```bash
/usr/sbin/nologin
```

```text
This account is currently not available.
```

Danh sách các shell hợp lệ nằm trong `/etc/shells`.

## /etc/shadow: mật khẩu và hạn dùng

Chỉ root (và nhóm `shadow`) đọc được:

```bash
ls -l /etc/passwd /etc/shadow
sudo grep -E '^(root|hocvien):' /etc/shadow
```

```text
-rw-r--r-- 1 root root    1006 Nov 27 14:46 /etc/passwd
-rw-r----- 1 root shadow   634 Nov 27 14:46 /etc/shadow
root:*:20767:0:99999:7:::
hocvien:$y$j9T$O8OhyOO5jUgBbh09nveIP.$14OyZyIctGavlltYVAt2bpepKunxcZyjt79GscmHc0D:20784:0:99999:7:::
```

9 cột, đọc dòng của `hocvien`:

| Cột | Giá trị | Ý nghĩa |
|---|---|---|
| 1 | `hocvien` | Tên đăng nhập |
| 2 | `$y$j9T$...` | Mật khẩu đã băm. `$y$` là thuật toán yescrypt (mặc định của Ubuntu), `$6$` là SHA-512. `!` hoặc `*` là không có mật khẩu hợp lệ (bị khoá) |
| 3 | `20784` | Ngày đổi mật khẩu gần nhất, tính bằng số ngày kể từ 1/1/1970 |
| 4 | `0` | Phải đợi ít nhất bao nhiêu ngày mới được đổi lại |
| 5 | `99999` | Sau bao nhiêu ngày thì bắt buộc đổi (99999 là gần như không bao giờ) |
| 6 | `7` | Báo trước bao nhiêu ngày khi sắp hết hạn |
| 7 | (trống) | Hết hạn bao nhiêu ngày rồi thì khoá tài khoản |
| 8 | (trống) | Ngày tài khoản hết hiệu lực |
| 9 | (trống) | Để dành |

Mật khẩu **không được lưu dạng chữ**, mà lưu dạng đã băm một chiều. Khi bạn đăng nhập, hệ thống băm mật khẩu bạn gõ rồi so với chuỗi đã lưu. Không ai, kể cả root, đọc ngược ra mật khẩu được. Hạn dùng mật khẩu (cột 3–8) chỉnh bằng lệnh `chage` ở [bài sau](/bai/lenh-quan-ly-nguoi-dung).

## /etc/group và /etc/gshadow: nhóm

```bash
grep -E '^(root|adm|sudo|hocvien):' /etc/group
```

```text
root:x:0:
adm:x:4:ubuntu
sudo:x:27:ubuntu,hocvien
hocvien:x:1001:
```

Đọc dòng `sudo:x:27:ubuntu,hocvien`:

| Cột | Giá trị | Ý nghĩa |
|---|---|---|
| 1 | `sudo` | Tên nhóm |
| 2 | `x` | Mật khẩu nhóm (hầu như không dùng), cất ở `/etc/gshadow` |
| 3 | `27` | GID |
| 4 | `ubuntu,hocvien` | Các thành viên có nhóm này là **nhóm phụ**, cách nhau bằng dấu phẩy |

Cột 4 **không liệt kê** những user nhận nhóm này làm nhóm chính. Ví dụ dòng `hocvien:x:1001:` có cột 4 trống, nhưng `hocvien` vẫn thuộc nhóm `hocvien` vì đó là nhóm chính (cột 4 của `/etc/passwd`).

Một số nhóm có sẵn đáng biết trên Ubuntu:

| Nhóm | Thành viên được làm gì |
|---|---|
| `sudo` | Dùng `sudo` (Red Hat/Rocky dùng nhóm `wheel`) |
| `adm` | Đọc log trong `/var/log` |
| `docker` | Dùng Docker không cần sudo (tương đương quyền root, cẩn thận) |
| `www-data` | Nhóm của web server nginx/apache |

## getent: tra cứu đúng cách

```bash
getent passwd hocvien
getent group sudo
```

```text
hocvien:x:1001:1001::/home/hocvien:/bin/bash
sudo:x:27:ubuntu,hocvien
```

Ở công ty, tài khoản có thể không nằm trong `/etc/passwd` mà ở máy chủ tập trung (LDAP, Active Directory). `getent` tra qua mọi nguồn mà hệ thống được cấu hình (ghi trong `/etc/nsswitch.conf`), nên luôn cho kết quả đúng. `grep /etc/passwd` thì chỉ thấy tài khoản nằm trong file.

## Ai đang đăng nhập: who, w, last

```bash
who
w
last
```

| Lệnh | In ra |
|---|---|
| `who` | Ai đang đăng nhập, từ terminal nào, lúc nào |
| `w` | Như `who`, thêm thời gian máy đã chạy, tải CPU và mỗi người đang chạy lệnh gì |
| `last` | Lịch sử đăng nhập (đọc từ `/var/log/wtmp`) |
| `lastb` | Các lần đăng nhập **thất bại** (cần sudo) |

Trong container không ai đăng nhập qua terminal thật nên `who` trống. Trên VPS, bạn sẽ thấy dạng:

```text
ubuntu   pts/0        2026-11-27 09:12 (203.0.113.50)
```

## Thực hành

1. Dùng một lệnh liệt kê tên mọi user có thể đăng nhập (shell không phải `nologin` hay `false`).

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   grep -vE 'nologin|false' /etc/passwd | cut -d: -f1
   ```

   Kết quả trong container: `root`, `sync`, `ubuntu`, `hocvien`. (`sync` là tài khoản lịch sử có "shell" là `/bin/sync`.)

   </details>

2. Liệt kê các user thường (UID ≥ 1000, trừ `nobody`) kèm UID và thư mục home.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   awk -F: '$3 >= 1000 && $3 < 65534 {print $1, $3, $6}' /etc/passwd
   ```

   </details>

3. User `www-data` có UID mấy, home ở đâu, đăng nhập được không? Nhóm `adm` có những ai?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   getent passwd www-data
   getent group adm
   ```

   UID 33, home `/var/www`, shell `nologin` nên không đăng nhập được. Nhóm `adm` có `ubuntu`.

   </details>

4. Đọc dòng của `hocvien` trong `/etc/shadow`. Thuật toán băm là gì? Mật khẩu đổi lần cuối vào ngày nào?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo grep '^hocvien:' /etc/shadow
   date -d "1970-01-01 + 20784 days" +%F
   ```

   `$y$` là yescrypt. Thay `20784` bằng số ở cột 3 trên máy bạn. Lệnh `date` đổi số ngày ra ngày tháng (cách dễ hơn là `sudo chage -l hocvien`).

   </details>

## Tóm tắt

| File | Chứa | Ai đọc được |
|---|---|---|
| `/etc/passwd` | Tài khoản: tên, UID, GID, home, shell | Mọi người |
| `/etc/shadow` | Mật khẩu đã băm và hạn dùng | root |
| `/etc/group` | Nhóm: tên, GID, thành viên phụ | Mọi người |
| `/etc/gshadow` | Mật khẩu nhóm, quản trị nhóm | root |

| Việc | Lệnh |
|---|---|
| Mình là ai, thuộc nhóm nào | `id`, `groups` |
| Tra một user / một nhóm | `getent passwd tên`, `getent group tên` |
| Ai đang đăng nhập / lịch sử đăng nhập | `who`, `w` / `last` |
