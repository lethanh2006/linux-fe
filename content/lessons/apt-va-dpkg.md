---
summary: Cài, gỡ, cập nhật phần mềm trên Ubuntu và Debian bằng apt (tự tải từ kho, tự giải quyết phụ thuộc) và dpkg (làm việc với từng file .deb). Biết kho phần mềm là gì, tra gói nào chứa file nào, khác nhau giữa remove và purge, giữ phiên bản không cho nâng cấp.
minutes: 45
commands: [apt update, apt upgrade, apt install, apt remove, apt purge, apt autoremove, apt search, apt show, apt list, apt-mark, dpkg -i, dpkg -l, dpkg -L, dpkg -S]
quiz:
  - q: Khác nhau giữa apt update và apt upgrade?
    options: ["Giống nhau", "update tải danh sách gói mới nhất từ kho; upgrade mới thật sự nâng cấp các gói đã cài", "update nâng cấp, upgrade tải danh sách", "update chỉ dành cho kernel"]
    answer: 1
    explain: "`apt update` chỉ làm mới danh sách (máy biết có phiên bản mới). `apt upgrade` cài các phiên bản mới đó. Thường chạy liền: `sudo apt update && sudo apt upgrade`."
  - q: "Sau `apt remove nginx-common`, `dpkg -l` vẫn hiện dòng bắt đầu bằng `rc`. Nghĩa là gì?"
    options: ["Gói đang chạy", "Gói đã gỡ nhưng file cấu hình vẫn còn", "Gói bị lỗi", "Gói đang chờ cài"]
    answer: 1
    explain: "`remove` giữ lại file cấu hình (trong /etc) phòng khi cài lại. `r` = removed, `c` = config còn. Muốn xoá sạch cả cấu hình thì dùng `apt purge`."
  - q: Muốn biết file /usr/bin/curl thuộc gói nào, dùng lệnh nào?
    options: ["dpkg -L curl", "dpkg -S /usr/bin/curl", "apt show /usr/bin/curl", "which curl"]
    answer: 1
    explain: "`dpkg -S đường-dẫn` (search) tìm gói chứa file. Ngược lại, `dpkg -L tên-gói` liệt kê các file mà gói đã cài."
  - q: Cài một file .deb tải về mà vẫn tự lo phụ thuộc, cách nào tốt nhất?
    options: ["dpkg -i file.deb", "sudo apt install ./file.deb", "tar -xf file.deb", "sudo apt get file.deb"]
    answer: 1
    explain: "`dpkg -i` cài được nhưng không tự tải phụ thuộc còn thiếu. `apt install ./file.deb` (phải có `./` hoặc đường dẫn) vừa cài file vừa tải phụ thuộc từ kho."
  - q: "`apt autoremove` làm gì?"
    options: ["Gỡ mọi gói", "Gỡ các gói phụ thuộc được cài kèm trước đây nhưng giờ không còn gói nào cần", "Tự động cập nhật", "Xoá cache"]
    answer: 1
    explain: "Khi gỡ một phần mềm, các thư viện cài kèm nó vẫn nằm lại. `autoremove` dọn những gói 'mồ côi' đó. Xoá file .deb đã tải trong cache là `apt clean`."
---

## Gói, kho và trình quản lý gói

Trên Linux, phần mềm thường không tải file cài đặt từ trang web như trên Windows. Bản phân phối đóng phần mềm thành **gói** (package) và để trong **kho** (repository) trên mạng. **Trình quản lý gói** tải gói từ kho, kiểm tra chữ ký, cài vào đúng chỗ, và tự cài các gói khác mà nó cần (**phụ thuộc**, dependency).

| | Họ Debian / Ubuntu | Họ Red Hat / Rocky ([bài sau](/bai/dnf-va-rpm)) |
|---|---|---|
| Định dạng gói | `.deb` | `.rpm` |
| Công cụ cấp thấp (một file, không tự lo phụ thuộc) | `dpkg` | `rpm` |
| Công cụ cấp cao (kho, phụ thuộc, nâng cấp) | `apt` (và `apt-get`, `apt-cache` kiểu cũ) | `dnf` (trước đây là `yum`) |

