---
summary: Các lệnh dùng nhiều nhất trên server — tạo thư mục (mkdir), tạo file (touch), chép (cp), di chuyển và đổi tên (mv), xoá (rm, rmdir), xem loại file (file) và thông tin chi tiết (stat).
minutes: 40
commands: [mkdir, touch, cp, mv, rm, rmdir, file, stat]
quiz:
  - q: "Lệnh nào tạo được cả chuỗi thư mục `a/b/c` khi `a` chưa tồn tại?"
    options: ["mkdir a/b/c", "mkdir -p a/b/c", "mkdir -r a/b/c", "touch a/b/c"]
    answer: 1
    explain: "`-p` (parents) tạo luôn các thư mục cha còn thiếu. Không có `-p`, `mkdir` báo `No such file or directory`."
  - q: "`cp web backup/` báo `-r not specified; omitting directory 'web'`. Sửa thế nào?"
    options: ["cp -f web backup/", "cp -r web backup/", "mv web backup/", "cp web/* backup/"]
    answer: 1
    explain: "Chép thư mục phải thêm `-r` (recursive) để chép cả nội dung bên trong. `cp -a` cũng được, và còn giữ nguyên quyền, chủ sở hữu, thời gian."
  - q: Trên Linux, đổi tên file dùng lệnh nào?
    options: ["rename", "mv", "cp rồi rm", "ren"]
    answer: 1
    explain: "Linux không có lệnh đổi tên riêng cho việc thường ngày. `mv cũ mới` vừa dùng để đổi tên vừa để di chuyển. Cùng một thư mục thì đó là đổi tên."
  - q: "`rmdir baitap` báo `Directory not empty`. Lệnh nào xoá được thư mục cùng mọi thứ bên trong?"
    options: ["rm baitap", "rmdir -f baitap", "rm -r baitap", "del baitap"]
    answer: 2
    explain: "`rmdir` chỉ xoá thư mục rỗng. `rm -r` xoá đệ quy cả thư mục lẫn nội dung. Linux không có thùng rác, xoá là mất."
  - q: "Muốn bản sao giữ nguyên thời gian sửa đổi của file gốc thì thêm tuỳ chọn nào vào `cp`?"
    options: ["-v", "-i", "-p", "-n"]
    answer: 2
    explain: "`-p` (preserve) giữ thời gian, quyền và chủ sở hữu. Không có `-p`, bản sao mang thời gian lúc chép."
  - q: Làm sao biết một file không có đuôi là file chữ hay chương trình?
    options: ["Xem đuôi file", "Dùng lệnh file", "Dùng lệnh touch", "Không thể biết"]
    answer: 1
    explain: "Linux không dựa vào đuôi file. Lệnh `file` đọc nội dung bên trong để đoán loại: `ASCII text`, `ELF 64-bit ... executable`, `directory`…"
---

## Trước khi bắt đầu

Mở container thực hành và đứng ở thư mục home:

```bash
docker start -ai lab
cd ~
```

Linux **không có thùng rác** trên dòng lệnh. File đã `rm` là mất, `mv` hay `cp` đè lên file trùng tên cũng mất file cũ mà không hỏi. Vì vậy bài này luôn chỉ thêm tuỳ chọn `-i` (hỏi trước) và `-v` (in ra việc đã làm) khi bạn chưa chắc.

## mkdir: tạo thư mục

```bash
mkdir baitap
mkdir -pv web/{css,js}/cu
```

| Phần | Ý nghĩa |
|---|---|
| `mkdir` | Tạo thư mục (**m**a**k**e **dir**ectory) |
| `baitap` | Tên thư mục cần tạo. Có thể ghi nhiều tên cùng lúc: `mkdir a b c` |
| `-p` | Tạo luôn các thư mục cha còn thiếu (**p**arents). Thư mục đã có thì không báo lỗi |
| `-v` | In ra từng thư mục được tạo (**v**erbose) |
| `web/{css,js}/cu` | Shell bung dấu `{ }` thành `web/css/cu` và `web/js/cu` trước khi chạy `mkdir` |

