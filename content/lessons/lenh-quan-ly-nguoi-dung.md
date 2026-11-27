---
summary: Tạo, sửa, khoá, xoá user (useradd, adduser, usermod, userdel, passwd), đặt hạn mật khẩu (chage), và quản lý nhóm (groupadd, groupmod, gpasswd, groupdel). Kèm cách tạo tài khoản hệ thống để chạy dịch vụ.
minutes: 45
commands: [useradd, adduser, passwd, usermod, userdel, chage, groupadd, groupmod, groupdel, gpasswd, chpasswd]
quiz:
  - q: "Chạy `sudo useradd an` trên Ubuntu. Điều gì xảy ra?"
    options: ["Tạo user an có thư mục home, shell bash, hỏi mật khẩu", "Tạo user an nhưng KHÔNG có thư mục home, shell là /bin/sh, chưa có mật khẩu", "Báo lỗi thiếu tuỳ chọn", "Tạo nhóm an"]
    answer: 1
    explain: "`useradd` trơn chỉ làm tối thiểu. Muốn có home và bash phải ghi rõ `useradd -m -s /bin/bash an`, rồi đặt mật khẩu bằng `passwd an`. `adduser` (riêng họ Debian/Ubuntu) thì làm hết và hỏi từng bước."
  - q: "Thêm user binh vào nhóm docker mà không làm mất các nhóm phụ đang có, dùng lệnh nào?"
    options: ["usermod -G docker binh", "usermod -aG docker binh", "groupadd docker binh", "useradd -G docker binh"]
    answer: 1
    explain: "`-G` đặt lại toàn bộ danh sách nhóm phụ: thiếu `-a` thì binh bị gỡ khỏi mọi nhóm phụ khác (có thể mất cả quyền sudo). `-a` (append) là thêm vào danh sách."
  - q: Vừa thêm mình vào nhóm docker nhưng gõ docker ps vẫn báo không có quyền. Vì sao?
    options: ["Phải cài lại docker", "Nhóm mới chỉ có hiệu lực ở phiên đăng nhập mới, phải đăng xuất rồi vào lại", "Phải khởi động lại máy", "Phải chạy usermod hai lần"]
    answer: 1
    explain: "Danh sách nhóm được nạp lúc đăng nhập. Đăng xuất rồi vào lại (hoặc chạy `newgrp docker` để mở một shell có nhóm mới)."
  - q: "`sudo userdel -r chi` khác `sudo userdel chi` ở chỗ nào?"
    options: ["Không khác", "-r xoá luôn thư mục home và hộp thư của chi", "-r chỉ khoá chứ không xoá", "-r xoá cả nhóm sudo"]
    answer: 1
    explain: "Không có `-r`, tài khoản bị xoá nhưng `/home/chi` vẫn còn, file trong đó mang UID không còn chủ."
  - q: Bắt user binh đổi mật khẩu ngay lần đăng nhập tới, dùng lệnh nào?
    options: ["passwd -l binh", "chage -d 0 binh", "usermod -L binh", "userdel binh"]
    answer: 1
    explain: "`chage -d 0` đặt ngày đổi mật khẩu gần nhất về 0, nên hệ thống coi mật khẩu đã hết hạn và bắt đổi. `passwd -e binh` cũng làm được việc này."
  - q: Tạo user để chạy một ứng dụng web (không ai đăng nhập vào), lệnh nào hợp lý nhất?
    options: ["useradd -m -s /bin/bash myapp", "useradd -r -s /usr/sbin/nologin myapp", "adduser myapp", "useradd -G sudo myapp"]
    answer: 1
    explain: "`-r` tạo tài khoản hệ thống (UID dưới 1000, không tạo home), shell `nologin` để không ai đăng nhập được. Ứng dụng chạy bằng user này thì có lỗ hổng cũng ít gây hại."
---

Các lệnh trong bài sửa tài khoản nên cần `sudo`. Làm trong container `lab`.

## Tạo user

### useradd: lệnh chuẩn, làm tối thiểu

`useradd` có trên mọi bản Linux. Nhưng nếu không ghi tuỳ chọn, nó làm rất ít:

```bash
sudo useradd an
grep '^an:' /etc/passwd
ls -d /home/an
```

```text
an:x:1002:1002::/home/an:/bin/sh
ls: cannot access '/home/an': No such file or directory
```

