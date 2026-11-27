---
summary: Hiểu inode — nơi Linux thật sự lưu thông tin file — rồi phân biệt hard link (thêm một tên cho cùng dữ liệu) và symbolic link (đường tắt trỏ tới một đường dẫn). Biết khi nào dùng loại nào và các lỗi hay gặp như link gãy.
minutes: 30
commands: [ln, ln -s, ls -i, readlink, stat]
quiz:
  - q: Tạo hard link cung.txt cho goc.txt, rồi xoá goc.txt. Đọc cung.txt thì sao?
    options: ["Báo lỗi không tìm thấy", "Vẫn đọc được nội dung cũ", "Ra file rỗng", "Tự tạo lại goc.txt"]
    answer: 1
    explain: Hai tên trỏ cùng một inode (cùng dữ liệu). Xoá một tên chỉ giảm số liên kết. Dữ liệu chỉ thật sự bị xoá khi không còn tên nào trỏ tới.
  - q: Tạo symbolic link mem.txt trỏ tới goc.txt, rồi xoá goc.txt. Đọc mem.txt thì sao?
    options: ["Vẫn đọc được", "Báo No such file or directory, vì link bị gãy", "Ra nội dung của mem.txt", "Link tự xoá theo"]
    answer: 1
    explain: Symbolic link chỉ lưu đường dẫn `goc.txt`. Đường dẫn đó không còn nên link gãy (dangling). Tạo lại file tên `goc.txt` thì link chạy lại.
  - q: Muốn tạo đường tắt tới một thư mục, hoặc tới file nằm trên ổ đĩa khác, dùng loại link nào?
    options: ["Hard link", "Symbolic link (ln -s)", "Loại nào cũng được", "Không làm được"]
    answer: 1
    explain: "Hard link không làm được với thư mục (`hard link not allowed for directory`) và không vượt qua filesystem khác (`Invalid cross-device link`). Symbolic link thì làm được cả hai."
  - q: "Trong `ls -li`, hai file có cùng số ở cột đầu tiên nghĩa là gì?"
    options: ["Cùng dung lượng", "Cùng inode, tức là hai hard link của cùng một file", "Cùng chủ sở hữu", "Tạo cùng lúc"]
    answer: 1
    explain: "`-i` in số inode. Cùng inode thì cùng một file trên ổ đĩa, chỉ khác tên."
  - q: "Lệnh nào đúng thứ tự để tạo link `/usr/local/bin/app` trỏ tới `/opt/app/bin/app`?"
    options: ["ln -s /usr/local/bin/app /opt/app/bin/app", "ln -s /opt/app/bin/app /usr/local/bin/app", "ln /usr/local/bin/app -s /opt/app/bin/app", "link /opt/app/bin/app"]
    answer: 1
    explain: "Giống `cp`: `ln -s ĐÍCH-THẬT TÊN-LINK`. Cái đã có đứng trước, cái mới tạo đứng sau."
---

## Inode: file thật sự nằm ở đâu

Trên ổ đĩa, mỗi file có một **inode**: một bản ghi chứa mọi thông tin của file (quyền, chủ, dung lượng, thời gian, vị trí dữ liệu trên đĩa) **trừ tên**. Mỗi inode có một số hiệu.

**Tên file** nằm trong thư mục. Thư mục thực chất là một bảng ghi "tên này → inode số mấy".

```bash
cd ~
echo "noi dung goc" > goc.txt
ls -li goc.txt
```

| Phần | Ý nghĩa |
|---|---|
| `-l` | Dạng dài |
| `-i` | In thêm số **i**node ở cột đầu |

```text
24121577 -rw-r--r-- 1 hocvien hocvien 13 Nov 27 15:07 goc.txt
```

| Cột | Ý nghĩa |
|---|---|
| `24121577` | Số inode |
| `1` (sau quyền) | Số tên (hard link) đang trỏ tới inode này |

## Hard link: thêm một tên cho cùng dữ liệu

```bash
ln goc.txt cung.txt
ls -li goc.txt cung.txt
```

| Phần | Ý nghĩa |
|---|---|
| `ln` | Tạo liên kết (**l**i**n**k). Không có tuỳ chọn là hard link |
| `goc.txt` | File đã có |
| `cung.txt` | Tên mới cần tạo |

