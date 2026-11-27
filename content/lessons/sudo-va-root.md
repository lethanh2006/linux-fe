---
summary: root là tài khoản toàn quyền. Người dùng thường mượn quyền root cho từng lệnh bằng sudo. Bài này thực hành sudo với apt update, apt upgrade, đổi mật khẩu bằng passwd và đặt mật khẩu cho root.
minutes: 30
commands: [sudo, apt update, apt upgrade, passwd, su, sudo -i]
quiz:
  - q: Lần đầu gõ `sudo`, máy hỏi mật khẩu của ai?
    options: ["Mật khẩu của root", "Mật khẩu của chính bạn", "Mật khẩu Wi-Fi", "Không hỏi gì"]
    answer: 1
    explain: "`sudo` hỏi mật khẩu của **chính bạn** để xác nhận bạn đang ngồi trước máy. Ai được dùng sudo thì ghi trong `/etc/sudoers`."
  - q: "`sudo apt update` làm gì?"
    options: ["Cài bản mới của mọi phần mềm", "Cập nhật kernel", "Tải danh sách gói mới nhất từ kho, chưa cài gì", "Khởi động lại máy"]
    answer: 2
    explain: "`apt update` chỉ làm mới danh sách gói. `apt upgrade` mới tải và cài bản mới."
  - q: Gõ mật khẩu sau `sudo`, màn hình không hiện gì. Vì sao?
    options: ["Bàn phím hỏng", "Linux cố ý không hiện để người đứng cạnh không đếm được số ký tự", "Phải gõ mật khẩu root", "Lệnh bị treo"]
    answer: 1
    explain: Khi gõ mật khẩu trong terminal, màn hình không hiện gì, kể cả dấu `*`. Cứ gõ rồi bấm Enter.
  - q: "Lệnh nào đặt mật khẩu cho người dùng `an` mà không cần biết mật khẩu cũ?"
    options: ["passwd an", "sudo passwd an", "su an", "sudo -i an"]
    answer: 1
    explain: "Root (qua `sudo`) đặt được mật khẩu cho bất kỳ ai mà không hỏi mật khẩu cũ. `passwd an` khi không phải root sẽ bị từ chối."
  - q: "Vì sao `sudo echo 'x' >> /etc/hosts` vẫn báo Permission denied?"
    options: ["Vì echo không chạy được bằng sudo", "Vì phần >> do shell của bạn (người dùng thường) làm, sudo chỉ áp lên echo", "Vì /etc/hosts không tồn tại", "Vì phải dùng su"]
    answer: 1
    explain: "Cách đúng: `echo 'x' | sudo tee -a /etc/hosts`. `tee` chạy bằng sudo nên ghi được file."
---

> Bài này đi theo video TITV bài 8.

## root và sudo

Mỗi máy Linux có một tài khoản đặc biệt tên **root**: được làm mọi thứ, đọc và xoá mọi file, cài phần mềm, đổi mật khẩu người khác. Người dùng thường như `hocvien` chỉ có quyền trên file của mình.

Thử đọc file chứa mật khẩu đã mã hoá của mọi người dùng:

```bash
cat /etc/shadow
```

```text
cat: /etc/shadow: Permission denied
```

Không nên đăng nhập hẳn bằng root để làm việc hằng ngày: gõ nhầm một lệnh có thể xoá cả hệ thống. Cách làm đúng là dùng tài khoản thường, chỉ **mượn quyền root cho từng lệnh** bằng `sudo`.

```bash
sudo cat /etc/shadow
```

| Phần | Ý nghĩa |
|---|---|
| `sudo` | Chạy lệnh phía sau bằng quyền root (**s**uper**u**ser **do**) |
| `cat /etc/shadow` | Lệnh cần chạy |

```text
[sudo] password for hocvien:
root:*:20767:0:99999:7:::
daemon:*:20767:0:99999:7:::
...
```

Ba điều cần biết về `sudo`:

