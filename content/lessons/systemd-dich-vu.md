---
summary: Bật, tắt, khởi động lại, cho tự chạy khi bật máy và xem trạng thái dịch vụ bằng systemctl. Đọc kết quả systemctl status, tìm lỗi khi dịch vụ không lên, rồi tự viết unit file để chạy ứng dụng của mình như một dịch vụ — tự khởi động lại khi bị chết.
minutes: 50
commands: [systemctl start, systemctl stop, systemctl restart, systemctl reload, systemctl status, systemctl enable, systemctl disable, systemctl mask, systemctl daemon-reload, systemctl cat, systemctl edit, systemctl list-units, systemctl --failed]
quiz:
  - q: Khác nhau giữa systemctl start nginx và systemctl enable nginx?
    options: ["Giống nhau", "start chạy ngay bây giờ; enable cho tự chạy ở các lần khởi động sau", "enable chạy ngay, start chạy khi khởi động", "start cần root, enable thì không"]
    answer: 1
    explain: "Hai việc độc lập. Muốn cả hai thì dùng `systemctl enable --now nginx`. Quên `enable` là lỗi kinh điển: dịch vụ chạy tốt cho đến lần khởi động lại máy đầu tiên."
  - q: Vừa sửa file /etc/systemd/system/app.service, cần làm gì trước khi restart?
    options: ["Không cần gì", "systemctl daemon-reload", "reboot", "systemctl enable app"]
    answer: 1
    explain: "systemd đọc unit file vào bộ nhớ. Sau khi sửa, phải `daemon-reload` để systemd đọc lại, nếu không nó vẫn chạy theo cấu hình cũ (và sẽ nhắc bạn bằng một cảnh báo)."
  - q: "Trong `systemctl status`, `Active: failed (Result: exit-code)` và `status=203/EXEC` nghĩa là gì?"
    options: ["Dịch vụ chạy bình thường", "systemd không chạy được chương trình trong ExecStart (sai đường dẫn hoặc không có quyền chạy)", "Thiếu RAM", "Dịch vụ bị mask"]
    answer: 1
    explain: "Mã 203/EXEC là lỗi ở bước chạy chương trình: file không tồn tại, thiếu quyền x, hoặc dòng shebang sai. Xem chi tiết bằng `journalctl -u tên -n 50`."
  - q: "`Restart=on-failure` trong unit file làm gì?"
    options: ["Khởi động lại máy khi dịch vụ lỗi", "Tự chạy lại dịch vụ khi nó thoát vì lỗi hoặc bị giết bởi tín hiệu", "Chạy lại mỗi giờ", "Không cho dịch vụ dừng"]
    answer: 1
    explain: "Nếu tiến trình chết với mã lỗi khác 0 hoặc bị kill, systemd chạy lại sau `RestartSec` giây. Dừng bằng `systemctl stop` thì không tính là lỗi nên không chạy lại."
  - q: Muốn chắc chắn một dịch vụ KHÔNG THỂ được bật, kể cả khi dịch vụ khác cần nó, dùng lệnh nào?
    options: ["systemctl disable", "systemctl stop", "systemctl mask", "systemctl kill"]
    answer: 2
    explain: "`mask` trỏ unit vào `/dev/null`, mọi cách bật đều thất bại (`Unit ... is masked`). `disable` chỉ bỏ tự chạy khi khởi động, vẫn bật tay hoặc bị kéo theo được."
  - q: "Phần nào trong unit file quyết định dịch vụ được bật theo target nào khi chạy enable?"
    options: ["[Unit] After=", "[Service] ExecStart=", "[Install] WantedBy=", "[Service] User="]
    answer: 2
    explain: "`WantedBy=multi-user.target` nghĩa là `enable` sẽ tạo symlink trong `multi-user.target.wants/`, nên dịch vụ chạy khi máy đạt multi-user.target."
---

> Kết quả trong bài lấy từ Ubuntu 24.04 có cài nginx (`sudo apt install nginx`).

## systemd và unit

