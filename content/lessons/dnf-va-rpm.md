---
summary: Quản lý phần mềm trên họ Red Hat (RHEL, Rocky Linux, AlmaLinux, Fedora) bằng dnf và rpm — bản đối chiếu với apt/dpkg. Học xong là dùng được cả hai họ, vì doanh nghiệp, ngân hàng ở Việt Nam dùng nhiều RHEL và Rocky.
minutes: 30
commands: [dnf install, dnf remove, dnf update, dnf check-update, dnf search, dnf info, dnf provides, dnf repolist, dnf history, rpm -qa, rpm -qi, rpm -ql, rpm -qf, rpm -ivh, rpm -e]
quiz:
  - q: Trên Rocky Linux, lệnh tương đương apt install là gì?
    options: ["rpm install", "dnf install", "yum get", "apt-rpm install"]
    answer: 1
    explain: "`dnf install tên` tải gói từ kho và tự lo phụ thuộc. Trên RHEL/Rocky 8 trở lên, `yum` vẫn gõ được nhưng chỉ là đường tắt tới `dnf`."
  - q: "File /usr/bin/ls thuộc gói nào? Lệnh rpm nào trả lời được?"
    options: ["rpm -ql ls", "rpm -qf /usr/bin/ls", "rpm -qi /usr/bin/ls", "rpm -e ls"]
    answer: 1
    explain: "`rpm -qf` (query file) tương đương `dpkg -S`. Trên Rocky 9 bản tối giản, kết quả là `coreutils-single-...`."
  - q: Muốn biết gói nào cung cấp lệnh dig (chưa cài), dùng lệnh nào?
    options: ["rpm -qf /usr/bin/dig", "dnf provides /usr/bin/dig", "which dig", "dnf info dig"]
    answer: 1
    explain: "`rpm -qf` chỉ hỏi được file đã có trên máy. `dnf provides` tìm trong kho, kể cả gói chưa cài. Kết quả: `bind-utils`."
  - q: "`rpm -e tree` làm gì?"
    options: ["Cài tree", "Gỡ (erase) gói tree", "Xem thông tin tree", "Cập nhật tree"]
    answer: 1
    explain: "`-e` là erase (gỡ). `-i` là cài, `-U` là nâng cấp, `-q` là truy vấn."
  - q: Lệnh nào xem lại lịch sử các lần cài/gỡ và có thể hoàn tác?
    options: ["dnf log", "dnf history (và dnf history undo ID)", "rpm -qa --last", "journalctl -u dnf"]
    answer: 1
    explain: "`dnf history` liệt kê từng giao dịch kèm ID. `dnf history undo ID` đảo ngược giao dịch đó, rất hữu ích khi một lần cập nhật gây lỗi."
---

## Bảng đối chiếu nhanh

Nếu đã học [apt và dpkg](/bai/apt-va-dpkg), phần lớn bài này chỉ là "đổi tên lệnh":

| Việc | Ubuntu / Debian | RHEL / Rocky / Fedora |
|---|---|---|
| Làm mới danh sách | `apt update` | (tự động, hoặc `dnf makecache`) |
| Xem có bản cập nhật | `apt list --upgradable` | `dnf check-update` |
| Nâng cấp tất cả | `apt upgrade` | `dnf upgrade` (hoặc `dnf update`) |
| Cài | `apt install tên` | `dnf install tên` |
| Gỡ | `apt remove tên` | `dnf remove tên` |
| Dọn phụ thuộc thừa | `apt autoremove` | `dnf autoremove` |
| Tìm gói | `apt search từ` | `dnf search từ` |
| Thông tin gói | `apt show tên` | `dnf info tên` |
| Gói nào cung cấp file (cả gói chưa cài) | (`apt-file search`) | `dnf provides đường-dẫn` |
| Danh sách kho | `/etc/apt/sources.list.d/` | `/etc/yum.repos.d/`, `dnf repolist` |
| Gói đã cài | `dpkg -l` | `rpm -qa` |
| File của gói | `dpkg -L tên` | `rpm -ql tên` |
| File thuộc gói nào | `dpkg -S file` | `rpm -qf file` |
| Cài file gói tải về | `apt install ./x.deb` | `dnf install ./x.rpm` |
| Nhóm sudo | `sudo` | `wheel` |

