---
summary: Quy trình tìm lỗi mạng từ dưới lên — card mạng, IP, gateway, Internet, DNS, cổng dịch vụ — với các công cụ ping, traceroute/tracepath, ss, nc, curl. Đặc biệt là ss để biết dịch vụ đang lắng nghe ở cổng nào, và curl để kiểm tra web/API.
minutes: 45
commands: [ping, traceroute, tracepath, mtr, ss, nc, curl, wget, ip route get]
quiz:
  - q: "`ss -tulpn` dùng để làm gì?"
    options: ["Xem bảng định tuyến", "Liệt kê các cổng TCP/UDP đang lắng nghe kèm chương trình nào mở nó", "Ping nhiều máy", "Đổi IP"]
    answer: 1
    explain: "`-t` TCP, `-u` UDP, `-l` đang lắng nghe, `-p` chương trình (cần sudo để thấy của mọi user), `-n` hiện số thay vì tên. Lệnh này thay cho `netstat -tulpn`."
  - q: "Trong `ss -tlnp`, dịch vụ nghe ở `127.0.0.1:5432` và `0.0.0.0:22` khác nhau thế nào?"
    options: ["Không khác", "127.0.0.1 chỉ nhận kết nối từ chính máy đó; 0.0.0.0 nhận từ mọi địa chỉ (cả từ mạng ngoài)", "5432 nhanh hơn", "0.0.0.0 là cổng lỗi"]
    answer: 1
    explain: "Database nên nghe ở 127.0.0.1 (không lộ ra ngoài). Dịch vụ cần truy cập từ ngoài như SSH, web thì nghe ở 0.0.0.0 (mọi IPv4) hoặc [::] (mọi IPv6)."
  - q: ping 8.8.8.8 được nhưng ping google.com báo Name or service not known. Lỗi ở đâu?
    options: ["Mất mạng", "DNS (phân giải tên miền)", "Card mạng", "Tường lửa chặn ICMP"]
    answer: 1
    explain: "Ra được Internet bằng IP nghĩa là mạng ổn. Không đổi được tên thành IP là lỗi DNS ([bài sau](/bai/dns-phia-may-khach))."
  - q: "`nc -zv 10.0.0.5 5432` báo Connection refused. Nghĩa là gì?"
    options: ["Máy 10.0.0.5 không tồn tại", "Máy đó trả lời, nhưng không có chương trình nào nghe ở cổng 5432", "Đường mạng bị chặn", "Sai mật khẩu"]
    answer: 1
    explain: "`Connection refused` là máy kia chủ động từ chối, tức cổng đóng. Nếu bị tường lửa chặn hoặc máy không tồn tại thì thường thấy chờ đến hết thời gian (`timed out`)."
  - q: "`curl -I https://example.com` làm gì?"
    options: ["Tải cả trang", "Chỉ lấy phần header của phản hồi (mã trạng thái, loại nội dung...)", "Kiểm tra DNS", "Upload file"]
    answer: 1
    explain: "`-I` gửi yêu cầu HEAD, chỉ in header như `HTTP/2 200`. Dùng nhanh để kiểm tra web có sống không, có chuyển hướng không."
---

## Tìm lỗi từ dưới lên

Khi "không vào được web", đừng đoán. Kiểm tra lần lượt từng tầng, tầng dưới hỏng thì tầng trên không thể chạy:

| Bước | Kiểm tra | Lệnh | Hỏng thì |
|---|---|---|---|
| 1 | Card mạng có bật, có IP không | `ip -br a` | Cấu hình mạng ([bài 33](/bai/cau-hinh-mang)) |
| 2 | Có gateway không, gateway trả lời không | `ip route`, `ping <gateway>` | Mạng nội bộ, router |
| 3 | Ra Internet được không (bằng IP) | `ping -c 3 8.8.8.8` | Router, nhà mạng, tường lửa |
| 4 | Phân giải tên được không | `getent hosts example.com`, `dig example.com` | DNS ([bài mở rộng 25](/bai/dns-phia-may-khach)) |
| 5 | Cổng dịch vụ có mở không | `nc -zv host 443`, `ss -tlnp` (trên server) | Dịch vụ chưa chạy, tường lửa |
| 6 | Ứng dụng trả lời đúng không | `curl -I https://host` | Lỗi ứng dụng, cấu hình nginx |

