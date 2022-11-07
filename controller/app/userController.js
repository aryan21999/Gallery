const url = {
    base_url: 'http://182.76.237.248:9000/upload'
};

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const moment = require('moment')
const postModel = require('../../models/postModel');
const userModel = require('../../models/userModel');
const likeModel = require('../../models/likeModel');
const commentModel = require('../../models/commentModel');
const followerModel = require('../../models/followers')
const followingModel = require('../../models/following')
const { param } = require('../../router');
const userCategoryModel = require('../../models/userCategory')
const postedVideoModel = require('../../models/postedVideoModel')
const verifyUserModel = require('../../models/verifiedUsers')
const storyModel = require('../../models/storyModel')
const fcmModel = require('../../models/fcmModel')
const likeVideoModel = require('../../models/likeVideoModel')
const commentVideoModel = require('../../models/commentVideoModel')


var SALT_FACTOR = 10;


function comparePassword(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        console.log("user model line no 69 isMatch", isMatch)
        callback(null, isMatch);
    });
};

// API for viewUserContent
exports.userDetail = async (req, res) => {
    const profileData = await userModel.findById({ _id: mongoose.Types.ObjectId(req.body.user_id) });
    profileData.profileImage = `${url.base_url}/${profileData.profileImage}`;
    if (profileData) {
        console.log(profileData, 'line no...................27')
        return res.status(200).json({ 'status': 1, 'msg': "User Detail Found successfully.", 'data': profileData });
    }
}

exports.userCategory = async function (req, res, next) {
    const json = {
        "category": req.body.category_id,
        "user_id": mongoose.Types.ObjectId(req.body.user_id),
    }

    var getUser = await userCategoryModel.find({ user_id: json.user_id }).exec();
    console.log(getUser, 'line no..............42')

    if (getUser.length <= 0) {

        const newUserCategory = await userCategoryModel(json).save();
        console.log(newUserCategory._id, "newUserCategory");

        var data = {
            _id:newUserCategory._id,
            category: newUserCategory.category,
            user_id: newUserCategory.user_id,
        }
        console.log('line register no ......171 auth')
        res.status(200).json({ 'status': 1, 'msg': 'Category Added successfully', 'data': data })
    }
    else {

        var editUserCatData = await userCategoryModel.findOneAndUpdate({ user_id: json.user_id }, json, { new: true });
        console.log(editUserCatData, "editUserData line no 61");

        var data = {
            _id: editUserCatData._id,
            category: editUserCatData.category,
            user_id: editUserCatData.user_id,
        }
        console.log(data, 'line no......192')
        res.status(200).json({ 'status': 1, 'msg': 'Category Updated Successfully', 'data': data });
    }
}


exports.viewUserDetail = async (req, res) => {
    const userData = await userModel.findOne({ _id: mongoose.Types.ObjectId(req.body.user_id) });
    userData.profileImage = `${url.base_url}/${userData.profileImage}`;

    const countPost = await postModel.find({ user_id: mongoose.Types.ObjectId(req.body.user_id)}).countDocuments();

    const follower = await followerModel.find({ user_id: mongoose.Types.ObjectId(req.body.user_id) }).countDocuments();

    const following = await followingModel.find({ user_id: mongoose.Types.ObjectId(req.body.user_id) }).countDocuments();

    const postData = await postModel.find({ user_id: mongoose.Types.ObjectId(req.body.user_id) });
    var postDatawithUrl = postData.map(obj => {
        for (i = 0; i < obj.postImage.length; i++) {
            obj.postImage[i] = `${url.base_url}/${obj.postImage[i]}`;
        }
        return obj;
    })

    var Data = {
        userData: userData,
        countPost: countPost,
        follower: follower,
        following: following,
        postdata: postDatawithUrl,
    }
    return res.status(200).json({ 'status': 1, 'msg': "User Detail fetched successfully.", 'data': Data });
}