**systemd** là tiến trình số 1 trên hầu hết bản Linux hiện nay. Nó quản lý mọi thứ cần chạy dưới dạng **unit**. Mỗi unit là một file cấu hình:

| Loại unit | Đuôi | Ví dụ |
|---|---|---|
| Dịch vụ | `.service` | `nginx.service`, `ssh.service` |
| Hẹn giờ | `.timer` | `logrotate.timer` ([bài mở rộng 18](/bai/lap-lich-cong-viec)) |
| Nhóm mục tiêu | `.target` | `multi-user.target` ([bài 24](/bai/khoi-dong-he-thong)) |
| Điểm gắn ổ | `.mount` | `home.mount` |
| Socket | `.socket` | `ssh.socket` |

Unit file nằm ở hai chỗ:

| Thư mục | Chứa | Sửa được không |
|---|---|---|
| `/usr/lib/systemd/system/` | Unit do gói phần mềm cài vào | Không nên. Cập nhật gói sẽ ghi đè |
| `/etc/systemd/system/` | Unit bạn tự viết, hoặc phần ghi đè | Có. **Ưu tiên hơn** thư mục trên |

Gõ tên dịch vụ có thể bỏ đuôi `.service`: `systemctl status nginx` = `systemctl status nginx.service`.

## Bật, tắt, khởi động lại

```bash
sudo systemctl stop nginx
systemctl is-active nginx
sudo systemctl start nginx
systemctl is-active nginx
```

```text
inactive
active
```

| Lệnh | Làm gì |
|---|---|
| `systemctl start tên` | Chạy dịch vụ ngay |
| `systemctl stop tên` | Dừng dịch vụ |
| `systemctl restart tên` | Dừng rồi chạy lại. Dùng sau khi đổi cấu hình hoặc cập nhật phiên bản |
| `systemctl reload tên` | Bảo dịch vụ đọc lại cấu hình **mà không dừng** (không phải dịch vụ nào cũng hỗ trợ). Với nginx thì không làm rớt kết nối đang có |
| `systemctl reload-or-restart tên` | Reload nếu được, không thì restart |
| `systemctl is-active tên` | In `active` / `inactive` / `failed`. Mã thoát 0 nếu đang chạy, tiện dùng trong script |

Các lệnh làm thay đổi trạng thái cần `sudo`. Lệnh chỉ xem (`status`, `is-active`, `list-units`) thì không cần.

## Tự chạy khi khởi động: enable, disable

```bash
systemctl is-enabled nginx
sudo systemctl disable nginx
sudo systemctl enable --now nginx
```

| Lệnh | Làm gì |
|---|---|
| `systemctl enable tên` | Cho tự chạy ở các lần khởi động **sau**. Không chạy ngay |
| `systemctl enable --now tên` | Enable và start luôn. **Hay dùng nhất** khi cài dịch vụ mới |
| `systemctl disable tên` | Bỏ tự chạy khi khởi động. Không dừng ngay (thêm `--now` để dừng luôn) |
| `systemctl is-enabled tên` | `enabled`, `disabled`, `static` (không tự enable được, chỉ chạy khi bị gọi), `masked` |

`enable` thực chất tạo một symlink:

```text
Created symlink /etc/systemd/system/multi-user.target.wants/chao.service → /etc/systemd/system/chao.service.
```

Nghĩa là "khi đạt `multi-user.target` thì cũng chạy `chao.service`".

### mask: chặn hẳn

```bash
sudo systemctl mask nginx
sudo systemctl start nginx
sudo systemctl unmask nginx
```

```text
Created symlink /etc/systemd/system/nginx.service → /dev/null.
Failed to start nginx.service: Unit nginx.service is masked.
Removed "/etc/systemd/system/nginx.service".
```

`mask` trỏ unit vào `/dev/null`, không cách nào bật được, kể cả khi dịch vụ khác cần nó. Dùng khi muốn chắc chắn một dịch vụ không bao giờ chạy (ví dụ hai phần mềm xung đột cổng).

## Đọc systemctl status

