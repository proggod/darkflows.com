server {
    listen 80;
    server_name gitlab.darkflows.com;

    location /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
    }

    return 301 https://gitlab.darkflows.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name gitlab.darkflows.com;

    ssl_certificate /etc/letsencrypt/live/gitlab.darkflows.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gitlab.darkflows.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/gitlab.darkflows.com/chain.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass https://localhost:1443;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_ssl_verify off;  # GitLab uses its own SSL, so we disable verification
    }
}