`apt` là lệnh mới, có thanh tiến trình, dễ đọc. `apt-get` và `apt-cache` là các lệnh cũ, kết quả ổn định hơn nên vẫn dùng trong script (`apt` tự cảnh báo `apt does not have a stable CLI interface` khi bị dùng trong đường ống). Hai bên dùng chung kho và cơ sở dữ liệu.

Các lệnh thay đổi hệ thống cần `sudo`.

## Cập nhật danh sách và nâng cấp

```bash
sudo apt update
sudo apt upgrade
```

| Lệnh | Làm gì |
|---|---|
| `apt update` | Tải **danh sách** gói mới nhất từ mọi kho. Không cài gì cả |
| `apt upgrade` | Nâng cấp các gói đã cài lên phiên bản mới (không gỡ gói nào) |
| `apt full-upgrade` | Như `upgrade`, nhưng được phép gỡ hoặc thêm gói khi cần (khi nâng cấp lớn) |
| `apt list --upgradable` | Xem những gói có bản mới |
| `-y` | Tự trả lời "có", không hỏi lại. Dùng trong script |

```text
Get:18 http://archive.ubuntu.com/ubuntu noble-backports/multiverse amd64 Packages [669 B]
Get:19 http://archive.ubuntu.com/ubuntu noble-backports/universe amd64 Packages [36.0 kB]
Fetched 34.2 MB in 6s (5278 kB/s)
Reading package lists...
```

Luôn chạy `apt update` trước khi cài: danh sách cũ có thể trỏ tới phiên bản đã bị xoá khỏi kho, gây lỗi `404 Not Found`.

## Tìm và xem thông tin gói

```bash
apt search --names-only "^tree$"
apt show tree
```

| Lệnh | Làm gì |
|---|---|
| `apt search từ` | Tìm trong tên và mô tả gói. `--names-only` chỉ tìm trong tên |
| `apt show tên` | Thông tin gói: phiên bản, dung lượng, phụ thuộc, mô tả |
| `apt policy tên` | Phiên bản đã cài, phiên bản sẽ được cài, đến từ kho nào |

```text
Package: tree
Version: 2.1.1-2ubuntu3.24.04.2
Installed-Size: 111 kB
Depends: libc6 (>= 2.38)
Description: displays an indented directory tree, in color
```

## Cài và gỡ

```bash
sudo apt install -y tree curl
sudo apt remove tree
sudo apt purge tree
sudo apt autoremove
```

| Lệnh | Làm gì |
|---|---|
| `apt install tên...` | Cài một hoặc nhiều gói, kèm phụ thuộc |
| `apt install tên=phiên-bản` | Cài đúng phiên bản chỉ định |
| `apt reinstall tên` | Cài lại (khi file của gói bị hỏng hoặc bị xoá nhầm) |
| `apt remove tên` | Gỡ gói, **giữ file cấu hình** |
| `apt purge tên` | Gỡ gói **và xoá file cấu hình** |
| `apt autoremove` | Gỡ các phụ thuộc không còn ai cần |
| `apt clean` | Xoá các file `.deb` đã tải trong `/var/cache/apt/archives` |

Khác nhau giữa remove và purge, thấy rõ với `nginx-common` (gói có file cấu hình trong `/etc/nginx`):

```bash
sudo apt remove nginx nginx-common
dpkg -l | grep nginx
ls /etc/nginx
```

```text
rc  nginx-common                1.24.0-2ubuntu7.21
fastcgi.conf
fastcgi_params
koi-utf
```

Gói đã gỡ nhưng `/etc/nginx` còn nguyên. Sau `sudo apt purge nginx-common`, thư mục đó biến mất. Dùng `purge` khi muốn cài lại từ đầu với cấu hình mặc định.

## Kho phần mềm: sources

