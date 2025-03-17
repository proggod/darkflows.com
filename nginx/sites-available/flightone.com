server {
    if ($host = www.flightone.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = flightone.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name flightone.com www.flightone.com;
    return 301 https://$host$request_uri;




}

server {
    listen 443 ssl;
    server_name flightone.com www.flightone.com;

    location = /index.html {
        return 301 /home;
    }


    # Redirect /home/pinouts to /pinouts.html
    location = /home/pinouts {
        return 301 /pinouts.html;
    }

    # Redirect /pinouts to /pinouts.html
    location = /pinouts {
        return 301 /pinouts.html;
    }


    # Serve /pinouts.html directly from the filesystem
    location = /pinouts.html {
        root /var/www/flightone.com;
    }




    # Serve /intros.html from the specific path

    # Catch-all for .html files, rewrite to /home/*
    location ~* \.html$ {
        rewrite ^/(.*)\.html$ /home/$1 permanent;
    }


    # Serve .json files as application/json (displayed in the browser)
    location ~* \.json$ {
        root /var/www/flightone.com;  # Change to your actual web root
        default_type application/json;  # Set correct MIME type for JSON
        try_files $uri =404;  # Serve the file if it exists, else return 404
    }

    # Serve .yml files as application/x-yaml (displayed in the browser)
    location ~* \.(yml|yaml)$ {
        root /var/www/flightone.com;  # Change to your actual web root
        default_type application/x-yaml;  # Set correct MIME type for YAML
        try_files $uri =404;  # Serve the file if it exists, else return 404
    }

    # Serve .exe, .dmg, .zip files as downloadable files
    location ~* \.(md|flx|exe|dmg|zip)$ {
        root /var/www/flightone.com;  # Change to your actual web root
        default_type application/octet-stream;  # Set MIME type for binary downloads
        try_files $uri =404;  # Serve the file if it exists, else return 404
    }


    location /css/ {
        root /var/www/flightone.com/;  # Make sure this points to the correct root directory for your project
    }


    location /js/ {
        root /var/www/flightone.com/;  # Make sure this points to the correct root directory for your project
    }

    location /oldimages/ {
        root /var/www/flightone.com/;  # Make sure this points to the correct root directory for your project
    }

    location /configurator/ {
        root /var/www/flightone.com/;  # Make sure this points to the correct root directory for your project
    }

    location /firmware/ {
        root /var/www/flightone.com/;  # Make sure this points to the correct root directory for your project
    }

    location /media/ {
        root /var/www/flightone.com/;  # Make sure this points to the correct root directory for your project
    }



    location / {
        proxy_pass http://localhost:3010;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    rewrite ^/home/contact$ /discord.php break;
    rewrite ^/home/discord$ /discord.php break;
    rewrite ^/home/support$ /discord.php break;


    # Redirect all PHP files to /var/www/php/filename.php
    location ~ \.php$ {
        # Extract the filename from the request
        set $php_filename $uri;


        # Pass the request to PHP-FPM
        root /var/www/flightone.com;
        fastcgi_pass unix:/var/run/php/php-fpm.sock; # Adjust to your PHP-FPM configuration
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }



    ssl_certificate /etc/letsencrypt/live/flightone.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/flightone.com/privkey.pem; # managed by Certbot

}


