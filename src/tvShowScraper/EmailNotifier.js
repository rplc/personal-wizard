async function main() {
    const Kodi = require('./Kodi.js'),
        k = new Kodi(),
        TheMovieDB = require('./TheMovieDB.js'),
        m = new TheMovieDB(),
        env = require('../env'),
        mongoose = require('mongoose'),
        TvShow = require('../model/TvShow');

    mongoose.Promise = global.Promise;
    mongoose.connect(env.mongo, {
        useNewUrlParser: true
    }).catch(err => console.error(err));

    await k.scrapeKodi();
    await m.scrape();

    TvShow.find({
        $and: [{
            blacklist: {$ne: true}
        }, {
            $expr: {
                $gt: ['$summary.aired_seasons', '$summary.scraped_seasons']
            }
        }]
    }, null, {
        // collation en needed for case insensitive sort
        collation: {
            locale: 'en'
        },
        sort: {
            'summary.title': 1
        }
    }, (error, docs) => {
        if (error) {
            console.error(error);
            return;
        }

        mongoose.disconnect();

        prepareAndSendMail(docs);
    });
}

function prepareAndSendMail(shows) {
    const mailer = require('nodemailer'),
        hbs = require('nodemailer-express-handlebars'),
        env = require('../env'),
        transporter = mailer.createTransport(env.mailer.smtpConfig),
        path = require('path');

    transporter.use('compile', hbs({
        viewEngine: {
            partialsDir: 'partials',
            defaultLayout: false
        },
        viewPath: path.resolve(__dirname, '../views')
    }));

    transporter.sendMail({
        from: '\'Kodi Scraper\' <' + env.mailer.smtpConfig.auth.user + '>',
        to: env.mailer.receiver,
        subject: 'Outdated Seasons',
        template: 'mails/emailSeasonScaper',
        context: {
            date: (new Date()).toLocaleString('en-US', {day: 'numeric', month: 'short', year: 'numeric'}),
            baseURL: 'https://www.themoviedb.org/tv/',
            shows: shows
        }
    });
}

main();