// Edit Profile API
exports.editProfile = async function (req, res, next) {
    console.log(req.body, req.file, 'editProfile');

    var userVariable = {};
    if (req.file == ' ' || req.file == null) {
        userVariable = {
            username: req.body.username,
            email: req.body.email,
            bio: req.body.bio,
            phoneNumber: req.body.phoneNumber,
            countryName: req.body.countryName,
            address: req.body.address,
            pageName: req.body.pageName,
            purpose: req.body.purpose,
            businessType: req.body.businessType,
        }
        if (req.body.address) {
            userVariable.address = req.body.address
        }
    }
    else {
        userVariable = {
            username: req.body.username,
            email: req.body.email,
            bio: req.body.bio,
            phoneNumber: req.body.phoneNumber,
            profileImage: req.file.filename,
            countryName: req.body.countryName,
            address: req.body.address,
            pageName: req.body.pageName,
            purpose: req.body.purpose,
            businessType: req.body.businessType,
        }
        // if (req.body.profileImage) {
        //     userVariable.profileImage = req.body.profileImage
        // }
        if (req.body.profileImage != undefined) {
            userVariable.profileImage = req.files.profileImage[0].filename;
        }
    }
    console.log(userVariable, 'line no...............45')
    var getUser = await userModel.find({ _id: mongoose.Types.ObjectId(req.body._id) }).exec();
    console.log(getUser, "getUser data line no.....47")
    if (getUser.length > 0) {
        console.log(req.body._id, "getUer._id")
        var editUserData = await userModel.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(req.body._id) }, userVariable, { new: true });

        // To Make Edit Profile Image Base_url
        editUserData.profileImage = `${url.base_url}/${editUserData.profileImage}`;

        console.log(editUserData, "editUSerData")
        res.status(200).json({ 'status': 1, 'msg': 'edit Profile Successfully', 'data': editUserData });
    }
    else {
        return res.status(200).json({ 'status': 0, 'msg': "User data not found", 'data': [] });
    }
}


exports.changePassword = (req, res) => {
    let user_id = req.body.user_id
    // console.log(user_id)
    userModel.find({ _id: mongoose.Types.ObjectId(req.body.user_id) }).find(function (error, data) {
        // console.log(data, 'line no......116');return false;

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

                                userModel.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(data[0]._id) }, Variables, function (error, raw) {
                                    if (error) {
                                        res.status(400).json({ 'status': 0, 'msg': 'something went wrong', 'data': [] });
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
                res.status(200).json({ 'status': 0, 'msg': 'Please Enter The Previous Password ', 'data': [] });
            }
        } else {
            res.status(200).json({ 'status': 0, 'msg': 'not exist ', 'data': [] });
        }
    })
}

exports.forgotpassword = function (req, res, next) {
    let username = req.body.username;
    if (isNaN(username)) {
        var search = { email: username, status: true };
    } else {
        var search = { phoneNumber: username, status: true };
    }
    userModel.find(search)
        .exec(function (err, userData) {
            if (err) {
                res.status(500).send({ 'status': '0', 'msg': 'Something want worng', 'data': [] });
            } else {
                //console.log(userData);
                var Variables = {
                    password: req.body.password,
                };
                bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
                    if (err) {
                        res.status(400).json({ 'status': 0, 'msg': 'something went wrong', 'data': [] });
                    }
                    bcrypt.hash(req.body.password, salt, function (err, hashedPassword) {
                        if (err) {
                            res.status(400).json({ 'status': 0, 'msg': 'something went wrong', 'data': [] });
                        }
                        userModel.password = hashedPassword;
                        console.log(userModel.password)
                        var Variables = {
                            password: userModel.password,
                        };
                        console.log(Variables)
                        userModel.update({ _id: mongoose.Types.ObjectId(userData[0]._id) }, Variables, function (err, raw) {
                            res.status(200).json({ 'status': 1, 'msg': 'Password Change Successfully', 'data': userData[0] });
                        })
                    });
                });
            }
        })
};


// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Video Controllers >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.

