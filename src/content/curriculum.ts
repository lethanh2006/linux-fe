/**
 * Lộ trình học, chia hai phần.
 *
 * Phần 1 (khoá chính) bám đúng playlist TITV "LPI1 - Tự học Linux cơ bản", từ video 5 đến video 34:
 * mỗi video một bài, cùng thứ tự, mã bài trùng số video.
 * Phần 2 (mở rộng) phủ phần còn lại của chuẩn LPIC-1 và phần lập trình Bash (video 44–55).
 *
 * Nội dung bài nằm ở content/lessons/<slug>.md. Bài chưa có file thì lộ trình ghi "đang viết".
 */

export type LessonOutline = {
  slug: string;
  title: string;
  /** Mã mục thi, ví dụ "103.1". "LE 1.1" là mục của Linux Essentials. */
  objectives: string[];
  /** Số video trong playlist TITV. Bài phần 1 có đúng một video. */
  videos: number[];
};

export type ModuleOutline = {
  slug: string;
  title: string;
  description: string;
  /** 1: khoá chính theo video TITV 5–34. 2: mở rộng. */
  part: 1 | 2;
  lessons: LessonOutline[];
};

export const PARTS = {
  1: { title: "Phần 1. Khoá chính", description: "Bám theo video TITV bài 5 đến bài 34: mỗi video một bài, đúng thứ tự, mã bài trùng số video." },
  2: { title: "Phần 2. Mở rộng", description: "Học sau khi xong phần 1: cài phần mềm, ổ đĩa, lập trình Bash, dịch vụ, mạng và bảo mật theo chuẩn LPIC-1." },
} as const;

export const OBJECTIVES: Record<string, string> = {
  "LE 1.1": "Sự phát triển của Linux và các hệ điều hành phổ biến",
  "101.1": "Xác định và cấu hình phần cứng",
  "101.2": "Quá trình khởi động hệ thống",
  "101.3": "Đổi runlevel / boot target, tắt và khởi động lại máy",
  "102.1": "Thiết kế cách chia ổ đĩa",
  "102.2": "Cài trình nạp khởi động",
  "102.3": "Quản lý thư viện dùng chung",
  "102.4": "Quản lý gói kiểu Debian",
  "102.5": "Quản lý gói RPM và YUM",
  "102.6": "Linux chạy trong máy ảo",
  "103.1": "Làm việc trên dòng lệnh",
  "103.2": "Xử lý luồng văn bản bằng bộ lọc",
  "103.3": "Quản lý file cơ bản",
  "103.4": "Luồng dữ liệu, đường ống và chuyển hướng",
  "103.5": "Tạo, theo dõi và dừng tiến trình",
  "103.6": "Đổi độ ưu tiên của tiến trình",
  "103.7": "Tìm trong văn bản bằng biểu thức chính quy",
  "103.8": "Soạn thảo file cơ bản",
  "104.1": "Tạo phân vùng và filesystem",
  "104.2": "Giữ filesystem toàn vẹn",
  "104.3": "Gắn và gỡ filesystem",
  "104.5": "Quyền và quyền sở hữu file",
  "104.6": "Tạo và đổi hard link, symbolic link",
  "104.7": "Tìm file hệ thống và đặt file đúng chỗ",
  "105.1": "Tuỳ biến và dùng môi trường shell",
  "105.2": "Viết script đơn giản",
  "106.1": "Cài và cấu hình X11",
  "106.2": "Môi trường đồ hoạ",
  "106.3": "Trợ năng",
  "107.1": "Quản lý tài khoản người dùng, nhóm và các file hệ thống liên quan",
  "107.2": "Tự động hoá việc quản trị bằng lập lịch",
  "107.3": "Ngôn ngữ, bảng mã và múi giờ",
  "108.1": "Giữ đúng giờ hệ thống",
  "108.2": "Ghi nhật ký hệ thống",
  "108.3": "Cơ bản về máy chủ gửi mail (MTA)",
  "108.4": "Quản lý máy in",
  "109.1": "Nền tảng giao thức Internet",
  "109.2": "Cấu hình mạng lâu dài",
  "109.3": "Xử lý sự cố mạng cơ bản",
  "109.4": "Cấu hình DNS phía máy khách",
  "110.1": "Tác vụ quản trị bảo mật",
  "110.2": "Bảo mật máy chủ",
  "110.3": "Bảo vệ dữ liệu bằng mã hoá",
};

