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
                    $gt: ["$summary.aired_seasons", "$summary.scraped_seasons"]
                }
            }]
        }).toArray((error, docs) => {
            if (error) {
                console.error(error);
                return;
            }

            client.close();

            prepareAndSendMail(docs);
        });
    });
}

function prepareAndSendMail(shows) {
    const mailer = require("nodemailer"),
        fs = require("fs"),
        env = require("../env.json"),
        transporter = mailer.createTransport(env.mailer.smtpConfig);

    let tableBody = "",
        mailTemplate = fs.readFileSync("tvShowScraper/EmailTemplate.html", "utf8");

    shows.forEach(show => {
        const summary = show.summary,
            link = "https://www.themoviedb.org/tv/" + summary.the_movie_db_id,
            seasons = summary.scraped_seasons  + " of " + summary.aired_seasons;

        tableBody += "<tr><td><a target='_blank' href='" + link + "'>" + summary.title + "</a></td><td>" + seasons + "</td></tr>";
    });

    mailTemplate = mailTemplate.replace("%TABLE_BODY_PLACEHOLDER%", tableBody);

    transporter.sendMail({
        from: "'Kodi Scraper' <" + env.mailer.smtpConfig.auth.user + ">",
        to: env.mailer.receiver,
        subject: "Outdated Seasons",
        html: mailTemplate
    });
}

main();