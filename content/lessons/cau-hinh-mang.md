---
summary: Xem và đổi cấu hình mạng bằng lệnh ip (địa chỉ, card mạng, bảng định tuyến), cấu hình lâu dài bằng netplan trên Ubuntu Server và NetworkManager (nmcli) trên desktop và RHEL, đặt IP tĩnh, đổi tên máy, file /etc/hosts. Kèm các lệnh cũ (ifconfig, route) để đọc tài liệu cũ.
minutes: 45
commands: [ip addr, ip link, ip route, ip neigh, netplan, networkctl, nmcli, hostnamectl, /etc/hosts, ifconfig, route]
quiz:
  - q: Lệnh nào xem địa chỉ IP của mọi card mạng, dạng gọn?
    options: ["ip -br a", "ip route", "ifconfig -r", "netstat -i"]
    answer: 0
    explain: "`ip a` (ip address) in đầy đủ, thêm `-br` (brief) để mỗi card một dòng. `ifconfig` là lệnh cũ, trên Ubuntu mới không còn được cài sẵn."
  - q: "Dòng `default via 10.0.2.2 dev ens3` trong `ip route` nghĩa là gì?"
    options: ["IP của máy là 10.0.2.2", "Gói tin tới mọi đích không có tuyến riêng được gửi qua gateway 10.0.2.2, qua card ens3", "DNS là 10.0.2.2", "Card ens3 bị tắt"]
    answer: 1
    explain: "Đó là default route (tuyến mặc định), tức default gateway."
  - q: Thêm IP bằng ip addr add rồi khởi động lại máy, IP đó còn không?
    options: ["Còn", "Mất, vì lệnh ip chỉ đổi cấu hình đang chạy; muốn giữ phải ghi vào netplan (Ubuntu) hoặc NetworkManager", "Còn nếu dùng sudo", "Tuỳ card mạng"]
    answer: 1
    explain: "`ip` thay đổi ngay nhưng tạm thời. Cấu hình lâu dài trên Ubuntu Server nằm trong `/etc/netplan/*.yaml`, áp dụng bằng `netplan apply`."
  - q: Sửa netplan trên VPS qua SSH, lệnh nào an toàn nhất để áp dụng?
    options: ["netplan apply", "netplan try", "reboot", "ip link set down"]
    answer: 1
    explain: "`netplan try` áp dụng cấu hình mới và đợi bạn bấm Enter xác nhận trong 120 giây. Nếu cấu hình sai làm mất SSH (không bấm được), nó tự quay về cấu hình cũ."
  - q: Đổi tên máy thành web01 lâu dài, dùng lệnh nào?
    options: ["hostname web01", "sudo hostnamectl set-hostname web01", "echo web01 > /etc/hosts", "export HOSTNAME=web01"]
    answer: 1
    explain: "`hostnamectl set-hostname` đổi ngay và ghi vào `/etc/hostname`. Lệnh `hostname web01` chỉ đổi tạm đến lần khởi động sau. Nên sửa thêm dòng tương ứng trong `/etc/hosts`."
---

> Cần **máy ảo hoặc VPS**. Đổi cấu hình mạng trên VPS qua SSH có thể làm bạn mất kết nối. Luôn có đường vào dự phòng (console web của nhà cung cấp), và dùng `netplan try`. Kết quả trong bài lấy từ máy ảo Ubuntu 24.04.

## ip: công cụ mạng chính

Lệnh `ip` (gói `iproute2`) thay cho các lệnh cũ `ifconfig`, `route`, `arp`. Cấu trúc: `ip [tuỳ chọn] ĐỐI-TƯỢNG LỆNH`.

| Đối tượng | Viết tắt | Quản lý |
|---|---|---|
| `address` | `a` | Địa chỉ IP |
| `link` | `l` | Card mạng (bật, tắt, MAC, MTU) |
| `route` | `r` | Bảng định tuyến |
| `neigh` | `n` | Bảng ARP (IP → MAC của máy cùng mạng) |

### ip address

```bash
ip a
```

```text
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host noprefixroute
       valid_lft forever preferred_lft forever
2: ens3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:12:34:56 brd ff:ff:ff:ff:ff:ff
    altname enp0s3
    inet 10.0.2.15/24 metric 100 brd 10.0.2.255 scope global dynamic ens3
       valid_lft 84828sec preferred_lft 84828sec
    inet6 fe80::5054:ff:fe12:3456/64 scope link
       valid_lft forever preferred_lft forever
```

