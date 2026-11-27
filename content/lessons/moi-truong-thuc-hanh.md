---
summary: Chọn chỗ để gõ lệnh mà không sợ hỏng máy. Phần lớn bài dùng container Ubuntu dựng bằng Docker; các bài về khởi động, ổ đĩa, mạng cần máy ảo hoặc VPS.
minutes: 30
commands: [docker run, docker start, docker rm, wsl --install, multipass launch]
quiz:
  - q: Vì sao bài về systemd và ổ đĩa không làm được trọn vẹn trong container Docker?
    options: ["Container không có terminal", "Container dùng chung kernel với máy thật, không tự khởi động hệ thống và không có ổ đĩa riêng", "Container không cài được phần mềm", "Container chỉ chạy được Alpine"]
    answer: 1
    explain: Container chỉ là một nhóm tiến trình được cách ly, chạy trên kernel của máy thật. Nó không trải qua quá trình khởi động, thường không chạy systemd và không có ổ đĩa riêng để chia phân vùng.
  - q: "Trong lệnh `docker run -it --name lab linux-lab`, `-it` để làm gì?"
    options: ["Chạy nền", "Mở terminal tương tác để gõ lệnh vào container", "Xoá container khi thoát", "Đặt tên container"]
    answer: 1
    explain: "`-i` giữ đầu vào mở, `-t` cấp một terminal giả. Ghép lại thành `-it` để bạn gõ lệnh trực tiếp. Đặt tên là `--name`, xoá khi thoát là `--rm`."
  - q: Bạn gõ `exit` để thoát container `lab`. Muốn vào lại đúng container đó (còn nguyên file đã tạo) thì gõ gì?
    options: ["docker run -it --name lab linux-lab", "docker start -ai lab", "docker build lab", "docker rm lab"]
    answer: 1
    explain: "`docker start -ai lab` khởi động lại container cũ và gắn terminal vào. Gõ lại `docker run --name lab` sẽ báo lỗi trùng tên, vì container cũ vẫn còn."
  - q: Trên Windows, cách nào cho bạn một Ubuntu thật nhanh nhất mà không cần cài máy ảo riêng?
    options: ["WSL (wsl --install)", "Cài lại Windows", "Dùng PowerShell", "Dùng Command Prompt"]
    answer: 0
    explain: WSL 2 chạy kernel Linux thật trong một máy ảo nhẹ do Windows quản lý. Lệnh `wsl --install` cài sẵn Ubuntu.
---

## Chọn chỗ thực hành

Học Linux phải gõ lệnh thật. Đừng học trên máy đang chứa dữ liệu quan trọng: một lệnh `rm` gõ nhầm có thể xoá mất file. Có 4 cách, xếp từ nhẹ đến thật:

| Cách | Ưu | Nhược | Dùng cho |
|---|---|---|---|
| **Container Docker** | Bật trong 1 giây, hỏng thì xoá đi tạo lại, không ảnh hưởng máy thật | Dùng chung kernel với máy thật, không có systemd, không có ổ đĩa riêng | Phần lớn các bài (bài nào cũng ghi rõ) |
| **WSL 2** (Windows) | Ubuntu thật ngay trên Windows, có systemd | Chỉ có trên Windows, mạng và ổ đĩa do Windows quản lý | Người dùng Windows |
| **Máy ảo** (Multipass, VirtualBox) | Một máy Linux đầy đủ: tự khởi động, có ổ đĩa, có mạng | Tốn RAM (1–2 GB), cài lâu hơn | Bài ghi "Cần máy ảo / VPS" |
| **VPS / cloud** | Máy chủ thật trên Internet, giống hệt môi trường đi làm | Tốn tiền (vài USD/tháng), lỡ mở cổng sai là bị dò quét | Dự án cuối, khi đã quen |

