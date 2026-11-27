---
summary: Thư mục hiện hành là chỗ bạn đang đứng trong cây thư mục. pwd cho biết đang ở đâu, cd để đi tới thư mục khác bằng đường dẫn tuyệt đối, tương đối, ~, .., - và $HOME.
minutes: 20
commands: [pwd, cd, cd .., cd -, cd ~]
quiz:
  - q: Đang ở `/home/hocvien`, gõ `cd ..` rồi `pwd`. Kết quả là gì?
    options: ["/", "/home", "/home/hocvien", "/root"]
    answer: 1
    explain: "`..` là thư mục cha. Cha của `/home/hocvien` là `/home`."
  - q: Lệnh nào đưa bạn về thư mục vừa đứng trước đó, giống nút Back?
    options: ["cd ..", "cd ~", "cd -", "cd /"]
    answer: 2
    explain: "`cd -` quay về thư mục trước đó và in đường dẫn của nó."
  - q: Đang ở `/usr/share/doc`, gõ `cd ../..`. Bạn tới đâu?
    options: ["/usr", "/usr/share", "/", "/home"]
    answer: 0
    explain: Lên một cấp tới `/usr/share`, lên thêm một cấp nữa tới `/usr`.
  - q: Lệnh nào KHÔNG đưa bạn về thư mục nhà của mình?
    options: ["cd", "cd ~", "cd $HOME", "cd /"]
    answer: 3
    explain: "`cd /` đưa bạn về thư mục gốc. Ba lệnh còn lại đều về thư mục nhà (`/home/tên-bạn`)."
  - q: "`pwd` là viết tắt của gì?"
    options: ["password", "print working directory", "previous working directory", "path with directory"]
    answer: 1
    explain: "`pwd` in ra thư mục hiện hành (working directory). Lệnh đổi mật khẩu là `passwd`."
---

> Bài này đi theo video TITV bài 9.

## Thư mục hiện hành

Lúc nào bạn cũng đang "đứng" ở một thư mục trong cây, gọi là **thư mục hiện hành** (working directory). Nó quan trọng vì:

- File, thư mục mới tạo ra sẽ nằm ở đây nếu bạn không chỉ chỗ khác.
- Đường dẫn tương đối được tính từ đây.

Dấu nhắc đã cho biết thư mục hiện hành, ví dụ `hocvien@ubuntu:/var/log$` là đang ở `/var/log`, còn `~` là thư mục nhà.

## pwd: đang ở đâu

```bash
pwd
```

| Phần | Ý nghĩa |
|---|---|
| `pwd` | In đường dẫn tuyệt đối của thư mục hiện hành (**p**rint **w**orking **d**irectory) |

```text
/home/hocvien
```

Mở terminal mới, bạn luôn bắt đầu ở **thư mục nhà** của mình: `/home/tên-người-dùng`.

## cd: đi tới thư mục khác

```text
cd [đường-dẫn]
```

`cd` (**c**hange **d**irectory) nhận một đường dẫn tuyệt đối hoặc tương đối (bài 6). Các cách viết:

| Lệnh | Đi tới |
|---|---|
| `cd /var/log` | Đường dẫn tuyệt đối, đúng dù đang đứng ở đâu |
| `cd log` | Thư mục `log` nằm trong thư mục hiện hành (tương đối) |
| `cd ..` | Thư mục cha (lên một cấp) |
| `cd ../..` | Lên hai cấp |
| `cd -` | Thư mục vừa đứng trước đó, giống nút Back |
| `cd ~` | Thư mục nhà của bạn |
| `cd` (không có gì) | Cũng về thư mục nhà |
| `cd $HOME` | Thư mục nhà, lấy từ biến `HOME` |
| `cd ~an` | Thư mục nhà của người dùng `an` |

`cd` không in gì khi thành công. Hãy gõ `pwd` sau mỗi lần `cd` để chắc mình đang ở đâu.

## Đi một vòng

### Lên dần tới gốc

```bash
pwd
cd ..
pwd
cd ..
pwd
```

```text
/home/hocvien
/home
/
```

Đứng ở `/` mà gõ `cd ..` thì vẫn ở `/`, vì gốc không có thư mục cha.

### Tuyệt đối và tương đối

