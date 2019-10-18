async function main() {
    const Kodi = require('./Kodi.js'),
        k = new Kodi(),
        TheMovieDB = require('./TheMovieDB.js'),
        m = new TheMovieDB(),
        env = require('../../env'),
        mongoose = require('mongoose'),
        TvShow = require('../../model/TvShow');

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
            $where: 'this.summary.aired_seasons > this.summary.scraped_seasons'
        }, {
            seen: {$ne: true}
        }]
    }, null, {
        sort: {
            sortTitle: 1
        }
    }, async (error, docs) => {
        if (error) {
            console.error(error);
            return;
        }

        if (docs.length) {
            const ids = docs.map(show => {return show._id});
            await TvShow.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                seen: true 
            });

            await sendPush(docs);
        }

        mongoose.disconnect();
    });
}

async function sendPush(shows) {
    const Pusher = require('../Pusher'),
        p = new Pusher(),
        message = shows.map(s => {return s.summary.title}).join(', ');

    if (message) {
        await p.sendNotification({
            title: 'Neue Staffel für',
            message: message
        });
    }
}

main();