exports.videoDetail = async function (req, res) {
    var postData = await postedVideoModel.aggregate([
        {
            // "$match": { $and: [{ 'user_id': mongoose.Types.ObjectId(req.body.user_id) }, { status: '2' }] }
            "$match": { _id: mongoose.Types.ObjectId(req.body.post_id) }
        },
        {
            "$project": {
                "pm": "$$ROOT"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "pm.user_id",
                foreignField: "_id",
                as: "us"
            }
        },
        {
            "$unwind": {
                "path": "$us",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$project": {
                "_id": "$pm._id",
                "user_id" : "$pm.user_id",
                // "comment": "$pm.comment",
                "likeStatus": "$pm.likeStatus",
                "postedVideo": "$pm.postedVideo",
                "username": "$us.username",
                "profileImage": "$us.profileImage",
                "createdAt": "$pm.createdAt",
                "updatedAt": "$pm.updatedAt",
                "__v": "$pm.__v",
            }
        }
    ])
    postDetail = postData.map(async obj => {
        console.log(obj, 'obj data')
        obj.like = await likeVideoModel.find({ postId: mongoose.Types.ObjectId(req.body.post_id) }).count();
        obj.comment = await commentVideoModel.find({ post_id: mongoose.Types.ObjectId(req.body.post_id) }).count();
        const post_lists = await likeVideoModel.find({$and: [{'userId': req.body.user_id}, {'postId': obj._id }]});
        console.log(post_lists.length, 'post_lists data')

        if (post_lists.length > 0) {
            // console.log('INNNNNNN')
            obj.likeStatus = "1"
        }
        if (obj.postedVideo) {
            obj.postedVideo = `${url.base_url}/${obj.postedVideo}`;
        }
        else {
            obj.postedVideo = '';
        }
        if (obj.profileImage) {
            obj.profileImage = `${url.base_url}/${obj.profileImage}`;
        }
        else {
            obj.profileImage = '';
        }
        return obj;
    })
    let postDataAll = await Promise.all(postDetail);
    var data = await commentVideoModel.aggregate([
        {
            // "$match": { $and: [{ 'user_id': mongoose.Types.ObjectId(req.body.user_id) }, { status: '2' }] }
            "$match": { post_id: mongoose.Types.ObjectId(req.body.post_id) }
        },
        {
            "$project": {
                "pm": "$$ROOT"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "pm.user_id",
                foreignField: "_id",
                as: "us"
            }
        },
        {
            "$unwind": {
                "path": "$us",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$project": {
                "_id": "$pm._id",
                "user_id" : "$pm.user_id",
                "comment": "$pm.comment",
                "username": "$us.username",
                "profileImage": "$us.profileImage",
                "post_id": "$pm.post_id",
                "createdAt": "$pm.createdAt",
                "updatedAt": "$pm.updatedAt",
                "__v": "$pm.__v",
            }
        }
    ])
    commentList = data.map(async obj => {
        if (obj.profileImage) {
            obj.profileImage = `${url.base_url}/${obj.profileImage}`;
        }
        else {
            obj.profileImage = '';
        }
        return obj;
    })
    let finalCommentList = await Promise.all(commentList);
    var Data = {
        postDataAll: postDataAll,
        finalCommentList: finalCommentList.reverse(),
    }
    res.status(200).json({ 'status': 1, 'msg': 'Post Detail fetch successfully', 'data': Data });
}

exports.postVideo = function (req, res) {
    var postDetail = {
        caption: req.body.caption,
        postedVideo: req.file.filename,
        like: req.body.like,
        user_id: mongoose.Types.ObjectId(req.body.user_id),
        status: "1",
        date: new Date().toISOString().slice(0, 10)
    }
    if (req.body.postedVideo != undefined) {
        postDetail.postedVideo = req.files.postedVideo[0].filename;
    }
    // console.log(postData);return false;
    new postedVideoModel(postDetail).save().then(data => {
        res.status(200).json({ 'status': 1, 'msg': 'Post Uploaded Successfully', 'data': data });
    }).catch((error) => {
        console.log(error);
        res.status(400).json({ 'status': 0, 'msg': 'something went wrong', 'data': null });
    });
}

