async function main() {
    const mongoose = require('mongoose'),
        env = require('../../env');

    mongoose.Promise = global.Promise;
    mongoose.connect(env.mongo, {
        useNewUrlParser: true
    }).catch(err => console.error(err));
    
    await fetchPrices(env.gasAPI);

    mongoose.disconnect();
}

async function fetchPrices(apiKey) {
    return new Promise((resolve, reject) => {
        const request = require('request'),
            GasStation = require('../../model/GasStation'),
            GasPrices = require('../../model/GasPrices');

        GasStation.find({}, null, {limit: 10}, (err, docs) => {
            if (err) {
                console.log(err);
                reject();
                return;
            }
            
            const ids = docs.map(station => {return station.extId}).join(',');
            request.get({
                url: `https://creativecommons.tankerkoenig.de/json/prices.php?ids=${ids}&apikey=${apiKey}`,
                json: true
            }, async (err, response, body) => {
                if (err || response.statusCode !== 200) {
                    err && console.error(err);
                    reject();
                    return;
                }

                let minPrice = Number.MAX_VALUE,
                    minStationId;
                const diesel = {};
                for (const stationId in body.prices) {
                    const prices = body.prices[stationId];

                    if (prices.diesel) {
                        diesel[stationId] = prices.diesel;

                        if (prices.diesel < minPrice) {
                            minPrice = prices.diesel;
                            minStationId = stationId;
                        }
                    }
                }

                await GasPrices.create({
                    min: minStationId,
                    diesel: diesel
                });

                // cleanup db
                await GasPrices.deleteMany({
                    ts: {
                        $lt: Date.now() - 1209600000 /*14 days*/
                    }
                });

                resolve();
            });
        });
    });
}

main();