- Nó hỏi **mật khẩu của chính bạn**, không phải mật khẩu root.
- Khi gõ mật khẩu, màn hình **không hiện gì**, kể cả dấu `*`. Cứ gõ rồi bấm `Enter`.
- Gõ đúng một lần, khoảng 15 phút sau `sudo` không hỏi lại.

Không phải ai cũng được dùng `sudo`. Danh sách người được dùng ghi trong file `/etc/sudoers`. Trên Ubuntu, tài khoản tạo lúc cài máy được thêm sẵn vào nhóm `sudo` nên dùng được ngay.

Việc hay cần `sudo`:

| Việc | Ví dụ |
|---|---|
| Cài, gỡ, cập nhật phần mềm | `sudo apt install tree` |
| Sửa file cấu hình hệ thống | `sudo nano /etc/hosts` |
| Đổi mật khẩu người khác | `sudo passwd an` |
| Tắt, khởi động lại máy | `sudo reboot` |

## Cập nhật phần mềm: apt update và apt upgrade

Cập nhật phần mềm gồm hai bước. Bước một, tải **danh sách** gói mới nhất từ kho:

```bash
sudo apt update
```

| Phần | Ý nghĩa |
|---|---|
| `sudo` | Cần quyền root vì sửa dữ liệu hệ thống |
| `apt` | Công cụ quản lý phần mềm của Ubuntu |
| `update` | Làm mới danh sách gói từ các kho. **Chưa cài gì** |

```text
Hit:1 http://security.ubuntu.com/ubuntu noble-security InRelease
Hit:2 http://archive.ubuntu.com/ubuntu noble InRelease
Hit:3 http://archive.ubuntu.com/ubuntu noble-updates InRelease
Hit:4 http://archive.ubuntu.com/ubuntu noble-backports InRelease
Reading package lists...
Building dependency tree...
Reading state information...
All packages are up to date.
```

`Hit` là kho không có gì mới, `Get` là đang tải danh sách mới. Dòng cuối cho biết có bao nhiêu gói cần nâng cấp. Ở đây mọi gói đã mới nhất; nếu có, dòng cuối sẽ là `N packages can be upgraded`.

Bước hai, tải và cài bản mới:

```bash
sudo apt upgrade
```

| Phần | Ý nghĩa |
|---|---|
| `upgrade` | Nâng cấp mọi gói đã cài lên bản mới nhất trong danh sách vừa tải |

Nếu có gói cần nâng cấp, `apt` liệt kê các gói, cho biết dung lượng cần tải, rồi hỏi `Do you want to continue? [Y/n]`. Bấm `Enter` (hoặc `y`) để đồng ý, `n` để huỷ. Chữ hoa `Y` là lựa chọn mặc định khi chỉ bấm `Enter`. Khi không có gì cần nâng cấp:

```text
Reading package lists...
Building dependency tree...
Reading state information...
Calculating upgrade...
0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.
```

Thói quen tốt: luôn chạy `sudo apt update` trước khi cài hoặc nâng cấp. Phần mở rộng có bài riêng về `apt`.

## Đổi mật khẩu: passwd

Đổi mật khẩu của chính mình:

```bash
passwd
```

```text
Changing password for hocvien.
Current password:
New password:
Retype new password:
passwd: password updated successfully
```

Lệnh hỏi mật khẩu hiện tại, rồi mật khẩu mới hai lần. Cả ba lần đều không hiện gì khi gõ.

Root đặt được mật khẩu cho người khác mà **không cần mật khẩu cũ**:

```bash
sudo passwd an
```

| Phần | Ý nghĩa |
|---|---|
| `sudo passwd` | Chạy `passwd` bằng quyền root |
| `an` | Người dùng cần đặt mật khẩu |

```text
New password:
BAD PASSWORD: The password is shorter than 8 characters
Retype new password:
passwd: password updated successfully
```

