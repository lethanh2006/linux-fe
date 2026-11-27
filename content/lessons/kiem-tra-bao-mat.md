---
summary: Các việc kiểm tra bảo mật thường xuyên của quản trị viên — ai đang và đã đăng nhập, ai dùng sudo làm gì, đăng nhập thất bại, cổng nào đang mở (ss, lsof, nmap), file SUID lạ, mật khẩu và hạn dùng, giới hạn tài nguyên cho user (ulimit, limits.conf).
minutes: 35
commands: [w, who, last, lastb, journalctl _COMM=sudo, ss -tulpn, lsof -i, nmap, find -perm -4000, chage -l, passwd -S, ulimit, /etc/security/limits.conf]
quiz:
  - q: Lệnh nào liệt kê các lần đăng nhập THẤT BẠI?
    options: ["last", "sudo lastb", "w", "who"]
    answer: 1
    explain: "`lastb` đọc file /var/log/btmp (cần sudo). `last` là lịch sử đăng nhập thành công, `w` và `who` là ai đang đăng nhập."
  - q: Quét các cổng TCP đang mở trên chính máy mình bằng công cụ nào?
    options: ["ping localhost", "nmap localhost", "dig localhost", "traceroute localhost"]
    answer: 1
    explain: "`nmap` quét cổng từ phía ngoài vào (như kẻ tấn công nhìn thấy). Chỉ quét máy của mình hoặc máy được phép, quét máy người khác có thể vi phạm pháp luật."
  - q: Vì sao nên định kỳ tìm file có bit SUID?
    options: ["Để giải phóng dung lượng", "File SUID chạy bằng quyền chủ file (thường là root); một file SUID lạ có thể là cửa hậu của kẻ tấn công", "Để tăng tốc", "Vì SUID làm hỏng file"]
    answer: 1
    explain: "So danh sách hiện tại với danh sách chuẩn. File SUID nằm trong /tmp, /home, /dev/shm là dấu hiệu rất đáng ngờ."
  - q: "`ulimit -n` cho biết gì?"
    options: ["Số user tối đa", "Số file tối đa một tiến trình được mở cùng lúc", "Dung lượng ổ tối đa", "Số lần đăng nhập"]
    answer: 1
    explain: "Mặc định 1024 (giới hạn mềm). Web server, database nhiều kết nối có thể báo `Too many open files` và cần tăng giới hạn này trong /etc/security/limits.conf hoặc trong unit systemd (LimitNOFILE)."
  - q: Xem các lệnh đã chạy bằng sudo gần đây ở đâu?
    options: ["~/.bash_history của root", "sudo journalctl _COMM=sudo, hoặc /var/log/auth.log", "/etc/sudoers", "lastb"]
    answer: 1
    explain: "sudo ghi lại mọi lệnh: ai chạy, ở thư mục nào, với quyền ai, lệnh gì. Đây là một lý do nên dùng sudo thay vì đăng nhập root."
---

> Phần lớn lệnh làm được trong container, nhưng lịch sử đăng nhập, SSH, `nmap` thấy rõ nhất trên máy ảo hoặc VPS. Kết quả lấy từ máy ảo Ubuntu 24.04.

## Ai đang và đã đăng nhập

```bash
w
last -n 5
sudo lastb -n 5
```

```text
 16:24:38 up 38 min,  1 user,  load average: 0.00, 0.00, 0.00
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU  WHAT
hocvien           10.0.2.2         16:24   20:23   0.00s  0.09s sshd: hocvien [priv]
hocvien  pts/0        10.0.2.2         Fri Nov 27 15:47 - 15:47  (00:00)
reboot   system boot  6.8.0-147-generi Fri Nov 27 15:46   still running
reboot   system boot  6.8.0-147-generi Fri Nov 27 15:38 - 15:46  (00:07)

wtmp begins Fri Nov 27 15:38:59 2026
```

| Lệnh | Cho biết | Đọc từ |
|---|---|---|
| `w` | Ai đang đăng nhập, từ IP nào, đang chạy gì, đã ngồi im bao lâu | `/run/utmp` |
| `who` | Như `w` nhưng gọn hơn | `/run/utmp` |
| `last` | Lịch sử đăng nhập thành công, các lần khởi động lại (`reboot`) | `/var/log/wtmp` |
| `sudo lastb` | Lịch sử đăng nhập **thất bại** | `/var/log/btmp` |
| `lastlog` | Lần đăng nhập cuối của từng tài khoản | `/var/log/lastlog` |

