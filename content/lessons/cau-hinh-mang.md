---
summary: Các file và lệnh mạng cơ bản. /etc/hosts tự đặt tên miền trỏ về IP, /etc/resolv.conf chứa máy chủ DNS, cách Linux đặt tên card mạng, xem card bằng ifconfig và ip, bật tắt card, khởi động lại dịch vụ mạng và xem gateway.
minutes: 35
commands: [/etc/hosts, /etc/resolv.conf, ls /sys/class/net, ifconfig, ip addr, ip link set, route -n, ip route]
quiz:
  - q: "Thêm dòng `127.0.0.1 titv.vn` vào `/etc/hosts` thì sao?"
    options: ["Trang titv.vn bị xoá", "Máy này hiểu titv.vn là chính nó (127.0.0.1), không hỏi DNS nữa", "Mọi máy trong mạng vào được titv.vn", "Không có tác dụng"]
    answer: 1
    explain: "`/etc/hosts` được tra **trước** DNS và chỉ có tác dụng trên máy đó."
  - q: "File nào ghi địa chỉ máy chủ DNS mà máy dùng?"
    options: ["/etc/hosts", "/etc/resolv.conf", "/etc/hostname", "/etc/passwd"]
    answer: 1
    explain: "`/etc/resolv.conf` chứa dòng `nameserver IP`. Trên Ubuntu, IP đó là `127.0.0.53` của systemd-resolved."
  - q: "Card mạng tên `wlp2s0` là loại gì?"
    options: ["Có dây (Ethernet)", "Không dây (Wi-Fi)", "Mạng di động", "Card ảo nội bộ"]
    answer: 1
    explain: "`en` là Ethernet có dây, `wl` là Wi-Fi (wireless LAN), `ww` là mạng di động (wireless WAN), `lo` là loopback."
  - q: Lệnh nào tắt card `enp0s3` mà không cần cài thêm gói?
    options: ["ifdown enp0s3", "sudo ip link set enp0s3 down", "sudo ifconfig enp0s3 off", "sudo route del enp0s3"]
    answer: 1
    explain: "`ip` có sẵn trên Ubuntu. `ifconfig` phải cài net-tools; `ifup`/`ifdown` không có sẵn trên Ubuntu mới."
  - q: "Trong `ip route`, dòng `default via 10.0.2.2 dev ens3` cho biết gì?"
    options: ["IP của máy là 10.0.2.2", "Gateway (cổng ra mạng ngoài) là 10.0.2.2, đi qua card ens3", "DNS là 10.0.2.2", "ens3 đang tắt"]
    answer: 1
    explain: "`default` là đường mặc định cho mọi địa chỉ không nằm trong mạng nội bộ; `via` là gateway."
---

> Bài này đi theo video TITV bài 33. Kết quả trong bài lấy từ máy Ubuntu 24.04 có hai card mạng: `ens3` đang dùng để kết nối, `ens4` để thử bật tắt. Đừng tắt card bạn đang dùng để điều khiển máy từ xa.

## /etc/hosts: tự đặt tên cho IP

Máy tính kết nối với nhau bằng **địa chỉ IP**, còn người dùng gõ **tên** như `titv.vn`. Việc đổi tên ra IP gọi là **phân giải tên**. Linux tra file `/etc/hosts` **trước**, không thấy mới hỏi máy chủ DNS.

```bash
cat /etc/hosts
```

```text
127.0.0.1 localhost

# The following lines are desirable for IPv6 capable hosts
::1 ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
ff02::3 ip6-allhosts
```

Mỗi dòng có hai cột: **IP** và **tên** (có thể nhiều tên). `127.0.0.1` là chính máy này (localhost). Dòng bắt đầu bằng `#` là chú thích.

### Thử: cho titv.vn trỏ về máy mình

Trước khi sửa, tên `titv.vn` được DNS phân giải ra IP thật:

```bash
getent ahostsv4 titv.vn | head -1
```

```text
185.232.14.236  STREAM titv.vn
```

`getent ahostsv4` hỏi hệ thống "tên này ứng với IP v4 nào", theo đúng thứ tự máy dùng: `/etc/hosts` trước, DNS sau. Thêm một dòng vào `/etc/hosts` (file của root nên cần `sudo`; video dùng `sudo nano /etc/hosts`, ở đây dùng `tee` như bài 8, 13):

