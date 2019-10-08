const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const webPushSubscriptionSchema = new Schema({
    endpoint: String,
    keys: Schema.Types.Mixed,
    createDate: {
        type: Date,
        default: Date.now
    }
});

const WPSubscription = mongoose.model('WPSubscription', webPushSubscriptionSchema, 'subscriptions');

module.exports = WPSubscription;