---
summary: Kiến thức mạng tối thiểu để làm server — địa chỉ IP (IPv4, IPv6), subnet và CIDR, dải IP riêng, gateway, DNS, cổng (port), khác nhau giữa TCP, UDP, ICMP, các cổng hay gặp. Có ví dụ tính subnet bằng tay và bằng ipcalc.
minutes: 40
commands: [ip addr, ipcalc, /etc/services, CIDR, TCP, UDP, ICMP]
quiz:
  - q: "Địa chỉ 192.168.1.130/26 thuộc mạng nào và có bao nhiêu địa chỉ dùng được cho máy?"
    options: ["192.168.1.0/26, 254 máy", "192.168.1.128/26, 62 máy", "192.168.1.130/26, 64 máy", "192.168.0.0/16, 65534 máy"]
    answer: 1
    explain: "/26 nghĩa là 26 bit mạng, còn 6 bit cho máy: 2^6 = 64 địa chỉ, trừ địa chỉ mạng và địa chỉ broadcast còn 62. 130 nằm trong khối 128–191, nên mạng là 192.168.1.128/26."
  - q: Dải nào KHÔNG phải dải IP riêng (private)?
    options: ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "8.8.8.0/24"]
    answer: 3
    explain: "Ba dải IPv4 riêng (RFC 1918) là 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. IP riêng không đi thẳng ra Internet, phải qua NAT. 8.8.8.8 là IP công cộng của Google DNS."
  - q: Giao thức nào có bắt tay, đảm bảo dữ liệu đến đủ và đúng thứ tự?
    options: ["UDP", "TCP", "ICMP", "ARP"]
    answer: 1
    explain: "TCP thiết lập kết nối (bắt tay 3 bước), gửi lại gói bị mất, sắp đúng thứ tự: dùng cho web, SSH, database. UDP gửi luôn không cần kết nối, nhanh hơn: dùng cho DNS, NTP, game, video call."
  - q: Cổng mặc định của SSH, HTTP, HTTPS lần lượt là?
    options: ["21, 80, 8080", "22, 80, 443", "22, 8080, 443", "23, 80, 443"]
    answer: 1
    explain: "SSH 22, HTTP 80, HTTPS 443. Danh sách cổng chuẩn có trong /etc/services."
  - q: Default gateway dùng để làm gì?
    options: ["Phân giải tên miền", "Nơi máy gửi gói tin tới khi đích nằm ngoài mạng nội bộ của nó", "Cấp IP tự động", "Lưu địa chỉ MAC"]
    answer: 1
    explain: "Máy chỉ nói chuyện trực tiếp được với máy trong cùng subnet. Gói tin đi ra ngoài (Internet) được gửi cho gateway (thường là router) để nó chuyển tiếp."
---

## Mô hình các tầng

Dữ liệu đi qua mạng được đóng gói qua nhiều tầng. Không cần thuộc mô hình 7 tầng OSI, chỉ cần nắm 4 tầng thực tế của TCP/IP:

| Tầng | Lo việc gì | Ví dụ | Địa chỉ |
|---|---|---|---|
| Ứng dụng | Nội dung trao đổi | HTTP, SSH, DNS, SMTP | Tên miền, URL |
| Giao vận | Giao cho đúng chương trình, đảm bảo đến nơi (nếu cần) | **TCP**, **UDP** | **Cổng** (port) |
| Mạng | Đưa gói tin từ máy này tới máy kia, qua nhiều router | **IP**, ICMP | **Địa chỉ IP** |
| Liên kết | Truyền trong cùng một mạng vật lý | Ethernet, Wi-Fi | **Địa chỉ MAC** |

Khi bạn mở `https://example.com`: DNS đổi tên miền thành IP → TCP kết nối tới IP đó ở cổng 443 → gói tin IP đi qua các router → trong mỗi đoạn mạng, gói được gửi tới địa chỉ MAC của chặng kế tiếp.

## Địa chỉ IPv4

Địa chỉ IPv4 gồm 32 bit, viết thành 4 số từ 0–255 cách nhau bằng dấu chấm: `192.168.1.130`.

