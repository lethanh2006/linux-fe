---
summary: Dùng SSH như người làm DevOps — tạo SSH key, đưa key lên server (ssh-copy-id), file ~/.ssh/config, chạy lệnh từ xa, chép file bằng scp và rsync, đường hầm (port forwarding), ssh-agent, kiểm tra known_hosts. Sau đó mã hoá và ký file bằng GPG.
minutes: 50
commands: [ssh, ssh-keygen, ssh-copy-id, ~/.ssh/config, authorized_keys, known_hosts, scp, rsync, ssh -L, ssh-agent, ssh-add, gpg]
quiz:
  - q: Khi tạo SSH key, file nào được chép lên server, file nào phải giữ bí mật?
    options: ["Chép id_ed25519 lên server, giữ id_ed25519.pub", "Chép id_ed25519.pub (khoá công khai) lên server; giữ id_ed25519 (khoá bí mật) trên máy mình", "Chép cả hai", "Không chép gì"]
    answer: 1
    explain: "Khoá công khai (.pub) được thêm vào ~/.ssh/authorized_keys trên server. Khoá bí mật không bao giờ rời máy của bạn, và nên có passphrase."
  - q: "SSH báo `WARNING: UNPROTECTED PRIVATE KEY FILE! Permissions 0644 ... are too open`. Sửa thế nào?"
    options: ["chmod 777 ~/.ssh/id_ed25519", "chmod 600 ~/.ssh/id_ed25519", "chown root ~/.ssh/id_ed25519", "Tạo key mới"]
    answer: 1
    explain: "SSH từ chối dùng khoá bí mật mà người khác đọc được. Khoá bí mật phải là 600, thư mục ~/.ssh là 700, authorized_keys là 600."
  - q: "rsync khác scp ở điểm nào quan trọng nhất?"
    options: ["rsync không mã hoá", "rsync chỉ chép phần thay đổi, chạy lại nhanh, có thể xoá file thừa ở đích (--delete)", "scp nhanh hơn với file đã có", "rsync chỉ chạy trong máy"]
    answer: 1
    explain: "rsync so sánh nguồn và đích, chỉ gửi phần khác nhau. Rất hợp để triển khai code và sao lưu định kỳ."
  - q: "`ssh -L 9100:127.0.0.1:9000 server` làm gì?"
    options: ["Mở cổng 9100 trên server", "Mở cổng 9100 trên máy mình; kết nối vào đó được chuyển qua SSH tới 127.0.0.1:9000 của server", "Chặn cổng 9000", "Đổi cổng SSH"]
    answer: 1
    explain: "Local port forwarding: truy cập dịch vụ chỉ nghe localhost trên server (database, trang quản trị) mà không mở cổng ra Internet."
  - q: Mã hoá file bằng GPG để chỉ người nhận đọc được, cần gì của người nhận?
    options: ["Khoá bí mật của họ", "Khoá công khai của họ", "Mật khẩu của họ", "Không cần gì"]
    answer: 1
    explain: "Mã hoá bằng khoá công khai của người nhận, chỉ khoá bí mật của họ mới giải được. Ngược lại, ký bằng khoá bí mật của mình, người khác kiểm tra bằng khoá công khai của mình."
---

> Phần SSH cần một máy chạy dịch vụ SSH. Để tự thực hành chỉ với một máy, bài này cho user `hocvien` trên máy `lab` SSH tới user `deploy` trên chính máy đó (qua `localhost`). Với máy chủ thật, chỉ cần thay `localhost` bằng IP hoặc tên máy chủ.

## Mật mã khoá công khai

SSH key và GPG cùng dựa trên **mật mã khoá công khai**: mỗi người có một cặp khoá.

| Khoá | Giữ ở đâu | Dùng để |
|---|---|---|
| **Khoá bí mật** (private key) | Chỉ trên máy của bạn, không đưa cho ai | Chứng minh "tôi là tôi", giải mã, ký |
| **Khoá công khai** (public key) | Đưa cho bất cứ ai, đặt lên server | Kiểm tra chữ ký, mã hoá gửi cho bạn |

Server giữ khoá công khai của bạn. Khi đăng nhập, server thách thức, và chỉ máy có khoá bí mật tương ứng mới trả lời đúng. Không có mật khẩu nào đi qua mạng, nên không thể bị dò hay nghe trộm.

## Tạo SSH key

```bash
ssh-keygen -t ed25519 -C "hocvien@lab"
```

