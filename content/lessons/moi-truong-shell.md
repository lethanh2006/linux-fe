---
summary: Biến môi trường (HOME, PATH, PS1…) và cách shell tìm chương trình qua PATH, alias và hàm để gõ lệnh ngắn hơn, các file cấu hình được đọc khi mở shell (.bashrc, .profile, /etc/profile) và sự khác nhau giữa login shell với non-login shell.
minutes: 35
commands: [env, export, unset, set, PATH, alias, unalias, source, .bashrc, .profile, /etc/profile, /etc/skel]
quiz:
  - q: Gõ chao thì báo command not found, dù file ~/bin/chao có sẵn và có quyền chạy. Vì sao?
    options: ["File bị hỏng", "Thư mục ~/bin không nằm trong biến PATH", "Phải là root", "Tên lệnh không được có chữ a"]
    answer: 1
    explain: "Shell chỉ tìm chương trình trong các thư mục ghi trong `PATH`. Chạy bằng đường dẫn (`~/bin/chao`) thì được, hoặc thêm `export PATH=\"$HOME/bin:$PATH\"`."
  - q: Thêm dòng export JAVA_HOME=... vào ~/.bashrc, nhưng terminal đang mở chưa thấy biến. Làm gì?
    options: ["Khởi động lại máy", "source ~/.bashrc (hoặc mở terminal mới)", "chmod +x ~/.bashrc", "export ~/.bashrc"]
    answer: 1
    explain: "`.bashrc` chỉ được đọc khi shell mới mở. `source ~/.bashrc` (hoặc `. ~/.bashrc`) chạy lại file đó ngay trong shell hiện tại."
  - q: "Alias `alias ll='ls -alF'` được lưu ở đâu để còn sau khi đóng terminal?"
    options: ["Tự động lưu", "Trong ~/.bashrc", "Trong /etc/passwd", "Trong ~/.bash_history"]
    answer: 1
    explain: "Alias gõ ở dấu nhắc chỉ sống trong shell hiện tại. Muốn giữ thì ghi vào `~/.bashrc` (Ubuntu còn đọc thêm `~/.bash_aliases` nếu có)."
  - q: Khi đăng nhập qua SSH, bash đọc file nào trước?
    options: ["Chỉ ~/.bashrc", "/etc/profile rồi ~/.profile (và trong đó gọi ~/.bashrc)", "/etc/bash.bashrc", "Không đọc file nào"]
    answer: 1
    explain: "SSH mở login shell: đọc `/etc/profile`, rồi file đầu tiên tìm thấy trong `~/.bash_profile`, `~/.bash_login`, `~/.profile`. Trên Ubuntu, `~/.profile` lại gọi `~/.bashrc`."
  - q: Tạo user mới bằng useradd -m, file .bashrc của user đó lấy từ đâu?
    options: ["Tạo rỗng", "Chép từ /etc/skel", "Chép từ /root", "Tải từ mạng"]
    answer: 1
    explain: "`/etc/skel` là thư mục mẫu. Mọi thứ trong đó được chép vào home của user mới. Muốn mọi user mới có sẵn một cấu hình thì đặt vào đây."
---

## Biến môi trường

[bài 7](/bai/terminal-va-cu-phap) đã giới thiệu biến và `export`. Một số biến môi trường có sẵn quyết định cách shell và chương trình hoạt động:

| Biến | Ý nghĩa | Ví dụ |
|---|---|---|
| `HOME` | Thư mục home | `/home/hocvien` |
| `USER` | Tên user đăng nhập | `hocvien` |
| `SHELL` | Shell đăng nhập | `/bin/bash` |
| `PATH` | Danh sách thư mục để tìm chương trình | `/usr/local/bin:/usr/bin:/bin` |
| `PWD`, `OLDPWD` | Thư mục hiện tại / trước đó | |
| `PS1` | Mẫu của dấu nhắc lệnh | `\u@\h:\w\$ ` |
| `EDITOR` | Trình soạn thảo mặc định | `vim` |
| `LANG` | Ngôn ngữ và bảng mã ([bài mở rộng 21](/bai/ngon-ngu-mui-gio)) | `en_US.UTF-8` |
| `HISTSIZE` | Số lệnh lịch sử giữ trong bộ nhớ | `1000` |

| Lệnh | Làm gì |
|---|---|
| `env` (hoặc `printenv`) | In các biến **môi trường** (sẽ truyền cho chương trình con) |
| `set` | In **mọi** biến của shell, kể cả biến chưa export và các hàm |
| `export TEN=giatri` | Tạo biến môi trường |
| `unset TEN` | Xoá biến |
| `TEN=giatri lệnh` | Đặt biến **chỉ cho một lệnh**, ví dụ `LANG=C ls --help` |
| `env -i lệnh` | Chạy lệnh với môi trường rỗng (để thử môi trường tối thiểu, như cron) |

## PATH: shell tìm chương trình ở đâu

Gõ `ls`, shell không tìm khắp ổ đĩa. Nó lần lượt xem các thư mục trong `PATH` (cách nhau bằng dấu `:`), gặp `ls` ở đâu trước thì chạy cái đó:

