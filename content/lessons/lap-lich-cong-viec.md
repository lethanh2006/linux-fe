---
summary: Cho máy tự chạy việc theo giờ — sao lưu lúc 2 giờ sáng, dọn log mỗi tuần, kiểm tra dịch vụ mỗi 5 phút. Bài này dạy đọc và viết lịch cron (5 trường thời gian), crontab của user và của hệ thống, chạy một lần bằng at, và systemd timer — cách hiện đại thay cho cron.
minutes: 40
commands: [crontab -e, crontab -l, /etc/crontab, /etc/cron.d, at, atq, atrm, systemctl list-timers, systemd-analyze calendar]
quiz:
  - q: "Dòng cron `30 2 * * * /opt/backup.sh` chạy khi nào?"
    options: ["Mỗi 30 phút", "2 giờ 30 sáng mỗi ngày", "Ngày 30 tháng 2", "30 giây một lần"]
    answer: 1
    explain: "Thứ tự 5 trường: phút, giờ, ngày trong tháng, tháng, thứ trong tuần. `30 2 * * *` là phút 30, giờ 2, mọi ngày."
  - q: "Lịch nào chạy mỗi 5 phút?"
    options: ["5 * * * *", "*/5 * * * *", "* 5 * * *", "0 */5 * * *"]
    answer: 1
    explain: "`*/5` ở trường phút nghĩa là mỗi 5 phút (0, 5, 10…). `5 * * * *` là phút thứ 5 của mỗi giờ, tức mỗi giờ một lần."
  - q: "Lịch `0 9 * * 1-5` chạy khi nào?"
    options: ["9 giờ sáng mọi ngày", "9 giờ sáng từ thứ Hai đến thứ Sáu", "Ngày 1 đến ngày 5 mỗi tháng", "Tháng 1 đến tháng 5"]
    answer: 1
    explain: "Trường thứ 5 là thứ trong tuần: 0 (hoặc 7) là Chủ nhật, 1 là thứ Hai… `1-5` là thứ Hai đến thứ Sáu."
  - q: Script chạy tay thì được, nhưng chạy bằng cron thì báo "command not found". Nguyên nhân hay gặp nhất?
    options: ["cron không có quyền", "Biến PATH trong cron rất ngắn, nên phải dùng đường dẫn tuyệt đối hoặc tự đặt PATH", "cron không chạy được bash", "Phải khởi động lại máy"]
    answer: 1
    explain: "cron chạy với môi trường tối thiểu (PATH chỉ khoảng `/usr/bin:/bin`), không đọc `.bashrc`. Ghi rõ `/usr/local/bin/node` thay vì `node`, hoặc thêm dòng `PATH=...` vào đầu crontab."
  - q: Khác nhau giữa crontab -e của user và file /etc/crontab?
    options: ["Không khác", "/etc/crontab có thêm một cột tên user chạy lệnh; crontab -e thì lệnh luôn chạy bằng chính user đó", "crontab -e chỉ dành cho root", "/etc/crontab chạy một lần"]
    answer: 1
    explain: "Dòng trong `/etc/crontab` và `/etc/cron.d/*` có 6 phần thời gian+user: `17 * * * * root lệnh`. Dòng trong crontab của user chỉ có 5 trường thời gian rồi đến lệnh."
  - q: Ưu điểm của systemd timer so với cron?
    options: ["Cú pháp ngắn hơn", "Log tự vào journal, có thể chạy bù lần bị lỡ khi máy tắt (Persistent=true), quản lý như dịch vụ", "Chạy được trên Windows", "Không cần quyền root"]
    answer: 1
    explain: "Timer kích hoạt một service, nên có `systemctl status`, `journalctl -u`, giới hạn tài nguyên… như mọi dịch vụ. `Persistent=true` chạy bù nếu máy đang tắt đúng giờ hẹn."
---

## cron: chạy việc định kỳ

**cron** là dịch vụ chạy nền, mỗi phút đọc các bảng lịch (crontab) và chạy những lệnh đến giờ. Có sẵn trên hầu hết máy Linux (gói `cron` trên Ubuntu).

### Đọc một dòng cron

```text
┌───────────── phút (0-59)
│ ┌─────────── giờ (0-23)
│ │ ┌───────── ngày trong tháng (1-31)
│ │ │ ┌─────── tháng (1-12)
│ │ │ │ ┌───── thứ trong tuần (0-7, 0 và 7 đều là Chủ nhật)
│ │ │ │ │
30 2 * * *  /opt/backup.sh
```

