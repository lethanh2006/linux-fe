---
summary: Đọc bộ quyền rwx của chủ, nhóm và người khác; hiểu quyền trên file khác quyền trên thư mục ra sao; đổi quyền bằng chmod (dạng chữ và dạng số), đổi chủ bằng chown, chgrp; và quyền mặc định khi tạo file (umask).
minutes: 50
commands: [chmod, chown, chgrp, umask, stat, ls -l]
quiz:
  - q: "File có quyền `-rw-r-----`. Ai đọc được file này?"
    options: ["Chỉ chủ file", "Chủ file và các thành viên nhóm sở hữu file", "Mọi người", "Không ai"]
    answer: 1
    explain: "Chia 3 nhóm: chủ `rw-` (đọc, ghi), nhóm `r--` (đọc), người khác `---` (không gì). Dạng số là 640."
  - q: "`chmod 755 deploy.sh` cho ra bộ quyền nào?"
    options: ["rwxr-xr-x", "rw-r--r--", "rwxrwxrwx", "rwx------"]
    answer: 0
    explain: "7 = 4+2+1 = rwx cho chủ, 5 = 4+1 = r-x cho nhóm và cho người khác. 755 là quyền điển hình của script và thư mục."
  - q: "Thư mục có quyền `r--` (có r, không có x) với bạn. Bạn làm được gì?"
    options: ["Vào thư mục và đọc file bên trong", "Chỉ xem được danh sách tên file, không vào được, không đọc được file", "Tạo file mới", "Không làm được gì kể cả xem tên"]
    answer: 1
    explain: "Với thư mục, `r` là được liệt kê tên, `x` là được đi vào và truy cập file bên trong, `w` là được tạo, xoá, đổi tên file. Có r mà không có x thì chỉ thấy tên."
  - q: "Muốn xoá một file, bạn cần quyền gì?"
    options: ["Quyền w trên chính file đó", "Quyền w (và x) trên thư mục chứa file", "Quyền r trên file", "Phải là chủ file"]
    answer: 1
    explain: Xoá file là sửa danh sách tên trong thư mục, nên cần quyền ghi trên thư mục. Quyền của chính file không liên quan. Đây là lý do có sticky bit ở bài sau.
  - q: "umask là 022. File mới tạo bằng touch có quyền gì?"
    options: ["777", "755", "644", "022"]
    answer: 2
    explain: "File mới bắt đầu từ 666 (không bao giờ tự có x), bỏ đi các bit trong umask 022, còn 644 (rw-r--r--). Thư mục bắt đầu từ 777 nên còn 755."
  - q: User thường có đổi chủ file của mình sang user khác bằng chown được không?
    options: ["Được", "Không, chỉ root mới đổi chủ được", "Được nếu file rỗng", "Được nếu dùng -R"]
    answer: 1
    explain: "`chown` sang user khác cần quyền root (`Operation not permitted` nếu không có). User thường chỉ được `chgrp` file của mình sang một nhóm mà chính họ là thành viên."
---

## Ba nhóm người, ba loại quyền

Mỗi file và thư mục có **một chủ** (user) và **một nhóm**. Quyền được chia cho ba nhóm người:

| Ký hiệu | Ai | Ghi chú |
|---|---|---|
| `u` (user) | Chủ file | Người tạo file, trừ khi đổi bằng `chown` |
| `g` (group) | Thành viên nhóm sở hữu file | |
| `o` (others) | Mọi người còn lại | |
| `a` (all) | Cả ba nhóm trên | Chỉ dùng trong lệnh `chmod` |

Mỗi nhóm người có ba quyền:

| Quyền | Chữ | Số | Với file | Với thư mục |
|---|---|---|---|---|
| Đọc | `r` | 4 | Xem nội dung | Liệt kê tên các file bên trong (`ls`) |
| Ghi | `w` | 2 | Sửa nội dung | **Tạo, xoá, đổi tên** file bên trong |
| Chạy | `x` | 1 | Chạy như chương trình hoặc script | **Đi vào** (`cd`) và truy cập file bên trong |

Kiểm tra quyền theo thứ tự: nếu bạn là chủ thì dùng quyền `u`, nếu không thì xét nhóm, nếu cũng không thì dùng quyền `o`. Chỉ một bộ được áp dụng. **root bỏ qua** mọi kiểm tra quyền đọc và ghi.

