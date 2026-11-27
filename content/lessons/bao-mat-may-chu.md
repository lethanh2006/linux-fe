---
summary: Làm cứng một máy chủ Linux — tắt dịch vụ không cần, cập nhật bảo mật, cấu hình SSH an toàn (chỉ dùng key, không cho root đăng nhập), dựng tường lửa bằng ufw (và biết qua firewalld, iptables/nftables), chặn đăng nhập tạm thời bằng /etc/nologin, tự chặn IP dò mật khẩu bằng fail2ban.
minutes: 45
commands: [systemctl disable, ufw, firewall-cmd, nft, iptables, sshd_config, sshd -t, /etc/nologin, fail2ban, unattended-upgrades]
quiz:
  - q: Bật ufw trên VPS qua SSH, việc gì PHẢI làm trước khi chạy ufw enable?
    options: ["Khởi động lại máy", "Cho phép cổng SSH (ufw allow OpenSSH hoặc ufw allow 22/tcp)", "Tắt SSH", "Đổi mật khẩu root"]
    answer: 1
    explain: "Mặc định ufw chặn mọi kết nối vào. Bật lên mà chưa mở cổng SSH là bạn tự khoá mình ở ngoài, phải vào console của nhà cung cấp để sửa."
  - q: "`ufw default deny incoming` và `ufw default allow outgoing` nghĩa là gì?"
    options: ["Chặn hết mọi thứ", "Chặn mọi kết nối đi vào (trừ những cổng được allow), cho phép máy kết nối ra ngoài", "Cho phép mọi thứ", "Chỉ chặn IPv6"]
    answer: 1
    explain: Đây là chính sách chuẩn cho server. Chỉ mở đúng các cổng cần (22, 80, 443), mọi thứ khác bị chặn.
  - q: Hai dòng nào trong sshd_config là quan trọng nhất để chống dò mật khẩu?
    options: ["Port 22 và X11Forwarding yes", "PasswordAuthentication no và PermitRootLogin no", "UseDNS no và Banner", "MaxSessions 10 và Compression yes"]
    answer: 1
    explain: "Tắt đăng nhập bằng mật khẩu (chỉ dùng key) thì dò mật khẩu vô tác dụng. Cấm root đăng nhập trực tiếp buộc phải đăng nhập bằng user thường rồi dùng sudo."
  - q: Trên Ubuntu 24.04, đổi Port trong sshd_config xong, chạy systemctl reload ssh mà cổng mới chưa nghe. Vì sao?
    options: ["Cấu hình sai", "Ubuntu 24.04 dùng ssh.socket: systemd giữ cổng, phải chạy daemon-reload rồi restart ssh.socket", "Phải khởi động lại máy", "sshd không đổi được cổng"]
    answer: 1
    explain: "Cổng SSH được systemd mở qua ssh.socket (sinh từ sshd_config). Đổi cổng cần `sudo systemctl daemon-reload && sudo systemctl restart ssh.socket`. Nhớ mở cổng mới trong tường lửa trước."
  - q: "File /etc/nologin tồn tại thì sao?"
    options: ["Không ai đăng nhập được, kể cả root", "User thường không đăng nhập được (hiện nội dung file), root vẫn vào được", "Tắt SSH", "Xoá mật khẩu"]
    answer: 1
    explain: "Dùng khi bảo trì: tạo file với lời nhắn, xong việc thì xoá. Lệnh shutdown cũng tự tạo file này 5 phút trước giờ tắt máy."
---

> Cần **máy ảo hoặc VPS**. Làm sai tường lửa hoặc SSH trên VPS có thể khoá bạn ở ngoài: luôn giữ một phiên SSH đang mở trong lúc sửa, thử kết nối bằng một phiên mới trước khi đóng phiên cũ, và biết cách vào console web của nhà cung cấp. Kết quả lấy từ máy ảo Ubuntu 24.04.