| Ký hiệu | Ý nghĩa | Ví dụ ở trường phút |
|---|---|---|
| `*` | Mọi giá trị | mỗi phút |
| `5` | Đúng giá trị đó | phút thứ 5 |
| `1,15,30` | Danh sách | phút 1, 15 và 30 |
| `1-5` | Khoảng | phút 1 đến 5 |
| `*/10` | Mỗi bước 10 | phút 0, 10, 20, … 50 |

Ví dụ:

| Lịch | Chạy khi nào |
|---|---|
| `*/5 * * * *` | Mỗi 5 phút |
| `0 * * * *` | Đầu mỗi giờ |
| `30 2 * * *` | 2:30 sáng mỗi ngày |
| `0 9 * * 1-5` | 9:00 sáng thứ Hai đến thứ Sáu |
| `0 0 1 * *` | 0:00 ngày mùng 1 mỗi tháng |
| `0 3 * * 0` | 3:00 sáng Chủ nhật |
| `@reboot` | Một lần mỗi khi máy khởi động |
| `@daily`, `@hourly`, `@weekly` | Viết tắt cho `0 0 * * *`, `0 * * * *`, `0 0 * * 0` |

Trang [crontab.guru](https://crontab.guru) giải thích một dòng lịch thành chữ, rất tiện để kiểm tra.

Giờ của cron theo **múi giờ của máy chủ** (`timedatectl` để xem). Nhiều máy chủ thuê để UTC, tức chậm 7 tiếng so với giờ Việt Nam.

### crontab của user

```bash
crontab -e
crontab -l
```

| Lệnh | Làm gì |
|---|---|
| `crontab -e` | Mở crontab của bạn bằng trình soạn thảo (theo biến `EDITOR`), lưu là có hiệu lực |
| `crontab -l` | In crontab hiện tại (**l**ist) |
| `crontab -r` | **Xoá hết** crontab (**r**emove). Cẩn thận: phím `r` nằm cạnh `e` |
| `sudo crontab -u binh -l` | root xem crontab của user `binh` |

Ví dụ crontab, ghi thời gian vào file mỗi phút:

```text
*/1 * * * * date >> /home/hocvien/cron.log
```

Sau một phút:

```text
Fri Nov 27 08:24:01 UTC 2026
```

Crontab của mỗi user được lưu ở `/var/spool/cron/crontabs/tên-user`. Đừng sửa thẳng file này, hãy dùng `crontab -e`.

### Những bẫy hay gặp

| Vấn đề | Cách làm đúng |
|---|---|
| **PATH ngắn**: lệnh chạy tay được, trong cron thì `command not found` | Dùng đường dẫn tuyệt đối (`/usr/bin/node`), hoặc thêm `PATH=/usr/local/bin:/usr/bin:/bin` ở đầu crontab |
| **Không thấy lỗi**: cron chạy lặng lẽ, kết quả gửi vào thư nội bộ mà không ai đọc | Ghi kết quả ra log: `... >> /var/log/backup.log 2>&1`, hoặc dùng `logger` |
| **Không đọc `.bashrc`**: biến môi trường tự đặt không có | Khai báo biến ngay trong script hoặc trong crontab |
| **Dấu `%`** có nghĩa đặc biệt (xuống dòng) trong crontab | Viết `\%`, ví dụ `date +\%F` |
| **Script không có quyền chạy** | `chmod +x script.sh`, có dòng shebang `#!/bin/bash` |

Một dòng cron viết chuẩn:

```text
30 2 * * * /opt/scripts/backup.sh >> /var/log/backup.log 2>&1
```

Xem cron đã chạy chưa: `journalctl -u cron` hoặc `grep CRON /var/log/syslog`.

### Crontab hệ thống: /etc/crontab và /etc/cron.d

```bash
grep -v '^#' /etc/crontab | grep -v '^$'
```

```text
SHELL=/bin/sh
17 *	* * *	root	cd / && run-parts --report /etc/cron.hourly
25 6	* * *	root	test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.daily; }
47 6	* * 7	root	test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.weekly; }
52 6	1 * *	root	test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.monthly; }
```

Khác với crontab của user, dòng ở đây có **thêm cột user** (`root`) sau 5 trường thời gian.

| Nơi | Cách dùng |
|---|---|
| `/etc/crontab` | Bảng lịch chính của hệ thống. Không nên sửa |
| `/etc/cron.d/tên` | Mỗi phần mềm hoặc mỗi việc một file, cùng cú pháp có cột user. **Nên đặt cron job của hệ thống ở đây** |
| `/etc/cron.hourly/`, `cron.daily/`, `cron.weekly/`, `cron.monthly/` | Thả một script (có quyền `x`, tên **không có dấu chấm**) vào là nó chạy theo chu kỳ tương ứng (qua `run-parts`) |

Giới hạn ai được dùng cron: `/etc/cron.allow` (chỉ những user có tên trong đó) và `/etc/cron.deny` (cấm những user có tên). Ubuntu mặc định không có hai file này, nên ai cũng dùng được.

## at: chạy một lần vào lúc nào đó

`at` dành cho việc chạy **một lần** (gói `at`, dịch vụ `atd`):

```bash
echo "echo xin chao > /tmp/at.txt" | at now + 1 minute
atq
atrm 1
```

```text
warning: commands will be executed using /bin/sh
job 1 at Fri Nov 27 08:24:00 2026
1	Fri Nov 27 08:24:00 2026 a root
```

| Lệnh | Làm gì |
|---|---|
| `at now + 1 minute` | Hẹn chạy sau 1 phút. Lệnh lấy từ stdin. Không có stdin thì `at` hiện dấu nhắc `at>` để gõ, kết thúc bằng `Ctrl+D` |
| `at 23:30`, `at 9am tomorrow`, `at now + 2 hours` | Các cách hẹn giờ khác |
| `atq` | Danh sách việc đang chờ: số job, thời gian, hàng đợi, user |
| `at -c 1` | Xem nội dung job số 1 |
| `atrm 1` | Huỷ job số 1 |

Ví dụ thực tế: đổi cấu hình tường lửa trên máy chủ ở xa, hẹn `at now + 10 minutes` một lệnh khôi phục cấu hình cũ. Nếu lỡ tự khoá mình ngoài, 10 phút sau mọi thứ tự trở lại. Nếu ổn thì `atrm` lệnh khôi phục.

## systemd timer: cách hiện đại

Thay vì một dòng cron, systemd dùng một cặp unit: **`.service`** (làm gì) và **`.timer`** (khi nào). Ubuntu dùng sẵn rất nhiều timer:

```bash
systemctl list-timers
```

```text
NEXT                             LEFT LAST PASSED UNIT                         ACTIVATES
Fri 2026-11-27 08:37:16 UTC     13min -         - systemd-tmpfiles-clean.timer systemd-tmpfiles-clean.service
Fri 2026-11-27 20:21:53 UTC       11h -         - apt-daily.timer              apt-daily.service
Sat 2026-11-28 00:00:00 UTC       15h -         - logrotate.timer              logrotate.service
...
```

| Cột | Ý nghĩa |
|---|---|
| `NEXT`, `LEFT` | Lần chạy kế tiếp, còn bao lâu |
| `LAST`, `PASSED` | Lần chạy gần nhất, đã bao lâu |
| `UNIT` / `ACTIVATES` | Timer / dịch vụ mà nó kích hoạt |

### Tạo timer dọn log mỗi ngày lúc 2:30

`/etc/systemd/system/donlog.service`:

```ini
[Unit]
Description=Don log cu

[Service]
Type=oneshot
ExecStart=/usr/bin/find /var/log -name "*.gz" -mtime +30 -delete
```

`/etc/systemd/system/donlog.timer`:

```ini
[Unit]
Description=Don log cu moi ngay

[Timer]
OnCalendar=*-*-* 02:30:00
Persistent=true

[Install]
WantedBy=timers.target
```

| Dòng | Ý nghĩa |
|---|---|
| `Type=oneshot` | Dịch vụ chạy một việc rồi kết thúc (không chạy mãi) |
| `OnCalendar=*-*-* 02:30:00` | Lịch dạng `năm-tháng-ngày giờ:phút:giây`, `*` là mọi giá trị |
| `Persistent=true` | Nếu máy tắt đúng giờ hẹn, chạy bù ngay khi bật lại |
| `WantedBy=timers.target` | `enable` sẽ gắn timer vào hệ thống timer |
| (tên file) | Timer `donlog.timer` mặc định kích hoạt `donlog.service` cùng tên |

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now donlog.timer
systemctl list-timers donlog.timer
```

```text
NEXT                        LEFT LAST PASSED UNIT         ACTIVATES
Sat 2026-11-28 02:30:00 UTC  18h -         - donlog.timer donlog.service
```

Lưu ý: `enable` **timer**, không enable service. Chạy thử service ngay không cần đợi: `sudo systemctl start donlog.service`, rồi xem kết quả bằng `journalctl -u donlog`.

### Kiểm tra cú pháp lịch

```bash
systemd-analyze calendar "Mon *-*-* 09:00"
systemd-analyze calendar daily
```

```text
    Next elapse: Mon 2026-11-30 09:00:00 UTC
       From now: 3 days left
Normalized form: *-*-* 00:00:00
    Next elapse: Sat 2026-11-28 00:00:00 UTC
       From now: 15h left
```

| `OnCalendar=` | Tương đương cron |
|---|---|
| `*-*-* 02:30:00` | `30 2 * * *` |
| `Mon..Fri *-*-* 09:00` | `0 9 * * 1-5` |
| `*:0/5` | `*/5 * * * *` |
| `hourly`, `daily`, `weekly` | `@hourly`, `@daily`, `@weekly` |

Ngoài `OnCalendar` còn có `OnBootSec=5min` (5 phút sau khi khởi động) và `OnUnitActiveSec=1h` (1 giờ sau lần chạy trước).

| | cron | systemd timer |
|---|---|---|
| Cấu hình | Một dòng | Hai file |
| Log | Tự lo (`>> file 2>&1`) | Tự vào journal |
| Máy tắt lúc đến giờ | Bỏ lỡ (trừ khi có anacron) | `Persistent=true` chạy bù |
| Xem lần chạy kế tiếp | Không có sẵn | `systemctl list-timers` |
| Phổ biến | Ở mọi nơi, quen thuộc | Mặc định của các bản Linux mới |

## Thực hành

1. Viết lịch cron cho các yêu cầu: (a) mỗi 15 phút; (b) 23:00 mỗi tối thứ Sáu; (c) 6:30 sáng ngày 1 và ngày 15 mỗi tháng; (d) mỗi giờ trong giờ hành chính 8:00–17:00 từ thứ Hai đến thứ Sáu.

   <details>
   <summary>Xem đáp án</summary>

   (a) `*/15 * * * *` (b) `0 23 * * 5` (c) `30 6 1,15 * *` (d) `0 8-17 * * 1-5`.

   </details>

2. Tạo cron job ghi dung lượng ổ đĩa vào `~/disk.log` mỗi phút. Đợi 2 phút rồi xem file. Sau đó xoá dòng đó khỏi crontab.

   <details>
   <summary>Xem đáp án</summary>

   `crontab -e`, thêm dòng:

   ```text
   * * * * * /usr/bin/df -h / >> /home/hocvien/disk.log 2>&1
   ```

   Lưu, đợi 2 phút, `cat ~/disk.log`. Xoá bằng `crontab -e` rồi xoá dòng đó (đừng dùng `crontab -r` nếu còn job khác).

   </details>

3. Hẹn một lệnh ghi chữ "da den gio" vào `/tmp/hen.txt` sau 2 phút bằng `at`. Xem hàng đợi, xem nội dung job, rồi đợi nó chạy.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   echo 'echo "da den gio" > /tmp/hen.txt' | at now + 2 minutes
   atq
   at -c $(atq | cut -f1) | tail -3
   ```

   Hai phút sau, `cat /tmp/hen.txt` in ra `da den gio`.

   </details>

4. Tạo cặp `donlog.service` và `donlog.timer` như trong bài, enable timer, chạy thử service ngay và xem log của nó.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now donlog.timer
   systemctl list-timers donlog.timer
   sudo systemctl start donlog.service
   journalctl -u donlog --no-pager
   ```

   </details>

5. Dùng `systemd-analyze calendar` để kiểm tra lịch `Sat,Sun *-*-* 10:00` chạy lần kế tiếp khi nào.

## Tóm tắt

| Việc | Lệnh / cú pháp |
|---|---|
| 5 trường cron | phút giờ ngày tháng thứ |
| Mỗi 5 phút / 2:30 sáng mỗi ngày | `*/5 * * * *` / `30 2 * * *` |
| Sửa / xem crontab của mình | `crontab -e` / `crontab -l` |
| Cron job hệ thống | file trong `/etc/cron.d/` (có cột user) |
| Ghi log cho cron job | `lệnh >> /var/log/x.log 2>&1` |
| Chạy một lần | `echo "lệnh" \| at now + 10 minutes`, `atq`, `atrm` |
| Danh sách timer | `systemctl list-timers` |
| Bật timer | `sudo systemctl enable --now tên.timer` |
| Kiểm tra lịch systemd | `systemd-analyze calendar "biểu thức"` |
