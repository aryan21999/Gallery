var mongoose = require('mongoose');
var schema = mongoose.Schema;

var followerKeys = new schema({

    follower_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    followerStatus: {
        type: String,
    },
},
    {
        timestamps: true
    });
module.exports = mongoose.model("follower", followerKeys)