User `an` có tên trong `/etc/passwd` nhưng **không có thư mục home**, shell là `/bin/sh`, và **chưa có mật khẩu** (cột 2 trong shadow là `!`). Cách tạo đầy đủ:

```bash
sudo useradd -m -s /bin/bash -c "Nguyen Van Binh" binh
sudo passwd binh
```

| Phần | Ý nghĩa |
|---|---|
| `useradd` | Tạo user |
| `-m` | Tạo thư mục home (`/home/binh`), chép sẵn các file trong `/etc/skel` vào đó |
| `-s /bin/bash` | Shell đăng nhập |
| `-c "Nguyen Van Binh"` | Mô tả, ghi vào cột 5 (GECOS) |
| `binh` | Tên user |
| `passwd binh` | Đặt mật khẩu cho `binh` (gõ 2 lần, màn hình không hiện gì) |

```text
binh:x:1003:1003:Nguyen Van Binh:/home/binh:/bin/bash
```

Các tuỳ chọn khác của `useradd`:

| Tuỳ chọn | Ý nghĩa |
|---|---|
| `-u 1500` | Chọn UID cụ thể |
| `-g devs` | Chọn nhóm chính (nhóm phải có sẵn) |
| `-G sudo,docker` | Các nhóm phụ |
| `-d /srv/app` | Thư mục home khác `/home/tên` |
| `-e 2027-01-31` | Ngày tài khoản hết hiệu lực |
| `-r` | Tài khoản hệ thống (UID dưới 1000, không tạo home) |

Giá trị mặc định khi không ghi tuỳ chọn: xem bằng `useradd -D` (đọc từ `/etc/default/useradd`) và `/etc/login.defs`.

### adduser: cách thân thiện (Debian, Ubuntu)

```bash
sudo adduser chi
```

`adduser` là script riêng của họ Debian. Nó tự tạo home, chọn shell bash, hỏi mật khẩu và thông tin từng bước. Trên Ubuntu khi tạo user bằng tay thì `adduser` tiện hơn. Còn trong script, hoặc trên Red Hat/Rocky (ở đó `adduser` chỉ là tên khác của `useradd`), hãy dùng `useradd` với đủ tuỳ chọn.

### Đặt mật khẩu không cần gõ tay

Trong script, dùng `chpasswd` để đặt mật khẩu từ stdin:

```bash
echo 'binh:MatKhau@123' | sudo chpasswd
```

## passwd: mật khẩu và khoá tài khoản

| Lệnh | Làm gì |
|---|---|
| `passwd` | Đổi mật khẩu của **chính bạn** (hỏi mật khẩu cũ) |
| `sudo passwd binh` | root đặt mật khẩu cho `binh` (không cần mật khẩu cũ) |
| `sudo passwd -l binh` | Khoá (**l**ock) mật khẩu: thêm `!` trước chuỗi băm, không đăng nhập bằng mật khẩu được nữa |
| `sudo passwd -u binh` | Mở khoá (**u**nlock) |
| `sudo passwd -S binh` | Xem trạng thái (**S**tatus) |
| `sudo passwd -e binh` | Bắt đổi mật khẩu ở lần đăng nhập tới (**e**xpire) |

```bash
sudo passwd -S binh
```

```text
binh P 2026-11-27 0 99999 7 -1
```

| Cột | Ý nghĩa |
|---|---|
| `binh` | Tên user |
| `P` | Có mật khẩu hợp lệ (**P**assword). `L` là bị khoá, `NP` là không có mật khẩu |
| `2026-11-27` | Ngày đổi gần nhất |
| `0 99999 7 -1` | Số ngày tối thiểu, tối đa, báo trước, ngừng hoạt động (như cột 4–7 của shadow) |

> Khoá mật khẩu **không chặn** đăng nhập bằng SSH key. Muốn chặn hẳn, đổi shell thành `nologin` hoặc đặt ngày hết hiệu lực: `sudo usermod -e 1 binh`.

## usermod: sửa user

```bash
sudo usermod -aG dev binh
id binh
```

| Phần | Ý nghĩa |
|---|---|
| `usermod` | Sửa thông tin user |
| `-a` | Thêm vào (**a**ppend) danh sách nhóm phụ hiện có |
| `-G dev` | Nhóm phụ. Nhiều nhóm thì cách nhau bằng dấu phẩy: `-aG dev,sudo` |
| `binh` | User cần sửa |

