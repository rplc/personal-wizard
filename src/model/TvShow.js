const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const tvShowSchema = new Schema({
    _id: String,
    blacklist: {
        type: Boolean,
        default: false
    },
    sortTitle: String,
    external_id: String,
    summary: {
        kodi_id: Number,
        the_movie_db_id: String,
        title: String,
        scraped_seasons: Number,
        watched: Boolean,
        aired_seasons: Number,
        in_production: Boolean
    },
    kodi_data: {
        imdbnumber: String,
        label: String,
        playcount: Number,
        season: Number,
        title: String,
        tvshowid: Number,
        year: Number
    },
    kodi_scape_ts: {
        type: Date,
        default: Date.now
    },
    external_data: Schema.Types.Mixed,
    external_scape_ts: Date
});

module.exports = mongoose.model('TvShow', tvShowSchema, 'tvshows');