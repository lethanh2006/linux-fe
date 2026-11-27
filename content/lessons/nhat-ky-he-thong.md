---
summary: Khi có sự cố, log là nơi đầu tiên cần xem. Bài này dạy đọc journal của systemd bằng journalctl (lọc theo dịch vụ, thời gian, mức độ, lần khởi động, theo dõi trực tiếp), các file log truyền thống trong /var/log do rsyslog ghi, tự ghi log bằng logger, và cách log được xoay vòng (logrotate).
minutes: 40
commands: [journalctl, journalctl -u, journalctl -f, journalctl -p, journalctl -b, logger, /var/log, rsyslog, logrotate, dmesg]
quiz:
  - q: Xem 50 dòng log gần nhất của dịch vụ nginx, dùng lệnh nào?
    options: ["journalctl nginx", "journalctl -u nginx -n 50", "tail nginx", "systemctl log nginx"]
    answer: 1
    explain: "`-u` lọc theo unit, `-n 50` lấy 50 dòng cuối. Thêm `-f` để theo dõi tiếp như `tail -f`."
  - q: Chỉ xem các thông báo mức lỗi trở lên (err, crit, alert, emerg)?
    options: ["journalctl -p err", "journalctl -e", "journalctl --error-only", "journalctl -k"]
    answer: 0
    explain: "`-p err` lấy mức `err` và mọi mức nghiêm trọng hơn. Thứ tự từ nặng đến nhẹ: emerg, alert, crit, err, warning, notice, info, debug."
  - q: Trên Ubuntu, log đăng nhập (SSH, sudo) nằm ở file nào?
    options: ["/var/log/syslog", "/var/log/auth.log", "/var/log/login.log", "/etc/auth.log"]
    answer: 1
    explain: "rsyslog ghi các thông báo nhóm `auth` và `authpriv` vào `/var/log/auth.log`. Red Hat/Rocky dùng `/var/log/secure`."
  - q: Viết một dòng log từ script của bạn vào log hệ thống, kèm nhãn "backup"?
    options: ["echo backup >> /var/log/syslog", "logger -t backup \"sao luu xong\"", "journalctl -t backup", "syslog backup"]
    answer: 1
    explain: "`logger` gửi thông báo vào hệ thống log (journal và rsyslog). `-t` đặt nhãn, sau đó lọc lại bằng `journalctl -t backup`."
  - q: logrotate làm gì?
    options: ["Xoá toàn bộ log mỗi ngày", "Định kỳ đổi tên file log cũ, nén lại và xoá bớt bản quá cũ để ổ đĩa không bị đầy", "Gửi log qua mạng", "Mã hoá log"]
    answer: 1
    explain: "Ví dụ cấu hình nginx: `daily`, `rotate 14`, `compress` nghĩa là mỗi ngày xoay một lần, giữ 14 bản, bản cũ được nén gzip."
---

> Kết quả trong bài lấy từ Ubuntu 24.04.

## Hai hệ thống log trên Linux

| | systemd-journald | rsyslog |
|---|---|---|
| Lưu ở đâu | `/var/log/journal/` (định dạng nhị phân) | File chữ trong `/var/log/` |
| Đọc bằng | `journalctl` | `less`, `tail`, `grep` |
| Thu từ | Mọi dịch vụ systemd (stdout/stderr), kernel, syslog | Nhận lại từ journald, ghi ra từng file theo quy tắc |

Trên Ubuntu, cả hai cùng chạy: journald thu log, rồi chuyển cho rsyslog ghi ra các file chữ quen thuộc như `/var/log/syslog`. Vì vậy bạn có hai cách đọc cùng một nội dung.

## journalctl: đọc journal

```bash
journalctl -u nginx -n 3 --no-pager
```

