async function main() {
    const mongoose = require('mongoose'),
        env = require('../env'),
        Pusher = require('./Pusher'),
        p = new Pusher();

    mongoose.Promise = global.Promise;
    mongoose.connect(env.mongo, {
        useNewUrlParser: true
    }).catch(err => console.error(err));

    await p.sendNotification({
        title: 'Test',
        message: 'Lorem Ipsum'
    });

    mongoose.disconnect();
}

main();