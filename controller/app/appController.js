const url = {
    base_url: 'http://182.76.237.248:9000/upload'
};

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

var SALT_FACTOR = 10;

const userModel = require('../../models/userModel');
const notificationModel = require('../../models/notification')
const followerModel = require('../../models/followers');
const followingModel = require('../../models/following');
const category = require('../../models/categoryModel');
const postModel = require('../../models/postModel');
const likeModel = require('../../models/likeModel')
const commentModel = require('../../models/commentModel')
const contactUsModel = require('../../models/contactUs')
const aboutUsModel = require('../../models/aboutUs')

function comparePassword(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        console.log("user model line no 69 isMatch", isMatch)
        callback(null, isMatch);
    });
};

function generateOTP() {
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}


// FCM Notification Function
async function send_fcm(data) {
    var FCM = require('fcm-node');

    // OTRA Server Key
    var serverKey = 'AAAAY52i4Bc:APA91bEx9msnbcCJcCmKFpDZPOhRHpMePqfX1PnYnhSluIKxqjSWDzFmgNjIynhjfXf33m37QU1UexsE89X29LYg9z1CxczxhtqZg5RONymPbFQV_ZjAGwkRduheUrUku6sGvHr-Uy9Y'
    var fcm = new FCM(serverKey);

    var sound = "";
    if (data.device_type == "ios" || data.device_type == 'web') {
        var message = {
            //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            to: data.device_token,
            //collapse_key: 'red', //for replaced with new one

            notification: {  //you can send only notification or only data(or include both)
                title: data.title,
                body: data.message,
            }
        }
    } else {
        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            to: data.device_token,
            // this    to: 'd0z-UMGIwtuKgHsBK7O650:APA91bFSFFux4x7NlKojf3ZjZQyxr2_wkSsLMLDr2fvM0urqAG4dDCqbfdv3B4L1-tNqyCDVWmhphxYnhdsC04LS5Ny1tlvm_S5YEfxsxVz5AnyaLECsORffH3ZPGFQWidsNqrooBv5J', to: 'dSe867oxRSqzUbwzXHUiPk:APA91bH5eizc9xm1H6rERG8vjEviWcQongGlrsewM48iCG2K7UEnTD8gL_7sLlzeYZJ2gtmmslu6xeY8aWmHfFU5BrURitLqmgTadJ_ib_1cMuy-G2uUgF0EQY2GBeHdEhURHs8c6he0',
            // to: 'd0z-UMGIwtuKgHsBK7O650:APA91bFSFFux4x7NlKojf3ZjZQyxr2_wkSsLMLDr2fvM0urqAG4dDCqbfdv3B4L1-tNqyCDVWmhphxYnhdsC04LS5Ny1tlvm_S5YEfxsxVz5AnyaLECsORffH3ZPGFQWidsNqrooBv5J',
            data: {  //you can send only notification or only data(or include both)
                title: data.title,
                message: data.message,
            }
        }
    }

    fcm.send(message, function (err, response) {
        console.log(message, "Data Line no. 2335");
        if (err) {
            console.log("fcm error", err)
            return true;
        } else {
            new fcmModel(data).save((saveErr, saveRes) => {

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

module.exports = {


    // FCM Notification Api
    test: async function (req, res) {
        data = { device_token: 'cCsxDrPASga8KyUQl2OSBY:APA91bGEp4EOEzlLMCvG90khbbY0WCK5rldQR32TiK5hLtbnjmnbutv7z7kKEzU1_5RETX7qr14kcvjlwTSr09aQdfa2ex4VqyqEJmAENHpMe-OlJpwA3uzcK2eQ_8QPvGBtEfPQmNAR', device_type: 'android', title: 'test', message: 'Test Success' }
        send_fcm(data)
    },

    testFcm: async function (req, res) {

        var data = {
            title: req.body.title,
            message: req.body.message,
            device_type: req.body.device_type
        }
        console.log(data)
        const result = await send_fcm(data);
        res.status(200).json({ 'status': 1, 'msg': " successfully done", 'data': result })
        console.log(result, "line no 2292");
    },


    // Send OTP API
    sendOtp: function (req, res) {
        var username = req.body.user
        if (isNaN(username)) {
            var search = { email: username };
            var type = "email";
        } else {
            var search = { phoneNumber: username };
            var type = "mobile";
        }
        userModel.find(search)
            .exec(function (err, userData) {
                console.log(userData)
                if (err) {
                    res.status(500).send({ 'status': 0, 'msg': 'Something want worng', 'data': null });
                } else {
                    if (userData.length > 0) {
                        // console.log(getOtp(), "get Otp")
                        let otp = generateOTP();
                        if (type == "email") {
                            var upddata = {
                                'otp': otp,
                                'username': userData[0].email,
                            }
                            var transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: 'maxtratechnologies.test@gmail.com',
                                    pass: 'Maxtra@123'
                                }
                            });
                            var mailOptions = {
                                from: 'MEMOGram maxtratechnologies.test@gmail.com',
                                to: username,
                                subject: 'Forgot Password OTP',
                                text: 'Your one time password is: ' + otp
                            };
                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    console.log("Error is:" + error);
                                } else {
                                    console.log('Email sent: ' + info.response);
                                }
                            });
                            res.status(200).json({ 'status': 1, 'msg': 'successfully sent OTP', 'data': { otp } });
                        }
                        if (type == "mobile") {
                            res.status(200).json({ 'status': 1, 'msg': 'successfully sent OTP', 'data': { otp } });
                        }

                    } else {
                        res.status(200).json({ 'status': 1, 'msg': 'user not exist', 'data': null });
                    }
                }
            })
    },

    addAboutUs: function (req, res) {
        var aboutData = {
           caption: req.body.caption
        }
        
        // console.log(postData);return false;
        new aboutUsModel(aboutData).save().then(data => {
            res.status(200).json({ 'status': 1, 'msg': 'Add Post Successfully', 'data': data });
        }).catch((error) => {
            console.log(error);
            res.status(400).json({ 'status': 0, 'msg': 'something went wrong', 'data': null });
        });
    },
    
    addContactUs: function (req, res) {
        var contactData = {
            email: req.body.email,
            phoneNumber: req.body.phoneNumber
        }
        
        // console.log(postData);return false;
        new contactUsModel(contactData).save().then(data => {
            res.status(200).json({ 'status': 1, 'msg': 'Add Post Successfully', 'data': data });
        }).catch((error) => {
            console.log(error);
            res.status(400).json({ 'status': 0, 'msg': 'something went wrong', 'data': null });
        });
    },

    contactUs: (req, res, next) => {

        contactUsModel.find({}).exec(function (err, data) {
            if (err) {
                console.log("Line no 455", err);
                res.status(200).json({ 'status': 0, 'msg': 'something went wrong ', 'data': [] });

            }
            else {
                res.status(200).json({ 'status': 1, 'msg': 'ContactUs Data Get Successfully', 'data': data });

            }
        })
    },

    aboutUs: (req, res, next) => {

        aboutUsModel.find({}).exec(function (err, data) {
            if (err) {
                console.log("Line no 455", err);
                res.status(200).json({ 'status': 0, 'msg': 'something went wrong ', 'data': [] });

            }
            else {
                res.status(200).json({ 'status': 1, 'msg': 'AboutUs Data Get Successfully', 'data': data });

            }
        })
    },

    notificationList: (req, res, next) => {

        notificationModel.find({ }).exec(function (err, data) {
            if (err) {
                console.log("Line no 455", err);
                res.status(200).json({ 'status': 0, 'msg': 'something went wrong ', 'data': [] });

            }
            else {
                res.status(200).json({ 'status': 1, 'msg': 'Notification list fetched successfully', 'data': data });

            }
        })
    },

    categoryList: (req, res, next) => {

        category.find({}).exec(function (err, data) {
            if (err) {
                console.log("Line no 455", err);
                res.status(200).json({ 'status': 0, 'msg': 'something went wrong ', 'data': [] });

            }
            else {
                res.status(200).json({ 'status': 1, 'msg': 'Category list fetched successfully', 'data': data });

            }
        })
    },

    // Edit Profile API
    editProfile: async function (req, res, next) {
        console.log(req.body, req.file, 'editProfile');

        var userVariable = {};
        if (req.file == ' ' || req.file == null) {
            userVariable = {
                username: req.body.username,
                email: req.body.email,
                phoneNumber: req.body.phoneNumber,
            }
            if (req.body.address) {
                userVariable.address = req.body.address
            }
        }
        else {
            userVariable = {
                username: req.body.username,
                email: req.body.email,
                phoneNumber: req.body.phoneNumber,
                profileImage: req.file.filename
            }
            if (req.body.profileImage) {
                userVariable.profileImage = req.body.profileImage
            }
            // if (req.body.profileImage != undefined) {     // `${url.base_url}/${req.files.profile[0].filename}`;
            //     userVariable.profileImage = req.files.profileImage[0].filename; //req.files.profile[0].filename
            // }
        }
        console.log(userVariable, 'line no...............45')
        var getUser = await userModel.find({ _id: mongoose.Types.ObjectId(req.body._id) }).exec();
        console.log(getUser, "getUser data line no.....47")
        if (getUser.length > 0) {
            console.log(req.body._id, "getUer._id")
            var editUserData = await userModel.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(req.body._id) }, userVariable, { new: true });
            console.log(editUserData, "editUSerData")
            res.status(200).json({ 'status': 1, 'msg': 'edit Profile Successfully', 'data': editUserData });
        }
        else {
            return res.status(200).json({ 'status': 0, 'msg': "User data not found", 'data': [] });
        }
    },


    changePassword: (req, res) => {
        let username = req.body.username
        if (isNaN(username)) {
            var search = { email: username };
        } else {
            var search = { phoneNumber: username };
        }
        userModel.find(search).find(function (error, data) {

            if (error) {
                res.status(400).json({ 'status': 0, 'msg': 'something went wrong', 'data': [] });
            }
            if (data.length > 0) {
                let oldPassword = req.body.oldPassword;
                if (oldPassword) {
                    comparePassword(req.body.oldPassword, data[0].password, function (error, isMatch) {
                        console.log(isMatch, 'line no............250')
                        if (isMatch) {
                            bcrypt.genSalt(SALT_FACTOR, function (error, salt) {
                                if (error) {
                                    return res.status(400).json({ 'status': 0, 'msg': "Something Went wrong.", 'data': error });
                                }
                                bcrypt.hash(req.body.password, salt, function (error, hashedPassword) {

                                    if (error) {
                                        return res.status(400).json({ 'status': 0, 'msg': "Something Went Wrong.", 'data': error });
                                    }
                                    let password = hashedPassword;
                                    var Variables = {
                                        password: password,
                                    };

                                    userModel.update({ _id: mongoose.Types.ObjectId(data[0]._id) }, Variables, function (error, raw) {
                                        if (error) {
                                            res.status(400).json({ 'status': 1, 'msg': 'something went wrong', 'data': [] });
                                        }
                                        else {
                                            res.status(200).json({ 'status': 1, 'msg': 'Password Changed successfully', 'data': data });
                                        }
                                    })
                                });
                            });
                        }
                        else {
                            res.status(200).json({ 'status': 0, 'msg': 'incorrect old_password ', 'data': [] });
                        }
                    })
                }
                else {
                    bcrypt.genSalt(SALT_FACTOR, function (error, salt) {
                        if (error) {
                            console.log(error);
                            return res.status(500).json({ 'status': 0, 'msg': "Internal server error.", 'data': error });
                        }
                        bcrypt.hash(req.body.newpassword, salt, function (error, hashedPassword) {
                            if (error) {
                                return res.status(400).json({ 'status': 0, 'msg': "Internal server error.", 'data': error });
                            }
                            let password = hashedPassword;
                            var Variables = {
                                password: password,
                            };
                            user.update({ _id: mongoose.Types.ObjectId(data[0]._id) }, Variables, function (error, raw) {
                                if (error) {
                                    res.status(400).json({ 'status': 1, 'msg': 'something went wrong', 'data': [] });
                                }
                                else {
                                    res.status(200).json({ 'status': 1, 'msg': 'password changed successfully', 'data': data });
                                }
                            })
                        });
                    });
                }
            } else {
                res.status(200).json({ 'status': 0, 'msg': 'not exist ', 'data': [] });
            }
        })
    },

    follower: (req, res) => {
        var followerData = {
            user_id: req.body.user_id,
            follower_id: req.body.follower_id,
            followerStatus: req.body.followerStatus
        }
        if (followerData.followerStatus == 1) {
            followerModel.find({ $and: [{ user_id: mongoose.Types.ObjectId(req.body.user_id) }, { follower_id: mongoose.Types.ObjectId(req.body.follower_id) }] }).exec().then(data => {
                console.log(followerData, 'line no....315');
                console.log(data, 'line no....316');
                if (data.length > 0) {
                    res.status(200).json({ 'status': 1, 'msg': 'Already Followed', 'data': [] });
                } else {
                    console.log('asdfjsjdbfjsdbf')
                    new followerModel(followerData).save().then(data => {
                        res.status(200).json({ 'status': 1, 'msg': 'Follow Successfully', 'data': data });
                    })
                }
            })
        } else if (followerData.followerStatus == 2) {
            followerModel.findOneAndDelete({ $and: [{ user_id: mongoose.Types.ObjectId(req.body.user_id) }, { follower_id: mongoose.Types.ObjectId(req.body.follower_id)}, { $set: { followerStatus: "2" } }] }).exec().then(data => {
                res.status(200).json({ 'status': 1, 'msg': 'UnFollow Successfully', 'data': {}});
            })
        }
    },

    userData: async function (req, res) {
        var user_id = req.body._id
        const data = await userModel.find({});
        // console.log(postData, 'line no........334');return false;
        var user_list = []
        if (data.length > 0) {
            userList = data.map(async (obj) => {
                const user_lists = await followerModel.find({ 'follower_id': obj._id, 'user_id': user_id });
                console.log(user_lists.length, 'user_lists data')
                if (user_lists.length > 0) {
                    console.log('INNNNNNN')
                    obj.followerStatus = "1"
                }
                user_list.push(obj)
                return user_list;
            })
            console.log(user_list, 'post_list')
            let userData = await Promise.all(userList);
            // console.log(likePostData, 'lines');
            res.status(200).json({'status': 1, 'msg': 'User List found successfully', 'data': userData[userData.length - 1]});
        }
    },

    userList: async (req, res, next) => {
        var type = req.body.type;
        if (type == '1'){
        var data = await followerModel.aggregate([
            {
                "$match": { 'user_id': mongoose.Types.ObjectId(req.body.user_id) }
            },
            {
                "$project": {
                    "us": "$$ROOT"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "us.follower_id",
                    foreignField: "_id",
                    as: "follower"
                }
            },
            {
                "$unwind": {
                    "path": "$follower",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                "$project": {
		    "followerId": "$us.follower_id",
                    "username": "$follower.username",
                    "profileImage": "$follower.profileImage",
                }
            }
        ])
        follwerData = data.map(obj => {
            if (obj.profileImage) {

                obj.profileImage = `${url.base_url}/${obj.profileImage}`;
            }
            else {
                obj.profileImage = '';
            }
            return obj;
        })
        let finalFollowerList = await Promise.all(follwerData);
        return res.send({ 'status': 1, msg: "Follower list have been fetched successfully.", data: finalFollowerList });
    } else if(type == '2'){
        var data = await followingModel.aggregate([
            {
                "$match": { 'user_id': mongoose.Types.ObjectId(req.body.user_id) }
            },
            {
                "$project": {
                    "us": "$$ROOT"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "us.following_id",
                    foreignField: "_id",
                    as: "following"
                }
            },
            {
                "$unwind": {
                    "path": "$following",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                "$project": {
                    "followingId": "$us.following_id",
                    "username": "$following.username",
                    "profileImage": "$following.profileImage",
                }
            }
        ])
        followingData = data.map(obj => {
            if (obj.profileImage) {

                obj.profileImage = `${url.base_url}/${obj.profileImage}`;
            }
            else {
                obj.profileImage = '';
            }
            return obj;
        })
        let finalFollowingList = await Promise.all(followingData);
        return res.send({ 'status': 1, msg: "Following list have been fetched successfully.", data: finalFollowingList });
    }
    },

    following: (req, res) => {
        var followData = {
            user_id: req.body.user_id,
            following_id: req.body.following_id,
            followingStatus: req.body.followingStatus
        }
        if (followData.followingStatus == 1) {
            followingModel.find({ $and: [{ user_id: mongoose.Types.ObjectId(req.body.user_id) }, { following_id: mongoose.Types.ObjectId(req.body.following_id) }] }).exec().then(data => {
                if (data.length > 0) {
                    res.status(200).json({ 'status': 1, 'msg': 'Already Follow', 'data': [] });
                } else {
                    console.log('asdfjsjdbfjsdbf')
                    new followingModel(followData).save().then(data => {
                        res.status(200).json({ 'status': 1, 'msg': 'Follow Successfully', 'data': data });
                    })
                }
            })
        } else if (followData.followingStatus == 2) {
            followingModel.findOneAndDelete({ $and: [{ user_id: mongoose.Types.ObjectId(req.body.user_id) }, { following_id: mongoose.Types.ObjectId(req.body.following_id) }] }).exec().then(data => {
                res.status(200).json({ 'status': 1, 'msg': 'UnFollow Successfully', 'data': [] });
            })
        }
    },

    dashboard: async (req, res) => {
        const data = await followerModel.find({ user_id: mongoose.Types.ObjectId(req.body.user_id) }).exec();
        var post_list = []
        if (data) {
            postData = data.map(async obj => {
                post_lists = obj.follower_id
                post_list = post_list.concat(post_lists);
                return post_list;
            })
            if (postData.length > 0) {
                let follower = await Promise.all(postData);
                // console.log(post_id[post_id.length - 1], 'line no...........764'); return false;
                const post_data = await postModel.find({ user_id: { $in: follower[follower.length - 1] } });
                // console.log(post_data);return false;

                postData = post_data.map(async obj => {
                    const likeData = await likeModel.find({ postId: obj._id }).count();
                    // console.log(likeData,"line no 90");return false;
                    const commentData = await commentModel.find({ post_id: obj._id }).count();
                    obj.like = likeData,
                        obj.comment = commentData
                    // console.log(obj.postImage.length, 'line no.........294');return false;
                    for (i = 0; i < obj.postImage.length; i++) {
                        obj.postImage[i] = `${url.base_url}/${obj.postImage[i]}`;
                    }
                    if (obj.userImage) {

                        obj.userImage = `${url.base_url}/${obj.userImage}`;
                    }
                    else {
                        obj.userImage = '';
                    }
                    return obj;
                })
                if (postData.length > 0) {
                    let finalPostList = await Promise.all(postData);
                    res.status(200).json({ 'status': 1, 'msg': "Post List Found successfully.", 'data': finalPostList });
                } else {
                    res.status(200).json({ 'status': 0, 'msg': "No Data Found", 'data': [] });
                }
            }
        }
    },

    search: async (req, res) => {
        var user = req.body.input
        var userDetail = await userModel.aggregate([
            {
                "$match": { "username": { $regex: new RegExp("^" + user.toLowerCase(), "i") } },
            },
            {
                "$project": {
                    "jb": "$$ROOT"
                }
            },
            {
                "$project": {
                    "_id": "$jb._id",
                    "username": "$jb.username",
                    "profileImage": "$jb.profileImage",
                    "date": "$jb.date",
                }
            }
        ])
        console.log(userDetail, 'lin ne no..........464')
        userData = userDetail.map(async obj => {
            if (obj.profileImage) {
                obj.profileImage = `${url.base_url}/${obj.profileImage}`;
            }
            else {
                obj.profileImage = '';
            }
            return obj;
        })
        let finalDataList = await Promise.all(userData);
        res.status(200).json({ 'status': 1, 'msg': 'Post Detail fetch successfully', 'data': finalDataList });
    },

    // search: async (req, res) => {
    //     var search = {
    //         user_id: req.body.user_id,
    //         category_id: req.body.category_id
    //     }
    //     if (search.category_id) {
    //         const post_data = await postModel.find({ $and: [{ category_id: search.category_id }, { status: "2" }] }).then(data => {
    //             if (data.length > 0) {
    //                 res.status(200).json({ 'status': 1, 'msg': "Post Found successfully.", 'data': data });
    //             } else {
    //                 res.status(200).json({ 'status': 0, 'msg': "No Data Found.", 'data': [] });
    //             }
    //         })
    //     } else if (search.user_id) {
    //         const user_data = await userModel.find({ _id: search.user_id }).then(data => {
    //             if (data.length > 0) {
    //                 res.status(200).json({ 'status': 1, 'msg': "User Found successfully.", 'data': data });
    //             } else {
    //                 res.status(200).json({ 'status': 0, 'msg': "No Data Found.", 'data': [] });
    //             }
    //         })
    //     }
    // },

    postHistory: async (req, res) => {
        var date = req.body.date
        var user_id = req.body.user_id
        // post_list = await postModel.find({ $and: [{ date:  date  }, {user_id: mongoose.Types.ObjectId(user_id)}, {status: "1"}] });
        post_list = await postModel.find({ $and: [{user_id: mongoose.Types.ObjectId(user_id)}, {status: "1"}] });
        if(post_list.length > 0){
            res.status(200).json({ 'status': 1, 'msg': "Data Found successfully.", 'data': post_list });
        }
        else {
            res.status(200).json({ 'status': 0, 'msg': "No Data Found.", 'data': [] });
        }
    },

}
