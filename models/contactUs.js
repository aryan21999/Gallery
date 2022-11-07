var mongoose = require('mongoose');
var schema = mongoose.Schema;

var contactusKeys = new schema({

    email: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
},
    {
        timestamps: true
    });

module.exports = mongoose.model("contactus", contactusKeys)