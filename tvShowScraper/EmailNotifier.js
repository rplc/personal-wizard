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
        hbs = require("nodemailer-express-handlebars"),
        env = require("../env.json"),
        transporter = mailer.createTransport(env.mailer.smtpConfig);

    transporter.use("compile", hbs({
        viewEngine: {
            partialsDir: "partials",
            defaultLayout: false
        },
        viewPath: "views"
    }));

    transporter.sendMail({
        from: "'Kodi Scraper' <" + env.mailer.smtpConfig.auth.user + ">",
        to: env.mailer.receiver,
        subject: "Outdated Seasons",
        template: "emailSeasonScaper",
        context: {
            date: (new Date()).toLocaleString("en-US", {day: "numeric", month: "short", year: "numeric"}),
            baseURL: "https://www.themoviedb.org/tv/",
            shows: shows
        }
    });
}

main();