```bash
echo "127.0.0.1 titv.vn" | sudo tee -a /etc/hosts
getent ahostsv4 titv.vn | head -1
ping -c 2 titv.vn
```

```text
127.0.0.1 titv.vn
127.0.0.1       STREAM titv.vn
PING titv.vn (127.0.0.1) 56(84) bytes of data.
64 bytes from localhost (127.0.0.1): icmp_seq=1 ttl=64 time=0.068 ms
64 bytes from localhost (127.0.0.1): icmp_seq=2 ttl=64 time=0.173 ms

--- titv.vn ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1001ms
rtt min/avg/max/mdev = 0.068/0.120/0.173/0.052 ms
```

Giờ `titv.vn` trỏ về chính máy này: mở trình duyệt vào `titv.vn` sẽ không tới trang thật. Trình duyệt có bộ nhớ đệm DNS riêng, có thể phải đóng mở lại mới thấy thay đổi. Đây cũng là cách "chặn" một trang web trên một máy, hoặc đặt tên cho các máy trong mạng nội bộ mà không cần máy chủ DNS. Thử xong thì xoá dòng vừa thêm:

```bash
sudo sed -i '/titv.vn/d' /etc/hosts
```

`sed -i '/mẫu/d'` xoá các dòng chứa mẫu ngay trong file (học ở bài lọc văn bản, phần mở rộng). Mở bằng `sudo nano /etc/hosts` rồi xoá tay cũng được.

## /etc/resolv.conf: máy chủ DNS

```bash
cat /etc/resolv.conf | grep -v "^#"
```

```text

nameserver 127.0.0.53
options edns0 trust-ad
search .
```

Dòng `nameserver` là địa chỉ máy chủ DNS mà máy hỏi. Trên Ubuntu, đó là `127.0.0.53`: một dịch vụ trên chính máy (`systemd-resolved`) nhận câu hỏi rồi chuyển tới máy chủ DNS thật. Xem máy chủ DNS thật của từng card:

```bash
resolvectl dns
```

```text
Global:
Link 2 (ens3): 10.0.2.3
Link 3 (ens4):
```

Trên Ubuntu, đừng sửa tay `/etc/resolv.conf` (file do hệ thống tự sinh, sẽ bị ghi đè). Đặt DNS trong cấu hình mạng (bài 34). Trên các bản Linux khác, file này có thể ghi thẳng `nameserver 8.8.8.8` (DNS của Google).

## Tên card mạng

Linux đặt tên card theo loại và vị trí cắm:

| Đầu tên | Loại | Ví dụ |
|---|---|---|
| `en` | Có dây (**E**the**rn**et) | `enp0s3`, `ens3`, `eno1` |
| `wl` | Không dây (**W**ireless **L**AN, Wi-Fi) | `wlp2s0` |
| `ww` | Mạng di động (**W**ireless **W**AN, 4G/5G) | `wwan0` |
| `sl` | Đường nối tiếp (serial line IP), hiếm gặp | |
| `lo` | Card ảo nội bộ (loopback), IP `127.0.0.1` | `lo` |

Phần sau cho biết vị trí: `p0s3` là bus PCI 0, khe 3; `s3` là khe 3. Máy trong video dùng VirtualBox nên card tên `enp0s3`; máy trong bài tên `ens3` (tên khác của nó là `enp0s3`, xem dòng `altname` bên dưới).

Liệt kê card mạng:

```bash
ls /sys/class/net
```

```text
ens3  ens4  lo
```

`/sys` là thư mục ảo do kernel tạo (bài 6, 25); mỗi card một thư mục con.

## Xem card và địa chỉ IP

### ifconfig (gói net-tools)

`ifconfig` có từ lâu, nhiều tài liệu vẫn dùng. Ubuntu mới phải cài gói `net-tools` (bài 25). Xem một card:

```bash
ifconfig ens4
```