```text
24121577 -rw-r--r-- 2 hocvien hocvien 13 Nov 27 15:07 cung.txt
24121577 -rw-r--r-- 2 hocvien hocvien 13 Nov 27 15:07 goc.txt
```

Hai tên **cùng số inode** `24121577`, số liên kết tăng lên `2`. Không có cái nào là "gốc" hay "bản sao": cả hai đều là tên ngang hàng của cùng một file.

- Sửa qua tên này, tên kia thấy ngay (vì là cùng dữ liệu).
- Xoá một tên, số liên kết giảm về 1, dữ liệu **vẫn còn**. Dữ liệu chỉ bị xoá thật khi số liên kết về 0.

```bash
echo "them dong" >> cung.txt
cat goc.txt
rm goc.txt
cat cung.txt
```

```text
noi dung goc
them dong
noi dung goc
them dong
```

Giới hạn của hard link:

```text
ln: thumuc: hard link not allowed for directory
ln: failed to create hard link 'v' => '/proc/version': Invalid cross-device link
```

| Lỗi | Lý do |
|---|---|
| `hard link not allowed for directory` | Không được tạo hard link cho thư mục (để tránh tạo vòng lặp trong cây thư mục) |
| `Invalid cross-device link` | Số inode chỉ có nghĩa trong một filesystem. Không tạo hard link sang ổ đĩa hay phân vùng khác được |

## Symbolic link: đường tắt

**Symbolic link** (symlink, soft link) là một file đặc biệt, nội dung chỉ là **một đường dẫn** tới file khác. Giống shortcut trên Windows.

```bash
echo "noi dung goc" > goc.txt
ln -s goc.txt mem.txt
ls -li goc.txt mem.txt
```

| Phần | Ý nghĩa |
|---|---|
| `ln -s` | Tạo symbolic link (**s**ymbolic) |
| `goc.txt` | Đích mà link trỏ tới |
| `mem.txt` | Tên của link |

```text
24121577 -rw-r--r-- 2 hocvien hocvien 13 Nov 27 15:07 goc.txt
24121563 lrwxrwxrwx 1 hocvien hocvien  7 Nov 27 15:07 mem.txt -> goc.txt
```

| Dấu hiệu | Ý nghĩa |
|---|---|
| Inode khác (`24121563`) | Symlink là một file riêng |
| Ký tự đầu `l` | Loại file là link |
| `rwxrwxrwx` | Quyền của symlink luôn như vậy và không có tác dụng. Quyền thật lấy theo file đích |
| `7` | Dung lượng = độ dài chuỗi `goc.txt` (7 ký tự) |
| `-> goc.txt` | Đích mà link trỏ tới |

### Link gãy

Xoá file đích, symlink vẫn còn nhưng trỏ vào khoảng không:

```bash
rm goc.txt
cat mem.txt
```

```text
cat: mem.txt: No such file or directory
```

Tạo lại file có đúng tên đó, link chạy lại ngay. Tìm link gãy: `find . -xtype l`.

### Link tới thư mục và sang ổ khác

Symlink không có giới hạn như hard link:

```bash
ln -s /var/log nhatky
ls -l nhatky
cd nhatky
pwd
pwd -P
```

```text
lrwxrwxrwx 1 hocvien hocvien 8 Nov 27 15:07 nhatky -> /var/log
/home/hocvien/nhatky
/var/log
```

`pwd` in đường dẫn bạn đã đi qua (qua link). `pwd -P` in đường dẫn thật (**P**hysical).

### Bẫy đường dẫn tương đối

Đích của symlink được tính **từ thư mục chứa link**, không phải từ chỗ bạn đứng lúc tạo:

```bash
mkdir -p a
ln -s goc.txt a/sai.txt
ln -s ../goc.txt a/dung.txt
```

`a/sai.txt` trỏ tới `a/goc.txt` (không có) nên gãy. `a/dung.txt` trỏ tới `../goc.txt` tính từ `a/`, tức `~/goc.txt`. Muốn chắc chắn thì dùng đường dẫn tuyệt đối: `ln -s /home/hocvien/goc.txt a/x.txt`.