```bash
echo "$PATH" | tr ':' '\n'
```

```text
/usr/local/sbin
/usr/local/bin
/usr/sbin
/usr/bin
/sbin
/bin
```

`/usr/local/bin` đứng trước `/usr/bin`, nên chương trình bạn tự cài vào `/usr/local/bin` được ưu tiên hơn bản của hệ thống cùng tên. Xem lệnh sẽ chạy bản nào: `type -a ls` hoặc `which ls`.

Thư mục hiện tại (`.`) **không** nằm trong PATH (vì lý do bảo mật). Đó là lý do phải gõ `./script.sh` thay vì `script.sh`.

### Thêm thư mục vào PATH

```bash
mkdir -p ~/bin
printf '#!/bin/bash\necho "xin chao tu ~/bin"\n' > ~/bin/chao
chmod +x ~/bin/chao
chao
export PATH="$HOME/bin:$PATH"
chao
```

```text
bash: chao: command not found
xin chao tu ~/bin
```

| Phần | Ý nghĩa |
|---|---|
| `export PATH="$HOME/bin:$PATH"` | PATH mới = `~/bin` + `:` + PATH cũ. Thư mục mới đứng đầu nên được tìm trước |
| Dấu nháy kép | Giữ nguyên nếu đường dẫn có dấu cách |

> **Đừng viết `export PATH=$HOME/bin`** (thiếu `:$PATH`). Như vậy là thay hẳn PATH, và mọi lệnh như `ls`, `cat` đều thành `command not found` trong shell đó. Lỡ làm thì mở terminal mới là xong.

Trên Ubuntu, `~/.profile` đã có sẵn đoạn tự thêm `~/bin` và `~/.local/bin` vào PATH nếu thư mục tồn tại (có hiệu lực từ lần đăng nhập sau):

```text
if [ -d "$HOME/bin" ] ; then
    PATH="$HOME/bin:$PATH"
fi
```

## Alias: tên tắt cho lệnh

```bash
alias
alias ll2='ls -lh'
type ll2
unalias ll2
```

