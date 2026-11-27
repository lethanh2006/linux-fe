---
summary: Mỗi chương trình đang chạy là một tiến trình có PID. Bài này dạy xem tiến trình (ps, top, htop, pgrep, pstree), gửi tín hiệu để dừng (kill, pkill, killall), chạy nền và chuyển qua lại (&, Ctrl+Z, jobs, bg, fg, nohup), và chỉnh độ ưu tiên (nice, renice).
minutes: 45
commands: [ps, top, htop, pgrep, pstree, kill, pkill, killall, jobs, bg, fg, nohup, nice, renice, uptime, free]
quiz:
  - q: "`kill 1234` mặc định gửi tín hiệu nào?"
    options: ["SIGKILL (9)", "SIGTERM (15)", "SIGHUP (1)", "SIGINT (2)"]
    answer: 1
    explain: SIGTERM lịch sự yêu cầu chương trình dừng, cho nó dọn dẹp (ghi nốt dữ liệu, đóng kết nối). Chỉ khi chương trình không chịu dừng mới dùng `kill -9` (SIGKILL), loại bị kernel giết ngay, không kịp dọn dẹp.
  - q: Đang chạy một lệnh lâu ở terminal, muốn tạm dừng để làm việc khác rồi cho nó chạy tiếp ở nền. Làm thế nào?
    options: ["Ctrl+C rồi chạy lại với &", "Ctrl+Z rồi gõ bg", "Ctrl+D rồi gõ fg", "Đóng terminal"]
    answer: 1
    explain: "Ctrl+Z tạm dừng (Stopped) lệnh đang chạy. `bg` cho nó chạy tiếp ở nền, `fg` đưa nó về lại phía trước. Ctrl+C thì dừng hẳn."
  - q: "Trong `ps aux`, cột STAT có chữ `Z` nghĩa là gì?"
    options: ["Đang chạy", "Đang ngủ chờ", "Tiến trình zombie: đã kết thúc nhưng tiến trình cha chưa thu dọn", "Bị tạm dừng"]
    answer: 2
    explain: "`R` đang chạy, `S` ngủ chờ, `T` tạm dừng, `D` chờ ổ đĩa không ngắt được, `Z` zombie. Zombie không tốn CPU hay RAM, chỉ chiếm một dòng trong bảng tiến trình."
  - q: Giá trị nice nào cho tiến trình ưu tiên CPU THẤP nhất?
    options: ["-20", "0", "10", "19"]
    answer: 3
    explain: Nice từ -20 (ưu tiên cao nhất) đến 19 (thấp nhất), mặc định 0. Càng "tử tế" (nice cao) thì càng nhường CPU cho người khác. User thường chỉ được tăng nice, muốn giảm phải là root.
  - q: Chạy một script trên server qua SSH, muốn nó chạy tiếp sau khi thoát SSH. Cách đơn giản nào làm được?
    options: ["./script.sh", "nohup ./script.sh &", "./script.sh; exit", "sudo ./script.sh"]
    answer: 1
    explain: Khi đóng terminal, các tiến trình con nhận SIGHUP và thường dừng theo. `nohup` bỏ qua SIGHUP, `&` cho chạy nền. Việc chạy lâu dài nên làm thành dịch vụ systemd, hoặc dùng `tmux`/`screen`.
---

## Tiến trình là gì

Chương trình là file nằm trên ổ đĩa (ví dụ `/usr/bin/sleep`). Khi chạy, nó thành một **tiến trình** (process) trong bộ nhớ. Một chương trình có thể chạy nhiều tiến trình cùng lúc.

Mỗi tiến trình có:

| Thuộc tính | Ý nghĩa |
|---|---|
| **PID** | Số hiệu tiến trình, duy nhất trên máy |
| **PPID** | PID của tiến trình cha, tức tiến trình đã chạy nó (ví dụ shell của bạn) |
| User | Chạy dưới quyền ai |
| Trạng thái | Đang chạy, đang ngủ chờ, tạm dừng… |
| Tài nguyên | CPU, RAM đang dùng |

