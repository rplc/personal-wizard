const express = require('express'),
    router = express.Router(),
    Settings = require('../../model/Settings');

router.get('/', async (req, res) => {
    res.render('settings', {
        setting: await Settings.getSetting()
    });
});

router.post('/', async (req, res) => {
    await Settings.updateOne({}, req.body);
    res.redirect('/settings');
});

module.exports = router;