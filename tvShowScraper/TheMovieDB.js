
class TheMovieDB {

    async scrape() {
        const me = this;

        await me.mongoConnect();

        const collection = me.collection;
        
        collection.find().toArray(async (error, docs) => {
            for (const entry of docs) {
                await me.scrapeSingle(entry._id, entry.external_id, entry);
            }

            console.log(" -------- all done, closing mongo");
            me.mongoClose();
        });
    }

    /**
     * 
     * @param {String} kodiId 
     * @param {String} externalId 
     * @param {Object} [entry] If omitted kodi title will not be validated with scraped title.
     */
    async scrapeSingle(kodiId, externalId, entry) {
        //entry: {"_id":1,"external_id":"1437","kodi_data":{"imdbnumber":"1437","label":"Firefly","playcount":1,"season":1,"title":"Firefly","tvshowid":1,"year":2002}}
        const me = this,
            entryTS = Date.now(),
            request = require("request"),
            env = require("../env.json");

        await me.mongoConnect();

        const collection = me.collection;
        
        return new Promise((resolve) => {
            request.get("https://api.themoviedb.org/3/tv/" + externalId + "?api_key=" + env.tmdbAPI, (error, response, body) => {
                if (error || response.statusCode != 200) {
                    console.error(error, response.statusCode);
                    return;
                }

                body = JSON.parse(body);
                
                // TODO check if scraped title & year matches the kodi title & year

                console.log(response.statusCode, entry.kodi_data.title + " (" + kodiId + ";" + externalId + ")", entry.kodi_data.season, body.number_of_seasons);

                collection.updateOne({
                    _id: kodiId
                }, {
                    $set: {
                        external_data: body
                    }
                }, {}, () => {
                    // only allowed to fire 40 request per 10 secs, wait a bit until sending next request
                    setTimeout(() => {
                        resolve();
                    }, Math.max(333 - (Date.now() - entryTS), 0));
                });
            });
        });
    }

    async mongoConnect() {
        const me = this,
            env = require("../env.json"),
            MongoClient = require("mongodb").MongoClient;
        
        if (me.client && me.collection) {
            return true;
        }
        
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
}

const movieDB = new TheMovieDB();
movieDB.scrape();

module.exports = TheMovieDB;