```text
uid=1003(binh) gid=1003(binh) groups=1003(binh),1005(dev)
```

**Bẫy hay gặp: quên `-a`.** `usermod -G ops binh` sẽ **thay** cả danh sách nhóm phụ bằng đúng `ops`:

```text
uid=1003(binh) gid=1003(binh) groups=1003(binh),2000(ops)
```

`binh` mất nhóm `dev`. Nếu đó là nhóm `sudo` thì `binh` mất luôn quyền quản trị.

Các tuỳ chọn khác:

| Lệnh | Làm gì |
|---|---|
| `usermod -s /usr/sbin/nologin an` | Đổi shell (ở đây là cấm đăng nhập) |
| `usermod -c "Tran An" an` | Đổi mô tả |
| `usermod -l anh an` | Đổi tên đăng nhập từ `an` thành `anh` (**l**ogin). Thư mục home giữ nguyên tên cũ |
| `usermod -d /home/anh -m anh` | Đổi thư mục home và chuyển (**m**ove) dữ liệu sang |
| `usermod -L binh` / `-U binh` | Khoá / mở khoá mật khẩu (giống `passwd -l` / `-u`) |
| `usermod -e 2027-01-31 chi` | Đặt ngày tài khoản hết hiệu lực |

Nhóm mới thêm **chỉ có hiệu lực khi user đăng nhập lại**. User đang đăng nhập thì đăng xuất rồi vào lại, hoặc chạy `newgrp tên-nhóm` để mở một shell có nhóm đó.

## userdel: xoá user

```bash
sudo userdel anh
sudo userdel -r chi
```

| Lệnh | Làm gì |
|---|---|
| `userdel anh` | Xoá tài khoản, **giữ** thư mục home |
| `userdel -r chi` | Xoá tài khoản cùng thư mục home và hộp thư (**r**emove) |

User đang có tiến trình chạy thì `userdel` từ chối. Hãy dừng tiến trình trước (`sudo pkill -u tên`). Trước khi xoá người đã nghỉ việc, cân nhắc chỉ **khoá** tài khoản và sao lưu home, vì có thể còn cần dữ liệu.

## chage: hạn dùng mật khẩu

```bash
sudo chage -l binh
```

```text
Last password change					: Nov 27, 2026
Password expires					: never
Password inactive					: never
Account expires						: never
Minimum number of days between password change		: 0
Maximum number of days between password change		: 99999
Number of days of warning before password expires	: 7
```

| Lệnh | Làm gì |
|---|---|
| `chage -l binh` | Xem hạn dùng (**l**ist). User thường xem của mình bằng `chage -l $USER` |
| `chage -M 90 binh` | Mật khẩu dùng tối đa 90 ngày (**M**ax) |
| `chage -m 1 binh` | Phải đợi ít nhất 1 ngày mới được đổi lại (**m**in) |
| `chage -W 7 binh` | Báo trước 7 ngày khi sắp hết hạn (**W**arn) |
| `chage -d 0 binh` | Bắt đổi mật khẩu ở lần đăng nhập tới |
| `chage -E 2027-01-31 binh` | Ngày tài khoản hết hiệu lực (**E**xpire) |

Sau `chage -d 0 binh`:

```text
Last password change					: password must be changed
Password expires					: password must be changed
```

`chage` không có tuỳ chọn nào (`sudo chage binh`) sẽ hỏi từng giá trị một.

## Quản lý nhóm

```bash
sudo groupadd dev
sudo groupadd -g 2000 ops
grep -E '^(dev|ops):' /etc/group
```

```text
dev:x:1005:
ops:x:2000:
```

| Lệnh | Làm gì |
|---|---|
| `groupadd dev` | Tạo nhóm |
| `groupadd -g 2000 ops` | Tạo nhóm với GID chọn trước |
| `groupmod -n devs dev` | Đổi tên nhóm `dev` thành `devs` (**n**ew name) |
| `groupdel ops` | Xoá nhóm. Không xoá được nếu đang là nhóm chính của ai đó |
| `gpasswd -a chi dev` | Thêm `chi` vào nhóm `dev` (**a**dd) |
| `gpasswd -d chi dev` | Gỡ `chi` khỏi nhóm `dev` (**d**elete) |

```text
Adding user chi to group dev
Removing user chi from group dev
```

`gpasswd -a` và `usermod -aG` đều thêm user vào nhóm. `gpasswd -d` là cách gọn nhất để **gỡ** một user khỏi một nhóm.

