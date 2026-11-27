---
summary: Hiểu Linux gồm những phần nào (kernel, shell, ứng dụng), bản phân phối là gì, nên học bản nào, và dùng lệnh để biết máy mình đang chạy Linux gì.
minutes: 25
commands: [cat /etc/os-release, uname, echo $SHELL]
quiz:
  - q: Theo đúng nghĩa hẹp, "Linux" là tên của thành phần nào?
    options: ["Toàn bộ hệ điều hành Ubuntu", "Nhân (kernel) của hệ điều hành", "Trình gõ lệnh bash", "Giao diện đồ hoạ"]
    answer: 1
    explain: Linux là tên của kernel do Linus Torvalds viết năm 1991. Ubuntu, Debian, Rocky… là các bản phân phối, tức kernel Linux cộng thêm công cụ và phần mềm.
  - q: Shell làm nhiệm vụ gì?
    options: ["Quản lý bộ nhớ và CPU", "Nhận lệnh người dùng gõ, gọi chương trình tương ứng chạy", "Lưu file xuống ổ đĩa", "Kết nối mạng"]
    answer: 1
    explain: Shell (ví dụ `bash`) là chương trình đọc lệnh bạn gõ, hiểu nó rồi nhờ kernel chạy chương trình. Quản lý CPU, bộ nhớ, ổ đĩa, mạng là việc của kernel.
  - q: Ubuntu và Debian dùng công cụ quản lý gói nào?
    options: ["dnf / rpm", "apt / dpkg", "pacman", "zypper"]
    answer: 1
    explain: Họ Debian (Debian, Ubuntu, Linux Mint) dùng gói `.deb` với `apt` và `dpkg`. Họ Red Hat (RHEL, Rocky, AlmaLinux, Fedora) dùng `.rpm` với `dnf` và `rpm`.
  - q: Lệnh nào cho biết tên và phiên bản bản phân phối đang chạy?
    options: ["uname -r", "cat /etc/os-release", "echo $SHELL", "whoami"]
    answer: 1
    explain: "`/etc/os-release` ghi tên và phiên bản bản phân phối. `uname -r` chỉ cho biết phiên bản kernel."
  - q: Bản Ubuntu có chữ LTS (ví dụ 24.04 LTS) nghĩa là gì?
    options: ["Bản thử nghiệm", "Bản được hỗ trợ dài hạn, thường 5 năm cập nhật bảo mật", "Bản chỉ dành cho máy tính để bàn", "Bản có giao diện đồ hoạ"]
    answer: 1
    explain: LTS là Long Term Support. Ubuntu ra bản LTS mỗi 2 năm (tháng 4 năm chẵn), được cập nhật bảo mật miễn phí 5 năm. Server nên dùng bản LTS.
---

## Hệ điều hành làm gì

Máy tính có phần cứng: CPU, RAM, ổ đĩa, card mạng. Chương trình bạn viết (web, database…) không tự điều khiển phần cứng. Nó nhờ **hệ điều hành** làm việc đó: chia CPU cho các chương trình, cấp RAM, đọc ghi file, gửi nhận dữ liệu qua mạng.

Windows, macOS, Linux đều là hệ điều hành. Phần lớn máy chủ trên Internet (web, database, Docker, Kubernetes, cloud) chạy Linux. Vì vậy người làm backend và DevOps phải dùng thạo Linux.

## Các tầng của Linux

Một máy Linux chia thành các tầng, tầng trên nhờ tầng dưới:

| Tầng | Là gì | Ví dụ |
|---|---|---|
| Ứng dụng | Chương trình bạn chạy | `nginx`, `postgres`, `node`, `ls`, `cp` |
| Shell | Chương trình nhận lệnh bạn gõ, gọi ứng dụng chạy | `bash` (mặc định trên Ubuntu), `sh`, `zsh` |
| Kernel (nhân) | Lõi hệ điều hành, điều khiển phần cứng, quản lý tiến trình, bộ nhớ, file, mạng | Linux kernel |
| Phần cứng | Máy thật hoặc máy ảo | CPU, RAM, ổ đĩa, card mạng |

Khi bạn gõ `ls`:

1. Shell `bash` đọc chữ `ls`, tìm ra file chương trình `/usr/bin/ls`.
2. Shell nhờ kernel chạy chương trình đó.
3. `ls` nhờ kernel đọc danh sách file trên ổ đĩa rồi in ra màn hình.

