
class TheMovieDB {

    async scrape() {
        const request = require("request"),
            env = require("../env.json");

        /* TODO
         - get tvShows from mongoDB
         - two options:
           - get max 40 from mongo, send all requests, sleep, next batch of 40
           - get all, run 1 request, sleep for 300ms, run next one
         - check for each entry from themoviedb if status code === 200, and if title/year matches kodi
           - else run find request (and save the divergent id)
        */ 

        return;

        const result = body.result,
            tvshows = result && result.tvshows || [];

        tvshows.forEach(show => {
            /* {
                "fanart": "image://http%3a%2f%2fimage.tmdb.org%2ft%2fp%2foriginal%2ftGgZdD29MeMLvoQHMxyD1PN1k5k.jpg/",
                "imdbnumber": "1437",
                "label": "Firefly",
                "playcount": 1,
                "season": 1,
                "title": "Firefly",
                "tvshowid": 1,
                "year": 2002
            } */

            // TODO problem: max 40 requests per 10s -> need to split up my requests/create a spool (might respond with 429 = need to wait)
            request.get("https://api.themoviedb.org/3/tv/" + show.imdbnumber + "?api_key=" + env.tmdbAPI, (error, response, body) => {
                if (error) {
                    console.error(error);
                    return;
                }

                body = JSON.parse(body);
                console.log(response.statusCode, show.title + " (" + show.imdbnumber + ")", show.season, body.number_of_seasons);
                //TODO if kodi seasons + 1 = tmdb seasons -> check last entry in seasons-array and check the air_date -> might be null -> ignore this warning
            });
        });
    }
}

const movieDB = new TheMovieDB();
movieDB.scrape();

module.exports = TheMovieDB;