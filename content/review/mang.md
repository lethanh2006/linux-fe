## [Bài 33. Cấu hình mạng](/bai/cau-hinh-mang)

| File, lệnh | Làm gì |
|---|---|
| `/etc/hosts` | Gán tên cho IP ngay trên máy, được tra trước DNS. Ví dụ `127.0.0.1 titv.vn` |
| `/etc/resolv.conf` | Máy chủ DNS (dòng `nameserver`) |
| `ls /sys/class/net` | Liệt kê card mạng |
| `ip a`, `ifconfig` | Xem địa chỉ IP |
| `sudo ip link set ens4 down` / `up` | Tắt / bật card. Cách cũ: `sudo ifconfig ens4 down` |
| `ip route`, `route -n` | Xem gateway (dòng `default via`) |
| `sudo systemctl restart systemd-networkd` | Khởi động lại dịch vụ mạng (máy desktop dùng `NetworkManager`) |

Tên card: `en` là có dây, `wl` là Wi-Fi, `ww` là mạng di động, `lo` là card nội bộ (127.0.0.1). Ubuntu không có sẵn `ifup`, `ifdown`.

## [Bài 34. Cấu hình địa chỉ IP](/bai/cau-hinh-dia-chi-ip)

| Cách | Lệnh | Sau khi khởi động lại |
|---|---|---|
| Tạm thời, thay IP cũ | `sudo ifconfig ens4 192.168.1.100 netmask 255.255.255.0 up` | Mất |
| Tạm thời, thêm IP | `sudo ip addr add 192.168.1.100/24 dev ens4` | Mất |
| Lâu dài | File YAML trong `/etc/netplan/`, rồi `sudo netplan apply` | Còn |
| Lâu dài, bằng menu | `sudo nmtui` (máy có NetworkManager) | Còn |

Mẫu file netplan:

```yaml
network:
  version: 2
  ethernets:
    enp0s3:
      addresses:
        - 192.168.1.100/24
      routes:
        - to: default
          via: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
```

File netplan để quyền 600, thụt lề bằng dấu cách (không dùng Tab). `sudo netplan try` sẽ tự quay lại cấu hình cũ nếu bạn không bấm Enter xác nhận. Gỡ IP tạm: `sudo ip addr del 192.168.1.100/24 dev ens4`.

## Thử nhanh

Chép cả khối vào terminal để xem các lệnh của chặng chạy thế nào.

```bash
ls /sys/class/net
ip -br a
ip route
cat /etc/hosts
grep -v "^#" /etc/resolv.conf
echo "127.0.0.1 web.thu" | sudo tee -a /etc/hosts
ping -c 1 web.thu
sudo sed -i '/web.thu/d' /etc/hosts
ls /etc/netplan
```

Bạn sẽ thấy:

- `ip -br a` in mỗi card một dòng kèm IP; dòng `default via` của `ip route` là gateway.
- `ping -c 1 web.thu` trả lời từ `127.0.0.1` vì tên vừa được thêm vào `/etc/hosts`; lệnh `sed` xoá dòng đó đi.
- Khi thử, đừng tắt card mạng hay đổi IP của card đang dùng.