Nguyên tắc chung: **thứ gì không cần thì tắt, thứ gì cần thì giới hạn**. Mỗi dịch vụ chạy, mỗi cổng mở, mỗi tài khoản đăng nhập được là một chỗ có thể bị tấn công.

## 1. Cập nhật thường xuyên

Phần lớn vụ xâm nhập lợi dụng lỗ hổng **đã có bản vá** nhưng chưa được cài.

```bash
sudo apt update && sudo apt upgrade
systemctl status unattended-upgrades
ls /var/run/reboot-required 2>/dev/null && echo "Cần khởi động lại"
```

Ubuntu Server cài sẵn `unattended-upgrades`, tự cài bản vá bảo mật mỗi ngày ([bài 25](/bai/apt-va-dpkg)). Bản vá kernel chỉ có tác dụng sau khi khởi động lại.

## 2. Tắt dịch vụ không dùng

```bash
systemctl list-units --type=service --state=running --no-legend | awk '{print $1}'
```

```text
cron.service
dbus.service
getty@tty1.service
ModemManager.service
multipathd.service
packagekit.service
polkit.service
rsyslog.service
serial-getty@ttyS0.service
ssh.service
...
```

Với từng dịch vụ, hỏi: máy này có cần không? Ví dụ máy ảo cloud không có modem nên `ModemManager` thừa:

```bash
sudo systemctl disable --now ModemManager
```

Xem thêm những gì đang chờ kết nối qua socket của systemd: `systemctl list-sockets`. Gỡ hẳn phần mềm không dùng bằng `apt purge` thì tốt hơn chỉ tắt.

Ngày xưa, các dịch vụ ít dùng được chạy qua **inetd/xinetd** (một siêu dịch vụ lắng nghe thay cho nhiều dịch vụ). Ngày nay việc đó do **systemd socket** làm (như `ssh.socket` trên Ubuntu 24.04). Các dịch vụ cổ không mã hoá như `telnet`, `rsh`, `ftp` thì không bao giờ nên bật.

## 3. SSH an toàn

Cấu hình máy chủ SSH nằm trong `/etc/ssh/sshd_config`, và các file trong `/etc/ssh/sshd_config.d/` (được đọc trước, **giá trị nào đọc trước thì thắng**). Nên tạo file riêng thay vì sửa file chính:

```bash
sudo vim /etc/ssh/sshd_config.d/10-baomat.conf
```

```ini
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
X11Forwarding no
AllowUsers hocvien deploy
```

| Dòng | Ý nghĩa |
|---|---|
| `PermitRootLogin no` | Không cho root đăng nhập qua SSH. Đăng nhập bằng user thường rồi `sudo` |
| `PasswordAuthentication no` | Chỉ cho đăng nhập bằng SSH key. Dò mật khẩu trở nên vô ích |
| `KbdInteractiveAuthentication no` | Tắt luôn kiểu hỏi mật khẩu tương tác |
| `MaxAuthTries 3` | Tối đa 3 lần thử mỗi kết nối |
| `X11Forwarding no` | Server không cần giao diện đồ hoạ |
| `AllowUsers hocvien deploy` | Chỉ những user này được SSH vào |

> **Trước khi tắt đăng nhập bằng mật khẩu, phải chắc là bạn đã đăng nhập được bằng SSH key** ([bài 49](/bai/ssh-va-ma-hoa)).

Kiểm tra cấu hình và áp dụng:

```bash
sudo sshd -t && echo "cấu hình sshd hợp lệ"
sudo systemctl reload ssh
sudo sshd -T | grep -E "^(permitrootlogin|passwordauthentication|maxauthtries) "
```

| Lệnh | Làm gì |
|---|---|
| `sshd -t` | Kiểm tra cú pháp (**t**est). Lỗi cú pháp mà vẫn khởi động lại là mất SSH |
| `systemctl reload ssh` | Áp dụng cho các kết nối mới, không cắt phiên đang mở |
| `sshd -T` | In cấu hình **thực tế** sau khi gộp mọi file |

Kết quả `sshd -T` trên cloud image Ubuntu (đã tắt mật khẩu sẵn):