exports.postedVideoDetail = async function (req, res) {
        var data = await postedVideoModel.aggregate([
         {
             "$match": { user_id: mongoose.Types.ObjectId(req.body.user_id) }
         },
        {
            "$project": {
                "pm": "$$ROOT"
            }
        },
        {
            "$project": {
                // "title": "$jb.title",
                // "jobId": "$jb._id",
                // "company": "$jb.company",
                // "profileImage": "$cb.profileImage",
                // "date": "$jb.date",
                "_id": "$pm._id",
                "caption": "$pm.caption",
                "postedVideo": "$pm.postedVideo",
                "postStatus": "$pm.postStatus",
                "like": "$pm.like",
                "likeStatus": "$pm.likeStatus",
                "date": "$pm.date",
                "user_id": "$pm.user_id",
            }
        }
    ])
    postData = data.map(async obj => {
        if (obj.postedVideo) {
            obj.postedVideo = `${url.base_url}/${obj.postedVideo}`;
        }
        else {
            obj.postedVideo = '';
        }
        return obj;
    })
    let finalDataList = await Promise.all(postData);
    res.status(200).json({ 'status': 1, 'msg': 'Video Detail fetch successfully', 'data': finalDataList });
}

exports.postedVideos = async (req, res) => {
    var data = await postedVideoModel.aggregate([
        // {
        //     "$match": { userId: mongoose.Types.ObjectId(req.body.user_id) }
        // },
        {
            "$project": {
                "pm": "$$ROOT"
            }
        },
        {
            "$project": {
                "_id": "$pm._id",
                "caption": "$pm.caption",
                "postedVideo": "$pm.postedVideo",
                "postStatus": "$pm.postStatus",
                // "like": "$pm.like",
                // "comment": "$pm.comment",
                "likeStatus": "$pm.likeStatus",
                "date": "$pm.date",
                "user_id": "$pm.user_id",
            }
        }
    ])
    var post_list = []
    postData = data.map(async obj => {
        const likeData = await likeVideoModel.find({ postId: obj._id }).count();
        const commentData = await commentVideoModel.find({ post_id: obj._id }).count();
        const post_lists = await likeVideoModel.find({ 'userId': req.body.userId, 'postId': obj._id });
        // console.log(post_lists.length, 'post_lists data')
        if (post_lists.length > 0) {
            // console.log('INNNNNNN')
            obj.likeStatus = "1"
        }
        obj.like = likeData,
        obj.comment = commentData
        // console.log(obj.postImage.length, 'line no.........294');return false;
        // for (i = 0; i < obj.postImage.length; i++) {
        //     obj.postImage[i] = `${url.base_url}/${obj.postImage[i]}`;
        // }
        if (obj.postedVideo) {
            obj.postedVideo = `${url.base_url}/${obj.postedVideo}`;
        }
        else {
            obj.postedVideo = '';
        }
        post_list.push(obj)
        return post_list;
    })
    let finalDataList = await Promise.all(postData);
    res.status(200).json({ 'status': 1, 'msg': 'Video Detail fetch successfully', 'data': finalDataList[finalDataList.length - 1].reverse() });
}

exports.likeVideo = async function (req, res) {
    let userId = req.body.user_id;
    let postId = req.body.post_id;
    let status = req.body.status;
    var likeData = {
        "userId": userId,
        "postId": postId,
        "status": status
    }
    // console.log(likeData, 'line no.......331'); return false;
    if (status == "1") {
        new likeVideoModel(likeData).save().then(data => {
            res.status(200).json({ 'status': 1, 'msg': 'Post Liked', 'data': data });
        });
    } else if(status == "2") {
        likeVideoModel.deleteOne({ $set: [{ 'userId': userId }, { 'postId': postId }] }).then(async data => {
            res.status(200).json({ 'status': 1, 'msg': 'Post Unliked', 'data': null });
        });
    }
}

exports.likeVideoData = async function (req, res) {
    var user_id = req.body._id
    const postData = await postedVideoModel.find({ 'status': 2});
    // console.log(postData, 'line no........334');return false;
    if (postData > 0) {
        pamars = postData.map(async (obj) => {
            // console.log(params, 'line no////338');return false;
            const post_lists = await likeVideoModel.find({ 'user_id': user_id, 'post_id': obj.post_id }).count();
            console.log(pamars, 'line no......335')
            if (post_lists > 0) {
                obj.likeStatus = "1"
            }
            return post_list;
        })
        let likePostData = await Promise.all(pamars);
        // console.log(likePostData);
    }
}

