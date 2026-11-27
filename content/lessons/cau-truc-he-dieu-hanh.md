---
summary: Linux gồm ba phần là kernel, shell và ứng dụng. Bài này nói rõ mỗi phần làm gì, có những shell nào, dấu nhắc $ và # khác nhau ra sao, và vì sao mỗi bản Linux cài phần mềm một kiểu.
minutes: 25
commands: [echo $SHELL, cat /etc/shells, whoami, uname -r, cat /etc/os-release]
quiz:
  - q: Thành phần nào trực tiếp quản lý CPU, bộ nhớ, ổ đĩa và card mạng?
    options: ["Shell", "Ứng dụng", "Kernel (nhân)", "Trình duyệt"]
    answer: 2
    explain: Kernel là lõi hệ điều hành. Nó điều khiển phần cứng, quản lý file, tiến trình, mạng và quyền truy cập. Shell và ứng dụng đều phải nhờ kernel.
  - q: Shell là gì?
    options: ["Chương trình trung gian nhận lệnh người dùng gõ rồi nhờ kernel thực hiện", "Một loại phần cứng", "Tên khác của kernel", "Kho phần mềm của Ubuntu"]
    answer: 0
    explain: Shell (ví dụ `bash`) đọc lệnh bạn gõ, tìm chương trình tương ứng và nhờ kernel chạy nó.
  - q: Dấu nhắc kết thúc bằng `#` cho biết điều gì?
    options: ["Đang ở thư mục gốc", "Lệnh trước bị lỗi", "Đang dùng shell zsh", "Đang làm việc với quyền root"]
    answer: 3
    explain: "`$` là người dùng thường, `#` là root (toàn quyền). Thấy `#` thì gõ lệnh phải cẩn thận hơn."
  - q: Ubuntu dùng công cụ nào để cài phần mềm?
    options: ["yum", "apt", "pacman", "brew"]
    answer: 1
    explain: Ubuntu thuộc họ Debian, dùng `apt`. CentOS dùng `yum`; các bản Red Hat mới (Rocky, AlmaLinux, Fedora) dùng `dnf`.
  - q: Lệnh nào in ra đường dẫn shell đăng nhập của bạn?
    options: ["echo $SHELL", "echo SHELL", "uname -r", "cat /etc/os-release"]
    answer: 0
    explain: "`$SHELL` là biến chứa shell đăng nhập. Thiếu dấu `$` thì `echo` chỉ in chữ `SHELL`."
---

> Bài này đi theo video TITV bài 5. Xem video ở trên trước, rồi đọc và gõ lại các lệnh.

## Ba thành phần của Linux

Hệ điều hành Linux gồm ba phần xếp chồng lên nhau. Phần trên nhờ phần dưới làm việc:

| Thành phần | Là gì | Ví dụ |
|---|---|---|
| Ứng dụng (application) | Chương trình người dùng chạy | trình duyệt, soạn văn bản, `ls`, `cp` |
| Shell | Chương trình trung gian: nhận lệnh bạn gõ, nhờ kernel thực hiện | `bash`, `sh`, `zsh` |
| Kernel (nhân) | Lõi hệ điều hành, "trái tim" của Linux, điều khiển phần cứng | Linux kernel |
| Phần cứng | Máy thật hoặc máy ảo | CPU, RAM, ổ đĩa, card mạng |

Ví dụ khi bạn gõ `ls` để xem danh sách file:

1. Shell đọc chữ `ls`, tìm ra chương trình `/usr/bin/ls`.
2. Shell nhờ kernel chạy chương trình đó.
3. `ls` nhờ kernel đọc danh sách file trên ổ đĩa, rồi in ra màn hình.

## Kernel làm những gì

Kernel là phần duy nhất được làm việc trực tiếp với phần cứng. Nó lo năm việc chính:

| Việc | Nội dung |
|---|---|
| Quản lý phần cứng | Chia bộ nhớ, CPU cho các chương trình; điều khiển ổ đĩa, bàn phím, chuột, USB |
| Quản lý hệ thống file | Tạo, đọc, ghi, xoá file và thư mục trên ổ đĩa |
| Quản lý tiến trình | Chạy, tạm dừng, kết thúc các chương trình (tiến trình) |
| Quản lý mạng | Gửi nhận dữ liệu qua card mạng, xử lý địa chỉ IP |
| Bảo mật | Kiểm tra ai được đọc, sửa, chạy file nào |