```text
Nov 27 08:22:58 lab systemd[1]: Reloading nginx.service - A high performance web server and a reverse proxy server...
Nov 27 08:22:58 lab nginx[338]: 2026/11/27 08:22:58 [notice] 338#338: signal process started
Nov 27 08:22:58 lab systemd[1]: Reloaded nginx.service - A high performance web server and a reverse proxy server.
```

| Phần dòng log | Ý nghĩa |
|---|---|
| `Nov 27 08:22:58` | Thời gian |
| `lab` | Tên máy |
| `nginx[338]` | Chương trình và PID ghi log |
| Phần còn lại | Nội dung |

Đọc journal của toàn hệ thống cần quyền: user thuộc nhóm `adm` hoặc `systemd-journal`, hoặc dùng `sudo`. Không có quyền thì chỉ thấy log của chính mình.

### Các cách lọc

| Tuỳ chọn | Ý nghĩa | Ví dụ |
|---|---|---|
| `-u tên` | Theo unit (dịch vụ) | `journalctl -u ssh` |
| `-n 50` | 50 dòng cuối | `journalctl -u nginx -n 50` |
| `-f` | Theo dõi trực tiếp như `tail -f` (**f**ollow) | `journalctl -u chao -f` |
| `-e` | Mở `less` và nhảy tới cuối (**e**nd) | `journalctl -e` |
| `-p err` | Mức độ `err` trở lên (**p**riority) | `journalctl -p err -b` |
| `--since`, `--until` | Khoảng thời gian | `--since "10 min ago"`, `--since "2026-11-27 08:00" --until "09:00"`, `--since today` |
| `-b` | Lần khởi động hiện tại. `-b -1` là lần trước (**b**oot) | `journalctl -b -1 -p err` |
| `-k` | Chỉ thông báo của kernel (giống `dmesg`) | `journalctl -k -b` |
| `-t nhãn` | Theo nhãn (tag) | `journalctl -t backup` |
| `_PID=1234` | Theo PID | `journalctl _PID=1234` |
| `-o short-iso` | Thời gian dạng ISO. `-o cat` chỉ in nội dung | |
| `--no-pager` | In thẳng ra, không qua `less` (dùng trong script hoặc khi nối `\| grep`) | |
| `-r` | Mới nhất lên đầu (**r**everse) | |

Có thể kết hợp nhiều điều kiện:

```bash
journalctl -u nginx -p warning --since "1 hour ago"
```

### Mức độ (priority)

| Số | Tên | Dùng cho |
|---|---|---|
| 0 | `emerg` | Hệ thống không dùng được |
| 1 | `alert` | Phải xử lý ngay |
| 2 | `crit` | Tình trạng nghiêm trọng |
| 3 | `err` | Lỗi |
| 4 | `warning` | Cảnh báo |
| 5 | `notice` | Bình thường nhưng đáng chú ý |
| 6 | `info` | Thông tin |
| 7 | `debug` | Gỡ lỗi |

```bash
logger -p user.err "loi thu nghiem tu logger"
journalctl -p err -n 3 --no-pager
```

```text
Nov 27 08:22:16 lab rsyslogd[78]: imklog: cannot open kernel log (/proc/kmsg): Operation not permitted.
Nov 27 08:22:16 lab rsyslogd[78]: activation of module imklog failed [v8.2312.0 try https://www.rsyslog.com/e/2145 ]
Nov 27 08:23:08 lab root[405]: loi thu nghiem tu logger
```

### Các lần khởi động và dung lượng

```bash
journalctl --list-boots
journalctl --disk-usage
```

```text
IDX BOOT ID                          FIRST ENTRY                 LAST ENTRY
  0 d23b401525344ba584b80e4f4948c3ea Fri 2026-11-27 08:22:16 UTC Fri 2026-11-27 08:23:08 UTC
Archived and active journals take up 8.0M in the file system.
```