Mỗi địa chỉ chia làm hai phần: **phần mạng** (các máy cùng mạng có phần này giống nhau) và **phần máy**. Ranh giới được ghi bằng **subnet mask** hoặc **CIDR**:

| Cách viết | Ý nghĩa |
|---|---|
| `192.168.1.130/24` | 24 bit đầu là mạng (CIDR) |
| `255.255.255.0` | Subnet mask tương ứng /24 |

| CIDR | Mask | Số địa chỉ | Dùng được cho máy | Ví dụ |
|---|---|---|---|---|
| /8 | 255.0.0.0 | 16.777.216 | 16.777.214 | `10.0.0.0/8` |
| /16 | 255.255.0.0 | 65.536 | 65.534 | `172.16.0.0/16` |
| /24 | 255.255.255.0 | 256 | 254 | `192.168.1.0/24`, mạng gia đình hay gặp |
| /26 | 255.255.255.192 | 64 | 62 | |
| /30 | 255.255.255.252 | 4 | 2 | Nối hai router |
| /32 | 255.255.255.255 | 1 | 1 máy duy nhất | Luật tường lửa cho một IP |

Trong mỗi mạng có hai địa chỉ không gán cho máy được: địa chỉ **đầu** (địa chỉ mạng) và địa chỉ **cuối** (broadcast, gửi cho mọi máy trong mạng). Vì vậy số máy = 2^(32 − n) − 2.

### Tính subnet

Ví dụ `192.168.1.130/26`:

1. `/26` → còn 32 − 26 = **6 bit** cho máy → mỗi mạng có 2^6 = **64** địa chỉ.
2. Các mạng /26 trong `192.168.1.x` bắt đầu ở 0, 64, 128, 192.
3. 130 nằm trong khối **128–191**.
4. Địa chỉ mạng `192.168.1.128`, broadcast `192.168.1.191`, máy dùng từ `.129` đến `.190` (62 địa chỉ).

Kiểm tra bằng `ipcalc` (cài bằng `sudo apt install ipcalc`):

```bash
ipcalc -n 192.168.1.130/26
```

```text
Address:   192.168.1.130        11000000.10101000.00000001.10 000010
Netmask:   255.255.255.192 = 26 11111111.11111111.11111111.11 000000
Wildcard:  0.0.0.63             00000000.00000000.00000000.00 111111
=>
Network:   192.168.1.128/26     11000000.10101000.00000001.10 000000
HostMin:   192.168.1.129        11000000.10101000.00000001.10 000001
HostMax:   192.168.1.190        11000000.10101000.00000001.10 111110
Broadcast: 192.168.1.191        11000000.10101000.00000001.10 111111
Hosts/Net: 62                    Class C, Private Internet
```

| Dòng | Ý nghĩa |
|---|---|
| `Netmask` | Mask, và dạng nhị phân: 26 số 1 đầu tiên là phần mạng |
| `Network` | Địa chỉ mạng |
| `HostMin` / `HostMax` | Địa chỉ đầu / cuối gán được cho máy |
| `Broadcast` | Địa chỉ gửi cho cả mạng |
| `Hosts/Net` | Số máy tối đa |

### Các dải đặc biệt

| Dải | Dùng cho |
|---|---|
| `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` | **IP riêng** (private): dùng trong mạng nội bộ, không định tuyến trên Internet |
| `127.0.0.0/8` | Loopback: chính máy mình (`127.0.0.1` = `localhost`) |
| `169.254.0.0/16` | Tự gán khi không xin được IP từ DHCP. Thấy IP này nghĩa là mạng có vấn đề |
| `100.64.0.0/10` | NAT của nhà mạng (CGNAT) |
| `0.0.0.0` | "Mọi địa chỉ" (khi một dịch vụ lắng nghe) hoặc "chưa có địa chỉ" |

Máy dùng IP riêng ra Internet nhờ **NAT**: router thay IP riêng bằng IP công cộng của nó.

## IPv6

IPv4 chỉ có khoảng 4,3 tỷ địa chỉ, đã cạn. **IPv6** dùng 128 bit, viết thành 8 nhóm số hexa:

