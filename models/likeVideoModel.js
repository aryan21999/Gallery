var mongoose = require('mongoose');
var schema = mongoose.Schema;

var likevideoKeys = new schema({

    status: {
        type: String,
        default: 1
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    
},
    {
        timestamps: true
    });
module.exports = mongoose.model("likevideo", likevideoKeys)
