---
summary: Năm lệnh xem nội dung file. cat in cả file, more và less xem từng trang, head lấy phần đầu, tail lấy phần cuối. Kèm wc đếm dòng, tail -f theo dõi nhật ký và sha256sum kiểm tra file.
minutes: 25
commands: [cat, more, less, head, tail, wc, tail -f]
quiz:
  - q: "`tail test.txt` (không có tuỳ chọn) in ra mấy dòng?"
    options: ["5 dòng cuối", "1 dòng cuối", "10 dòng cuối", "Cả file"]
    answer: 2
    explain: "`head` và `tail` mặc định lấy 10 dòng. Muốn số khác thì dùng `-n N` hoặc viết tắt `-N`."
  - q: Lệnh nào xem file dài và đi lùi lên trên được bằng phím mũi tên?
    options: ["cat", "less", "more", "head"]
    answer: 1
    explain: "`less` cho cuộn lên xuống tự do. `more` chủ yếu đi tới; `cat` in hết một lèo."
  - q: Đang xem file bằng `less`, bấm phím nào để thoát?
    options: ["q", "Esc", "Ctrl+X", ":wq"]
    answer: 0
    explain: "`q` (quit) thoát `less`, `more` và `man`."
  - q: Muốn xem 3 dòng đầu của `nhatky.txt` thì gõ gì?
    options: ["tail -3 nhatky.txt", "head nhatky.txt", "cat -3 nhatky.txt", "head -n 3 nhatky.txt"]
    answer: 3
    explain: "`head -n 3` (hoặc `head -3`) lấy 3 dòng đầu."
  - q: Lệnh nào giữ file nhật ký mở và in thêm mỗi khi có dòng mới?
    options: ["tail -f nhatky.txt", "cat -f nhatky.txt", "head -f nhatky.txt", "less -n nhatky.txt"]
    answer: 0
    explain: "`tail -f` (follow) in 10 dòng cuối rồi chờ, in tiếp dòng mới. Bấm `Ctrl+C` để dừng."
---

> Bài này đi theo video TITV bài 12.

## Tạo file để thực hành

Cần một file nhiều dòng. Bạn có thể mở trình soạn thảo (Text Editor) gõ tay 20 dòng, hoặc chạy hai lệnh dưới đây. Cách hai lệnh này chạy sẽ rõ ở các bài sau.

```bash
mkdir -p ~/thuchanh/bai12 && cd ~/thuchanh/bai12
printf 'dong %s\n' {1..10} > test.txt
printf '%sx\n' {1..10} >> test.txt
```

File `test.txt` có 20 dòng: `dong 1` tới `dong 10`, rồi `1x` tới `10x`.

## Năm lệnh xem file

| Lệnh | Làm gì |
|---|---|
| `cat file` | In **toàn bộ** file ra màn hình một lèo |
| `more file` | Xem từng trang, chỉ đi tới |
| `less file` | Xem từng trang, đi tới đi lui tự do, tìm kiếm được |
| `head [-n N] file` | In N dòng **đầu**, mặc định 10 |
| `tail [-n N] file` | In N dòng **cuối**, mặc định 10 |

## cat: in cả file

```bash
cat test.txt
```

```text
dong 1
dong 2
dong 3
dong 4
dong 5
dong 6
dong 7
dong 8
dong 9
dong 10
1x
2x
3x
4x
5x
6x
7x
8x
9x
10x
```

`cat` (con**cat**enate, nối) hợp với file ngắn. File dài hàng nghìn dòng thì chữ trôi qua mất, chỉ thấy đoạn cuối; khi đó dùng `less`.

## more và less: xem từng trang

```bash
more test.txt
less test.txt
```

Cả hai hiện vừa một màn hình rồi chờ bạn bấm phím:

| Phím | `more` | `less` |
|---|---|---|
| `Space` | Trang sau | Trang sau |
| `Enter` | Một dòng nữa | Một dòng nữa |
| `↑` `↓`, `PgUp` `PgDn` | Không | Cuộn lên xuống tự do |
| `b` | Lùi một trang | Lùi một trang |
| `/từ` rồi `Enter` | Tìm | Tìm; `n` kết quả sau, `N` kết quả trước |
| `g` / `G` | Không | Về đầu / xuống cuối file |
| `q` | Thoát | Thoát |

`more` có từ lâu, gần như chỉ đi tới. `less` ra đời sau, đi lùi được, nên thường dùng `less`. Nhớ câu "less is more": `less` làm được hết việc của `more`. Trang `man` cũng hiện bằng `less`, nên các phím giống nhau.

Nếu file ngắn hơn một màn hình, `more` in hết rồi thoát ngay.

## head: xem phần đầu

```bash
head test.txt
head -n 5 test.txt
```

| Phần | Ý nghĩa |
|---|---|
| `head` | In phần đầu file, mặc định 10 dòng |
| `-n 5` | Lấy 5 dòng. Viết tắt được thành `-5` |