```text
maxauthtries 6
permitrootlogin without-password
passwordauthentication no
```

`without-password` nghĩa là root chỉ đăng nhập được bằng key, không bằng mật khẩu.

### Đổi cổng SSH trên Ubuntu 24.04

Đổi cổng 22 sang cổng khác làm giảm hẳn số lần dò tự động (không thay được key và tường lửa). Ubuntu 24.04 mở cổng SSH qua **`ssh.socket`** của systemd, nên `reload` thôi là chưa đủ:

```bash
sudo ufw allow 2200/tcp
printf "Port 22\nPort 2200\n" | sudo tee /etc/ssh/sshd_config.d/40-port.conf
sudo systemctl daemon-reload
sudo systemctl restart ssh.socket
ss -tln | grep -E ':22 |:2200 '
```

```text
LISTEN 0      4096         0.0.0.0:22        0.0.0.0:*
LISTEN 0      4096         0.0.0.0:2200      0.0.0.0:*
LISTEN 0      4096            [::]:22           [::]:*
LISTEN 0      4096            [::]:2200         [::]:*
```

Ví dụ giữ cả 22 và 2200 để thử. Đăng nhập được bằng `ssh -p 2200` rồi mới bỏ dòng `Port 22`, và đóng cổng 22 trên tường lửa.

## 4. Tường lửa với ufw

Linux lọc gói tin ngay trong kernel (**netfilter**). Các công cụ chỉ là lớp cấu hình bên trên:

| Công cụ | Có trên | Ghi chú |
|---|---|---|
| **ufw** (Uncomplicated Firewall) | Ubuntu | Đơn giản nhất. Bài này dùng ufw |
| **firewalld** (`firewall-cmd`) | RHEL, Rocky, Fedora | Quản lý theo vùng (zone) |
| `nft` (nftables) | Mọi bản mới | Công cụ cấp thấp hiện đại |
| `iptables` | Hệ thống cũ (nay thường chạy trên nền nftables) | Gặp nhiều trong tài liệu, Docker, Kubernetes |

### Bật ufw an toàn

```bash
sudo ufw allow OpenSSH
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw --force enable
```

```text
Rules updated
Rules updated (v6)
Default incoming policy changed to 'deny'
(be sure to update your rules accordingly)
Default outgoing policy changed to 'allow'
(be sure to update your rules accordingly)
Firewall is active and enabled on system startup
```

| Lệnh | Ý nghĩa |
|---|---|
| `ufw allow OpenSSH` | **Mở SSH trước tiên.** `OpenSSH` là hồ sơ ứng dụng (xem bằng `ufw app list`), bằng `22/tcp` |
| `default deny incoming` | Chặn mọi kết nối đi vào, trừ cổng được cho phép |
| `default allow outgoing` | Cho máy kết nối ra ngoài (cập nhật, gọi API) |
| `enable` | Bật và tự bật khi khởi động. `--force` bỏ câu hỏi xác nhận |

### Thêm, xem, xoá luật

```bash
sudo ufw allow 80/tcp
sudo ufw allow from 10.0.2.0/24 to any port 5432 proto tcp
sudo ufw limit 22/tcp
sudo ufw status verbose
```

```text
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
22/tcp (OpenSSH)           ALLOW IN    Anywhere
80/tcp                     ALLOW IN    Anywhere
5432/tcp                   ALLOW IN    10.0.2.0/24
22/tcp                     LIMIT IN    Anywhere
22/tcp (OpenSSH (v6))      ALLOW IN    Anywhere (v6)
80/tcp (v6)                ALLOW IN    Anywhere (v6)
22/tcp (v6)                LIMIT IN    Anywhere (v6)
```

