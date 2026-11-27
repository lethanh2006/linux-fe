---
summary: Đặt địa chỉ IP cho card mạng theo hai kiểu. Tạm thời bằng ifconfig hoặc ip addr (mất khi khởi động lại), và lâu dài bằng file YAML của netplan. Kèm netplan try để tự quay lại khi cấu hình sai, và nmtui trên máy có NetworkManager.
minutes: 35
commands: [ifconfig ... netmask, ip addr add, ip addr del, ip link set up, netplan apply, netplan try, nmtui]
quiz:
  - q: "Đặt IP bằng `sudo ip addr add 192.168.1.100/24 dev ens4` thì sau khi khởi động lại máy sao?"
    options: ["IP vẫn còn", "IP mất, vì chỉ là cấu hình tạm thời", "Máy không lên mạng được nữa", "IP đổi thành 192.168.1.1"]
    answer: 1
    explain: "`ip` và `ifconfig` chỉ đổi cấu hình đang chạy. Muốn giữ lâu dài phải ghi vào file netplan."
  - q: "Trên Ubuntu, cấu hình mạng lâu dài nằm ở đâu?"
    options: ["/etc/network/ip.conf", "Các file .yaml trong /etc/netplan/", "/etc/hosts", "/etc/resolv.conf"]
    answer: 1
    explain: "Ubuntu dùng netplan: file YAML trong `/etc/netplan/`, áp dụng bằng `sudo netplan apply`."
  - q: "`/24` trong `192.168.1.100/24` tương đương mặt nạ mạng nào?"
    options: ["255.0.0.0", "255.255.0.0", "255.255.255.0", "255.255.255.255"]
    answer: 2
    explain: "24 bit đầu là phần mạng: 255.255.255.0. Mọi máy 192.168.1.x cùng một mạng."
  - q: "`sudo netplan try` khác `sudo netplan apply` ở chỗ nào?"
    options: ["Không khác", "try áp dụng thử, nếu không bấm Enter xác nhận trong thời hạn thì tự quay về cấu hình cũ", "try chỉ kiểm tra cú pháp", "try áp dụng cho lần khởi động sau"]
    answer: 1
    explain: "Rất hữu ích khi sửa mạng của máy từ xa: lỡ cấu hình sai làm mất kết nối, máy tự trả lại cấu hình cũ."
  - q: "File YAML của netplan sai ở chỗ nào thì hay bị lỗi nhất?"
    options: ["Dùng chữ hoa", "Thụt lề sai hoặc dùng phím Tab", "Có chú thích", "Tên file dài"]
    answer: 1
    explain: "YAML dựa vào thụt lề bằng **dấu cách** để biết cấp. Dùng Tab hoặc lệch một dấu cách là sai."
---

> Bài này đi theo video TITV bài 34. Kết quả trong bài lấy trên card `ens4`, là card thứ hai của máy. Đổi IP của card đang dùng để điều khiển máy từ xa sẽ làm mất kết nối; hãy thử trên card không dùng tới, hoặc ngồi trực tiếp trước máy.

Có hai kiểu đặt IP:

| Kiểu | Cách | Khi khởi động lại |
|---|---|---|
| Tạm thời | Lệnh `ifconfig` hoặc `ip` | **Mất** |
| Lâu dài | Ghi vào file cấu hình netplan | Giữ nguyên |

## Đặt IP tạm thời

### Bằng ifconfig

```bash
sudo ifconfig ens4 192.168.1.100 netmask 255.255.255.0 up
ifconfig ens4 | head -3
```

| Phần | Ý nghĩa |
|---|---|
| `ens4` | Card cần đặt (máy trong video là `enp0s3`) |
| `192.168.1.100` | Địa chỉ IP mới |
| `netmask 255.255.255.0` | Mặt nạ mạng: ba số đầu `192.168.1` là phần mạng |
| `up` | Bật card |

```text
ens4: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::5054:ff:fe12:3457  prefixlen 64  scopeid 0x20<link>
```

`ifconfig` **thay** IP cũ của card bằng IP mới. Broadcast `192.168.1.255` được tự tính từ mặt nạ.

### Bằng ip (có sẵn)

```bash
sudo ip addr add 192.168.1.101/24 dev ens4
sudo ip link set dev ens4 up
ip -br a show ens4
```

| Phần | Ý nghĩa |
|---|---|
| `ip addr add` | Thêm một địa chỉ |
| `192.168.1.101/24` | IP và mặt nạ viết gọn: `/24` = `255.255.255.0` |
| `dev ens4` | Card nào |
| `ip link set dev ens4 up` | Bật card (nếu đang tắt) |

```text
ens4             UP             192.168.1.100/24 192.168.1.101/24 fec0::5054:ff:fe12:3457/64 fe80::5054:ff:fe12:3457/64 
```

