---
summary: "Phân biệt IP tạm thời và cấu hình giữ qua khởi động. Thử địa chỉ trên card ảo riêng, đọc mẫu Netplan và biết khi nào dùng NetworkManager/nmtui."
minutes: 45
commands: ["ip address add", "ip address del", "ip link", "ifconfig", "netplan generate", "netplan try", "nmtui"]
quiz:
  - q: "ip address add gắn IP theo cách nào?"
    options: ["Luôn ghi vào mọi file Netplan", "Tạm thời trong cấu hình đang chạy, trừ khi một công cụ khác lưu lại", "Chỉ thay DNS", "Đổi địa chỉ MAC vật lý"]
    answer: 1
    explain: "ip thay cấu hình kernel đang chạy. Địa chỉ có thể mất khi giao diện được cấu hình lại hoặc máy khởi động."
  - q: "Trong 192.0.2.10/24, /24 tương ứng netmask IPv4 nào?"
    options: ["255.0.0.0", "255.255.0.0", "255.255.255.255", "255.255.255.0"]
    answer: 3
    explain: "24 bit đầu là phần mạng; dạng netmask thập phân tương ứng là 255.255.255.0."
  - q: "Cần làm gì với tên card trong một mẫu Netplan?"
    options: ["Xác định tên thật và công cụ quản lý mạng trước khi sửa cấu hình", "Giữ nguyên mọi máy đều enp0s8", "Đổi tên tài khoản thành tên card", "Bỏ toàn bộ phần ethernets"]
    answer: 0
    explain: "Tên giao diện, subnet, gateway, DNS và renderer đều phụ thuộc môi trường; mẫu không phải cấu hình dùng chung."
  - q: "netplan try có thay thế hoàn toàn việc có console và kiểm tra rollback không?"
    options: ["Có, luôn bảo đảm khôi phục", "Có, nếu đặt timeout dài", "Không; cần kiểm tra kết quả và có cách phục hồi phù hợp", "Chỉ cần tắt SSH"]
    answer: 2
    explain: "try có cơ chế thử và hoàn tác khi không xác nhận, nhưng tài liệu lưu ý có trường hợp cần xác minh cấu hình đã thực sự trở lại."
---

> Bám video TITV bài 34. IP trong ví dụ `192.0.2.0/24` là dải dành cho tài liệu. Phần thực hành tạm thời dùng card ảo lab riêng; cấu hình lâu dài chỉ làm trên VM có console và thông số mạng đã biết.

## Tạm thời và lâu dài

Có hai lớp cấu hình cần phân biệt:

- Lệnh `ip` hoặc `ifconfig` thay trạng thái mạng đang chạy. Thay đổi có thể mất khi giao diện được quản lý lại hoặc máy khởi động.
- Netplan hoặc NetworkManager lưu cấu hình để công cụ quản lý mạng áp dụng lại.

Một địa chỉ chưa đủ: kết nối ra ngoài subnet thường cần route phù hợp; truy cập bằng tên còn cần phân giải tên. Không lấy IP tĩnh tuỳ ý trong một mạng đang dùng, vì có thể trùng địa chỉ của máy khác.

## Thực hành IP trên card ảo riêng

Thực hiện trên Ubuntu VM lab. Cần quyền quản trị và hỗ trợ giao diện `dummy`; container mặc định thường không có quyền NET_ADMIN để làm phần này.

```bash
sudo ip link add labnet0 type dummy
sudo ip link set dev labnet0 up
sudo ip address add 192.0.2.10/24 dev labnet0
ip -4 -br address show dev labnet0
```

| Phần | Ý nghĩa |
|---|---|
| `link add labnet0` | Tạo giao diện lab mới tên labnet0 |
| `type dummy` | Giao diện ảo phục vụ thử nghiệm, không phải card Internet thật |
| `link set dev labnet0 up` | Bật giao diện này |
| `address add` | Thêm địa chỉ, không tự cấu hình DNS hay gateway |
| `192.0.2.10/24` | IP và số bit mạng; /24 tương ứng 255.255.255.0 |
| `dev labnet0` | Chỉ rõ giao diện nhận IP |
| `-4 -br` | Chỉ IPv4, hiển thị ngắn gọn |

Dòng địa chỉ sẽ có `192.0.2.10/24`. Trạng thái hiển thị của card ảo có thể là `UNKNOWN`; hãy đọc cả cờ UP và địa chỉ, không suy ra Internet đã hoạt động từ một chữ trạng thái.

Thử thêm rồi gỡ một địa chỉ thứ hai:

```bash
sudo ip address add 192.0.2.11/24 dev labnet0
ip -4 -br address show dev labnet0
sudo ip address del 192.0.2.11/24 dev labnet0
```

`add` có thể làm giao diện có nhiều địa chỉ. Nó không có nghĩa tự thay mọi địa chỉ cũ. Sau bài tập, dọn riêng card lab:

```bash
sudo ip link delete labnet0
```

Không chạy lệnh xoá với card chính của máy. Nếu tên labnet0 đã tồn tại trước bài, xác định ai tạo nó trước khi tiếp tục, không xoá để tránh lỗi.

## ifconfig trong video

Nếu lab có gói `net-tools`, tạo lại card lab rồi thử cú pháp trong video:

```bash
sudo ip link add labnet0 type dummy
sudo ifconfig labnet0 192.0.2.20 netmask 255.255.255.0 up
ifconfig labnet0
sudo ip link delete labnet0
```

`netmask` đặt mặt nạ, `up` bật card. Đây là cú pháp cũ để hiểu video. Khối lệnh tạo và dọn riêng card lab, không thay địa chỉ của card chính.

## Netplan: cấu hình giữ qua khởi động

