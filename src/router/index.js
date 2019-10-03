const express = require('express'),
    router = express.Router(),
    bcrypt = require('bcrypt'),
    MongoClient = require("mongodb").MongoClient,
    env = require("../env.json");

router.get('/', (req, res) => {
    res.render('home');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res) => {
    const username = req.body.username,
        password = req.body.password;
    
    MongoClient.connect(env.mongo, (err, client) => {
        if (err) {
            console.log(err);
            res.redirect('/login');

            return;
        }

        const db = client.db("personalWizard"),
            collection = db.collection("users");

        collection.findOne({alias: username}, (err, user) => {
            if (err) {
                console.error(err);
                res.redirect('/login');
                return;
            }

            if (!user) {
                res.redirect('/login');
            } else if (!bcrypt.compareSync(password, user.password)) {
                res.redirect('/login');
            } else {
                req.session.user = user;
                res.redirect('/');
            }
        });
    });
});

/*register => user.password = bcrypt.hashSync(password, bcrypt.genSaltSync());*/

module.exports = router;