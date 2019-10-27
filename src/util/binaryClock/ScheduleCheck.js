async function main() {
    const mongoose = require('mongoose'),
        env = require('../../env');

    mongoose.Promise = global.Promise;
    mongoose.connect(env.mongo, {
        useNewUrlParser: true
    }).catch(err => console.error(err));

    const schedule = await require('../../model/ClockSchedule').getActive();

    if (schedule) {
        const command = getCommand(schedule);

        if (command) {
            const BCC = require('./Controller'),
                bcc = new BCC();
            bcc.sendMessage(command);
        }
    }

    mongoose.disconnect();
}

/**
 * Checks if in the given schedule an on or off command occured around the current time. If on and
 * off time are the same nothing will be done.
 * 
 * @param {ClockSchedule} schedule The schedule to check agains.
 * @returns {String|null} Returns the command to execute (if any).
 */
function getCommand(schedule) {
    const now = new Date(),
        lowDate = new Date(now.valueOf() - 840000),
        highDate = new Date(now.valueOf() + 60000),
        day = schedule.getDay();

    if (day.on_time === day.off_time) {
        return;
    }

    const onDate = schedule.getOnDate(),
        offDate = schedule.getOffDate();
        
    if (onDate > lowDate && highDate > onDate) {
        // turn on
        return 'clock';
    }

    if (offDate > lowDate && highDate > offDate) {
        // turn off
        return 'off';
    }
}

main();