```bash
cd /home/hocvien
pwd
cd /var
cd log
pwd
```

```text
/home/hocvien
/var/log
```

`cd /var` dùng đường dẫn tuyệt đối. Sau đó `cd log` là tương đối: tìm thư mục `log` bên trong `/var`.

### Quay lại chỗ cũ: cd -

```bash
cd /usr/bin
pwd
cd -
```

```text
/usr/bin
/var/log
```

`cd -` in luôn đường dẫn thư mục nó vừa quay về. Gõ `cd -` thêm lần nữa thì lại về `/usr/bin`: hai thư mục đổi qua đổi lại.

### Lên hai cấp

```bash
cd /usr/share/doc
cd ../..
pwd
```

```text
/usr
```

### Về nhà

```bash
cd ~
pwd
cd $HOME
pwd
```

```text
/home/hocvien
/home/hocvien
```

## Lỗi hay gặp

```bash
cd /khong-co
cd /etc/hostname
cd ~an
```

```text
bash: cd: /khong-co: No such file or directory
bash: cd: /etc/hostname: Not a directory
bash: cd: /home/an: Permission denied
```

| Lỗi | Nghĩa |
|---|---|
| `No such file or directory` | Đường dẫn không tồn tại. Kiểm tra chính tả, chữ hoa chữ thường. Dùng `Tab` để khỏi gõ sai |
| `Not a directory` | Đó là file, không phải thư mục. Chỉ `cd` vào thư mục được |
| `Permission denied` | Không có quyền vào. Trên Ubuntu 24.04, thư mục nhà của mỗi người chỉ chủ của nó mới vào được (bài 30 học về quyền) |

`~an` vẫn được hiểu đúng là `/home/an`, chỉ là bạn không có quyền vào.

## Mở rộng (chuẩn LPIC-1)

Shell lưu thư mục hiện hành trong biến `PWD`, và thư mục trước đó trong `OLDPWD`. `cd -` thực chất là `cd $OLDPWD`.

```bash
cd /etc
cd /tmp
echo $PWD $OLDPWD
```

```text
/tmp /etc
```

`pwd` và `cd` đều là lệnh có sẵn trong bash (builtin), tra bằng `help cd`, `help pwd`.

## Thực hành

Gõ lần lượt từng lệnh, đoán trước kết quả `pwd` rồi mới bấm `Enter`.

1. Từ thư mục nhà, đi tới `/var/log` bằng **một** lệnh, rồi quay về thư mục nhà bằng **hai** cách khác nhau.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   cd /var/log
   pwd
   cd
   pwd
   cd /var/log
   cd ~
   pwd
   ```

   Ngoài `cd` và `cd ~`, còn dùng được `cd $HOME`, hoặc `cd -` nếu thư mục nhà là chỗ vừa đứng trước đó.

   </details>

2. Đứng ở `/usr/share/doc`, đi tới `/usr/bin` bằng đường dẫn tương đối.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   cd /usr/share/doc
   cd ../../bin
   pwd
   ```

   Lên hai cấp tới `/usr`, rồi vào `bin`. Kết quả `/usr/bin`.

   </details>

3. Đi tới `/etc`, rồi `/usr/bin`, rồi gõ `cd -` hai lần. Mỗi lần bạn ở đâu?

   <details>
   <summary>Xem đáp án</summary>

   Lần `cd -` thứ nhất về `/etc`, lần thứ hai về lại `/usr/bin`.

   </details>

4. Gõ `cd /root`. Chuyện gì xảy ra, vì sao?

   <details>
   <summary>Xem đáp án</summary>

   Báo `Permission denied`. `/root` là thư mục nhà của root, người dùng thường không có quyền vào. Muốn xem thì dùng `sudo ls /root`.

   </details>

## Tóm tắt

| Lệnh | Làm gì |
|---|---|
| `pwd` | In thư mục hiện hành |
| `cd đường-dẫn` | Đi tới thư mục (tuyệt đối hoặc tương đối) |
| `cd ..` / `cd ../..` | Lên một cấp / hai cấp |
| `cd -` | Về thư mục vừa đứng |
| `cd`, `cd ~`, `cd $HOME` | Về thư mục nhà |
| `cd ~tên` | Tới thư mục nhà của người dùng khác |
