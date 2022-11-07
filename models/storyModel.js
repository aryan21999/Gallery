var mongoose = require('mongoose');
var schema = mongoose.Schema;

var storymodelKeys = new schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    storyImg: {
        type: Array,
    },
    createdAt   : {type: Date, default: Date.now, expires: 86400} // expired in 24 hours
    });
module.exports = mongoose.model("storymodel", storymodelKeys)
