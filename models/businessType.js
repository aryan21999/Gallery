var mongoose = require('mongoose');
var schema = mongoose.Schema;

var businesstypeKeys = new schema({

    name: {
        type: String,
    },
},
    {
        timestamps: true
    });

module.exports = mongoose.model("businesstype", businesstypeKeys)