```text
2606:4700:10:0000:0000:0000:ac42:93f3
2606:4700:10::ac42:93f3
```

| Quy tắc | Ví dụ |
|---|---|
| Bỏ số 0 ở đầu mỗi nhóm | `0db8` → `db8` |
| Một dãy nhóm toàn 0 thay bằng `::` (chỉ một lần) | `fe80:0:0:0:5054:ff:fe12:3456` → `fe80::5054:ff:fe12:3456` |

| Địa chỉ | Ý nghĩa |
|---|---|
| `::1` | Loopback (như `127.0.0.1`) |
| `fe80::/10` | Link-local: chỉ dùng trong một đoạn mạng, mọi card mạng IPv6 đều tự có |
| `2000::/3` | Địa chỉ công cộng toàn cầu |
| `/64` | Kích thước subnet IPv6 thông thường |

## Gateway, DNS, DHCP

Một máy muốn lên mạng cần 4 thông tin:

| Thông tin | Ví dụ | Dùng để |
|---|---|---|
| Địa chỉ IP + mask | `10.0.2.15/24` | Định danh máy trong mạng |
| **Default gateway** | `10.0.2.2` | Gửi gói tin ra ngoài mạng nội bộ |
| **DNS server** | `10.0.2.3`, `8.8.8.8` | Đổi tên miền thành IP ([bài mở rộng 25](/bai/dns-phia-may-khach)) |
| (tự động qua) **DHCP** | | Máy chủ DHCP cấp 3 thông tin trên tự động khi máy vào mạng |

Server thường dùng **IP tĩnh** (đặt tay, không đổi) để người khác luôn tìm thấy nó. Cách đặt ở [bài sau](/bai/cau-hinh-mang).

## Cổng, TCP và UDP

Một máy chạy nhiều dịch vụ cùng lúc. **Cổng** (port, số từ 0–65535) cho biết gói tin dành cho chương trình nào. Một kết nối được xác định bởi: IP nguồn, cổng nguồn, IP đích, cổng đích, giao thức.

| | **TCP** | **UDP** |
|---|---|---|
| Kết nối | Bắt tay 3 bước (SYN, SYN-ACK, ACK) trước khi gửi | Gửi luôn, không cần kết nối |
| Đảm bảo | Gửi lại gói mất, đúng thứ tự | Không đảm bảo |
| Tốc độ | Chậm hơn | Nhanh, nhẹ |
| Dùng cho | Web, SSH, database, mail | DNS, NTP, DHCP, video call, game |

**ICMP** là giao thức báo lỗi và kiểm tra của tầng IP, không có cổng. `ping` dùng ICMP ([bài mở rộng 24](/bai/kiem-tra-mang)).

Các cổng cần thuộc:

| Cổng | Dịch vụ | Cổng | Dịch vụ |
|---|---|---|---|
| 22/tcp | SSH | 3306/tcp | MySQL |
| 25/tcp | SMTP (gửi mail) | 5432/tcp | PostgreSQL |
| 53/udp,tcp | DNS | 6379/tcp | Redis |
| 80/tcp | HTTP | 27017/tcp | MongoDB |
| 123/udp | NTP | 3000, 8080/tcp | Hay dùng cho ứng dụng đang phát triển |
| 443/tcp | HTTPS | 6443/tcp | Kubernetes API |

Cổng **dưới 1024** là cổng đặc quyền: chỉ root mới mở được để lắng nghe. Vì vậy ứng dụng Node.js chạy bằng user thường thường nghe ở 3000, rồi để nginx (chạy bằng root lúc khởi động) nghe ở 80/443 và chuyển tiếp vào.

Danh sách tên cổng chuẩn nằm trong `/etc/services`:

```bash
grep -E '^(ssh|http|https|domain|ntp|postgresql)\s' /etc/services
```

