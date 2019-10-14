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

router.post('/blacklist', async (req, res) => {
    const show = await TvShow.findById(req.body.id);

    show.blacklist = !show.blacklist;
    await show.save();

    res.json({
        status: 'ok'
    });
});

module.exports = router;