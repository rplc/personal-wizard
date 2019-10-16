const http = require('http'),
    express = require('express'),
    exphbs  = require('express-handlebars'),
    path = require('path'),
    bodyParser = require('body-parser'),
    env = require('../env'),
    mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(env.mongo, {
    useNewUrlParser: true
}).catch(err => console.error(err));

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.enable('trust proxy');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// routers
app.get('/', (req, res) => {
    res.render('home');
});
app.use('/shows', require('./router/shows'));
app.use('/settings', require('./router/settings'));
app.use('/clock', require('./router/binaryClock'));

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
httpServer.listen(2002);