const express = require('express'),
    router = express.Router(),
    TvShow = require('../../model/TvShow');

router.get('/', (req, res) => {
    res.render('shows');
});

router.post('/get', async (req, res) => {
    const filters = {};
    for (const [key, value] of Object.entries(req.body)) {
        switch (key) {
            case 'blacklist':
                // might be unset
                filters.blacklist = value ? true : {$ne: true};
                break;
            case 'watched':
                filters['summary.watched'] = value;
                break;
            case 'in_production':
                filters['summary.in_production'] = value;
                break;
        }
    }

    res.json({
        shows: await TvShow.find(filters, null, {
            sort: {
                sortTitle: 1
            }
        })
    });
});

router.post('/blacklist', async (req, res) => {
    const show = await TvShow.findById(req.body.id);

    show.blacklist = !show.blacklist;
    await show.save();

    res.json({
        status: 'ok'
    });
});

module.exports = router;