Thấy một IP lạ trong `last`, hay một tài khoản không dùng đến mà có lần đăng nhập gần đây, là dấu hiệu cần điều tra.

### Đăng nhập SSH thất bại

Server có IP công cộng bị dò mật khẩu SSH liên tục, hàng nghìn lần mỗi ngày:

```bash
sudo grep -E "Failed password|Invalid user" /var/log/auth.log | tail
sudo grep -c "Failed password" /var/log/auth.log
```

Ví dụ một dòng khi có người thử đăng nhập bằng user không tồn tại:

```text
2026-11-27T09:24:38.840184+00:00 lab sshd[3820]: Connection closed by invalid user khongco 127.0.0.1 port 35600 [preauth]
```

Thống kê IP dò nhiều nhất (dùng công thức đếm ở [bài 14](/bai/loc-van-ban)):

```bash
sudo grep "Failed password" /var/log/auth.log | grep -oE 'from [0-9.]+' | sort | uniq -c | sort -rn | head
```

Cách phòng: tắt đăng nhập bằng mật khẩu, chỉ dùng SSH key ([bài 49](/bai/ssh-va-ma-hoa)), giới hạn tốc độ bằng tường lửa ([bài 48](/bai/bao-mat-may-chu)), dùng `fail2ban` để tự chặn IP dò nhiều lần.

## Ai dùng sudo làm gì

```bash
sudo journalctl _COMM=sudo -n 2 --no-pager
```

```text
Nov 27 16:24:39 lab sudo[3827]:  hocvien : PWD=/home/hocvien ; USER=root ; COMMAND=/usr/bin/journalctl _COMM=sudo -n 2 --no-pager
Nov 27 16:24:39 lab sudo[3827]: pam_unix(sudo:session): session opened for user root(uid=0) by hocvien(uid=1000)
```

| Phần | Ý nghĩa |
|---|---|
| `hocvien :` | Ai chạy |
| `PWD=` | Đứng ở thư mục nào |
| `USER=root` | Với quyền của ai |
| `COMMAND=` | Lệnh gì |

Cũng có trong `/var/log/auth.log` (`sudo grep COMMAND /var/log/auth.log`). Định kỳ xem lại ai có quyền sudo: `getent group sudo` và `sudo cat /etc/sudoers.d/*` ([bài 5](/bai/sudo-va-root)).

## Cổng nào đang mở

Mỗi cổng mở là một cửa vào máy. Chỉ để mở những gì thật sự cần.

### Từ bên trong: ss, lsof

```bash
sudo ss -tulpn
sudo lsof -i -P -n | head
```

```text
COMMAND    PID            USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
systemd      1            root  140u  IPv4   6028      0t0  TCP *:22 (LISTEN)
systemd      1            root  141u  IPv6   6030      0t0  TCP *:22 (LISTEN)
systemd-r  527 systemd-resolve   14u  IPv4   6525      0t0  UDP 127.0.0.53:53
systemd-r  527 systemd-resolve   15u  IPv4   6526      0t0  TCP 127.0.0.53:53 (LISTEN)
```

| Phần lệnh `lsof` | Ý nghĩa |
|---|---|
| `-i` | Chỉ các file mạng (socket) |
| `-P` | Hiện số cổng thay vì tên |
| `-n` | Hiện IP thay vì tên máy |
| `-i :80` | Chỉ cổng 80: ai đang dùng cổng này |

Cổng 22 ở đây do `systemd` (PID 1) mở: Ubuntu 24.04 dùng `ssh.socket`, systemd giữ cổng và chỉ khởi động `sshd` khi có kết nối. `ss -tulpn` đã học ở [bài 45](/bai/kiem-tra-mang).

### Từ bên ngoài: nmap

`nmap` quét cổng giống như kẻ tấn công nhìn vào máy (Ubuntu: `sudo apt install nmap`):

```bash
nmap -sT localhost
```