exports.commentVideo = async function (req, res) {
    var commentData = {
        comment: req.body.comment,
        user_id: mongoose.Types.ObjectId(req.body.user_id),
        post_id: mongoose.Types.ObjectId(req.body.post_id),
    }
    // console.log(commentData);return false;
    new commentVideoModel(commentData).save().then(data => {
        res.status(200).json({ 'status': 1, 'msg': 'Comment Add Successfully', 'data': data });
    }).catch((error) => {
        console.log(error);
        res.status(400).json({ 'status': 0, 'msg': 'something went wrong', 'data': null });
    });
}

exports.commentVideoList = async (req, res) => {
    var data = await commentVideoModel.aggregate([
        {
            "$match": { post_id: mongoose.Types.ObjectId(req.body.post_id) }
        },
        {
            "$project": {
                "pm": "$$ROOT"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "pm.user_id",
                foreignField: "_id",
                as: "us"
            }
        },
        {
            "$unwind": {
                "path": "$us",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$project": {
                "_id": "$pm._id",
                "user_id" : "$pm.user_id",
                "comment": "$pm.comment",
                "username": "$us.username",
                "profileImage": "$us.profileImage",
                "post_id": "$pm.post_id",
                "createdAt": "$pm.createdAt",
                "updatedAt": "$pm.updatedAt",
                "__v": "$pm.__v",
            }
        }
    ])
    commentList = data.map(async obj => {
        if (obj.profileImage) {
            obj.profileImage = `${url.base_url}/${obj.profileImage}`;
        }
        else {
            obj.profileImage = '';
        }
        return obj;
    })
    let finalCommentList = await Promise.all(commentList);
    res.status(200).json({ 'status': 1, 'msg': 'Comment list fetched successfully', 'data': finalCommentList });
}

exports.addPost = function (req, res) {
    console.log(postData, 'linw no........162')
    let images = req.files.map((file, i) => {
        console.log(file, 'line no...............155');
        return file.filename;
    });
    var postData = {
        caption: req.body.caption,
        postImage: images,
        like: req.body.like,
        comment: req.body.comment,
        username: req.body.username,
        category_id: mongoose.Types.ObjectId(req.body.category),
        category_name: req.body.category_name,
        user_id: mongoose.Types.ObjectId(req.body.user_id),
        status: "1",
        date: new Date().toISOString().slice(0, 10)
    }
    // console.log(postData);return false;
    new postModel(postData).save().then(data => {
        res.status(200).json({ 'status': 1, 'msg': 'Add Post Successfully', 'data': data });
    }).catch((error) => {
        console.log(error);
        res.status(400).json({ 'status': 0, 'msg': 'something went wrong', 'data': null });
    });
}

