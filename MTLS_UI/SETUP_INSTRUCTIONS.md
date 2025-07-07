# Hướng dẫn thiết lập server cho CI/CD với GitHub

## 1. Chuẩn bị môi trường trên DigitalOcean Droplet

### Cài đặt các gói cần thiết

```bash
# Cập nhật hệ thống
sudo apt update
sudo apt upgrade -y

# Cài đặt các công cụ cần thiết
sudo apt install -y git nginx curl

# Cài đặt Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Cài đặt PM2 (tùy chọn, nếu bạn muốn quản lý quy trình)
sudo npm install -g pm2
```

### Thiết lập thư mục và quyền

```bash
# Tạo thư mục cho ứng dụng
sudo mkdir -p /var/www/mtls-ui
sudo chown -R $USER:$USER /var/www/mtls-ui
```

## 2. Thiết lập GitHub SSH key cho server

### Tạo SSH key trên server

```bash
# Tạo SSH key cho deploy
ssh-keygen -t rsa -b 4096 -C "deploy@example.com" -f ~/.ssh/github_deploy_key
```

### Thêm Deploy Key vào GitHub repository

1. Hiển thị public key:

   ```bash
   cat ~/.ssh/github_deploy_key.pub
   ```

2. Thêm key này vào GitHub:
   - Đi đến repository > Settings > Deploy keys
   - Nhấn "Add deploy key"
   - Dán public key và đặt tên cho nó
   - Chọn "Allow write access" nếu bạn muốn server có thể push ngược lại
   - Lưu lại

### Cấu hình SSH để kết nối với GitHub

```bash
# Thêm vào file ~/.ssh/config
cat >> ~/.ssh/config << EOF
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_deploy_key
  IdentitiesOnly yes
EOF

# Kiểm tra kết nối
ssh -T git@github.com
```

## 3. Clone repository và thiết lập ban đầu

### Clone repository

```bash
# Clone repository
cd /var/www/mtls-ui
git clone git@github.com:your-username/MTLS_UI.git .

# Hoặc nếu đã có nội dung trong thư mục
git init
git remote add origin git@github.com:your-username/MTLS_UI.git
git fetch
git checkout main
```

### Cài đặt dependencies và build ứng dụng

```bash
# Cài đặt dependencies
npm install

# Build ứng dụng
npm run build
```

## 4. Cấu hình Nginx

### Thiết lập Nginx

```bash
# Copy file cấu hình
sudo cp /var/www/mtls-ui/nginx.conf /etc/nginx/sites-available/mtls-ui

# Tạo symlink
sudo ln -sf /etc/nginx/sites-available/mtls-ui /etc/nginx/sites-enabled/

# Kiểm tra cú pháp
sudo nginx -t

# Khởi động lại Nginx
sudo systemctl reload nginx
```

## 5. Thiết lập GitHub Actions Secrets

Đi đến GitHub repository > Settings > Secrets and variables > Actions và thêm các secrets sau:

- `SSH_HOST`: Địa chỉ IP của DigitalOcean Droplet
- `SSH_USERNAME`: Tên người dùng trên server (thường là root hoặc tên người dùng của bạn)
- `SSH_KEY`: Nội dung của private key trên máy local của bạn (không phải key trên server).

Để lấy private key:

```bash
# Tạo key trên máy local nếu chưa có
ssh-keygen -t rsa -b 4096 -C "deploy-from-github@example.com" -f ~/.ssh/do_deploy_key

# Hiển thị private key để copy vào GitHub Secret
cat ~/.ssh/do_deploy_key
```

Sau đó thêm public key vào authorized_keys trên server:

```bash
# Trên máy local của bạn
cat ~/.ssh/do_deploy_key.pub | ssh user@your-droplet-ip "cat >> ~/.ssh/authorized_keys"
```

## 6. Kiểm tra triển khai

Đẩy một thay đổi lên GitHub để kích hoạt workflow:

```bash
git add .
git commit -m "Test deployment"
git push origin main
```

Sau đó kiểm tra tab Actions trên GitHub để xem quá trình triển khai.

## 7. Xử lý sự cố

### Kiểm tra log Nginx

```bash
sudo tail -f /var/log/nginx/error.log
```

### Kiểm tra quyền truy cập

```bash
# Đảm bảo người dùng có quyền
sudo chown -R $USER:$USER /var/www/mtls-ui

# Đảm bảo Nginx có quyền đọc
sudo chmod -R 755 /var/www/mtls-ui
```

### Kiểm tra kết nối SSH từ GitHub Actions

Kiểm tra output của workflow trong tab Actions trên GitHub.