```text
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00010s latency).
Not shown: 999 closed tcp ports (conn-refused)
PORT   STATE SERVICE
22/tcp open  ssh

Nmap done: 1 IP address (1 host up) scanned in 0.12 seconds
```

| Phần | Ý nghĩa |
|---|---|
| `-sT` | Quét bằng kết nối TCP đầy đủ (không cần root) |
| `-p 1-65535` | (Thêm vào) quét mọi cổng, mặc định chỉ 1000 cổng phổ biến |
| `open` | Có dịch vụ nghe |
| `closed` | Không có gì nghe |
| `filtered` | Bị tường lửa chặn, không biết |

Quét từ **một máy khác** tới IP công cộng của server mới thấy đúng những gì Internet thấy (quét `localhost` thì tường lửa không chặn).

> **Chỉ quét máy của bạn** hoặc máy được phép. Quét hệ thống của người khác khi chưa được cho phép có thể vi phạm pháp luật và điều khoản của nhà cung cấp.

## File SUID lạ

Kẻ tấn công đã vào được máy thường để lại một file SUID root để lần sau lấy lại quyền root ([bài 19](/bai/quyen-dac-biet)):

```bash
sudo find / -xdev -type f \( -perm -4000 -o -perm -2000 \) 2>/dev/null
```

| Phần | Ý nghĩa |
|---|---|
| `-xdev` | Không đi sang filesystem khác (bỏ qua `/proc`, ổ gắn thêm) |
| `-perm -4000 -o -perm -2000` | Có SUID hoặc SGID |

Lưu kết quả lúc máy mới cài (`> suid-chuan.txt`), lần sau so sánh bằng `diff`. Đáng ngờ nhất là file SUID trong `/tmp`, `/var/tmp`, `/dev/shm`, `/home`. Thêm tuỳ chọn `nosuid` khi gắn các phân vùng này ([bài 30](/bai/mount-va-fstab)).

Các kiểm tra liên quan:

| Kiểm tra | Lệnh |
|---|---|
| File ai cũng ghi được (ngoài `/tmp`) | `sudo find / -xdev -type f -perm -0002 2>/dev/null` |
| File không có chủ (user đã bị xoá) | `sudo find / -xdev -nouser 2>/dev/null` |
| File hệ thống bị sửa | `sudo dpkg --verify` (Ubuntu), `rpm -Va` (Rocky) |

## Tài khoản và mật khẩu

| Kiểm tra | Lệnh |
|---|---|
| Tài khoản có UID 0 (ngoài root là cực kỳ đáng ngờ) | `awk -F: '$3 == 0' /etc/passwd` |
| Tài khoản đăng nhập được | `grep -vE 'nologin\|false' /etc/passwd` |
| Tài khoản không có mật khẩu | `sudo awk -F: '$2 == ""' /etc/shadow` |
| Trạng thái, hạn mật khẩu | `sudo passwd -S tên`, `sudo chage -l tên` |
| Khoá tài khoản không dùng | `sudo usermod -L tên` và `sudo usermod -e 1 tên` |

Đặt chính sách mật khẩu: `PASS_MAX_DAYS`, `PASS_MIN_DAYS`, `PASS_WARN_AGE` trong `/etc/login.defs` (áp cho user tạo sau), độ mạnh mật khẩu trong `/etc/security/pwquality.conf` ([bài 17](/bai/lenh-quan-ly-nguoi-dung)).

## Giới hạn tài nguyên: ulimit

`ulimit` giới hạn tài nguyên một tiến trình được dùng, để một user hay một chương trình lỗi không làm sập cả máy.

```bash
ulimit -a | head -8
ulimit -n
ulimit -Hn
```

```text
real-time non-blocking time  (microseconds, -R) unlimited
core file size              (blocks, -c) 0
data seg size               (kbytes, -d) unlimited
scheduling priority                 (-e) 0
file size                   (blocks, -f) unlimited
pending signals                     (-i) 7718
max locked memory           (kbytes, -l) 251852
max memory size             (kbytes, -m) unlimited
1024
1048576
```