Xem phiên bản kernel đang chạy:

```bash
uname -r
```

| Phần | Ý nghĩa |
|---|---|
| `uname` | In thông tin về hệ thống (**u**nix **name**) |
| `-r` | Chỉ in phiên bản kernel (**r**elease) |

```text
7.0.0-34-generic
```

Bài 25 sẽ học kỹ `uname` cùng các lệnh xem thông tin máy.

## Shell: người phiên dịch

Bạn không ra lệnh trực tiếp cho kernel được. Bạn gõ lệnh vào **shell**, shell hiểu lệnh rồi nhờ kernel làm. Một file chứa nhiều lệnh shell để chạy một lượt gọi là **shell script**, thường có đuôi `.sh`. Phần mở rộng của khoá có các bài lập trình Bash.

Có nhiều loại shell:

| Shell | Ghi chú |
|---|---|
| `bash` | Bourne Again Shell. Mặc định trên Ubuntu và hầu hết bản Linux, phổ biến nhất |
| `sh` | Bourne Shell, shell gốc của Unix. Trên Ubuntu, `sh` thực chất là `dash`, nhỏ và chạy nhanh |
| `zsh` | Nhiều tính năng gợi ý, mặc định trên macOS |
| `fish` | Thân thiện, tự gợi ý lệnh khi gõ |
| `ksh` | Korn Shell, hay gặp trên Unix thương mại |
| `csh` | C Shell, cú pháp giống ngôn ngữ C |

Xem shell bạn đang dùng:

```bash
echo $SHELL
```

| Phần | Ý nghĩa |
|---|---|
| `echo` | In chữ ra màn hình |
| `$SHELL` | Giá trị của biến `SHELL`, là đường dẫn shell đăng nhập của bạn. Dấu `$` nghĩa là "lấy giá trị của biến" |

```text
/bin/bash
```

Xem các shell đã cài trên máy:

```bash
cat /etc/shells
```

```text
# /etc/shells: valid login shells
/bin/sh
/usr/bin/sh
/bin/bash
/usr/bin/bash
/bin/rbash
/usr/bin/rbash
/usr/bin/dash
```

Ubuntu chỉ cài sẵn `sh`, `bash`, `rbash` (bash bị giới hạn) và `dash`. Muốn dùng `zsh` hay `fish` thì cài thêm, ví dụ `sudo apt install zsh`.

## Dấu nhắc: $ và #

Mở terminal, bạn thấy một dòng chờ lệnh gọi là **dấu nhắc** (prompt):

```text
hocvien@ubuntu:~$
```

| Phần | Ý nghĩa |
|---|---|
| `hocvien` | Tên người dùng đang đăng nhập |
| `@ubuntu` | Tên máy (hostname) |
| `:~` | Thư mục đang đứng. `~` là thư mục nhà của bạn (bài 6, 9 nói kỹ) |
| `$` | Bạn là **người dùng thường** |

Khi chuyển sang tài khoản **root** (quản trị, toàn quyền), ký tự cuối đổi thành `#`:

```text
root@ubuntu:~#
```

Thấy `#` thì phải cẩn thận: root xoá được mọi thứ, kể cả file hệ thống. Bài 8 học cách dùng quyền root an toàn bằng `sudo`.

Kiểm tra mình đang là ai:

```bash
whoami
```

```text
hocvien
```

## Ứng dụng và kho phần mềm

Ứng dụng là các chương trình bạn dùng hằng ngày: soạn văn bản, bảng tính, trình duyệt, email, nghe nhạc, và cả các lệnh như `ls`, `cp`.

Mỗi bản Linux (bản phân phối) có **kho phần mềm** riêng và công cụ cài đặt riêng:

| Bản Linux | Công cụ cài phần mềm | Ví dụ |
|---|---|---|
| Ubuntu, Debian | `apt` | `sudo apt install tree` |
| CentOS (cũ) | `yum` | `sudo yum install tree` |
| Rocky, AlmaLinux, Fedora | `dnf` (bản mới của `yum`) | `sudo dnf install tree` |

Khoá này dùng **Ubuntu**. Các lệnh làm việc với file, người dùng, quyền thì bản nào cũng giống nhau; chủ yếu khác ở cách cài phần mềm.