Tiến trình số 1 là tiến trình đầu tiên kernel chạy khi khởi động. Trên Ubuntu đó là `systemd` (bài 24), mọi tiến trình khác là con cháu của nó.

## ps: chụp nhanh danh sách tiến trình

```bash
sleep 300 &
ps
```

```text
[1] 191
    PID TTY          TIME CMD
    189 pts/2    00:00:00 bash
    191 pts/2    00:00:00 sleep
    192 pts/2    00:00:00 ps
```

`[1] 191` là shell báo: job số 1 đã chạy nền, PID 191. `pts/2` là terminal bạn đang gõ.

`ps` trơn chỉ hiện tiến trình của terminal hiện tại. Hai cách viết hay dùng để xem **tất cả**:

```bash
ps aux
ps -ef
```

```text
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  3.3  0.0  21088 12424 ?        Ss   12:42   0:00 /sbin/init
root          28  0.8  0.0  33840 12168 ?        Ss   12:42   0:00 /usr/lib/systemd/systemd-journald
systemd+      51  1.1  0.0  21352 12832 ?        Ss   12:42   0:00 /usr/lib/systemd/systemd-resolved
root          63  0.0  0.0   4248  2816 ?        Ss   12:42   0:00 /usr/sbin/cron -f -P
message+      64  0.3  0.0   9456  5216 ?        Ss   12:42   0:00 @dbus-daemon --system --address=systemd: --nofork --nopidfile --systemd-activation --syslog-only
...
```

Đây là 5 dòng đầu (danh sách thật dài hơn nhiều). PID 1 là `/sbin/init`, tức `systemd`. Tên user dài hơn 8 ký tự bị cắt và thêm dấu `+` (`systemd+` là `systemd-resolve`).

| Phần lệnh | Ý nghĩa |
|---|---|
| `a` | Tiến trình của mọi user |
| `u` | Dạng có thông tin user, CPU, RAM |
| `x` | Cả tiến trình không gắn với terminal nào (dịch vụ chạy nền) |
| `-ef` | Kiểu viết khác: `-e` mọi tiến trình, `-f` dạng đầy đủ (có PPID) |

Đọc các cột của `ps aux`:

| Cột | Ý nghĩa |
|---|---|
| `USER` | Chạy dưới quyền ai |
| `PID` | Số hiệu tiến trình |
| `%CPU`, `%MEM` | Phần trăm CPU, RAM đang dùng |
| `VSZ`, `RSS` | Bộ nhớ ảo / bộ nhớ thật đang chiếm (KB). `RSS` là con số đáng quan tâm |
| `TTY` | Terminal gắn với tiến trình. `?` là không có (dịch vụ) |
| `STAT` | Trạng thái (bảng dưới) |
| `START`, `TIME` | Lúc bắt đầu, tổng thời gian CPU đã dùng |
| `COMMAND` | Lệnh đã chạy |

| STAT | Trạng thái |
|---|---|
| `R` | Đang chạy (**R**unning) |
| `S` | Ngủ, chờ việc (**S**leeping). Phần lớn tiến trình ở trạng thái này |
| `D` | Chờ ổ đĩa hoặc mạng, không ngắt được. Nhiều `D` là dấu hiệu ổ đĩa chậm |
| `T` | Bị tạm dừng (s**T**opped), ví dụ sau Ctrl+Z |
| `Z` | Zombie: đã kết thúc nhưng tiến trình cha chưa thu dọn |
| `s`, `+`, `<`, `N` (phụ) | Trưởng phiên làm việc / đang chạy ở phía trước / ưu tiên cao / ưu tiên thấp |

Tự chọn cột và sắp xếp:

```bash
ps -eo pid,ppid,user,%cpu,%mem,stat,cmd --sort=-%mem | head -5
```

| Phần | Ý nghĩa |
|---|---|
| `-e` | Mọi tiến trình |
| `-o pid,ppid,...` | Chọn các cột cần in (**o**utput) |
| `--sort=-%mem` | Sắp theo RAM, dấu `-` là giảm dần |
| `\| head -5` | Lấy dòng tiêu đề và 4 tiến trình tốn RAM nhất |