## Đọc quyền trong ls -l

```bash
cd ~
echo "echo xin chao" > chao.sh
ls -l chao.sh
```

```text
-rw-r--r-- 1 hocvien hocvien 14 Nov 27 15:15 chao.sh
```

Tách chuỗi `-rw-r--r--`:

| Vị trí | Giá trị | Ý nghĩa |
|---|---|---|
| 1 | `-` | Loại: file thường (`d` thư mục, `l` link) |
| 2–4 | `rw-` | Chủ (`hocvien`): đọc, ghi, không chạy |
| 5–7 | `r--` | Nhóm (`hocvien`): chỉ đọc |
| 8–10 | `r--` | Người khác: chỉ đọc |

Chưa có quyền `x` nên chưa chạy được:

```bash
./chao.sh
```

```text
bash: ./chao.sh: Permission denied
```

Xem quyền dạng số bằng `stat`:

```bash
stat -c "%a %A %n" chao.sh
```

```text
644 -rw-r--r-- chao.sh
```

## chmod dạng chữ

```bash
chmod u+x chao.sh
ls -l chao.sh
./chao.sh
```

```text
-rwxr--r-- 1 hocvien hocvien 14 Nov 27 15:15 chao.sh
xin chao
```

Cú pháp `chmod [ai][phép][quyền] file`:

| Phần | Giá trị | Ý nghĩa |
|---|---|---|
| Ai | `u`, `g`, `o`, `a` | Chủ, nhóm, người khác, tất cả. Bỏ trống nghĩa là `a` |
| Phép | `+` | Thêm quyền |
| | `-` | Bớt quyền |
| | `=` | Đặt đúng bằng (xoá các quyền khác) |
| Quyền | `r`, `w`, `x` | Đọc, ghi, chạy |

| Lệnh | Kết quả từ `-rwxr--r--` |
|---|---|
| `chmod g+w,o-r chao.sh` | `-rwxrw----` (nhiều thay đổi cách nhau bằng dấu phẩy) |
| `chmod a=r chao.sh` | `-r--r--r--` |
| `chmod u=rwx,go=rx chao.sh` | `-rwxr-xr-x` |
| `chmod +x chao.sh` | Thêm x cho cả ba nhóm |

## chmod dạng số

Mỗi nhóm người là **tổng** các số: r=4, w=2, x=1.

| Số | Quyền | Số | Quyền |
|---|---|---|---|
| 7 | `rwx` (4+2+1) | 3 | `-wx` (2+1) |
| 6 | `rw-` (4+2) | 2 | `-w-` |
| 5 | `r-x` (4+1) | 1 | `--x` |
| 4 | `r--` | 0 | `---` |

Ba chữ số lần lượt cho chủ, nhóm, người khác:

| Lệnh | Quyền | Dùng cho |
|---|---|---|
| `chmod 644 file` | `rw-r--r--` | File thường: chủ sửa, mọi người đọc |
| `chmod 755 file` | `rwxr-xr-x` | Script, chương trình, thư mục |
| `chmod 600 file` | `rw-------` | File bí mật: SSH key, file `.env`, mật khẩu |
| `chmod 700 thư-mục` | `rwx------` | Thư mục riêng tư như `~/.ssh` |
| `chmod 640 file` | `rw-r-----` | Cấu hình có mật khẩu, nhóm dịch vụ cần đọc |
| `chmod 777 file` | `rwxrwxrwx` | **Gần như không bao giờ nên dùng**: ai cũng sửa được |

> Khi gặp `Permission denied`, đừng `chmod 777` cho xong. Hãy tìm xem **ai** cần quyền **gì**, rồi cấp đúng chừng đó. 777 trên thư mục web là cách quen thuộc để bị chèn mã độc.

## Quyền trên thư mục

Đây là chỗ hay hiểu nhầm. Thử với thư mục `thumuc` chứa file `a.txt`:

```bash
mkdir thumuc && echo bimat > thumuc/a.txt
chmod 644 thumuc
ls thumuc
cat thumuc/a.txt
```

```text
a.txt
cat: thumuc/a.txt: Permission denied
```

Có `r` mà không có `x`: thấy tên file nhưng **không vào được** để đọc.