| Phần | Ý nghĩa |
|---|---|
| `2: ens3:` | Số thứ tự và tên card |
| `<...,UP,LOWER_UP>` | Card đã bật (`UP`) và có tín hiệu (`LOWER_UP`, cắm dây / nối được) |
| `mtu 1500` | Kích thước gói tin lớn nhất (byte) |
| `state UP` | Trạng thái hoạt động |
| `link/ether 52:54:00:12:34:56` | Địa chỉ MAC |
| `altname enp0s3` | Tên khác của card |
| `inet 10.0.2.15/24` | Địa chỉ IPv4 và CIDR |
| `brd 10.0.2.255` | Địa chỉ broadcast |
| `scope global dynamic` | Dùng được ra ngoài, nhận từ DHCP (`dynamic`) |
| `valid_lft 84828sec` | Thời hạn của địa chỉ DHCP còn lại |
| `inet6 fe80::...` | IPv6 link-local |

Dạng gọn, mỗi card một dòng:

```bash
ip -br a
ip -br link
```

```text
lo               UNKNOWN        127.0.0.1/8 ::1/128
ens3             UP             10.0.2.15/24 metric 100 fec0::5054:ff:fe12:3456/64 fe80::5054:ff:fe12:3456/64
lo               UNKNOWN        00:00:00:00:00:00 <LOOPBACK,UP,LOWER_UP>
ens3             UP             52:54:00:12:34:56 <BROADCAST,MULTICAST,UP,LOWER_UP>
```

**Tên card mạng** trên máy hiện đại đặt theo vị trí phần cứng: `ens3`, `enp0s3`, `eno1` (Ethernet), `wlp2s0` (Wi-Fi). Tên cũ kiểu `eth0` vẫn gặp trong container và một số VPS.

Thêm, xoá IP **tạm thời** (mất khi khởi động lại):

```bash
sudo ip addr add 10.0.2.50/24 dev ens3
ip -br a show ens3
sudo ip addr del 10.0.2.50/24 dev ens3
```

```text
ens3             UP             10.0.2.15/24 metric 100 10.0.2.50/24 fec0::5054:ff:fe12:3456/64 fe80::5054:ff:fe12:3456/64
```

Một card có thể có nhiều IP.

### ip link

| Lệnh | Làm gì |
|---|---|
| `ip link` | Danh sách card mạng |
| `sudo ip link set ens3 down` / `up` | Tắt / bật card (**cẩn thận** khi đang SSH qua chính card đó) |
| `sudo ip link set ens3 mtu 9000` | Đổi MTU |
| `ip -s link show ens3` | Thống kê byte, gói tin gửi nhận, lỗi |

### ip route: bảng định tuyến

```bash
ip route
ip route get 8.8.8.8
```

```text
default via 10.0.2.2 dev ens3 proto dhcp src 10.0.2.15 metric 100
10.0.2.0/24 dev ens3 proto kernel scope link src 10.0.2.15 metric 100
10.0.2.2 dev ens3 proto dhcp scope link src 10.0.2.15 metric 100
10.0.2.3 dev ens3 proto dhcp scope link src 10.0.2.15 metric 100
8.8.8.8 via 10.0.2.2 dev ens3 src 10.0.2.15 uid 1000
    cache
```

| Dòng | Ý nghĩa |
|---|---|
| `default via 10.0.2.2 dev ens3` | **Tuyến mặc định**: đích nào không có tuyến riêng thì gửi cho gateway `10.0.2.2` qua card `ens3` |
| `10.0.2.0/24 dev ens3 ... scope link` | Mạng nội bộ: gửi thẳng, không cần qua gateway |
| `proto dhcp` / `proto kernel` | Tuyến này do DHCP cấp / kernel tự tạo khi gán IP |
| `ip route get 8.8.8.8` | Hỏi: gói tin tới 8.8.8.8 sẽ đi đường nào |

| Lệnh | Làm gì |
|---|---|
| `sudo ip route add 192.168.60.0/24 via 192.168.50.1` | Thêm tuyến: mạng `192.168.60.0/24` đi qua router `192.168.50.1` |
| `sudo ip route del 192.168.60.0/24` | Xoá tuyến |
| `sudo ip route add default via 10.0.2.2` | Đặt gateway mặc định |

### ip neigh: bảng ARP

```bash
ip neigh
```

```text
10.0.2.3 dev ens3 lladdr 52:55:0a:00:02:03 STALE
10.0.2.2 dev ens3 lladdr 52:55:0a:00:02:02 DELAY
```

Trong cùng một mạng, máy gửi gói tin tới **địa chỉ MAC**. Giao thức ARP hỏi "ai có IP 10.0.2.2?" và lưu câu trả lời vào bảng này. `STALE`, `REACHABLE`, `DELAY` là trạng thái còn mới hay cũ của mục đó.

## Cấu hình lâu dài trên Ubuntu Server: netplan

