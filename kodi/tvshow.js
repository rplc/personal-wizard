const request = require("request"),
    env = require("../env.json");

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
});