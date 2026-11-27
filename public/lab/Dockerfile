# Môi trường thực hành cho web Học Linux.
# Ubuntu 24.04 có sẵn man page và các công cụ hay dùng, đăng nhập bằng user thường "hocvien" (mật khẩu: hocvien) có quyền sudo.
#
#   docker build -t linux-lab .
#   docker run -it --name lab --hostname lab linux-lab
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive TZ=Asia/Ho_Chi_Minh LANG=C.UTF-8

# Bản image gốc bị lược man page để nhẹ; "unminimize" trả lại đầy đủ.
RUN apt-get update \
 && apt-get install -y unminimize \
 && yes | unminimize \
 && apt-get install -y --no-install-recommends \
      sudo man-db manpages manpages-dev less vim nano bash-completion \
      curl wget ca-certificates iproute2 iputils-ping dnsutils netcat-openbsd traceroute \
      procps psmisc htop lsof tree file findutils plocate \
      tar gzip bzip2 xz-utils zip unzip bc \
      cron at tzdata locales acl openssh-client gnupg \
 && locale-gen en_US.UTF-8 vi_VN.UTF-8 \
 && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash hocvien \
 && echo 'hocvien:hocvien' | chpasswd \
 && usermod -aG sudo hocvien

USER hocvien
WORKDIR /home/hocvien
CMD ["bash", "-l"]
