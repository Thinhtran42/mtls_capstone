#!/bin/sh

# Tạo file env-config.js chứa các biến môi trường runtime
echo "window.env = {" > /usr/share/nginx/html/env-config.js
echo "  REACT_APP_API_URL: \"${REACT_APP_API_URL:-http://localhost:3000}\"," >> /usr/share/nginx/html/env-config.js
echo "  API_URL: \"${API_URL:-http://localhost:3000}\"," >> /usr/share/nginx/html/env-config.js
echo "};" >> /usr/share/nginx/html/env-config.js