| Lệnh | Làm gì |
|---|---|
| `journalctl --list-boots` | Các lần khởi động còn lưu log. `0` là lần hiện tại, `-1` là lần trước |
| `journalctl --disk-usage` | Journal đang chiếm bao nhiêu dung lượng |
| `sudo journalctl --vacuum-size=500M` | Xoá bớt log cũ cho đến khi còn dưới 500 MB |
| `sudo journalctl --vacuum-time=2weeks` | Xoá log cũ hơn 2 tuần |

Giới hạn dung lượng lâu dài đặt trong `/etc/systemd/journald.conf` (dòng `SystemMaxUse=`).

## /var/log: các file log chữ

```bash
ls /var/log
```

```text
README
alternatives.log
apt
auth.log
bootstrap.log
btmp
chrony
dmesg
dpkg.log
faillog
journal
lastlog
nginx
private
syslog
wtmp
```

| File / thư mục | Chứa |
|---|---|
| `syslog` | Hầu hết thông báo của hệ thống (Red Hat: `messages`) |
| `auth.log` | Đăng nhập, SSH, sudo, đổi mật khẩu (Red Hat: `secure`) |
| `kern.log` | Thông báo của kernel |
| `dpkg.log`, `apt/` | Lịch sử cài, gỡ gói |
| `nginx/`, `postgresql/`… | Log riêng của từng phần mềm |
| `journal/` | Journal của systemd |
| `wtmp`, `btmp`, `lastlog` | File nhị phân: lịch sử đăng nhập (`last`), đăng nhập thất bại (`lastb`), lần đăng nhập cuối (`lastlog`) |

Các file log thường thuộc nhóm `adm`. Ví dụ `-rw-r----- 1 syslog adm ... /var/log/auth.log`. Thêm user vào nhóm `adm` là đọc được mà không cần `sudo`.

Kết hợp với các lệnh đã học:

```bash
sudo tail -f /var/log/syslog
sudo grep "Failed password" /var/log/auth.log | tail
sudo tail -n 100 /var/log/nginx/error.log
```

## rsyslog: quy tắc ghi file

rsyslog chia log theo **facility** (nguồn: `auth`, `kern`, `mail`, `cron`, `user`…) và **mức độ**, rồi ghi vào file theo quy tắc trong `/etc/rsyslog.conf` và `/etc/rsyslog.d/`:

```bash
grep -v '^#' /etc/rsyslog.d/50-default.conf | grep -v '^$'
```

```text
auth,authpriv.*			/var/log/auth.log
*.*;auth,authpriv.none		-/var/log/syslog
kern.*				-/var/log/kern.log
mail.*				-/var/log/mail.log
mail.err			/var/log/mail.err
*.emerg				:omusrmsg:*
```

| Quy tắc | Ý nghĩa |
|---|---|
| `auth,authpriv.*  /var/log/auth.log` | Mọi mức của nguồn `auth` và `authpriv` ghi vào `auth.log` |
| `*.*;auth,authpriv.none  -/var/log/syslog` | Mọi thứ, **trừ** `auth`, ghi vào `syslog`. Dấu `-` là ghi không đồng bộ (nhanh hơn) |
| `mail.err  /var/log/mail.err` | Nguồn `mail` từ mức `err` trở lên |
| `*.emerg  :omusrmsg:*` | Mức khẩn cấp thì hiện lên terminal của mọi người |

Sửa quy tắc xong thì `sudo systemctl restart rsyslog`.

## logger: tự ghi log

```bash
logger "noi dung"
logger -t backup "sao luu xong"
logger -p user.err "loi thu nghiem"
journalctl -t backup --no-pager | tail -1
tail -1 /var/log/syslog
```

```text
Nov 27 08:23:08 lab backup[413]: sao luu xong
2026-11-27T08:23:08.957627+00:00 lab backup: sao luu xong
```

| Phần | Ý nghĩa |
|---|---|
| `logger` | Gửi một dòng vào hệ thống log |
| `-t backup` | Nhãn (**t**ag), hiện thay cho tên chương trình |
| `-p user.err` | Nguồn `user`, mức `err` (**p**riority) |

