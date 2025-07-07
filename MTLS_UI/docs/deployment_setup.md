# Hướng dẫn thiết lập triển khai tự động

## 1. Thiết lập Droplet trên DigitalOcean

### Tạo một Droplet mới (nếu chưa có)

1. Đăng nhập vào tài khoản DigitalOcean
2. Chọn "Create" > "Droplets"
3. Chọn hệ điều hành Ubuntu (khuyến nghị Ubuntu 22.04 LTS)
4. Chọn kế hoạch phù hợp với yêu cầu ứng dụng (Basic plan là đủ để bắt đầu)
5. Chọn data center gần với người dùng của bạn
6. Thêm SSH key hoặc tạo mật khẩu
7. Đặt tên cho Droplet và nhấn "Create Droplet"

### Chuẩn bị môi trường trên server

1. SSH vào Droplet của bạn:

   ```
   ssh root@your_droplet_ip
   ```

2. Cập nhật hệ thống:

   ```
   apt update && apt upgrade -y
   ```

3. Cài đặt Node.js và npm:

   ```
   curl -sL https://deb.nodesource.com/setup_18.x | bash -
   apt install -y nodejs
   ```

4. Cài đặt PM2 để quản lý quy trình Node.js:

   ```
   npm install -g pm2
   ```

5. Tạo thư mục cho ứng dụng:

   ```
   mkdir -p /var/www/mtls-ui
   ```

6. Tạo một người dùng triển khai chuyên dụng (tùy chọn, nhưng được khuyến nghị):

   ```
   adduser deploy
   usermod -aG sudo deploy
   ```

7. Cấp quyền cho thư mục ứng dụng:
   ```
   chown -R deploy:deploy /var/www/mtls-ui
   ```

## 2. Thiết lập Nginx (tùy chọn, nhưng được khuyến nghị)

1. Cài đặt Nginx:

   ```
   apt install -y nginx
   ```

2. Tạo cấu hình Nginx cho ứng dụng:

   ```
   nano /etc/nginx/sites-available/mtls-ui
   ```

3. Thêm cấu hình sau:

   ```
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com; # Thay bằng tên miền thực tế hoặc IP

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. Kích hoạt cấu hình:

   ```
   ln -s /etc/nginx/sites-available/mtls-ui /etc/nginx/sites-enabled/
   ```

5. Kiểm tra cấu hình Nginx:

   ```
   nginx -t
   ```

6. Khởi động lại Nginx:
   ```
   systemctl restart nginx
   ```

## 3. Thiết lập GitHub Actions Secret

1. Trong GitHub repository của bạn, vào "Settings" > "Secrets and variables" > "Actions"

2. Thêm các secrets sau:

   - `DROPLET_IP`: Địa chỉ IP của DigitalOcean Droplet
   - `DEPLOY_USER`: Tên người dùng trên server (root hoặc deploy nếu bạn đã tạo)
   - `DEPLOY_SSH_KEY`: Khóa SSH private (toàn bộ nội dung của file `id_rsa`)

### Tạo SSH key (nếu chưa có):

1. Trên máy local, tạo SSH key mới:

   ```
   ssh-keygen -t rsa -b 4096 -C "deployment@example.com" -f deployment_key
   ```

2. Thêm public key vào file `~/.ssh/authorized_keys` trên server:

   ```
   cat deployment_key.pub | ssh deploy@your_droplet_ip "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
   ```

3. Thêm toàn bộ nội dung của file `deployment_key` private vào GitHub secret `DEPLOY_SSH_KEY`

## 4. First Deployment

1. Đẩy code lên nhánh chính (main) của repository
2. GitHub Actions sẽ tự động trigger workflow
3. Kiểm tra tab "Actions" trong repository để theo dõi tiến trình

## 5. Xác minh triển khai

1. Truy cập trang web của bạn qua địa chỉ IP của Droplet hoặc tên miền đã cấu hình
2. Nếu sử dụng PM2, kiểm tra trạng thái ứng dụng:

   ```
   pm2 status
   ```

3. Kiểm tra log ứng dụng nếu cần:
   ```
   pm2 logs mtls-ui
   ```

## 6. Thiết lập SSL (tùy chọn)

Nếu bạn có tên miền, bạn nên cài đặt SSL bằng Certbot:

```
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot sẽ tự động cấu hình Nginx cho HTTPS.
