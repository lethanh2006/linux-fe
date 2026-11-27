---
summary: Dự án cuối khoá — từ một máy Ubuntu trắng, dựng máy chủ web hoàn chỉnh — user và SSH key, tường lửa, nginx phục vụ trang tĩnh và làm reverse proxy cho một API chạy bằng systemd, xem log, script sao lưu chạy theo lịch, script tự kiểm tra và khôi phục dịch vụ, rồi khởi động lại để chứng minh mọi thứ tự chạy. Mỗi bước ghi rõ đã học ở bài nào.
minutes: 120
commands: [nginx, nginx -t, sites-available, sites-enabled, proxy_pass, ufw, systemctl, journalctl, tar, cron, systemd timer, curl, ss, shellcheck]
quiz:
  - q: Vì sao API trong dự án nghe ở 127.0.0.1:3000 chứ không phải 0.0.0.0:3000?
    options: ["Cho nhanh hơn", "Để chỉ nginx trên cùng máy gọi được; người ngoài phải đi qua nginx (cổng 80/443), không vào thẳng API", "Vì Python không nghe được 0.0.0.0", "Vì cổng 3000 bị chặn"]
    answer: 1
    explain: "nginx là cửa duy nhất mở ra ngoài: lo HTTPS, nén, giới hạn, log. API chỉ nghe localhost nên không cần mở cổng 3000 trên tường lửa."
  - q: Sửa cấu hình nginx xong, thứ tự đúng là gì?
    options: ["systemctl restart nginx ngay", "sudo nginx -t, thấy successful rồi mới sudo systemctl reload nginx", "reboot", "Xoá sites-enabled"]
    answer: 1
    explain: "`nginx -t` kiểm tra cú pháp. Restart với cấu hình lỗi sẽ làm nginx dừng hẳn, mọi trang web chết. `reload` áp dụng mà không cắt kết nối đang có."
  - q: "Gọi /api/health qua nginx nhận mã 502 Bad Gateway. Nên kiểm tra gì đầu tiên?"
    options: ["Cấu hình DNS", "Dịch vụ API phía sau có đang chạy và nghe đúng cổng không (systemctl status shop-api, ss -tlnp)", "Tường lửa cổng 80", "Quyền file index.html"]
    answer: 1
    explain: "502 nghĩa là nginx chạy nhưng không gọi được upstream. Log lỗi nginx ghi rõ: `connect() failed (111: Connection refused) while connecting to upstream`."
  - q: Kích hoạt một site trong nginx trên Ubuntu là làm gì?
    options: ["Sửa nginx.conf", "Tạo symlink từ /etc/nginx/sites-available/tên sang /etc/nginx/sites-enabled/", "Chép file vào /var/www", "Chạy nginx -s start"]
    answer: 1
    explain: "nginx chỉ đọc các file trong sites-enabled. Tắt site là xoá symlink, file cấu hình gốc vẫn còn trong sites-available."
  - q: "`sudo tar -tzf /srv/backup/shop-*.tar.gz` báo Cannot open: No such file, dù file có tồn tại. Vì sao?"
    options: ["tar bị lỗi", "Dấu * được shell của user thường bung ra trước khi sudo chạy; user thường không đọc được /srv/backup (quyền 700) nên không bung được", "File bị nén sai", "Phải dùng gzip"]
    answer: 1
    explain: "Ký tự đại diện do shell hiện tại xử lý, không phải do sudo. Viết `sudo bash -c 'tar -tzf /srv/backup/shop-*.tar.gz'` để shell của root bung."
---

## Mục tiêu

Từ một máy Ubuntu 24.04 mới cài, dựng một máy chủ web như ngoài thực tế:

