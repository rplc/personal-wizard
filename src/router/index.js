const express = require('express'),
    router = express.Router(),
    MongoClient = require('mongodb').MongoClient,
    env = require('../env');

router.get('/', (req, res) => {
    res.render('home', {
        vapidPubKey: env.vapid.publicKey
    });
});

router.post('/subscribe', (req, res) => {
    
});

module.exports = router;