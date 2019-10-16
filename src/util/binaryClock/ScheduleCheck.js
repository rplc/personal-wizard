async function main() {
    const mongoose = require('mongoose'),
        env = require('../../env');

    console.log(process.env);
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

function getCommand(schedule) {
    const now = new Date(),
        lowDate = new Date(now.valueOf() - 840000),
        highDate = new Date(now.valueOf() + 60000),
        onDate = schedule.getOnDate(),
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