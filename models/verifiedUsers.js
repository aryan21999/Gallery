var mongoose = require('mongoose');
var schema = mongoose.Schema;

var verifyuserKeys = new schema({

    username: {
        type: String,                           // mormal user = 0 , bussiness Users = 1 , Admin = 2
    },
    countryName: { 
        type: String,
        default: null,
    },
    category_id: {
        type:String,
        default:null 
    },
    document_name:{
        type: String,
        default: null
    },
    document:{
        type: String,
        default: null
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    
},
    {
        timestamps: true
    });
module.exports = mongoose.model("verifyuser", verifyuserKeys)