exports.postDetail = async function (req, res) {
    var postData = await postModel.aggregate([
        {
            // "$match": { $and: [{ 'user_id': mongoose.Types.ObjectId(req.body.user_id) }, { status: '2' }] }
            "$match": { _id: mongoose.Types.ObjectId(req.body.post_id) }
        },
        {
            "$project": {
                "pm": "$$ROOT"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "pm.user_id",
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
                "_id": "$pm._id",
                "caption": "$pm.caption",
                "postImage": "$pm.postImage",
                "status": "$pm.status",
                "postStatus": "$pm.postStatus",
                // "like": "$pm.like",
                "likeStatus": "$pm.likeStatus",
                "comment": "$pm.comment",
                "date": "$pm.date",
                "username": "$ui.username",
                "profileImage": "$ui.profileImage",
                "category_name": "$pm.category_name",
                "user_id": "$pm.user_id",
                "category_id": "$pm.category_id",
                "createdAt": "$pm.createdAt",
                "updatedAt": "$pm.updatedAt",
                "__v": "$pm.__v"
            }
        }
    ])
    postDetail = postData.map(async obj => {
        console.log(obj, 'obj data')
        obj.like = await likeModel.find({ postId: mongoose.Types.ObjectId(req.body.post_id) }).count();
        obj.comment = await commentModel.find({ post_id: mongoose.Types.ObjectId(req.body.post_id) }).count();
 	const post_lists = await likeModel.find({$and: [{'userId': obj.user_id}, {'postId': obj._id }]});
        console.log(post_lists.length, 'post_lists data')
        if (post_lists.length > 0) {
            // console.log('INNNNNNN')
            obj.likeStatus = "1"
        }
        for (i = 0; i < obj.postImage.length; i++) {
            obj.postImage[i] = `${url.base_url}/${obj.postImage[i]}`;
        }

        if (obj.profileImage) {
            obj.profileImage = `${url.base_url}/${obj.profileImage}`;
        }
        else {
            obj.profileImage = '';
        }
        return obj;
    })
    let postDataAll = await Promise.all(postDetail);
    var data = await commentModel.aggregate([
        {
            // "$match": { $and: [{ 'user_id': mongoose.Types.ObjectId(req.body.user_id) }, { status: '2' }] }
            "$match": { post_id: mongoose.Types.ObjectId(req.body.post_id) }
        },
        {
            "$project": {
                "pm": "$$ROOT"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "pm.user_id",
                foreignField: "_id",
                as: "us"
            }
        },
        {
            "$unwind": {
                "path": "$us",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$project": {
                "_id": "$pm._id",
		"user_id" : "$pm.user_id",
                "comment": "$pm.comment",
                "username": "$us.username",
                "profileImage": "$us.profileImage",
                "post_id": "$pm.post_id",
                "createdAt": "$pm.createdAt",
                "updatedAt": "$pm.updatedAt",
                "__v": "$pm.__v",
            }
        }
    ])
    commentList = data.map(async obj => {
        if (obj.profileImage) {
            obj.profileImage = `${url.base_url}/${obj.profileImage}`;
        }
        else {
            obj.profileImage = '';
        }
        return obj;
    })
    let finalCommentList = await Promise.all(commentList);
    var Data = {
        postDataAll: postDataAll,
        finalCommentList: finalCommentList.reverse(),
    }
    res.status(200).json({ 'status': 1, 'msg': 'Post Detail fetch successfully', 'data': Data });
}

exports.postList = async function (req, res) {
    var data = await postModel.aggregate([
        {
            "$project": {
                "pm": "$$ROOT"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "pm.user_id",
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
                "_id": "$pm._id",
                "caption": "$pm.caption",
                "postImage": "$pm.postImage",
                // "like": "$pm.like",
                "category": "$pm.category_name",
                "likeStatus": "$pm.likeStatus",
                // "comment": "$pm.comment",
                "userId": "$pm.user_id",
                "userImage": "$ui.profileImage",
                "createdAt": "$pm.createdAt"
            }
        }
    ])
    var post_list = []
    postData = data.map(async obj => {
        const likeData = await likeModel.find({ postId: obj._id }).count();
        // console.log(likeData,"line no 90");return false;
        const commentData = await commentModel.find({ post_id: obj._id }).count();

        const post_lists = await likeModel.find({ 'userId': req.body.userId, 'postId': obj._id });
        // console.log(post_lists.length, 'post_lists data')
        if (post_lists.length > 0) {
            // console.log('INNNNNNN')
            obj.likeStatus = "1"
        }

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
        post_list.push(obj)
        return post_list;
    })
    if (postData.length > 0) {
        let finalPostList = await Promise.all(postData);
        return res.send({ 'status': 1, 'msg': "Post List Found successfully.", 'data': finalPostList[finalPostList.length - 1].reverse() });
    } else {
        return res.send({ 'status': 0, 'msg': "No Data Found", 'data': [] });
    }
}

exports.likePost = async function (req, res) {
    let userId = req.body.user_id;
    let postId = req.body.post_id;
    let status = req.body.status;
    var likeData = {
        "userId": userId,
        "postId": postId,
        "status": status
    }
    // console.log(likeData, 'line no.......331'); return false;
    if (status == "1") {
        new likeModel(likeData).save().then(data => {
            res.status(200).json({ 'status': 1, 'msg': 'Post Liked', 'data': data });
        });
    } else {
        likeModel.deleteOne({ $set: [{ 'userId': userId }, { 'postId': postId }] }).then(async data => {
            res.status(200).json({ 'status': 1, 'msg': 'Post Unliked', 'data': null });
        });
    }
}

