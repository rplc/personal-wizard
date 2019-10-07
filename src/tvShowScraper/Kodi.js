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
            env = require('../env');

        await me.mongoConnect();

        return new Promise(resolve => {
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
                
                const collection = me.collection,
                    result = body.result,
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

                collection.bulkWrite(bulkUpdate, {}, () => {
                    console.log('Kodi scrape complete; update done.')
                    me.mongoClose();
                    resolve();
                });
            });
        });
    }

    /**
     * Connects to mongo and sets this.client and this.collection
     */
    async mongoConnect() {
        const me = this,
            env = require('../env'),
            MongoClient = require('mongodb').MongoClient;
        
        return new Promise((resolve, reject) => {
            MongoClient.connect(env.mongo, (err, client) => {
                if (err || !client) {
                    console.error(err);
                    reject(err);
                    return;
                }

                const db = client.db('personalWizard');

                me.client = client;
                me.collection = db.collection('tvshows');

                resolve();
            });
        });
    }

    /**
     * Closes mongo connection and removes this.client and this.connection
     */
    mongoClose() {
        const me = this,
            client = me.client;

        client && client.close();

        me.client = me.collection = null;
    }
}

module.exports = Kodi;