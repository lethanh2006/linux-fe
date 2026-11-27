---
summary: "Đọc thông tin RAM, CPU, kernel, ổ đĩa, tiến trình và tên máy. Phân biệt dung lượng còn trống với bộ nhớ có thể cấp cho chương trình."
minutes: 35
commands: ["free", "cat /proc/meminfo", "cat /proc/cpuinfo", "uname", "df", "du", "top", "hostname", "dmidecode", "ip"]
quiz:
  - q: "Muốn xem dung lượng còn trống của các filesystem đang gắn, dùng lệnh nào?"
    options: ["du -sh .", "df -h", "uname -a", "hostname"]
    answer: 1
    explain: "df xem dung lượng filesystem; du cộng dung lượng file và thư mục."
  - q: "MemAvailable trong free cho biết gì?"
    options: ["RAM đã hỏng", "Dung lượng ổ đĩa", "Ước tính RAM còn có thể cấp cho ứng dụng mà chưa phải dùng swap", "Chỉ RAM hoàn toàn chưa dùng"]
    answer: 2
    explain: "Linux dùng RAM làm cache. Available tính cả phần cache có thể thu hồi nên hữu ích hơn chỉ nhìn Free."
  - q: "Lệnh nào chỉ in phiên bản kernel?"
    options: ["uname -r", "uname -m", "uname -s", "uname -n"]
    answer: 0
    explain: "-r là kernel release; -m là kiến trúc máy, -s là tên kernel, -n là tên máy."
  - q: "Vì sao thông tin trong container có thể khác máy Ubuntu cài đầy đủ?"
    options: ["Mọi container có CPU riêng", "Container luôn không có RAM", "Các lệnh đều bị sai", "Container dùng chung kernel và có thể không thấy đầy đủ phần cứng hoặc giới hạn tài nguyên qua /proc"]
    answer: 3
    explain: "Container không phải máy ảo có kernel riêng. Một số lệnh nhìn thấy thông tin host, một số chịu giới hạn namespace/cgroup."
---

> Bám video TITV bài 25. Các giá trị RAM, CPU, địa chỉ IP và tên ổ đĩa phụ thuộc máy đang dùng; hãy tập đọc ý nghĩa thay vì học thuộc con số.

## Cần biết gì về một máy Linux

Khi nhận một máy mới, ta thường hỏi: chạy hệ điều hành nào, có bao nhiêu RAM, CPU gì, ổ đĩa sắp đầy chưa và chương trình nào đang dùng tài nguyên. Mỗi lệnh trả lời một câu khác nhau.

| Câu hỏi | Lệnh |
|---|---|
| RAM đang dùng ra sao? | `free -h` |
| CPU nào? | `cat /proc/cpuinfo`, hoặc `lscpu` |
| Kernel nào? | `uname -r` |
| Filesystem còn chỗ không? | `df -h` |
| Thư mục này chiếm bao nhiêu? | `du -sh thư-mục` |
| Tiến trình nào đang chạy? | `top` |
| Tên máy là gì? | `hostname` |

## RAM: free và /proc/meminfo

```bash
free -h
head -n 5 /proc/meminfo
```

| Phần | Ý nghĩa |
|---|---|
| `free` | Tổng hợp RAM và swap |
| `-h` | Đổi đơn vị cho dễ đọc, như Mi, Gi |
| `head -n 5` | Chỉ lấy năm dòng đầu |
| `/proc/meminfo` | Thông tin bộ nhớ do kernel cung cấp |

Trong bảng `free`, chú ý các cột `total`, `used`, `free`, `buff/cache` và `available`. RAM dùng làm cache giúp đọc file nhanh hơn; cache không đồng nghĩa với RAM bị lãng phí. Khi đánh giá máy sắp thiếu RAM, xem `available` cùng tình trạng swap và tải thực tế.

Swap là vùng trên đĩa hỗ trợ bộ nhớ. Swap không biến ổ đĩa thành RAM có cùng tốc độ. Một container có thể cho thấy RAM của host thay vì đúng hạn mức container; muốn đánh giá hạn mức phải xem cấu hình cgroup/container.

