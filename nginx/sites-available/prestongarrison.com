server {
    listen 80;
    server_name www.prestongarrison.com;
    return 301 https://prestongarrison.com$request_uri;
}

server {
    listen 80;
    server_name prestongarrison.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name www.prestongarrison.com;
    
    ssl_certificate /etc/letsencrypt/live/prestongarrison.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/prestongarrison.com/privkey.pem; # managed by Certbot
    
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    return 301 https://prestongarrison.com$request_uri;
}

server {
    listen 443 ssl;
    server_name prestongarrison.com;

    ssl_certificate /etc/letsencrypt/live/prestongarrison.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/prestongarrison.com/privkey.pem; # managed by Certbot
    
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location ~* \.(md|flx|exe|dmg|zip|txt)$ {
        root /var/www/prestongarrison.com;  # Change to your actual web root
        default_type application/octet-stream;  # Set MIME type for binary downloads
        try_files $uri =404;  # Serve the file if it exists, else return 404
    }


    location = /sitemap.xml {
        return 301 /api/sitemap.xml;
    }

    location = /sitemap_index.xml {
        return 301 /api/sitemap.xml;
    }


    location / {
        proxy_pass http://localhost:3030;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ~ \.php$ {
        set $php_filename $uri;
        rewrite ^/.*\.php$ /php$php_filename break;
        
        root /var/www;
        fastcgi_pass unix:/var/run/php/php-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}