Mọi thay đổi bằng `ip` mất khi khởi động lại. Ubuntu Server ghi cấu hình mạng bằng **netplan**: file YAML trong `/etc/netplan/`, netplan sinh ra cấu hình cho `systemd-networkd` (server) hoặc NetworkManager (desktop).

```bash
ls /etc/netplan/
sudo cat /etc/netplan/50-cloud-init.yaml
```

```text
50-cloud-init.yaml
network:
  version: 2
  ethernets:
    ens3:
      match:
        macaddress: "52:54:00:12:34:56"
      dhcp4: true
      dhcp6: true
      set-name: "ens3"
```

| Dòng | Ý nghĩa |
|---|---|
| `network:` / `version: 2` | Định dạng netplan bản 2 |
| `ethernets:` | Các card Ethernet |
| `ens3:` | Tên card |
| `match: macaddress:` | Nhận card theo địa chỉ MAC |
| `dhcp4: true` | Xin IPv4 tự động qua DHCP |

YAML phân biệt **thụt lề bằng dấu cách** (không dùng Tab). Thụt sai một dấu cách là lỗi.

### Đặt IP tĩnh

Ví dụ file `/etc/netplan/60-static.yaml` đặt IP tĩnh cho card `ens3` (thay số cho đúng mạng của bạn):

```yaml
network:
  version: 2
  ethernets:
    ens3:
      dhcp4: false
      addresses:
        - 192.168.1.50/24
      routes:
        - to: default
          via: 192.168.1.1
      nameservers:
        addresses: [1.1.1.1, 8.8.8.8]
```

| Dòng | Ý nghĩa |
|---|---|
| `dhcp4: false` | Không xin IP tự động |
| `addresses:` | IP tĩnh và CIDR (có thể nhiều IP) |
| `routes: - to: default via:` | Gateway mặc định (cách viết cũ `gateway4:` đã bị bỏ) |
| `nameservers: addresses:` | DNS server |

Áp dụng:

```bash
sudo chmod 600 /etc/netplan/60-static.yaml
sudo netplan generate
sudo netplan try
```

| Lệnh | Làm gì |
|---|---|
| `chmod 600` | netplan cảnh báo nếu file cấu hình cho người khác đọc được |
| `netplan generate` | Kiểm tra cú pháp và sinh cấu hình, chưa áp dụng |
| `netplan try` | Áp dụng thử, đợi bấm Enter trong 120 giây. Không bấm (vì mất kết nối) thì **tự quay lại** cấu hình cũ |
| `netplan apply` | Áp dụng luôn |
| `netplan get` | In cấu hình netplan đã gộp từ mọi file |

Thử nghiệm an toàn với một card ảo (không ảnh hưởng card thật): tạo `/etc/netplan/60-thu.yaml`:

```yaml
network:
  version: 2
  dummy-devices:
    dum0:
      addresses:
        - 192.168.50.10/24
      routes:
        - to: 192.168.60.0/24
          via: 192.168.50.1
```

```bash
sudo chmod 600 /etc/netplan/60-thu.yaml
sudo netplan apply
ip -br a show dum0
ip route | grep 192.168
```

```text
dum0             UNKNOWN        192.168.50.10/24 fe80::30c0:72ff:fe87:3b99/64
192.168.50.0/24 dev dum0 proto kernel scope link src 192.168.50.10
192.168.60.0/24 via 192.168.50.1 dev dum0 proto static
```

Dọn dẹp: `sudo rm /etc/netplan/60-thu.yaml && sudo netplan apply && sudo ip link del dum0`.

Xem trạng thái do `systemd-networkd` quản lý:

```bash
networkctl
```

```text
IDX LINK TYPE     OPERATIONAL SETUP
  1 lo   loopback carrier     unmanaged
  2 ens3 ether    routable    configured
```

`routable` là card có IP và đường ra ngoài. `networkctl status ens3` cho chi tiết.

> **Cloud-init trên VPS:** file `50-cloud-init.yaml` do cloud-init tạo, và có thể bị ghi lại. Đừng sửa nó. Tạo file mới với số lớn hơn (ví dụ `60-...yaml`), vì các file được đọc theo thứ tự tên.

## NetworkManager và nmcli

Ubuntu Desktop, Fedora, RHEL, Rocky dùng **NetworkManager**. Dòng lệnh là `nmcli`:

| Lệnh | Làm gì |
|---|---|
| `nmcli device status` | Trạng thái các card |
| `nmcli connection show` | Các cấu hình kết nối đã lưu |
| `sudo nmcli con mod "Wired connection 1" ipv4.addresses 192.168.1.50/24 ipv4.gateway 192.168.1.1 ipv4.dns "1.1.1.1 8.8.8.8" ipv4.method manual` | Đặt IP tĩnh |
| `sudo nmcli con up "Wired connection 1"` | Áp dụng |
| `nmcli device wifi list` / `nmcli device wifi connect TÊN password MK` | Liệt kê / kết nối Wi-Fi |
| `nmtui` | Giao diện menu trong terminal, dễ dùng hơn |