```text
ens4: flags=4098<BROADCAST,MULTICAST>  mtu 1500
        ether 52:54:00:12:34:57  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

`ens4` chưa có chữ `UP` trong `flags` và chưa có dòng `inet`: card đang tắt, chưa có IP. `ifconfig` trơn (không ghi card) chỉ liệt kê các card **đang bật**; `ifconfig -a` liệt kê tất cả.

### ip addr (có sẵn, nên dùng)

`ip` là lệnh mới thay cho `ifconfig`, có sẵn trên mọi bản Linux hiện nay. `ip addr` viết tắt được thành `ip a`:

```bash
ip a show ens3
```

```text
2: ens3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:12:34:56 brd ff:ff:ff:ff:ff:ff
    altname enp0s3
    inet 10.0.2.15/24 metric 100 brd 10.0.2.255 scope global dynamic ens3
       valid_lft 74356sec preferred_lft 74356sec
    inet6 fec0::5054:ff:fe12:3456/64 scope site dynamic mngtmpaddr noprefixroute 
       valid_lft 85808sec preferred_lft 13808sec
    inet6 fe80::5054:ff:fe12:3456/64 scope link 
       valid_lft forever preferred_lft forever
```

| Phần | Ý nghĩa |
|---|---|
| `UP`, `state UP` | Card đang bật và có kết nối |
| `link/ether 52:54:00:12:34:56` | Địa chỉ MAC (địa chỉ phần cứng của card) |
| `altname enp0s3` | Tên khác của card |
| `inet 10.0.2.15/24` | Địa chỉ IPv4 và mặt nạ mạng (`/24` = `255.255.255.0`) |
| `brd 10.0.2.255` | Địa chỉ broadcast của mạng |
| `dynamic` | IP do máy chủ DHCP cấp tự động |
| `inet6` | Địa chỉ IPv6 |

`ip a` không ghi tên card thì liệt kê tất cả; `ip -br a` in gọn mỗi card một dòng.

## Bật, tắt card mạng

Trên Ubuntu không có sẵn lệnh `ifup`, `ifdown` như nhiều tài liệu cũ:

```bash
ifup ens4
```

```text
bash: ifup: command not found
```

Dùng `ifconfig` hoặc `ip link`:

```bash
sudo ifconfig ens4 down
ip -br link show ens4
sudo ifconfig ens4 up
ip -br link show ens4
```

```text
ens4             DOWN           52:54:00:12:34:57 <BROADCAST,MULTICAST> 
ens4             UP             52:54:00:12:34:57 <BROADCAST,MULTICAST,UP,LOWER_UP> 
```

| Cách cũ (net-tools) | Cách mới (có sẵn) |
|---|---|
| `sudo ifconfig ens4 down` | `sudo ip link set ens4 down` |
| `sudo ifconfig ens4 up` | `sudo ip link set ens4 up` |

> **Cẩn thận:** tắt card đang dùng để điều khiển máy từ xa (qua SSH) là mất kết nối ngay, và không bật lại từ xa được nữa.

## Khởi động lại dịch vụ mạng

Sau khi sửa cấu hình mạng, có thể cần khởi động lại dịch vụ quản lý mạng. Tuỳ bản Linux mà dịch vụ khác nhau:

| Máy | Dịch vụ quản lý mạng | Lệnh |
|---|---|---|
| Ubuntu Server | `systemd-networkd` | `sudo systemctl restart systemd-networkd`, hoặc `sudo netplan apply` (bài 34) |
| Ubuntu Desktop | `NetworkManager` | `sudo systemctl restart NetworkManager` |
| CentOS, bản cũ | `network` | `sudo service network restart` hoặc `sudo /etc/init.d/network restart` |

Xem máy mình dùng dịch vụ nào:

```bash
systemctl is-active systemd-networkd NetworkManager
networkctl
```

```text
active
inactive
IDX LINK TYPE     OPERATIONAL SETUP
  1 lo   loopback carrier     unmanaged
  2 ens3 ether    routable    configured
  3 ens4 ether    carrier     unmanaged