```bash
systemctl status nginx
```

```text
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/usr/lib/systemd/system/nginx.service; enabled; preset: enabled)
     Active: active (running) since Fri 2026-11-27 08:22:16 UTC; 13s ago
       Docs: man:nginx(8)
    Process: 61 ExecStartPre=/usr/sbin/nginx -t -q -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
    Process: 66 ExecStart=/usr/sbin/nginx -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
   Main PID: 71 (nginx)
      Tasks: 5 (limit: 3162)
     Memory: 3.7M (peak: 4.1M)
        CPU: 19ms
     ...
```

| Dòng | Ý nghĩa |
|---|---|
| `●` (đầu dòng) | Chấm xanh là đang chạy, `×` đỏ là lỗi, `○` trắng là không chạy |
| `Loaded: loaded (...service; enabled; ...)` | Đường dẫn unit file, và có tự chạy khi khởi động không (`enabled`) |
| `Active: active (running) since ...` | Đang chạy từ lúc nào. Các trạng thái khác: `inactive (dead)`, `failed`, `activating` |
| `Process: ... ExecStartPre=...` | Lệnh chạy trước khi khởi động (nginx kiểm tra cấu hình bằng `nginx -t`) |
| `Main PID: 71` | PID của tiến trình chính |
| `Tasks`, `Memory`, `CPU` | Tài nguyên đang dùng |
| Các dòng cuối | Vài dòng log gần nhất của dịch vụ |

Thêm `--no-pager` để in thẳng ra màn hình không qua `less`, `-l` để không cắt bớt dòng dài.

### Khi dịch vụ lỗi

```text
× hong.service - Dich vu hong
     Loaded: loaded (/etc/systemd/system/hong.service; static)
     Active: failed (Result: exit-code) since Fri 2026-11-27 08:22:57 UTC; 1s ago
    Process: 305 ExecStart=/opt/khongco.sh (code=exited, status=203/EXEC)
   Main PID: 305 (code=exited, status=203/EXEC)
```

Các bước tìm lỗi:

1. `systemctl status tên`: xem `Active` và mã thoát.
2. `journalctl -u tên -n 50 --no-pager`: đọc 50 dòng log gần nhất của dịch vụ ([bài mở rộng 17](/bai/nhat-ky-he-thong)).
3. Với nginx, kiểm tra cấu hình: `sudo nginx -t`.
4. Thử chạy lệnh trong `ExecStart` bằng tay, bằng đúng user của dịch vụ, để thấy lỗi trực tiếp.

| Mã hay gặp | Nghĩa |
|---|---|
| `status=203/EXEC` | Không chạy được file trong `ExecStart`: sai đường dẫn, thiếu quyền `x`, shebang sai |
| `status=217/USER` | User trong `User=` không tồn tại |
| `status=1/FAILURE` | Chương trình tự thoát với lỗi. Xem log của chính nó |
| `code=killed, status=9/KILL` | Bị giết bằng SIGKILL, thường do hết RAM (OOM) |

Liệt kê mọi dịch vụ đang lỗi:

```bash
systemctl --failed
```

```text
  UNIT         LOAD   ACTIVE SUB    DESCRIPTION
● hong.service loaded failed failed Dich vu hong
```

## Xem danh sách unit

| Lệnh | Làm gì |
|---|---|
| `systemctl list-units --type=service` | Dịch vụ đang được nạp (đang chạy, đã chạy xong, lỗi) |
| `systemctl list-units --type=service --state=running` | Chỉ dịch vụ đang chạy |
| `systemctl list-unit-files --type=service` | Mọi unit file đã cài, kèm trạng thái enabled/disabled |
| `systemctl list-dependencies multi-user.target` | Những gì được kéo theo khi đạt target |
| `systemctl cat tên` | In nội dung unit file (kể cả phần ghi đè) |

## Viết unit file cho ứng dụng của mình

Ví dụ: chạy một ứng dụng thành dịch vụ, chạy bằng user riêng, tự khởi động lại khi chết, tự chạy khi bật máy. Ứng dụng giả lập là một script in log mỗi 5 giây:

