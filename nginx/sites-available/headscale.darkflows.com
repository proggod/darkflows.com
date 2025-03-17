# Basing this on https://headscale.net/0.24.2/ref/integration/reverse-proxy/#nginx
map $http_upgrade $connection_upgrade {
    default    upgrade;
    ''         close;
}

server {
    # Redirect HTTP to HTTPS
    listen 80;
    listen [::]:80;
    server_name headscale.darkflows.com;
    return 301 https://$host$request_uri;
}

server {
    # HTTPS configuration
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    
    # Define the server names
    server_name headscale.darkflows.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/headscale.darkflows.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/headscale.darkflows.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/headscale.darkflows.com/chain.pem;
    
    # Recommended SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # HSTS (uncomment if you're sure)
    # add_header Strict-Transport-Security "max-age=63072000" always;

    # Set the root directory for the website
    root /var/www/darkflows.com;

    # Define the index files
    index index.html index.htm;

    # Add logs for debugging and access tracking
    access_log /var/log/nginx/darkflows.com.access.log;
    error_log /var/log/nginx/darkflows.com.error.log;

    # Location block to serve files from /var/www/darkflows.com
#    location / {
#        try_files $uri $uri/ =404;
#    }

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_buffering off;
#        add_header Strict-Transport-Security "max-age=15552000; includeSubDomains" always;
    }
}

