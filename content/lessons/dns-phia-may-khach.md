---
summary: Máy Linux đổi tên miền thành IP như thế nào — thứ tự tra cứu (/etc/nsswitch.conf), file /etc/hosts, DNS server trong /etc/resolv.conf và systemd-resolved. Dùng dig, host, nslookup, getent, resolvectl để kiểm tra, đọc các loại bản ghi (A, AAAA, CNAME, MX, TXT, PTR) và xử lý lỗi DNS.
minutes: 40
commands: [dig, host, nslookup, getent hosts, resolvectl, /etc/hosts, /etc/resolv.conf, /etc/nsswitch.conf]
quiz:
  - q: Khi một chương trình cần IP của "web.local", hệ thống tra ở đâu trước?
    options: ["Luôn hỏi DNS server trước", "Theo thứ tự trong /etc/nsswitch.conf, thường là files (/etc/hosts) rồi mới dns", "Chỉ /etc/hosts", "Hỏi router"]
    answer: 1
    explain: "Dòng `hosts: files dns` trong /etc/nsswitch.conf nghĩa là tra /etc/hosts trước, không có mới hỏi DNS. Vì vậy thêm dòng vào /etc/hosts là cách nhanh để trỏ một tên về IP mình muốn."
  - q: "Thêm `10.10.10.10 thu.local` vào /etc/hosts. `ping thu.local` ra 10.10.10.10, nhưng `dig thu.local` không ra gì. Vì sao?"
    options: ["dig bị lỗi", "dig hỏi thẳng DNS server, không đọc /etc/hosts; ping dùng thư viện hệ thống nên có đọc", "/etc/hosts sai cú pháp", "Phải khởi động lại"]
    answer: 1
    explain: "`dig`, `host`, `nslookup` là công cụ hỏi DNS trực tiếp. Muốn kiểm tra đúng như ứng dụng thấy (có cả /etc/hosts) thì dùng `getent hosts tên`."
  - q: Trên Ubuntu, /etc/resolv.conf ghi nameserver 127.0.0.53. Đó là gì?
    options: ["DNS bị lỗi", "Dịch vụ systemd-resolved chạy trên máy, nhận truy vấn rồi chuyển tiếp tới DNS server thật", "Máy chủ DNS của Google", "Router nhà"]
    answer: 1
    explain: "systemd-resolved làm DNS cục bộ có bộ nhớ đệm. DNS server thật xem bằng `resolvectl status`."
  - q: Bản ghi DNS loại nào cho biết máy chủ nhận mail của một tên miền?
    options: ["A", "CNAME", "MX", "PTR"]
    answer: 2
    explain: "A là IPv4, AAAA là IPv6, CNAME là tên khác (bí danh), MX là máy chủ mail, TXT là văn bản (SPF, xác minh tên miền), PTR là tra ngược IP ra tên."
  - q: Hỏi một DNS server cụ thể (ví dụ 1.1.1.1) thay vì DNS mặc định, viết thế nào với dig?
    options: ["dig example.com 1.1.1.1", "dig @1.1.1.1 example.com", "dig -s 1.1.1.1 example.com", "dig example.com --server"]
    answer: 1
    explain: "`@server` chỉ định DNS server cần hỏi. Hữu ích để so sánh khi vừa đổi bản ghi DNS: DNS này đã thấy bản ghi mới chưa."
---

## DNS là gì

Con người nhớ tên (`example.com`), máy tính cần IP (`104.20.23.154`). **DNS** (Domain Name System) là hệ thống tra cứu tên → IP, dùng cổng **53** (UDP, và TCP khi câu trả lời lớn).

Các loại bản ghi hay gặp:

| Loại | Chứa | Ví dụ |
|---|---|---|
| **A** | Địa chỉ IPv4 | `example.com → 104.20.23.154` |
| **AAAA** | Địa chỉ IPv6 | `example.com → 2606:4700:10::ac42:93f3` |
| **CNAME** | Tên khác (bí danh) | `www.example.com → example.com` |
| **MX** | Máy chủ nhận mail, kèm độ ưu tiên | `gmail.com → 5 gmail-smtp-in.l.google.com` |
| **TXT** | Văn bản: SPF, xác minh tên miền | `"v=spf1 include:_spf.google.com ~all"` |
| **NS** | DNS server quản lý tên miền | |
| **PTR** | Tra ngược: IP → tên | `8.8.8.8 → dns.google` |

Mỗi bản ghi có **TTL** (time to live): số giây được phép nhớ (cache) câu trả lời. Đổi bản ghi DNS xong, phải chờ hết TTL cũ thì mọi nơi mới thấy bản ghi mới.

## Máy Linux tra tên theo thứ tự nào

```bash
grep '^hosts:' /etc/nsswitch.conf
```

```text
hosts:          files dns
```

| Bước | Nguồn | Ghi chú |
|---|---|---|
| 1. `files` | `/etc/hosts` | Bảng tĩnh trên máy |
| 2. `dns` | DNS server ghi trong `/etc/resolv.conf` | |

