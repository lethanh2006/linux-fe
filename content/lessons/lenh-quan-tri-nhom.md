---
summary: Tạo nhóm bằng groupadd, đổi GID và đổi tên bằng groupmod, xoá bằng groupdel, đưa tài khoản vào nhóm khi tạo (useradd -g) hoặc sau đó (usermod -aG, gpasswd). Hiểu vì sao không xoá được nhóm chính của một tài khoản.
minutes: 30
commands: [groupadd, groupmod, groupdel, gpasswd, useradd -g, usermod -aG]
quiz:
  - q: "Lệnh nào tạo nhóm `sales` với GID 555?"
    options: ["sudo groupadd sales 555", "sudo groupadd -g 555 sales", "sudo groupmod -g 555 sales", "sudo useradd -g 555 sales"]
    answer: 1
    explain: "`groupadd -g GID tên` tạo nhóm với GID chỉ định. `groupmod -g` là đổi GID của nhóm đã có."
  - q: "`sudo groupmod -n accounting sales` làm gì?"
    options: ["Tạo nhóm accounting", "Đổi tên nhóm sales thành accounting", "Đổi tên nhóm accounting thành sales", "Thêm sales vào accounting"]
    answer: 1
    explain: "`-n tên-mới`, rồi tới tên hiện tại ở cuối. GID giữ nguyên."
  - q: "`sudo groupdel marketing` báo `cannot remove the primary group of user 'nv1'`. Phải làm gì?"
    options: ["Thêm -f", "Xoá nv1 hoặc đổi nhóm chính của nv1 sang nhóm khác trước", "Khởi động lại", "Đổi tên nhóm"]
    answer: 1
    explain: "Không xoá được nhóm đang là nhóm chính của ai đó. Xoá tài khoản đó, hoặc `usermod -g nhóm-khác nv1`, rồi mới `groupdel`."
  - q: "Thêm `nv1` vào nhóm phụ `accounting` mà giữ các nhóm cũ, lệnh nào đúng?"
    options: ["sudo usermod -G accounting nv1", "sudo usermod -g accounting nv1", "sudo usermod -aG accounting nv1", "sudo groupadd nv1 accounting"]
    answer: 2
    explain: "`-a` (append) giữ các nhóm phụ cũ. Thiếu `-a` thì danh sách nhóm phụ bị thay hẳn. `-g` là đổi nhóm chính."
  - q: "`sudo groupadd -g 555 ketoan` báo `GID '555' already exists`. Vì sao?"
    options: ["Tên ketoan đã có", "GID 555 đã thuộc nhóm khác", "Thiếu quyền", "GID phải lớn hơn 1000"]
    answer: 1
    explain: "Mỗi GID chỉ thuộc một nhóm. Chọn số khác hoặc bỏ `-g` để hệ thống tự cấp."
---

> Bài này đi theo video TITV bài 29. Chỉ tạo, sửa, xoá các nhóm và tài khoản thử trong bài (`marketing`, `sales`, `nv1`, `nv2`).

Như lệnh tài khoản, lệnh nhóm sửa file hệ thống nên cần root:

```bash
groupadd marketing
```

```text
groupadd: Permission denied.
groupadd: cannot lock /etc/group; try again later.
```

## groupadd: tạo nhóm

```text
groupadd [-g GID] tên-nhóm
```

```bash
sudo groupadd marketing
tail -1 /etc/group
```

```text
marketing:x:1005:
```

Nhóm mới nằm cuối `/etc/group`, chưa có thành viên phụ (cột 4 trống). Không ghi `-g` thì hệ thống tự chọn GID.

### Đưa tài khoản vào nhóm ngay khi tạo

```bash
sudo useradd -m -s /bin/bash -g marketing nv1
sudo useradd -m -s /bin/bash -g marketing nv2
id nv1
tail -2 /etc/passwd
grep marketing /etc/group
```

```text
uid=1005(nv1) gid=1005(marketing) groups=1005(marketing)
nv1:x:1005:1005::/home/nv1:/bin/bash
nv2:x:1006:1005::/home/nv2:/bin/bash
marketing:x:1005:
```

`-g marketing` làm `marketing` thành **nhóm chính** của `nv1`, `nv2`: cột GID trong `/etc/passwd` của cả hai là `1005`. Vì là nhóm chính, tên họ **không** xuất hiện ở cột 4 của `/etc/group` (bài 28). Lần này `useradd` cũng không tạo nhóm riêng tên `nv1`, `nv2`.

### Chọn GID: -g

```bash
sudo groupadd -g 555 sales
grep sales /etc/group
sudo groupadd -g 555 ketoan
```

```text
sales:x:555:
groupadd: GID '555' already exists
```

Mỗi GID chỉ thuộc một nhóm.

## groupmod: sửa nhóm

| Tuỳ chọn | Ý nghĩa |
|---|---|
| `-g GID-mới` | Đổi GID |
| `-n tên-mới` | Đổi tên. Tên hiện tại ghi ở cuối lệnh |

```bash
sudo groupmod -g 666 sales
grep sales /etc/group
sudo groupmod -n accounting sales
grep -E "^(sales|accounting):" /etc/group
```

```text
sales:x:666:
accounting:x:666:
```

Đổi tên giữ nguyên GID 666. Lưu ý khi đổi GID: các file đang thuộc nhóm (lưu bằng số GID cũ) **không tự đổi theo**, nên sẽ hiện là số 555 thay vì tên nhóm. Phải tự `chgrp` (bài 31) các file đó. Đừng đổi GID của nhóm hệ thống.

