/**
 * Scrapes a Kodi instance via the json rpc for all gathered tv shows.
 */
class Kodi {

    /**
     * Scrapes code via the json rpc and updates the mongo db.
     */
    async scrapeKodi() {
        const request = require('request'),
            env = require('../../env'),
            TvShow = require('../../model/TvShow');

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
            }, async (error, response, body) => {
                if (error) {
                    console.error(error);
                    return;
                }
                
                const result = body.result,
                    tvshows = result && result.tvshows || [],
                    ids = [],
                    bulkUpdate = tvshows.map((show) => {
                        ids.push(show.tvshowid);

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
                
                if (ids.length) {
                    await TvShow.deleteMany({_id: {
                        $nin: ids
                    }});
                }

                TvShow.bulkWrite(bulkUpdate, {}, (err, result) => {
                    if (err) {
                        console.error(err);
                        reject();
                        return;
                    }

                    console.log('Kodi scrape complete; update done.');
                    resolve();
                });
            });
        });
    }
}

module.exports = Kodi;