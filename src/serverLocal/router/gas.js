const express = require('express'),
    router = express.Router(),
    GasPrices = require('../../model/GasPrices'),
    GasStation = require('../../model/GasStation');

router.get('/', (req, res) => {
    res.render('gas');
});

router.post('/get', async (req, res) => {
    const result = {
            stations: {},
            prices: []
        },
        stats = await GasStation.find(),
        prices = await GasPrices.find({
            ts: {
                $gt: Date.now() - 604800000
            }
        }, null, {
            sort: 'ts'
        });

    for (const station of stats) {
        result.stations[station.extId] = {
            open: station.open,
            address: station.address,
            brand: station.brand,
            name: station.name
        }
    }

    for (const p of prices) {
        const data = {
            ts: p.ts,
            min: p.min,
            prices: p.diesel
        };

        result.prices.push(data);
    }

    res.json(result);
});

module.exports = router;