```bash
sudo useradd -r -s /usr/sbin/nologin chaoapp
sudo mkdir -p /opt/chao
sudo tee /opt/chao/chao.sh > /dev/null <<'EOF'
#!/bin/bash
echo "chao-app bat dau, PORT=$PORT"
while true; do
  echo "van chay luc $(date +%T)"
  sleep 5
done
EOF
sudo chmod 755 /opt/chao/chao.sh
```

Tạo unit file `/etc/systemd/system/chao.service`:

```ini
[Unit]
Description=Ung dung chao (vi du)
After=network.target

[Service]
Type=simple
User=chaoapp
Environment=PORT=3000
ExecStart=/opt/chao/chao.sh
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
```

| Dòng | Ý nghĩa |
|---|---|
| `[Unit]` | Phần mô tả và thứ tự |
| `Description=` | Tên hiển thị trong `status` và log |
| `After=network.target` | Chạy sau khi mạng đã được thiết lập (chỉ là **thứ tự**, không bắt buộc mạng phải có) |
| `[Service]` | Cách chạy dịch vụ |
| `Type=simple` | Tiến trình trong `ExecStart` chính là dịch vụ, chạy ở phía trước (không tự tách ra nền). Hợp với Node.js, Python, Go… |
| `User=chaoapp` | Chạy bằng user `chaoapp`, không phải root |
| `Environment=PORT=3000` | Biến môi trường. Nhiều biến thì dùng `EnvironmentFile=/etc/chao.env` |
| `ExecStart=` | Lệnh chạy dịch vụ. Phải là **đường dẫn tuyệt đối** |
| `Restart=on-failure` | Tự chạy lại khi tiến trình thoát với lỗi hoặc bị giết. `always` là chạy lại cả khi thoát bình thường |
| `RestartSec=3` | Đợi 3 giây trước khi chạy lại |
| `WorkingDirectory=` | (Không có trong ví dụ) Thư mục làm việc của tiến trình |
| `[Install]` | Dùng khi `enable` |
| `WantedBy=multi-user.target` | `enable` sẽ gắn dịch vụ vào `multi-user.target` |

Tạo file bằng `sudo vim /etc/systemd/system/chao.service`, hoặc `sudo systemctl edit --force --full chao.service` (tự tạo file và tự `daemon-reload` khi lưu).

Nạp và chạy:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now chao
systemctl status chao
```

| Lệnh | Làm gì |
|---|---|
| `daemon-reload` | Bảo systemd đọc lại unit file. **Bắt buộc** mỗi lần tạo hoặc sửa unit file |
| `enable --now chao` | Cho tự chạy khi khởi động và chạy ngay |

```text
● chao.service - Ung dung chao (vi du)
     Loaded: loaded (/etc/systemd/system/chao.service; enabled; preset: enabled)
     Active: active (running) since Fri 2026-11-27 08:22:46 UTC; 6s ago
   Main PID: 229 (chao.sh)
      Tasks: 2 (limit: 3162)
     Memory: 560.0K (peak: 1.4M)
        CPU: 4ms
             ├─229 /bin/bash /opt/chao/chao.sh
             └─234 sleep 5