Khác `ifconfig`: `ip addr add` **cộng thêm** địa chỉ, nên card giờ có hai IP. Thử gọi tới IP mới:

```bash
ping -c 1 192.168.1.101
```

```text
PING 192.168.1.101 (192.168.1.101) 56(84) bytes of data.
64 bytes from 192.168.1.101: icmp_seq=1 ttl=64 time=0.090 ms

--- 192.168.1.101 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 0.090/0.090/0.090/0.000 ms
```

Gỡ địa chỉ:

```bash
sudo ip addr del 192.168.1.101/24 dev ens4
sudo ip addr flush dev ens4
ip -br a show ens4
```

```text
ens4             UP             
```

| Lệnh | Làm gì |
|---|---|
| `ip addr del IP/mặt-nạ dev card` | Gỡ một địa chỉ |
| `ip addr flush dev card` | Gỡ mọi địa chỉ của card |

Cấu hình kiểu này mất khi khởi động lại máy, hoặc khi dịch vụ mạng cấu hình lại card. Dùng để thử nhanh.

## Đặt IP lâu dài: netplan

Ubuntu lưu cấu hình mạng trong các file **YAML** ở `/etc/netplan/`. Netplan đọc các file này rồi giao cho dịch vụ quản lý mạng (`systemd-networkd` trên server, `NetworkManager` trên desktop, bài 33).

```bash
ls -l /etc/netplan
```

```text
total 4
-rw------- 1 root root 157 Nov 27 19:48 50-cloud-init.yaml
```

Tên file có số ở đầu; các file được đọc theo thứ tự tên. Máy của bạn có thể có file tên khác, ví dụ `01-network-manager-all.yaml` trên Ubuntu Desktop.

### Mẫu: IP tĩnh cho card chính

Mẫu đầy đủ giống trong video, cho card `enp0s3` dùng IP tĩnh, gateway và DNS:

```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    enp0s3:
      dhcp4: false
      addresses:
        - 192.168.1.100/24
      routes:
        - to: default
          via: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
```

| Dòng | Ý nghĩa |
|---|---|
| `version: 2` | Phiên bản cú pháp netplan, luôn là 2 |
| `renderer: networkd` | Dịch vụ thực hiện: `networkd` (server) hoặc `NetworkManager` (desktop). Bỏ trống thì mặc định `networkd` |
| `ethernets:` | Các card có dây |
| `enp0s3:` | Tên card |
| `dhcp4: false` | Không xin IP tự động |
| `addresses:` | Danh sách IP tĩnh, kèm `/mặt-nạ` |
| `routes: - to: default via: 192.168.1.1` | Gateway. Tài liệu cũ viết `gateway4: 192.168.1.1`; cách này đã cũ, netplan mới báo cảnh báo |
| `nameservers: addresses:` | Máy chủ DNS |

Mẫu này đã được kiểm tra cú pháp bằng `netplan generate`. Thay IP, gateway, tên card cho khớp mạng của bạn.

> **YAML rất kén thụt lề:** chỉ dùng **dấu cách** (không dùng phím Tab), các mục cùng cấp phải thẳng hàng. Sai một dấu cách là netplan báo lỗi.

### Làm thật trên card ens4

Ghi file bằng `sudo` (file trong `/etc` của root; video quên `sudo` nên lưu không được). Có thể mở `sudo nano /etc/netplan/60-ens4.yaml` để gõ tay; ở đây ghi bằng `tee`:

```bash
printf 'network:\n  version: 2\n  ethernets:\n    ens4:\n      addresses:\n        - 192.168.1.100/24\n      nameservers:\n        addresses: [8.8.8.8, 8.8.4.4]\n' | sudo tee /etc/netplan/60-ens4.yaml
```

```text
network:
  version: 2
  ethernets:
    ens4:
      addresses:
        - 192.168.1.100/24
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
```

Card phụ này không cần gateway, vì card chính đã lo đường ra Internet. Áp dụng:

```bash
sudo netplan apply
```

```text

** (generate:1808): WARNING **: 23:19:29.682: Permissions for /etc/netplan/60-ens4.yaml are too open. Netplan configuration should NOT be accessible by others.
...
```

Netplan vẫn chạy nhưng cảnh báo: file cấu hình mạng chỉ nên để root đọc. Sửa quyền (bài 31) rồi áp dụng lại:

```bash
sudo chmod 600 /etc/netplan/60-ens4.yaml
sudo netplan apply
ip -br a show ens4
resolvectl dns ens4
```

```text
ens4             UP             192.168.1.100/24 
Link 3 (ens4): 8.8.8.8 8.8.4.4
```

IP và DNS đã đúng, và sẽ giữ nguyên sau khi khởi động lại.

