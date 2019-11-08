const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const settingsSchema = new Schema({
    evening_temp_alert: {
        low_temp: { type: Number, default: -1 },
        high_temp: { type: Number, default: 20 }
    },
    walking_time_alert: {
        intensity: { type: Number, default: 0.1 },
        probability: { type: Number, default: 15 }
    }
});

// do not use arrow functions; https://stackoverflow.com/a/33092800
settingsSchema.statics.getSetting = async function() {
    let setting = await this.findOne();

    if (!setting) {
        setting = new this();
        await setting.save();
    }

    return setting;
};

module.exports = mongoose.model('Settings', settingsSchema, 'settings');