Danh sách kho trên Ubuntu 24.04 nằm ở `/etc/apt/sources.list.d/ubuntu.sources`:

```text
Types: deb
URIs: http://archive.ubuntu.com/ubuntu/
Suites: noble noble-updates noble-backports
Components: main universe restricted multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg
```

| Dòng | Ý nghĩa |
|---|---|
| `Types: deb` | Kho chứa gói đã biên dịch (`deb-src` là mã nguồn) |
| `URIs:` | Địa chỉ máy chủ kho |
| `Suites: noble noble-updates ...` | Nhánh: `noble` (bản gốc của 24.04), `noble-updates` (bản sửa lỗi), `noble-security` (vá bảo mật), `noble-backports` (bản mới hơn được đưa về) |
| `Components:` | `main` (Canonical hỗ trợ), `universe` (cộng đồng duy trì), `restricted` và `multiverse` (giấy phép hạn chế) |
| `Signed-By:` | Khoá dùng để kiểm tra chữ ký gói |

Bản Ubuntu cũ hơn dùng file `/etc/apt/sources.list` với mỗi kho một dòng kiểu `deb http://archive.ubuntu.com/ubuntu noble main universe`.

Phần mềm không có trong kho của Ubuntu (Node.js bản mới, PostgreSQL bản mới…) thường hướng dẫn **thêm kho của hãng**: tải khoá vào `/etc/apt/keyrings/`, thêm một file trong `/etc/apt/sources.list.d/`, rồi `apt update` và `apt install`. Chỉ thêm kho từ nguồn bạn tin cậy, vì gói từ kho đó được cài bằng quyền root.

## dpkg: làm việc với từng gói

`dpkg` là công cụ cấp thấp mà `apt` gọi ở bên dưới.

```bash
dpkg -l tree
dpkg -L tree | head -5
dpkg -S /usr/bin/curl
```

```text
ii  tree           2.1.1-2ubuntu3.24.04.2 amd64        displays an indented directory tree, in color
/.
/usr
/usr/bin
/usr/bin/tree
/usr/share
curl: /usr/bin/curl
```

| Lệnh | Làm gì |
|---|---|
| `dpkg -l` | Liệt kê mọi gói đã cài (**l**ist). Thêm tên để xem một gói |
| `dpkg -L tên` | Các file mà gói đã cài (**L**ist files) |
| `dpkg -S đường-dẫn` | File này thuộc gói nào (**S**earch) |
| `dpkg -s tên` | Trạng thái và thông tin gói (**s**tatus) |
| `dpkg -i file.deb` | Cài một file `.deb` (**i**nstall) |
| `dpkg -r tên` / `dpkg -P tên` | Gỡ / gỡ sạch (**r**emove / **P**urge) |
| `dpkg -I file.deb` / `dpkg -c file.deb` | Thông tin / danh sách file **bên trong** file `.deb` chưa cài |

Hai chữ đầu dòng `dpkg -l`:

| Mã | Ý nghĩa |
|---|---|
| `ii` | Muốn cài (**i**nstall), đã cài xong (**i**nstalled) |
| `rc` | Đã gỡ (**r**emove), chỉ còn file cấu hình (**c**onfig-files) |
| `iU`, `iF` | Cài dở dang / cài lỗi. Sửa bằng `sudo apt install -f` hoặc `sudo dpkg --configure -a` |

### Cài file .deb tải về

```bash
apt download tree
sudo dpkg -i tree_*.deb
sudo apt install ./tree_*.deb
```

| Lệnh | Làm gì |
|---|---|
| `apt download tree` | Tải file `.deb` về thư mục hiện tại mà không cài (để xem thử) |
| `dpkg -i file.deb` | Cài file, nhưng **không tự tải phụ thuộc**. Thiếu thì báo lỗi và gói bị để ở trạng thái lỗi |
| `apt install ./file.deb` | Cài file **và** tải phụ thuộc từ kho. Cách nên dùng. Phải có `./` để `apt` hiểu đây là file chứ không phải tên gói |
| `apt install -f` | Sửa phụ thuộc còn thiếu sau khi `dpkg -i` lỗi (**f**ix-broken) |