```text
mkdir: created directory 'web'
mkdir: created directory 'web/css'
mkdir: created directory 'web/css/cu'
mkdir: created directory 'web/js'
mkdir: created directory 'web/js/cu'
```

Không có `-p` mà thư mục cha chưa có:

```text
mkdir: cannot create directory 'a/b/c': No such file or directory
```

## touch: tạo file rỗng, cập nhật thời gian

```bash
touch ghichu.txt
ls -l ghichu.txt
```

| Phần | Ý nghĩa |
|---|---|
| `touch` | Nếu file chưa có: tạo file rỗng. Nếu đã có: cập nhật thời gian sửa thành bây giờ, **không đổi nội dung** |
| `ghichu.txt` | Tên file. Nhiều tên thì tạo nhiều file |

```text
-rw-r--r-- 1 hocvien hocvien 0 Nov 27 15:00 ghichu.txt
```

Dung lượng `0` là file rỗng. Muốn file có chữ ngay, dùng chuyển hướng (học kỹ ở [bài 13](/bai/chuyen-huong-va-pipe)):

```bash
echo "xin chao" > ghichu.txt
```

## cp: chép file và thư mục

```bash
cp ghichu.txt ghichu.bak
cp -v ghichu.txt baitap/
cp -r web baitap/
```

| Phần | Ý nghĩa |
|---|---|
| `cp` | Chép (**c**o**p**y) |
| `ghichu.txt ghichu.bak` | Chép `ghichu.txt` thành file mới tên `ghichu.bak` cùng thư mục |
| `ghichu.txt baitap/` | Đích là thư mục có sẵn: chép vào trong, giữ tên cũ (`baitap/ghichu.txt`) |
| `-v` | In ra việc đã chép: `'ghichu.txt' -> 'baitap/ghichu.txt'` |
| `-r` | Chép thư mục cùng toàn bộ nội dung bên trong (**r**ecursive) |

Các tuỳ chọn hay dùng khác:

| Tuỳ chọn | Ý nghĩa |
|---|---|
| `-i` | Hỏi trước khi ghi đè file đã có (**i**nteractive): `cp: overwrite 'ghichu.bak'?`. Gõ `y` để đồng ý |
| `-n` | Không bao giờ ghi đè (**n**o-clobber) |
| `-p` | Giữ nguyên thời gian, quyền, chủ sở hữu (**p**reserve) |
| `-a` | Chế độ lưu trữ (**a**rchive) = `-r` + giữ mọi thuộc tính + giữ nguyên symlink. **Dùng khi sao lưu** |

Thiếu `-r` khi chép thư mục:

```text
cp: -r not specified; omitting directory 'web'
```

Khác nhau giữa có và không có `-p`:

```bash
touch -d "2020-01-01" cu.txt
cp cu.txt moi1.txt
cp -p cu.txt moi2.txt
ls -l --time-style=+%F cu.txt moi1.txt moi2.txt
```

```text
-rw-r--r-- 1 hocvien hocvien 0 2020-01-01 cu.txt
-rw-r--r-- 1 hocvien hocvien 0 2026-11-27 moi1.txt
-rw-r--r-- 1 hocvien hocvien 0 2020-01-01 moi2.txt
```

| Phần | Ý nghĩa |
|---|---|
| `touch -d "2020-01-01" cu.txt` | Tạo file, đặt thời gian sửa thành ngày 1/1/2020 (**d**ate) |
| `--time-style=+%F` | Cho `ls` in ngày theo dạng năm-tháng-ngày cho dễ so |
| Kết quả | `moi1.txt` mang ngày chép, `moi2.txt` (có `-p`) giữ ngày gốc |

Một mẹo hay dùng khi sửa file cấu hình: **chép ra bản dự phòng trước khi sửa**.

```bash
sudo cp -a /etc/hosts /etc/hosts.bak
```

