---
summary: root là tài khoản có toàn quyền trên máy. Bài này giải thích vì sao không nên làm việc bằng root, cách dùng sudo để chạy từng lệnh với quyền root, khác nhau giữa sudo và su, và ai được phép dùng sudo.
minutes: 30
commands: [sudo, sudo -i, sudo -u, sudo -l, su, whoami, id, visudo, passwd]
quiz:
  - q: User root có UID bằng bao nhiêu?
    options: ["1", "0", "1000", "65534"]
    answer: 1
    explain: Kernel nhận ra quyền quản trị qua UID 0, không phải qua cái tên "root". User thường trên Ubuntu bắt đầu từ UID 1000.
  - q: Khi gõ `sudo apt update`, bạn phải nhập mật khẩu của ai?
    options: ["Mật khẩu của root", "Mật khẩu của chính bạn", "Không cần mật khẩu", "Mật khẩu của nhóm sudo"]
    answer: 1
    explain: "`sudo` hỏi mật khẩu của **chính bạn** để chắc người đang gõ đúng là bạn, rồi kiểm tra file sudoers xem bạn có được phép không. `su` mới hỏi mật khẩu của user đích (thường là root)."
  - q: Trên Ubuntu, thêm user vào nhóm nào để user đó dùng được sudo?
    options: ["wheel", "sudo", "root", "admin-users"]
    answer: 1
    explain: "File `/etc/sudoers` của Ubuntu có dòng `%sudo ALL=(ALL:ALL) ALL`, nghĩa là mọi thành viên nhóm `sudo` được chạy mọi lệnh. Họ Red Hat dùng nhóm `wheel`."
  - q: Vì sao phải sửa /etc/sudoers bằng visudo thay vì mở bằng vim hay nano?
    options: ["Vì file đó bị mã hoá", "visudo kiểm tra cú pháp trước khi lưu, tránh lỗi làm mất quyền sudo", "Vì vim không mở được file trong /etc", "visudo chạy nhanh hơn"]
    answer: 1
    explain: Nếu file sudoers sai cú pháp, sudo sẽ từ chối chạy, và bạn có thể mất luôn cách để sửa lại. `visudo` kiểm tra cú pháp trước khi lưu, báo lỗi để bạn sửa.
  - q: Lệnh nào mở một shell root đầy đủ (môi trường của root, đứng ở /root)?
    options: ["sudo ls", "sudo -i", "sudo -l", "whoami"]
    answer: 1
    explain: "`sudo -i` mở shell đăng nhập của root. Dùng xong nhớ gõ `exit`. `sudo -l` chỉ liệt kê các lệnh bạn được phép chạy."
---

## root: tài khoản toàn quyền

Mỗi máy Linux có một tài khoản đặc biệt tên **root**, mang số hiệu user (UID) bằng **0**. root được làm mọi thứ: đọc mọi file, xoá mọi file, cài phần mềm, tắt máy, đổi mật khẩu người khác. Kernel không kiểm tra quyền với root.

User thường như `hocvien` chỉ có quyền trên file của mình. Thử đọc file chứa mật khẩu đã mã hoá:

```bash
cat /etc/shadow
```

```text
cat: /etc/shadow: Permission denied
```

Vì sao **không nên** làm việc hằng ngày bằng root:

- Gõ nhầm một lệnh có thể phá cả máy. Ví dụ `rm -rf / tmp/x` (thừa một dấu cách) sẽ xoá từ gốc `/`.
- Nếu chương trình bạn chạy có lỗ hổng, kẻ tấn công nhận ngay toàn quyền.
- Không biết ai đã làm gì, vì mọi người đều dùng chung tài khoản root.

Cách làm đúng: đăng nhập bằng user thường, chỉ "mượn" quyền root cho **từng lệnh cần thiết** bằng `sudo`.

Phân biệt bằng dấu nhắc:

| Dấu nhắc | Bạn là |
|---|---|
| `hocvien@lab:~$` | User thường (`$`) |
| `root@lab:~#` | root (`#`) |

## whoami và id: mình là ai

```bash
whoami
id
```

```text
hocvien
uid=1001(hocvien) gid=1001(hocvien) groups=1001(hocvien),27(sudo)
```

| Phần kết quả `id` | Ý nghĩa |
|---|---|
| `uid=1001(hocvien)` | Số hiệu user và tên user |
| `gid=1001(hocvien)` | Nhóm chính của user. Ubuntu tạo cho mỗi user một nhóm cùng tên |
| `groups=...,27(sudo)` | Các nhóm user thuộc về. Có nhóm `sudo` nghĩa là user được dùng `sudo` |

## sudo: chạy một lệnh với quyền root

