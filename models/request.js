var mongoose = require('mongoose');
var schema = mongoose.Schema;

var requestKeys = new schema({
    fromId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    toId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    channelName: {
        type: String,
    },
    status: {
        type: String,
        enum: ["PENDING", "ACCEPTED", "REJECTED"],
        default: "PENDING"
    }
},
    {
        timestamps: true
    });
module.exports = mongoose.model("requests", requestKeys)