| Thành phần | Làm bằng | Học ở |
|---|---|---|
| Đăng nhập an toàn bằng SSH key, không dùng root | `useradd`, `ssh-copy-id`, `sshd_config` | [17](/bai/lenh-quan-ly-nguoi-dung), [49](/bai/ssh-va-ma-hoa) |
| Tường lửa chỉ mở 22, 80, 443 | `ufw` | [48](/bai/bao-mat-may-chu) |
| Trang web tĩnh | nginx + `/var/www/shop` | [18](/bai/phan-quyen-file), [25](/bai/apt-va-dpkg) |
| API (Python) chạy như dịch vụ, tự khởi động lại | systemd unit, user hệ thống | [22](/bai/systemd-dich-vu) |
| nginx chuyển `/api/` vào API (reverse proxy) | `proxy_pass` | bài này |
| Log | `journalctl`, `/var/log/nginx` | [23](/bai/nhat-ky-he-thong) |
| Sao lưu hằng ngày, giữ 7 ngày | script Bash + systemd timer | [11](/bai/nen-va-luu-tru), [24](/bai/lap-lich-cong-viec), [39](/bai/bash-thuc-hanh-va-go-loi) |
| Tự kiểm tra và khôi phục API | script + cron | [24](/bai/lap-lich-cong-viec), [45](/bai/kiem-tra-mang) |

Sơ đồ đường đi của một request:

```text
Trình duyệt ──80/443──► [ufw] ──► nginx ──┬── /        → /var/www/shop (file tĩnh)
                                          └── /api/... → 127.0.0.1:3000 (shop-api, systemd)
```

Làm trên một máy Ubuntu 24.04 (máy chủ thuê hoặc máy riêng). Mọi bước dưới đây đã được chạy thử; kết quả in ra là kết quả thật. Hãy tự gõ từng lệnh, đừng dán cả khối mà không đọc.

## Bước 0: Chuẩn bị máy và user

Trên máy chủ thuê mới, bạn thường đăng nhập bằng `root` hoặc `ubuntu`. Tạo user làm việc riêng có sudo và SSH key:

```bash
sudo apt update && sudo apt upgrade -y
sudo adduser deploy
sudo usermod -aG sudo deploy
```

Trên **máy của bạn** (không phải server), đưa khoá lên và thử đăng nhập:

```bash
ssh-copy-id deploy@IP-SERVER
ssh deploy@IP-SERVER
```

Khi đã đăng nhập được bằng key, tắt đăng nhập bằng mật khẩu và cấm root ([bài mở rộng 27](/bai/bao-mat-may-chu)):

```bash
printf "PermitRootLogin no\nPasswordAuthentication no\n" | sudo tee /etc/ssh/sshd_config.d/10-baomat.conf
sudo sshd -t && sudo systemctl reload ssh
```

**Giữ phiên SSH hiện tại**, mở một terminal mới và thử `ssh deploy@IP-SERVER` trước khi đóng phiên cũ.

## Bước 1: Cài nginx

```bash
sudo apt install -y nginx
systemctl is-active nginx
nginx -v
curl -sI localhost | head -1
```

```text
active
nginx version: nginx/1.24.0 (Ubuntu)
HTTP/1.1 200 OK
```

nginx cài xong là chạy và tự `enable`. Trang mặc định là "Welcome to nginx!".

## Bước 2: Tường lửa

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw default deny incoming
sudo ufw --force enable
sudo ufw status
```

```text
Firewall is active and enabled on system startup
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
Nginx Full                 ALLOW       Anywhere
OpenSSH (v6)               ALLOW       Anywhere (v6)
Nginx Full (v6)            ALLOW       Anywhere (v6)
```

`Nginx Full` là hồ sơ ứng dụng mà gói nginx cài sẵn, gồm cổng 80 và 443 (`sudo ufw app list` để xem). Không mở cổng 3000 của API: người ngoài không được vào thẳng API.

## Bước 3: Mã nguồn API và user chạy nó

API nhỏ viết bằng Python (có sẵn trên Ubuntu), trả JSON ở `/api/health` và `/api/time`. Ở công việc thật, đây là ứng dụng Node.js, Go, Java… của bạn, cách triển khai giống hệt.

```bash
sudo useradd -r -s /usr/sbin/nologin -d /opt/shop shopapp
sudo mkdir -p /opt/shop
sudo vim /opt/shop/app.py
```

```python
#!/usr/bin/env python3
"""API nho cho du an: GET /api/health va GET /api/time."""
import json, os, socket, time
from http.server import BaseHTTPRequestHandler, HTTPServer

