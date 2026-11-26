# DevOps Interview Handbook

Static website, no build step, no database, no server code.
Works on mobile and desktop, supports dark mode, works offline after first visit.

## Test locally (pick one)
**Python (easiest):** `cd` into this folder, then `python3 -m http.server 8080` and open http://localhost:8080
**Node:** `npx serve .` or `npx http-server -p 8080`
**Windows:** double-click `start-windows.bat`. **Mac/Linux:** `./start.sh`
**On your phone:** run the server, find your PC's IP (e.g. 192.168.1.20) and open http://192.168.1.20:8080 on the same Wi-Fi.

Do not open index.html by double-click for the final test; use a server (offline mode needs http).

## Host it
Upload all files and folders to your web root (keep the structure).

**Nginx**
```
server {
  listen 80; server_name interview.yourdomain.com;
  root /var/www/devops-handbook; index index.html;
  location / { try_files $uri $uri/ /index.html; }
  location ~* \.(css|js|svg)$ { expires 7d; }
  location = /sw.js { add_header Cache-Control "no-cache"; }
}
```
Then: `sudo certbot --nginx -d interview.yourdomain.com` for HTTPS (needed for "Add to Home Screen" and offline mode).

**Apache:** copy to /var/www/html/ (or a vhost DocumentRoot). No extra config needed.

## Update content
Questions live in `data/data.js` (JSON assigned to `window.DATA`). Add objects to a topic's `qa` array:
`{"id":999,"cat":"Docker","lvl":"Junior","q":"Question","a":"Answer sentence one. Sentence two."}`
Each sentence becomes a numbered step. After editing, bump `V` in `sw.js` (e.g. v2) so phones get the new data.

## Files
index.html, css/style.css, js/app.js, data/data.js, sw.js, manifest.json, icons/icon.svg