### Xem và đổi đích

```bash
readlink mem.txt
readlink -f mem.txt
ln -sfn /etc nhatky
```

| Lệnh | Làm gì |
|---|---|
| `readlink mem.txt` | In đích ghi trong link (`goc.txt`) |
| `readlink -f mem.txt` | In đường dẫn tuyệt đối cuối cùng, đi qua mọi tầng link (`/home/hocvien/goc.txt`) |
| `ln -sfn /etc nhatky` | Đổi link `nhatky` sang trỏ tới `/etc`. `-f` thay link cũ, `-n` coi link tới thư mục là chính cái link (không chui vào trong) |

## So sánh

| | Hard link (`ln`) | Symbolic link (`ln -s`) |
|---|---|---|
| Bản chất | Thêm một tên cho cùng inode | File riêng chứa một đường dẫn |
| Inode | Giống file gốc | Khác |
| Xoá file gốc | Vẫn đọc được dữ liệu | Link gãy |
| Trỏ tới thư mục | Không | Có |
| Sang filesystem khác | Không | Có |
| Nhìn trong `ls -l` | Như file thường, số liên kết > 1 | Ký tự `l`, có `-> đích` |

## Symlink trong thực tế

Bạn sẽ gặp symlink khắp nơi:

| Ở đâu | Ví dụ |
|---|---|
| Hệ thống | `/bin -> usr/bin`, `/lib -> usr/lib` |
| nginx trên Ubuntu | `/etc/nginx/sites-enabled/web -> /etc/nginx/sites-available/web`: bật một site bằng cách tạo link, tắt bằng cách xoá link |
| Chuyển phiên bản phần mềm | `/opt/app/current -> /opt/app/v2.3`: triển khai bản mới chỉ cần đổi link, lỗi thì trỏ lại bản cũ |
| Lệnh có nhiều tên | `/usr/bin/vi -> /etc/alternatives/vi -> /usr/bin/vim.basic` |

## Thực hành

1. Tạo file `du-lieu.txt`, tạo một hard link `du-lieu-2.txt`. Kiểm tra số inode và số liên kết bằng `stat`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   echo "abc" > du-lieu.txt
   ln du-lieu.txt du-lieu-2.txt
   stat -c "%n inode=%i links=%h" du-lieu.txt du-lieu-2.txt
   ```

   `stat -c` in theo mẫu: `%n` tên, `%i` inode, `%h` số liên kết. Hai dòng cùng inode, `links=2`.

   </details>

2. Tạo symlink `~/cauhinh` trỏ tới `/etc`, liệt kê nội dung qua link đó. Rồi cho biết đích thật của link.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ln -s /etc ~/cauhinh
   ls ~/cauhinh/ | head
   readlink -f ~/cauhinh
   ```

   </details>

3. Mô phỏng cách triển khai "đổi phiên bản bằng symlink": tạo `~/app/v1/index.html` (nội dung `v1`) và `~/app/v2/index.html` (nội dung `v2`). Tạo link `~/app/current` trỏ tới `v1`, đọc `current/index.html`. Đổi link sang `v2`, đọc lại.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   mkdir -p ~/app/v1 ~/app/v2
   echo v1 > ~/app/v1/index.html
   echo v2 > ~/app/v2/index.html
   cd ~/app
   ln -s v1 current
   cat current/index.html
   ln -sfn v2 current
   cat current/index.html
   ls -l current
   ```

   Lần đầu in `v1`, sau khi đổi in `v2`. Thiếu `-n`, lệnh thứ hai sẽ tạo link `v2` **bên trong** thư mục `v1` (đi qua link cũ) thay vì thay link.

   </details>

4. Tìm mọi symlink nằm ngay trong `/` và mọi symlink bị gãy trong home.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   find / -maxdepth 1 -type l
   find ~ -xtype l
   ```

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Xem số inode | `ls -li` |
| Tạo hard link | `ln file-có-sẵn tên-mới` |
| Tạo symbolic link | `ln -s đích tên-link` |
| Đổi đích của link | `ln -sfn đích-mới tên-link` |
| Xem đích | `readlink -f tên-link` |
| Tìm link / link gãy | `find nơi -type l` / `find nơi -xtype l` |
