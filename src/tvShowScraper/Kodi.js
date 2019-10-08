/**
 * Scrapes a Kodi instance via the json rpc for all gathered tv shows.
 */
class Kodi {

    /**
     * Scrapes code via the json rpc and updates the mongo db.
     */
    async scrapeKodi() {
        const me = this,
            request = require('request'),
            env = require('../env'),
            TvShow = require('../model/TvShow');

        await me.mongoConnect();

        return new Promise((resolve, reject) => {
            request.post(env.kodi + '/jsonrpc', {
                json: {
                    jsonrpc: '2.0',
                    method: 'VideoLibrary.GetTVShows',
                    params: {
                        properties: ['title', 'year', 'imdbnumber', 'playcount', 'season']
                    },
                    id: 'libTvShows'
                }
            }, (error, response, body) => {
                if (error) {
                    console.error(error);
                    me.mongoClose();
                    return;
                }
                
                const result = body.result,
                    tvshows = result && result.tvshows || [],
                    bulkUpdate = tvshows.map((show) => {
                        return {
                            updateOne: {
                                filter: {
                                    _id: show.tvshowid
                                },
                                update: {
                                    $set: {
                                        _id: show.tvshowid,
                                        summary: {
                                            kodi_id: show.tvshowid,
                                            the_movie_db_id: show.imdbnumber,
                                            title: show.title,
                                            scraped_seasons: show.season,
                                            watched: show.playcount
                                        },
                                        external_id: show.imdbnumber,
                                        kodi_scape_ts: Date.now(),
                                        kodi_data: show
                                    }
                                },
                                upsert: true
                            }
                        }
                    });

                TvShow.bulkWrite(bulkUpdate, {}, (err, result) => {
                    if (err) {
                        console.error(err);
                        me.mongoClose();
                        reject();
                        return;
                    }

                    console.log('Kodi scrape complete; update done.');
                    me.mongoClose();
                    resolve();
                });
            });
        });
    }

    /**
     * Connects to mongo
     */
    async mongoConnect() {
        const env = require('../env'),
            mongoose = require('mongoose');

        mongoose.Promise = global.Promise;

        return mongoose.connect(env.mongo, {
            useNewUrlParser: true
        }).catch(err => console.error(err));
    }

    /**
     * Closes mongo connection
     */
    mongoClose() {
        require('mongoose').disconnect();
    }
}

module.exports = Kodi;