## ping: máy kia có trả lời không

```bash
ping -c 3 8.8.8.8
```

```text
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=111 time=22.6 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=111 time=22.4 ms
64 bytes from 8.8.8.8: icmp_seq=3 ttl=111 time=22.6 ms

--- 8.8.8.8 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2003ms
rtt min/avg/max/mdev = 22.387/22.511/22.583/0.088 ms
```

| Phần | Ý nghĩa |
|---|---|
| `ping` | Gửi gói ICMP "echo request", đợi "echo reply" |
| `-c 3` | Gửi 3 gói rồi dừng (**c**ount). Không có `-c` thì chạy mãi, `Ctrl+C` để dừng |
| `-W 1` | Mỗi gói chờ tối đa 1 giây |
| `icmp_seq` | Số thứ tự gói |
| `ttl=111` | Số chặng còn lại của gói khi về đến nơi |
| `time=22.6 ms` | Thời gian đi và về (độ trễ) |
| `0% packet loss` | Không mất gói nào. Mất gói thường xuyên là mạng chập chờn |

Không trả lời:

```text
2 packets transmitted, 0 received, 100% packet loss, time 1005ms
```

> Không ping được chưa chắc là máy chết: nhiều máy chủ và tường lửa chặn ICMP. Cloud như AWS mặc định không cho ping. Lúc đó kiểm tra bằng cổng dịch vụ (`nc`, `curl`).

Tên miền không phân giải được:

```text
ping: khongtontai.example: Name or service not known
```

## traceroute, tracepath, mtr: gói tin đi qua đâu

```bash
traceroute -n -m 4 -q 1 8.8.8.8
```

```text
traceroute to 8.8.8.8 (8.8.8.8), 4 hops max, 60 byte packets
 1  172.17.0.1  0.050 ms
 2  192.168.0.1  1.475 ms
 3  192.168.1.1  1.534 ms
 ...
```

| Phần | Ý nghĩa |
|---|---|
| `-n` | Không đổi IP thành tên (chạy nhanh hơn) |
| `-m 4` | Tối đa 4 chặng |
| `-q 1` | Mỗi chặng thử 1 lần (mặc định 3) |
| Mỗi dòng | Một router trên đường đi: số thứ tự, IP, độ trễ |
| `* * *` | Router đó không trả lời (thường do chặn), chưa chắc là lỗi |

Ở ví dụ: chặng 1 là cổng ra (gateway) của máy, chặng 2–3 là router trong nhà, sau đó là mạng của nhà cung cấp. Gói tin dừng ở chặng nào thì sự cố ở quanh đó.

| Công cụ | Ghi chú |
|---|---|
| `traceroute` | Gói `traceroute` |
| `tracepath` | Có sẵn trên Ubuntu (gói `iputils-tracepath`), không cần root |
| `mtr` | Kết hợp ping và traceroute, cập nhật liên tục, thấy được chặng nào mất gói. `mtr -rwc 10 8.8.8.8` chạy 10 lần rồi in báo cáo |

## ss: cổng nào đang mở, ai đang kết nối

Đây là lệnh dùng nhiều nhất trên server: "nginx có đang nghe cổng 80 không?", "ai đang chiếm cổng 3000?".

```bash
sudo ss -tulpn
```

```text
Netid State  Recv-Q Send-Q  Local Address:Port Peer Address:PortProcess
udp   UNCONN 0      0          127.0.0.54:53        0.0.0.0:*    users:(("systemd-resolve",pid=527,fd=16))
udp   UNCONN 0      0       127.0.0.53%lo:53        0.0.0.0:*    users:(("systemd-resolve",pid=527,fd=14))
udp   UNCONN 0      0      10.0.2.15%ens3:68        0.0.0.0:*    users:(("systemd-network",pid=648,fd=21))
tcp   LISTEN 0      4096          0.0.0.0:22        0.0.0.0:*    users:(("sshd",pid=870,fd=3),("systemd",pid=1,fd=179))
tcp   LISTEN 0      4096    127.0.0.53%lo:53        0.0.0.0:*    users:(("systemd-resolve",pid=527,fd=15))
tcp   LISTEN 0      4096             [::]:22           [::]:*    users:(("sshd",pid=870,fd=4),("systemd",pid=1,fd=180))
```

