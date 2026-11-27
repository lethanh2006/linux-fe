---
summary: Đổi quyền bằng chmod theo hai cách (ký hiệu u+x, o-rwx và số 755, 740), đổi chủ bằng chown, đổi nhóm bằng chgrp, và áp cho cả thư mục bằng -R.
minutes: 35
commands: [chmod, chown, chgrp, chmod -R]
quiz:
  - q: "Lệnh nào cho chủ file thêm quyền chạy?"
    options: ["chmod u+x file", "chmod o+x file", "chmod u-x file", "chown +x file"]
    answer: 0
    explain: "`u` là chủ, `+` là thêm, `x` là quyền chạy."
  - q: "Chủ đủ quyền, nhóm chỉ đọc, người khác không có gì. Dạng số là?"
    options: ["754", "640", "740", "700"]
    answer: 2
    explain: "rwx = 7, r-- = 4, --- = 0. Dạng ký hiệu: `chmod u=rwx,g=r,o= file`."
  - q: "Người dùng thường gõ `chown an rs.txt` (không sudo) thì sao?"
    options: ["Đổi chủ thành an", "Báo Operation not permitted", "Đổi nhóm thành an", "Xoá file"]
    answer: 1
    explain: Chỉ root mới đổi được chủ của file. Dùng `sudo chown`.
  - q: "`chmod o= file` làm gì?"
    options: ["Cho người khác mọi quyền", "Bỏ hết quyền của người khác", "Giữ nguyên", "Báo lỗi"]
    answer: 1
    explain: "`=` gán đúng các quyền ghi sau nó. Sau `=` không có gì nghĩa là không có quyền nào."
  - q: "Muốn đổi chủ của thư mục `duan` và mọi thứ bên trong thì thêm tuỳ chọn nào?"
    options: ["-a", "-f", "-r", "-R"]
    answer: 3
    explain: "`chmod`, `chown`, `chgrp` dùng `-R` (chữ R hoa) để áp cho cả thư mục con."
---

> Bài này đi theo video TITV bài 31.

Ba lệnh của bài:

| Lệnh | Đổi gì | Ai được dùng |
|---|---|---|
| `chmod` | Quyền `rwx` (**ch**ange **mod**e) | Chủ file hoặc root |
| `chown` | Chủ sở hữu (**ch**ange **own**er) | Chỉ root |
| `chgrp` | Nhóm sở hữu (**ch**ange **gr**ou**p**) | Root, hoặc chủ file đổi sang nhóm mình là thành viên |

Cả ba có `-R` để áp cho thư mục và mọi thứ bên trong.

Chuẩn bị:

```bash
mkdir -p ~/thuchanh/bai31 && cd ~/thuchanh/bai31
touch rs.txt "file 1.txt" && printf '#!/bin/bash\necho "Xin chao tu script"\n' > chao.sh
ls -l
```

```text
total 4
-rw-r--r-- 1 hocvien hocvien 38 Nov 27 19:50  chao.sh
-rw-r--r-- 1 hocvien hocvien  0 Nov 27 19:50 'file 1.txt'
-rw-r--r-- 1 hocvien hocvien  0 Nov 27 19:50  rs.txt
```

`ls` tự đặt tên có dấu cách trong nháy đơn (`'file 1.txt'`) cho dễ nhìn; tên thật không có dấu nháy. `chao.sh` là một script nhỏ, in một câu chào.

## chmod dạng ký hiệu

```text
chmod [ai][phép][quyền] file
```

| Phần | Giá trị |
|---|---|
| Ai | `u` chủ, `g` nhóm, `o` người khác, `a` tất cả. Không ghi thì là `a` |
| Phép | `+` thêm, `-` bớt, `=` gán đúng bằng |
| Quyền | `r`, `w`, `x` |

### Cho script chạy được

```bash
./chao.sh
chmod u+x chao.sh
ls -l chao.sh
./chao.sh
```

```text
bash: ./chao.sh: Permission denied
-rwxr--r-- 1 hocvien hocvien 38 Nov 27 19:50 chao.sh
Xin chao tu script
```

