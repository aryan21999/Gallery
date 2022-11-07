var mongoose = require('mongoose');
var schema = mongoose.Schema;

var userKeys = new schema({

    username: {
        type: String,                           // mormal user = 0 , bussiness Users = 1 , Admin = 2
    },
    phoneNumber: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        default: null
    },
    email: {
        type: String,
        required: true
    },
    profileImage:{
        type: String,
        default: null
    },
    password: {
        type: String,
        required: true
    },
    userAccount: {
        type: String,
        enum: ["PRIVATE", "PUBLIC"],
        default: "PUBLIC"
    },
    verificationStatus: {
        type: String,
        enum: ["NORMAL","REQUESTED", "VERIFIED"],
        default: "NORMAL"
    },
    followerStatus: {
        type: String,
        default: "0"
    },
    countryName: {
        type: String,
        default : null
    },
    address: {
        type: String
        // default : null
    },
    role: {
        type: String,
    },
    pageName: {
        type: String,
        default : null
    },
    purpose: {
        type: String,
        default : null
    },
    businessType: {
        type: String,
        default : null
    },
    deviceId: {
        type: String,
        default: null
    },
    deviceModelName: {
        type: String,
    },
    deviceType: {
        type: String, default: null
    },
    deviceTokenFcm: {
        type: String, default: null
    },
    deviceTokenPushKit: {
        type: String, default: null
    },
    
},
    {
        timestamps: true
    });
module.exports = mongoose.model("user", userKeys)
