---
summary: whereis cho biết file chạy, trang man và mã nguồn của một lệnh nằm ở đâu. which cho biết khi gõ một lệnh thì file nào sẽ được chạy, và dùng để kiểm tra máy đã có lệnh đó chưa.
minutes: 20
commands: [whereis, which, type, echo $PATH]
quiz:
  - q: "`whereis -m grep` in ra gì?"
    options: ["File chạy của grep", "Trang hướng dẫn (man) của grep", "Mã nguồn của grep", "Cách dùng grep"]
    answer: 1
    explain: "`-b` là file chạy (binary), `-m` là trang man (manual), `-s` là mã nguồn (source)."
  - q: "`which ls` trả lời câu hỏi nào?"
    options: ["ls có bao nhiêu tuỳ chọn", "Gõ ls thì file nào được chạy", "Ai đang chạy ls", "ls được cài lúc nào"]
    answer: 1
    explain: "`which` tìm trong các thư mục của biến PATH, in đường dẫn file sẽ được chạy, ví dụ `/usr/bin/ls`."
  - q: "`which -a grep` khác `which grep` thế nào?"
    options: ["In mọi file grep tìm thấy trong PATH, không chỉ file đầu tiên", "In cả trang man", "Chạy grep", "Không khác"]
    answer: 0
    explain: "`-a` (all) liệt kê mọi bản tìm được, theo thứ tự trong PATH. Bản đầu tiên là bản được chạy."
  - q: "`which cd` không in gì. Vì sao?"
    options: ["Máy chưa cài cd", "cd là lệnh có sẵn trong bash, không phải file riêng", "cd bị xoá", "Phải dùng sudo"]
    answer: 1
    explain: "`which` chỉ tìm file trong PATH. `cd` là builtin của bash; dùng `type cd` để biết."
  - q: Lệnh nào trên Ubuntu cho biết thêm cả alias và builtin, không chỉ file?
    options: ["which", "whereis", "type", "find"]
    answer: 2
    explain: "`type` là lệnh của bash, biết cả alias, builtin và file. `which` chỉ biết file."
---

> Bài này đi theo video TITV bài 17.

`find` (bài 16) tìm mọi loại file. Khi cần tìm riêng **một lệnh** đang nằm ở đâu, có hai lệnh nhanh hơn: `whereis` và `which`.

## whereis: file chạy, trang man, mã nguồn

```text
whereis [tuỳ chọn] tên-lệnh
```

```bash
whereis ls
```

```text
ls: /usr/bin/ls /usr/share/man/man1/ls.1.gz
```

`whereis` tìm trong các thư mục chuẩn của hệ thống và in ra mọi thứ liên quan tới tên đó: file chạy được (`/usr/bin/ls`), trang man (`ls.1.gz`), và mã nguồn nếu có.

| Tuỳ chọn | Chỉ tìm |
|---|---|
| `-b` | File chạy được (**b**inary) |
| `-m` | Trang hướng dẫn (**m**anual) |
| `-s` | Mã nguồn (**s**ource) |

```bash
whereis -b ls
whereis -m grep
whereis -s ls
```

```text
ls: /usr/bin/ls
grep: /usr/share/man/man1/grep.1.gz /usr/share/info/grep.info.gz
ls:
```

Ubuntu không cài sẵn mã nguồn nên `whereis -s ls` chỉ in `ls:` rỗng.

Một tên có thể khớp nhiều thứ. Ví dụ `passwd` vừa là lệnh, vừa là file cấu hình:

```bash
whereis passwd
```

```text
passwd: /usr/bin/passwd /etc/passwd /usr/share/man/man1/passwd.1.gz /usr/share/man/man1/passwd.1ssl.gz /usr/share/man/man5/passwd.5.gz
```

Thực tế ít dùng `whereis`; chủ yếu để biết nhanh một lệnh có trang man hay không.

## which: lệnh nào sẽ được chạy

