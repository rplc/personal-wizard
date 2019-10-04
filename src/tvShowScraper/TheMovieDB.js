/**
 * Scrape TheMovieDB for current tv shows.
 */
class TheMovieDB {

    /**
     * Gets the gathered tv shows from mongo and trys to find matching entries on TheMovieDB.
     */
    async scrape() {
        const me = this;

        await me.mongoConnect();

        const collection = me.collection;
        
        return new Promise((resolve) => {
                collection.find().toArray(async (error, docs) => {
                if (error) {
                    console.error(error);
                    return;
                }

                for (const entry of docs) {
                    await me.scrapeSingle(entry._id, entry.divergent_external_id || entry.external_id, entry);
                }

                console.log(" --- all done, closing mongo");
                me.mongoClose();
                resolve();
            });
        });
    }

    /**
     * Gathers online data for a single tv show. If the entry that will be gathered via the
     * external_id does not the kodi_data in title and year, another request will be started to
     * gather the correct entry via the title.
     * 
     * @param {String} mongoId The mongo db id.
     * @param {String} externalId The external id, determined by kodi.
     * @param {Object} [entry] If omitted kodi title will not be validated with scraped title.
     */
    async scrapeSingle(mongoId, externalId, entry) {
        const me = this,
            entryTS = Date.now(),
            request = require("request"),
            env = require("../env.json");

        await me.mongoConnect();

        const collection = me.collection;
        
        return new Promise((resolve) => {
            request.get("https://api.themoviedb.org/3/tv/" + externalId + "?api_key=" + env.tmdbAPI, async (error, response, body) => {
                if (error || response.statusCode != 200) {
                    switch(response.statusCode) {
                        case 429:
                            // to many requests in 10sec interval; wait a bit and try again
                            setTimeout(async () => {
                                await me.scrapeSingle(mongoId, externalId, entry);
                                resolve();
                            }, 5000);
                            return;
                        case 500:
                            // entry not found, try to find it via title and try again
                            const newExternalId = await me.findByTitle(mongoId, entry);

                            if (newExternalId) {
                                await me.scrapeSingle(mongoId, newExternalId, entry);
                                resolve();
                                return;
                            }
                            break;
                        case 504:
                            // request timed out for an unknown reason; try again
                            setTimeout(async () => {
                                await me.scrapeSingle(mongoId, externalId, entry);
                                resolve();
                            }, 333);
                            return;
                            break;
                    }

                    console.error(response.statusCode, error);

                    resolve();
                    return;
                }

                body = JSON.parse(body);
                
                if (me.checkEntry(body.name, body.first_air_date, entry)) {
                    console.log(entry.kodi_data.title + " (" + mongoId + ";" + externalId + ")", entry.kodi_data.season, body.number_of_seasons);

                    const airedSeasons = body.seasons.filter((season) => {
                        // season_number 0 are specials -> not interesting, air_date must be set, and in the past
                        return season.season_number > 0 && season.air_date && new Date(season.air_date) < Date.now();
                    }).length;

                    // seems to be the correct entry
                    collection.updateOne({
                        _id: mongoId
                    }, {
                        $set: {
                            "summary.aired_seasons": airedSeasons,
                            "summary.in_production": body.in_production,
                            external_data: body,
                            external_scape_ts: Date.now()
                        }
                    }, {}, () => {
                        // only allowed to fire 40 request per 10 secs, wait a bit until sending next request
                        setTimeout(() => {
                            resolve();
                        }, Math.max(333 - (Date.now() - entryTS), 0));
                    });
                } else if (entry) {
                    // not the right entry trying to find the correct one by title
                    console.error(entry.kodi_data.title + " (" + mongoId + ";" + externalId + ")", "external_id is not correct, searching via title");
                    const newExternalId = await me.findByTitle(mongoId, entry);

                    if (newExternalId) {
                        await me.scrapeSingle(mongoId, newExternalId, entry);
                        resolve();
                    }
                } else {
                    console.error(entry.kodi_data.title + " (" + mongoId + ";" + externalId + ")", "external_id is not correct, NO option to find the correct entry");
                }
            });
        });
    }

    /**
     * Checks if the given title and year match the entry data.
     * 
     * @param {String} externalName The gathered name.
     * @param {String} [externalYear] The gathered year. If omitted year will not be checked.
     * @param {Object} [entry] The mongo db entry. If omitted method will return true in the hope
     * that everything mathces.
     * @returns {Boolean} True if the entry matches (or is omitted), false otherwise.
     */
    checkEntry(externalName, externalYear, entry) {
        const kodiData = entry && entry.kodi_data;

        if (!kodiData) {
            return true; // no way to check, hopefully it matches
        }

        if (externalName === kodiData.title) {
            if (!externalYear || !kodiData.year) {
                return true; // no way to check the year
            }

            return ~externalYear.indexOf(kodiData.year);
        }

        return false;
    }

    /**
     * Tries to find online data via the title. Correct entry will be matched via title and year.
     * If a match is found, the divergent_external_id field will be set with the correct
     * external_id in mongo.
     * 
     * @param {String} mongoId The mongo id.
     * @param {Object} entry The mongo entry.
     */
    async findByTitle(mongoId, entry) {
        const me = this,
            entryTS = Date.now(),
            request = require("request"),
            env = require("../env.json"),
            kodiData = entry && entry.kodi_data;
        
        if (!kodiData) {
            return false;
        }

        await me.mongoConnect();

        const collection = me.collection;

        return new Promise((resolve) => {
            request.get("https://api.themoviedb.org/3/search/tv/" + encodeURI(kodiData.title) + "?api_key=" + env.tmdbAPI, (error, response, body) => {
                if (error || response.statusCode != 200) {
                    console.error(error, response.statusCode);
                    resolve();
                    return;
                }

                body = JSON.parse(body);
                
                body.results.every(res => {
                    if (me.checkEntry(res.name, res.first_air_date, entry)) {
                        collection.updateOne({
                                _id: mongoId
                            }, {
                                $set: {
                                    divergent_external_id: res.id
                                }
                            }, {}, () => {
                                // only allowed to fire 40 request per 10 secs, wait a bit until sending next request
                                setTimeout(() => {
                                    resolve(res.id);
                                }, Math.max(333 - (Date.now() - entryTS), 0));
                            }
                        );
                        return false;
                    }
                });
            });
        });
    }

    /**
     * Connects to mongo and sets this.client and this.collection
     */
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

module.exports = TheMovieDB;