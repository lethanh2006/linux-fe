---
summary: Nhóm gom nhiều tài khoản lại để phân quyền một lần cho cả nhóm. Bài này giải thích GID, nhóm chính và nhóm phụ, rồi đọc 4 cột của file /etc/group.
minutes: 20
commands: [/etc/group, groups, id, getent group]
quiz:
  - q: "File `/etc/group` mỗi dòng có mấy cột?"
    options: ["7", "9", "4", "3"]
    answer: 2
    explain: "Tên nhóm : mật khẩu (x) : GID : danh sách thành viên phụ."
  - q: "Dòng `sudo:x:27:ubuntu,hocvien,chau` cho biết gì?"
    options: ["Nhóm sudo có GID 27, ba tài khoản là thành viên phụ", "Tài khoản sudo có UID 27", "Nhóm sudo có 27 thành viên", "sudo bị khoá"]
    answer: 0
    explain: "Cột 3 là GID, cột 4 là danh sách thành viên phụ ngăn bởi dấu phẩy."
  - q: "Tạo tài khoản `chau` bằng useradd mà không có `-g`, nhóm chính của `chau` là gì?"
    options: ["Nhóm root", "Nhóm users", "Nhóm mới cùng tên chau", "Không có nhóm"]
    answer: 2
    explain: "Ubuntu tạo cho mỗi tài khoản một nhóm riêng cùng tên, GID thường bằng UID."
  - q: "Dòng `chau:x:1004:` trong /etc/group có cột cuối trống. Vì sao `chau` vẫn thuộc nhóm này?"
    options: ["Vì lỗi", "Vì đây là nhóm chính của chau, ghi ở cột GID của /etc/passwd, không ghi lại ở /etc/group", "Vì chau là root", "Vì cột cuối chỉ ghi root"]
    answer: 1
    explain: "Cột 4 của /etc/group chỉ liệt kê thành viên **phụ**. Nhóm chính nằm ở cột 4 của /etc/passwd."
  - q: Lệnh nào liệt kê các nhóm của bạn?
    options: ["whoami", "groups", "pwd", "users"]
    answer: 1
    explain: "`groups` (hoặc `id`) in các nhóm của tài khoản hiện tại. `groups tên` cho tài khoản khác."
---

> Bài này đi theo video TITV bài 28. Bài này chỉ đọc và hiểu; bài 29 mới tạo, sửa, xoá nhóm.

## Nhóm là gì

**Nhóm** (group) gom nhiều tài khoản lại. Thay vì cấp quyền cho từng người, bạn cấp cho cả nhóm: ví dụ mọi người trong nhóm `marketing` được sửa thư mục tài liệu marketing (phân quyền học ở bài 30).

- Mỗi nhóm có **tên duy nhất** và một số **GID** (group ID).
- Mỗi tài khoản có đúng **một nhóm chính** (primary group) và có thể thuộc **nhiều nhóm phụ** (supplementary group).
- File mới tạo thuộc về nhóm chính của người tạo.

Khi tạo tài khoản bằng `useradd`:

| Cách tạo | Nhóm chính |
|---|---|
| Không có `-g` | Tạo nhóm mới **cùng tên** với tài khoản. GID thường bằng UID |
| Có `-g marketing` | Đưa vào nhóm `marketing` có sẵn |

## Xem nhóm của mình

```bash
groups
groups chau
id -gn chau
```

```text
hocvien sudo
chau : chau sudo
chau
```

| Lệnh | Cho biết |
|---|---|
| `groups` | Các nhóm của bạn. Nhóm đầu tiên là nhóm chính |
| `groups tên` | Các nhóm của tài khoản khác |
| `id -gn tên` | Chỉ nhóm chính (**g**roup, in tên thay cho số: **n**ame) |

## File /etc/group

Danh sách nhóm nằm trong `/etc/group`. **Mọi người dùng đọc được**, chỉ root sửa được.

```bash
cat /etc/group
```

```text
root:x:0:
daemon:x:1:
bin:x:2:
sys:x:3:
adm:x:4:ubuntu
tty:x:5:
disk:x:6:
...
sudo:x:27:ubuntu,hocvien,chau
...
www-data:x:33:
...
users:x:100:
nogroup:x:65534:
ubuntu:x:1000:
...
hocvien:x:1001:
an:x:1002:
chau:x:1004:
```