> **Ghi nhớ:** Kernel chỉ có một và luôn chạy. Shell và ứng dụng là chương trình bình thường, có thể thay hoặc chạy nhiều bản cùng lúc.

## Linux, GNU và mã nguồn mở

- Năm 1991, Linus Torvalds viết kernel Linux và công bố mã nguồn.
- Các công cụ cơ bản như `ls`, `cp`, `bash`, `grep` phần lớn đến từ dự án **GNU**. Vì vậy có người gọi cả hệ điều hành là "GNU/Linux".
- Kernel Linux dùng giấy phép **GPL**: ai cũng được dùng, xem, sửa mã nguồn và phân phối lại, nhưng bản sửa phân phối ra ngoài cũng phải mở mã nguồn.
- Linux là hệ **kiểu Unix**: cách tổ chức file, phân quyền và lệnh giống Unix (hệ điều hành từ những năm 1970). Học Linux xong, bạn dùng được macOS terminal và các hệ Unix khác gần như ngay.

## Bản phân phối (distro)

Kernel một mình chưa dùng được. **Bản phân phối** gói kernel cùng shell, công cụ, trình quản lý gói và phần mềm thành hệ điều hành hoàn chỉnh. Các bản khác nhau chủ yếu ở cách cài phần mềm và chu kỳ cập nhật. Lệnh cơ bản thì giống nhau.

| Họ | Bản phân phối | Quản lý gói | Hay gặp ở đâu |
|---|---|---|---|
| Debian | Debian, **Ubuntu**, Linux Mint | `apt`, `dpkg` (gói `.deb`) | VPS, cloud, máy cá nhân. Ubuntu Server là bản phổ biến nhất trên cloud |
| Red Hat | RHEL, **Rocky Linux**, AlmaLinux, Fedora, CentOS Stream | `dnf`, `rpm` (gói `.rpm`) | Doanh nghiệp, ngân hàng, viễn thông |
| SUSE | openSUSE, SLES | `zypper`, `rpm` | Doanh nghiệp ở châu Âu |
| Alpine | Alpine Linux | `apk` | Image Docker (rất nhẹ, khoảng 8 MB) |
| Arch | Arch Linux, Manjaro | `pacman` | Máy cá nhân, người thích tự cấu hình |

**Nên học bản nào?** Học trên **Ubuntu Server LTS**. Đây là bản phổ biến nhất trên VPS và cloud, nhiều tài liệu nhất. Phần khác biệt của họ Red Hat (chủ yếu là cài gói) có bài riêng ở chặng 6.

**LTS là gì?** Ubuntu ra bản mới mỗi 6 tháng, tên theo năm.tháng (24.04 là tháng 4/2024). Bản ra tháng 4 năm chẵn là bản **LTS** (Long Term Support), được cập nhật bảo mật miễn phí 5 năm. Máy chủ luôn dùng bản LTS.

## Linux đang chạy ở đâu

- **Máy chủ và cloud:** AWS, Google Cloud, Azure, VPS Việt Nam… phần lớn máy ảo chạy Linux.
- **Container:** Docker và Kubernetes dựa trên tính năng của kernel Linux. Container chạy trên Windows/macOS thực chất chạy trong một máy ảo Linux.
- **Điện thoại:** Android dùng kernel Linux.
- **Siêu máy tính:** từ tháng 11/2017, toàn bộ 500 siêu máy tính trong danh sách TOP500 đều chạy Linux.
- **Thiết bị nhúng:** router, TV, camera, ô tô.

## Biết máy mình đang chạy gì

Mở terminal (chưa có chỗ thực hành thì làm [bài 2](/bai/moi-truong-thuc-hanh) trước) và gõ các lệnh sau.

### Xem bản phân phối: cat /etc/os-release

```bash
cat /etc/os-release
```

| Phần | Ý nghĩa |
|---|---|
| `cat` | In nội dung file ra màn hình |
| `/etc/os-release` | File chứa thông tin bản phân phối. Bản nào cũng có file này |

```text
PRETTY_NAME="Ubuntu 24.04.5 LTS"
NAME="Ubuntu"
VERSION_ID="24.04"
VERSION="24.04.5 LTS (Noble Numbat)"
VERSION_CODENAME=noble
ID=ubuntu
ID_LIKE=debian
...
```

