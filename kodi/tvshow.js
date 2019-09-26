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

        request.get("https://api.themoviedb.org/3/tv/" + show.imdbnumber + "?api_key=" + env.tmdbAPI, (error, response, body) => {
            if (error) {
                console.error(error);
                return;
            }

            body = JSON.parse(body);
            console.log(show.title, show.season, body.number_of_seasons);
        });
    });
});