| Lệnh | Ý nghĩa |
|---|---|
| `ufw allow 80/tcp` | Mở cổng 80 TCP cho mọi nơi. `ufw allow 443/tcp` cho HTTPS |
| `ufw allow from 10.0.2.0/24 to any port 5432 proto tcp` | Chỉ mạng nội bộ `10.0.2.0/24` được vào PostgreSQL |
| `ufw limit 22/tcp` | Cho phép nhưng chặn IP mở quá 6 kết nối trong 30 giây (chống dò) |
| `ufw deny 23/tcp` | Chặn cổng |
| `ufw deny from 203.0.113.5` | Chặn một IP |
| `ufw status verbose` | Xem luật và chính sách mặc định |
| `ufw status numbered` | Xem luật kèm số thứ tự |
| `ufw delete 3` | Xoá luật số 3 |
| `ufw delete allow 80/tcp` | Xoá theo nội dung luật |
| `ufw disable` | Tắt tường lửa |

Ví dụ ở trên có thừa: luật `ALLOW` cho 22 nằm trước `LIMIT` nên luật `LIMIT` không bao giờ được dùng (ufw áp luật **đầu tiên khớp**). Khi muốn giới hạn SSH, xoá luật allow và chỉ giữ `limit`.

```bash
sudo ufw status numbered
sudo ufw --force delete 3
```

```text
     To                         Action      From
     --                         ------      ----
[ 1] OpenSSH                    ALLOW IN    Anywhere
[ 2] 80/tcp                     ALLOW IN    Anywhere
[ 3] 5432/tcp                   ALLOW IN    10.0.2.0/24
[ 4] 22/tcp                     LIMIT IN    Anywhere
...
Rule deleted
```

> **Bẫy với Docker:** cổng của container mở bằng `docker run -p 8080:80` **đi vòng qua ufw** (Docker tự thêm luật iptables riêng). Muốn container chỉ nghe nội bộ, dùng `-p 127.0.0.1:8080:80`.

Trên cloud, còn có tường lửa của nhà cung cấp (Security Group của AWS, Firewall của DigitalOcean). Nên bật cả hai lớp.

### firewalld (RHEL, Rocky)

| Việc | Lệnh |
|---|---|
| Trạng thái | `sudo firewall-cmd --state`, `sudo firewall-cmd --list-all` |
| Mở dịch vụ / cổng (lâu dài) | `sudo firewall-cmd --permanent --add-service=http`, `--add-port=8080/tcp` |
| Áp dụng | `sudo firewall-cmd --reload` |

## 5. Chặn đăng nhập tạm thời: /etc/nologin

Khi bảo trì, không muốn user thường đăng nhập:

```bash
echo "Đang bảo trì đến 22h, vui lòng quay lại sau." | sudo tee /etc/nologin
sudo rm /etc/nologin
```

Khi file này tồn tại, user thường đăng nhập sẽ thấy nội dung file rồi bị ngắt. **root vẫn vào được.** Lệnh `shutdown` tự tạo `/run/nologin` 5 phút trước giờ tắt máy ([bài 21](/bai/khoi-dong-he-thong)).

## 6. Tự chặn IP dò mật khẩu: fail2ban

`fail2ban` đọc log, thấy một IP đăng nhập sai nhiều lần thì thêm luật tường lửa chặn IP đó một thời gian.

```bash
sudo apt install fail2ban
sudo tee /etc/fail2ban/jail.local > /dev/null <<'EOF'
[sshd]
enabled  = true
maxretry = 5
findtime = 10m
bantime  = 1h
EOF
sudo systemctl restart fail2ban
sudo fail2ban-client status sshd
```

| Dòng | Ý nghĩa |
|---|---|
| `[sshd]` | Bảo vệ dịch vụ SSH |
| `maxretry = 5`, `findtime = 10m` | 5 lần sai trong 10 phút |
| `bantime = 1h` | Thì bị chặn 1 giờ |
| `fail2ban-client status sshd` | Xem số lần sai, các IP đang bị chặn |
| `fail2ban-client set sshd unbanip IP` | Bỏ chặn một IP (khi lỡ chặn nhầm chính mình) |

Cấu hình gốc ở `jail.conf`. Mọi thay đổi ghi vào `jail.local` để không bị ghi đè khi cập nhật.

