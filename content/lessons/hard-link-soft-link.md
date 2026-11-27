---
summary: "Thực hành ln và ln -s để thấy hard link dùng chung inode còn symbolic link giữ một đường dẫn. Kiểm tra điều gì xảy ra khi sửa, di chuyển hoặc xoá tên gốc."
minutes: 35
commands: ["ln", "ln -s", "ls -li", "readlink", "stat"]
quiz:
  - q: "Hai hard link của cùng một file có đặc điểm gì?"
    options: ["Cùng inode trên cùng filesystem", "Luôn có inode khác nhau", "Mỗi tên có bản sao dữ liệu độc lập", "Luôn trỏ bằng đường dẫn tuyệt đối"]
    answer: 0
    explain: "Hard link là nhiều tên thư mục tham chiếu cùng inode; sửa nội dung qua một tên sẽ thấy qua tên kia."
  - q: "Xoá file đích của một symbolic link thường gây ra điều gì?"
    options: ["Link thành hard link", "Dữ liệu tự sao chép sang link", "Link vẫn chứa đường dẫn nhưng không còn tìm thấy đích", "Link tự chuyển sang file khác"]
    answer: 2
    explain: "Symbolic link giữ một đường dẫn. Nếu đường dẫn đó không còn dẫn tới đích tồn tại, link bị treo."
  - q: "Đường dẫn tương đối nằm trong symlink được hiểu từ đâu?"
    options: ["Thư mục hiện hành của người vừa chạy cat", "Luôn từ /", "Từ home của root", "Từ thư mục chứa chính symlink"]
    answer: 3
    explain: "Điều này giải thích vì sao di chuyển symlink sang thư mục khác có thể làm nó hỏng."
  - q: "Hard link có phải bản sao lưu độc lập để chống sửa nhầm nội dung không?"
    options: ["Có, vì có tên khác", "Không, vì các tên cùng trỏ một dữ liệu", "Có, nếu tên có đuôi .bak", "Chỉ khi dùng ln -s"]
    answer: 1
    explain: "Sửa hoặc ghi đè nội dung cùng inode tác động tới mọi hard link. Cần bản sao độc lập/phiên bản sao lưu cho mục tiêu này."
---

> Bám video TITV bài 32. Toàn bộ thí nghiệm đặt trong một thư mục riêng để việc xoá tên file không ảnh hưởng tài liệu thật.

## Tên file và inode

Một thư mục ánh xạ tên file tới inode trên một filesystem. Inode lưu thông tin như chủ sở hữu, quyền, kích cỡ và tham chiếu dữ liệu. Tên file không phải bản thân dữ liệu.

```bash
mkdir -p ~/thuc-hanh/bai32
cd ~/thuc-hanh/bai32
printf 'Du lieu ban dau\n' > goc.txt
ls -li goc.txt
```

`-l` hiển thị chi tiết, `-i` thêm số inode. Giá trị inode khác nhau giữa các máy; hai file có cùng số inode chỉ có ý nghĩa khi xét cùng filesystem.

## Hard link: nhiều tên, một inode

```bash
ln goc.txt ten-khac.txt
ls -li goc.txt ten-khac.txt
printf 'Noi dung moi\n' >> ten-khac.txt
cat goc.txt
```

| Phần | Ý nghĩa |
|---|---|
| `ln` | Tạo hard link theo mặc định |
| `goc.txt` | Tên đang tồn tại của file |
| `ten-khac.txt` | Tên mới cần tạo |
| `>>` | Thêm vào cuối dữ liệu, không tạo bản sao độc lập |

Kết quả `cat goc.txt`:

```text
Du lieu ban dau
Noi dung moi
```

Trong `ls -li`, hai tên có cùng inode và số hard link tăng. Không có tên nào là “bản chính” được ưu tiên hơn về dữ liệu.

```bash
rm goc.txt
cat ten-khac.txt
```

Nội dung vẫn còn qua tên kia. Dữ liệu chỉ có thể được giải phóng khi không còn hard link và không còn tiến trình giữ file mở. Hard link thông thường không tạo được cho thư mục và không vượt qua ranh giới filesystem.

Hard link giúp có nhiều tên cho cùng dữ liệu, nhưng **không phải bản sao lưu độc lập** chống sửa nhầm. Sửa nội dung qua một tên sẽ thay đổi dữ liệu nhìn qua tên khác.

## Symbolic link: lưu một đường dẫn

```bash
ln -s ten-khac.txt loi-tat.txt
ls -l loi-tat.txt
readlink loi-tat.txt
cat loi-tat.txt
```

| Phần | Ý nghĩa |
|---|---|
| `ln -s` | Tạo symbolic link |
| `ten-khac.txt` | Đường dẫn đích được lưu trong link |
| `loi-tat.txt` | Tên symlink mới |
| `readlink` | Đọc đường dẫn đang được lưu trong symlink |

Kết quả `readlink loi-tat.txt`:

```text
ten-khac.txt
```

Symlink có inode riêng, dùng được cho thư mục và có thể trỏ sang filesystem khác. Đích thậm chí có thể chưa tồn tại lúc tạo link.

Đích tương đối được tính từ **thư mục chứa symlink**, không phải thư mục hiện hành của người đang đọc. Ví dụ, link `thu-muc/link` chứa `../du-lieu.txt` sẽ đi lên từ `thu-muc` rồi tìm `du-lieu.txt`.

```bash
rm ten-khac.txt
cat loi-tat.txt
```

Với ví dụ trên, đích cuối cùng đã bị xoá; `cat` báo không tìm thấy file. Symlink vẫn tồn tại và vẫn lưu chuỗi `ten-khac.txt`. Xoá chính symlink bằng `rm loi-tat.txt` không xoá file đích.

## So sánh nhanh

| Đặc điểm | Hard link | Symbolic link |
|---|---|---|
| Inode | Cùng inode với tên nguồn | Inode riêng |
| Qua filesystem khác | Không | Có |
| Trỏ tới thư mục | Không dùng thông thường | Có |
| Đích không còn | Tên còn lại vẫn truy cập dữ liệu | Link có thể bị treo |
| Chống sửa nhầm nội dung | Không | Không |

## Thực hành

Trong thư mục mới `~/thuc-hanh/bai32-tu-lam`, tạo `ban-goc.txt`, hard link `cung-du-lieu.txt`, symlink `tham-chieu.txt`. Xoá `ban-goc.txt` rồi dự đoán tên nào còn đọc được. Giải thích trước khi chạy `cat`.

<details>
<summary>Xem đáp án</summary>

```bash
mkdir -p ~/thuc-hanh/bai32-tu-lam
cd ~/thuc-hanh/bai32-tu-lam
printf 'Mau lien ket\n' > ban-goc.txt
ln ban-goc.txt cung-du-lieu.txt
ln -s ban-goc.txt tham-chieu.txt
rm ban-goc.txt
cat cung-du-lieu.txt
readlink tham-chieu.txt
```

Hard link đọc được `Mau lien ket`. Symlink vẫn lưu `ban-goc.txt`, nhưng tên đích này đã mất nên đọc qua `tham-chieu.txt` sẽ lỗi. Muốn symlink hoạt động lại có thể tạo lại đích hoặc tạo link mới trỏ tới tên đang còn.

</details>

## Tóm tắt

Dùng `ln` để thêm tên cho cùng inode, dùng `ln -s` để lưu đường dẫn tham chiếu. Khi phân tích link hỏng, kiểm tra đích và cách đường dẫn tương đối được giải quyết.