`/etc/nsswitch.conf` (Name Service Switch) quy định thứ tự tra cứu cho nhiều loại thông tin: tên máy (`hosts`), tài khoản (`passwd`), nhóm (`group`).

### /etc/hosts

```text
127.0.0.1 localhost
::1 ip6-localhost ip6-loopback
```

Mỗi dòng: `IP  tên  [tên-khác...]`. Dùng để:

- Trỏ tên về IP khi chưa có DNS, ví dụ các máy trong mạng nội bộ.
- Thử website trên server mới trước khi đổi DNS thật: thêm `IP-server-mới example.com` trên máy của bạn.
- Chặn một tên miền: trỏ về `0.0.0.0`.

```bash
echo "10.10.10.10 thu.local" | sudo tee -a /etc/hosts
getent hosts thu.local
ping -c1 -W1 thu.local
dig +short thu.local
```

```text
10.10.10.10     thu.local
PING thu.local (10.10.10.10) 56(84) bytes of data.
```

`getent` và `ping` thấy `thu.local`, còn `dig` không in gì: **`dig` hỏi thẳng DNS server, không đọc `/etc/hosts`**. Nhớ xoá dòng vừa thêm.

### /etc/resolv.conf và systemd-resolved

```bash
ls -l /etc/resolv.conf
grep -v '^#' /etc/resolv.conf | grep -v '^$'
```

```text
lrwxrwxrwx 1 root root 39 Oct 17 19:55 /etc/resolv.conf -> ../run/systemd/resolve/stub-resolv.conf
nameserver 127.0.0.53
options edns0 trust-ad
search .
```

| Dòng | Ý nghĩa |
|---|---|
| `nameserver 127.0.0.53` | DNS server được hỏi. Đây là **systemd-resolved** chạy ngay trên máy |
| `search` | Đuôi tự thêm khi tra tên ngắn (ví dụ `search congty.local` thì tra `web1` thành `web1.congty.local`) |
| `options` | Tuỳ chọn của bộ phân giải |

Trên Ubuntu, file này là symlink do systemd-resolved quản lý. **Đừng sửa tay**, sẽ bị ghi đè. systemd-resolved nhận truy vấn, nhớ đệm, rồi hỏi DNS server thật (nhận từ DHCP hoặc netplan):

```bash
resolvectl status
```

```text
Global
         Protocols: -LLMNR -mDNS -DNSOverTLS DNSSEC=no/unsupported
  resolv.conf mode: stub

Link 2 (ens3)
    Current Scopes: DNS
         Protocols: +DefaultRoute -LLMNR -mDNS -DNSOverTLS DNSSEC=no/unsupported
Current DNS Server: 10.0.2.3
       DNS Servers: 10.0.2.3
```

| Lệnh | Làm gì |
|---|---|
| `resolvectl status` | DNS server thật của từng card mạng |
| `resolvectl query example.com` | Tra một tên qua systemd-resolved |
| `sudo resolvectl flush-caches` | Xoá bộ nhớ đệm DNS (khi vừa đổi bản ghi) |
| `resolvectl statistics` | Thống kê, số lần trúng bộ nhớ đệm |

Đổi DNS server lâu dài: trong netplan (`nameservers: addresses: [1.1.1.1, 8.8.8.8]`, [bài 44](/bai/cau-hinh-mang)), hoặc `/etc/systemd/resolved.conf` (dòng `DNS=`) rồi `sudo systemctl restart systemd-resolved`.

Trên hệ thống không dùng systemd-resolved (Rocky, Alpine, container), `/etc/resolv.conf` là file thường, ghi thẳng DNS server: `nameserver 8.8.8.8`.

## Công cụ tra DNS

### getent: tra như ứng dụng tra

```bash
getent hosts example.com
getent ahosts example.com | head -2
```

```text
2606:4700:10::ac42:93f3 example.com
2606:4700:10::6814:179a example.com
104.20.23.154   STREAM example.com
104.20.23.154   DGRAM
```

`getent` đi đúng thứ tự trong `nsswitch.conf` (có cả `/etc/hosts`), nên cho kết quả giống ứng dụng thật nhìn thấy. Có sẵn trên mọi máy.

### dig: công cụ chính để tra DNS

```bash
dig example.com
```

Phần quan trọng của kết quả:

```text
;; ANSWER SECTION:
example.com.		299	IN	A	104.20.23.154
example.com.		299	IN	A	172.66.147.243
```

| Cột | Ý nghĩa |
|---|---|
| `example.com.` | Tên được hỏi (dấu chấm cuối là gốc của DNS) |
| `299` | TTL còn lại, tính bằng giây |
| `IN` | Lớp Internet |
| `A` | Loại bản ghi |
| `104.20.23.154` | Giá trị |

Các cách dùng hay gặp:

```bash
dig example.com +short
dig -x 8.8.8.8 +short
dig MX gmail.com +short
dig @1.1.1.1 example.com +short
```