### netplan try: thử có đường lui

Đổi IP sai trên máy ở xa là mất kết nối. `netplan try` áp dụng thử rồi chờ bạn bấm `Enter`; không bấm trong thời hạn (mặc định 120 giây) thì tự trả lại cấu hình cũ. Ví dụ sau khi sửa IP trong file thành `192.168.1.110/24`:

```bash
sudo netplan try --timeout 30
```

```text
Do you want to keep these settings?


Press ENTER before the timeout to accept the new configuration


Changes will revert in 30 seconds
Configuration accepted.
```

Bấm `Enter` thì cấu hình được giữ (`Configuration accepted.`). Nếu mất kết nối và không bấm được, 30 giây sau máy tự quay lại cấu hình cũ.

Dọn sau khi thử: `sudo rm /etc/netplan/60-ens4.yaml`, rồi `sudo netplan apply`.

## nmtui: giao diện trong terminal

Máy có **NetworkManager** (Ubuntu Desktop, hoặc server có cài gói `network-manager`) có `nmtui`: giao diện chọn bằng phím mũi tên ngay trong terminal.

```bash
sudo nmtui
```

Các bước: chọn **Edit a connection** → chọn card → ở **IPv4 CONFIGURATION** đổi `Automatic` thành `Manual` → **Show** → điền **Addresses** (`192.168.1.100/24`), **Gateway**, **DNS servers** → **OK**. Sau đó vào **Activate a connection**, tắt rồi bật lại card để áp dụng.

Ubuntu Server mặc định không có NetworkManager nên không có `nmtui`; dùng netplan như trên.

## Giao diện đồ hoạ

Trên Ubuntu Desktop: **Settings → Network** → bấm biểu tượng bánh răng của card → tab **IPv4** → chọn **Manual** → điền địa chỉ, mặt nạ, gateway, DNS → **Apply**.

## Mở rộng (chuẩn LPIC-1)

Chuẩn LPIC-1 mục 109.2 còn có:

| Lệnh, file | Ý nghĩa |
|---|---|
| `netplan get` | In cấu hình netplan đang có (gộp mọi file) |
| `netplan generate` | Chỉ kiểm tra và sinh cấu hình, chưa áp dụng |
| `nmcli con show`, `nmcli con mod` | Xem, sửa cấu hình NetworkManager bằng lệnh |
| `ip route add default via IP` | Thêm gateway tạm thời |
| `/etc/network/interfaces` | Cách cấu hình mạng kiểu Debian cũ, dùng `ifup`/`ifdown` |
| `/etc/sysconfig/network-scripts/` | Cách cấu hình cũ của họ Red Hat; bản mới dùng NetworkManager |
| DHCP | Máy chủ trong mạng (thường là router) tự cấp IP. `dhcp4: true` trong netplan |

```bash
sudo netplan get ethernets.ens4
```

```text
addresses:
- "192.168.1.100/24"
nameservers:
  addresses:
  - 8.8.8.8
  - 8.8.4.4
```

## Thực hành

Làm trên card không dùng để điều khiển máy từ xa.

1. Gán tạm IP `10.10.10.5/24` cho card, kiểm tra bằng `ip -br a`, rồi gỡ đi.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo ip addr add 10.10.10.5/24 dev ens4
   ip -br a show ens4
   sudo ip addr del 10.10.10.5/24 dev ens4
   ```

   Thay `ens4` bằng tên card của bạn.

   </details>

2. Đổi `255.255.255.0`, `255.255.0.0` ra dạng `/số`.

   <details>
   <summary>Xem đáp án</summary>

   `/24` và `/16`: mỗi số `255` là 8 bit.

   </details>

3. Viết file netplan cho card `ens4` dùng IP tự động (DHCP), áp dụng bằng `netplan try`.

   <details>
   <summary>Xem đáp án</summary>

   ```yaml
   network:
     version: 2
     ethernets:
       ens4:
         dhcp4: true
   ```

   Lưu vào `/etc/netplan/60-ens4.yaml`, `sudo chmod 600` file đó, rồi `sudo netplan try` và bấm `Enter`.

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| IP tạm (thay IP cũ) | `sudo ifconfig card IP netmask MẶT-NẠ up` |
| IP tạm (thêm IP) | `sudo ip addr add IP/24 dev card` |
| Bật card | `sudo ip link set dev card up` |
| Gỡ IP | `sudo ip addr del IP/24 dev card` |
| IP lâu dài | File YAML trong `/etc/netplan/`, quyền 600 |
| Áp dụng | `sudo netplan apply` |
| Áp dụng có đường lui | `sudo netplan try` |
| Giao diện trong terminal | `sudo nmtui` (máy có NetworkManager) |