```bash
sudo cat /etc/shadow
```

| Phần | Ý nghĩa |
|---|---|
| `sudo` | Chạy lệnh phía sau với quyền user khác, mặc định là root (**s**ubstitute **u**ser **do**) |
| `cat /etc/shadow` | Lệnh cần chạy |

Lần đầu, `sudo` hỏi **mật khẩu của chính bạn** (trong container lab là `hocvien`). Khi gõ mật khẩu, màn hình không hiện gì, kể cả dấu `*`. Cứ gõ rồi bấm Enter. Sau đó khoảng 15 phút `sudo` không hỏi lại.

```text
[sudo] password for hocvien:
root:*:20767:0:99999:7:::
daemon:*:20767:0:99999:7:::
...
```

Kiểm tra lệnh thật sự chạy bằng ai:

```bash
sudo whoami
sudo id
```

```text
root
uid=0(root) gid=0(root) groups=0(root)
```

### Các cách dùng sudo hay gặp

| Lệnh | Làm gì |
|---|---|
| `sudo lệnh` | Chạy một lệnh bằng root |
| `sudo !!` | Chạy lại lệnh vừa gõ, thêm `sudo` phía trước. Hay dùng khi vừa bị `Permission denied` |
| `sudo -i` | Mở shell root đầy đủ: môi trường của root, đứng ở `/root`. Dùng khi cần gõ nhiều lệnh quản trị liền nhau. Xong việc gõ `exit` |
| `sudo -u nobody whoami` | Chạy lệnh bằng một user khác (không phải root), ở đây là `nobody` |
| `sudo -l` | Liệt kê những lệnh bạn được phép chạy bằng sudo |
| `sudo -k` | Quên mật khẩu đã nhập, lần sau `sudo` sẽ hỏi lại |

```bash
sudo -l
```

```text
Matching Defaults entries for hocvien on lab:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User hocvien may run the following commands on lab:
    (ALL : ALL) ALL
```

Dòng cuối `(ALL : ALL) ALL` nghĩa là `hocvien` được chạy **mọi lệnh**, dưới danh nghĩa **mọi user** và **mọi nhóm**.

> **Bẫy hay gặp:** `sudo echo "127.0.0.1 web" >> /etc/hosts` vẫn báo `Permission denied`. Lý do: phần chuyển hướng `>>` do **shell của bạn** (user thường) thực hiện, `sudo` chỉ áp lên `echo`. Cách đúng là dùng `tee` chạy bằng sudo: `echo "127.0.0.1 web" | sudo tee -a /etc/hosts`. Chuyển hướng và `tee` học ở bài [Chuyển hướng và pipe](/bai/chuyen-huong-va-pipe).

## Ai được dùng sudo: /etc/sudoers

Quyền dùng sudo ghi trong file `/etc/sudoers` và các file trong thư mục `/etc/sudoers.d/`.

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
| `%sudo` | Áp cho nhóm `sudo` (dấu `%` là nhóm, không có `%` là một user) |
| `ALL=` | Trên mọi máy (dùng khi một file sudoers chia sẻ cho nhiều máy) |
| `(ALL:ALL)` | Được chạy lệnh dưới danh nghĩa mọi user : mọi nhóm |
| `ALL` (cuối) | Được chạy mọi lệnh |

Dòng `@includedir /etc/sudoers.d` nghĩa là đọc thêm các file trong `/etc/sudoers.d/`. Muốn cấp quyền riêng, nên tạo file mới trong thư mục này thay vì sửa file chính.

Muốn cho một user dùng sudo, cách đơn giản nhất là thêm user đó vào nhóm `sudo` (Ubuntu/Debian) hoặc `wheel` (Red Hat/Rocky):

```bash
sudo usermod -aG sudo tenuser
```

| Phần | Ý nghĩa |
|---|---|
| `usermod` | Sửa thông tin user |
| `-aG sudo` | Thêm (**a**ppend) vào nhóm (**G**roup) `sudo`. Thiếu `-a` thì user bị gỡ khỏi các nhóm phụ khác |
| `tenuser` | User cần cấp quyền |

User đó phải **đăng xuất rồi đăng nhập lại** thì nhóm mới có hiệu lực. Lệnh `usermod` được học kỹ ở bài [Lệnh quản lý người dùng](/bai/lenh-quan-ly-nguoi-dung).

### Sửa sudoers phải dùng visudo

```bash
sudo visudo
sudo visudo -f /etc/sudoers.d/deploy
```

| Phần | Ý nghĩa |
|---|---|
| `visudo` | Mở file sudoers bằng trình soạn thảo, **kiểm tra cú pháp trước khi lưu** |
| `-f /etc/sudoers.d/deploy` | Sửa một file cụ thể thay vì `/etc/sudoers` |