Xoá nhóm đang là nhóm chính của user:

```text
groupdel: cannot remove the primary group of user 'duc'
```

## Tài khoản hệ thống cho dịch vụ

Khi tự triển khai ứng dụng (Node.js, Go…), đừng chạy bằng root hay bằng user của bạn. Tạo một tài khoản riêng:

```bash
sudo useradd -r -s /usr/sbin/nologin myapp
grep myapp /etc/passwd
```

```text
myapp:x:997:996::/home/myapp:/usr/sbin/nologin
```

| Phần | Ý nghĩa |
|---|---|
| `-r` | Tài khoản hệ thống: UID dưới 1000 (ở đây 997), không tạo thư mục home |
| `-s /usr/sbin/nologin` | Không ai đăng nhập được bằng tài khoản này |

Dịch vụ systemd sau đó chạy bằng user này (bài [systemd](/bai/systemd-dich-vu)).

## Thực hành

Làm trong container `lab`, mọi lệnh dùng `sudo`.

1. Tạo user `dev1` có home, shell bash, mô tả "Lap trinh vien 1", đặt mật khẩu `Dev1@2026` mà không cần gõ tay. Kiểm tra bằng `getent` và `passwd -S`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo useradd -m -s /bin/bash -c "Lap trinh vien 1" dev1
   echo 'dev1:Dev1@2026' | sudo chpasswd
   getent passwd dev1
   sudo passwd -S dev1
   ```

   </details>

2. Tạo nhóm `webteam`, thêm `dev1` và `hocvien` vào làm nhóm phụ. Kiểm tra `hocvien` vẫn còn nhóm `sudo`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo groupadd webteam
   sudo usermod -aG webteam dev1
   sudo gpasswd -a hocvien webteam
   getent group webteam
   id hocvien
   ```

   `id hocvien` vẫn có `27(sudo)`, vì cả hai cách đều **thêm** chứ không thay.

   </details>

3. Chuyển sang `dev1` bằng `su - dev1` (mật khẩu ở bài 1), xem `id`, rồi `exit`. Sau đó bắt `dev1` đổi mật khẩu ở lần đăng nhập tới, và đặt mật khẩu chỉ dùng tối đa 60 ngày.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   su - dev1
   id
   exit
   sudo chage -d 0 -M 60 dev1
   sudo chage -l dev1
   ```

   Lần `su - dev1` tiếp theo sẽ báo `You are required to change your password immediately`.

   </details>

4. Khoá `dev1`, thử `su - dev1` (phải thất bại), rồi mở khoá.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo passwd -l dev1
   su - dev1
   sudo passwd -u dev1
   ```

   Khi bị khoá, `su` báo `Authentication failure` dù gõ đúng mật khẩu.

   </details>

5. Tạo tài khoản hệ thống `shopapp` không đăng nhập được. Sau đó dọn dẹp: xoá `dev1` cùng thư mục home, xoá nhóm `webteam`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo useradd -r -s /usr/sbin/nologin shopapp
   getent passwd shopapp
   sudo userdel -r dev1
   sudo groupdel webteam
   ```

   </details>

6. Nếu ở [bài 8](/bai/xem-noi-dung-file) bạn đã lưu `~/passwd.sha256`, kiểm tra lại bây giờ.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sha256sum -c ~/passwd.sha256
   ```

   Kết quả `FAILED`, vì `/etc/passwd` đã thay đổi khi tạo và xoá user. Đây là cách đơn giản để phát hiện file quan trọng bị sửa.

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Tạo user đầy đủ | `useradd -m -s /bin/bash tên` rồi `passwd tên` (Ubuntu: `adduser tên`) |
| Tài khoản cho dịch vụ | `useradd -r -s /usr/sbin/nologin tên` |
| Thêm vào nhóm phụ | `usermod -aG nhóm tên` (nhớ `-a`!) |
| Gỡ khỏi nhóm | `gpasswd -d tên nhóm` |
| Khoá / mở khoá | `passwd -l tên` / `passwd -u tên` |
| Bắt đổi mật khẩu | `chage -d 0 tên` |
| Xem hạn mật khẩu | `chage -l tên` |
| Xoá user và home | `userdel -r tên` |
| Tạo / đổi tên / xoá nhóm | `groupadd` / `groupmod -n` / `groupdel` |
