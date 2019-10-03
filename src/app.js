const fs = require('fs'),
    http = require('http'),
    https = require('https'),
    express = require('express'),
    session = require('express-session'),
    exphbs  = require('express-handlebars'),
    path = require('path'),
    bodyParser = require('body-parser');

const app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.enable('trust proxy');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// session midleware
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        //secure: true, //only https
        maxAge: 600000
    }
}));

// middleware that checks if the user is currently logged in or on its way to login page
app.use((req, res, next) => {
    if (req.session.user || req.path === '/login') {
        next();
    } else {
        res.redirect('/login');
    }
});

// routers must be below the session middleware!!!
app.use('/', require('./router/index'));
//app.use('/subscribe', subscribe);

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