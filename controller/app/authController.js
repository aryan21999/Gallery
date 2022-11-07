const url = {
    base_url: 'http://182.76.237.248:9000/upload'
};

const mongoose = require("mongoose")
var user = require('../../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const businessTypeModel = require('../../models/businessType')
const countryModel = require('../../models/country')
const RtcTokenBuilder = require('../../src/RtcTokenBuilder').RtcTokenBuilder;
const RtcRole = require('../../src/RtcTokenBuilder').Role;
const fcmModel = require('../../models/fcmModel')
const userModel = require('../../models/userModel')
const requestModel = require('../../models/request')
const followerModel = require('../../models/followers')

// <<<<<<<<<<<<<<< Agora Api >>>>>>>>>>>>>>

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function generateOTP() {
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 1; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

exports.sendJoinRequest = (req, res) => {
    var JoinRequestData = {
        toId: mongoose.Types.ObjectId(req.body.toId),
        fromId: mongoose.Types.ObjectId(req.body.fromId),
        channelName: req.body.channelName,
        type: req.body.type
    }
    if(JoinRequestData.type == 0){
        new requestModel(JoinRequestData).save().then( async data => {
            const status = await requestModel.findOneAndUpdate({fromId: mongoose.Types.ObjectId(req.body.fromId)}, {$set: {status: "PENDING"}})
            res.status(200).json({ 'status': 1, 'msg': 'Requested successfully', 'data': data  })
	    console.log(data, "data")
        })
    }else if(JoinRequestData.type == 1){
        let status = requestModel.findOneAndUpdate({fromId: mongoose.Types.ObjectId(req.body.fromId)}, {$set: {status: "ACCEPTED"}}).then(data1 => {
            res.status(200).json({ 'status': 1, 'msg': 'Accepted successfully' })
       	    console.log(data1, "data")
	})
    }else if(JoinRequestData.type == 2){
        let status = requestModel.findOneAndUpdate({fromId: mongoose.Types.ObjectId(req.body.fromId)}, {$set: {status: "REJECTED"}}).then(data2 => {
            res.status(200).json({ 'status': 1, 'msg': 'Rejcted successfully' })
            console.log(data2, "data")
	})
    }
}

exports.goLive = async (req, res) => {
    const followerData = await followerModel.find({ user_id: mongoose.Types.ObjectId(req.body.userId) })
    pamars = followerData.map(async (obj) => {
        const userData = await userModel.findById({ _id: obj.follower_id })
        console.log(userData, 'line no......335')
	let data = {
        	title: req.body.title,
        	deviceType: req.body.deviceType,
        	deviceToken: userData.deviceTokenFcm,
        	followerId: userData._id,
        	type: req.body.type,
        	tokenA: req.body.tokenA,
        	channelName: req.body.channelName
    	}
        return data;
    })
    let Data = await Promise.all(pamars);
    console.log(Data, 'final Data');

    const result = await notificationToFollowers(Data);
    res.status(200).json({ 'status': 1, 'msg': 'Notified all followers successfully', 'data': Data  })
}

async function notificationToFollowers(Data) {
    var FCM = require('fcm-node');
    // subterra Server Key
    var serverKey = 'AAAAn84cB24:APA91bFICwcAzb2aWjsmfUvdxlt9WhufJsGUoBB1x8cqdfJFktgWSmzNSBM_kLB-OZZBllSZ-aEP42qzQEJlKLCw5wbDfLXLudh4eHP6tyvz4ctc1QOa1KQ_kWypP3FOQR7krxwb8XU9';
    var fcm = new FCM(serverKey);
    var sound = "";
    if (Data[0].deviceType == "ios" || Data[0].deviceType == 'web') {
        var message = {
            to: Data.deviceToken,

            notification: {
                tokenA: Data.tokenA,
                channelName: Data.channelName,
                title: Data.title,  
                deviceToken: Data[0].deviceTokenFcm,
                deviceType: Data[0].deviceType,
                followerId: Data[0].followerId,
                type: Data.type
            }
         }
      } else {
        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            registrationTokens: Data.deviceToken,
            data: {
                title: Data.title,            }
        }
    }


    fcm.send(message, function (err, response) {
        console.log(message, "Data Line no. 2335");
        if (err) {
            console.log("fcm error", err)
            return true;
        } else {
            new fcmModel(Data).save((saveErr, saveRes) => {
                console.log('GVDagsfdksdvfhskfsadk')
                console.log(Data, 'data of data')

                if (saveErr) {
                    console.log(saveErr, "saveErr");
                    // return res.send({ responseCode: 500, responseMessage: "Internal server error.", responseResult: saveErr });
                }
                else {
                    console.log(saveRes, "saveRes");
                    // return res.send({ responseCode: 200, responseMessage: "Notification save successfully!", responseResult: saveRes });
                }
            })
            console.log("success", response)
            return true;
        }
    });
}

exports.sendInvitation = async (req, res) => {
    const userData = await userModel.find({_id:mongoose.Types.ObjectId(req.body.userId)})

    let data = {
        title: req.body.title,
        deviceType: req.body.deviceType,
        deviceToken: userData[0].deviceTokenFcm,
        userId: mongoose.Types.ObjectId(req.body.userId),
        type: req.body.type,
        tokenA: req.body.token,
        channelName: req.body.channelName
    }
    const result = await sendLiveNotification(data);
    res.status(200).json({ 'status': 1, 'msg': 'Invited successfully', 'data': data  })
}

exports.joinUser = async (req, res) => {
    var data = await requestModel.aggregate([
        {
            "$match": { $and: [{ 'toId': mongoose.Types.ObjectId(req.body.user_id) }, { status: "ACCEPTED" }] }
        },
        {
            "$project": {
                "pm": "$$ROOT"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "pm.fromId",
                foreignField: "_id",
                as: "ui"
            }
        },
        {
            "$unwind": {
                "path": "$ui",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$project": {
                "username": "$ui.username",
                "profileImage": "$ui.profileImage",
            }
        }
    ])
    postData = data.map(async obj => {
        if (obj.profileImage) {
            obj.profileImage = `${url.base_url}/${obj.profileImage}`;
        }
        else {
            obj.profileImage = '';
        }
        return obj;
    })
    let finalDataList = await Promise.all(postData);
    res.status(200).json({ 'status': 1, 'msg': 'User Detail fetch successfully', 'data': finalDataList });
}

async function sendLiveNotification(data) {
    var FCM = require('fcm-node');

    // subterra Server Key
    var serverKey = 'AAAAn84cB24:APA91bFICwcAzb2aWjsmfUvdxlt9WhufJsGUoBB1x8cqdfJFktgWSmzNSBM_kLB-OZZBllSZ-aEP42qzQEJlKLCw5wbDfLXLudh4eHP6tyvz4ctc1QOa1KQ_kWypP3FOQR7krxwb8XU9';
    var fcm = new FCM(serverKey);

    var sound = "";
    if (data.deviceType == "ios" || data.deviceType == 'web') {
        var message = {
            to: data.deviceToken,
            deviceType: data.deviceType,
            userId: data.userId,

            notification: {
                tokenA: data.tokenA,
                channelName: data.channelName,
                title: data.title,  
                deviceToken: data.deviceToken,
                deviceType: data.deviceType,
                userId: data.userId,
                type: data.type
            }
        }
    } else {
        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            to: data.deviceToken,
            data: {
                title: data.title,            }
        }
    }

    fcm.send(message, function (err, response) {
        console.log(message, "Data Line no. 2335");
        if (err) {
            console.log("fcm error", err)
            return true;
        } else {
            new fcmModel(data).save((saveErr, saveRes) => {
                console.log('GVDagsfdksdvfhskfsadk')
                console.log(data, 'data of data')

                if (saveErr) {
                    console.log(saveErr, "saveErr");
                    // return res.send({ responseCode: 500, responseMessage: "Internal server error.", responseResult: saveErr });
                }
                else {
                    console.log(saveRes, "saveRes");
                    // return res.send({ responseCode: 200, responseMessage: "Notification save successfully!", responseResult: saveRes });
                }
            })
            console.log("success", response)
            return true;
        }
    });
}