```text
Generating public/private ed25519 key pair.
Your identification has been saved in /home/hocvien/.ssh/id_ed25519
Your public key has been saved in /home/hocvien/.ssh/id_ed25519.pub
The key fingerprint is:
SHA256:oNxrdNa1ZicnbqD/ctkUkL3im5xcX5iMvzONbI4NutM hocvien@lab
...
```

| Phần | Ý nghĩa |
|---|---|
| `-t ed25519` | Thuật toán Ed25519: ngắn, nhanh, an toàn. Dùng loại này. (`-t rsa -b 4096` cho máy rất cũ) |
| `-C "hocvien@lab"` | Chú thích, để nhận ra key là của ai, máy nào |
| `-f ~/.ssh/ten` | (Tuỳ chọn) tên file khác mặc định |
| Câu hỏi passphrase | Mật khẩu bảo vệ khoá bí mật. **Nên đặt**: lỡ mất file khoá, người khác cũng không dùng được |

```bash
ls -l ~/.ssh/
```

```text
-rw------- 1 hocvien hocvien  85 Nov 27 15:39 authorized_keys
-rw------- 1 hocvien hocvien 399 Nov 27 16:25 id_ed25519
-rw-r--r-- 1 hocvien hocvien  93 Nov 27 16:25 id_ed25519.pub
-rw-r--r-- 1 hocvien hocvien 142 Nov 27 16:24 known_hosts
```

| File | Là gì | Quyền |
|---|---|---|
| `id_ed25519` | **Khoá bí mật** | 600 |
| `id_ed25519.pub` | Khoá công khai, một dòng bắt đầu bằng `ssh-ed25519 AAAA...` | 644 |
| `authorized_keys` | Khoá công khai của những ai được đăng nhập vào user này | 600 |
| `known_hosts` | Khoá của các server đã từng kết nối | 644 |
| `config` | Cấu hình SSH phía máy khách | 600 |

## Đưa key lên server: ssh-copy-id

```bash
ssh-copy-id deploy@localhost
```

```text
/usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: "/home/hocvien/.ssh/id_ed25519.pub"
/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys

Number of key(s) added: 1

Now try logging into the machine, with:   "ssh 'deploy@localhost'"
and check to make sure that only the key(s) you wanted were added.
```

`ssh-copy-id` đăng nhập **bằng mật khẩu** (lần cuối), rồi thêm khoá công khai vào `~/.ssh/authorized_keys` của user `deploy` trên server, đặt đúng quyền. Từ giờ đăng nhập không cần mật khẩu:

```bash
ssh deploy@localhost 'whoami; hostname'
```

```text
deploy
lab
```

Server đã tắt đăng nhập bằng mật khẩu (nhiều máy chủ thuê làm vậy) thì không dùng được `ssh-copy-id`. Lúc đó dán nội dung file `.pub` vào `~/.ssh/authorized_keys` trên server bằng đường khác: console web, lúc tạo máy chủ ở trang của nhà cung cấp (ô "SSH key"), hoặc nhờ người đã có quyền.

### known_hosts: server có đúng là server không

Lần đầu kết nối tới một server, SSH hỏi:

```text
The authenticity of host '127.0.0.1 (127.0.0.1)' can't be established.
ED25519 key fingerprint is SHA256:uX7QZSbZxt/i+/ANsmHwynXOhf9lZf3sLWZvzKmCws4.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

So fingerprint này với fingerprint thật của server (lấy bằng lệnh ngay dưới, chạy trên server hoặc xem trong trang quản trị của nhà cung cấp máy chủ). Khớp thì mới gõ `yes`.

Trả lời `yes` thì khoá của server được lưu vào `~/.ssh/known_hosts`. Lần sau nếu khoá khác đi, SSH báo `REMOTE HOST IDENTIFICATION HAS CHANGED!` và từ chối kết nối, vì có thể có kẻ đứng giữa giả mạo server.

| Việc | Lệnh |
|---|---|
| Xem fingerprint thật của server (chạy trên server) | `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` |
| Xoá khoá cũ khi server **thật sự** được cài lại | `ssh-keygen -R tên-hoặc-IP` |
| Tìm một server trong known_hosts | `ssh-keygen -F tên` |

```text
256 SHA256:uX7QZSbZxt/i+/ANsmHwynXOhf9lZf3sLWZvzKmCws4 root@lab (ED25519)
```

## ~/.ssh/config: đặt tên tắt cho server

Thay vì gõ `ssh -i ~/.ssh/key -p 2200 deploy@203.0.113.10` mỗi lần:

```text
Host lab-deploy
    HostName localhost
    User deploy
    Port 22
    IdentityFile ~/.ssh/id_ed25519