Còn trường hợp có `x` mà không có `r`, phải thử bằng **user khác** (chủ thư mục vẫn có `rwx` nên không thấy khác biệt). Cho user `binh` thử đọc thư mục của `hocvien` khi người khác có quyền `--x` (711):

```bash
sudo useradd -m binh
chmod 755 ~
chmod 711 thumuc
sudo -u binh ls /home/hocvien/thumuc
sudo -u binh cat /home/hocvien/thumuc/a.txt
```

```text
ls: cannot open directory '/home/hocvien/thumuc': Permission denied
bimat
```

| Phần | Ý nghĩa |
|---|---|
| `chmod 755 ~` | Cho người khác đi qua được thư mục home của `hocvien` (mặc định Ubuntu đặt home là 750) |
| `sudo -u binh` | Chạy lệnh dưới danh nghĩa user `binh` |
| Kết quả | `binh` không liệt kê được, nhưng **biết tên** thì vẫn đọc được file |

```bash
chmod 555 thumuc
touch thumuc/b
rm thumuc/a.txt
chmod 755 thumuc
```

```text
touch: cannot touch 'thumuc/b': Permission denied
rm: cannot remove 'thumuc/a.txt': Permission denied
```

Không có `w` trên thư mục: không tạo, không xoá được file bên trong, dù bạn có quyền ghi trên chính file đó.

| Quyền thư mục | Làm được gì |
|---|---|
| `r--` | Chỉ thấy tên file |
| `--x` | Vào được, đọc được file nếu biết tên, không liệt kê được |
| `r-x` | Vào, liệt kê, đọc file. Kiểu thông thường cho người đọc |
| `rwx` | Thêm quyền tạo, xoá, đổi tên file |

Để web server đọc được `/var/www/site/index.html`, nó cần `x` trên **mọi** thư mục dọc đường (`/var`, `/var/www`, `/var/www/site`) và `r` trên file.

## Đổi quyền hàng loạt: -R và X

```bash
chmod -R u=rwX,go=rX web
```

| Phần | Ý nghĩa |
|---|---|
| `-R` | Áp cho thư mục và mọi thứ bên trong (**R**ecursive) |
| `u=rwX` | Chủ: đọc, ghi, và `X` |
| `go=rX` | Nhóm và người khác: đọc và `X` |
| `X` (viết hoa) | Chỉ thêm `x` cho **thư mục** (và file vốn đã có x), không thêm cho file thường |

Kết quả: thư mục thành 755, file thường thành 644. Cách khác hay gặp là dùng `find`:

```bash
find web -type d -exec chmod 755 {} +
find web -type f -exec chmod 644 {} +
```

> `chmod -R 755` trên cả thư mục sẽ biến mọi file thành "chạy được". Không gây lỗi ngay, nhưng là quyền thừa.

## chown và chgrp: đổi chủ, đổi nhóm

```bash
sudo chown root chao.sh
sudo chown hocvien:www-data chao.sh
sudo chown :hocvien chao.sh
ls -l chao.sh
```

| Lệnh | Làm gì |
|---|---|
| `chown root file` | Đổi chủ thành `root` |
| `chown hocvien:www-data file` | Đổi chủ thành `hocvien` **và** nhóm thành `www-data` |
| `chown :hocvien file` | Chỉ đổi nhóm |
| `chown -R www-data:www-data web` | Đổi cho cả thư mục và mọi thứ bên trong |
| `chgrp sudo file` | Chỉ đổi nhóm (như `chown :sudo`) |

```text
-rw------- 1 root hocvien 14 Nov 27 15:15 chao.sh
-rw------- 1 hocvien www-data 14 Nov 27 15:15 chao.sh
-rw------- 1 hocvien hocvien 14 Nov 27 15:15 chao.sh
```

Giới hạn với user thường:

```text
chown: changing ownership of 'chao.sh': Operation not permitted
chgrp: changing group of 'chao.sh': Operation not permitted
```

- Đổi **chủ** luôn cần root.
- Đổi **nhóm** thì chủ file làm được, nhưng chỉ sang nhóm mà chính mình là thành viên (`chgrp sudo` được vì `hocvien` thuộc nhóm `sudo`, `chgrp www-data` thì không).

Ví dụ thực tế: mã nguồn web phải để web server đọc được:

```bash
sudo chown -R www-data:www-data /var/www/site
```

## umask: quyền mặc định khi tạo file

