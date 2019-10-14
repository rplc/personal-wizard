const express = require('express'),
    router = express.Router(),
    TvShow = require('../../model/TvShow');

router.get('/', (req, res) => {
    res.render('shows');
});

router.post('/get', async (req, res) => {
    res.json({
        shows: await TvShow.find()
    });
});

router.post('/blacklist', (req, res) => {
    // blacklist show && reload
});

module.exports = router;