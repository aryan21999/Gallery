var mongoose = require('mongoose');
var schema = mongoose.Schema;

var usercategoryKeys = new schema({

    category: {
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
module.exports = mongoose.model("usercategory", usercategoryKeys)
