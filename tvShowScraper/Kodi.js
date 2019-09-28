

class Kodi {

    async doFullSync() {
        const me = this,
            TheMovieDB = require("./TheMovieDB.js"),
            movieDB = new TheMovieDB();

        await me.mongoConnect();

        await me.scrapeKodi();

        me.mongoClose();

        movieDB.scrape();
    }

    async scrapeKodi() {
        const me = this,
            request = require("request"),
            env = require("../env.json");

        return new Promise(resolve => {
            request.post(env.kodi + "/jsonrpc", {
                json: {
                    jsonrpc: "2.0",
                    method: "VideoLibrary.GetTVShows",
                    params: {
                        properties: ["title", "year", "imdbnumber", "playcount", "season"]
                    },
                    id: "libTvShows"
                }
            }, (error, response, body) => {
                if (error) {
                    console.error(error);
                    return;
                }
                
                const collection = me.collection,
                    result = body.result,
                    tvshows = result && result.tvshows || [],
                    update = tvshows.map((show) => {
                        return {
                            updateOne: {
                                filter: {
                                    _id: show.tvshowid
                                },
                                update: {
                                    _id: show.tvshowid,
                                    external_id: show.imdbnumber,
                                    kodi_scape_ts: Date.now,
                                    kodi_data: show
                                },
                                upsert: true
                            }
                        }
                    });

                collection.bulkWrite(update, {}, () => {
                    resolve();
                });
            });
        });
    }

    async mongoConnect() {
        const me = this,
            env = require("../env.json"),
            MongoClient = require("mongodb").MongoClient;
        
        return new Promise(resolve => {
            MongoClient.connect(env.mongo, (err, client) => {
                const db = client.db("personalWizard");

                me.client = client;
                me.collection = db.collection("tvshows");

                resolve();
            });
        });
    }

    mongoClose() {
        const me = this,
            client = me.client;

        client && client.close();

        me.client = me.collection = null;
    }

    evaluate() {
        /* TODO
          - get all entries from mongo (where blacklist is not true)
          - check if external_data.number_of_seasons > kodi_data.seasons
            - if kodi.seasons + 1 === external.number_of_seasons => external.seasons.findBy(season_numer === number_of_seasons).air_date != null
              (number_of_seasons might be already increased but the new season is not yet released)
        */
    }
}

module.exports = Kodi;

const kodi = new Kodi();
kodi.doFullSync();