Ubuntu cảnh báo khi mật khẩu ngắn hơn 8 ký tự. Người dùng thường tự đổi thì bị bắt nhập lại; riêng root chỉ bị cảnh báo, vẫn đặt được. Đừng lợi dụng điều đó: dùng mật khẩu dài.

## Đặt mật khẩu cho root

Trên Ubuntu, tài khoản root **chưa có mật khẩu** nên không đăng nhập thẳng được. Muốn đăng nhập bằng root (ví dụ để dùng lệnh `su`), đặt mật khẩu cho nó:

```bash
sudo passwd root
```

```text
New password:
Retype new password:
passwd: password updated successfully
```

Từ giờ chuyển sang root được bằng `su` (**s**witch **u**ser), lệnh này hỏi **mật khẩu của root**:

```bash
su root
```

```text
Password:
root@ubuntu:/home/hocvien# whoami
root
root@ubuntu:/home/hocvien# exit
exit
```

Dấu nhắc đổi thành `#`. Gõ `exit` để quay về tài khoản cũ.

> **Lưu ý:** root có toàn quyền nên mật khẩu root phải thật mạnh. Trên máy chủ thật, người ta thường **không** đặt mật khẩu root mà chỉ dùng `sudo`: bớt một mật khẩu để kẻ xấu đoán, và mỗi lệnh `sudo` đều được ghi lại ai làm gì.

## Mở rộng (chuẩn LPIC-1)

Chuẩn LPIC-1 mục 110.1 yêu cầu biết cấu hình và dùng `sudo`, `su` đúng cách.

### Các cách dùng sudo hay gặp

| Lệnh | Làm gì |
|---|---|
| `sudo lệnh` | Chạy một lệnh bằng root |
| `sudo !!` | Chạy lại lệnh vừa gõ, thêm `sudo` phía trước. Hay dùng khi vừa bị `Permission denied` |
| `sudo -i` | Mở shell root mà không cần mật khẩu root (hỏi mật khẩu của bạn). Gõ `exit` khi xong |
| `sudo -l` | Liệt kê những lệnh bạn được phép chạy bằng sudo |
| `sudo -k` | Quên mật khẩu đã nhập, lần sau `sudo` sẽ hỏi lại |

```bash
sudo -l
```

```text
Matching Defaults entries for hocvien on ubuntu:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User hocvien may run the following commands on ubuntu:
    (ALL : ALL) ALL
```

Dòng cuối `(ALL : ALL) ALL` nghĩa là `hocvien` được chạy **mọi lệnh**, dưới danh nghĩa **mọi người dùng** và **mọi nhóm**.

> **Bẫy hay gặp:** `sudo echo "127.0.0.1 web" >> /etc/hosts` vẫn báo `Permission denied`. Phần chuyển hướng `>>` do **shell của bạn** (người dùng thường) làm, `sudo` chỉ áp lên `echo`. Cách đúng: `echo "127.0.0.1 web" | sudo tee -a /etc/hosts`. Chuyển hướng học ở bài 13.

### File /etc/sudoers

```bash
sudo grep -v '^#' /etc/sudoers | grep -v '^$'
```

```text
Defaults	env_reset
Defaults	mail_badpass
Defaults	secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin"
Defaults	use_pty
root	ALL=(ALL:ALL) ALL
%admin ALL=(ALL) ALL
%sudo	ALL=(ALL:ALL) ALL
@includedir /etc/sudoers.d
```

Đọc dòng `%sudo ALL=(ALL:ALL) ALL`:

| Phần | Ý nghĩa |
|---|---|
| `%sudo` | Áp cho nhóm `sudo` (dấu `%` là nhóm, không có `%` là một người dùng) |
| `ALL=` | Trên mọi máy |
| `(ALL:ALL)` | Được chạy lệnh dưới danh nghĩa mọi người dùng : mọi nhóm |
| `ALL` (cuối) | Được chạy mọi lệnh |

