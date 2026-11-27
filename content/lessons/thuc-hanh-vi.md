---
summary: Ôn lại vi bằng một loạt nhiệm vụ nhỏ trên một file có sẵn. Thêm dòng trên dưới, di chuyển nhanh, xoá về đầu và cuối dòng, tìm, thay thế, hoàn tác, bật tắt số dòng, cho tới khi làm không cần nhìn bảng.
minutes: 30
commands: [vi, h j k l, w b, o O, "d^", "d$", u, ":set nu"]
quiz:
  - q: Con trỏ đang ở giữa dòng. Lệnh nào xoá từ con trỏ tới cuối dòng?
    options: ["dd", "d$", "d^", "dw"]
    answer: 1
    explain: "`$` là cuối dòng nên `d$` xoá tới cuối dòng. `d^` xoá về đầu dòng, `dd` xoá cả dòng."
  - q: "Trong vi, phím `j` làm gì ở chế độ lệnh?"
    options: ["Xuống một dòng", "Lên một dòng", "Sang phải", "Nhảy tới đầu file"]
    answer: 0
    explain: "`h` trái, `j` xuống, `k` lên, `l` phải."
  - q: Thay thế nhầm, muốn quay lại như cũ thì bấm gì?
    options: ["Esc", "u", "q", "x"]
    answer: 1
    explain: "`u` hoàn tác thao tác vừa làm. vim nhớ nhiều bước; vi cũ (vim.tiny) chỉ nhớ một bước."
  - q: "`:s/a/b/g` khác `:%s/a/b/g` ở chỗ nào?"
    options: ["Không khác", "Không có % thì chỉ thay trên dòng đang đứng", "Có % thì chỉ thay chỗ đầu tiên", "Có % thì hỏi xác nhận"]
    answer: 1
    explain: "`%` là phạm vi toàn file. Thiếu `%`, lệnh chỉ áp cho dòng hiện tại."
  - q: Phím nào đưa con trỏ sang đầu từ kế tiếp?
    options: ["b", "e", "w", "0"]
    answer: 2
    explain: "`w` tới đầu từ sau, `b` lùi về đầu từ trước, `0` về đầu dòng."
---

> Bài này đi theo video TITV bài 20. Mở song song bảng lệnh ở [bài 19](/bai/trinh-soan-thao-vi) khi làm.

Cách học vi hiệu quả là tự đặt nhiệm vụ rồi làm đi làm lại, giống tập gõ phím. Bài này cho sẵn một file và danh sách nhiệm vụ.

## Chuẩn bị file

```bash
mkdir -p ~/thuchanh/bai20 && cd ~/thuchanh/bai20
cat > newfile.txt <<'EOF'
Linux la he dieu hanh ma nguon mo.
Trinh soan thao vi co san tren moi may Linux.
Hoc vi giup sua file cau hinh tren may chu.
Hom nay toi hoc vi. Ngay mai toi hoc tiep.
Cuoi cung la dong thu nam.
EOF
vi newfile.txt
```

Lệnh `cat > newfile.txt <<'EOF'` ghi các dòng phía sau vào file cho tới dòng `EOF` (heredoc, bài 13). Bạn cũng có thể tự gõ nội dung bằng vi.

## Nhiệm vụ

Làm lần lượt. Mỗi nhiệm vụ, tự làm trước rồi mới mở cách làm.

1. Bật số dòng, rồi tắt đi.

   <details>
   <summary>Cách làm</summary>

   `:set nu` rồi `Enter`; `:set nonu` rồi `Enter`.

   </details>

2. Không dùng phím mũi tên: xuống dòng 3, sang phải 5 ký tự, rồi lên lại dòng 1.

   <details>
   <summary>Cách làm</summary>

   `jj` (xuống 2 dòng), `lllll` (sang phải 5 ký tự), `kk` (lên 2 dòng). Gõ số trước phím để lặp: `5l` giống `lllll`.

   </details>

3. Ở dòng 4, nhảy từng từ sang phải tới chữ `Ngay`, rồi lùi về chữ `hoc`.

   <details>
   <summary>Cách làm</summary>

   `:4` rồi `Enter`. Bấm `w` nhiều lần để tiến từng từ, `b` để lùi. Dấu chấm cũng được tính là một "từ".

   </details>

4. Về đầu dòng, rồi tới cuối dòng.

   <details>
   <summary>Cách làm</summary>

   `0` (hoặc `Home`) về đầu dòng, `$` (hoặc `End`) tới cuối dòng.

   </details>