## pgrep, pstree: tìm và xem quan hệ

Chạy hai lệnh `sleep 300 &` và `sleep 301 &`, rồi:

```bash
pgrep sleep
pgrep -a sleep
pstree -p $$
```

```text
209
210
209 sleep 300
210 sleep 301
bash(207)-+-pstree(211)
          |-sleep(209)
          `-sleep(210)
```

| Lệnh | Làm gì |
|---|---|
| `pgrep sleep` | In PID các tiến trình có tên `sleep` |
| `pgrep -a sleep` | In kèm cả dòng lệnh |
| `pgrep -u www-data` | Tiến trình của user `www-data` |
| `pgrep -f "node server.js"` | So với **cả dòng lệnh**, không chỉ tên chương trình |
| `pstree -p $$` | Vẽ cây con cháu của shell hiện tại, kèm PID. `$$` là PID của shell. Gõ `pstree -p` để vẽ cả cây từ `systemd(1)` |

`ps aux | grep nginx` cũng hay dùng, nhưng kết quả có cả chính dòng `grep nginx`. `pgrep` không bị vậy.

## top và htop: theo dõi trực tiếp

```bash
top
```

```text
top - 12:42:41 up  7:08,  0 user,  load average: 4.23, 3.83, 2.80
Tasks:  23 total,   1 running,  22 sleeping,   0 stopped,   0 zombie
%Cpu(s): 32.5 us, 10.0 sy,  0.0 ni, 42.5 id, 15.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem : ...
MiB Swap: ...

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
      1 root      20   0   21088  12424   9560 S   0.0   0.1   0:00.24 systemd
     28 root      20   0   33840  12168  11200 S   0.0   0.1   0:00.06 systemd+
     51 systemd+  20   0   21352  12832  10712 S   0.0   0.1   0:00.08 systemd+
     63 root      20   0    4248   2816   2572 S   0.0   0.0   0:00.00 cron
     64 message+  20   0    9456   5216   4640 S   0.0   0.0   0:00.02 dbus-da+
