---
summary: "Tạo và đổi nhóm, thêm thành viên bằng usermod -aG, phân biệt nhóm chính và nhóm phụ, hiểu vì sao groupdel từ chối nhóm chính đang được sử dụng."
minutes: 35
commands: ["groupadd", "groupmod", "groupdel", "usermod -aG", "getent group", "id"]
quiz:
  - q: "groupmod -n nhom_moi nhom_cu làm gì?"
    options: ["Đổi tên nhom_cu thành nhom_moi", "Tạo user nhom_moi", "Xoá cả hai nhóm", "Chuyển mọi file sang root"]
    answer: 0
    explain: "-n nhận tên mới, đối số cuối là tên nhóm hiện tại."
  - q: "Vì sao groupdel có thể từ chối xoá một nhóm?"
    options: ["Tên nhóm không có dấu gạch", "Nhóm có quá nhiều chữ", "Nhóm đang là nhóm chính của một user", "Nhóm được tạo bằng groupadd"]
    answer: 2
    explain: "Phải xử lý quan hệ nhóm chính, chẳng hạn chuyển user thử nghiệm sang nhóm chính phù hợp trước. Không bắt buộc xoá user."
  - q: "Đổi GID bằng groupmod có tự sửa mọi file mang GID cũ không?"
    options: ["Có, toàn bộ máy", "Không; phải kiểm tra và xử lý quyền sở hữu file liên quan", "Chỉ nếu nhóm có ít thành viên", "Chỉ đổi tên file"]
    answer: 1
    explain: "Metadata của các file dùng GID; đổi định nghĩa nhóm không tự quét hết filesystem để sửa mọi file."
  - q: "Sau khi được thêm vào nhóm phụ, terminal cũ chưa nhận nhóm mới thì nên làm gì?"
    options: ["chmod 777 /etc/group", "Xoá user", "Khởi động lại router", "Đăng xuất/đăng nhập lại, rồi kiểm tra id"]
    answer: 3
    explain: "Danh sách nhóm của tiến trình được thiết lập khi tạo phiên. Phiên mới giúp nhận cập nhật nhóm."
---

> Bám video TITV bài 29. Dùng tài khoản `sv_demo` tạo ở bài 27 và chỉ thay đổi các nhóm có hậu tố `_lab` do mình tạo.

## Tạo nhóm

```bash
sudo groupadd du_an_lab
getent group du_an_lab
```

| Phần | Ý nghĩa |
|---|---|
| `groupadd` | Tạo nhóm mới |
| `du_an_lab` | Tên nhóm mới |
| `getent group` | Tra lại định nghĩa nhóm |

Kết quả có dạng `du_an_lab:x:GID:` với GID do hệ thống chọn. Tuỳ chọn `groupadd -g SỐ tên` cho phép chọn GID chưa dùng; trước khi chọn cần kiểm tra xung đột. Trong lab người mới, để hệ thống chọn thường đơn giản hơn.

Nếu báo nhóm đã tồn tại, dùng `getent group du_an_lab` để xem. Không xoá nhóm có sẵn chỉ để lệnh tạo nhóm chạy lại được.

## Thêm một thành viên mà giữ nhóm cũ

```bash
sudo usermod -aG du_an_lab sv_demo
id sv_demo
```

| Phần | Ý nghĩa |
|---|---|
| `usermod` | Đổi thuộc tính tài khoản |
| `-a` | Bổ sung, không thay toàn bộ danh sách nhóm phụ |
| `-G du_an_lab` | Nhóm phụ cần thêm |
| `sv_demo` | Tài khoản nhận thay đổi |

Nhóm chính của `sv_demo` vẫn giữ nguyên. Để đổi nhóm chính dùng `usermod -g nhóm user`, một việc khác với thêm nhóm phụ. Nếu tạo user ngay từ đầu với nhóm chính đã có, dùng `useradd -g nhóm ... user`.

Sau khi đổi nhóm phụ, phiên đăng nhập đang mở có thể vẫn giữ nhóm cũ. Đăng nhập lại user rồi chạy `id` để quan sát nhóm hiệu lực trong phiên mới.

## Đổi tên và GID

Tạo một nhóm riêng để thử đổi tên:

```bash
sudo groupadd nhom_cu_lab
sudo groupmod -n nhom_moi_lab nhom_cu_lab
getent group nhom_moi_lab
```

`-n` là tên mới, đối số cuối là tên hiện tại. Đổi tên giữ nguyên GID, nên quyền sở hữu nhóm trên file vẫn được nhận diện theo cùng mã số.

`groupmod -g GID_MỚI nhóm` đổi GID. Việc này cần xem xét file đang mang GID cũ: công cụ không tự quét và sửa quyền sở hữu của mọi file trên hệ thống. Không đổi GID của nhóm hệ thống để làm bài tập.

## Xoá nhóm và nhóm chính

```bash
sudo groupdel nhom_moi_lab
```

`groupdel` xoá định nghĩa nhóm, không xoá các file “thuộc nhóm đó”. File có thể còn lưu GID nhưng không còn tên nhóm để hiển thị. Cũng không dùng groupdel để xoá hàng loạt user.

Nếu nhóm đang là nhóm chính của một tài khoản, công cụ thường từ chối xoá. Cách xử lý là xác định user liên quan và chuyển nhóm chính phù hợp nếu đó đúng là ý định quản trị. Không bắt buộc phải xoá user như một lối tắt.

Ví dụ chỉ dành cho tài khoản thử nghiệm mới:

```bash
sudo groupadd nhom_tam_lab
sudo useradd -m -g nhom_tam_lab -s /bin/bash sv_nhom_tap
sudo usermod -g du_an_lab sv_nhom_tap
sudo groupdel nhom_tam_lab
sudo userdel -r sv_nhom_tap
```

Ở đây user được chuyển khỏi nhóm chính tạm trước khi nhóm tạm bị xoá. Khi đổi nhóm chính còn phải kiểm tra quyền sở hữu các file liên quan, đặc biệt file ngoài home; các lệnh này không thay thế việc đánh giá dữ liệu thực tế.

## Thực hành

Tạo nhóm `doc_lab`, thêm `sv_demo` làm thành viên phụ rồi kiểm tra. Tạo và đổi tên nhóm `doi_lab` thành `da_doi_lab`, sau đó chỉ xoá nhóm vừa đổi tên. Giữ `du_an_lab` để dùng ở bài phân quyền.

<details>
<summary>Xem đáp án</summary>

```bash
sudo groupadd doc_lab
sudo usermod -aG doc_lab sv_demo
id sv_demo
getent group doc_lab
sudo groupadd doi_lab
sudo groupmod -n da_doi_lab doi_lab
getent group da_doi_lab
sudo groupdel da_doi_lab
```

`id sv_demo` phải còn nhóm chính và các nhóm phụ cũ, đồng thời có thêm `doc_lab`.

</details>

## Tóm tắt

`groupadd` tạo, `groupmod` đổi, `groupdel` xoá định nghĩa nhóm. Thêm nhóm phụ bằng `usermod -aG`; đổi nhóm chính bằng `-g`. Kiểm tra user, GID và file liên quan trước khi đổi hoặc xoá nhóm.