3 links listed.
```

Máy trong bài là Ubuntu Server: `systemd-networkd` đang chạy, `NetworkManager` không có. `networkctl` cho thấy `ens3` đã cấu hình xong (`configured`), `ens4` chưa ai quản lý (`unmanaged`).

## Gateway: route và ip route

**Gateway** (cổng mặc định) là máy (thường là router) nhận mọi gói tin đi ra **ngoài** mạng nội bộ, ví dụ ra Internet.

```bash
route -n
ip route
```

```text
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.0.2.2        0.0.0.0         UG    100    0        0 ens3
10.0.2.0        0.0.0.0         255.255.255.0   U     100    0        0 ens3
10.0.2.2        0.0.0.0         255.255.255.255 UH    100    0        0 ens3
10.0.2.3        0.0.0.0         255.255.255.255 UH    100    0        0 ens3
default via 10.0.2.2 dev ens3 proto dhcp src 10.0.2.15 metric 100 
10.0.2.0/24 dev ens3 proto kernel scope link src 10.0.2.15 metric 100 
10.0.2.2 dev ens3 proto dhcp scope link src 10.0.2.15 metric 100 
10.0.2.3 dev ens3 proto dhcp scope link src 10.0.2.15 metric 100 
```

| Dòng | Ý nghĩa |
|---|---|
| `0.0.0.0 ... 10.0.2.2 ... UG` (route) / `default via 10.0.2.2` (ip) | Đường mặc định: mọi nơi khác đi qua gateway `10.0.2.2`. Cờ `G` là có gateway |
| `10.0.2.0/24 dev ens3` | Mạng nội bộ `10.0.2.x` nói chuyện thẳng qua `ens3`, không cần gateway |

`route` thuộc net-tools (cũ); `ip route` có sẵn. `-n` in số, không đổi IP ra tên cho nhanh.

## Giao diện đồ hoạ

Ubuntu Desktop có thể làm mọi việc trên bằng chuột: **Settings → Network**. Nhưng máy chủ không có giao diện, nên vẫn phải biết dùng lệnh.

## Mở rộng (chuẩn LPIC-1)

Chuẩn LPIC-1 mục 109.2, 109.4 còn có:

| Lệnh, file | Ý nghĩa |
|---|---|
| `hostnamectl set-hostname tên` | Đổi tên máy (ghi vào `/etc/hostname`) |
| `/etc/nsswitch.conf` | Dòng `hosts: files dns` quy định tra `/etc/hosts` (files) trước rồi mới tới DNS |
| `ip -br a`, `ip -br link` | In gọn mỗi card một dòng |
| `nmcli` | Điều khiển NetworkManager bằng lệnh (máy desktop) |
| `dig tên`, `host tên` | Hỏi DNS trực tiếp (bài DNS phía máy khách, phần mở rộng) |
| `ss -tlnp` | Các cổng đang mở (bài kiểm tra mạng, phần mở rộng) |

## Thực hành

1. Liệt kê card mạng của máy bạn. Card nào có dây, card nào là Wi-Fi?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ls /sys/class/net
   ip -br a
   ```

   Tên bắt đầu bằng `en` là có dây, `wl` là Wi-Fi.

   </details>

2. Máy bạn có IP gì, gateway là gì, hỏi DNS ở đâu?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ip a
   ip route
   resolvectl dns
   ```

   IP ở dòng `inet`, gateway ở dòng `default via`, DNS ở dòng của từng card trong `resolvectl dns`.

   </details>

3. Cho tên `web.noibo` trỏ về `127.0.0.1`, thử `ping -c 1 web.noibo`, rồi xoá dòng đó.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   echo "127.0.0.1 web.noibo" | sudo tee -a /etc/hosts
   ping -c 1 web.noibo
   sudo sed -i '/web.noibo/d' /etc/hosts
   ```

   </details>

## Tóm tắt

| Việc | Lệnh, file |
|---|---|
| Đặt tên cho IP trên máy mình | `/etc/hosts` |
| Máy chủ DNS | `/etc/resolv.conf`, `resolvectl dns` |
| Liệt kê card | `ls /sys/class/net` |
| Xem IP | `ip a` (hoặc `ifconfig`) |
| Bật, tắt card | `sudo ip link set card up/down` (hoặc `ifconfig card up/down`) |
| Khởi động lại mạng | `sudo systemctl restart systemd-networkd` hoặc `NetworkManager` |
| Xem gateway | `ip route` (hoặc `route -n`) |
