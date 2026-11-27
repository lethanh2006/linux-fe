/**
 * Lộ trình học: 12 chặng, đi từ dễ đến khó.
 *
 * Khung theo các mục thi LPIC-1 (101-500 và 102-500) của Linux Professional Institute,
 * sắp lại theo thứ tự dễ học. Mỗi bài trỏ tới video tương ứng trong playlist TITV
 * (số bài trong playlist) và tới mục thi LPIC-1 mà bài đó phủ.
 *
 * Nội dung bài nằm ở content/lessons/<slug>.md. Bài chưa có file thì lộ trình ghi "đang viết".
 */

export type Lab = "docker" | "vm";

export type LessonOutline = {
  slug: string;
  title: string;
  /** Mã mục thi, ví dụ "103.1". "LE 1.1" là mục của Linux Essentials. */
  objectives: string[];
  /** Số bài trong playlist TITV. */
  videos: number[];
  /** docker: làm được trong container Ubuntu. vm: cần máy ảo, WSL hoặc VPS (có systemd, ổ đĩa, mạng thật). */
  lab: Lab;
};

export type ModuleOutline = {
  slug: string;
  title: string;
  description: string;
  lessons: LessonOutline[];
};

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
    slug: "nhap-mon",
    title: "Nhập môn",
    description: "Linux là gì, dựng chỗ thực hành, gõ lệnh đầu tiên và đi lại trong cây thư mục.",
    lessons: [
      { slug: "linux-la-gi", title: "Linux là gì: kernel, shell và bản phân phối", objectives: ["LE 1.1"], videos: [1, 2, 5], lab: "docker" },
      { slug: "moi-truong-thuc-hanh", title: "Dựng chỗ thực hành: Docker, WSL, máy ảo", objectives: ["102.6"], videos: [3, 4], lab: "docker" },
      { slug: "terminal-va-cu-phap", title: "Terminal, cú pháp lệnh và cách tự tra cứu", objectives: ["103.1"], videos: [7], lab: "docker" },
      { slug: "cay-thu-muc", title: "Cây thư mục, đường dẫn, pwd, cd, ls", objectives: ["104.7", "103.1"], videos: [6, 9], lab: "docker" },
      { slug: "sudo-va-root", title: "Tài khoản root và lệnh sudo", objectives: ["110.1"], videos: [8], lab: "docker" },
    ],
  },
  {
    slug: "lam-viec-voi-file",
    title: "Làm việc với file",
    description: "Tạo, chép, xoá, xem, sửa, tìm và nén file — việc làm hằng ngày trên server.",
    lessons: [
      { slug: "quan-ly-file-thu-muc", title: "Tạo, chép, đổi tên, xoá file và thư mục", objectives: ["103.3"], videos: [10], lab: "docker" },
      { slug: "ky-tu-dai-dien", title: "Ký tự đại diện: *, ?, [ ], { }", objectives: ["103.3"], videos: [11], lab: "docker" },
      { slug: "xem-noi-dung-file", title: "Xem nội dung file: cat, less, head, tail, wc", objectives: ["103.2"], videos: [12], lab: "docker" },
      { slug: "trinh-soan-thao-vi", title: "Soạn thảo file bằng vi / vim (và nano)", objectives: ["103.8"], videos: [19, 20], lab: "docker" },
      { slug: "tim-kiem-file", title: "Tìm file: find, locate, which, whereis, type", objectives: ["104.7"], videos: [16, 17], lab: "docker" },
      { slug: "nen-va-luu-tru", title: "Nén và đóng gói: tar, gzip, bzip2, xz, zip", objectives: ["103.3"], videos: [18], lab: "docker" },
      { slug: "hard-link-soft-link", title: "Hard link và symbolic link", objectives: ["104.6"], videos: [32], lab: "docker" },
    ],
  },
  {
    slug: "xu-ly-van-ban",
    title: "Luồng dữ liệu và xử lý văn bản",
    description: "Nối lệnh bằng đường ống, chuyển hướng kết quả, lọc và tìm trong văn bản.",
    lessons: [
      { slug: "chuyen-huong-va-pipe", title: "Chuyển hướng nhập xuất và đường ống (pipe)", objectives: ["103.4"], videos: [13], lab: "docker" },
      { slug: "loc-van-ban", title: "Lọc văn bản: cut, sort, uniq, tr, sed, awk", objectives: ["103.2"], videos: [21], lab: "docker" },
      { slug: "grep-va-regex", title: "Tìm trong văn bản: grep và biểu thức chính quy", objectives: ["103.7"], videos: [14, 15], lab: "docker" },
    ],
  },
  {
    slug: "nguoi-dung-phan-quyen",
    title: "Người dùng và phân quyền",
    description: "Ai được đăng nhập, ai được đọc, sửa, chạy file nào — nền tảng bảo mật của Linux.",
    lessons: [
      { slug: "tai-khoan-va-nhom", title: "Tài khoản, nhóm và các file /etc/passwd, /etc/shadow, /etc/group", objectives: ["107.1"], videos: [26, 28], lab: "docker" },
      { slug: "lenh-quan-ly-nguoi-dung", title: "Lệnh quản lý người dùng và nhóm", objectives: ["107.1"], videos: [27, 29], lab: "docker" },
      { slug: "phan-quyen-file", title: "Phân quyền file: rwx, chmod, chown, umask", objectives: ["104.5"], videos: [30, 31], lab: "docker" },
      { slug: "quyen-dac-biet", title: "Quyền đặc biệt: SUID, SGID, sticky bit", objectives: ["104.5"], videos: [], lab: "docker" },
    ],
  },
  {
    slug: "tien-trinh-dich-vu",
    title: "Tiến trình, dịch vụ và nhật ký",
    description: "Chương trình đang chạy, cách hệ thống khởi động, quản lý dịch vụ, đọc log và hẹn giờ chạy việc.",
    lessons: [
      { slug: "tien-trinh", title: "Tiến trình: ps, top, kill, chạy nền, độ ưu tiên", objectives: ["103.5", "103.6"], videos: [], lab: "docker" },
      { slug: "khoi-dong-he-thong", title: "Quá trình khởi động, target, tắt và khởi động lại", objectives: ["101.2", "101.3"], videos: [23, 24], lab: "vm" },
      { slug: "systemd-dich-vu", title: "Quản lý dịch vụ bằng systemctl và viết unit file", objectives: ["101.3"], videos: [], lab: "vm" },
      { slug: "nhat-ky-he-thong", title: "Nhật ký hệ thống: journalctl và /var/log", objectives: ["108.2"], videos: [], lab: "vm" },
      { slug: "lap-lich-cong-viec", title: "Hẹn giờ chạy việc: cron, at, systemd timer", objectives: ["107.2"], videos: [], lab: "docker" },
    ],
  },
  {
    slug: "cai-dat-phan-mem",
    title: "Cài đặt phần mềm",
    description: "Cài, gỡ, cập nhật phần mềm trên họ Debian/Ubuntu và họ Red Hat.",
    lessons: [
      { slug: "apt-va-dpkg", title: "Quản lý gói trên Ubuntu/Debian: apt và dpkg", objectives: ["102.4"], videos: [35, 37, 39], lab: "docker" },
      { slug: "dnf-va-rpm", title: "Quản lý gói trên Red Hat/Rocky: dnf và rpm", objectives: ["102.5"], videos: [], lab: "docker" },
      { slug: "thu-vien-dung-chung", title: "Thư viện dùng chung: ldd, ldconfig", objectives: ["102.3"], videos: [], lab: "docker" },
    ],
  },
  {
    slug: "phan-cung-o-dia",
    title: "Phần cứng, ổ đĩa và filesystem",
    description: "Xem phần cứng, chia phân vùng, tạo filesystem, gắn ổ và kiểm tra dung lượng.",
    lessons: [
      { slug: "thong-tin-he-thong", title: "Xem thông tin hệ thống và phần cứng", objectives: ["101.1"], videos: [25], lab: "docker" },
      { slug: "phan-vung-va-filesystem", title: "Phân vùng, filesystem, swap và LVM", objectives: ["102.1", "104.1"], videos: [43], lab: "vm" },
      { slug: "mount-va-fstab", title: "Gắn ổ: mount, umount, /etc/fstab", objectives: ["104.3"], videos: [], lab: "vm" },
      { slug: "dung-luong-va-sua-loi", title: "Dung lượng và sửa lỗi filesystem: df, du, fsck", objectives: ["104.2"], videos: [], lab: "docker" },
      { slug: "trinh-nap-khoi-dong", title: "Trình nạp khởi động GRUB 2", objectives: ["102.2"], videos: [], lab: "vm" },
    ],
  },
  {
    slug: "shell-script",
    title: "Shell và lập trình Bash",
    description: "Biến môi trường, alias, rồi viết script Bash: nhập xuất, điều kiện, vòng lặp, mảng, hàm, gỡ lỗi.",
    lessons: [
      { slug: "moi-truong-shell", title: "Môi trường shell: biến, PATH, alias, .bashrc", objectives: ["105.1"], videos: [], lab: "docker" },
      { slug: "bash-script-dau-tien", title: "Script Bash đầu tiên: shebang, echo, read", objectives: ["105.2"], videos: [44, 45], lab: "docker" },
      { slug: "bash-tinh-toan-tham-so", title: "Tính toán và truyền tham số cho script", objectives: ["105.2"], videos: [46, 47], lab: "docker" },
      { slug: "bash-dieu-kien", title: "Câu lệnh điều kiện: if, test, case, mã thoát", objectives: ["105.2"], videos: [48], lab: "docker" },
      { slug: "bash-vong-lap", title: "Vòng lặp: for, while, until", objectives: ["105.2"], videos: [49], lab: "docker" },
      { slug: "bash-mang-va-ham", title: "Mảng và hàm trong Bash", objectives: ["105.2"], videos: [50, 51], lab: "docker" },
      { slug: "bash-thuc-hanh-va-go-loi", title: "Bài tập Bash tổng hợp và cách gỡ lỗi script", objectives: ["105.2"], videos: [52, 53, 54, 55], lab: "docker" },
    ],
  },
  {
    slug: "quan-tri-he-thong",
    title: "Quản trị hệ thống",
    description: "Giờ hệ thống, ngôn ngữ và múi giờ, cùng những phần ít gặp trên server nhưng có trong chuẩn LPIC-1.",
    lessons: [
      { slug: "ngay-gio-he-thong", title: "Ngày giờ hệ thống: date, timedatectl, NTP", objectives: ["108.1"], videos: [22], lab: "docker" },
      { slug: "ngon-ngu-mui-gio", title: "Ngôn ngữ, bảng mã và múi giờ", objectives: ["107.3"], videos: [36], lab: "docker" },
      { slug: "do-hoa-may-in-mail", title: "Biết qua: giao diện đồ hoạ, máy in, mail", objectives: ["106.1", "106.2", "106.3", "108.3", "108.4"], videos: [], lab: "docker" },
    ],
  },
  {
    slug: "mang",
    title: "Mạng",
    description: "IP, cổng, cấu hình mạng, kiểm tra kết nối và DNS.",
    lessons: [
      { slug: "mang-can-ban", title: "Mạng căn bản: IP, subnet, cổng, TCP/UDP", objectives: ["109.1"], videos: [], lab: "docker" },
      { slug: "cau-hinh-mang", title: "Cấu hình mạng: ip, hostname, netplan, nmcli", objectives: ["109.2"], videos: [33, 34], lab: "vm" },
      { slug: "kiem-tra-mang", title: "Kiểm tra sự cố mạng: ping, ss, curl, traceroute", objectives: ["109.3"], videos: [], lab: "docker" },
      { slug: "dns-phia-may-khach", title: "DNS phía máy khách: /etc/hosts, resolv.conf, dig", objectives: ["109.4"], videos: [], lab: "docker" },
    ],
  },
  {
    slug: "bao-mat",
    title: "Bảo mật",
    description: "Kiểm tra tài khoản và cổng mở, khoá bớt dịch vụ, dùng SSH key và mã hoá dữ liệu.",
    lessons: [
      { slug: "kiem-tra-bao-mat", title: "Kiểm tra bảo mật: người đăng nhập, cổng mở, sudoers", objectives: ["110.1"], videos: [], lab: "docker" },
      { slug: "bao-mat-may-chu", title: "Bảo mật máy chủ: tắt dịch vụ thừa, tường lửa", objectives: ["110.2"], videos: [], lab: "vm" },
      { slug: "ssh-va-ma-hoa", title: "SSH key, scp và mã hoá bằng GPG", objectives: ["110.3"], videos: [], lab: "docker" },
    ],
  },
  {
    slug: "du-an",
    title: "Dự án tổng hợp",
    description: "Ghép mọi thứ đã học: dựng một máy chủ web từ máy trắng đến khi chạy ổn định.",
    lessons: [
      { slug: "du-an-may-chu-web", title: "Dự án: dựng máy chủ web từ đầu", objectives: ["110.2", "101.3", "107.2"], videos: [], lab: "vm" },
    ],
  },
];