exports.generateToken = async (req, res, next) => {

    const userData = await userModel.find({_id:mongoose.Types.ObjectId(req.body.userId)})

    const appID = '5d6b6fe592ec4b1db67bb7ad5a6454a0';
    const appCertificate = '7a1bfbb59ce54dfcab6f59a90f30f33c';
    const channelName = makeid();
    // const uid = '7';
    const account = "2882341273";
    const role = RtcRole.ATTENDEE;
    
    const expirationTimeInSeconds = 3600
    
    const currentTimestamp = Math.floor(Date.now() / 1000)
    
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
    
    // IMPORTANT! Build token with either the uid or with the user account. Comment out the option you do not want to use below.
    
    // Build token with uid
    const tokenA = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, role, privilegeExpiredTs);
    console.log("Token With Integer Number Uid: " + tokenA);

    var data = {
        title: req.body.title,
        deviceType: req.body.deviceType,
        deviceToken: userData[0].deviceTokenFcm,
        userId: mongoose.Types.ObjectId(req.body.userId),
        type: req.body.type,
        tokenA: tokenA,
        channelName: channelName,
    }
    
    // Build token with user account
    const tokenB = RtcTokenBuilder.buildTokenWithAccount(appID, appCertificate, channelName, account, role, privilegeExpiredTs);
    var Data = {
        tokenA: tokenA,
        // account: account,
        channelName: channelName,
        title: data.title,
        deviceType: data.deviceType,
        deviceToken: data.deviceToken,
        userId: data.userId,
        type: data.type,
    }
    const result = await send_fcm(data);
    console.log(Data, 'result of data')
    res.status(200).json({ 'status': 1, 'msg': 'Token Genrated successfully', 'data': Data  })
    }