## Danh sách kiểm tra cho server mới

| Việc | Lệnh / nơi |
|---|---|
| Cập nhật hệ thống | `sudo apt update && sudo apt upgrade` |
| Tạo user thường có sudo, dùng SSH key | [bài 17](/bai/lenh-quan-ly-nguoi-dung), [bài 49](/bai/ssh-va-ma-hoa) |
| Tắt root và mật khẩu qua SSH | `/etc/ssh/sshd_config.d/` |
| Tường lửa: chỉ mở 22, 80, 443 | `ufw` |
| Database chỉ nghe localhost | `ss -tlnp` ([bài 45](/bai/kiem-tra-mang)) |
| Tắt, gỡ dịch vụ thừa | `systemctl disable --now`, `apt purge` |
| Tự cập nhật bảo mật | `unattended-upgrades` |
| Chặn dò mật khẩu | `fail2ban` |
| Đúng giờ | `timedatectl` ([bài 40](/bai/ngay-gio-he-thong)) |
| Sao lưu | cron + tar/rsync ([bài 50](/bai/du-an-may-chu-web)) |

## Thực hành

Trên máy ảo.

1. Bật ufw theo đúng thứ tự an toàn: mở SSH, đặt mặc định, bật. Mở thêm 80 và 443. Xem trạng thái.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo ufw allow OpenSSH
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw --force enable
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw status verbose
   ```

   </details>

2. Chạy `python3 -m http.server 8080` trên máy ảo, thử truy cập từ máy thật (bị chặn). Mở cổng 8080 bằng ufw, thử lại, rồi xoá luật đó.

   <details>
   <summary>Xem đáp án</summary>

   Lấy IP máy ảo bằng `ip -br a` (Multipass: `multipass list`). Trên máy thật: `curl -m 3 http://IP-may-ao:8080` sẽ hết giờ chờ. Trên máy ảo: `sudo ufw allow 8080/tcp`, thử lại thì nhận được danh sách file. Xoá: `sudo ufw delete allow 8080/tcp`.

   </details>

3. Tạo file `/etc/ssh/sshd_config.d/10-baomat.conf` với `PermitRootLogin no`, `MaxAuthTries 3`, `X11Forwarding no`. Kiểm tra cú pháp, áp dụng, xác nhận bằng `sshd -T`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   printf "PermitRootLogin no\nMaxAuthTries 3\nX11Forwarding no\n" | sudo tee /etc/ssh/sshd_config.d/10-baomat.conf
   sudo sshd -t && sudo systemctl reload ssh
   sudo sshd -T | grep -E "^(permitrootlogin|maxauthtries|x11forwarding) "
   ```

   </details>

4. Liệt kê các dịch vụ đang chạy, chọn một dịch vụ thật sự không cần trên máy ảo (ví dụ `ModemManager`), tắt nó và chặn không cho tự bật lại.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   systemctl list-units --type=service --state=running
   sudo systemctl disable --now ModemManager
   sudo systemctl mask ModemManager
   ```

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Bật tường lửa an toàn | `ufw allow OpenSSH` → `ufw default deny incoming` → `ufw enable` |
| Mở / giới hạn / chặn | `ufw allow 443/tcp`, `ufw limit 22/tcp`, `ufw deny from IP` |
| Xem / xoá luật | `ufw status numbered`, `ufw delete N` |
| SSH an toàn | `PermitRootLogin no`, `PasswordAuthentication no` trong `sshd_config.d/` |
| Kiểm tra và áp dụng sshd | `sudo sshd -t && sudo systemctl reload ssh` |
| Đổi cổng SSH (Ubuntu 24.04) | sửa `Port` → `daemon-reload` → `restart ssh.socket` |
| Tắt dịch vụ thừa | `sudo systemctl disable --now tên` |
| Chặn đăng nhập khi bảo trì | `/etc/nologin` |
| Tự chặn IP dò mật khẩu | `fail2ban`, `fail2ban-client status sshd` |