| Dòng | Ý nghĩa |
|---|---|
| `PRETTY_NAME` | Tên đầy đủ để hiển thị |
| `VERSION_ID="24.04"` | Phiên bản: năm 2024, tháng 04 |
| `VERSION_CODENAME=noble` | Tên mã. Hay xuất hiện trong cấu hình kho phần mềm |
| `ID_LIKE=debian` | Ubuntu thuộc họ Debian, nên dùng `apt` |

### Xem kernel: uname

```bash
uname -r
uname -a
```

| Phần | Ý nghĩa |
|---|---|
| `uname` | In thông tin hệ thống (tên kernel, máy, phiên bản) |
| `-r` | Chỉ in phiên bản kernel (**r**elease) |
| `-a` | In tất cả (**a**ll) |

```text
7.0.0-34-generic
Linux lab 7.0.0-34-generic #34~24.04.1-Ubuntu SMP PREEMPT_DYNAMIC Fri Sep  4 15:38:29 UTC 2 x86_64 x86_64 x86_64 GNU/Linux
```

| Phần trong kết quả `-a` | Ý nghĩa |
|---|---|
| `Linux` | Tên kernel |
| `lab` | Tên máy (hostname) |
| `7.0.0-34-generic` | Phiên bản kernel |
| `x86_64` | Kiến trúc CPU: x86 64-bit. Máy Mac chip M hoặc Raspberry Pi sẽ hiện `aarch64` (ARM 64-bit) |
| `GNU/Linux` | Hệ điều hành |

> **Lưu ý khi dùng Docker:** container **dùng chung kernel với máy thật**. Vì vậy `uname -r` trong container Ubuntu in ra kernel của máy chủ Docker, không phải kernel của Ubuntu 24.04. Còn `/etc/os-release` thì đúng là Ubuntu. Đây là điểm khác lớn nhất giữa container và máy ảo.

### Xem shell đang dùng: echo $SHELL

```bash
echo $SHELL
```

| Phần | Ý nghĩa |
|---|---|
| `echo` | In chữ ra màn hình |
| `$SHELL` | Biến chứa đường dẫn shell đăng nhập của bạn. Dấu `$` nghĩa là "lấy giá trị của biến" |

```text
/bin/bash
```

## Thực hành

1. Mở terminal Linux (container, WSL hoặc máy ảo) và cho biết: tên bản phân phối, phiên bản, phiên bản kernel, kiến trúc CPU.

   <details>
   <summary>Xem cách làm</summary>

   ```bash
   cat /etc/os-release
   uname -r
   uname -m
   ```

   `uname -m` chỉ in kiến trúc máy (**m**achine), ví dụ `x86_64`.

   </details>

2. Nếu có Docker, chạy thử Alpine và so sánh với Ubuntu: hai bên khác nhau ở dòng nào, giống nhau ở dòng nào?

   ```bash
   docker run --rm alpine cat /etc/os-release
   docker run --rm alpine uname -r
   ```

   <details>
   <summary>Xem đáp án</summary>

   `/etc/os-release` khác hẳn (`ID=alpine`). Còn `uname -r` thì **giống** Ubuntu, vì mọi container trên cùng một máy dùng chung kernel của máy đó.

   </details>

3. Trả lời bằng lời: vì sao `ls`, `cp` gõ được trên cả Ubuntu lẫn Rocky Linux, còn lệnh cài phần mềm thì khác nhau?

   <details>
   <summary>Xem đáp án</summary>

   `ls`, `cp` là công cụ GNU, bản phân phối nào cũng có. Cách đóng gói và cài phần mềm là phần riêng của từng họ: Debian/Ubuntu dùng `apt` (.deb), Red Hat/Rocky dùng `dnf` (.rpm).

   </details>

## Tóm tắt

| Khái niệm | Một câu |
|---|---|
| Kernel | Lõi hệ điều hành, điều khiển phần cứng. "Linux" đúng nghĩa là kernel |
| Shell | Chương trình nhận lệnh bạn gõ. Ubuntu mặc định dùng `bash` |
| Bản phân phối | Kernel cộng công cụ và phần mềm, ví dụ Ubuntu, Debian, Rocky |
| LTS | Bản hỗ trợ dài hạn (Ubuntu: 5 năm), dùng cho server |
| `cat /etc/os-release` | Xem bản phân phối |
| `uname -r` | Xem phiên bản kernel |