File mới không tự nhiên có quyền 644. Hệ thống lấy quyền gốc rồi **bỏ bớt** các bit ghi trong **umask**:

| | Quyền gốc | umask 022 | Kết quả |
|---|---|---|---|
| File | 666 (`rw-rw-rw-`, không bao giờ tự có x) | bỏ `w` của nhóm và người khác | **644** `rw-r--r--` |
| Thư mục | 777 (`rwxrwxrwx`) | bỏ `w` của nhóm và người khác | **755** `rwxr-xr-x` |

```bash
umask
umask -S
umask 077
touch u3 && mkdir u4
ls -ld u3 u4
umask 022
```

```text
0022
u=rwx,g=rx,o=rx
-rw------- 1 hocvien hocvien    0 Nov 27 15:15 u3
drwx------ 2 hocvien hocvien 4096 Nov 27 15:15 u4
```

| Lệnh | Làm gì |
|---|---|
| `umask` | Xem umask dạng số |
| `umask -S` | Xem dạng chữ: quyền **được giữ lại** |
| `umask 077` | Từ giờ file mới chỉ chủ đọc ghi được (600), thư mục 700. Chỉ có hiệu lực trong shell hiện tại |

Muốn giữ lâu dài, ghi `umask 027` vào `~/.bashrc`. Mặc định toàn hệ thống nằm ở `/etc/login.defs` (dòng `UMASK`).

## Thực hành

1. Tạo script `~/xinchao.sh` in ra "Xin chào", cho phép chủ chạy, nhóm và người khác chỉ đọc. Dùng cả hai cách: chữ và số.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   echo 'echo "Xin chào"' > ~/xinchao.sh
   chmod u+x ~/xinchao.sh
   chmod 744 ~/xinchao.sh
   ls -l ~/xinchao.sh
   ~/xinchao.sh
   ```

   Hai cách cho cùng kết quả `-rwxr--r--`.

   </details>

2. Tạo file `~/.env` chứa `DB_PASSWORD=bimat`, đặt quyền sao cho chỉ chủ đọc ghi được. Kiểm tra bằng `stat`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   echo "DB_PASSWORD=bimat" > ~/.env
   chmod 600 ~/.env
   stat -c "%a %A %n" ~/.env
   ```

   </details>

3. Đổi các quyền sau ra số: `rwxr-x---`, `rw-rw-r--`, `r--------`. Và đổi các số sau ra chữ: 750, 664, 711.

   <details>
   <summary>Xem đáp án</summary>

   `rwxr-x---` = 750, `rw-rw-r--` = 664, `r--------` = 400. 750 = `rwxr-x---`, 664 = `rw-rw-r--`, 711 = `rwx--x--x`.

   </details>

4. Tạo thư mục `~/site` có `index.html` và `css/style.css`. Giao cả thư mục cho `www-data`, rồi đặt quyền chuẩn: thư mục 755, file 644, bằng một lệnh `chmod`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   mkdir -p ~/site/css
   touch ~/site/index.html ~/site/css/style.css
   sudo chown -R www-data:www-data ~/site
   sudo chmod -R u=rwX,go=rX ~/site
   ls -lR ~/site
   ```

   Sau `chown`, chủ là `www-data` nên `hocvien` phải dùng `sudo` cho `chmod`.

   </details>

5. Đặt `umask 027` rồi tạo một file và một thư mục. Đoán trước quyền rồi kiểm tra.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   umask 027
   touch f && mkdir d
   ls -ld f d
   umask 022
   ```

   File: 666 bỏ 027 còn 640 (`rw-r-----`). Thư mục: 777 bỏ 027 còn 750 (`rwxr-x---`).

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Xem quyền | `ls -l`, `stat -c "%a %A %n" file` |
| Thêm / bớt / đặt quyền | `chmod u+x`, `chmod go-w`, `chmod u=rw,go=r` |
| Đặt quyền bằng số | `chmod 644 file`, `chmod 755 script`, `chmod 600 bí-mật` |
| Thư mục 755, file 644 hàng loạt | `chmod -R u=rwX,go=rX thư-mục` |
| Đổi chủ và nhóm | `sudo chown user:nhóm file` (`-R` cho thư mục) |
| Đổi nhóm | `chgrp nhóm file` |
| Quyền mặc định | `umask`, `umask 027` |
