---
summary: Ba mảng có trong chuẩn LPIC-1 nhưng ít gặp trên server — giao diện đồ hoạ (X11, Wayland, môi trường desktop, trợ năng), máy in (CUPS, lp, lpstat) và gửi mail từ máy chủ (MTA như Postfix, lệnh mail, /etc/aliases). Bài này chỉ dạy đủ để hiểu khái niệm và gõ được các lệnh cơ bản.
minutes: 25
commands: [X11, Wayland, DISPLAY, ssh -X, lp, lpstat, cancel, lpadmin, cupsd, mail, mailq, newaliases, /etc/aliases, sendmail]
quiz:
  - q: Trong hệ thống đồ hoạ X11, chương trình nào điều khiển màn hình, bàn phím, chuột?
    options: ["X client (ứng dụng)", "X server", "Display manager", "Window manager"]
    answer: 1
    explain: "Trong X11, X server nằm ở máy có màn hình và vẽ thứ mà các X client (ứng dụng như Firefox) yêu cầu. Nhờ vậy ứng dụng chạy trên máy khác vẫn hiện được qua mạng (`ssh -X`)."
  - q: Wayland là gì?
    options: ["Một môi trường desktop", "Giao thức hiển thị mới thay thế X11, mặc định trên Ubuntu và Fedora mới", "Trình quản lý cửa sổ", "Phần mềm in ấn"]
    answer: 1
    explain: "Wayland đơn giản và an toàn hơn X11. Ứng dụng X11 cũ vẫn chạy được nhờ lớp tương thích XWayland."
  - q: Lệnh nào gửi file bao-cao.pdf tới máy in tên ao?
    options: ["print bao-cao.pdf", "lp -d ao bao-cao.pdf", "lpstat ao bao-cao.pdf", "cups bao-cao.pdf"]
    answer: 1
    explain: "`lp -d máy-in file` (hoặc kiểu BSD `lpr -P máy-in file`). `lpstat -o` xem hàng đợi, `cancel` huỷ lệnh in."
  - q: File /etc/aliases dùng để làm gì?
    options: ["Lưu alias của bash", "Chuyển thư gửi tới một tên (ví dụ postmaster, root) sang hộp thư hoặc địa chỉ khác", "Lưu tên máy", "Lưu mật khẩu mail"]
    answer: 1
    explain: "Ví dụ dòng `root: admin@congty.vn` để thư cảnh báo gửi cho root được chuyển tới email thật. Sửa xong phải chạy `newaliases`."
  - q: MTA trên server Linux làm nhiệm vụ gì?
    options: ["Hiển thị email", "Nhận và chuyển thư điện tử giữa các máy chủ (giao thức SMTP)", "Lọc spam trên trình duyệt", "In email"]
    answer: 1
    explain: "MTA (Mail Transfer Agent) như Postfix, Exim, Sendmail chuyển thư qua SMTP. Cron, các công cụ giám sát dùng lệnh `sendmail` hoặc `mail` để gửi thư qua MTA."
---

Ba phần trong bài có trong mục thi LPIC-1 102 (106.1–106.3, 108.3, 108.4). Trên server thật bạn ít đụng tới, nhưng cần hiểu để đọc tài liệu và làm bài thi. Riêng phần mail có ích trên server: cron và các công cụ giám sát dùng nó để gửi cảnh báo.

## Giao diện đồ hoạ

### Các tầng của giao diện đồ hoạ

| Tầng | Là gì | Ví dụ |
|---|---|---|
| Giao thức hiển thị | Cách ứng dụng vẽ lên màn hình và nhận phím, chuột | **X11** (Xorg, cũ), **Wayland** (mới) |
| Display manager | Màn hình đăng nhập đồ hoạ, chạy như một dịch vụ systemd | GDM (GNOME), SDDM (KDE), LightDM |
| Window manager / compositor | Vẽ khung cửa sổ, di chuyển, thu nhỏ | Mutter, KWin, i3 |
| Môi trường desktop | Trọn bộ: thanh tác vụ, trình quản lý file, cài đặt | **GNOME** (mặc định Ubuntu, Fedora), **KDE Plasma**, Xfce, Cinnamon, MATE |

### X11 và Wayland

**X11** (X Window System, bản cài phổ biến là Xorg) dùng mô hình máy chủ – máy khách:

| Thành phần | Vai trò |
|---|---|
| **X server** | Chạy ở máy có màn hình, điều khiển màn hình, bàn phím, chuột |
| **X client** | Ứng dụng (Firefox, terminal…), gửi yêu cầu vẽ tới X server |
| Biến `DISPLAY` | Cho ứng dụng biết X server ở đâu, ví dụ `:0` là màn hình đầu tiên của máy này |

Nhờ mô hình này, ứng dụng chạy trên server vẫn hiện cửa sổ ở máy của bạn qua SSH:

```bash
ssh -X user@server
xclock
```

`-X` bật chuyển tiếp X11 (server phải bật `X11Forwarding yes` trong `/etc/ssh/sshd_config`). Cấu hình Xorg cũ nằm ở `/etc/X11/xorg.conf` hoặc `/etc/X11/xorg.conf.d/`. Ngày nay Xorg tự nhận phần cứng nên hiếm khi phải sửa. Log của Xorg: `/var/log/Xorg.0.log`.

**Wayland** là giao thức mới thay X11: đơn giản hơn, an toàn hơn (ứng dụng không đọc trộm được cửa sổ của ứng dụng khác). Ubuntu, Fedora mới mặc định dùng Wayland. Ứng dụng X11 cũ chạy qua lớp tương thích **XWayland**. Xem phiên hiện tại dùng gì: `echo $XDG_SESSION_TYPE` (in `wayland` hoặc `x11`).

Bật / tắt giao diện đồ hoạ khi khởi động là đổi target ([bài 24](/bai/khoi-dong-he-thong)): `graphical.target` hoặc `multi-user.target`.

### Trợ năng (accessibility)

Các môi trường desktop có sẵn công cụ hỗ trợ người khuyết tật, bật trong **Settings → Accessibility**:

| Công cụ | Giúp gì |
|---|---|
| Trình đọc màn hình (Orca) | Đọc to nội dung cho người khiếm thị |
| Kính lúp, độ tương phản cao, chữ lớn | Người nhìn kém |
| Bàn phím ảo (on-screen keyboard) | Người khó dùng bàn phím thật |
| Sticky keys | Bấm phím tổ hợp (Ctrl+C) từng phím một |
| Slow keys, bounce keys | Bỏ qua phím bấm quá nhanh hoặc bị lặp do run tay |
| Mouse keys | Điều khiển chuột bằng bàn phím số |

## Máy in: CUPS

**CUPS** (Common UNIX Printing System) là hệ thống in của Linux và macOS. Dịch vụ `cupsd` quản lý máy in và hàng đợi in. Trang quản trị web ở `http://localhost:631`. Cấu hình nằm trong `/etc/cups/`.

Thử với một máy in giả (ghi ra `/dev/null`), chạy bằng root (`sudo -i`):

```bash
apt install -y cups cups-client
lpstat -r
cupsd
lpstat -r
lpadmin -p ao -E -v file:///dev/null -m drv:///sample.drv/generic.ppd
lpstat -p
echo "hello" | lp -d ao
lpstat -o
cancel -a ao
```

```text
scheduler is not running
scheduler is running
lpadmin: Printer drivers are deprecated and will stop working in a future version of CUPS.
printer ao is idle.  enabled since Fri Nov 27 16:05:23 2026
request id is ao-1 (0 file(s))
ao-1                    root              1024   Fri Nov 27 16:05:23 2026
```

| Lệnh | Làm gì |
|---|---|
| `lpstat -r` | Dịch vụ in có đang chạy không |
| `lpstat -p` | Các máy in và trạng thái |
| `lpstat -o` | Các lệnh in đang chờ trong hàng đợi |
| `lpstat -d` | Máy in mặc định |
| `lp -d ao file` | In file ra máy in `ao`. `-n 2` in 2 bản |
| `cancel ao-1` / `cancel -a ao` | Huỷ một lệnh in / mọi lệnh in của máy in `ao` |
| `lpadmin -p ao -E -v URI -m driver` | Thêm máy in |
| `lpadmin -d ao` | Đặt `ao` làm máy in mặc định |

Bộ lệnh kiểu BSD cũ vẫn dùng được (trên Ubuntu nằm trong gói `cups-bsd`):

| BSD | CUPS / System V | Làm gì |
|---|---|---|
| `lpr -P ao file` | `lp -d ao file` | In |
| `lpq -P ao` | `lpstat -o ao` | Xem hàng đợi |
| `lprm 1` | `cancel 1` | Huỷ lệnh in |

