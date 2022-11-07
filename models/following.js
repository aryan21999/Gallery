var mongoose = require('mongoose');
var schema = mongoose.Schema;

var followingKeys = new schema({

    following_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    followingStatus: {
        type: String,
    },
},
    {
        timestamps: true
    });
module.exports = mongoose.model("following", followingKeys)