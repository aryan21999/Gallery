var mongoose = require('mongoose');
var schema = mongoose.Schema;

var countryKeys = new schema({

    name: {
        type: String,
    },
},
    {
        timestamps: true
    });

module.exports = mongoose.model("country", countryKeys)