```

```bash
chmod 600 ~/.ssh/config
ssh lab-deploy 'echo "đăng nhập bằng alias: $(whoami)"'
```

```text
đăng nhập bằng alias: deploy
```

| Dòng | Ý nghĩa |
|---|---|
| `Host lab-deploy` | Tên tắt, gõ `ssh lab-deploy` |
| `HostName` | IP hoặc tên miền thật |
| `User` | User đăng nhập |
| `Port` | Cổng SSH |
| `IdentityFile` | Khoá bí mật dùng cho server này |
| `ProxyJump bastion` | (Thêm) đi qua máy trung gian `bastion` |

Tên tắt dùng được cho mọi lệnh dựa trên SSH: `scp`, `rsync`, `git`.

## Chạy lệnh từ xa

```bash
ssh lab-deploy 'uptime -p; df -h / | tail -1'
```

```text
up 40 minutes
/dev/vda1        11G  2.0G  8.7G  19% /
```

Lệnh trong nháy chạy trên server, kết quả hiện ở máy bạn. Kết hợp vòng lặp để chạy trên nhiều server: `for s in web1 web2; do ssh "$s" 'uptime'; done`.

> Trong script, lệnh `ssh` sẽ đọc stdin của script. Đặt `ssh -n` (hoặc `< /dev/null`) khi `ssh` nằm trong vòng `while read`, nếu không nó "nuốt" mất các dòng còn lại.

## Chép file: scp và rsync

### scp

```bash
scp a.txt lab-deploy:/tmp/
scp lab-deploy:/etc/hostname ./hn.txt
scp -r web lab-deploy:~/
```

| Lệnh | Làm gì |
|---|---|
| `scp file server:đường-dẫn` | Chép từ máy mình lên server |
| `scp server:file đường-dẫn` | Chép từ server về máy mình |
| `-r` | Chép cả thư mục |
| `-P 2200` | Cổng SSH khác (chữ `P` hoa, khác `ssh -p`) |

### rsync: đồng bộ thông minh

```bash
rsync -avz web/ lab-deploy:~/web2/
rsync -avz --delete web/ lab-deploy:~/web2/
```

```text
sending incremental file list
deleting x.html
./
y.html

sent 184 bytes  received 56 bytes  160.00 bytes/sec
```

| Phần | Ý nghĩa |
|---|---|
| `-a` | Chế độ lưu trữ: đệ quy, giữ quyền, thời gian, symlink |
| `-v` | In các file được chép |
| `-z` | Nén khi truyền |
| `--delete` | Xoá file ở đích mà nguồn không còn (đích giống hệt nguồn) |
| `--dry-run` (hoặc `-n`) | Chạy thử, chỉ in sẽ làm gì. **Luôn thử trước khi dùng `--delete`** |
| `--exclude 'node_modules'` | Bỏ qua thư mục, file khớp mẫu |
| `web/` (có `/` cuối) | Chép **nội dung** của `web` vào đích |
| `web` (không `/`) | Chép **cả thư mục** `web` vào trong đích |

rsync chỉ gửi phần thay đổi: ví dụ trên chỉ có `y.html` mới được gửi và `x.html` bị xoá ở đích. rsync phải được cài ở **cả hai** máy.

## Đường hầm SSH (port forwarding)

Database trên server chỉ nghe `127.0.0.1:5432` (đúng như nên làm). Muốn kết nối từ máy mình mà không mở cổng ra Internet:

```bash
ssh -f -N -L 9100:127.0.0.1:9000 lab-deploy
curl -sI http://127.0.0.1:9100 | head -1
```

```text
HTTP/1.0 200 OK
```

| Phần | Ý nghĩa |
|---|---|
| `-L 9100:127.0.0.1:9000` | Mở cổng **9100 trên máy mình**. Kết nối vào đó được chuyển qua SSH tới `127.0.0.1:9000` **nhìn từ server** |
| `-N` | Không chạy lệnh nào, chỉ giữ đường hầm |
| `-f` | Chạy nền |
| `-R 8080:localhost:3000` | Ngược lại (remote): mở cổng 8080 trên server, chuyển về cổng 3000 trên máy mình |
| `-D 1080` | SOCKS proxy: duyệt web qua server |

Ví dụ thực tế: `ssh -N -L 5433:127.0.0.1:5432 db-server`, rồi dùng DBeaver hoặc `psql -h 127.0.0.1 -p 5433` trên máy mình.

## ssh-agent: nhập passphrase một lần

Key có passphrase thì mỗi lần dùng phải gõ. `ssh-agent` giữ khoá đã mở khoá trong bộ nhớ:

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
ssh-add -l
```