```text
ssh		22/tcp				# SSH Remote Login Protocol
domain		53/tcp				# Domain Name Server
domain		53/udp
http		80/tcp		www		# WorldWideWeb HTTP
ntp		123/udp				# Network Time Protocol
https		443/tcp				# http protocol over TLS/SSL
https		443/udp				# HTTP/3
postgresql	5432/tcp	postgres	# PostgreSQL Database
```

## Xem địa chỉ của máy mình

```bash
ip -br a
```

```text
lo               UNKNOWN        127.0.0.1/8 ::1/128
ens3             UP             10.0.2.15/24 metric 100 fec0::5054:ff:fe12:3456/64 fe80::5054:ff:fe12:3456/64
```

| Cột | Ý nghĩa |
|---|---|
| `lo`, `ens3` | Tên card mạng. `lo` là loopback. Card thật có tên như `ens3`, `eth0`, `enp0s3` |
| `UP` | Card đang hoạt động |
| `10.0.2.15/24` | IPv4 và CIDR |
| `fe80::...` | IPv6 link-local |

Lệnh `ip` học kỹ ở [bài sau](/bai/cau-hinh-mang).

## Thực hành

1. Không dùng máy, tính địa chỉ mạng, broadcast, dải máy và số máy của: `10.1.2.3/8`, `172.20.5.9/16`, `192.168.10.77/27`. Rồi kiểm tra bằng `ipcalc`.

   <details>
   <summary>Xem đáp án</summary>

   | Địa chỉ | Mạng | Broadcast | Máy | Số máy |
   |---|---|---|---|---|
   | `10.1.2.3/8` | `10.0.0.0` | `10.255.255.255` | `10.0.0.1` – `10.255.255.254` | 16.777.214 |
   | `172.20.5.9/16` | `172.20.0.0` | `172.20.255.255` | `172.20.0.1` – `172.20.255.254` | 65.534 |
   | `192.168.10.77/27` | `192.168.10.64` | `192.168.10.95` | `.65` – `.94` | 30 |

   /27 có 32 địa chỉ một khối: 0, 32, 64, 96… Số 77 nằm trong khối 64–95.

   </details>

2. Các IP sau là riêng hay công cộng: `10.20.30.40`, `172.32.0.1`, `192.168.0.1`, `8.8.4.4`, `172.31.255.1`?

   <details>
   <summary>Xem đáp án</summary>

   Riêng: `10.20.30.40`, `192.168.0.1`, `172.31.255.1` (thuộc `172.16.0.0/12`, tức `172.16.0.0` – `172.31.255.255`). Công cộng: `172.32.0.1` (ngoài dải /12), `8.8.4.4`.

   </details>

3. Viết gọn IPv6 `2001:0db8:0000:0000:0000:ff00:0042:8329`.

   <details>
   <summary>Xem đáp án</summary>

   `2001:db8::ff00:42:8329`

   </details>

4. Tra trong `/etc/services` xem cổng 3306, 5432, 6379 là dịch vụ gì. Dịch vụ nào dùng UDP 53?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   grep -wE '3306|5432|6379' /etc/services
   grep -w '53/udp' /etc/services
   ```

   3306 là `mysql`, 5432 là `postgresql`, 6379 là `redis` (nếu có trong file). UDP 53 là `domain` (DNS).

   </details>

## Tóm tắt

| Khái niệm | Cần nhớ |
|---|---|
| IPv4 / CIDR | 32 bit, `/24` = 256 địa chỉ, 254 máy. Số máy = 2^(32−n) − 2 |
| IP riêng | `10/8`, `172.16/12`, `192.168/16`. Ra Internet qua NAT |
| Loopback | `127.0.0.1`, `::1` |
| IPv6 | 128 bit, `::` thay dãy số 0, `fe80::` là link-local |
| Gateway / DNS / DHCP | Cửa ra ngoài / đổi tên thành IP / cấp IP tự động |
| TCP / UDP / ICMP | Tin cậy, có kết nối / nhanh, không kết nối / ping và báo lỗi |
| Cổng hay gặp | 22 SSH, 53 DNS, 80 HTTP, 443 HTTPS, 3306 MySQL, 5432 PostgreSQL |
| Tính subnet | `ipcalc 192.168.1.130/26` |
