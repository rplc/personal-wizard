async function main() {
    const mongoose = require('mongoose'),
        env = require('../../env'),
        DarkSky = require('./DarkSky'),
        Pusher = require('../Pusher'),
        d = new DarkSky(),
        weather = await d.getWeather(),
        p = new Pusher();

    mongoose.Promise = global.Promise;
    mongoose.connect(env.mongo, {
        useNewUrlParser: true
    }).catch(err => console.error(err));

    const settings = await require('../../model/Settings').getSetting(),
        walkingTime = settings.walking_time_alert,
        rain = getRainStatus(weather);

    if (rain && rain.intensity >= walkingTime.intensity && rain.probability >= walkingTime.probability) {
        const dispIntensity = Math.round(rain.intensity * 100) / 100;

        await p.sendNotification({
            title: 'Beim Gassi könnte es regnen',
            message: `Amount: ${dispIntensity}mm/h, Probability: ${rain.probability}%`
        });
    }

    mongoose.disconnect();
}

function getRainStatus(weather) {
    const hourly = weather.hourly.data,
        afternoon = new Date(),
        evening = new Date();
    
    afternoon.setHours(14);
    afternoon.setMinutes(30);

    evening.setHours(17);
    evening.setMinutes(0);

    for(let i = 0; i < hourly.length; i++) {
        const forecastDate = new Date(hourly[i].time*1000);
        if (forecastDate > evening) {
            break;
        }

        if (forecastDate > afternoon && (hourly[i].precipIntensity > 0 || hourly[i].precipProbability > 0)) {
            return {
                intensity: hourly[i].precipIntensity,
                probability: Math.floor(hourly[i].precipProbability * 100)
            }
        }
    }

    return null;
}

main();