Nov 27 08:22:46 lab systemd[1]: Started chao.service - Ung dung chao (vi du).
Nov 27 08:22:46 lab chao.sh[229]: chao-app bat dau, PORT=3000
```

Mọi thứ ứng dụng in ra stdout/stderr được systemd tự đưa vào journal. Không cần tự ghi file log.

### Thử khả năng tự chạy lại

```bash
sudo kill -9 $(systemctl show -p MainPID --value chao)
journalctl -u chao -n 3 --no-pager
```

```text
Nov 27 08:22:52 lab systemd[1]: chao.service: Main process exited, code=killed, status=9/KILL
Nov 27 08:22:55 lab systemd[1]: chao.service: Scheduled restart job, restart counter is at 1.
Nov 27 08:22:55 lab systemd[1]: Started chao.service - Ung dung chao (vi du).
```

| Phần | Ý nghĩa |
|---|---|
| `systemctl show -p MainPID --value chao` | In đúng PID chính của dịch vụ |
| `kill -9` | Giả lập ứng dụng bị chết đột ngột |
| Kết quả | 3 giây sau (`RestartSec=3`), systemd tự chạy lại |

## Ghi đè unit của gói cài sẵn

Muốn đổi một dòng trong `nginx.service` mà không sửa file gốc (sẽ bị ghi đè khi cập nhật gói):

```bash
sudo systemctl edit nginx
```

Lệnh mở trình soạn thảo cho file `/etc/systemd/system/nginx.service.d/override.conf`. Chỉ ghi phần muốn thay đổi, ví dụ:

```ini
[Service]
Restart=always
RestartSec=5
```

Lưu lại là xong (`systemctl edit` tự `daemon-reload`). Xem kết quả gộp bằng `systemctl cat nginx`.

## Thực hành

1. Cài nginx, kiểm tra nó đang chạy và đã enable. Dừng nginx, kiểm tra bằng `curl -I localhost`, rồi bật lại.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo apt update && sudo apt install -y nginx
   systemctl is-active nginx
   systemctl is-enabled nginx
   sudo systemctl stop nginx
   curl -I localhost
   sudo systemctl start nginx
   curl -I localhost
   ```

   Khi nginx dừng, `curl` báo `Connection refused`. Khi chạy, `curl` nhận `HTTP/1.1 200 OK`.

   </details>

2. Làm theo phần "Viết unit file" để tạo dịch vụ `chao`. Kiểm tra log, giết tiến trình chính và xác nhận nó tự chạy lại.

3. Đổi `PORT` của dịch vụ `chao` thành `8080`, áp dụng thay đổi, và xác nhận trong log.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo sed -i 's/PORT=3000/PORT=8080/' /etc/systemd/system/chao.service
   sudo systemctl daemon-reload
   sudo systemctl restart chao
   journalctl -u chao -n 3 --no-pager
   ```

   Dòng log mới có `PORT=8080`. Quên `daemon-reload` thì systemd vẫn chạy với `PORT=3000` và in cảnh báo `changed on disk. Run 'systemctl daemon-reload'`.

   </details>

4. Cố ý làm hỏng: đổi `ExecStart` thành `/opt/chao/khongco.sh`, reload, restart. Đọc `status`, mã lỗi là gì? Sửa lại cho đúng.

   <details>
   <summary>Xem đáp án</summary>

   Mã lỗi `status=203/EXEC`, vì file không tồn tại. `journalctl -u chao -n 10` có dòng `chao.service: Main process exited, code=exited, status=203/EXEC`. Kiểm tra bằng `ls -l` đường dẫn trong `ExecStart` là thấy file không có. Sửa lại đường dẫn, rồi `daemon-reload` và `restart`.

   </details>

5. Dọn dẹp: dừng và bỏ enable dịch vụ `chao` bằng một lệnh, xoá unit file, reload.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo systemctl disable --now chao
   sudo rm /etc/systemd/system/chao.service
   sudo systemctl daemon-reload
   ```

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Chạy / dừng / chạy lại / đọc lại cấu hình | `systemctl start` / `stop` / `restart` / `reload` |
| Cho tự chạy khi khởi động và chạy luôn | `systemctl enable --now tên` |
| Bỏ tự chạy và dừng luôn | `systemctl disable --now tên` |
| Chặn hẳn / bỏ chặn | `systemctl mask` / `unmask` |
| Xem trạng thái / dịch vụ lỗi | `systemctl status tên` / `systemctl --failed` |
| Xem log của dịch vụ | `journalctl -u tên -n 50` |
| Sau khi sửa unit file | `sudo systemctl daemon-reload` |
| Ghi đè unit của gói | `sudo systemctl edit tên` |
| Unit file tự viết đặt ở | `/etc/systemd/system/tên.service` |