async function send_fcm(data) {
    var FCM = require('fcm-node');

    // subterra Server Key
    var serverKey = 'AAAAn84cB24:APA91bFICwcAzb2aWjsmfUvdxlt9WhufJsGUoBB1x8cqdfJFktgWSmzNSBM_kLB-OZZBllSZ-aEP42qzQEJlKLCw5wbDfLXLudh4eHP6tyvz4ctc1QOa1KQ_kWypP3FOQR7krxwb8XU9';
    var fcm = new FCM(serverKey);

    var sound = "";
    if (data.deviceType == "ios" || data.deviceType == 'web') {
        var message = {
            to: data.deviceToken,
            deviceType: data.deviceType,
            userId: data.userId,
	        content_available: true,

            notification: {
                tokenA: data.tokenA,
                channelName: data.channelName,
                title: data.title,
                deviceToken: data.deviceToken,
                deviceType: data.deviceType,
                userId: data.userId,
                type: data.type,
	        content_available: true,
            }
        }
    } else {
        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            to: data.deviceToken,
            data: {
                title: data.title,            }
        }
    }

    fcm.send(message, function (err, response) {
        console.log(message, "Data Line no. 2335");
        if (err) {
            console.log("fcm error", err)
            return true;
        } else {
            new fcmModel(data).save((saveErr, saveRes) => {
                console.log('GVDagsfdksdvfhskfsadk')
                console.log(data, 'data of data')

                if (saveErr) {
                    console.log(saveErr, "saveErr");
                    // return res.send({ responseCode: 500, responseMessage: "Internal server error.", responseResult: saveErr });
                }
                else {
                    console.log(saveRes, "saveRes");
                    // return res.send({ responseCode: 200, responseMessage: "Notification save successfully!", responseResult: saveRes });
                }
            })
            console.log("success", response)
            return true;
        }
    });
}