Lời khuyên: cài **Docker** để làm hầu hết các bài. Đến các bài ghi "Cần máy ảo / VPS" thì dùng **Multipass** hoặc WSL. Nếu không cài được gì, [Killercoda](https://killercoda.com/playgrounds) cho mượn miễn phí một máy Ubuntu chạy ngay trên trình duyệt (khoảng 1 giờ mỗi lần).

## Cách 1: Container Docker (dùng cho phần lớn bài)

Chưa có Docker: cài **Docker Desktop** (Windows, macOS) hoặc **Docker Engine** (Linux) theo hướng dẫn ở [docs.docker.com/get-docker](https://docs.docker.com/get-docker/).

### Dựng image thực hành

Image `ubuntu:24.04` gốc bị lược bớt để nhẹ: không có `man`, `vim`, `sudo`, `ping`… Web này soạn sẵn một [Dockerfile](/lab/Dockerfile) cài đủ công cụ dùng trong các bài, kèm user thường `hocvien` (mật khẩu `hocvien`) có quyền `sudo`.

```bash
mkdir linux-lab && cd linux-lab
curl -fsSLO https://linux-fe.vercel.app/lab/Dockerfile
docker build -t linux-lab .
```

| Phần | Ý nghĩa |
|---|---|
| `mkdir linux-lab && cd linux-lab` | Tạo thư mục rồi đi vào đó. `&&` nghĩa là lệnh trước chạy thành công thì mới chạy lệnh sau |
| `curl -fsSLO <url>` | Tải file về, giữ nguyên tên `Dockerfile`. `-f` báo lỗi nếu server trả lỗi, `-s` không in thanh tiến trình, `-S` vẫn in lỗi, `-L` đi theo chuyển hướng, `-O` lưu với tên file gốc |
| `docker build` | Dựng image từ Dockerfile |
| `-t linux-lab` | Đặt tên (**t**ag) cho image là `linux-lab` |
| `.` | Lấy Dockerfile ở thư mục hiện tại |

Lần đầu mất vài phút để tải và cài gói. Các lần sau dùng lại image đã dựng.

### Chạy và vào container

```bash
docker run -it --name lab --hostname lab linux-lab
```

| Phần | Ý nghĩa |
|---|---|
| `docker run` | Tạo container mới từ image rồi chạy |
| `-i` | Giữ đầu vào mở để bạn gõ được (**i**nteractive) |
| `-t` | Cấp một terminal giả (**t**ty), có dấu nhắc và màu |
| `--name lab` | Đặt tên container là `lab`, để các lệnh sau gọi theo tên |
| `--hostname lab` | Đặt tên máy bên trong container là `lab` (hiện trên dấu nhắc) |
| `linux-lab` | Tên image vừa dựng |

Vào được container, bạn thấy dấu nhắc:

```text
To run a command as administrator (user "root"), use "sudo <command>".
See "man sudo_root" for details.

hocvien@lab:~$
```

Dấu nhắc sẽ được giải thích ở [bài 3](/bai/terminal-va-cu-phap). Giờ gõ thử:

```bash
whoami
cat /etc/os-release
```

### Thoát, vào lại, xoá

```bash
# Thoát container (container dừng nhưng vẫn còn, file trong đó vẫn giữ)
exit
# Vào lại đúng container cũ
docker start -ai lab
# Xem các container đang có, kể cả đã dừng
docker ps -a
# Xoá hẳn container (mất hết file bên trong) để làm lại từ đầu
docker rm lab
```

| Lệnh | Ý nghĩa |
|---|---|
| `exit` | Thoát shell. Shell là tiến trình chính của container, nên container dừng theo |
| `docker start -ai lab` | Khởi động lại container `lab`. `-a` gắn (**a**ttach) màn hình vào, `-i` cho phép gõ |
| `docker ps -a` | Liệt kê container. Không có `-a` thì chỉ hiện container đang chạy |
| `docker rm lab` | Xoá container `lab`. Image `linux-lab` vẫn còn, `docker run` lại là có máy mới tinh |

> **Mẹo:** Muốn một container dùng xong là tự xoá, thêm `--rm`: `docker run -it --rm linux-lab`. Hợp khi thử nhanh một lệnh.

### Không muốn dựng image?

Dùng thẳng image gốc cũng được. Bạn sẽ đăng nhập bằng `root` (dấu nhắc kết thúc bằng `#`) và phải tự cài công cụ khi cần:

```bash
docker run -it --name lab2 ubuntu:24.04
apt update && apt install -y vim less iputils-ping
```

## Cách 2: WSL trên Windows

Mở **PowerShell bằng quyền Administrator** và gõ:

```bash
wsl --install -d Ubuntu-24.04
```

| Phần | Ý nghĩa |
|---|---|
| `wsl --install` | Bật WSL và cài bản Linux |
| `-d Ubuntu-24.04` | Chọn bản phân phối (**d**istribution) Ubuntu 24.04 |

Khởi động lại máy nếu được yêu cầu, rồi mở **Ubuntu** từ menu Start. Lần đầu nó hỏi tên user và mật khẩu cho Linux (không cần trùng với tài khoản Windows). Xem các bản đã cài bằng `wsl -l -v`.

## Cách 3: Máy ảo bằng Multipass

[Multipass](https://canonical.com/multipass) của Canonical tạo máy ảo Ubuntu bằng một lệnh, chạy được trên Linux, Windows và macOS.

```bash
multipass launch 24.04 --name lab --cpus 2 --memory 2G --disk 10G
multipass shell lab
```

| Phần | Ý nghĩa |
|---|---|
| `multipass launch 24.04` | Tạo và bật máy ảo Ubuntu 24.04 |
| `--name lab` | Đặt tên máy ảo |
| `--cpus 2 --memory 2G --disk 10G` | Cấp 2 CPU, 2 GB RAM, ổ 10 GB |
| `multipass shell lab` | Mở terminal vào máy ảo, đăng nhập user `ubuntu` (có sudo, không cần mật khẩu) |

Dọn dẹp: `multipass stop lab` để tắt máy, `multipass delete lab` rồi `multipass purge` để xoá hẳn.

VirtualBox hoặc VMware cũng được (video TITV bài 3 hướng dẫn cài Ubuntu trên máy ảo), nhưng phải tự tải file ISO và bấm qua trình cài đặt.

## Cách 4: VPS

Thuê một máy chủ Ubuntu 24.04 LTS (DigitalOcean, Vultr, AWS Lightsail, hoặc nhà cung cấp trong nước). Nhà cung cấp cho bạn địa chỉ IP và mật khẩu hoặc SSH key, rồi bạn đăng nhập từ máy mình:

```bash
ssh root@203.0.113.10
```

| Phần | Ý nghĩa |
|---|---|
| `ssh` | Đăng nhập máy khác qua mạng, có mã hoá |
| `root` | Tên user trên máy chủ (có nơi cấp sẵn user `ubuntu`) |
| `@203.0.113.10` | Địa chỉ IP máy chủ (đây là địa chỉ ví dụ) |

VPS nằm trên Internet nên bị dò quét liên tục. Hãy để đến lúc học xong chặng Bảo mật hãy dùng, hoặc ít nhất đặt mật khẩu mạnh.

## Thực hành

1. Dựng image `linux-lab`, chạy container `lab`, gõ `whoami` và `cat /etc/os-release`.

   <details>
   <summary>Xem kết quả đúng</summary>

   `whoami` in ra `hocvien`. `/etc/os-release` có dòng `PRETTY_NAME="Ubuntu 24.04.5 LTS"` (số bản vá cuối có thể khác).

   </details>

2. Trong container, tạo một file bằng `touch ~/thu.txt`, gõ `exit`, rồi vào lại container. File còn không? Sau đó xoá container, tạo lại bằng `docker run`. File còn không?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   touch ~/thu.txt
   exit
   docker start -ai lab
   ls ~
   exit
   docker rm lab
   docker run -it --name lab --hostname lab linux-lab
   ls ~
   ```

   Sau `exit` rồi `docker start -ai lab`, file **vẫn còn**, vì vẫn là container cũ. Sau `docker rm` rồi `docker run`, file **mất**: container mới được tạo lại từ image, sạch như lúc đầu.

   </details>

3. (Nếu dùng Windows) Cài WSL Ubuntu và so sánh `uname -r` trong WSL với `uname -r` trong container Docker.

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Dựng image thực hành | `docker build -t linux-lab .` |
| Tạo và vào container | `docker run -it --name lab --hostname lab linux-lab` |
| Thoát | `exit` |
| Vào lại container cũ | `docker start -ai lab` |
| Xoá để làm lại | `docker rm lab` |
| Cài Ubuntu trên Windows | `wsl --install -d Ubuntu-24.04` |
| Tạo máy ảo | `multipass launch 24.04 --name lab` rồi `multipass shell lab` |
