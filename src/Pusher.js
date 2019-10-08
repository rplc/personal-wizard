class Pusher {
    /**
     * Sends a push notification to all registered clients with the given payload.
     * 
     * @param {Object} payload The payload to send.
     * @param {String} payload.title The notification title.
     * @param {String} payload.message The notification message/body of the notification.
     * @param {String} payload.icon The notification icon to show.
     * @param {String} payload.tag The notification tag.
     */
    async sendNotification(payload) {
        const me = this,
            Subscription = require('./model/WPSubscription'),
            webPush = require('web-push'),
            env = require('./env');

        await me.mongoConnect();

        Subscription.find({}, null, {}, (err, docs) => {
            me.mongoClose();

            if (err) {
                console.error(err);
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
                ).catch(err => console.error(`Failed to send ${err.statusCode} (${err.message})`));
            }
        });
    }

    /**
     * Connects to mongo
     */
    async mongoConnect() {
        const env = require('./env'),
            mongoose = require('mongoose');

        mongoose.Promise = global.Promise;

        return mongoose.connect(env.mongo, {
            useNewUrlParser: true
        }).catch(err => console.error(err));
    }

    /**
     * Closes mongo connection
     */
    mongoClose() {
        require('mongoose').disconnect();
    }
}

module.exports = Pusher;