```text
104.20.23.154
172.66.147.243
dns.google.
20 alt2.gmail-smtp-in.l.google.com.
5 gmail-smtp-in.l.google.com.
104.20.23.154
172.66.147.243
```

| Cách viết | Ý nghĩa |
|---|---|
| `+short` | Chỉ in giá trị |
| `-x IP` | Tra ngược IP ra tên (bản ghi PTR) |
| `MX`, `AAAA`, `TXT`, `NS`, `CNAME` | Hỏi loại bản ghi cụ thể (mặc định là A) |
| `@1.1.1.1` | Hỏi DNS server chỉ định |
| `+trace` | Đi từng bước từ máy chủ gốc xuống, xem tên miền được trả lời bởi ai |

`dig` nằm trong gói `dnsutils` (Ubuntu) hoặc `bind-utils` (Rocky).

### host và nslookup

```bash
host example.com
nslookup example.com
```

```text
example.com has address 104.20.23.154
example.com has address 172.66.147.243
example.com has IPv6 address 2606:4700:10::ac42:93f3
example.com has IPv6 address 2606:4700:10::6814:179a
example.com mail is handled by 0 .
```

`host` cho kết quả ngắn gọn dễ đọc. `nslookup` có trên cả Windows, quen thuộc với nhiều người. Cả hai cũng không đọc `/etc/hosts`.

## Xử lý lỗi DNS

| Triệu chứng | Kiểm tra |
|---|---|
| `ping 8.8.8.8` được, `ping google.com` báo `Name or service not known` / `Temporary failure in name resolution` | DNS không trả lời: `resolvectl status` xem DNS server, `dig @8.8.8.8 google.com` thử DNS khác |
| Tên miền vừa đổi IP mà máy vẫn ra IP cũ | Bộ nhớ đệm: chờ hết TTL, hoặc `sudo resolvectl flush-caches`. So sánh `dig @1.1.1.1` với `dig @8.8.8.8` |
| Một tên ra IP lạ | Xem `/etc/hosts` có dòng ghi đè không: `getent hosts tên` |
| Chỉ một số máy trong nội bộ không tra được | Sai `search`, sai DNS nội bộ trong `resolv.conf` / netplan |
| Container không tra được tên | Xem `/etc/resolv.conf` bên trong container |

## Thực hành

1. Tra IPv4, IPv6, máy chủ mail của `google.com` bằng `dig +short`. Tra ngược IP `1.1.1.1`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   dig google.com +short
   dig AAAA google.com +short
   dig MX google.com +short
   dig -x 1.1.1.1 +short
   ```

   `1.1.1.1` tra ngược ra `one.one.one.one.`

   </details>

2. Máy đang dùng DNS server nào? Hỏi cùng một tên miền qua DNS mặc định, qua `1.1.1.1` và qua `8.8.8.8`, so sánh TTL.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   resolvectl status | grep "DNS Server"
   dig example.com | grep -A2 "ANSWER SECTION"
   dig @1.1.1.1 example.com | grep -A2 "ANSWER SECTION"
   dig @8.8.8.8 example.com | grep -A2 "ANSWER SECTION"
   ```

   TTL giảm dần theo thời gian nằm trong bộ nhớ đệm của từng DNS server, nên mỗi nơi một con số.

   </details>

3. Trỏ `example.com` về `127.0.0.1` bằng `/etc/hosts`. Kiểm tra bằng `getent`, `curl`, `dig`. Giải thích vì sao kết quả khác nhau. Rồi xoá dòng đó.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   echo "127.0.0.1 example.com" | sudo tee -a /etc/hosts
   getent hosts example.com
   curl -sI http://example.com | head -1
   dig +short example.com
   sudo sed -i '/127.0.0.1 example.com/d' /etc/hosts
   ```

   `getent` ra `127.0.0.1`. `curl` kết nối tới máy mình: nếu không có web server sẽ báo `Connection refused`. `dig` vẫn ra IP thật vì không đọc `/etc/hosts`.

   </details>

4. Dùng `dig +trace example.com` và đọc xem các tầng máy chủ DNS nào đã trả lời (gốc `.`, rồi `com.`, rồi máy chủ của `example.com`).

## Tóm tắt

| Việc | Lệnh / file |
|---|---|
| Thứ tự tra tên | `/etc/nsswitch.conf` (`hosts: files dns`) |
| Trỏ tên về IP trên một máy | `/etc/hosts` |
| DNS server đang dùng | `resolvectl status` (Ubuntu), `/etc/resolv.conf` |
| Tra như ứng dụng (có /etc/hosts) | `getent hosts tên` |
| Tra DNS | `dig tên +short`, `host tên`, `nslookup tên` |
| Loại bản ghi / DNS chỉ định / tra ngược | `dig MX tên`, `dig @1.1.1.1 tên`, `dig -x IP` |
| Xoá bộ nhớ đệm DNS | `sudo resolvectl flush-caches` |
