---
summary: "Đọc tên card, IP, gateway và cách phân giải tên. Phân biệt hosts với DNS, xem cấu hình bằng ip, getent, resolvectl và các lệnh net-tools trong video."
minutes: 40
commands: ["ip link", "ip address", "ip route", "getent hosts", "resolvectl", "ifconfig", "route"]
quiz:
  - q: "Lệnh nào xem bảng định tuyến bằng bộ iproute2?"
    options: ["ip route", "ip link add", "hostname -s", "cat /etc/passwd"]
    answer: 0
    explain: "ip route hiển thị route, trong đó có default route nếu được cấu hình."
  - q: "File /etc/hosts thay đổi tên miền cho những máy nào?"
    options: ["Mọi máy trên Internet", "Mọi máy cùng Wi-Fi", "Máy có file đó, theo cấu hình phân giải tên của nó", "Chỉ router"]
    answer: 2
    explain: "hosts là ánh xạ cục bộ, không tạo một bản ghi DNS toàn cầu."
  - q: "nameserver 127.0.0.53 trong resolv.conf thường là gì trên Ubuntu dùng systemd-resolved?"
    options: ["IP công cộng của website", "Máy chủ DNS toàn cầu bắt buộc", "Gateway của mọi mạng", "DNS stub cục bộ"]
    answer: 3
    explain: "127.0.0.53 là địa chỉ loopback thường dùng cho stub của systemd-resolved; DNS upstream cần xem cấu hình dịch vụ."
  - q: "Điều gì có thể xảy ra nếu tắt card đang dùng để SSH?"
    options: ["Chỉ đổi tên user", "Mất kết nối SSH", "Không ảnh hưởng gì", "Tự tạo VPN"]
    answer: 1
    explain: "Phiên SSH phụ thuộc đường mạng đó. Chỉ thử up/down từ console của VM lab hoặc trên card lab riêng."
---

> Bám video TITV bài 33. Bắt đầu bằng các lệnh chỉ đọc. Các thao tác bật/tắt card chỉ làm trên máy ảo lab có console, không trên đường mạng đang dùng để SSH.

## Card mạng, IP và route là ba việc khác nhau

Card mạng là giao diện gửi nhận dữ liệu. Địa chỉ IP được gắn lên giao diện. Bảng định tuyến quyết định gửi dữ liệu qua đâu. Có card ở trạng thái UP chưa có nghĩa đã có IP, gateway đúng hoặc DNS hoạt động.

```bash
ip -br link
ip -br address
ip route
```

| Phần | Ý nghĩa |
|---|---|
| `ip` | Công cụ quản lý mạng trong bộ iproute2 |
| `link` | Thông tin giao diện ở tầng liên kết |
| `address` | Địa chỉ được gắn lên giao diện |
| `route` | Bảng định tuyến |
| `-br` | Hiện dạng ngắn gọn |

Tên card có thể là `enp0s3`, `ens18`, `eth0`, `wlp2s0`... Không lấy một tên trong video rồi mặc định máy mình giống hệt. `lo` là loopback, phục vụ giao tiếp trong chính máy.

Trong container lab có thể thấy default route dạng:

```text
default via 172.17.0.1 dev eth0
```

`default` là đường mặc định, `via` là next hop/gateway, `dev` là giao diện. Con số này thuộc mạng container ví dụ, không phải gateway để chép vào mọi máy Ubuntu.

## hosts: ánh xạ tên trên máy hiện tại

```bash
cat /etc/hosts
getent hosts localhost
```

Một dòng minh hoạ:

```text
192.0.2.10 web-lab.example
```

Dòng này ánh xạ tên sang địa chỉ trên máy có cấu hình đó. Địa chỉ `192.0.2.10` dành cho ví dụ tài liệu, không phải địa chỉ dịch vụ thật để truy cập Internet.

`getent hosts tên` tra theo cấu hình NSS của hệ thống, có thể dùng hosts, DNS hoặc nguồn khác. Thứ tự liên quan đến mục `hosts:` trong `/etc/nsswitch.conf`. Thêm một dòng hosts không đăng ký tên miền công cộng và không đảm bảo có một dịch vụ đang lắng nghe ở IP đó.

Chỉ trên VM lab, có thể mở `/etc/hosts` bằng `sudoedit /etc/hosts`, thêm tên thử nghiệm phù hợp mạng lab, tra bằng getent rồi xoá dòng thử nghiệm. Giữ nguyên các dòng hệ thống và không dùng thí nghiệm này để đổi website thật.

## DNS và resolv.conf

```bash
ls -l /etc/resolv.conf
cat /etc/resolv.conf
```

Video giới thiệu file cấu hình DNS này. Trên Ubuntu, nó có thể là symlink do dịch vụ khác quản lý. Nếu thấy `nameserver 127.0.0.53`, đó thường là stub resolver cục bộ của systemd-resolved, không phải IP DNS upstream trên Internet.

Trên máy chạy dịch vụ đó:

```bash
resolvectl status
```

Lệnh cho biết DNS theo từng giao diện. Trong một số container hoặc hệ thống khác, không có systemd-resolved nên lệnh không dùng được. Đừng thay toàn bộ resolv.conf để chữa một lỗi chưa xác định; thay đổi lâu dài nên đi qua công cụ đang quản lý mạng của máy.

## Các lệnh trong video và công cụ hiện nay

| Trong video | Công cụ hiện nay có thể dùng |
|---|---|
| `ifconfig` | `ip address`, `ip link` |
| `route -n` | `ip route` |
| `ifconfig CARD down/up` | `ip link set dev CARD down/up` |

`ifconfig` và `route` thuộc gói `net-tools`, có thể chưa được cài trên Ubuntu. `iproute2` là bộ công cụ nên làm quen cho các thao tác mới.

Để hiểu cú pháp bật/tắt card, mẫu lệnh là `sudo ip link set dev TEN_CARD down` và `sudo ip link set dev TEN_CARD up`; phải thay `TEN_CARD` bằng card lab đúng. `down` có thể làm mất mạng ngay. Đừng thử trên card đang phục vụ kết nối từ xa. Bài 34 dùng một giao diện ảo riêng để thực hành địa chỉ mà không phải tắt card chính.

## Thực hành

1. Ghi tên card đang có IP và default gateway của máy lab.
2. Xem resolv.conf có phải symlink không.
3. Giải thích: phân giải được tên có đủ chứng minh web server hoạt động không?

<details>
<summary>Xem cách làm</summary>

```bash
ip -br address
ip route
ls -l /etc/resolv.conf
getent hosts localhost
```

Phân giải tên chỉ cho biết kết quả tra địa chỉ. Web server còn phụ thuộc kết nối mạng, cổng, dịch vụ, tường lửa và giao thức. Tương tự, ping thành công hay thất bại không thay thế kiểm tra dịch vụ web.

</details>

## Tóm tắt

Xem riêng trạng thái card, địa chỉ, route và phân giải tên. Hosts là dữ liệu cục bộ; DNS có thể được quản lý bởi dịch vụ. Biết cả lệnh trong video và cách tương ứng bằng `ip` để đọc được tài liệu cũ lẫn làm việc trên Ubuntu hiện nay.