## Thêm, bớt thành viên phụ

```bash
sudo usermod -aG accounting nv1
id nv1
grep accounting /etc/group
```

```text
uid=1005(nv1) gid=1005(marketing) groups=1005(marketing),666(accounting)
accounting:x:666:nv1
```

`nv1` giữ nhóm chính `marketing` và có thêm nhóm phụ `accounting`, nên giờ `nv1` xuất hiện ở cột 4. Cách khác để thêm, bớt thành viên là `gpasswd`:

```bash
sudo gpasswd -a nv2 accounting
sudo gpasswd -d nv1 accounting
grep accounting /etc/group
```

```text
Adding user nv2 to group accounting
Removing user nv1 from group accounting
accounting:x:666:nv2
```

| Lệnh | Làm gì |
|---|---|
| `usermod -aG nhóm tên` | Thêm `tên` vào nhóm phụ. Thiếu `-a` là **thay** toàn bộ nhóm phụ |
| `gpasswd -a tên nhóm` | Thêm (**a**dd) thành viên |
| `gpasswd -d tên nhóm` | Bớt (**d**elete) thành viên |
| `usermod -g nhóm tên` | Đổi **nhóm chính** |

Tài khoản đang đăng nhập phải đăng nhập lại mới thấy nhóm mới.

## groupdel: xoá nhóm

```bash
sudo groupdel accounting
grep accounting /etc/group
```

Không in gì: nhóm đã bị xoá (thành viên phụ chỉ mất nhóm đó, tài khoản vẫn còn).

Xoá nhóm đang là **nhóm chính** của ai đó thì bị từ chối:

```bash
sudo groupdel marketing
```

```text
groupdel: cannot remove the primary group of user 'nv1'
```

Phải xoá các tài khoản đó trước (hoặc đổi nhóm chính của họ bằng `usermod -g`):

```bash
sudo userdel -r nv1
sudo userdel -r nv2
sudo groupdel marketing
grep marketing /etc/group
```

```text
userdel: nv1 mail spool (/var/mail/nv1) not found
userdel: nv2 mail spool (/var/mail/nv2) not found
```

Lần này `groupdel` chạy được, `grep` không còn thấy `marketing`.

### Câu hỏi cuối video: xoá nhóm cùng mọi tài khoản trong nhóm một lần?

Không có lệnh nào làm cả hai việc. Cách làm: tìm các tài khoản có nhóm chính là nhóm đó (cột 4 của `/etc/passwd` bằng GID của nhóm), xoá từng tài khoản, rồi xoá nhóm. Ví dụ với GID 1005:

```bash
cut -d : -f 1,4 /etc/passwd | grep ":1005$"
```

Kết quả là danh sách `tên:1005`; xoá từng tài khoản bằng `userdel -r`, rồi `groupdel`. Phần lập trình Bash (mở rộng) dạy cách dùng vòng lặp để làm tự động.

## Mở rộng (chuẩn LPIC-1)

| Lệnh, file | Ý nghĩa |
|---|---|
| `addgroup tên` | Lệnh thân thiện của Debian/Ubuntu, giống `groupadd` |
| `groupadd -r tên` | Tạo nhóm hệ thống (GID dưới 1000) |
| `gpasswd -A tên nhóm` | Đặt người quản lý nhóm (ghi ở `/etc/gshadow`), người này tự thêm bớt thành viên được |
| `getent group tên` | Xem nhóm và thành viên |
| `find / -group 555` | Tìm file còn thuộc GID cũ sau khi đổi GID |

## Thực hành

1. Tạo nhóm `dev` (GID 2000) và nhóm `test`. Kiểm tra trong `/etc/group`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo groupadd -g 2000 dev
   sudo groupadd test
   grep -E "^(dev|test):" /etc/group
   ```

   </details>

2. Tạo tài khoản `lt1` có nhóm chính `dev`, nhóm phụ `test`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo useradd -m -s /bin/bash -g dev -G test lt1
   id lt1
   ```

   </details>

3. Đổi tên nhóm `test` thành `qa`. `lt1` có còn thuộc nhóm đó không?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo groupmod -n qa test
   id lt1
   ```

   Còn: GID không đổi, nên `id` hiện nhóm phụ tên mới là `qa`.

   </details>

4. Xoá nhóm `dev`. Nếu bị từ chối, xử lý cho xoá được, rồi dọn hết tài khoản và nhóm vừa tạo.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sudo groupdel dev
   sudo userdel -r lt1
   sudo groupdel dev
   sudo groupdel qa
   ```

   Lần đầu bị từ chối vì `dev` là nhóm chính của `lt1`.

   </details>

## Tóm tắt

| Lệnh | Làm gì |
|---|---|
| `groupadd [-g GID] nhóm` | Tạo nhóm |
| `groupmod -g GID nhóm` | Đổi GID |
| `groupmod -n tên-mới tên-cũ` | Đổi tên nhóm |
| `groupdel nhóm` | Xoá nhóm (không xoá được nhóm chính của ai đó) |
| `useradd -g nhóm tên` | Tạo tài khoản với nhóm chính có sẵn |
| `usermod -aG nhóm tên` | Thêm nhóm phụ |
| `gpasswd -a` / `-d tên nhóm` | Thêm / bớt thành viên |