(File thật có 47 dòng; `...` là các dòng được bỏ bớt.) Mỗi dòng có **4 cột ngăn bởi dấu `:`**:

| Cột | Ví dụ `sudo:x:27:ubuntu,hocvien,chau` | Ý nghĩa |
|---|---|---|
| 1 | `sudo` | Tên nhóm |
| 2 | `x` | Mật khẩu nhóm. `x` nghĩa là nằm trong `/etc/gshadow` (ít khi dùng) |
| 3 | `27` | GID |
| 4 | `ubuntu,hocvien,chau` | Danh sách thành viên **phụ**, ngăn bởi dấu phẩy |

Vài nhóm có sẵn đáng biết:

| Nhóm | Thành viên được làm gì |
|---|---|
| `sudo` | Dùng lệnh `sudo` (bài 8). Trên họ Red Hat là nhóm `wheel` |
| `adm` | Đọc nhật ký hệ thống trong `/var/log` |
| `www-data` | Nhóm của máy chủ web |
| `users` | Nhóm chung cho người dùng thường |

### Vì sao cột 4 của nhóm `chau` trống?

Dòng `chau:x:1004:` không liệt kê `chau`, nhưng `chau` vẫn thuộc nhóm này. Đó là **nhóm chính** của `chau`, đã ghi ở cột GID của `/etc/passwd` (`chau:x:1004:1004:...`). Cột 4 của `/etc/group` chỉ ghi thành viên **phụ**.

## Mở rộng (chuẩn LPIC-1)

Chuẩn LPIC-1 mục 107.1 còn có:

| Mục | Nội dung |
|---|---|
| `/etc/gshadow` | Mật khẩu nhóm và người quản lý nhóm. Như `/etc/shadow`, chỉ root (và nhóm `shadow`) đọc được |
| `getent group tên` | Tra nhóm qua mọi nguồn, kể cả máy chủ tài khoản tập trung |
| Dải GID | Giống UID: dưới 1000 cho nhóm hệ thống, từ 1000 cho người dùng |
| `newgrp tên-nhóm` | Mở shell mới với nhóm chính tạm thời là nhóm đó (phải là thành viên) |

```bash
ls -l /etc/group /etc/gshadow
sudo grep -E "^(sudo|chau):" /etc/gshadow
```

```text
-rw-r--r-- 1 root root   644 Nov 27 19:46 /etc/group
-rw-r----- 1 root shadow 546 Nov 27 19:46 /etc/gshadow
sudo:*::ubuntu,hocvien,chau
chau:!::
```

`/etc/gshadow` có 4 cột: tên, mật khẩu nhóm (`*` hoặc `!` là không có), người quản lý nhóm, thành viên.

Một điều hay gặp: vừa được thêm vào nhóm mới nhưng `groups` chưa thấy. Danh sách nhóm được nạp **lúc đăng nhập**, nên phải đăng xuất rồi đăng nhập lại (hoặc mở phiên mới bằng `su - tên`).

## Thực hành

1. Máy có bao nhiêu nhóm?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   wc -l /etc/group
   ```

   </details>

2. Những tài khoản nào được dùng `sudo`?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   grep ^sudo: /etc/group
   ```

   Danh sách ở cột cuối. Muốn chỉ lấy danh sách: `grep ^sudo: /etc/group | cut -d : -f 4`.

   </details>

3. Nhóm chính của bạn có GID bao nhiêu? Tìm theo hai cách.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   id
   grep "^$USER:" /etc/passwd | cut -d : -f 4
   ```

   Số sau `gid=` trong `id`, hoặc cột 4 của dòng bạn trong `/etc/passwd`.

   </details>

## Tóm tắt

| Ý | Ghi nhớ |
|---|---|
| Nhóm | Gom tài khoản để phân quyền chung. Có tên và GID |
| Nhóm chính | Một nhóm, ghi ở cột 4 của `/etc/passwd`. Mặc định cùng tên tài khoản |
| Nhóm phụ | Nhiều nhóm, ghi ở cột 4 của `/etc/group` |
| `/etc/group` | 4 cột: tên, x, GID, thành viên phụ |
| `groups`, `id` | Xem nhóm của mình |
