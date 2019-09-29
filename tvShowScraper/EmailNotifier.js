async function main() {
    const MongoClient = require("mongodb").MongoClient,
        Kodi = require("./Kodi.js"),
        k = new Kodi(),
        TheMovieDB = require("./TheMovieDB.js"),
        m = new TheMovieDB(),
        env = require("../env.json");

    await k.scrapeKodi();
    await m.scrape();

    MongoClient.connect(env.mongo, (err, client) => {
        const db = client.db("personalWizard"),
            collection = db.collection("tvshows");

        collection.find({
            $and: [{
                blacklist: {$ne: true}
            }, {
                $expr: {
                    $gt: ["$external_data.number_of_seasons", "$kodi_data.season"]
                }
            }]
        }).toArray((error, docs) => {
            if (error) {
                console.error(error);
                return;
            }

            client.close();


            prepareAndSendMail(docs.filter((show) => {
                if (show.kodi_data.season + 1 === show.external_data.number_of_seasons) {
                    const lastSeason = show.external_data.seasons.find((season) => {
                        return season.season_number === show.external_data.number_of_seasons;
                    });

                    if (lastSeason && (!lastSeason.air_date || new Date(lastSeason.air_date) > Date.now())) {
                        // number_of_seasons might be already increased but the new season has not aired yet
                        console.warn("removing show: ", show.kodi_data.title + " (" + show._id + ";" + show.external_id + ")");
                        return false;
                    }
                }

                return true;
            }));
        });
    });
}

function prepareAndSendMail(shows) {
    const mailer = require("nodemailer"),
        fs = require("fs"),
        env = require("../env.json"),
        transporter = mailer.createTransport(env.mailer.smtpConfig);

    let items = "",
        mailTemplate = fs.readFileSync("tvShowScraper/EmailTemplate.html", "utf8");

    shows.forEach(s => {
        items += "<li><a target='_blank' href='https://www.themoviedb.org/tv/" + s.external_id + "'>" + s.kodi_data.title + "</a></li>";
    });

    mailTemplate = mailTemplate.replace("%LIST_PLACEHOLDER%", items);

    transporter.sendMail({
        from: "'Kodi Scraper' <" + env.mailer.smtpConfig.auth.user + ">",
        to: env.mailer.receiver,
        subject: "Outdated Seasons",
        html: mailTemplate
    });
}

main();