5. Thêm dòng `Dong moi o tren.` **bên trên** dòng 1, và dòng `Dong moi o duoi.` **bên dưới** dòng cuối.

   <details>
   <summary>Cách làm</summary>

   `gg` lên dòng đầu, `O`, gõ chữ, `Esc`. `G` xuống dòng cuối, `o`, gõ chữ, `Esc`.

   </details>

6. Hoàn tác việc vừa thêm dòng dưới.

   <details>
   <summary>Cách làm</summary>

   Bấm `u`. Với vim đầy đủ, bấm `u` tiếp sẽ hoàn tác tiếp các bước trước; `Ctrl+R` làm lại. Với `vim.tiny` (vi mặc định trên Ubuntu desktop), `u` lần hai sẽ làm lại chính việc vừa hoàn tác.

   </details>

7. Ở dòng `Hom nay toi hoc vi. Ngay mai toi hoc tiep.`, đưa con trỏ tới chữ `Ngay`, xoá từ đó về **đầu dòng**. Hoàn tác, rồi xoá từ đó tới **cuối dòng**.

   <details>
   <summary>Cách làm</summary>

   Tìm bằng `/Ngay` rồi `Enter`. `d^` xoá về đầu dòng (còn `Ngay mai toi hoc tiep.`). Bấm `u` để hoàn tác, rồi tìm lại `/Ngay` và `Enter` để đặt con trỏ đúng chỗ. Sau đó `d$` xoá tới cuối dòng (còn `Hom nay toi hoc vi. `). Đừng giả định undo luôn đưa con trỏ trở lại vị trí tìm kiếm ban đầu.

   </details>

8. Xoá cả dòng `Cuoi cung la dong thu nam.`

   <details>
   <summary>Cách làm</summary>

   `/Cuoi` rồi `Enter`, rồi `dd`.

   </details>

9. Tìm mọi chữ `vi` trong file, đi qua từng kết quả, rồi đi ngược lại.

   <details>
   <summary>Cách làm</summary>

   `/vi` rồi `Enter`, `n` để tới kết quả sau, `N` để lùi. Tới cuối file vi tự quay lại đầu.

   </details>

10. Thay chữ `hoc` thành `luyen` chỉ trên dòng đang đứng, rồi trên **toàn file**. Hoàn tác lần thay toàn file.

    <details>
    <summary>Cách làm</summary>

    `:s/hoc/luyen/g` thay trên dòng hiện tại. `:%s/hoc/luyen/g` thay toàn file. `u` hoàn tác cả lần thay đó trong một bước.

    </details>

11. Lưu lại và thoát. Mở lại file bằng `cat` để xem kết quả.

    <details>
    <summary>Cách làm</summary>

    `:wq` rồi `Enter`, sau đó `cat newfile.txt`.

    </details>

## Mẹo tập

- Tự viết ra giấy 5 nhiệm vụ của riêng bạn (thêm dòng, xoá nửa dòng, tìm, thay, chép dán) và làm mỗi ngày vài phút trong tuần đầu.
- Khi lỡ gõ lung tung, bấm `Esc` rồi `u` nhiều lần, hoặc `:q!` để bỏ hết và mở lại.
- Gõ `vimtutor` (sau khi cài vim) để học tiếp có hướng dẫn.

## Mở rộng (chuẩn LPIC-1)

| Phím | Làm gì |
|---|---|
| `.` | Lặp lại thao tác sửa vừa làm. Ví dụ `dd` rồi `.` `.` xoá thêm hai dòng |
| `Ctrl+R` | Làm lại sau khi hoàn tác (vim) |
| `cw` | Xoá tới hết từ rồi vào chế độ gõ chữ để gõ từ mới (**c**hange **w**ord) |
| `J` | Nối dòng dưới vào cuối dòng hiện tại |
| `:10,20s/cũ/mới/g` | Thay chỉ từ dòng 10 tới 20 |
| `:%s/cũ/mới/gc` | Thay toàn file, hỏi xác nhận từng chỗ (`y`/`n`) |
| `view file` hoặc `vi -R file` | Mở chỉ để đọc, tránh lỡ tay sửa |

## Tóm tắt

| Nhiệm vụ | Phím |
|---|---|
| Di chuyển | `h` `j` `k` `l`, `w` `b`, `0` `$`, `gg` `G`, `:N` |
| Thêm dòng trên / dưới | `O` / `o` |
| Xoá về đầu / tới cuối dòng | `d^` / `d$` |
| Xoá dòng | `dd` |
| Tìm | `/từ`, `n`, `N` |
| Thay dòng hiện tại / toàn file | `:s/a/b/g` / `:%s/a/b/g` |
| Hoàn tác | `u` |
| Số dòng | `:set nu` / `:set nonu` |