```text
Agent pid 5476
Identity added: /home/hocvien/.ssh/id_ed25519 (hocvien@lab)
256 SHA256:oNxrdNa1ZicnbqD/ctkUkL3im5xcX...
```

| Lệnh | Làm gì |
|---|---|
| `eval "$(ssh-agent -s)"` | Chạy agent và đặt biến môi trường để `ssh` tìm thấy nó |
| `ssh-add` | Thêm khoá (hỏi passphrase một lần) |
| `ssh-add -l` | Liệt kê khoá đang giữ |
| `ssh -A server` | Chuyển tiếp agent sang server (để từ server SSH tiếp mà không chép khoá lên). Chỉ dùng với server tin cậy |

Desktop Ubuntu, macOS có sẵn agent chạy cùng phiên đăng nhập.

## Lỗi hay gặp

| Lỗi | Nguyên nhân, cách sửa |
|---|---|
| `Permission denied (publickey)` | Server không có khoá công khai của bạn trong `authorized_keys`, sai user, hoặc quyền `~/.ssh` trên server sai (phải 700, `authorized_keys` 600). Gỡ lỗi bằng `ssh -v` |
| `WARNING: UNPROTECTED PRIVATE KEY FILE!` | Khoá bí mật để quyền quá rộng: `chmod 600 ~/.ssh/id_ed25519` |
| `REMOTE HOST IDENTIFICATION HAS CHANGED!` | Server được cài lại (thì `ssh-keygen -R`) hoặc có người giả mạo (thì dừng lại!) |
| `Connection refused` | sshd không chạy, sai cổng |
| `Connection timed out` | Tường lửa chặn, sai IP |

```text
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Permissions 0644 for '/home/hocvien/.ssh/id_ed25519' are too open.
It is required that your private key files are NOT accessible by others.
```

## Mã hoá và ký file bằng GPG

**GPG** (GNU Privacy Guard) mã hoá và ký file, email. Có sẵn trên hầu hết bản Linux (`gpg`). Trình quản lý gói cũng dùng GPG để kiểm tra gói tải về là thật.

### Mã hoá bằng mật khẩu (đối xứng)

Cách nhanh nhất để bảo vệ một file sao lưu:

```bash
gpg -c bimat.txt
file bimat.txt.gpg
gpg -d bimat.txt.gpg
```

```text
bimat.txt.gpg: PGP symmetric key encrypted data - AES with 256-bit key salted & iterated - SHA512 .
mat khau db: abc123
```

| Lệnh | Làm gì |
|---|---|
| `gpg -c file` | Mã hoá bằng mật khẩu (hỏi 2 lần), tạo `file.gpg` (**c** là symmetric) |
| `gpg -d file.gpg` | Giải mã ra màn hình. Thêm `-o file` để ghi ra file |

Nhớ xoá file gốc chưa mã hoá nếu không cần nữa.

### Cặp khoá GPG

```bash
gpg --full-generate-key
gpg --list-keys
```

```text
/home/hocvien/.gnupg/pubring.kbx
--------------------------------
pub   ed25519 2026-11-27 [SC] [expires: 2027-11-27]
      534793BCA2A3DC9F74DC58878B88E4C5F09EE8C4
uid           [ultimate] Hoc Vien <hocvien@lab.local>
sub   cv25519 2026-11-27 [E] [expires: 2027-11-27]
```

| Phần | Ý nghĩa |
|---|---|
| `pub ed25519 ... [SC]` | Khoá chính, dùng để ký (**S**ign) và chứng nhận (**C**ertify) |
| `534793BC...` | Fingerprint, mã định danh của khoá |
| `uid` | Tên và email của chủ khoá |
| `sub cv25519 ... [E]` | Khoá phụ để mã hoá (**E**ncrypt) |
| `[expires: ...]` | Ngày hết hạn |

`--full-generate-key` hỏi từng bước: loại khoá (chọn mặc định), thời hạn, tên, email, passphrase.

