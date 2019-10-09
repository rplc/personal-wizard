class DarkSky {
    async getWeather() {
        const request = require('request'),
            env = require('../../env'),
            darksky = env.darksky;

        return new Promise((resolve, reject) => {
            request.get({
                url: `https://api.darksky.net/forecast/${darksky.api}/${darksky.latitude},${darksky.longitude}?units=si`,
                json: true
            }, (err, response, body) => {
                if (err) {
                    console.error(err);
                    reject();
                    return;
                }

                resolve(body);
            });
        });
    }
}

module.exports = DarkSky;