Kết quả trong bài lấy từ Rocky Linux 9 bản tối giản, chạy bằng root. Nếu bạn là người dùng thường thì thêm `sudo` trước các lệnh cài, gỡ, như với `apt`.

## dnf: công cụ cấp cao

`dnf` thay cho `yum` từ RHEL 8. Gõ `yum` vẫn chạy được (`/usr/bin/yum -> dnf-3`).

```bash
dnf search tree
dnf info tree
dnf install -y tree
```

```text
tree.x86_64 : File system tree viewer
Name         : tree
Version      : 1.8.0
Release      : 10.el9
Size         : 55 k
Repository   : baseos
Summary      : File system tree viewer
...
Complete!
```

| Phần | Ý nghĩa |
|---|---|
| `dnf search tree` | Tìm gói theo tên và mô tả |
| `dnf info tree` | Thông tin gói. `10.el9` trong `Release` nghĩa là bản dựng thứ 10 cho **E**nterprise **L**inux 9 |
| `dnf install -y tree` | Cài, `-y` tự đồng ý |

### Cập nhật

```bash
dnf check-update
dnf upgrade -y
```

```text
curl-minimal.x86_64                 7.76.1-44.el9_9.1                     baseos
expat.x86_64                        2.5.0-9.el9_9.8                       baseos
```

`dnf check-update` trả mã thoát **100** khi có bản cập nhật, **0** khi không có. Tiện dùng trong script giám sát. Chỉ cập nhật bản vá bảo mật: `dnf upgrade --security`.

### Gói nào cung cấp lệnh này?

```bash
dnf provides /usr/bin/dig
```

```text
bind-utils-32:9.16.50-12.el9_9.1.x86_64 : Utilities for querying DNS name servers
Repo        : appstream
```

Rất hữu ích khi tài liệu bảo "chạy `dig`" mà máy báo `command not found`: tên gói (`bind-utils`) thường khác tên lệnh.

### Kho phần mềm

```bash
dnf repolist
```

```text
repo id                         repo name
appstream                       Rocky Linux 9 - AppStream
baseos                          Rocky Linux 9 - BaseOS
extras                          Rocky Linux 9 - Extras
```

| Kho | Chứa |
|---|---|
| `baseos` | Phần lõi của hệ điều hành |
| `appstream` | Ứng dụng, ngôn ngữ lập trình, database |
| `extras` | Gói bổ sung |
| **EPEL** (thêm bằng `dnf install epel-release`) | Kho cộng đồng của Fedora, rất nhiều phần mềm không có trong kho chính (`htop`, `certbot`…) |

Cấu hình mỗi kho là một file `.repo` trong `/etc/yum.repos.d/`.

### Lịch sử và hoàn tác

```bash
dnf history
```

```text
ID     | Command line             | Date and time    | Action(s)      | Altered
-------------------------------------------------------------------------------
     3 | remove -y tree           | 2026-11-27 08:32 | Removed        |    1
     2 | install -y tree          | 2026-11-27 08:32 | Install        |    1  <
```

| Lệnh | Làm gì |
|---|---|
| `dnf history` | Các lần cài, gỡ, cập nhật |
| `dnf history info 2` | Chi tiết giao dịch số 2 |
| `dnf history undo 2` | Đảo ngược giao dịch số 2 |

### Nhóm gói

```bash
dnf group list
```

```text
Available Environment Groups:
   Server with GUI
   Server
   Minimal Install
   Workstation
```

`dnf group install "Development Tools"` cài cả bộ công cụ biên dịch (gcc, make…) trong một lệnh.

## rpm: công cụ cấp thấp

`rpm` làm việc với từng gói và cơ sở dữ liệu gói, **không** tải từ kho, **không** tự lo phụ thuộc. Phần lớn tuỳ chọn truy vấn bắt đầu bằng `-q` (**q**uery):

```bash
rpm -qa | grep -E '^tree|^bash-[0-9]'
rpm -qi tree
rpm -ql tree | head -3
rpm -qf /usr/bin/ls
```