PORT = int(os.environ.get("PORT", "3000"))

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/health":
            body = {"status": "ok", "host": socket.gethostname()}
        elif self.path == "/api/time":
            body = {"time": time.strftime("%Y-%m-%d %H:%M:%S")}
        else:
            self.send_response(404); self.end_headers(); return
        data = json.dumps(body).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, fmt, *args):
        print("%s %s" % (self.address_string(), fmt % args), flush=True)

if __name__ == "__main__":
    print(f"shop-api nghe o 127.0.0.1:{PORT}", flush=True)
    HTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
```

```bash
sudo chown -R root:root /opt/shop
sudo chmod 755 /opt/shop/app.py
```

| Việc | Vì sao |
|---|---|
| User `shopapp` hệ thống, shell `nologin` | API chạy với quyền tối thiểu. Có lỗ hổng thì kẻ tấn công cũng không có quyền gì ([bài 27](/bai/lenh-quan-ly-nguoi-dung)) |
| Mã nguồn thuộc `root`, quyền 755 | `shopapp` đọc và chạy được nhưng **không sửa được** mã của chính nó |
| Nghe `127.0.0.1` | Chỉ nginx trên cùng máy gọi được |
| In log ra stdout | systemd tự đưa vào journal |

## Bước 4: Chạy API bằng systemd

`/etc/systemd/system/shop-api.service`:

```ini
[Unit]
Description=Shop API (du an Hoc Linux)
After=network.target

[Service]
Type=simple
User=shopapp
Environment=PORT=3000
ExecStart=/usr/bin/python3 /opt/shop/app.py
Restart=on-failure
RestartSec=3
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
```

`NoNewPrivileges=true` chặn tiến trình (và con của nó) leo quyền qua file SUID. Các dòng còn lại đã giải thích ở [bài mở rộng 16](/bai/systemd-dich-vu).

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now shop-api
systemctl status shop-api
sudo ss -tlnp | grep 3000
curl -s 127.0.0.1:3000/api/health
```

```text
Created symlink /etc/systemd/system/multi-user.target.wants/shop-api.service → /etc/systemd/system/shop-api.service.
● shop-api.service - Shop API (du an Hoc Linux)
     Loaded: loaded (/etc/systemd/system/shop-api.service; enabled; preset: enabled)
     Active: active (running) since Fri 2026-11-27 17:57:52 +07; 1s ago
   Main PID: 7522 (python3)
...
LISTEN 0      5          127.0.0.1:3000      0.0.0.0:*    users:(("python3",pid=7522,fd=3))
{"status": "ok", "host": "lab"}
```

## Bước 5: Trang web tĩnh

```bash
sudo mkdir -p /var/www/shop
sudo vim /var/www/shop/index.html
```

```html
<!doctype html>
<html lang="vi">
<head><meta charset="utf-8"><title>Shop</title></head>
<body><h1>Xin chào từ máy chủ Linux của tôi</h1></body>
</html>
```

Giao cho user của nginx (`www-data`) và đặt quyền chuẩn ([bài 30](/bai/phan-quyen-file)):

```bash
sudo chown -R www-data:www-data /var/www/shop
sudo find /var/www/shop -type d -exec chmod 755 {} +
sudo find /var/www/shop -type f -exec chmod 644 {} +
```

## Bước 6: Cấu hình nginx

Trên Ubuntu, mỗi site là một file trong `/etc/nginx/sites-available/`, và được **bật** bằng symlink trong `/etc/nginx/sites-enabled/` ([bài 32](/bai/hard-link-soft-link)).

