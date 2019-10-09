async function main() {
    const mongoose = require('mongoose'),
        env = require('../env'),DarkSky = require('./DarkSky'),
        Pusher = require('../Pusher'),
        d = new DarkSky(),
        weather = await d.getWeather(),
        p = new Pusher();

    mongoose.Promise = global.Promise;
    mongoose.connect(env.mongo, {
        useNewUrlParser: true
    }).catch(err => console.error(err));

    const lowTemp = getNightLow(weather);
    if (lowTemp < -2) {
        p.sendNotification({
            title: 'Es wird kalt!',
            message: `Heute Nacht werden es ${lowTemp}°C. Lieber Scheibe abdecken.`
        });
    }
    
    const highTemp = getDailyHigh(weather);
    if (highTemp < 20) {
        p.sendNotification({
            title: 'Es wird warm...',
            message: `Morgen sollen es ${highTemp}°C werden. Lieber Wecker vorstellen zum Joggen...`
        });
    }

    mongoose.disconnect();
}

function getNightLow(weather) {
    const hourly = weather.hourly.data,
        tomorrowMorning = new Date();
    
    tomorrowMorning.setDate(tomorrowMorning.getDate() + 1);
    tomorrowMorning.setHours(6);
    tomorrowMorning.setMinutes(15);

    let lowTemp = Number.MAX_VALUE;

    for(let i = 0; i < hourly.length; i++) {
        if (new Date(hourly[i].time*1000) > tomorrowMorning) {
            break;
        }

        lowTemp = hourly[i].temperature < lowTemp ? hourly[i].temperature : lowTemp;
    }

    return lowTemp;
}

function getDailyHigh(weather) {
    const hourly = weather.hourly.data,
        tomorrowMorning = new Date(),
        tomorrowEvening = new Date();
    
    tomorrowMorning.setDate(tomorrowMorning.getDate() + 1);
    tomorrowMorning.setHours(8);

    tomorrowEvening.setDate(tomorrowEvening.getDate() + 1);
    tomorrowEvening.setHours(20);

    let highTemp = Number.MIN_VALUE;

    for(let i = 0; i < hourly.length; i++) {
        const forecastTime = new Date(hourly[i].time*1000);
        if (forecastTime > tomorrowMorning) {
            highTemp = hourly[i].temperature > highTemp ? hourly[i].temperature : highTemp;
        } else if (forecastTime > tomorrowEvening) {
            break;
        }
    }

    return highTemp;
}

main();