Trong script sao lưu, cron job… hãy ghi log bằng `logger` thay vì `echo` vào file riêng: log nằm chung một chỗ, có thời gian, lọc được bằng `journalctl`.

## logrotate: không để log làm đầy ổ

Log ghi mãi sẽ đầy ổ đĩa. **logrotate** chạy mỗi ngày (qua `logrotate.timer`), đổi tên log cũ thành `.1`, nén thành `.2.gz`, xoá bản quá cũ. Mỗi phần mềm có cấu hình riêng trong `/etc/logrotate.d/`:

```bash
cat /etc/logrotate.d/nginx
```

```text
/var/log/nginx/*.log {
	daily
	missingok
	rotate 14
	compress
	delaycompress
	notifempty
	create 0640 www-data adm
	...
}
```

| Dòng | Ý nghĩa |
|---|---|
| `daily` | Xoay vòng mỗi ngày (`weekly`, `monthly` cũng được) |
| `rotate 14` | Giữ 14 bản cũ, bản thứ 15 bị xoá |
| `compress` / `delaycompress` | Nén bản cũ bằng gzip / để bản mới nhất (`.1`) chưa nén |
| `missingok`, `notifempty` | Không báo lỗi nếu thiếu file / bỏ qua nếu file rỗng |
| `create 0640 www-data adm` | Tạo file log mới với quyền và chủ này |

Vì vậy trong `/var/log/nginx/` bạn thấy `access.log`, `access.log.1`, `access.log.2.gz`… Đọc file `.gz` bằng `zcat`, `zless`, `zgrep`.

## Thực hành

1. Xem log của dịch vụ `ssh` (hoặc `cron`) từ lúc máy khởi động, rồi chỉ lấy các dòng mức `warning` trở lên.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   journalctl -u cron -b --no-pager
   journalctl -u cron -b -p warning --no-pager
   ```

   </details>

2. Mở một terminal chạy `journalctl -f`. Ở terminal khác gõ `logger -t thu "xin chao journal"` và `sudo ls /root`. Bạn thấy những dòng nào?

   <details>
   <summary>Xem đáp án</summary>

   Dòng `thu[...]: xin chao journal`, và dòng của `sudo` ghi lại ai chạy lệnh gì: `sudo: hocvien : TTY=pts/1 ; PWD=/home/hocvien ; USER=root ; COMMAND=/usr/bin/ls /root`.

   </details>

3. Tìm tất cả các lần dùng `sudo` trong `/var/log/auth.log`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo grep 'sudo:' /var/log/auth.log | grep COMMAND
   ```

   </details>

4. Xem các lỗi (mức err trở lên) của lần khởi động hiện tại. Journal đang chiếm bao nhiêu chỗ?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   journalctl -b -p err --no-pager
   journalctl --disk-usage
   ```

   </details>

5. Xem logrotate giữ log của `apt` bao lâu, xoay vòng theo chu kỳ nào.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   cat /etc/logrotate.d/apt
   ```

   Ubuntu 24.04: `rotate 12`, `monthly`, nghĩa là giữ 12 tháng.

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Log một dịch vụ, 50 dòng cuối | `journalctl -u tên -n 50` |
| Theo dõi trực tiếp | `journalctl -u tên -f`, `tail -f /var/log/syslog` |
| Chỉ lỗi, từ lần khởi động này | `journalctl -p err -b` |
| Theo thời gian | `journalctl --since "1 hour ago"` |
| Log lần khởi động trước | `journalctl -b -1` |
| Log kernel | `journalctl -k`, `sudo dmesg` |
| Log đăng nhập (Ubuntu) | `/var/log/auth.log` |
| Ghi log từ script | `logger -t nhãn "nội dung"` |
| Dọn journal | `sudo journalctl --vacuum-size=500M` |
| Cấu hình xoay vòng log | `/etc/logrotate.d/` |
