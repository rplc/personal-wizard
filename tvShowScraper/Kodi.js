

class Kodi {

    async doFullSync() {
        const TheMovieDB = require("./TheMovieDB.js"),
            movieDB = new TheMovieDB();

        await this.scrapeKodi();

        movieDB.scrape();
    }

    async scrapeKodi() {
        const request = require("request"),
            env = require("../env.json"),
            MongoClient = require('mongodb').MongoClient;

        return new Promise(resolve => {
            request.post(env.kodi + "/jsonrpc", {
                json: {
                    "jsonrpc": "2.0",
                    "method": "VideoLibrary.GetTVShows",
                    "params": {
                        "properties": ["title", "year", "imdbnumber", "playcount", "season", "fanart"]
                    },
                    "id": "libTvShows"
                }
            }, (error, response, body) => {
                if (error) {
                    console.error(error);
                    return;
                }
                
                const result = body.result,
                    tvshows = result && result.tvshows || [];
                //TODO mongo upsert

                tvshows.forEach(show => {
                    console.log(show.title + " (" + show.imdbnumber + ")", show.season);
                });

                resolve();
            });
        });
    }
}

module.exports = Kodi;

const kodi = new Kodi();
kodi.doFullSync();