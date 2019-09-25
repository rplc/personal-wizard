```
npm install express
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install certbot
certbot certonly --manual
```

# Other Infos
 * FritzBox Port Mapping von 80/443 extern auf beliebige Port auf Rechner
 * WebServer beispielsweise mittels `php -S LOKALE_IP:PORT`
    * nicht localhost verwenden! Muss die IP vom Port Mapping in der FritzBox sein!
    * entsprechende Datei mit entsprechendem Inhalt einfach im Unterverzeichnis anlegen

## HTTPS Express WebServer

```
// Dependencies
const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');

const app = express();

// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

app.use((req, res) => {
	res.send('Hello there !');
});

// Starting both http & https servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(LOKALPORT_HTTP, () => {
	console.log('HTTP Server running on port 80');
});

httpsServer.listen(LOKALPORT_HTTPS, () => {
	console.log('HTTPS Server running on port 443');
});
```