| Tuỳ chọn | Ý nghĩa |
|---|---|
| `-t` / `-u` | TCP / UDP |
| `-l` | Chỉ socket đang lắng nghe (**l**istening) |
| `-p` | Chương trình nào (**p**rocess). Cần `sudo` để thấy tiến trình của user khác |
| `-n` | Hiện số (cổng 22) thay vì tên (`ssh`) |
| `-a` | Mọi socket, kể cả đang kết nối |
| `-s` | Thống kê tổng |

Đọc cột `Local Address:Port`:

| Giá trị | Ý nghĩa |
|---|---|
| `0.0.0.0:22` | Nghe cổng 22 trên **mọi** địa chỉ IPv4: máy khác kết nối vào được |
| `[::]:22` | Như trên, cho IPv6 |
| `127.0.0.53%lo:53` | Chỉ nghe trên loopback: **chỉ chính máy này** kết nối được |
| `10.0.2.15%ens3:68` | Chỉ nghe trên một IP / card cụ thể |

> **Kiểm tra bảo mật nhanh:** database (5432, 3306, 6379, 27017) phải nghe ở `127.0.0.1` hoặc IP mạng nội bộ, **không bao giờ** ở `0.0.0.0` trên server có IP công cộng mà không có tường lửa.

Kết nối đang có:

```bash
ss -tn state established
```

```text
Recv-Q Send-Q Local Address:Port Peer Address:Port Process
0      0          10.0.2.15:22       10.0.2.2:55300
```

Một kết nối SSH đang mở từ `10.0.2.2` (máy của bạn) vào cổng 22. Lọc theo cổng: `ss -tn 'sport = :443'`.

Lỗi hay gặp khi chạy ứng dụng: `Error: listen EADDRINUSE: address already in use :::3000`. Tìm thủ phạm: `sudo ss -tlnp | grep :3000`.

Lệnh cũ `netstat -tulpn` (gói `net-tools`) cho kết quả tương tự. `lsof -i :80` cũng tìm được ai đang dùng cổng 80.

## nc: cổng có mở không

`nc` (netcat) thử kết nối tới một cổng mà không cần chương trình chuyên dụng:

```bash
nc -zv -w 2 example.com 443
nc -zv -w 2 127.0.0.1 22
nc -zv -w 2 127.0.0.1 80
```

```text
Connection to example.com (172.66.147.243) 443 port [tcp/https] succeeded!
Connection to 127.0.0.1 22 port [tcp/ssh] succeeded!
nc: connect to 127.0.0.1 port 80 (tcp) failed: Connection refused
```

| Phần | Ý nghĩa |
|---|---|
| `-z` | Chỉ thử kết nối, không gửi dữ liệu |
| `-v` | In kết quả |
| `-w 2` | Chờ tối đa 2 giây |
| `succeeded!` | Cổng mở, có chương trình đang nghe |
| `Connection refused` | Máy trả lời nhưng **không có gì nghe** ở cổng đó: dịch vụ chưa chạy, hoặc nghe sai địa chỉ |
| Chờ rồi `timed out` | Không có trả lời: tường lửa chặn, sai IP, máy tắt |

Phân biệt `refused` và `timed out` giúp biết ngay nên tìm lỗi ở dịch vụ hay ở tường lửa.

## curl: kiểm tra web và API

```bash
curl -sI https://example.com | head -5
curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" https://example.com
```

```text
HTTP/2 200
date: Fri, 27 Nov 2026 09:13:04 GMT
content-type: text/html; charset=utf-8
server: cloudflare
last-modified: Thu, 26 Nov 2026 17:29:13 GMT
200 0.104198s
```

| Tuỳ chọn | Ý nghĩa |
|---|---|
| `-I` | Chỉ lấy header (yêu cầu HEAD) |
| `-s` | Không in thanh tiến trình (**s**ilent) |
| `-o /dev/null` | Vứt nội dung trả về |
| `-w "%{http_code} %{time_total}s\n"` | In mã trạng thái HTTP và tổng thời gian |
| `-v` | In chi tiết: phân giải DNS, kết nối, header gửi đi (`>`), header nhận về (`<`) |
| `-L` | Đi theo chuyển hướng (301, 302) |
| `-k` | Bỏ qua lỗi chứng chỉ HTTPS (chỉ dùng khi thử nghiệm) |
| `-H "Header: giá trị"` | Gửi thêm header |
| `-X POST -d '{"a":1}' -H "Content-Type: application/json"` | Gửi POST với dữ liệu JSON |
| `--resolve example.com:443:1.2.3.4` | Ép tên miền trỏ về IP chỉ định (thử server mới trước khi đổi DNS) |