## Gửi mail từ server: MTA

Các thành phần của thư điện tử:

| Thành phần | Vai trò | Ví dụ |
|---|---|---|
| **MTA** (Mail Transfer Agent) | Nhận và chuyển thư giữa các máy chủ qua giao thức SMTP (cổng 25) | **Postfix** (mặc định Ubuntu), Exim (Debian), Sendmail (cũ) |
| MDA (Mail Delivery Agent) | Đưa thư vào hộp thư của user | Dovecot, procmail |
| MUA (Mail User Agent) | Chương trình đọc và gửi thư | `mail`, mutt, Thunderbird |

MTA nào cũng cung cấp lệnh `/usr/sbin/sendmail` tương thích với Sendmail cũ, nên phần mềm khác (cron, script) chỉ cần gọi `sendmail` hay `mail` là được.

Thử với Postfix ở chế độ chỉ gửi trong máy (Local only):

```bash
echo "Noi dung thu" | mail -s "Thu nghiem" root
mailq
ls /var/mail/
head -3 /var/mail/root
```

```text
Mail queue is empty
root
From root@734d653f5973  Fri Nov 27 16:05:24 2026
Return-Path: <root@734d653f5973>
X-Original-To: root
```

| Lệnh / file | Làm gì |
|---|---|
| `echo "nội dung" \| mail -s "tiêu đề" người-nhận` | Gửi thư (lệnh `mail` trong gói `mailutils`) |
| `mail` (không đối số) | Đọc hộp thư của mình |
| `mailq` | Thư đang chờ gửi (hàng đợi của MTA). `Mail queue is empty` là đã gửi hết |
| `/var/mail/tên-user` | Hộp thư của user (định dạng mbox) |
| `/etc/aliases` | Chuyển thư từ một tên sang người nhận khác |
| `newaliases` | Cập nhật sau khi sửa `/etc/aliases` |
| `~/.forward` | User tự chuyển thư của mình sang địa chỉ khác (ghi một địa chỉ email vào file) |

Ví dụ `/etc/aliases`:

```text
postmaster:    root
root:          admin@congty.vn
```

Thư gửi cho `postmaster` chuyển sang `root`, thư gửi cho `root` chuyển ra email thật. Nhờ vậy cảnh báo của cron (cron gửi kết quả job cho chủ crontab), `unattended-upgrades`, `smartd` (theo dõi ổ đĩa) đến được tay bạn.

> Tự chạy máy chủ mail gửi ra Internet rất khó: phải cấu hình SPF, DKIM, DMARC, reverse DNS, nếu không thư sẽ vào thư rác. Nhiều nhà cung cấp máy chủ còn chặn cổng 25. Thực tế người ta cấu hình Postfix gửi qua dịch vụ ngoài (relay) như Amazon SES, SendGrid, hoặc SMTP của Gmail.

## Thực hành

1. (Máy có giao diện đồ hoạ) Phiên đăng nhập đang dùng X11 hay Wayland? Biến `DISPLAY` là gì?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   echo $XDG_SESSION_TYPE
   echo $DISPLAY
   ```

   </details>

2. Chạy bằng root (`sudo -i`), cài CUPS, tạo máy in giả như trong bài, in một file, xem hàng đợi rồi huỷ.

3. Chạy bằng root, cài `postfix` (chọn **Local only**) và `mailutils`, gửi một thư cho `root`, rồi đọc bằng lệnh `mail`.

   <details>
   <summary>Xem cách làm</summary>

   ```bash
   apt update && apt install -y postfix mailutils
   postfix start
   echo "Xin chao" | mail -s "Thu" root
   mail
   ```

   Trong `mail`, gõ số thứ tự thư để đọc, `q` để thoát.

   </details>

## Tóm tắt

| Mảng | Cần nhớ |
|---|---|
| Đồ hoạ | X11 (X server + X client, `DISPLAY`, `ssh -X`), Wayland thay thế X11, display manager (GDM, SDDM), desktop (GNOME, KDE, Xfce) |
| Trợ năng | Orca, kính lúp, bàn phím ảo, sticky / slow / bounce keys |
| In | CUPS (`cupsd`, cổng 631), `lp -d`, `lpstat -p -o`, `cancel`, `lpadmin` |
| Mail | MTA (Postfix, Exim, Sendmail), `mail -s`, `mailq`, `/etc/aliases` + `newaliases`, `~/.forward` |