File chưa có `x` thì không chạy được. Thêm `x` cho chủ là chạy được. `./` nghĩa là "file nằm ở thư mục hiện hành" (bài 17).

### Thêm, bớt, gán

```bash
chmod g+w rs.txt
ls -l rs.txt
chmod o-rwx rs.txt
ls -l rs.txt
chmod a+rw rs.txt
ls -l rs.txt
chmod ug+x,o= rs.txt
ls -l rs.txt
```

```text
-rw-rw-r-- 1 hocvien hocvien 0 Nov 27 19:50 rs.txt
-rw-rw---- 1 hocvien hocvien 0 Nov 27 19:50 rs.txt
-rw-rw-rw- 1 hocvien hocvien 0 Nov 27 19:50 rs.txt
-rwxrwx--- 1 hocvien hocvien 0 Nov 27 19:50 rs.txt
```

| Lệnh | Ý nghĩa |
|---|---|
| `g+w` | Nhóm được ghi thêm |
| `o-rwx` | Người khác mất hết quyền |
| `a+rw` | Mọi người được đọc, ghi |
| `ug+x,o=` | Chủ và nhóm được chạy thêm; người khác gán bằng rỗng, tức không còn gì. Nhiều thay đổi ngăn bằng dấu phẩy, không có dấu cách |

Một vài cách viết khác: `+x` (mọi người được chạy), `ug+r` (chủ và nhóm được đọc), `o=x` (người khác chỉ được chạy).

## chmod dạng số

Dùng số ba chữ số như bài 30 (r = 4, w = 2, x = 1). Dạng số **gán lại toàn bộ** quyền, không cộng thêm vào quyền cũ:

```bash
chmod 777 "file 1.txt"
ls -l "file 1.txt"
chmod 700 "file 1.txt"
ls -l "file 1.txt"
```

```text
-rwxrwxrwx 1 hocvien hocvien 0 Nov 27 19:50 'file 1.txt'
-rwx------ 1 hocvien hocvien 0 Nov 27 19:50 'file 1.txt'
```

Tên có dấu cách phải đặt trong nháy. File không phải của mình thì cần `sudo`.

> `777` cho mọi người toàn quyền: gần như không bao giờ nên dùng thật. Gặp lỗi quyền, hãy tìm ra ai cần quyền gì, đừng "chữa cháy" bằng `chmod 777`.

### Thử thách trong video

`rs.txt`: chủ đủ quyền, nhóm chỉ đọc, người khác không có quyền gì. Hai cách:

```bash
chmod u=rwx,g=r,o= rs.txt
chmod 740 rs.txt
stat -c "%a %A" rs.txt
```

```text
740 -rwxr-----
```

## chown: đổi chủ

```text
chown [tuỳ chọn] chủ-mới[:nhóm-mới] file
```

```bash
chown an rs.txt
sudo chown an rs.txt
ls -l rs.txt
```

```text
chown: changing ownership of 'rs.txt': Operation not permitted
-rwxr----- 1 an hocvien 0 Nov 27 19:50 rs.txt
```

Người dùng thường không được "tặng" file cho người khác, nên phải dùng `sudo`. Sau lệnh, chủ là `an`, nhóm vẫn là `hocvien`.

Đổi cả chủ lẫn nhóm một lần bằng `chủ:nhóm`:

```bash
sudo chown hocvien:hocvien rs.txt "file 1.txt"
```

## chgrp: đổi nhóm

```bash
sudo chgrp chau "file 1.txt"
ls -l "file 1.txt"
sudo chgrp khongco "file 1.txt"
```

```text
-rwx------ 1 hocvien chau 0 Nov 27 19:50 'file 1.txt'
chgrp: invalid group: ‘khongco’
```

Nhóm phải có sẵn trong `/etc/group`. Tên tài khoản không phải lúc nào cũng là tên nhóm: tài khoản tạo bằng `useradd -g marketing` (bài 29) không có nhóm riêng trùng tên.

## -R: áp cho cả thư mục

