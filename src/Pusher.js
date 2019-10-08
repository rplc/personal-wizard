class Pusher {
    async sendNotification(payload) {
        const me = this,
            Subscription = require('./model/WPSubscription'),
            webPush = require('web-push'),
            env = require('./env');

        await me.mongoConnect();

        Subscription.find({}, null, {}, (err, docs) => {
            if (err) {
                console.error(err);
                reject();
                return;
            }

            for (const sub of docs) {
                const pushSubscription = {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.keys.p256dh,
                            auth: sub.keys.auth
                        }
                    },
                    pushPayload = JSON.stringify(payload),
                    pushOptions = {
                        vapidDetails: {
                            subject: 'http://example.com',
                            privateKey: env.vapid.privateKey,
                            publicKey: env.vapid.publicKey
                        },
                        TTL: payload.ttl,
                        headers: {}
                    };

                webPush.sendNotification(
                    pushSubscription,
                    pushPayload,
                    pushOptions
                ).catch((err) => {
                    console.error(`Failed to send notification to ${sub.endpoint}`, err);
                });
            }

            me.mongoClose();
        });
    }

    async mongoConnect() {
        const env = require('./env'),
            mongoose = require('mongoose');

        mongoose.Promise = global.Promise;

        return mongoose.connect(env.mongo, {
            useNewUrlParser: true
        }).catch(err => console.error(err));
    }

    mongoClose() {
        const mongoose = require('mongoose');

        mongoose.disconnect();
    }
}

module.exports = Pusher;