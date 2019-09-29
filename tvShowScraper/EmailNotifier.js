/* TODO
    - get all entries from mongo (where blacklist is not true)
    - check if external_data.number_of_seasons > kodi_data.seasons
    - if kodi.seasons + 1 === external.number_of_seasons => external.seasons.findBy(season_numer === number_of_seasons).air_date != null
        (number_of_seasons might be already increased but the new season is not yet released)
*/

//const Kodi = require("./Kodi.js"),
    //movieDB = require("./TheMovieDB.js"),
const mailer = require("nodemailer"),
    env = require("../env.json");

let transporter = mailer.createTransport(env.mailer.smtpConfig);

transporter.sendMail({
    from: "'Kodi Scraper' <" + env.mailer.smtpConfig.auth.user + ">",
    to: env.mailer.receiver,
    subject: "Outdated Seasons",
    html: "<b>Hello world?</b>"
});