export const CURRICULUM: ModuleOutline[] = [
  {
    slug: "lam-quen",
    title: "Làm quen với Linux",
    description: "Linux gồm những phần nào, cây thư mục, terminal, cú pháp lệnh, sudo và cách đi lại giữa các thư mục.",
    part: 1,
    lessons: [
      { slug: "cau-truc-he-dieu-hanh", title: "Cấu trúc của hệ điều hành Linux: kernel, shell, ứng dụng", objectives: ["LE 1.1"], videos: [5] },
      { slug: "cay-thu-muc", title: "Cấu trúc cây thư mục, loại file và đường dẫn", objectives: ["104.7"], videos: [6] },
      { slug: "terminal-va-cu-phap", title: "Terminal, cú pháp câu lệnh và lệnh man", objectives: ["103.1"], videos: [7] },
      { slug: "sudo-va-root", title: "Lệnh sudo và mật khẩu tài khoản root", objectives: ["110.1"], videos: [8] },
      { slug: "pwd-va-cd", title: "Thư mục hiện hành: lệnh pwd và cd", objectives: ["103.1"], videos: [9] },
    ],
  },
  {
    slug: "file-va-thu-muc",
    title: "File và thư mục",
    description: "Tạo, chép, di chuyển, xoá file và thư mục; chọn nhiều file bằng ký tự đại diện; xem nội dung file.",
    part: 1,
    lessons: [
      { slug: "quan-ly-file-thu-muc", title: "Các lệnh quản lý file và thư mục", objectives: ["103.3"], videos: [10] },
      { slug: "ky-tu-dai-dien", title: "Ký tự đại diện * và ?", objectives: ["103.3"], videos: [11] },
      { slug: "xem-noi-dung-file", title: "Xem nội dung file: cat, more, less, head, tail", objectives: ["103.2"], videos: [12] },
    ],
  },
  {
    slug: "luong-du-lieu-tim-kiem",
    title: "Luồng dữ liệu và tìm kiếm",
    description: "Chuyển hướng kết quả, nối lệnh bằng đường ống, tìm chữ bằng grep và regex, tìm file bằng find, tìm lệnh bằng whereis và which.",
    part: 1,
    lessons: [
      { slug: "chuyen-huong-va-pipe", title: "Định hướng nhập xuất và đường ống (pipe)", objectives: ["103.4"], videos: [13] },
      { slug: "lenh-grep", title: "Tìm kiếm trong file bằng grep", objectives: ["103.7"], videos: [14] },
      { slug: "bieu-thuc-chinh-quy", title: "Biểu thức chính quy (regex)", objectives: ["103.7"], videos: [15] },
      { slug: "lenh-find", title: "Tìm file bằng lệnh find", objectives: ["104.7"], videos: [16] },
      { slug: "whereis-va-which", title: "Tìm lệnh bằng whereis và which", objectives: ["104.7"], videos: [17] },
    ],
  },
  {
    slug: "nen-vi-cut",
    title: "Nén file, trình soạn thảo vi, lệnh cut",
    description: "Nén và giải nén bằng gzip, tar; sửa file bằng vi; cắt cột dữ liệu bằng cut.",
    part: 1,
    lessons: [
      { slug: "nen-va-luu-tru", title: "Nén và giải nén: gzip, gunzip, tar", objectives: ["103.3"], videos: [18] },
      { slug: "trinh-soan-thao-vi", title: "Trình soạn thảo vi: chế độ và nhóm lệnh", objectives: ["103.8"], videos: [19] },
      { slug: "thuc-hanh-vi", title: "Thực hành trình soạn thảo vi", objectives: ["103.8"], videos: [20] },
      { slug: "lenh-cut", title: "Cắt dữ liệu bằng lệnh cut", objectives: ["103.2"], videos: [21] },
    ],
  },
  {
    slug: "he-thong",
    title: "Hệ thống",
    description: "Ngày giờ, tắt và khởi động lại máy, quá trình khởi động, xem thông tin phần cứng và hệ thống.",
    part: 1,
    lessons: [
      { slug: "ngay-gio-he-thong", title: "Các lệnh về ngày giờ: date, timedatectl", objectives: ["108.1"], videos: [22] },
      { slug: "tat-va-khoi-dong-lai", title: "Tắt và khởi động lại máy: shutdown, reboot", objectives: ["101.3"], videos: [23] },
      { slug: "khoi-dong-he-thong", title: "Quá trình khởi động Linux và run level", objectives: ["101.2", "101.3"], videos: [24] },
      { slug: "thong-tin-he-thong", title: "Các lệnh xem thông tin hệ thống", objectives: ["101.1"], videos: [25] },
    ],
  },
  {
    slug: "nguoi-dung-phan-quyen",
    title: "Người dùng, nhóm và phân quyền",
    description: "Tài khoản và nhóm, các file /etc/passwd, /etc/shadow, /etc/group, quyền rwx và link.",
    part: 1,
    lessons: [
      { slug: "quan-tri-nguoi-dung", title: "Quản trị người dùng: /etc/passwd và /etc/shadow", objectives: ["107.1"], videos: [26] },
      { slug: "lenh-quan-ly-nguoi-dung", title: "Lệnh quản trị người dùng: useradd, usermod, userdel, chage", objectives: ["107.1"], videos: [27] },
      { slug: "quan-tri-nhom", title: "Quản trị nhóm: /etc/group", objectives: ["107.1"], videos: [28] },
      { slug: "lenh-quan-tri-nhom", title: "Lệnh quản trị nhóm: groupadd, groupmod, groupdel", objectives: ["107.1"], videos: [29] },
      { slug: "phan-quyen-file", title: "Phân quyền trên file và thư mục", objectives: ["104.5"], videos: [30] },
      { slug: "lenh-phan-quyen", title: "Lệnh đổi quyền, chủ, nhóm: chmod, chown, chgrp", objectives: ["104.5"], videos: [31] },
      { slug: "hard-link-soft-link", title: "Hard link và soft link (symbolic link)", objectives: ["104.6"], videos: [32] },
    ],
  },
  {
    slug: "mang",
    title: "Mạng",
    description: "File hosts, DNS, tên card mạng, xem và bật tắt card, đặt địa chỉ IP tạm thời và lâu dài.",
    part: 1,
    lessons: [
      { slug: "cau-hinh-mang", title: "Cấu hình mạng: hosts, DNS, card mạng, gateway", objectives: ["109.2", "109.4"], videos: [33] },
      { slug: "cau-hinh-dia-chi-ip", title: "Cấu hình địa chỉ IP: tạm thời, netplan, nmtui", objectives: ["109.2"], videos: [34] },
    ],
  },
  {
    slug: "phan-mem-o-dia",
    title: "Phần mềm và ổ đĩa",
    description: "Cài gỡ phần mềm trên Ubuntu và Red Hat, thư viện dùng chung, phân vùng, filesystem, gắn ổ và GRUB.",
    part: 2,
    lessons: [
      { slug: "apt-va-dpkg", title: "Quản lý gói trên Ubuntu/Debian: apt và dpkg", objectives: ["102.4"], videos: [35, 37, 39] },
      { slug: "dnf-va-rpm", title: "Quản lý gói trên Red Hat/Rocky: dnf và rpm", objectives: ["102.5"], videos: [] },
      { slug: "thu-vien-dung-chung", title: "Thư viện dùng chung: ldd, ldconfig", objectives: ["102.3"], videos: [] },
      { slug: "phan-vung-va-filesystem", title: "Phân vùng, filesystem, swap và LVM", objectives: ["102.1", "104.1"], videos: [43] },
      { slug: "mount-va-fstab", title: "Gắn ổ: mount, umount, /etc/fstab", objectives: ["104.3"], videos: [] },
      { slug: "dung-luong-va-sua-loi", title: "Dung lượng và sửa lỗi filesystem: df, du, fsck", objectives: ["104.2"], videos: [] },
      { slug: "trinh-nap-khoi-dong", title: "Trình nạp khởi động GRUB 2", objectives: ["102.2"], videos: [] },
    ],
  },
  {
    slug: "shell-script",
    title: "Shell và lập trình Bash",
    description: "Biến môi trường, alias, rồi viết script Bash: nhập xuất, tính toán, điều kiện, vòng lặp, mảng, hàm, gỡ lỗi.",
    part: 2,
    lessons: [
      { slug: "moi-truong-shell", title: "Môi trường shell: biến, PATH, alias, .bashrc", objectives: ["105.1"], videos: [] },
      { slug: "bash-script-dau-tien", title: "Script Bash đầu tiên: shebang, echo, read", objectives: ["105.2"], videos: [44, 45] },
      { slug: "bash-tinh-toan-tham-so", title: "Tính toán và truyền tham số cho script", objectives: ["105.2"], videos: [46, 47] },
      { slug: "bash-dieu-kien", title: "Câu lệnh điều kiện: if, test, case, mã thoát", objectives: ["105.2"], videos: [48] },
      { slug: "bash-vong-lap", title: "Vòng lặp: for, while, until", objectives: ["105.2"], videos: [49] },
      { slug: "bash-mang-va-ham", title: "Mảng và hàm trong Bash", objectives: ["105.2"], videos: [50, 51] },
      { slug: "bash-thuc-hanh-va-go-loi", title: "Bài tập Bash tổng hợp và cách gỡ lỗi script", objectives: ["105.2"], videos: [52, 53, 54, 55] },
    ],
  },
  {
    slug: "tien-trinh-dich-vu",
    title: "Tiến trình, dịch vụ và nhật ký",
    description: "Chương trình đang chạy, quản lý dịch vụ bằng systemd, đọc nhật ký và hẹn giờ chạy việc.",
    part: 2,
    lessons: [
      { slug: "tien-trinh", title: "Tiến trình: ps, top, kill, chạy nền, độ ưu tiên", objectives: ["103.5", "103.6"], videos: [] },
      { slug: "systemd-dich-vu", title: "Quản lý dịch vụ bằng systemctl và viết unit file", objectives: ["101.3"], videos: [] },
      { slug: "nhat-ky-he-thong", title: "Nhật ký hệ thống: journalctl và /var/log", objectives: ["108.2"], videos: [] },
      { slug: "lap-lich-cong-viec", title: "Hẹn giờ chạy việc: cron, at, systemd timer", objectives: ["107.2"], videos: [] },
    ],
  },
  {
    slug: "van-ban-he-thong",
    title: "Văn bản và hệ thống nâng cao",
    description: "Các bộ lọc văn bản còn lại, quyền đặc biệt, ngôn ngữ và múi giờ, cùng những phần ít gặp trên server.",
    part: 2,
    lessons: [
      { slug: "loc-van-ban", title: "Lọc văn bản: sort, uniq, tr, sed, awk", objectives: ["103.2"], videos: [] },
      { slug: "quyen-dac-biet", title: "Quyền đặc biệt: SUID, SGID, sticky bit", objectives: ["104.5"], videos: [] },
      { slug: "ngon-ngu-mui-gio", title: "Ngôn ngữ, bảng mã và múi giờ", objectives: ["107.3"], videos: [36] },
      { slug: "do-hoa-may-in-mail", title: "Biết qua: giao diện đồ hoạ, máy in, mail", objectives: ["106.1", "106.2", "106.3", "108.3", "108.4"], videos: [] },
    ],
  },
  {
    slug: "mang-bao-mat",
    title: "Mạng và bảo mật",
    description: "IP và cổng, kiểm tra kết nối, DNS, kiểm tra và khoá chặt máy chủ, SSH key và mã hoá.",
    part: 2,
    lessons: [
      { slug: "mang-can-ban", title: "Mạng căn bản: IP, subnet, cổng, TCP/UDP", objectives: ["109.1"], videos: [] },
      { slug: "kiem-tra-mang", title: "Kiểm tra sự cố mạng: ping, ss, curl, traceroute", objectives: ["109.3"], videos: [] },
      { slug: "dns-phia-may-khach", title: "DNS phía máy khách: /etc/hosts, resolv.conf, dig", objectives: ["109.4"], videos: [] },
      { slug: "kiem-tra-bao-mat", title: "Kiểm tra bảo mật: người đăng nhập, cổng mở, sudoers", objectives: ["110.1"], videos: [] },
      { slug: "bao-mat-may-chu", title: "Bảo mật máy chủ: tắt dịch vụ thừa, tường lửa", objectives: ["110.2"], videos: [] },
      { slug: "ssh-va-ma-hoa", title: "SSH key, scp và mã hoá bằng GPG", objectives: ["110.3"], videos: [] },
    ],
  },
  {
    slug: "du-an",
    title: "Dự án tổng hợp",
    description: "Ghép mọi thứ đã học: dựng một máy chủ web từ máy trắng đến khi chạy ổn định.",
    part: 2,
    lessons: [
      { slug: "du-an-may-chu-web", title: "Dự án: dựng máy chủ web từ đầu", objectives: ["110.2", "101.3", "107.2"], videos: [] },
    ],
  },
];
