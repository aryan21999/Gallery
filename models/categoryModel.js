var mongoose = require('mongoose');
var schema = mongoose.Schema;

var categoryKeys = new schema({

    category: {
        type: String,
    },
},
    {
        timestamps: true
    });

module.exports = mongoose.model("category", categoryKeys)