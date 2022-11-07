var mongoose = require('mongoose');
var schema = mongoose.Schema;

var postKeys = new schema({

    caption: {
        type: String,                        
    },
    postImage: {
        type: Array,
        required: true
    },
    status: {
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
    username: {
        type: String,
        default: null
    },
    category_name: {
        type: String,
        default: null
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category'
    },
},
    {
        timestamps: true
    });
module.exports = mongoose.model("post", postKeys)