```text
alias grep='grep --color=auto'
alias l='ls -CF'
alias la='ls -A'
alias ll='ls -alF'
alias ls='ls --color=auto'
...
ll2 is aliased to `ls -lh'
```

| Lệnh | Làm gì |
|---|---|
| `alias` | Liệt kê alias đang có |
| `alias ten='lệnh'` | Tạo alias. Không có dấu cách quanh `=`, lệnh đặt trong nháy |
| `unalias ten` | Xoá alias |
| `\ls` | Chạy lệnh gốc, bỏ qua alias (dấu `\` phía trước) |

Alias hay dùng: `alias ..='cd ..'`, `alias rm='rm -i'` (hỏi trước khi xoá), `alias k='kubectl'`. Alias chỉ có tác dụng trong shell tương tác, không có tác dụng trong script.

## Hàm: khi alias không đủ

Alias không nhận tham số ở giữa câu lệnh. Muốn làm nhiều bước hoặc dùng tham số, viết **hàm**:

```bash
mkcd() { mkdir -p "$1" && cd "$1"; }
mkcd /tmp/abc/xyz
pwd
```

```text
/tmp/abc/xyz
```

| Phần | Ý nghĩa |
|---|---|
| `mkcd()` | Tên hàm |
| `{ ...; }` | Thân hàm. Cần dấu cách sau `{` và dấu `;` trước `}` khi viết trên một dòng |
| `$1` | Tham số thứ nhất truyền vào hàm |

Hàm học kỹ ở [bài mở rộng 13](/bai/bash-mang-va-ham).

## Các file cấu hình của bash

Khi mở shell, bash đọc một số file để đặt biến, alias, hàm. File nào được đọc phụ thuộc loại shell:

| Loại | Khi nào | Đọc |
|---|---|---|
| **Login shell** | Đăng nhập qua SSH, console, `su -`, `bash -l` | `/etc/profile` (và `/etc/profile.d/*.sh`), rồi file **đầu tiên** tìm thấy trong `~/.bash_profile`, `~/.bash_login`, `~/.profile` |
| **Non-login, tương tác** | Mở thêm terminal trong giao diện đồ hoạ, gõ `bash` | `/etc/bash.bashrc`, rồi `~/.bashrc` |
| **Không tương tác** | Chạy script | Không đọc file nào (trừ khi biến `BASH_ENV` chỉ định) |
| Khi thoát login shell | `exit` | `~/.bash_logout` |

Trên Ubuntu, `~/.profile` có đoạn gọi `~/.bashrc`. Vì vậy, trên thực tế:

| Muốn | Ghi vào |
|---|---|
| Alias, hàm, dấu nhắc, tuỳ chọn shell | `~/.bashrc` |
| Biến môi trường như `PATH`, `EDITOR` | `~/.profile` (hoặc `~/.bashrc` cũng được, cho đơn giản) |
| Cho **mọi** user | `/etc/profile.d/tên.sh` (đừng sửa thẳng `/etc/profile`) |
| Cho mọi user **mới tạo** | `/etc/skel/` |

Kiểm tra đang ở login shell hay không:

```bash
bash -lc 'shopt -q login_shell && echo login || echo non-login'
bash -c 'shopt -q login_shell && echo login || echo non-login'
```

```text
login
non-login
```

### source: áp dụng ngay

Sửa `.bashrc` xong, shell đang mở **chưa** biết gì. Chạy lại file trong shell hiện tại:

```bash
echo 'export TEST_VAR=123' >> ~/.bashrc
echo "[$TEST_VAR]"
source ~/.bashrc
echo "[$TEST_VAR]"
```

```text
[]
[123]
```

`source file` (viết ngắn: `. file`) chạy các lệnh trong file **ngay trong shell hiện tại**. Khác với `bash file` (chạy trong shell con, biến tạo ra mất khi shell con kết thúc).

### /etc/skel: mẫu cho user mới

```bash
ls -A /etc/skel
```

```text
.bash_logout
.bashrc
.profile
```

`useradd -m` chép mọi thứ trong `/etc/skel` vào home của user mới ([bài 27](/bai/lenh-quan-ly-nguoi-dung)).

## Dấu nhắc lệnh PS1

```text
${debian_chroot:+($debian_chroot)}\u@\h:\w\$
```

| Ký hiệu | Hiện ra |
|---|---|
| `\u` | Tên user |
| `\h` | Tên máy |
| `\w` | Thư mục hiện tại (`~` cho home) |
| `\$` | `$` cho user thường, `#` cho root |
| `\t` | Giờ hiện tại |

Thử: `PS1='[\t] \u@\h:\w\$ '`. Trên server production, nhiều người cho dấu nhắc màu đỏ để luôn nhớ là đang ở máy thật.

## Lịch sử lệnh

| Biến | Ý nghĩa | Ubuntu mặc định |
|---|---|---|
| `HISTSIZE` | Số lệnh giữ trong bộ nhớ | 1000 |
| `HISTFILESIZE` | Số dòng giữ trong `~/.bash_history` | 2000 |
| `HISTCONTROL` | `ignoredups` bỏ lệnh trùng liền nhau, `ignorespace` không lưu lệnh bắt đầu bằng dấu cách, `ignoreboth` là cả hai | `ignoreboth` |

Mẹo bảo mật: gõ một dấu cách trước lệnh có mật khẩu để lệnh đó không được lưu vào lịch sử.

## Thực hành

1. In giá trị của `HOME`, `SHELL`, `PATH`. Đếm xem PATH có bao nhiêu thư mục.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   echo "$HOME $SHELL"
   echo "$PATH" | tr ':' '\n' | wc -l
   ```

   </details>

2. Tạo script `~/bin/homnay` in ngày hôm nay, cho chạy được, và làm cho gõ `homnay` ở bất kỳ đâu cũng chạy. Giữ lại sau khi mở terminal mới.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   mkdir -p ~/bin
   printf '#!/bin/bash\ndate +"Hom nay: %%d/%%m/%%Y"\n' > ~/bin/homnay
   chmod +x ~/bin/homnay
   echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
   source ~/.bashrc
   homnay
   ```

   Trong `printf`, `%%` in ra một dấu `%`.

   </details>

3. Tạo alias `ports` chạy `ss -tlnp` và alias `cls` chạy `clear`, lưu vĩnh viễn.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   echo "alias ports='ss -tlnp'" >> ~/.bashrc
   echo "alias cls='clear'" >> ~/.bashrc
   source ~/.bashrc
   type ports cls
   ```

   </details>

4. Viết hàm `bak` tạo bản sao lưu của một file kèm ngày, ví dụ `bak nginx.conf` tạo `nginx.conf.2026-11-27.bak`. Lưu vào `.bashrc`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   echo 'bak() { cp -a "$1" "$1.$(date +%F).bak"; }' >> ~/.bashrc
   source ~/.bashrc
   touch thu.conf && bak thu.conf && ls thu.conf*
   ```

   </details>

5. Chạy `env -i bash -c 'echo $PATH; echo $HOME'`. Vì sao `HOME` rỗng? Điều này liên quan gì tới cron?

   <details>
   <summary>Xem đáp án</summary>

   `env -i` xoá sạch môi trường, bash chỉ tự đặt một PATH mặc định. Cron cũng chạy job với môi trường tối thiểu như vậy, nên script chạy tay thì được mà chạy bằng cron lại lỗi ([bài mở rộng 18](/bai/lap-lich-cong-viec)).

   </details>

## Tóm tắt

| Việc | Lệnh / file |
|---|---|
| Xem biến môi trường | `env`, `echo $TEN` |
| Thêm thư mục vào PATH | `export PATH="$HOME/bin:$PATH"` |
| Tạo / xoá alias | `alias ten='lệnh'` / `unalias ten` |
| Áp dụng `.bashrc` ngay | `source ~/.bashrc` |
| Cấu hình cho mình / cho mọi user / user mới | `~/.bashrc`, `~/.profile` / `/etc/profile.d/*.sh` / `/etc/skel/` |
| Login shell đọc | `/etc/profile` → `~/.profile` (→ `~/.bashrc`) |