## mv: di chuyển và đổi tên

```bash
mv -v ghichu.bak ghichu.old
mv -v ghichu.old baitap/
```

| Phần | Ý nghĩa |
|---|---|
| `mv` | Di chuyển (**m**o**v**e). Linux dùng luôn lệnh này để **đổi tên** |
| `ghichu.bak ghichu.old` | Đích là tên mới cùng thư mục: đổi tên |
| `ghichu.old baitap/` | Đích là thư mục có sẵn: chuyển file vào trong |
| `-v` | In ra việc đã làm |

```text
renamed 'ghichu.bak' -> 'ghichu.old'
renamed 'ghichu.old' -> 'baitap/ghichu.old'
```

- `mv` dùng cho thư mục **không cần** `-r`.
- `mv` cũng ghi đè file trùng tên mà không hỏi. Thêm `-i` để được hỏi trước, hoặc `-n` để không bao giờ ghi đè.
- Chuyển nhiều file cùng lúc: `mv a.txt b.txt c.txt baitap/` (thư mục đích để cuối).

## rm và rmdir: xoá

```bash
rm -v moi1.txt
rmdir rong
rm -r baitap
```

| Phần | Ý nghĩa |
|---|---|
| `rm` | Xoá file (**r**e**m**ove) |
| `-v` | In ra từng file đã xoá |
| `rmdir rong` | Xoá thư mục `rong`, **chỉ khi thư mục rỗng** |
| `rm -r baitap` | Xoá thư mục và mọi thứ bên trong (**r**ecursive) |

Các tuỳ chọn khác:

| Tuỳ chọn | Ý nghĩa |
|---|---|
| `-i` | Hỏi trước từng file: `rm: remove regular empty file 'cu.txt'?` |
| `-I` (chữ i hoa) | Chỉ hỏi một lần nếu xoá nhiều hơn 3 file hoặc xoá đệ quy. Đỡ phiền hơn `-i` |
| `-f` | Không hỏi, không báo lỗi khi file không tồn tại (**f**orce) |

Lỗi hay gặp:

```text
rm: cannot remove 'baitap': Is a directory
rmdir: failed to remove 'baitap': Directory not empty
```

> **Cẩn thận với `rm -rf`.** Lệnh này xoá mọi thứ mà không hỏi. Trước khi bấm Enter, đọc lại đường dẫn. Một dấu cách thừa như `rm -rf / tmp/x` sẽ xoá từ gốc. Khi dùng biến, viết `rm -rf "$THUMUC/"` mà biến rỗng thì thành `rm -rf /`. Trong script, hãy kiểm tra biến trước khi xoá.

## file: đoán loại file

Linux không dựa vào đuôi file. `file` đọc vài byte đầu của nội dung để đoán loại.

```bash
file ghichu.txt /bin/ls /etc /bin
```

```text
ghichu.txt: ASCII text
/bin/ls:    ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, ...
/etc:       directory
/bin:       symbolic link to usr/bin
```

| Kết quả | Ý nghĩa |
|---|---|
| `ASCII text` | File chữ, mở được bằng `cat`, `less`, `vim` |
| `ELF 64-bit ... executable` | Chương trình đã biên dịch (ELF là định dạng chương trình trên Linux). Đừng `cat` file này, màn hình sẽ toàn ký tự rác |
| `directory` | Thư mục |
| `symbolic link to usr/bin` | Đường tắt trỏ tới `usr/bin` |

## stat: xem chi tiết một file

```bash
stat ghichu.txt
```

```text
  File: ghichu.txt
  Size: 9         	Blocks: 8          IO Block: 4096   regular file
Device: 0,69	Inode: 24121582    Links: 1
Access: (0644/-rw-r--r--)  Uid: ( 1001/ hocvien)   Gid: ( 1001/ hocvien)
Access: 2026-11-27 15:00:46.302404153 +0700
Modify: 2026-11-27 15:00:46.233405170 +0700
Change: 2026-11-27 15:00:46.233405170 +0700
 Birth: 2026-11-27 15:00:45.217420155 +0700
```