```

Hai dòng `MiB Mem`, `MiB Swap` được rút gọn ở đây; trên máy bạn chúng ghi RAM và swap: tổng (`total`), còn trống (`free`), đang dùng (`used`), làm bộ đệm (`buff/cache`), và `avail Mem`.

| Dòng / cột | Ý nghĩa |
|---|---|
| `up 7:08` | Máy đã chạy 7 giờ 8 phút |
| `load average: 4.23, 3.83, 2.80` | Số việc trung bình đang chạy hoặc chờ CPU trong 1, 5, 15 phút qua. So với số nhân CPU (`nproc`): vượt quá số nhân lâu dài là máy quá tải |
| `us`, `sy` | % CPU cho chương trình người dùng / cho kernel |
| `id` | % CPU rảnh |
| `wa` | % CPU ngồi chờ ổ đĩa. Cao là ổ đĩa đang nghẽn |
| `MiB Mem`, `avail Mem` | RAM tổng, còn trống, đang dùng, làm bộ đệm. Nhìn `avail Mem` để biết còn bao nhiêu RAM thật sự dùng được |
| `NI` | Giá trị nice (ưu tiên, xem cuối bài) |
| `RES` | RAM thật tiến trình đang chiếm |
| `S` | Trạng thái (như STAT của `ps`) |

Phím trong `top`:

| Phím | Làm gì |
|---|---|
| `P` / `M` | Sắp theo CPU / theo RAM |
| `k` | Gửi tín hiệu dừng một PID |
| `1` | Hiện từng nhân CPU |
| `q` | Thoát |

`htop` (cài bằng `sudo apt install htop`) có màu, dùng chuột được, dễ đọc hơn. Hai lệnh nhỏ cho thông tin tóm tắt: `uptime` (thời gian chạy và load) và `free -h` (RAM).

## Tín hiệu: kill, pkill, killall

"Dừng" một tiến trình thực chất là **gửi tín hiệu** (signal) cho nó. Các tín hiệu hay dùng:

| Số | Tên | Ý nghĩa |
|---|---|---|
| 15 | `SIGTERM` | Yêu cầu dừng lịch sự, cho phép dọn dẹp. **Mặc định** của `kill` |
| 9 | `SIGKILL` | Kernel giết ngay, chương trình không chặn được, không kịp dọn dẹp |
| 2 | `SIGINT` | Ngắt, giống bấm Ctrl+C |
| 1 | `SIGHUP` | Terminal bị đóng. Nhiều dịch vụ (nginx…) hiểu là "đọc lại cấu hình" |
| 19 / 18 | `SIGSTOP` / `SIGCONT` | Tạm dừng / chạy tiếp |

```bash
kill 209
kill -9 210
kill -l
```

| Lệnh | Làm gì |
|---|---|
| `kill PID` | Gửi SIGTERM cho tiến trình có PID đó |
| `kill -9 PID` (hoặc `kill -KILL PID`) | Gửi SIGKILL |
| `kill -HUP PID` | Gửi SIGHUP |
| `kill -l` | Liệt kê mọi tín hiệu |
| `pkill sleep` | Gửi tín hiệu cho mọi tiến trình **khớp tên** (giống `pgrep`, có `-f`, `-u`) |
| `killall sleep` | Gửi cho mọi tiến trình có **đúng tên** đó |

Khi SIGKILL, shell báo:

```text
[2]+  Killed                  sleep 301
```

> **Quy trình đúng:** `kill PID`, đợi vài giây, chỉ khi tiến trình vẫn còn thì mới `kill -9 PID`. Giết database bằng `-9` có thể làm hỏng dữ liệu. Và cẩn thận với `pkill -f`: mẫu quá rộng sẽ giết nhầm tiến trình của người khác. Luôn chạy `pgrep -a mẫu` trước để xem sẽ trúng những gì.

User thường chỉ gửi tín hiệu được cho tiến trình của mình. Với tiến trình của người khác thì cần `sudo`.

## Chạy nền và điều khiển job

| Thao tác | Làm gì |
|---|---|
| `lệnh &` | Chạy ở nền, trả lại dấu nhắc ngay |
| `Ctrl+Z` | Tạm dừng lệnh đang chạy ở phía trước (trạng thái `T`) |
| `jobs` | Liệt kê các job của shell hiện tại |
| `bg` / `bg %2` | Cho job vừa dừng (hoặc job số 2) chạy tiếp ở nền |
| `fg` / `fg %1` | Đưa job về phía trước |
| `kill %1` | Gửi SIGTERM cho job số 1 |

```bash
sleep 300 &
sleep 301 &
jobs -l
```

```text
[1]-   136 Running                 sleep 300 &
[2]+   146 Running                 sleep 301 &
```

| Phần | Ý nghĩa |
|---|---|
| `[1]`, `[2]` | Số job (khác PID, chỉ có nghĩa trong shell này) |
| `+` / `-` | Job mặc định cho `fg`/`bg` / job kế tiếp |
| `136`, `146` | PID (`-l` mới hiện) |

Thử: gõ `sleep 100`, bấm `Ctrl+Z` (hiện `[1]+ Stopped sleep 100`), gõ `bg` để nó chạy nền, gõ `fg` để đưa về, rồi `Ctrl+C` để dừng.

### Chạy tiếp khi đã thoát terminal: nohup

Đóng terminal hay mất kết nối SSH, shell gửi SIGHUP cho các job của nó, và chúng thường dừng theo. `nohup` cho lệnh bỏ qua SIGHUP:

```bash
nohup ./backup.sh > backup.log 2>&1 &
```

| Phần | Ý nghĩa |
|---|---|
| `nohup` | Chạy lệnh, bỏ qua tín hiệu SIGHUP (**no** **h**ang**up**) |
| `> backup.log 2>&1` | Ghi kết quả và lỗi vào file. Không ghi thì `nohup` tự ghi vào `nohup.out` |
| `&` | Chạy nền |

Với việc chạy lâu dài (ứng dụng web, worker), cách đúng là làm thành **dịch vụ systemd** ([bài sau](/bai/systemd-dich-vu)). Với việc chạy tay trên server, `tmux` hoặc `screen` giữ cả phiên terminal để quay lại sau.

## Độ ưu tiên: nice và renice

Khi nhiều tiến trình tranh CPU, kernel dựa vào **nice** để chia: từ **-20** (ưu tiên cao nhất) đến **19** (thấp nhất), mặc định **0**.

```bash
nice -n 10 sleep 100 &
ps -o pid,ni,cmd -p $!
renice -n 15 -p $!
```

```text
    PID  NI CMD
    148  10 sleep 100
