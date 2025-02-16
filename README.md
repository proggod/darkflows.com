DarkFlows.com Website using some templates with a full blog system.

blog admin is on /admin
view blog pages on /blog
reset database with /reset567 

recommend using npm

edit ./build.sh and ./deploy.sh to have your docker account

## Setup
1. Copy sample.env.production to .env.production
2. Update the passwords and secrets in .env.production
3. Copy docker-compose.prod.yml.example to docker-compose.prod.yml
4. Update any environment-specific settings in docker-compose.prod.yml

./build.sh to upload to docker hub

./deploy.sh --prod to deploy to production
./deploy.sh --dev for development




