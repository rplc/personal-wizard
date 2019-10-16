const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const clockScheduleSchema = new Schema({
    active: {
        type: Boolean,
        default: false
    },
    label: String,
    days: [{
        on_time: String,
        off_time: String
    }]
});

// do not use arrow functions; https://stackoverflow.com/a/33092800
clockScheduleSchema.statics.getActive = async function() {
    return await this.findOne({
        active: true
    });
};

clockScheduleSchema.methods.getOnDate = function() {
    const date = new Date(),
        timeParts = this.days[date.getDay()].on_time.split(':');

    date.setHours(timeParts[0]);
    date.setMinutes(timeParts[1]);

    return date;
};

clockScheduleSchema.methods.getOffDate = function() {
    const date = new Date(),
        timeParts = this.days[date.getDay()].off_time.split(':');

    date.setHours(timeParts[0]);
    date.setMinutes(timeParts[1]);
    
    return date;
};

module.exports = mongoose.model('ClockSchedule', clockScheduleSchema, 'clockschedules');