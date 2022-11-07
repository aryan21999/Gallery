var mongoose = require('mongoose');
var schema = mongoose.Schema;

var fcmKeys = new schema({

    deviceType: {
        type: String,
        require: true
    },
    title: {
        type: String,
    },
    message: {
        type: String,
    },
    // channel_name: {
    //     type: String,
    //     require: true
    // },
    // token: {
    //     type: String,
    //     require: true
    // },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    type: {
        type: Number,
    },
},
    {
        timestamps: true
    });

module.exports = mongoose.model("fcm", fcmKeys)