Khi bạn gõ `ls`, shell đi tìm file tên `ls` trong một danh sách thư mục (biến `PATH`, xem phần mở rộng). `which` cho biết file nó tìm thấy:

```bash
which ls
```

```text
/usr/bin/ls
```

Dùng `which` để **kiểm tra máy đã có lệnh chưa**: có thì in đường dẫn, chưa có thì không in gì.

```bash
which khongco
echo $?
```

```text
1
```

`echo $?` in mã thoát của lệnh vừa chạy: `0` là tìm thấy, `1` là không có.

Cùng một tên có thể nằm ở nhiều thư mục. `-a` (**a**ll) in hết:

```bash
which -a grep
```

```text
/usr/bin/grep
/bin/grep
```

Bản đứng đầu là bản được chạy. Trên Ubuntu, `/bin` là link tới `/usr/bin` (bài 6), nên hai dòng này thực chất là một file.

`which` trên Ubuntu chỉ có hai tuỳ chọn: `-a` và `-s` (không in gì, chỉ trả mã thoát). Một số bản Linux khác có thêm tuỳ chọn, nên đọc `man which` trên máy mình.

## which không biết builtin

```bash
which cd
type cd
```

```text
cd is a shell builtin
```

`which cd` không in gì, vì `cd` không phải file mà là lệnh nằm sẵn trong bash. `type` (bài 7) biết cả builtin và alias:

```bash
type -a grep
```

```text
grep is aliased to `grep --color=auto'
grep is /usr/bin/grep
grep is /bin/grep
```

## Mở rộng (chuẩn LPIC-1)

### Biến PATH

`PATH` là danh sách thư mục, cách nhau bằng dấu `:`. Gõ một lệnh, shell tìm lần lượt từ trái sang phải, gặp file đầu tiên thì chạy.

```bash
echo $PATH
```

```text
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```

Ubuntu desktop có thể có thêm `/usr/games`, `/snap/bin`. Vì `/usr/local/bin` đứng trước `/usr/bin`, chương trình bạn tự cài vào `/usr/local/bin` sẽ được ưu tiên hơn bản của hệ thống.

Chương trình nằm ngoài PATH thì phải gõ đường dẫn, ví dụ `./caidat.sh` cho file ở thư mục hiện hành. Bài môi trường shell ở phần mở rộng học cách thêm thư mục vào PATH.

### command -v

Trong script, nên dùng `command -v tên` thay cho `which`: đây là lệnh chuẩn POSIX, có trên mọi shell, biết cả alias và builtin.

```bash
command -v ls
```

## Thực hành

1. Tìm file chạy và trang man của lệnh `tar`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   whereis tar
   whereis -b tar
   whereis -m tar
   ```

   </details>

2. Máy bạn đã có lệnh `tree`, `curl`, `git` chưa? Kiểm tra bằng một lệnh.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   which tree curl git
   ```

   Lệnh nào có thì in đường dẫn; lệnh nào chưa cài thì không có dòng tương ứng. Cài thêm bằng `sudo apt install tên-gói`.

   </details>

3. `echo`, `pwd`, `cat` là builtin hay file? Dùng `type -a` để xem.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   type -a echo pwd cat
   ```

   `echo` và `pwd` vừa là builtin, vừa có bản file `/usr/bin/echo`, `/usr/bin/pwd`; builtin được ưu tiên. `cat` chỉ có bản file (`/usr/bin/cat` và `/bin/cat` là cùng một file).

   </details>

## Tóm tắt

| Lệnh | Làm gì |
|---|---|
| `whereis lệnh` | File chạy, trang man, mã nguồn |
| `whereis -b` / `-m` / `-s` | Chỉ file chạy / chỉ man / chỉ mã nguồn |
| `which lệnh` | File sẽ được chạy khi gõ lệnh |
| `which -a lệnh` | Mọi bản tìm thấy trong PATH |
| `type lệnh` | Biết cả alias và builtin |
| `echo $PATH` | Các thư mục shell tìm lệnh |