Nếu file sudoers sai cú pháp, sudo sẽ ngừng hoạt động hoàn toàn, và trên VPS bạn có thể không còn cách nào lấy lại quyền root. `visudo` chặn lỗi này.

Ví dụ một dòng cho user `deploy` được khởi động lại nginx mà không cần mật khẩu, và chỉ được làm đúng việc đó:

```text
deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart nginx
```

## su: chuyển hẳn sang user khác

`su` (**s**witch **u**ser) mở một shell dưới danh nghĩa user khác, và hỏi **mật khẩu của user đích**.

| Lệnh | Làm gì |
|---|---|
| `su tenuser` | Chuyển sang `tenuser`, giữ phần lớn môi trường của bạn |
| `su - tenuser` | Chuyển sang `tenuser` như đăng nhập mới: đổi sang thư mục home và môi trường của user đó. **Nên dùng dạng có dấu `-`** |
| `su -` | Chuyển sang root (cần mật khẩu root) |
| `sudo su -` / `sudo -i` | Thành root bằng mật khẩu của **bạn** (nếu bạn có quyền sudo) |

Trên Ubuntu, tài khoản root **bị khoá mật khẩu** từ đầu. Dấu `*` trong `/etc/shadow` nghĩa là không có mật khẩu nào đăng nhập được:

```bash
sudo grep '^root' /etc/shadow
su -
```

```text
root:*:20767:0:99999:7:::
Password:
su: Authentication failure
```

Vì vậy trên Ubuntu cứ dùng `sudo`. Video TITV bài 8 có hướng dẫn đặt mật khẩu cho root bằng `sudo passwd root`. Cách này làm được, nhưng trên máy chủ thật **không khuyến khích**: thêm một mật khẩu để đoán, và mất dấu ai đã làm gì.

| | `sudo` | `su` |
|---|---|---|
| Hỏi mật khẩu của | Chính bạn | User đích (thường là root) |
| Phạm vi | Từng lệnh | Cả một shell |
| Ghi log | Mỗi lệnh đều ghi (ai, lúc nào, lệnh gì) | Chỉ ghi việc chuyển user |
| Giới hạn được lệnh | Có (qua sudoers) | Không |

## Thực hành

Làm trong container `lab` (user `hocvien`, mật khẩu `hocvien`).

1. Thử đọc `/etc/shadow` bằng user thường, rồi đọc lại bằng `sudo` mà không gõ lại cả lệnh.

   <details>
   <summary>Xem cách làm</summary>

   ```bash
   cat /etc/shadow
   sudo !!
   ```

   `sudo !!` được bash thay thành `sudo cat /etc/shadow` và in lệnh đó ra trước khi chạy.

   </details>

2. Mở một shell root đầy đủ. Kiểm tra bạn là ai, đang đứng ở đâu, dấu nhắc thay đổi thế nào. Sau đó thoát ra.

   <details>
   <summary>Xem cách làm</summary>

   ```bash
   sudo -i
   whoami
   pwd
   exit
   ```

   `whoami` in `root`, `pwd` in `/root`, dấu nhắc thành `root@lab:~#`. Sau `exit` bạn về lại `hocvien@lab:~$`.

   </details>

3. Thêm dòng `127.0.0.1 web.local` vào cuối `/etc/hosts`. Thử `sudo echo ... >> /etc/hosts` trước, xem lỗi gì, rồi làm đúng cách.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo echo "127.0.0.1 web.local" >> /etc/hosts
   echo "127.0.0.1 web.local" | sudo tee -a /etc/hosts
   tail -1 /etc/hosts
   ```

   Lệnh đầu báo `Permission denied`, vì `>>` do shell của `hocvien` thực hiện. `sudo tee -a` chạy bằng root, ghi nối (`-a`) vào cuối file và in dòng đó ra màn hình.

   </details>

4. Xem ai thuộc nhóm `sudo` trên máy.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   getent group sudo
   ```

   Kết quả `sudo:x:27:ubuntu,hocvien`: phần sau dấu `:` cuối cùng là danh sách thành viên.

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Mình là ai, thuộc nhóm nào | `whoami`, `id` |
| Chạy một lệnh bằng root | `sudo lệnh` |
| Chạy lại lệnh vừa gõ bằng sudo | `sudo !!` |
| Mở shell root | `sudo -i` (thoát: `exit`) |
| Được phép chạy gì | `sudo -l` |
| Cho user dùng sudo | `sudo usermod -aG sudo tenuser` |
| Sửa quyền sudo | `sudo visudo` |
| Ghi vào file của root | `echo ... \| sudo tee -a file` |
