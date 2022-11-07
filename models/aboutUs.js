var mongoose = require('mongoose');
var schema = mongoose.Schema;

var aboutusKeys = new schema({

    caption: {
        type: String,
    },
},
    {
        timestamps: true
    });

module.exports = mongoose.model("aboutus", aboutusKeys)