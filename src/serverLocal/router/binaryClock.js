const express = require('express'),
    router = express.Router(),
    ClockSchedule = require('../../model/ClockSchedule');

router.get('/', async (req, res) => {
    res.render('binaryClock/list', {
        schedules: await ClockSchedule.find()
    });
});

router.get('/edit/:uid?', async (req, res) => {

    res.render('binaryClock/edit', {
        schedule: req.params.uid && await ClockSchedule.findById(req.params.uid)
    });
});

router.post('/save/:uid?', async (req, res) => {
    if (req.params.uid) {
        await ClockSchedule.updateOne({
            _id: req.params.uid
        }, req.body);
    } else {
        const schedule = new ClockSchedule(req.body);
        schedule.save();
    }

    res.redirect('/clock');
});

router.post('/delete/:uid', async (req, res) => {
    await ClockSchedule.deleteOne({
        _id: req.params.uid
    });

    res.redirect('/clock');
});

router.post('/setActive/:uid', async (req, res) => {
    await ClockSchedule.updateMany(null, {
        active: false
    });
    await ClockSchedule.updateOne({
        _id: req.params.uid
    }, {
        active: true
    });

    res.redirect('/clock');
});

router.post('/man/:command', async (req, res) => {
    const BCC = require('../../util/binaryClock/Controller'),
        bcc = new BCC();
    
    if (req.params.command === 'on') {
        bcc.on();
    } else {
        bcc.off();
    }
    
    res.redirect('/clock');
});

module.exports = router;