Trên RHEL/Rocky, cấu hình được lưu trong `/etc/NetworkManager/system-connections/`. Hệ thống cũ dùng file `/etc/sysconfig/network-scripts/ifcfg-*`. Debian cũ dùng `/etc/network/interfaces`.

## Tên máy và /etc/hosts

```bash
hostname
hostname -I
sudo hostnamectl set-hostname web01
cat /etc/hostname
```

| Lệnh / file | Làm gì |
|---|---|
| `hostname` | Tên máy |
| `hostname -I` | Mọi IP của máy (trừ loopback) |
| `sudo hostnamectl set-hostname web01` | Đổi tên lâu dài, ghi vào `/etc/hostname` |
| `/etc/hosts` | Bảng tên → IP tĩnh, được tra **trước** DNS ([bài 46](/bai/dns-phia-may-khach)) |

```bash
cat /etc/hosts
```

```text
127.0.0.1 localhost

# The following lines are desirable for IPv6 capable hosts
::1 ip6-localhost ip6-loopback
...
```

Đổi tên máy xong nên thêm dòng `127.0.1.1 web01` vào `/etc/hosts`, nếu không `sudo` có thể chậm và báo `unable to resolve host web01`. (Trên cloud image, cloud-init có thể quản lý file này. Xem ghi chú ở đầu file.)

## Lệnh cũ: ifconfig, route, netstat

Tài liệu và video cũ (kể cả TITV bài 33–34) hay dùng các lệnh của gói `net-tools`. Ubuntu mới không cài sẵn (`sudo apt install net-tools`). Bảng đối chiếu:

| Cũ (net-tools) | Mới (iproute2) |
|---|---|
| `ifconfig` | `ip a` |
| `ifconfig ens3 192.168.1.50 netmask 255.255.255.0` | `ip addr add 192.168.1.50/24 dev ens3` |
| `ifconfig ens3 up` / `down` | `ip link set ens3 up` / `down` |
| `route -n` | `ip route` |
| `route add default gw 192.168.1.1` | `ip route add default via 192.168.1.1` |
| `arp -n` | `ip neigh` |
| `netstat -tulpn` | `ss -tulpn` ([bài sau](/bai/kiem-tra-mang)) |

## Thực hành

Làm trên máy ảo.

1. Cho biết: tên card mạng chính, IP và CIDR, địa chỉ MAC, gateway mặc định, DNS server đang dùng.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ip -br a
   ip -br link
   ip route | grep default
   resolvectl status | grep "DNS Servers"
   ```

   </details>

2. Thêm IP phụ `10.0.2.100/24` vào card chính bằng `ip`, ping thử chính IP đó, rồi xoá. Khởi động lại thì IP này còn không?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo ip addr add 10.0.2.100/24 dev ens3
   ping -c 2 10.0.2.100
   sudo ip addr del 10.0.2.100/24 dev ens3
   ```

   Thay `ens3` bằng tên card của bạn. IP thêm bằng `ip` sẽ mất khi khởi động lại.

   </details>

3. Tạo card ảo `dum0` bằng netplan như trong bài, có IP `192.168.50.10/24`. Áp dụng, kiểm tra, khởi động lại máy, kiểm tra lại (phải còn). Rồi dọn dẹp.

4. Đổi tên máy thành `web01`, cập nhật `/etc/hosts`, mở shell mới để thấy dấu nhắc đổi theo. Rồi đổi lại như cũ.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo hostnamectl set-hostname web01
   echo "127.0.1.1 web01" | sudo tee -a /etc/hosts
   bash
   ```

   Dấu nhắc thành `...@web01`. Đổi lại bằng `sudo hostnamectl set-hostname lab` và xoá dòng vừa thêm trong `/etc/hosts`.

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Xem IP / card mạng | `ip -br a` / `ip -br link` |
| Thêm, xoá IP tạm | `sudo ip addr add IP/CIDR dev CARD` (`del` để xoá) |
| Bật, tắt card | `sudo ip link set CARD up` (`down` để tắt) |
| Bảng định tuyến / đường tới một IP | `ip route` / `ip route get IP` |
| Bảng ARP | `ip neigh` |
| Cấu hình lâu dài (Ubuntu Server) | `/etc/netplan/*.yaml`, `sudo netplan try` / `apply` |
| Cấu hình lâu dài (RHEL, desktop) | `nmcli`, `nmtui` |
| Đổi tên máy | `sudo hostnamectl set-hostname tên` |
| Trạng thái systemd-networkd | `networkctl` |
