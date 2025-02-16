DarkFlows.com Website using some templates with a full blog system.

blog admin is on /admin
view blog pages on /blog
reset database with /reset567 

recommend using npm

edit ./build.sh and ./deploy.sh to have your docker account

./build.sh to upload to docker hub

./deploy.sh --prod to deploy to production
./deploy.sh --dev for development



This will automatically install DarkFlows asking as few of questions as possible.  Once its installed, unmount the ISO and reboot.  Once you reboot allow the install to finish, which could take up to 15 minutes, it will show the web admin URL once its installed.  Make sure you have at least 2 network interfaces activated during install.  Once install reboot on more time, and then we can verify install was done properly.

