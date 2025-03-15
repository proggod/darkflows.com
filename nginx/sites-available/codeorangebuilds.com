server {
    listen 80;
    server_name codeorangebuilds.com www.codeorangebuilds.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name codeorangebuilds.com www.codeorangebuilds.com;

    ssl_certificate /etc/letsencrypt/live/codeorangebuilds.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/codeorangebuilds.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /var/www/codeorangebuilds;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}