exports.likePostData = async function (req, res) {
    var user_id = req.body._id
    const postData = await postModel.find({ 'status': 2});
    // console.log(postData, 'line no........334');return false;
    if (postData > 0) {
        pamars = postData.map(async (obj) => {
            // console.log(params, 'line no////338');return false;
            const post_lists = await likeModel.find({ 'user_id': user_id, 'post_id': obj.post_id }).count();
            console.log(pamars, 'line no......335')
            if (post_lists > 0) {
                obj.likeStatus = "1"
            }
            return post_list;
        })
        let likePostData = await Promise.all(pamars);
        // console.log(likePostData);
    }
}

exports.commentPost = async function (req, res) {
    var commentData = {
        comment: req.body.comment,
        user_id: mongoose.Types.ObjectId(req.body.user_id),
        post_id: mongoose.Types.ObjectId(req.body.post_id),
    }
    // console.log(commentData);return false;
    new commentModel(commentData).save().then(data => {
        res.status(200).json({ 'status': 1, 'msg': 'Comment Add Successfully', 'data': data });
    }).catch((error) => {
        console.log(error);
        res.status(400).json({ 'status': 0, 'msg': 'something went wrong', 'data': null });
    });
}

exports.commentList = (req, res) => {
    commentModel.find({ post_id: req.body.post_id }).exec(function (err, data) {
        if (err) {
            console.log("Line no 455", err);
            res.status(200).json({ 'status': 0, 'msg': 'something went wrong ', 'data': [] });
        }
        else {
            res.status(200).json({ 'status': 1, 'msg': 'Comment list fetched successfully', 'data': data });

        }
    })
}

exports.requestForVerification = (req, res) => {
    var userVariable = {
        username: req.body.username,
        countryName: req.body.countryName,
        category_id: req.body.category_id,
        user_id: mongoose.Types.ObjectId(req.body.user_id),
        document_name: req.body.document_name,
        document: req.file.filename,
    }
    if (req.body.document != undefined) {
        userVariable.document = req.files.document[0].filename;
    }
    console.log(userVariable, 'document')
    new verifyUserModel(userVariable).save().then(async data => {
        const userData = await userModel.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(req.body.user_id) }, { $set: { verificationStatus: "REQUESTED" } }).exec()
        res.status(200).json({ 'status': 1, 'meg': 'Requested Send Successfully, Wait for Admin Approval', 'data': data });
    })
}


exports.changeAccountStatus = async (req, res) => {
    const userData = await userModel.findOne({ _id: mongoose.Types.ObjectId(req.body.user_id) });
    if (userData.userAccount == "PRIVATE") {
        userModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.user_id) }, { $set: { userAccount: "PUBLIC" } }).then(async data => {
            res.status(200).json({ 'status': 1, 'msg': 'Account Status Changed Successfully', 'data': data });

        });
    } else {
        userModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.user_id) }, { $set: { userAccount: "PRIVATE" } }).then(async data => {
            res.status(200).json({ 'status': 1, 'msg': 'Account Status Changed Successfully', 'data': data });
        });
    }
}

var CurrentDate = moment().toISOString();
var today = CurrentDate;

exports.postStory = function (req, res) {
    let images = req.files.map((file, i) => {
        return file.filename;
    });
    var postDetail = {
        user_id: mongoose.Types.ObjectId(req.body.user_id),
        storyImg: images,
        time: today,
    }
    console.log(postDetail, 'postDeta')

    new storyModel(postDetail).save().then(data => {
        res.status(200).json({ 'status': 1, 'msg': 'Story Added Successfully', 'data': data });
    }).catch((error) => {
        console.log(error);
        res.status(400).json({ 'status': 0, 'msg': 'something went wrong', 'data': null });
    });
}

//exports.getStory =async (req, res) => {
    //const storyData = await storyModel.find({ });
        //var storyDataWithUrl = storyData.map(obj => {
        //for (i = 0; i < obj.storyImg.length; i++) {
            //obj.storyImg[i] = `${url.base_url}/${obj.storyImg[i]}`;
        //}
        //return obj;
    //})
        //res.status(200).json({ 'status': 1, 'msg': 'Story fetched successfully', 'data': storyData });
//}