148 (process ID) old priority 10, new priority 15
```

| Lệnh | Làm gì |
|---|---|
| `nice -n 10 lệnh` | Chạy lệnh với nice 10 (nhường CPU) |
| `renice -n 15 -p PID` | Đổi nice của tiến trình đang chạy |
| `$!` | PID của lệnh nền vừa chạy |
| `ps -o pid,ni,cmd` | Cột `NI` là giá trị nice |

User thường chỉ được **tăng** nice (nhường bớt CPU). Giảm nice, hay đặt số âm, phải là root:

```text
renice: failed to set priority for 148 (process ID): Permission denied
```

Ứng dụng thực tế: chạy việc nặng không gấp (nén log, sao lưu) bằng `nice -n 19` để không làm chậm web đang phục vụ khách.

## Thực hành

1. Chạy `sleep 1000` ở nền 3 lần. Liệt kê các job, rồi tìm PID của chúng bằng `pgrep`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   sleep 1000 & sleep 1000 & sleep 1000 &
   jobs -l
   pgrep -a sleep
   ```

   </details>

2. Dừng job số 1 bằng `kill %1`, dừng các `sleep` còn lại bằng **một** lệnh.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   kill %1
   pkill sleep
   jobs
   ```

   </details>

3. Chạy `sleep 500` ở phía trước, tạm dừng bằng Ctrl+Z, cho chạy tiếp ở nền, kiểm tra trạng thái bằng `ps`.

   <details>
   <summary>Xem cách làm</summary>

   ```bash
   sleep 500
   ```

   Bấm `Ctrl+Z` → hiện `[1]+ Stopped sleep 500`. Gõ `ps -o pid,stat,cmd -C sleep` thấy STAT là `T`. Gõ `bg`, kiểm tra lại thấy `S`. Dọn dẹp bằng `kill %1`.

   </details>

4. In 3 tiến trình tốn RAM nhất trên máy kèm user, PID, %MEM và lệnh.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   ps -eo user,pid,%mem,cmd --sort=-%mem | head -4
   ```

   </details>

5. Chạy một lệnh nén nặng với ưu tiên thấp nhất, rồi xem giá trị nice của nó trong `top`.

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   nice -n 19 gzip -9 -c /dev/urandom > /dev/null &
   top
   ```

   Trong `top` bấm `P`, dòng `gzip` có `NI` = 19. Thoát `top`, rồi `kill %1` để dừng.

   </details>

6. Máy có mấy nhân CPU, load average hiện tại bao nhiêu, còn bao nhiêu RAM dùng được?

   <details>
   <summary>Xem đáp án</summary>

   ```bash
   nproc
   uptime
   free -h
   ```

   Xem cột `available` của `free -h`.

   </details>

## Tóm tắt

| Việc | Lệnh |
|---|---|
| Xem mọi tiến trình | `ps aux`, `ps -ef` |
| Tiến trình tốn RAM nhất | `ps -eo pid,user,%mem,cmd --sort=-%mem \| head` |
| Theo dõi trực tiếp | `top` (`P`, `M`, `q`), `htop` |
| Tìm PID theo tên | `pgrep -a tên` |
| Dừng lịch sự / ép dừng | `kill PID` / `kill -9 PID` |
| Dừng theo tên | `pkill tên`, `killall tên` |
| Chạy nền / tạm dừng / tiếp tục | `lệnh &` / `Ctrl+Z` / `bg`, `fg` |
| Chạy tiếp khi thoát SSH | `nohup lệnh > log 2>&1 &` |
| Độ ưu tiên | `nice -n 19 lệnh`, `renice -n 10 -p PID` |