`/etc/nginx/sites-available/shop`:

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root /var/www/shop;
    index index.html;

    access_log /var/log/nginx/shop.access.log;
    error_log  /var/log/nginx/shop.error.log;

    location / {
        try_files $uri $uri/ =404;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

| Dòng | Ý nghĩa |
|---|---|
| `listen 80 default_server` | Nghe cổng 80 (IPv4 và dòng sau cho IPv6), là site mặc định |
| `server_name _;` | Nhận mọi tên miền. Có tên miền thật thì ghi `server_name shop.vidu.vn;` |
| `root`, `index` | Thư mục chứa file tĩnh, file mặc định |
| `access_log`, `error_log` | Log riêng cho site |
| `location /` + `try_files` | Tìm file đúng đường dẫn, không có thì trả 404 |
| `location /api/` + `proxy_pass` | Mọi request bắt đầu bằng `/api/` được chuyển cho API ở `127.0.0.1:3000` |
| `proxy_set_header` | Gửi kèm tên miền gốc và IP thật của khách, nếu không API chỉ thấy IP của nginx |

Bật site, tắt site mặc định, kiểm tra, áp dụng:

```bash
sudo rm /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/shop /etc/nginx/sites-enabled/shop
ls -l /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

```text
lrwxrwxrwx 1 root root 31 Nov 27 17:57 shop -> /etc/nginx/sites-available/shop
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**Luôn chạy `nginx -t` trước khi reload.** Quên một dấu `;` thì:

```text
2026/11/27 17:58:03 [emerg] 7634#7634: unexpected "}" in /etc/nginx/sites-enabled/shop:14
nginx: configuration file /etc/nginx/nginx.conf test failed
```

Lỗi ghi rõ file và dòng. Restart nginx với cấu hình lỗi sẽ làm nginx dừng hẳn.

Kiểm tra:

```bash
curl -s localhost
curl -s localhost/api/health
curl -sI localhost/khongco | head -1
```

```text
<!doctype html>
<html lang="vi">
<head><meta charset="utf-8"><title>Shop</title></head>
<body><h1>Xin chào từ máy chủ Linux của tôi</h1></body>
</html>
{"status": "ok", "host": "lab"}
HTTP/1.1 404 Not Found
```

Mở trình duyệt trên máy của bạn tới `http://IP-SERVER` và `http://IP-SERVER/api/time`.

## Bước 7: Đọc log

```bash
sudo tail -3 /var/log/nginx/shop.access.log
journalctl -u shop-api -n 3 --no-pager
```

```text
::1 - - [27/Nov/2026:17:57:54 +0700] "GET /api/time HTTP/1.1" 200 31 "-" "curl/8.5.0"
::1 - - [27/Nov/2026:17:57:54 +0700] "HEAD /khongco HTTP/1.1" 404 0 "-" "curl/8.5.0"
::1 - - [27/Nov/2026:17:57:54 +0700] "GET /api/khongco HTTP/1.1" 404 5 "-" "curl/8.5.0"
Nov 27 17:57:53 lab python3[7522]: 127.0.0.1 "GET /api/health HTTP/1.1" 200 -
Nov 27 17:57:54 lab python3[7522]: 127.0.0.1 "GET /api/time HTTP/1.0" 200 -
Nov 27 17:57:54 lab python3[7522]: 127.0.0.1 "GET /api/khongco HTTP/1.0" 404 -
```

| Log | Cho biết |
|---|---|
| `shop.access.log` | Mỗi request: IP khách, thời gian, phương thức, đường dẫn, mã trạng thái, số byte, trình duyệt |
| `shop.error.log` | Lỗi của nginx: không gọi được API, không có quyền đọc file |
| `journalctl -u shop-api` | Log của chính API. Request đi qua nginx thì API thấy IP là `127.0.0.1` |

### Thử sự cố: API chết

```bash
sudo systemctl stop shop-api
curl -s -o /dev/null -w "%{http_code}\n" localhost/api/health
sudo tail -1 /var/log/nginx/shop.error.log
sudo systemctl start shop-api
```

```text
502
2026/11/27 17:58:04 [error] 7557#7557: *14 connect() failed (111: Connection refused) while connecting to upstream, client: ::1, server: _, request: "GET /api/h...
```

**502 Bad Gateway** nghĩa là nginx vẫn chạy nhưng không gọi được dịch vụ phía sau. Log lỗi ghi rõ `Connection refused`.

Thử `Restart=on-failure`:

```bash
sudo kill -9 $(systemctl show -p MainPID --value shop-api)
sleep 4
systemctl is-active shop-api
curl -s localhost/api/health
```

```text
active
{"status": "ok", "host": "lab"}
```

## Bước 8: Sao lưu tự động

Script `/usr/local/bin/shop-backup.sh`:

```bash
#!/bin/bash
# Sao lưu web, cấu hình nginx và mã API; giữ bản sao lưu trong 7 ngày.
set -euo pipefail

DICH=/srv/backup
GIU_NGAY=7
TEN="shop-$(date +%F_%H%M).tar.gz"

log() { logger -t shop-backup "$*"; echo "$*"; }

tar -czf "$DICH/$TEN" -C / \
  var/www/shop \
  etc/nginx/sites-available/shop \
  etc/systemd/system/shop-api.service \
  opt/shop

log "Đã tạo $DICH/$TEN ($(du -h "$DICH/$TEN" | cut -f1))"

so_xoa=$(find "$DICH" -name 'shop-*.tar.gz' -mtime +"$GIU_NGAY" -print -delete | wc -l)
log "Đã xoá $so_xoa bản cũ hơn $GIU_NGAY ngày"
```

| Phần | Ý nghĩa |
|---|---|
| `set -euo pipefail` | Dừng ngay khi có lỗi ([bài mở rộng 14](/bai/bash-thuc-hanh-va-go-loi)) |
| `$(date +%F_%H%M)` | Tên file có ngày giờ ([bài 22](/bai/ngay-gio-he-thong)) |
| `tar -czf ... -C / var/www/shop ...` | Đứng ở `/` rồi gói các đường dẫn tương đối, để khi giải nén với `-C /` file về đúng chỗ ([bài 18](/bai/nen-va-luu-tru)) |
| `logger -t shop-backup` | Ghi vào journal ([bài mở rộng 17](/bai/nhat-ky-he-thong)) |
| `find ... -mtime +7 -print -delete \| wc -l` | Xoá bản cũ hơn 7 ngày và đếm số bản đã xoá ([bài 16](/bai/lenh-find)) |

```bash
sudo mkdir -p /srv/backup && sudo chmod 700 /srv/backup
sudo chmod 750 /usr/local/bin/shop-backup.sh
sudo /usr/local/bin/shop-backup.sh
```

```text
Đã tạo /srv/backup/shop-2026-11-27_1758.tar.gz (4.0K)
Đã xoá 0 bản cũ hơn 7 ngày
```

Xem bên trong bản sao lưu:

```bash
sudo tar -tzf /srv/backup/shop-*.tar.gz
sudo bash -c 'tar -tzf /srv/backup/shop-*.tar.gz'
```

```text
tar (child): /srv/backup/shop-*.tar.gz: Cannot open: No such file or directory
var/www/shop/
var/www/shop/index.html
etc/nginx/sites-available/shop
etc/systemd/system/shop-api.service
opt/shop/
opt/shop/app.py
```

Lệnh đầu lỗi vì dấu `*` được **shell của bạn** bung ra trước khi `sudo` chạy, mà bạn không đọc được `/srv/backup` (quyền 700). `sudo bash -c '...'` để shell của root bung.

Hẹn giờ bằng systemd timer ([bài mở rộng 18](/bai/lap-lich-cong-viec)). `/etc/systemd/system/shop-backup.service`:

```ini
[Unit]
Description=Sao luu du an shop

[Service]
Type=oneshot
ExecStart=/usr/local/bin/shop-backup.sh
```

`/etc/systemd/system/shop-backup.timer`:

```ini
[Unit]
Description=Sao luu du an shop luc 2:30 moi ngay

[Timer]
OnCalendar=*-*-* 02:30:00
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now shop-backup.timer
systemctl list-timers shop-backup.timer
sudo systemctl start shop-backup.service
journalctl -t shop-backup -n 2 --no-pager
```

```text
NEXT                        LEFT LAST PASSED UNIT              ACTIVATES
Sat 2026-11-28 02:30:00 +07   8h -         - shop-backup.timer shop-backup.service
Nov 27 17:58:23 lab shop-backup[7874]: Đã tạo /srv/backup/shop-2026-11-27_1758.tar.gz (4.0K)
Nov 27 17:58:23 lab shop-backup[7878]: Đã xoá 0 bản cũ hơn 7 ngày
```

### Thử khôi phục

Một bản sao lưu chưa từng thử khôi phục thì chưa thể tin được. Xoá trang chủ rồi lấy lại từ bản sao lưu mới nhất:

```bash
sudo rm /var/www/shop/index.html
curl -s -o /dev/null -w "%{http_code}\n" localhost/
sudo bash -c 'tar -xzf $(ls -t /srv/backup/shop-*.tar.gz | head -1) -C / var/www/shop/index.html'
ls -l /var/www/shop
curl -s -o /dev/null -w "%{http_code}\n" localhost/
```

```text
403
-rw-r--r-- 1 www-data www-data 161 Nov 27 17:57 index.html
200
```

Mất `index.html` thì nginx trả 403 (không có file mặc định, và nginx không cho liệt kê thư mục). Khôi phục xong, file có lại đúng chủ và quyền vì `tar` giữ thông tin đó.

> Bản sao lưu nằm cùng máy thì mất máy là mất luôn. Bước tiếp theo nên chép ra nơi khác: `rsync` sang máy khác ([bài mở rộng 28](/bai/ssh-va-ma-hoa)) hoặc dịch vụ lưu trữ đám mây.

## Bước 9: Tự kiểm tra và khôi phục API

Script `/usr/local/bin/shop-health.sh`:

```bash
#!/bin/bash
# Kiểm tra API qua nginx; lỗi thì ghi log và khởi động lại dịch vụ.
URL=http://127.0.0.1/api/health
if ! curl -fsS --max-time 5 "$URL" > /dev/null; then
  logger -t shop-health "API không trả lời, khởi động lại shop-api"
  systemctl restart shop-api
fi
```

| Phần | Ý nghĩa |
|---|---|
| `curl -f` | Trả mã lỗi khi HTTP từ 400 trở lên (mặc định `curl` coi 502 vẫn là thành công) |
| `-sS` | Im lặng nhưng vẫn in lỗi |
| `--max-time 5` | API treo quá 5 giây cũng tính là lỗi |

Chạy mỗi 5 phút bằng cron ([bài mở rộng 18](/bai/lap-lich-cong-viec)):

```bash
sudo chmod 750 /usr/local/bin/shop-health.sh
echo '*/5 * * * * root /usr/local/bin/shop-health.sh' | sudo tee /etc/cron.d/shop-health
```

Thử: dừng API rồi chạy script bằng tay.

```bash
sudo systemctl stop shop-api
sudo /usr/local/bin/shop-health.sh
systemctl is-active shop-api
journalctl -t shop-health -n 1 --no-pager
```

```text
curl: (22) The requested URL returned error: 502
active
Nov 27 17:58:23 lab shop-health[7896]: API không trả lời, khởi động lại shop-api
```

(`Restart=on-failure` chỉ lo trường hợp tiến trình chết. Script này bắt thêm trường hợp tiến trình còn sống nhưng không trả lời.)

Kiểm tra hai script bằng shellcheck ([bài mở rộng 14](/bai/bash-thuc-hanh-va-go-loi)):

```bash
sudo shellcheck /usr/local/bin/shop-backup.sh /usr/local/bin/shop-health.sh && echo "shellcheck sạch"
```

```text
shellcheck sạch
```

## Bước 10: Khởi động lại và nghiệm thu

Bài kiểm tra cuối cùng: khởi động lại máy, mọi thứ phải tự chạy.

```bash
sudo reboot
```

Đăng nhập lại:

```bash
systemctl is-active nginx shop-api shop-backup.timer cron
sudo ufw status | head -1
curl -s localhost/api/health
curl -s -o /dev/null -w "trang chủ: %{http_code}\n" localhost/
sudo ss -tlnp
```

```text
active
active
active
active
Status: active
{"status": "ok", "host": "lab"}
trang chủ: 200
LISTEN 0      5          127.0.0.1:3000      0.0.0.0:*    users:(("python3",pid=...
LISTEN 0      511          0.0.0.0:80        0.0.0.0:*    users:(("nginx",pid=...
LISTEN 0      4096         0.0.0.0:22        0.0.0.0:*    users:(("sshd",pid=...
...
```

### Danh sách nghiệm thu

Tự đánh dấu từng mục. Đạt hết là bạn đã dựng được một máy chủ web đúng cách:

| # | Tiêu chí | Kiểm tra bằng |
|---|---|---|
| 1 | Đăng nhập bằng SSH key, root và mật khẩu bị tắt | `sudo sshd -T \| grep -E "^(permitrootlogin\|passwordauthentication) "` |
| 2 | Tường lửa bật, chỉ mở 22, 80, 443 | `sudo ufw status` |
| 3 | Trang chủ trả 200 từ máy khác | `curl -I http://IP-SERVER` trên máy của bạn |
| 4 | `/api/health` trả JSON qua nginx | `curl http://IP-SERVER/api/health` |
| 5 | Cổng 3000 không vào được từ ngoài | `nc -zv -w 2 IP-SERVER 3000` trên máy của bạn phải thất bại |
| 6 | API chạy bằng user `shopapp`, không phải root | `ps -o user,cmd -C python3` |
| 7 | API tự sống lại khi bị kill | `kill -9` rồi `systemctl is-active` |
| 8 | Có bản sao lưu mỗi ngày, đã thử khôi phục | `systemctl list-timers`, bước 8 |
| 9 | Script kiểm tra sức khoẻ chạy mỗi 5 phút | `/etc/cron.d/shop-health`, `journalctl -t shop-health` |
| 10 | Khởi động lại máy, mọi thứ tự chạy | Bước 10 |

## Làm thêm

Khi đã xong, mở rộng dự án để luyện tiếp:

| Mở rộng | Gợi ý |
|---|---|
| HTTPS miễn phí | Có tên miền trỏ về IP server, rồi `sudo apt install certbot python3-certbot-nginx` và `sudo certbot --nginx -d ten-mien-cua-ban`. Certbot tự sửa cấu hình nginx và tự gia hạn chứng chỉ |
| Chặn dò mật khẩu | Cài `fail2ban` ([bài mở rộng 27](/bai/bao-mat-may-chu)) |
| Sao lưu ra máy khác | Thêm `rsync` sang máy thứ hai vào cuối `shop-backup.sh` |
| Database | Cài PostgreSQL, cho nghe `127.0.0.1`, thêm vào sao lưu bằng `pg_dump` |
| Giám sát | Script cảnh báo khi ổ đĩa trên 80% (`df`, [bài mở rộng 6](/bai/dung-luong-va-sua-loi)), gửi qua mail hoặc webhook |
| Luyện tiếp | Làm 20 ngày của [Linux Upskill Challenge](https://linuxupskillchallenge.org/) và các bài trên [SadServers](https://sadservers.com/) (xem trang [Nguồn học](/nguon)) |

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Bật site nginx | `ln -s /etc/nginx/sites-available/tên /etc/nginx/sites-enabled/` |
| Kiểm tra và áp dụng nginx | `sudo nginx -t && sudo systemctl reload nginx` |
| Reverse proxy | `location /api/ { proxy_pass http://127.0.0.1:3000; }` |
| Chạy ứng dụng như dịch vụ | unit trong `/etc/systemd/system/`, `enable --now` |
| 502 Bad Gateway | Dịch vụ phía sau chết: `systemctl status`, `shop.error.log` |
| Sao lưu theo lịch | script + `.service` + `.timer` |
| Kiểm tra sức khoẻ | `curl -f` + cron + `systemctl restart` |
| Nghiệm thu | `sudo reboot` rồi kiểm tra lại mọi thứ |