```text
dong 1
dong 2
dong 3
dong 4
dong 5
```

## tail: xem phần cuối

```bash
tail -n 5 test.txt
tail -2 test.txt
```

```text
6x
7x
8x
9x
10x
9x
10x
```

`tail` hay dùng để xem nhật ký: dòng mới luôn được ghi xuống cuối file, nên vài dòng cuối là chuyện vừa xảy ra.

> Python cũng có `head()`, `tail()` trong thư viện pandas để xem vài dòng đầu, cuối của bảng dữ liệu. Ý tưởng giống hệt.

## Mở rộng (chuẩn LPIC-1)

Chuẩn LPIC-1 mục 103.2 còn có các lệnh sau.

### tail -f: theo dõi nhật ký đang được ghi

```bash
tail -f test.txt
```

| Phần | Ý nghĩa |
|---|---|
| `-f` | **f**ollow: in 10 dòng cuối rồi **không thoát**, chờ và in tiếp mỗi dòng mới ghi vào |

Thử: mở hai terminal. Terminal 1 chạy `tail -f ~/thuchanh/bai12/test.txt`. Terminal 2 gõ `echo "dong moi" >> ~/thuchanh/bai12/test.txt`. Terminal 1 lập tức hiện thêm dòng mới. Bấm `Ctrl+C` để dừng. Đây là cách xem nhật ký của một chương trình đang chạy.

Lấy từ dòng thứ N tới hết file: `tail -n +18 test.txt` in dòng 18, 19, 20.

### wc: đếm dòng, từ, byte

```bash
wc test.txt
wc -l /etc/passwd /etc/group
```

| Phần | Ý nghĩa |
|---|---|
| `wc` | Đếm (**w**ord **c**ount). Không tuỳ chọn thì in số dòng, số từ, số byte |
| `-l` | Chỉ đếm dòng (**l**ines). `-w` đếm từ, `-c` đếm byte |

```text
 20  30 102 test.txt
  22 /etc/passwd
  46 /etc/group
  68 total
```

### Đánh số dòng: cat -n, nl

```bash
cat -n test.txt | head -3
```

```text
     1	dong 1
     2	dong 2
     3	dong 3
```

`nl test.txt` cũng đánh số, nhưng bỏ qua dòng trống.

### sha256sum: file có bị thay đổi không

Mã băm (hash) là chuỗi tính từ nội dung file; sửa một byte là chuỗi đổi hẳn. Dùng để kiểm tra file tải về còn nguyên vẹn.

```bash
sha256sum test.txt > test.sha256
sha256sum -c test.sha256
echo "dong them" >> test.txt
sha256sum -c test.sha256
```

```text
test.txt: OK
test.txt: FAILED
sha256sum: WARNING: 1 computed checksum did NOT match
```

`md5sum` làm việc tương tự nhưng MD5 đã cũ, không còn an toàn để chống giả mạo.

### Đọc file nén không cần giải nén

`zcat file.gz` in nội dung file nén `.gz` (bài 18 học nén). Tương tự có `bzcat` cho `.bz2`, `xzcat` cho `.xz`, `zless` để cuộn như `less`.

## Thực hành

1. Xem 3 dòng đầu và 3 dòng cuối của `/etc/passwd`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   head -3 /etc/passwd
   tail -3 /etc/passwd
   ```

   Dòng đầu luôn là của `root`. Mấy dòng cuối thường là tài khoản người dùng tạo sau.

   </details>

2. Mở `/etc/services` bằng `less`, tìm chữ `ssh`, nhảy xuống cuối file, rồi thoát.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   less /etc/services
   ```

   Gõ `/ssh` rồi `Enter`, bấm `n` để tới kết quả sau. Bấm `G` xuống cuối file, `q` để thoát.

   </details>

3. File `/etc/passwd` có bao nhiêu dòng?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   wc -l /etc/passwd
   ```

   Mỗi dòng là một tài khoản, nên đây cũng là số tài khoản trên máy (bài 26).

   </details>

4. Chỉ in dòng thứ 11 tới 13 của `test.txt` (là `1x`, `2x`, `3x`).

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   head -13 test.txt | tail -3
   ```

   `head -13` lấy 13 dòng đầu, rồi `tail -3` lấy 3 dòng cuối của phần đó. Dấu `|` nối hai lệnh, học ở bài 13.

   </details>

## Tóm tắt

| Lệnh | Làm gì |
|---|---|
| `cat file` | In cả file |
| `more file` | Xem từng trang, chỉ đi tới |
| `less file` | Xem từng trang, đi lui được, `/` để tìm, `q` để thoát |
| `head -n N file` | N dòng đầu (mặc định 10) |
| `tail -n N file` | N dòng cuối (mặc định 10) |
| `tail -f file` | Theo dõi dòng mới ghi vào |
| `wc -l file` | Đếm số dòng |