Ubuntu Server thường dùng Netplan với systemd-networkd. Ubuntu Desktop có thể dùng NetworkManager. Xác định công cụ đang quản lý máy trước; không cài thêm hoặc bật hai công cụ chỉ để bắt chước một ví dụ.

Các file YAML Netplan được kết hợp từ cấu hình hệ thống, nên không giả định một file mới sẽ vô hiệu hết cấu hình cũ. Trước khi sửa, xem cấu hình và sao lưu thư mục cấu hình trên VM lab:

```bash
sudo netplan get
sudo cp -a /etc/netplan /etc/netplan.backup-lab
```

Nếu bản sao đã có sẵn, dùng tên sao lưu mới thay vì ghi chồng. Không chia sẻ file cấu hình có chứa thông tin xác thực Wi-Fi.

Ví dụ dưới đây dành cho một card lab host-only tên `enp0s8`. Trước hết kiểm tra tên card bằng `ip -br link` và xem các file đang có bằng `sudo netplan get` cùng `ls /etc/netplan`.

Trên VM lab, nếu card này chưa được khai báo trong file khác và tên file `60-lab.yaml` chưa được dùng, mở file lab:

```bash
sudoedit /etc/netplan/60-lab.yaml
```

Nhập mẫu bên dưới sau khi thay tên card và địa chỉ theo mạng lab. Nếu card đã có cấu hình, sửa đúng file đang quản lý nó thay vì tạo thêm một khai báo chồng lên. Không thử trên card đang giữ kết nối SSH.

```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    enp0s8:
      dhcp4: false
      addresses:
        - 192.168.56.20/24
```

| Phần | Ý nghĩa |
|---|---|
| `version: 2` | Phiên bản định dạng Netplan |
| `renderer: networkd` | Backend systemd-networkd cho ví dụ server này |
| `ethernets` | Nhóm giao diện Ethernet |
| `enp0s8` | Tên card thật của VM ví dụ, phải kiểm tra trên máy mình |
| `dhcp4: false` | Không xin IPv4 bằng DHCP cho card ví dụ |
| `addresses` | Danh sách địa chỉ tĩnh |

Mẫu host-only không đặt default route hoặc DNS vì chỉ nhằm giao tiếp trong mạng lab. Nếu cấu hình card phục vụ mạng khác, cần thông số gateway/DNS đúng và tránh làm mất đường truy cập hiện tại. Không chép mẫu này nguyên vẹn lên VPS.

Sau khi lưu file lab, đặt quyền 600 cho chính file vừa sửa và kiểm tra cú pháp. Nếu chọn tên file khác, thay đường dẫn tương ứng:

```bash
sudo chmod 600 /etc/netplan/60-lab.yaml
sudo netplan generate
sudo netplan try --timeout 120
```

`generate` kiểm tra và sinh cấu hình, chưa thay thế việc xác minh kết nối thực tế. `try` áp dụng thử, yêu cầu xác nhận và có cơ chế hoàn tác nếu không xác nhận. Tài liệu Netplan lưu ý phải kiểm tra cấu hình có thực sự được khôi phục khi huỷ hoặc hết thời gian; vì vậy vẫn cần console và bản sao cấu hình. Khi xác nhận cấu hình đúng, kiểm tra lại địa chỉ và route.

```bash
ip -4 -br address show dev enp0s8
ip route
```

Thay `enp0s8` bằng tên card lab đã chọn. Đối chiếu địa chỉ với YAML và thử kết nối tới một máy khác trong mạng lab nếu có. Sau khi khởi động lại VM lab, chạy lại các lệnh này để kiểm tra cấu hình đã được giữ.

## nmtui là lựa chọn cho NetworkManager

Video giới thiệu giao diện chữ `nmtui`. Chỉ dùng nó khi NetworkManager được cài và đang quản lý card cần cấu hình. Trong giao diện, phần sửa kết nối cho phép chọn phương thức IPv4, địa chỉ/prefix, gateway và DNS; phần kích hoạt kết nối áp dụng thay đổi.

Nếu máy server dùng networkd, việc không có nmtui không phải lỗi của Netplan. Không chuyển renderer của card đang phục vụ truy cập từ xa chỉ để làm bài này.

## Thực hành

1. Tạo labnet0, gắn `192.0.2.30/24`, xem kết quả rồi xoá card lab.
2. Giải thích vì sao thao tác trên không bảo đảm IP tồn tại sau khởi động.
3. Đọc YAML mẫu và chỉ ra chỗ cần thay theo môi trường thật.

<details>
<summary>Xem đáp án</summary>

```bash
sudo ip link add labnet0 type dummy
sudo ip link set dev labnet0 up
sudo ip address add 192.0.2.30/24 dev labnet0
ip -4 -br address show dev labnet0
sudo ip link delete labnet0
```

Đây là cấu hình đang chạy trong kernel. Muốn giữ lâu dài cần cấu hình qua công cụ quản lý mạng phù hợp. Trong YAML phải xác định lại tên card, renderer, phương thức DHCP/tĩnh và địa chỉ; route và DNS tuỳ nhu cầu, không có một bộ giá trị chung cho mọi máy.

</details>

## Đọc thêm

[Tài liệu chính thức netplan try](https://netplan.readthedocs.io/en/stable/netplan-try/) mô tả xác nhận, timeout và các lưu ý về hoàn tác.

## Tóm tắt

Dùng card lab riêng để hiểu IP/prefix và thao tác add/del. Cấu hình tạm thời khác cấu hình được lưu. Với cấu hình thật, xác định công cụ quản lý, sao lưu, kiểm tra cú pháp, thử có khả năng khôi phục rồi xác minh kết nối.
