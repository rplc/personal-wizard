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
        const Subscription = require('../model/WPSubscription'),
            webPush = require('web-push'),
            env = require('../env');        

        payload.title = 'pers-wiz ' + payload.title;
        payload.icon = payload.icon || 'https://myocto.duckdns.org/img/personalWizard_512.png';

        return new Promise((resolve, reject) => {
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
                                subject: 'https://myocto.duckdns.org',
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

                resolve();
            });
        });
    }
}

module.exports = Pusher;