## Giữ phiên bản: apt-mark hold

Khi một phần mềm (database, kernel) đang chạy ổn mà bạn không muốn `apt upgrade` tự nâng cấp:

```bash
sudo apt-mark hold tree
apt-mark showhold
sudo apt-mark unhold tree
```

```text
tree set on hold.
tree
Canceled hold on tree.
```

## Cập nhật bảo mật tự động

Ubuntu Server cài sẵn gói `unattended-upgrades`, tự cài các bản vá **bảo mật** mỗi ngày (qua `apt-daily.timer` và `apt-daily-upgrade.timer`, xem bằng `systemctl list-timers`). Kiểm tra bằng `systemctl status unattended-upgrades`. Log ở `/var/log/unattended-upgrades/`. Một số bản vá (kernel, thư viện C) chỉ có tác dụng sau khi khởi động lại. File `/var/run/reboot-required` xuất hiện khi cần khởi động lại.

## Snap (biết qua)

Ubuntu còn có **snap**: gói đóng kèm mọi thư viện cần thiết, chạy cách ly, tự cập nhật (`snap install`, `snap list`). Trên server bạn sẽ gặp vài phần mềm cài qua snap (ví dụ `certbot`, `lxd`). Phần lớn phần mềm server vẫn nên cài qua `apt`.

## Thực hành

1. Cập nhật danh sách gói, xem có bao nhiêu gói có thể nâng cấp.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo apt update
   apt list --upgradable
   ```

   Dòng cuối của `apt update` cũng ghi `N packages can be upgraded` (nếu có).

   </details>

2. Tìm gói có tên `htop`, xem phiên bản và dung lượng, cài nó, rồi kiểm tra bằng `dpkg -l`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   apt show htop
   sudo apt install -y htop
   dpkg -l htop
   ```

   Nếu máy đã có `htop`, `apt install` báo `htop is already the newest version`.

   </details>

3. File `/usr/bin/ssh` thuộc gói nào? Gói đó cài những file nào trong `/usr/bin`?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   dpkg -S /usr/bin/ssh
   dpkg -L openssh-client | grep /usr/bin
   ```

   </details>

4. Cài `nginx`, gỡ bằng `remove`, kiểm tra `/etc/nginx` còn không và trạng thái trong `dpkg -l`. Rồi gỡ sạch và dọn phụ thuộc thừa.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo apt install -y nginx
   sudo apt remove -y nginx nginx-common
   ls /etc/nginx
   dpkg -l | grep nginx
   sudo apt purge -y nginx-common
   sudo apt autoremove -y
   ```

   </details>

5. Tải file `.deb` của gói `sl` về (không cài), xem bên trong có những file gì, rồi cài nó bằng `apt install ./`. Chạy thử lệnh `sl`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   cd /tmp
   apt download sl
   dpkg -c sl_*.deb
   sudo apt install -y ./sl_*.deb
   /usr/games/sl
   ```

   `sl` là một chương trình đùa: một đoàn tàu chạy qua màn hình khi bạn gõ nhầm `ls`.

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Làm mới danh sách / nâng cấp | `sudo apt update` / `sudo apt upgrade` |
| Tìm / xem gói | `apt search từ` / `apt show tên` |
| Cài / gỡ / gỡ sạch | `sudo apt install tên` / `remove` / `purge` |
| Dọn phụ thuộc thừa / cache | `sudo apt autoremove` / `sudo apt clean` |
| Cài file .deb | `sudo apt install ./file.deb` |
| Gói đã cài / file của gói / file thuộc gói nào | `dpkg -l` / `dpkg -L tên` / `dpkg -S đường-dẫn` |
| Giữ phiên bản | `sudo apt-mark hold tên` |
| Danh sách kho | `/etc/apt/sources.list.d/` |
