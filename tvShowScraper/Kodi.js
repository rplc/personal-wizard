/**
 *  doc code am Anfang der Datei
- als object/Klasse aufbauen/scopen!!!
- mongo dB
- 3 Methoden scrapeKodi, scrapeOnline, evaluate oder so
- Kodi aufrufen, legt Mongo Eintrag an, online holt sich max 40 Mongo Einträge sortiert bei online scrape datum, macht dann einen 10s timeout und ruft sich selbst auf, bis alle durch sind
 */

function Kodi() {

    this.doFullSync = async () => {
        const TheMovieDB = require("./TheMovieDB.js"),
            movieDB = new TheMovieDB();

        await this.scrapeKodi();

        movieDB.scrape();
    };

    this.scrapeKodi = async () => {
        const request = require("request"),
            env = require("../env.json");

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
    };
}

module.exports = Kodi;

const kodi = new Kodi();
kodi.doFullSync();