- Cho một người dùng quyền sudo: thêm vào nhóm `sudo` bằng `sudo usermod -aG sudo an` (Ubuntu), hoặc nhóm `wheel` trên họ Red Hat. Người đó đăng nhập lại thì có hiệu lực. `usermod` học ở bài 27.
- Sửa file sudoers **phải dùng `sudo visudo`**: nó kiểm tra cú pháp trước khi lưu. File sai cú pháp thì `sudo` ngừng chạy hoàn toàn.

### su và su -

| Lệnh | Làm gì |
|---|---|
| `su an` | Chuyển sang `an`, giữ phần lớn môi trường cũ (thư mục đang đứng, biến) |
| `su - an` | Chuyển sang `an` như đăng nhập mới: về thư mục nhà và môi trường của `an`. **Nên dùng dạng có `-`** |
| `su -` | Chuyển sang root (cần mật khẩu root) |

| | `sudo` | `su` |
|---|---|---|
| Hỏi mật khẩu của | Chính bạn | Người dùng đích (thường là root) |
| Phạm vi | Từng lệnh | Cả một shell |
| Ghi nhật ký | Mỗi lệnh (ai, lúc nào, lệnh gì) | Chỉ việc chuyển người dùng |

### Khoá lại mật khẩu root

Đã đặt mật khẩu root để thử, học xong thì khoá lại:

```bash
sudo passwd -l root
sudo passwd -S root
```

| Phần | Ý nghĩa |
|---|---|
| `-l` | Khoá mật khẩu (**l**ock): thêm dấu `!` trước mật khẩu mã hoá trong `/etc/shadow` |
| `-S` | Xem trạng thái (**S**tatus) |

```text
passwd: password changed.
root L 2026-11-27 0 99999 7 -1
```

Chữ `L` (locked) là đã khoá, `P` là có mật khẩu dùng được. `sudo -i` vẫn chạy bình thường vì nó dùng mật khẩu của bạn.

## Thực hành

1. Chạy `sudo apt update`, đọc dòng cuối xem có bao nhiêu gói cần nâng cấp. Nếu có, chạy `sudo apt upgrade` và đồng ý.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo apt update
   sudo apt upgrade
   ```

   Dòng cuối của `apt update` là `All packages are up to date.` hoặc `N packages can be upgraded`. `apt upgrade` hỏi `[Y/n]`, bấm `Enter` để đồng ý.

   </details>

2. Cài lệnh `tree` (dùng ở các bài sau) rồi chạy thử `tree -L 1 /`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo apt install tree
   tree -L 1 /
   ```

   </details>

3. Đổi mật khẩu của chính bạn, sau đó gõ `sudo -k` rồi `sudo whoami` để thử mật khẩu mới.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   passwd
   sudo -k
   sudo whoami
   ```

   `sudo -k` làm `sudo` quên lần nhập trước, nên lệnh sau hỏi lại mật khẩu. Gõ mật khẩu mới, kết quả in `root`.

   </details>

4. Đặt mật khẩu cho root, chuyển sang root bằng `su`, kiểm tra dấu nhắc, thoát ra, rồi khoá lại mật khẩu root.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo passwd root
   su root
   whoami
   exit
   sudo passwd -l root
   ```

   Khi đang là root, dấu nhắc kết thúc bằng `#` và `whoami` in `root`.

   </details>

## Tóm tắt

| Lệnh | Làm gì |
|---|---|
| `sudo lệnh` | Chạy lệnh bằng quyền root, hỏi mật khẩu của bạn |
| `sudo apt update` | Tải danh sách gói mới nhất, chưa cài gì |
| `sudo apt upgrade` | Cài bản mới cho các gói đã có |
| `passwd` | Đổi mật khẩu của mình |
| `sudo passwd tên` | Đặt mật khẩu cho người khác |
| `sudo passwd root` | Đặt mật khẩu cho root |
| `su root` / `exit` | Chuyển sang root / quay lại |
| `sudo -i` | Mở shell root bằng mật khẩu của bạn |
