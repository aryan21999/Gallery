var mongoose = require('mongoose');
var schema = mongoose.Schema;

var commentKeys = new schema({

    comment: {
        type: String,
    },
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
},
    {
        timestamps: true
    });
module.exports = mongoose.model("comment", commentKeys)