```bash
curl -sv http://example.com -o /dev/null
```

```text
* Host example.com:80 was resolved.
* IPv4: 172.66.147.243, 104.20.23.154
*   Trying 172.66.147.243:80...
* Connected to example.com (172.66.147.243) port 80
> GET / HTTP/1.1
> Host: example.com
> User-Agent: curl/8.5.0
> Accept: */*
>
< HTTP/1.1 200 OK
< Date: Fri, 27 Nov 2026 09:13:04 GMT
```

Dòng `*` là các bước kết nối, `>` là yêu cầu gửi đi, `<` là phản hồi. Dừng ở bước nào thì lỗi ở bước đó: `Could not resolve host` (DNS), `Connection refused` (cổng đóng), `Connection timed out` (bị chặn), `SSL certificate problem` (chứng chỉ).

Mã trạng thái HTTP hay gặp:

| Mã | Ý nghĩa |
|---|---|
| 200 | Thành công |
| 301, 302 | Chuyển hướng (xem header `location`) |
| 400 | Yêu cầu sai |
| 401, 403 | Chưa đăng nhập / không có quyền |
| 404 | Không tìm thấy |
| 500 | Lỗi ứng dụng phía server |
| 502, 504 | nginx không gọi được ứng dụng phía sau / gọi quá lâu |

`wget URL` tải file về (`wget -qO- URL` in ra màn hình như `curl -s`).

## Thực hành

1. Làm lần lượt 6 bước kiểm tra ở đầu bài trên máy của bạn, ghi lại kết quả từng bước.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ip -br a
   ip route | grep default
   ping -c 2 $(ip route | awk '/default/ {print $3; exit}')
   ping -c 3 8.8.8.8
   getent hosts example.com
   nc -zv -w 2 example.com 443
   curl -sI https://example.com | head -1
   ```

   Dòng thứ ba lấy IP gateway từ `ip route` để ping.

   </details>

2. Liệt kê mọi cổng TCP đang nghe trên máy kèm chương trình. Dịch vụ nào chỉ nghe ở loopback?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo ss -tlnp
   ```

   Những dòng có địa chỉ `127.x.x.x` hoặc `[::1]` chỉ nghe ở loopback.

   </details>

3. Chạy một web server tạm ở cổng 8000, kiểm tra nó bằng `ss`, `nc`, `curl`, rồi dừng nó và kiểm tra lại.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   python3 -m http.server 8000 &
   ss -tlnp | grep 8000
   nc -zv 127.0.0.1 8000
   curl -sI http://127.0.0.1:8000 | head -1
   kill %1
   nc -zv 127.0.0.1 8000
   ```

   `python3 -m http.server 8000` chạy một web server đơn giản phục vụ thư mục hiện tại (Ubuntu có sẵn `python3`). Sau khi dừng, `nc` báo `Connection refused`.

   </details>

4. Đo thời gian phản hồi và mã trạng thái của `https://example.com` và `https://example.com/khongco`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   for u in https://example.com https://example.com/khongco; do
     curl -s -o /dev/null -w "$u -> %{http_code} trong %{time_total}s\n" "$u"
   done
   ```

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Máy kia có trả lời | `ping -c 3 IP` |
| Gói tin đi qua đâu | `traceroute -n IP`, `tracepath IP`, `mtr IP` |
| Cổng nào đang nghe, chương trình nào | `sudo ss -tulpn` |
| Ai chiếm cổng 3000 | `sudo ss -tlnp \| grep :3000` |
| Kết nối đang mở | `ss -tn state established` |
| Cổng ở máy khác có mở | `nc -zv -w 2 host cổng` |
| Web có sống, mã gì | `curl -sI URL`, `curl -s -o /dev/null -w "%{http_code}" URL` |
| Xem chi tiết kết nối HTTP | `curl -v URL` |
