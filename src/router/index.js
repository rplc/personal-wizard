const express = require('express'),
    router = express.Router(),
    MongoClient = require("mongodb").MongoClient,
    env = require("../env.json");

router.get('/', (req, res) => {
    res.render('home');
});

module.exports = router;