| Việc | Lệnh |
|---|---|
| Xuất khoá công khai để gửi người khác | `gpg --armor --export email > khoa.asc` |
| Nhập khoá công khai của người khác | `gpg --import khoa-cua-ho.asc` |
| Mã hoá gửi người nhận | `gpg -e -r email-nguoi-nhan file` |
| Giải mã (bằng khoá bí mật của mình) | `gpg -d file.gpg` |
| Ký tách rời | `gpg --detach-sign -a file` → `file.asc` |
| Kiểm tra chữ ký | `gpg --verify file.asc file` |

### Ký và kiểm tra chữ ký

```bash
gpg --detach-sign -a bimat.txt
gpg --verify bimat.txt.asc bimat.txt
```

```text
gpg: Signature made Fri Nov 27 16:26:57 2026 +07
gpg:                using EDDSA key 534793BCA2A3DC9F74DC58878B88E4C5F09EE8C4
gpg: Good signature from "Hoc Vien <hocvien@lab.local>" [ultimate]
```

Sửa file một chút rồi kiểm tra lại:

```text
gpg: BAD signature from "Hoc Vien <hocvien@lab.local>" [ultimate]
```

Chữ ký chứng minh file **do bạn tạo** và **không bị sửa**. Phần mềm phát hành kèm file `.asc` hoặc `.sig` để người dùng kiểm tra như vậy.

## Thực hành

1. Tạo SSH key Ed25519 có passphrase. Xem nội dung khoá công khai. Kiểm tra quyền của hai file.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ssh-keygen -t ed25519 -C "$(whoami)@$(hostname)"
   cat ~/.ssh/id_ed25519.pub
   ls -l ~/.ssh/
   ```

   </details>

2. Tạo user `deploy` có mật khẩu, đưa khoá của bạn lên bằng `ssh-copy-id deploy@localhost` (nếu server tắt mật khẩu, tạm thêm `PasswordAuthentication yes` vào một file trong `/etc/ssh/sshd_config.d/` và `reload ssh`). Đăng nhập lại không cần mật khẩu.

3. Tạo mục `Host` trong `~/.ssh/config` để `ssh lab-deploy` đăng nhập được. Dùng nó để chạy `df -h` từ xa, chép một thư mục lên bằng `rsync`, rồi sửa một file và chạy lại `rsync` để thấy chỉ file đó được gửi.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ssh lab-deploy 'df -h /'
   rsync -avz ~/web/ lab-deploy:~/web/
   echo moi >> ~/web/index.html
   rsync -avz ~/web/ lab-deploy:~/web/
   ```

   Lần chạy thứ hai chỉ liệt kê `index.html`.

   </details>

4. Mở đường hầm để truy cập một web server chỉ nghe `127.0.0.1:9000` trên máy chủ từ cổng 9100 của máy bạn.

   <details>
   <summary>Xem đáp án</summary>

   Trên máy chủ: `python3 -m http.server 9000 --bind 127.0.0.1`. Trên máy bạn: `ssh -N -L 9100:127.0.0.1:9000 tên-máy-chủ`, rồi mở `http://127.0.0.1:9100`.

   </details>

5. Mã hoá file `~/.env` bằng mật khẩu với GPG, xoá file gốc, rồi giải mã lại.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   gpg -c ~/.env
   rm ~/.env
   gpg -o ~/.env -d ~/.env.gpg
   cat ~/.env
   ```

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Tạo SSH key | `ssh-keygen -t ed25519 -C "ghi chú"` |
| Đưa key lên server | `ssh-copy-id user@server` |
| Tên tắt cho server | `~/.ssh/config` (`Host`, `HostName`, `User`, `Port`, `IdentityFile`) |
| Chạy lệnh từ xa | `ssh server 'lệnh'` |
| Chép file | `scp file server:đường`, `scp -r thư-mục server:` |
| Đồng bộ thư mục | `rsync -avz --delete nguồn/ server:đích/` (thử với `-n` trước) |
| Đường hầm | `ssh -N -L cổng-mình:127.0.0.1:cổng-server server` |
| Giữ khoá đã mở | `eval "$(ssh-agent -s)"`, `ssh-add` |
| Quyền đúng | `~/.ssh` 700, khoá bí mật 600, `authorized_keys` 600 |
| Mã hoá bằng mật khẩu | `gpg -c file`, `gpg -d file.gpg` |
| Ký / kiểm tra | `gpg --detach-sign -a file`, `gpg --verify file.asc file` |
