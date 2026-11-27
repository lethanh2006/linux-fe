/**
 * 55 video của playlist "LPI1 - Tự học Linux cơ bản" (kênh TITV).
 * Khóa theo số bài trong playlist; bài học trên web trỏ tới video bằng số này.
 */
export const PLAYLIST_ID = "PLyxSzL3F74878husgCe4IF6iJNSCjYTGq";
export const PLAYLIST_URL = `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`;

export type Video = { id: string; title: string };

export const VIDEOS: Record<number, Video> = {
  1: { id: "8Cr0x5RtH5M", title: "Giới thiệu khóa học Hệ điều hành Linux" },
  2: { id: "Ey4r97_0gIk", title: "Giới thiệu tổng quan về Hệ điều hành Linux" },
  3: { id: "vDTg3af1C5c", title: "Cách cài đặt Ubuntu trên máy ảo" },
  4: { id: "uzj0TWQSQ-s", title: "Hướng dẫn dùng WSL chạy Ubuntu Linux trên Windows" },
  5: { id: "yOALNRQObX0", title: "Cấu trúc của hệ điều hành Linux" },
  6: { id: "w8s6gL2LiMg", title: "Cấu trúc cây thư mục của hệ điều hành Linux" },
  7: { id: "ddTQpPxKQSU", title: "Cách sử dụng Terminal và cú pháp câu lệnh trong Linux" },
  8: { id: "t-ZHMrUGMpY", title: "Lệnh Sudo và cách đặt mật khẩu cho tài khoản root trong Linux" },
  9: { id: "ZB3tz3w9tZw", title: "Lệnh in thư mục hiện hành (pwd) và lệnh thay đổi thư mục (cd) của Linux" },
  10: { id: "vQzBCmzuSzs", title: "Các lệnh quản lý file và thư mục trong Linux" },
  11: { id: "_RasEf8dk6M", title: "Các ký tự đại diện trong Linux" },
  12: { id: "gpPTwflv-kA", title: "Các lệnh xem nội dung tập tin trong Linux" },
  13: { id: "1ZzFMuQPGd0", title: "Định hướng nhập xuất và đường ống pipeline trong Linux" },
  14: { id: "9NzH15hgKrA", title: "Câu lệnh tìm kiếm grep trong Linux" },
  15: { id: "uRXbL7pIq2Q", title: "Biểu thức chính quy - Regular Expression Regex" },
  16: { id: "dR6CTC_o5Dc", title: "Tìm kiếm tập tin bằng lệnh find trong Linux" },
  17: { id: "B4ccjQtWK_w", title: "Câu lệnh tìm kiếm whereis và which trong Linux" },
  18: { id: "9KI1KmEkDmc", title: "Câu lệnh nén và giải nén trong Linux" },
  19: { id: "r-aPxQ3HShs", title: "Hướng dẫn sử dụng trình soạn thảo vi" },
  20: { id: "rliWIOdXb1o", title: "Thực hành trình soạn thảo vi" },
  21: { id: "VBTdkICIn4s", title: "Lệnh CUT trong Linux" },
  22: { id: "vZb7eA3lFJg", title: "Các lệnh về ngày giờ trong Linux" },
  23: { id: "mYNIMwO7PYU", title: "Các lệnh tắt và khởi động lại máy trong Linux" },
  24: { id: "VxZXgUDYPpc", title: "Quá trình khởi động hệ điều hành Linux và các run levels" },
  25: { id: "dDpXdjTdmUI", title: "Các câu lệnh xem thông tin hệ thống Linux" },
  26: { id: "Q9F6dYNeeVk", title: "Quản trị người dùng trong hệ thống Linux" },
  27: { id: "Nv8tEj1DejQ", title: "Các câu lệnh quản trị người dùng trong hệ thống Linux" },
  28: { id: "8_xjaSYMgtc", title: "Quản trị group trong Linux" },
  29: { id: "MMFJo9CBY5A", title: "Các lệnh quản trị group trong Linux" },
  30: { id: "y57GxrTH7Mo", title: "Phân quyền trên hệ thống file và thư mục trong Linux" },
  31: { id: "qWKppMTOfvA", title: "Các lệnh thay đổi quyền, người, nhóm sở hữu file và thư mục trong Linux" },
  32: { id: "FbivkHatOSw", title: "Hard Link và Soft Link Symbolic Link trong Linux" },
  33: { id: "Gw8OMZr2yos", title: "Cấu hình mạng trong Linux" },
  34: { id: "mqrSdVKfa_A", title: "Cấu hình địa chỉ IP trong Linux" },
  35: { id: "wYYzxu77T90", title: "Hướng dẫn cài đặt và gỡ bỏ ứng dụng trong Ubuntu" },
  36: { id: "EudgzCOv2dY", title: "Hướng dẫn cài bộ gõ tiếng Việt trên Ubuntu" },
  37: { id: "XR6oJiFlzq4", title: "Hướng dẫn cài đặt công cụ lập trình C/C++ trong linux" },
  38: { id: "E7VX1Js8hNM", title: "Hướng dẫn cài đặt codeblocks để lập trình C/C++ trong Linux" },
  39: { id: "1S-8k02cY2g", title: "Hướng dẫn cài đặt Visual Studio Code trong Ubuntu Linux" },
  40: { id: "a1RMxcXFFMo", title: "Hướng dẫn cài đặt công cụ lập trình Java trên Linux" },
  41: { id: "DmMU68yTIA8", title: "Hướng dẫn cài đặt Python và công cụ lập trình Pycharm trên linux" },
  42: { id: "EgabX3TG9Mw", title: "Hướng dẫn cài đặt R và RStudio trong Linux" },
  43: { id: "hCQBaUJOV3c", title: "Linux File Systems và một số câu lệnh quản lý phân vùng" },
  44: { id: "1cGeqHGENHM", title: "Giới thiệu về lập trình Shell Bash trong Linux" },
  45: { id: "CkRY-udaqVA", title: "Câu lệnh nhập và xuất trong lập trình Shell" },
  46: { id: "1KhgzhR4-IM", title: "Thực hiện các phép tính trong lập trình Shell Bash" },
  47: { id: "679e1V3cHhg", title: "Truyền tham số lệnh Shell Bash" },
  48: { id: "qbzUZuf3MMg", title: "Câu lệnh điều kiện và các phép toán so sánh trong Shell Bash" },
  49: { id: "qHDoFCKLCM8", title: "Vòng lặp trong Shell Bash" },
  50: { id: "WwxhieGazx0", title: "Cách sử dụng mảng trong lập trình Shell Bash" },
  51: { id: "2wVi0JWvzxk", title: "Cách xây dựng hàm trong lập trình Shell Bash" },
  52: { id: "J3piOMDJg7s", title: "Lập trình kiểm tra số nguyên tố" },
  53: { id: "TJXg5TekztQ", title: "Lập trình tìm min của mảng trong Shell Bash" },
  54: { id: "h0b901u534E", title: "Nhập xuất dữ liệu từ file và sắp xếp mảng trong Shell Bash" },
  55: { id: "76KfxmMRvWQ", title: "Cách Debug trong lập trình Shell Bash" },
};

export function videoUrl(n: number) {
  const video = VIDEOS[n];
  return `https://www.youtube.com/watch?v=${video.id}&list=${PLAYLIST_ID}&index=${n}`;
}