| Lệnh | Ý nghĩa |
|---|---|
| `ulimit -a` | Mọi giới hạn |
| `ulimit -n` | Số file mở tối đa (giới hạn **mềm**, mặc định 1024) |
| `ulimit -Hn` | Giới hạn **cứng**: user chỉ được tự tăng giới hạn mềm tới mức này |
| `ulimit -u` | Số tiến trình tối đa của user (chặn "fork bomb") |
| `ulimit -n 4096` | Đổi trong shell hiện tại |

Đặt lâu dài trong `/etc/security/limits.conf` (hoặc file trong `/etc/security/limits.d/`), có hiệu lực khi đăng nhập:

```text
# <ai>       <loại>  <mục>    <giá trị>
hocvien      soft    nproc    200
hocvien      hard    nproc    300
@dev         soft    nofile   4096
*            hard    core     0
```

| Cột | Ý nghĩa |
|---|---|
| Ai | Tên user, `@nhóm`, hoặc `*` (mọi người) |
| Loại | `soft` (mặc định, tự tăng được tới `hard`) / `hard` (trần) |
| Mục | `nofile` (file mở), `nproc` (tiến trình), `core` (file core dump), `maxlogins` (số phiên đăng nhập) |

Dịch vụ chạy bằng systemd **không** đọc `limits.conf`. Đặt trong unit file: `LimitNOFILE=65536` ([bài 22](/bai/systemd-dich-vu)). Dấu hiệu cần tăng: log báo `Too many open files`.

## Thực hành

1. Ai đang đăng nhập vào máy? 5 lần đăng nhập gần nhất là ai, từ đâu? Máy khởi động lại lần cuối khi nào?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   w
   last -n 5
   last reboot | head -3
   ```

   </details>

2. Liệt kê mọi cổng đang nghe kèm chương trình, rồi quét chính máy mình bằng `nmap` và so sánh hai kết quả.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo ss -tulpn
   sudo apt install -y nmap
   nmap -sT localhost
   ```

   `nmap` mặc định chỉ quét TCP, 1000 cổng phổ biến. Cổng nghe ở `127.0.0.53` (DNS cục bộ) không hiện khi quét `localhost` (`127.0.0.1`).

   </details>

3. Lưu danh sách file SUID/SGID hiện tại vào `~/suid-chuan.txt`. Tạo thử một file SUID trong `/tmp`, chạy lại và dùng `diff` để phát hiện nó. Dọn dẹp.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo find / -xdev -type f \( -perm -4000 -o -perm -2000 \) 2>/dev/null | sort > ~/suid-chuan.txt
   cp /bin/true /tmp/la && chmod u+s /tmp/la
   sudo find / -xdev -type f \( -perm -4000 -o -perm -2000 \) 2>/dev/null | sort | diff ~/suid-chuan.txt -
   rm /tmp/la
   ```

   `diff` in dòng `> /tmp/la`. (Nếu `/tmp` là tmpfs, một filesystem riêng, thì bỏ `-xdev` hoặc tìm thêm trong `/tmp`.)

   </details>

4. Kiểm tra có tài khoản nào ngoài root có UID 0, hoặc có mật khẩu rỗng không.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   awk -F: '$3 == 0 {print $1}' /etc/passwd
   sudo awk -F: '$2 == "" {print $1}' /etc/shadow
   ```

   Lệnh đầu chỉ được in `root`, lệnh sau không được in gì.

   </details>

5. Xem giới hạn số file mở của shell hiện tại và của dịch vụ `ssh`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ulimit -n
   systemctl show ssh -p LimitNOFILE
   ```

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Đang đăng nhập / lịch sử / thất bại | `w` / `last` / `sudo lastb` |
| SSH bị dò mật khẩu | `sudo grep "Failed password" /var/log/auth.log` |
| Lệnh sudo đã chạy | `sudo journalctl _COMM=sudo` |
| Cổng mở (bên trong) | `sudo ss -tulpn`, `sudo lsof -i -P -n` |
| Cổng mở (bên ngoài) | `nmap -sT IP` |
| File SUID/SGID | `sudo find / -xdev -type f \( -perm -4000 -o -perm -2000 \)` |
| Tài khoản UID 0, mật khẩu rỗng | `awk -F: '$3==0' /etc/passwd`, `sudo awk -F: '$2==""' /etc/shadow` |
| Giới hạn tài nguyên | `ulimit -a`, `/etc/security/limits.conf`, `LimitNOFILE=` |
