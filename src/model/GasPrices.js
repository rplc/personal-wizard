const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const gasPriceSchema = new Schema({
    ts: {
        type: Date,
        default: Date.now()
    },
    min: String,
    diesel: {
        type: Map,
        of: String
    }
});

module.exports = mongoose.model('GasPrice', gasPriceSchema, 'gasprices');