exports.register = async function (req, res, next) {
    const query = { $and: [{ "role": req.body.role }, { $or: [{ email: req.body.email }, { phoneNumber: req.body.phoneNumber }] }] }
        console.log(query, 'line no......10')
        const document = await user.findOne(query);

        if (!req.body.email && !req.body.phoneNumber) {
            return res.status(200).json({ 'status': 0, 'msg': "email & mobileNumber not define" });
        }
        else if (document != null && (document.email == req.body.email)) {
            return res.status(200).json({ 'status': 0, 'msg': "email already exists" });
        }
        else if (document != null && (document.phoneNumber == req.body.phoneNumber)) {
            return res.status(200).json({ 'status': 0, 'msg': "Mobile number already exists" });
        }
        else {

            let userVariable = {
                "username": req.body.username,
                "password": bcrypt.hashSync(req.body.password),
                "email": req.body.email,
                "phoneNumber": req.body.phoneNumber,
                "countryName": req.body.countryName,
                "address": req.body.address,
                "pageName": req.body.pageName,
                "purpose": req.body.purpose,
                "businessType": req.body.businessType,
                "role": req.body.role,
                "category_id": req.body.category_id,
                "deviceType": req.body.deviceType,
                "deviceTokenFcm": req.body.deviceTokenFcm,
                "deviceTokenPushKit": req.body.deviceTokenPushKit
            }

            console.log(userVariable, "Register User Data");

            new user(userVariable).save().then(function (doc) {

                if (doc.length > 0) {

                    res.status(200).json({ 'status': 1, 'msg': 'registration successfull', 'data': doc })
                }
                else {
                    console.log(doc);
                    res.status(200).json({ 'status': 1, 'msg': 'registration successfull', 'data': doc })
                }
            }).catch(err =>
                console.error(err)
            )
        }
}

exports.registrationList = async (req, res) => {
    const businessTypeData = await businessTypeModel.find({ }).exec();
    const countryData = await countryModel.find({ });
    var Data = {
        businessTypeData: businessTypeData,
        countryData: countryData,
    }
    return res.status(200).json({ 'status': 1, 'msg': "Detail fetched successfully.", 'data': Data });
}

exports.login = async function (req, res, next) {
    const query =  { $or: [{ email: req.body.username }, { phoneNumber: req.body.username }] }
    user.findOneAndUpdate(query, {$set:{deviceTokenFcm: req.body.deviceTokenFcm, deviceTokenPushKit: req.body.deviceTokenPushKit}}, (error, result) => {
        if (error) {
            return res.status(400).json({ 'status': 0, 'msg': "Internal server error.", 'data': error });
        } else if (!result) {
            return res.status(200).json({ 'status': 0, 'msg': " Incorrect email or mobile no.", 'data': null });
        } else {
            // var password = bcrypt.hashSync(req.body.password);

            if (bcrypt.compareSync(req.body.password, result.password)) {
                console.log(result.password)
                var token = jwt.sign({ _id: result._id, email: result.email }, 'testing', { expiresIn: '20d' });
                // user.findOneAndUpdate({ email: req.body.username }, {$set: {deviceTokenFcm: req.body.deviceTokenFcm}})
                var data = {
                    token: token,
                    _id: result._id,
                    "email": result.email,
                    "phoneNumber": result.phoneNumber,
                    "profileImage": result.profileImage,
                    "role": result.role,
                    "username": result.username
                }
                data.profileImage = `${url.base_url}/${data.profileImage}`;
                console.log("line no-26------------", data)
                return res.status(200).json({ 'status': 1, 'msg': "login successfully.", 'data': data });

            } else {
                return res.status(200).json({ 'status': 0, 'msg': "Credentials are wrong.", 'data': null });
            }
        }
    })
}