## CPU, kernel và tên máy

```bash
cat /proc/cpuinfo
uname -s
uname -r
uname -m
hostname
```

| Phần | Ý nghĩa |
|---|---|
| `/proc/cpuinfo` | Thông tin CPU mà kernel cung cấp; định dạng khác nhau theo kiến trúc |
| `uname -s` | Tên kernel |
| `uname -r` | Phiên bản kernel |
| `uname -m` | Kiến trúc, ví dụ `x86_64` hoặc `aarch64` |
| `hostname` | Tên máy trong hệ thống hiện tại |

Ví dụ hai lệnh `uname -s` và `hostname` trên môi trường thực hành tên `lab`:

```text
Linux
lab
```

`uname -a` gộp nhiều thông tin vào một dòng. Đừng nhầm phiên bản kernel với phiên bản Ubuntu: tên bản phân phối xem trong `/etc/os-release`. Các file trong `/proc` là giao diện thông tin của kernel, không phải file văn bản để tự sửa như bài tập soạn thảo.

## Đĩa: phân biệt df với du

```bash
df -h
df -h /
du -sh ~
```

| Phần | Ý nghĩa |
|---|---|
| `df` | Báo dung lượng filesystem đã gắn |
| `-h` | Đơn vị dễ đọc |
| `/` | Chỉ hỏi filesystem chứa thư mục gốc |
| `du` | Tính dung lượng từ các file/thư mục |
| `-s` | Chỉ in tổng cho từng đối số |
| `~` | Thư mục home của người hiện tại |

Trong `df`, đọc `Size`, `Used`, `Avail`, `Use%`, `Mounted on`. Thiết bị có thể mang tên `/dev/sda1`, `/dev/nvme0n1p1`, hoặc `overlay` trong container. Hai lệnh có thể cho tổng khác nhau do cách tính, file đã xoá nhưng còn mở, quyền truy cập hoặc các điểm gắn bên trong thư mục.

## Tiến trình và phần cứng chi tiết

```bash
top
```

`top` cập nhật liên tục. Đọc tên tiến trình, `%CPU`, `%MEM`; nhấn `q` để thoát. Chỉ quan sát ở bài này, không thử dừng các tiến trình chưa hiểu.

Video giới thiệu `dmidecode` để đọc bảng thông tin phần cứng. Trên máy có hỗ trợ DMI và đã cài công cụ:

```bash
sudo dmidecode -t system
```

`sudo` cấp quyền quản trị, `-t system` chọn nhóm thông tin hệ thống. Trong container, máy ảo hoặc máy ARM, công cụ có thể không có dữ liệu phù hợp. Lỗi đó không chứng minh máy không có phần cứng.

Video dùng `ifconfig` xem IP; Ubuntu hiện nay có thể dùng `ip -br address` mà không cần gói `net-tools`. Ta học kỹ ở [bài 33](/bai/cau-hinh-mang).

## Thực hành

1. Ghi lại tên bản phân phối, kernel, kiến trúc và tên máy.
2. Xem RAM tổng và `available`, rồi giải thích vì sao `free` nhỏ chưa đủ kết luận máy thiếu RAM.
3. Xem dung lượng filesystem chứa `/` và dung lượng thư mục home. Nói rõ hai số đang đo gì.

<details>
<summary>Xem cách làm</summary>

```bash
cat /etc/os-release
uname -r
uname -m
hostname
free -h
df -h /
du -sh ~
```

Không có một bộ con số chung cho mọi máy. Cần giải thích được `df` đo filesystem, còn `du` đo cây thư mục; `available` là ước tính RAM có thể cấp thêm.

</details>

## Tóm tắt

`free` xem RAM, `uname` xem kernel, `df` xem filesystem, `du` xem dung lượng thư mục, `top` xem tiến trình. Khi so sánh kết quả, luôn ghi rõ đang ở máy thật, máy ảo hay container.