| Dòng | Ý nghĩa |
|---|---|
| `Size: 9` | Dung lượng 9 byte (`xin chao` + ký tự xuống dòng) |
| `regular file` | File thường |
| `Inode: 24121582` | Số hiệu của file trên ổ đĩa. Học ở bài [Hard link và soft link](/bai/hard-link-soft-link) |
| `Links: 1` | Số tên (hard link) đang trỏ tới file này |
| `Access: (0644/-rw-r--r--)` | Quyền dạng số và dạng chữ. Học ở bài [Phân quyền](/bai/phan-quyen-file) |
| `Access:` (thời gian) | Lần cuối file được **đọc** |
| `Modify:` | Lần cuối **nội dung** bị sửa (cột thời gian trong `ls -l`) |
| `Change:` | Lần cuối **thông tin** file (quyền, chủ, tên) bị đổi |
| `Birth:` | Lúc file được tạo (không phải filesystem nào cũng ghi) |

## Thực hành

1. Trong home, tạo cấu trúc sau bằng **một** lệnh `mkdir` và **một** lệnh `touch`:

   ```text
   du-an/
   ├── src/
   │   └── main.sh
   ├── docs/
   │   └── huong-dan.txt
   └── backup/
   ```

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   mkdir -p du-an/{src,docs,backup}
   touch du-an/src/main.sh du-an/docs/huong-dan.txt
   tree du-an
   ```

   </details>

2. Chép cả thư mục `du-an/src` vào `du-an/backup/` sao cho giữ nguyên thời gian sửa đổi. Kiểm tra lại.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   cp -a du-an/src du-an/backup/
   ls -l du-an/src du-an/backup/src
   ```

   `-a` gồm `-r` (chép thư mục) và giữ nguyên thuộc tính. Thời gian của `main.sh` ở hai nơi giống nhau.

   </details>

3. Đổi tên `du-an/docs/huong-dan.txt` thành `README.txt` và chuyển nó ra thẳng `du-an/` bằng **một** lệnh.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   mv -v du-an/docs/huong-dan.txt du-an/README.txt
   ```

   Đích là một đường dẫn đầy đủ tới tên mới, nên `mv` vừa chuyển chỗ vừa đổi tên.

   </details>

4. Xoá thư mục `du-an/docs` (lúc này đã rỗng) bằng lệnh an toàn nhất, tức lệnh sẽ báo lỗi nếu thư mục còn file.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   rmdir du-an/docs
   ```

   `rmdir` từ chối xoá nếu thư mục còn nội dung, nên không thể xoá nhầm dữ liệu.

   </details>

5. Kiểm tra loại của các file: `/etc/passwd`, `/usr/bin/cp`, `/bin`, `/dev/null`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   file /etc/passwd /usr/bin/cp /bin /dev/null
   ```

   Lần lượt là: `ASCII text`, `ELF 64-bit ... executable`, `symbolic link to usr/bin`, `character special` (file thiết bị).

   </details>

6. Dọn dẹp: xoá cả thư mục `du-an` nhưng được hỏi xác nhận một lần.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   rm -rI du-an
   ```

   `-I` hỏi một lần `rm: remove 1 argument recursively?`, gõ `y` để xoá.

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Tạo thư mục (cả cha) | `mkdir -p a/b/c` |
| Tạo file rỗng | `touch tên` |
| Chép file / thư mục / sao lưu giữ thuộc tính | `cp a b` / `cp -r thư-mục đích` / `cp -a nguồn đích` |
| Đổi tên / di chuyển | `mv cũ mới` / `mv file thư-mục/` |
| Xoá file / thư mục rỗng / thư mục có nội dung | `rm file` / `rmdir thư-mục` / `rm -r thư-mục` |
| Hỏi trước khi ghi đè hoặc xoá | thêm `-i` |
| Xem loại file / chi tiết | `file tên` / `stat tên` |
