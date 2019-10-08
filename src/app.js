const fs = require('fs'),
    http = require('http'),
    https = require('https'),
    express = require('express'),
    exphbs  = require('express-handlebars'),
    path = require('path'),
    bodyParser = require('body-parser'),
    env = require('./env'),
    mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(env.mongo, {
    useNewUrlParser: true
}).catch(err => console.error(err));

const app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.enable('trust proxy');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// routers
app.use('/', require('./router/index'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
    var err = new Error('Not Found ' + req.path);
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: app.get('env') === 'development' ? err : {}
    });
});

const httpServer = http.createServer(app);
    /*httpsServer = https.createServer({
        key: fs.readFileSync('/etc/letsencrypt/live/myocto.duckdns.org/privkey.pem', 'utf8'),
        cert: fs.readFileSync('/etc/letsencrypt/live/myocto.duckdns.org/cert.pem', 'utf8'),
        ca: fs.readFileSync('/etc/letsencrypt/live/myocto.duckdns.org/chain.pem', 'utf8')
    }, app);*/

httpServer.listen(2005);
//httpsServer.listen(2006);