var mongoose = require('mongoose');
var schema = mongoose.Schema;

var postedvideoKeys = new schema({

    caption: {
        type: String,
        default: null
    },
    postedVideo: {
        type: String,
        required: true
    },
    postStatus: {
        type: Boolean,
        default: true
    },
    like: {
        type: String,
        default: "0"
    },
    likeStatus: {
        type: String,
        default: "0"
    },
    comment: {
        type: String,
        default: "0"
    },
    date: {
        type: String,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
},
    {
        timestamps: true
    });
module.exports = mongoose.model("postedvideo", postedvideoKeys)