## Mở rộng (chuẩn LPIC-1)

Phần này không có trong video nhưng nằm trong chuẩn Linux Essentials 1.1, nên biết.

### Linux đúng nghĩa là kernel

- Năm 1991, Linus Torvalds viết kernel Linux và công bố mã nguồn.
- Các công cụ cơ bản như `bash`, `ls`, `cp`, `grep` phần lớn đến từ dự án **GNU**, nên có người gọi cả hệ điều hành là "GNU/Linux".
- Kernel Linux dùng giấy phép **GPL**: ai cũng được dùng, xem, sửa và phân phối lại, nhưng bản sửa đem phân phối cũng phải mở mã nguồn.
- **Bản phân phối** (distro) = kernel Linux + shell + công cụ + trình cài phần mềm, đóng gói thành hệ điều hành hoàn chỉnh.

| Họ | Bản phân phối | Gói phần mềm |
|---|---|---|
| Debian | Debian, Ubuntu, Linux Mint | `.deb`, dùng `apt`, `dpkg` |
| Red Hat | RHEL, Rocky Linux, AlmaLinux, Fedora, CentOS Stream | `.rpm`, dùng `dnf`, `rpm` |
| SUSE | openSUSE, SLES | `.rpm`, dùng `zypper` |

Ubuntu ra bản mới mỗi 6 tháng, tên theo năm.tháng (24.04 là tháng 4 năm 2024). Bản ra tháng 4 năm chẵn là **LTS** (Long Term Support), được cập nhật bảo mật 5 năm, nên máy chủ luôn dùng bản LTS.

Linux có mặt ở máy chủ và cloud, điện thoại Android (dùng kernel Linux), router, TV, và toàn bộ 500 siêu máy tính trong danh sách TOP500.

### Xem máy đang chạy bản Linux nào

```bash
cat /etc/os-release
```

| Phần | Ý nghĩa |
|---|---|
| `cat` | In nội dung file ra màn hình (bài 12) |
| `/etc/os-release` | File ghi tên và phiên bản bản phân phối. Bản Linux nào cũng có |

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

(Dấu `...` là phần còn lại của file: các đường link trang chủ, hỗ trợ.) `ID_LIKE=debian` cho biết Ubuntu thuộc họ Debian, nên dùng `apt`.

## Thực hành

1. Mở terminal, cho biết: bạn đang đăng nhập bằng tài khoản nào, shell là gì, máy chạy Ubuntu bản nào, kernel phiên bản nào.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   whoami
   echo $SHELL
   cat /etc/os-release
   uname -r
   ```

   </details>

2. Nhìn dấu nhắc `root@may-chu:/etc#`, cho biết: tên người dùng, tên máy, thư mục đang đứng, quyền của người dùng.

   <details>
   <summary>Xem đáp án</summary>

   Người dùng `root`, máy tên `may-chu`, đang ở thư mục `/etc`, dấu `#` nghĩa là đang có toàn quyền (root).

   </details>

3. Trả lời bằng lời: vì sao lệnh `ls`, `cp` gõ được trên cả Ubuntu lẫn Rocky Linux, còn lệnh cài phần mềm thì khác nhau?

   <details>
   <summary>Xem đáp án</summary>

   `ls`, `cp` là công cụ chung (dự án GNU), bản nào cũng có. Còn cách đóng gói và cài phần mềm là phần riêng của từng họ: Ubuntu dùng `apt` (gói `.deb`), Rocky dùng `dnf` (gói `.rpm`).

   </details>

## Tóm tắt

| Ý | Ghi nhớ |
|---|---|
| Kernel | Lõi hệ điều hành, điều khiển phần cứng, file, tiến trình, mạng, bảo mật |
| Shell | Nhận lệnh bạn gõ, nhờ kernel làm. Ubuntu mặc định dùng `bash` |
| Ứng dụng | Chương trình người dùng chạy. Cài bằng `apt` (Ubuntu) hoặc `yum`/`dnf` (họ Red Hat) |
| `$` và `#` | `$` người dùng thường, `#` root |
| `echo $SHELL` | Xem shell đăng nhập |
| `uname -r` | Xem phiên bản kernel |
| `cat /etc/os-release` | Xem bản Linux đang chạy |