```text
bash-5.1.8-9.el9.x86_64
tree-1.8.0-10.el9.x86_64
Name        : tree
Version     : 1.8.0
Install Date: Fri Nov 27 08:32:05 2026
Summary     : File system tree viewer
/usr/bin/tree
/usr/lib/.build-id
/usr/lib/.build-id/d0
coreutils-single-8.32-43.el9.x86_64
```

| Lệnh | Làm gì |
|---|---|
| `rpm -qa` | Mọi gói đã cài (**a**ll) |
| `rpm -qi tên` | Thông tin gói đã cài (**i**nfo) |
| `rpm -ql tên` | Các file của gói (**l**ist) |
| `rpm -qf file` | File thuộc gói nào (**f**ile) |
| `rpm -qc tên` | Chỉ các file cấu hình của gói (**c**onfig) |
| `rpm -qpi file.rpm`, `rpm -qpl file.rpm` | Thông tin / danh sách file của một file `.rpm` **chưa cài** (**p**ackage file) |
| `rpm -ivh file.rpm` | Cài (**i**nstall), in chi tiết (**v**erbose) và thanh tiến trình (**h**ash) |
| `rpm -Uvh file.rpm` | Nâng cấp, chưa có thì cài (**U**pgrade) |
| `rpm -e tên` | Gỡ (**e**rase) |
| `rpm -V tên` | Kiểm tra file của gói có bị sửa không (**V**erify) |

Đọc tên gói `tree-1.8.0-10.el9.x86_64`:

| Phần | Ý nghĩa |
|---|---|
| `tree` | Tên |
| `1.8.0` | Phiên bản phần mềm |
| `10.el9` | Bản dựng của gói, cho Enterprise Linux 9 |
| `x86_64` | Kiến trúc CPU (`noarch` là dùng được cho mọi kiến trúc) |

Cài file `.rpm` tải về: dùng `dnf install ./file.rpm` để được tự lo phụ thuộc, giống `apt install ./file.deb`.

## Thực hành

Làm trên máy Rocky Linux, AlmaLinux hoặc Fedora (thêm `sudo` nếu không phải root).

1. Kiểm tra đây là Rocky phiên bản mấy, có bao nhiêu gói đã cài, đang dùng những kho nào.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   cat /etc/os-release
   rpm -qa | wc -l
   dnf repolist
   ```

   </details>

2. Lệnh `dig` và `ip` thuộc gói nào (bản tối giản chưa có cả hai)? Cài gói chứa `dig`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   dnf provides /usr/bin/dig
   dnf provides /usr/sbin/ip
   dnf install -y bind-utils
   dig -v
   ```

   `dig` thuộc `bind-utils`, `ip` thuộc `iproute`. Bản tối giản rất gọn nên chưa có cả hai. `rpm -qf` chỉ hỏi được file đã có trên máy, vì vậy ở đây phải dùng `dnf provides`.

   </details>

3. Cài `tree`, xem các file nó cài, gỡ nó, rồi hoàn tác việc gỡ bằng `dnf history`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   dnf install -y tree
   rpm -ql tree
   dnf remove -y tree
   dnf history
   dnf history undo last -y
   rpm -q tree
   ```

   `undo last` đảo ngược giao dịch gần nhất (lần gỡ), nên `tree` được cài lại.

   </details>

4. Viết lại bằng lệnh của họ Red Hat: `sudo apt update && sudo apt install -y nginx && dpkg -L nginx | head`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo dnf install -y nginx && rpm -ql nginx | head
   ```

   `dnf` tự làm mới danh sách khi cần, không có bước `update` riêng như `apt`.

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Cài / gỡ / nâng cấp | `dnf install` / `dnf remove` / `dnf upgrade` |
| Có bản cập nhật không | `dnf check-update` |
| Tìm / thông tin | `dnf search` / `dnf info` |
| Gói nào có file này (kể cả chưa cài) | `dnf provides đường-dẫn` |
| Lịch sử, hoàn tác | `dnf history`, `dnf history undo ID` |
| Gói đã cài / thông tin / file của gói | `rpm -qa` / `rpm -qi` / `rpm -ql` |
| File thuộc gói nào | `rpm -qf file` |
| Kho | `dnf repolist`, `/etc/yum.repos.d/` |
