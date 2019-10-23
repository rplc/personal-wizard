async function main() {
    const mongoose = require('mongoose'),
        env = require('../../env'),
        stationIds = (process.argv[2] || '').split(',');

    if (!stationIds.length) {
        console.error('Station IDs expected as command line param (comma separated)');
        return;
    }

    mongoose.Promise = global.Promise;
    mongoose.connect(env.mongo, {
        useNewUrlParser: true
    }).catch(err => console.error(err));

    for (const id of stationIds) {
        await doRequest(id, env.gasAPI).catch(reason => {
            console.error(`${id} failed.`);
        });
    }

    console.log('all done, closing mongo');
    mongoose.disconnect();
}

async function doRequest(id, apiKey) {
    const request = require('request'),
        GasStation = require('../../model/GasStation');

    return new Promise((resolve, reject) => {
        request.get({
            url: `https://creativecommons.tankerkoenig.de/json/detail.php?id=${id}&apikey=${apiKey}`,
            json: true
        }, async (err, response, body) => {
            if (err || response.statusCode !== 200) {
                err && console.error(err);
                reject();
                return;
            }

            const station = body.station;

            await GasStation.updateOne({
                extId: id
            }, {
                extId: id,
                name: station.name,
                brand: station.brand,
                address: {
                    city: station.place,
                    zipCode: station.postCode,
                    street: station.street,
                    houseNumber: station.houseNumber,
                    lat: station.lat,
                    lng: station.lng
                },
                open: {
                    wholeDay: station.wholeDay,
                    times: station.openingTimes
                }
            }, {
                upsert: true
            });
            
            resolve();
        });
    });
}

main();