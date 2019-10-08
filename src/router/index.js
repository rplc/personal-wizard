const express = require('express'),
    router = express.Router(),
    WPSubscription = require('../model/WPSubscription')
    env = require('../env');

router.get('/', (req, res) => {
    res.render('home', {
        vapidPubKey: env.vapid.publicKey
    });
});

router.post('/subscribe', async (req, res) => {
    const subscriptionModel = new WPSubscription(req.body);
    await subscriptionModel.save((err, subscription) => {
        if (err) {
            console.error(`Error occurred while saving subscription. Err: ${err}`);
            res.status(500).json({
                error: 'Technical error occurred'
            });
        } else {
            res.json({
                data: 'Subscription saved.'
            });
        }
    });
});

module.exports = router;