```bash
mkdir -p duan/src && touch duan/a.txt duan/src/b.txt
chmod -R o-rwx duan
ls -lR duan
```

```text
duan:
total 4
-rw-r----- 1 hocvien hocvien    0 Nov 27 19:50 a.txt
drwxr-x--- 2 hocvien hocvien 4096 Nov 27 19:50 src

duan/src:
total 0
-rw-r----- 1 hocvien hocvien 0 Nov 27 19:50 b.txt
```

Mọi file, thư mục bên trong đều mất quyền của người khác. Tiếp theo, giao cả thư mục cho `an`:

```bash
sudo chown -R an:an duan
ls -l duan
```

```text
ls: cannot open directory 'duan': Permission denied
```

`duan` giờ của `an`, nhóm `an`, người khác không có quyền gì; `hocvien` thành "người khác" nên không xem được nữa. Trả lại: `sudo chown -R hocvien:hocvien duan`.

> **Cẩn thận với `-R`:** gõ nhầm đường dẫn, ví dụ `sudo chmod -R 777 /` hay `sudo chown -R an /etc`, có thể làm hỏng cả hệ thống. Chỉ dùng `-R` trong thư mục của bạn, và đọc lại lệnh trước khi bấm Enter.

## Mở rộng (chuẩn LPIC-1)

| Lệnh | Ý nghĩa |
|---|---|
| `chmod u+s file`, `chmod 4755 file` | Bật SUID: chạy với quyền của chủ file |
| `chmod g+s thư-mục` | Bật SGID trên thư mục: file mới tạo bên trong thuộc nhóm của thư mục |
| `chmod +t thư-mục`, `chmod 1777` | Sticky bit: chỉ chủ file mới xoá được file của mình (như `/tmp`) |
| `chmod -R u=rwX,go=rX thư-mục` | `X` hoa: chỉ thêm `x` cho thư mục (và file vốn đã có `x`), không biến mọi file thành chạy được |
| `chown :nhóm file` | Chỉ đổi nhóm, giống `chgrp` |
| `chmod --reference=mau file` | Lấy quyền giống file mẫu |

Ba quyền đặc biệt đầu bảng được học kỹ ở bài Quyền đặc biệt (phần mở rộng).

## Thực hành

1. Tạo file `bimat.txt`, đặt quyền để chỉ mình bạn đọc, ghi được. Dùng cả hai cách.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   touch bimat.txt
   chmod 600 bimat.txt
   chmod u=rw,go= bimat.txt
   ls -l bimat.txt
   ```

   Kết quả `-rw-------`.

   </details>

2. Tạo thư mục `chung`, cho nhóm của bạn được tạo và xoá file bên trong, người khác chỉ được xem danh sách và vào.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   mkdir chung
   chmod 775 chung
   ls -ld chung
   ```

   `775` = `rwxrwxr-x`: nhóm có `w` để tạo, xoá file bên trong; người khác có `r-x`.

   </details>

3. Viết lệnh `chmod` dạng ký hiệu tương đương `chmod 754 file`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   chmod u=rwx,g=rx,o=r file
   ```

   </details>

4. Giao file `rs.txt` cho tài khoản `an` và nhóm `sudo` bằng một lệnh, kiểm tra, rồi trả lại cho bạn.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo chown an:sudo rs.txt
   ls -l rs.txt
   sudo chown $USER:$USER rs.txt
   ```

   </details>

## Tóm tắt

| Lệnh | Làm gì |
|---|---|
| `chmod u+x file` | Thêm quyền chạy cho chủ |
| `chmod go-w file` | Bớt quyền ghi của nhóm và người khác |
| `chmod u=rwx,g=r,o= file` | Gán đúng quyền cho từng đối tượng |
| `chmod 740 file` | Gán quyền dạng số |
| `sudo chown chủ file` | Đổi chủ |
| `sudo chown chủ:nhóm file` | Đổi cả chủ và nhóm |
| `chgrp nhóm file` | Đổi nhóm |
| `-R` | Áp cho thư mục và mọi thứ bên trong |
