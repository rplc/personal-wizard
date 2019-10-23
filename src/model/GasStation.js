const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const GasStationSchema = new Schema({
    extId: String,
    name: String,
    brand: String,
    address: {
        city: String,
        zipCode: String,
        street: String,
        houseNumber: String,
        lat: Number,
        lng: Number
    },
    open: {
        wholeDay: Boolean,
        times: [{
            text: String,
            start: String,
            end: String
        }]
    }
});

module.exports = mongoose.model('GasStation', GasStationSchema, 'gasstations');