exports.getStory = async (req, res) => {
    var data = await storyModel.aggregate([
        // {
        //     "$match": { user_id: mongoose.Types.ObjectId(req.body.user_id) }
        // },
       {
           "$project": {
               "pm": "$$ROOT"
           }
       },
       {
        $lookup: {
            from: "users",
            localField: "pm.user_id",
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
               "_id": "$pm._id",
               "userId": "$pm.user_id",
               "storyImg": "$pm.storyImg",
               "username": "$ui.username",
               "profileImage": "$ui.profileImage"
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
        for (i = 0; i < obj.storyImg.length; i++) {
            obj.storyImg[i] = `${url.base_url}/${obj.storyImg[i]}`;
        }
       return obj;
   })
   let finalDataList = await Promise.all(postData);
   res.status(200).json({ 'status': 1, 'msg': 'Video Detail fetch successfully', 'data': finalDataList });
}

exports.deleteStory = async function (req, res) {
    let userVariable = {
        _id: mongoose.Types.ObjectId(req.body._id),
    }
        const postData = await storyModel.findByIdAndDelete({ _id: userVariable._id }).then( data => {
    
            if(data) {
                res.status(200).json({ 'status': 1, 'message': 'Story Removed Successfully', 'data': [] });
            } else {
                res.status(200).json({ 'status': 0, 'message': 'Story Already Removed', 'data': [] });
            }
        }) 
    }

exports.testFcm = async function (req, res) {

    var data = {
        title: req.body.title,
        message: req.body.message,
        device_type: req.body.device_type,
        device_token: req.body.device_token,
        channel_name: req.body.channel_name,
        token: req.body.token,
        user_id: mongoose.Types.ObjectId(req.body.user_id)
    }
    console.log(data)
    const result = await send_fcm(data);
    console.log(data, "line no ..............2292");
    res.send({ 'status': 1, msg: " successfully done", data: data })
}

async function send_fcm(data) {
    var FCM = require('fcm-node');

    // subterra Server Key
    var serverKey = 'AAAAn84cB24:APA91bFICwcAzb2aWjsmfUvdxlt9WhufJsGUoBB1x8cqdfJFktgWSmzNSBM_kLB-OZZBllSZ-aEP42qzQEJlKLCw5wbDfLXLudh4eHP6tyvz4ctc1QOa1KQ_kWypP3FOQR7krxwb8XU9'
    var fcm = new FCM(serverKey);

    var sound = "";
    if (data.device_type == "ios" || data.device_type == 'web') {
        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            // to: "cCsxDrPASga8KyUQl2OSBY:APA91bGEp4EOEzlLMCvG90khbbY0WCK5rldQR32TiK5hLtbnjmnbutv7z7kKEzU1_5RETX7qr14kcvjlwTSr09aQdfa2ex4VqyqEJmAENHpMe-OlJpwA3uzcK2eQ_8QPvGBtEfPQmNAR",
            // to: "c2Pn2f1mvwg:APA91bHL8S0GPuW6xpeehUBo3zTE1XERnXFk84w44SjCit-i2osO5_yYQokoPGAr1tPmMgahSU-ESJcvB6Ti421mcyUT9MyUIiPI1Bf7ZuADlDQafM_FZg16o2K22caATMVdbsB36Gl1",
            to: data.device_token,
            device_type: data.device_type,
            channel_name: data.channel_name,
            token: data.token,
            user_id: data.user_id,
            // this to: 'dSe867oxRSqzUbwzXHUiPk:APA91bH5eizc9xm1H6rERG8vjEviWcQongGlrsewM48iCG2K7UEnTD8gL_7sLlzeYZJ2gtmmslu6xeY8aWmHfFU5BrURitLqmgTadJ_ib_1cMuy-G2uUgF0EQY2GBeHdEhURHs8c6he0',
            // to: 'd0z-UMGIwtuKgHsBK7O650:APA91bFSFFux4x7NlKojf3ZjZQyxr2_wkSsLMLDr2fvM0urqAG4dDCqbfdv3B4L1-tNqyCDVWmhphxYnhdsC04LS5Ny1tlvm_S5YEfxsxVz5AnyaLECsORffH3ZPGFQWidsNqrooBv5J',
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