const mongoose = require('mongoose')
const moment = require('moment')
const session_str = require('node-sessionstorage')

const role = require('../models/role')
const category = require('../models/categoryModel')
const postModel = require('../models/postModel')
const postedVideoModel = require('../models/postedVideoModel')
const userModel = require('../models/userModel')
const country = require('../models/country')
const businessType = require('../models/businessType')


// <================== Business Type API's ==========================>

exports.addBusinessType = async function (req, res, next) {
    var businesTypeData = {
        name: req.body.name,
    }
    let saveItem = new businessType(businesTypeData);
    saveItem.save().then(async doc => {
        req.flash('success', 'businessType Added Successfully');
        res.redirect('/businessType')
    }).catch((error) => {
        console.log(error);
        res.redirect('/error')
    });
}

exports.businessTypeList = async function (req, res, next) {
    businessType.find({}).sort({ createdAt: -1 }).exec().then(data => {
        res.locals = { title: 'businessType' };
        // var profileImage = req.user.profileImage;
        getUserDetails(session_str.getItem('session_id'), function (result) {
            console.log(result)
            if (session_str.getItem('role_id') === "2") {
                res.render('Admin/businessType', { data, moment })
            } else if (result.businessType === true) {
                res.render('Admin/businessType', { data, moment })
            } else if (result.businessType === false) {
                res.redirect('/error')
            }
        });
    }).catch(err => {
        console.log(err, 'error')
        res.send(500);
    })
}

exports.getBusinessTypeDetail = function (req, res, next) {
    businessType.findById({ _id: mongoose.Types.ObjectId(req.query._id) }).exec((err, data) => {
        console.log(req.query._id, 'line no.........122')
        console.log(data, 'line no.........49')
        if (data) {
            // businessType.find({ _id: mongoose.Types.ObjectId(data[0]._id) }).exec((err) => {
            var json = {
                data: data,
            }
            res.send(json)
        }
        else {
            res.send(data)
            res.redirect('/error')
        }
    })
}

exports.editBusinessType = async function (req, res, next) {
    console.log(userVariable, 'line no........56')
    var userVariable = {
        name: req.body.name,
    }
    var data = await businessType.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(req.body.id) }, { $set: userVariable })
    req.flash('success', 'businessType Edited Sucessfully')
    res.redirect('/businessType')
}

exports.deleteBusinessType = async function (req, res, next) {
    businessType.deleteOne({ _id: mongoose.Types.ObjectId(req.params.id) }).then(data => {
        req.flash('error', 'businessType deleted Successfully');
        res.redirect('/businessType')
    }).catch(err => {
        console.log(err, 'error in deleting businessType')
        res.redirect('/error')
    })
}

// <=========== Country API's ================>
exports.addCountry = async function (req, res, next) {
    var countryData = {
        name: req.body.name,
    }
    let saveItem = new country(countryData);
    saveItem.save().then(async doc => {
        req.flash('success', 'country Added Successfully');
        res.redirect('/country')
    }).catch((error) => {
        console.log(error);
        res.redirect('/error')
    });
}

exports.countryList = async function (req, res, next) {
    country.find({}).sort({ createdAt: -1 }).exec().then(data => {
        res.locals = { title: 'country' };
        // var profileImage = req.user.profileImage;
        getUserDetails(session_str.getItem('session_id'), function (result) {
            console.log(result)
            if (session_str.getItem('role_id') === "2") {
                res.render('Admin/country', { data, moment })
            } else if (result.country === true) {
                res.render('Admin/country', { data, moment })
            } else if (result.country === false) {
                res.redirect('/error');
            }
        });
    }).catch(err => {
        console.log(err, 'error')
        res.send(50);
    })
}

exports.getCountryDetail = function (req, res, next) {
    country.findById({ _id: mongoose.Types.ObjectId(req.query._id) }).exec((err, data) => {
        console.log(req.query._id, 'line no.........122')
        console.log(data, 'line no.........49')
        if (data) {
            // country.find({ _id: mongoose.Types.ObjectId(data[0]._id) }).exec((err) => {
            var json = {
                data: data,
            }
            res.send(json)
        }
        else {
            res.send(data)
            res.redirect('/error')
        }
    })
}

exports.editCountry = async function (req, res, next) {
    console.log(userVariable, 'line no........56')
    var userVariable = {
        name: req.body.name,
    }
    var data = await country.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(req.body.id) }, { $set: userVariable })
    req.flash('success', 'country Edited Sucessfully')
    res.redirect('/country')
}

exports.deleteCountry = async function (req, res, next) {
    country.deleteOne({ _id: mongoose.Types.ObjectId(req.params.id) }).then(data => {
        req.flash('error', 'country deleted Successfully');
        res.redirect('/country')
    }).catch(err => {
        console.log(err, 'error in deleting country')
        res.redirect('/error')
    })
}


// Category API's
exports.addCategory = async function (req, res, next) {
    var categoryData = {
        category: req.body.category,
    }
    let saveItem = new category(categoryData);
    saveItem.save().then(async doc => {
        req.flash('success', 'Category Added Successfully');
        res.redirect('/categoryList')
    }).catch((error) => {
        console.log(error);
        res.redirect('/error')
    });
}

exports.categoryList = async function (req, res, next) {
    category.find({}).sort({ createdAt: -1 }).exec().then(data => {
        res.locals = { title: 'Category' };
        // var profileImage = req.user.profileImage;
        getUserDetails(session_str.getItem('session_id'), function (result) {
            console.log(result)
            if (session_str.getItem('role_id') === "2") {
                res.render('Admin/category', { data, moment })
            } else if (result.categories === true) {
                res.render('Admin/category', { data, moment })
            } else if (result.categories === false) {
                res.redirect('/error');
;
            }
        });
    }).catch(err => {
        console.log(err, 'error')
        res.send(500);
    })
}

exports.getCategoryDetail = function (req, res, next) {
    category.findById({ _id: mongoose.Types.ObjectId(req.query._id) }).exec((err, data) => {
        console.log(req.query._id, 'line no.........122')
        console.log(data, 'line no.........49')
        if (data) {
            // category.find({ _id: mongoose.Types.ObjectId(data[0]._id) }).exec((err) => {
            var json = {
                data: data,
            }
            res.send(json)
        }
        else {
            res.redirect('/error')
        }
    })
}

exports.editCategory = async function (req, res, next) {
    console.log(userVariable, 'line no........56')
    var userVariable = {
        category: req.body.category,
    }
    var data = await category.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(req.body.id) }, { $set: userVariable })
    req.flash('success', 'Category Edited Sucessfully')
    res.redirect('/categoryList')
}

exports.deleteCategory = async function (req, res, next) {
    category.deleteOne({ _id: mongoose.Types.ObjectId(req.params.id) }).then(data => {
        req.flash('error', 'Category deleted Successfully');
        res.redirect('/categoryList')
    }).catch(err => {
        console.log(err, 'error in deleting Category')
        res.redirect('/error')
    })
}

// Post API's

exports.newPost = async function (req, res, next) {
    var data = await postModel.aggregate([
        {
            "$match": { 'status': "1" }
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
                as: "usr"
            }
        },
        {
            "$unwind": {
                "path": "$usr",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            $lookup: {
                from: "categories",
                localField: "pm.category_id",
                foreignField: "_id",
                as: "ct"
            }
        },
        {
            "$unwind": {
                "path": "$ct",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$project": {
                "caption": "$pm.caption",
                "postImage": "$pm.postImage",
                "username": "$usr.username",
                "category": "$ct.category",
                "date": "$pm.date",
            }
        }
    ])
        .then(async data => {
            getUserDetails(session_str.getItem('session_id'), function (result) {
                console.log(result)
                if (session_str.getItem('role_id') === "2") {
                    res.render('Admin/newPost', { data, moment })
                } else if (result.newPost === true) {
                    res.render('Admin/newPost', { data, moment })
                } else if (result.newPost === false) {
                    res.redirect('/error')
;
                }
            });
        }).catch(err => {
            console.log(err, 'error')
            res.redirect('/error')
            res.send(500);
        })
}

exports.getPostData = async function (req, res, next) {
    const data = await postModel.aggregate([
        {
            "$match": { "_id": mongoose.Types.ObjectId(req.query._id) }
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
                as: "usr"
            }
        },
        {
            "$unwind": {
                "path": "$usr",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            $lookup: {
                from: "categories",
                localField: "pm.category_id",
                foreignField: "_id",
                as: "ct"
            }
        },
        {
            "$unwind": {
                "path": "$ct",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$project": {
                "caption": "$pm.caption",
                "postImage": "$pm.postImage",
                "username": "$usr.username",
                "phoneNumber": "$usr.phoneNumber",
                "category": "$ct.category",
                "date": "$pm.date",
            }
        }
    ])
    console.log(data, 'line no.........199')
    if (data.length > 0) {
        console.log(data, 'line no.......................20.4')
        var json = {
            data: data[0],
        }
        res.send(json)
    }
    else {
        res.send(data[0])
        res.redirect('/error')
    }
}

exports.approve = async function (req, res, next) {
    try {
        postModel.updateOne({ _id: mongoose.Types.ObjectId(req.query.id) }, { $set: { 'status': 2 } }).then(data => {
            console.log(data);
            req.flash('success', 'Post Approved Successfully')
            res.redirect('/newPost')
        });
    }
    catch (err) {
        console.log(err, 'error')
        rres.redirect('/error')
    }
}


exports.deleteNewPost = async function (req, res, next) {
    postModel.deleteOne({ _id: mongoose.Types.ObjectId(req.params.id) }).then(data => {
        req.flash('error', 'Post Deleted Successfully');
        res.redirect('/newPost')
    }).catch(err => {
        console.log(err, 'error in deleting Post')
        res.redirect('/error')
    })
}

exports.approvePost = async function (req, res, next) {
    var data = await postModel.aggregate([
        {
            "$match": { 'status': "2" }
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
                as: "usr"
            }
        },
        {
            "$unwind": {
                "path": "$usr",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            $lookup: {
                from: "categories",
                localField: "pm.category_id",
                foreignField: "_id",
                as: "ct"
            }
        },
        {
            "$unwind": {
                "path": "$ct",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$project": {
                "caption": "$pm.caption",
                "postImage": "$pm.postImage",
                "username": "$usr.username",
                "category": "$ct.category",
                "date": "$pm.date",
            }
        }
    ])
        .then(async data => {
            getUserDetails(session_str.getItem('session_id'), function (result) {
                console.log(result)
                if (session_str.getItem('role_id') === "2") {
                    res.render('Admin/approvePost', { data, moment })
                } else if (result.approvePost === true) {
                    res.render('Admin/approvePost', { data, moment })
                } else if (result.approvePost === false) {
                    res.redirect('/error');

                }
            });
        }).catch(err => {
            res.redirect('/error')
            console.log(err, 'error')
            res.send(500);
        })
}

exports.deleteApprovePost = async function (req, res, next) {
    postModel.deleteOne({ _id: mongoose.Types.ObjectId(req.params.id) }).then(data => {
        req.flash('error', 'Post Deleted Successfully');
        res.redirect('/ApprovePost')
    }).catch(err => {
        console.log(err, 'error in deleting Post')
        res.redirect('/error')

    })
}

// User API's
exports.users = async function (req, res, next) {
    userModel.find({ role: 0 }).sort({ createdAt: -1 }).exec().then(data => {
        res.locals = { title: 'Category' };
        // var profileImage = req.user.profileImage;
        getUserDetails(session_str.getItem('session_id'), function (result) {
            console.log(result)
            if (session_str.getItem('role_id') === "2") {
                res.render('Admin/users', { data, moment })
            } else if (result.newUser === true) {
                res.render('Admin/users', { data, moment })
            } else if (result.newUser === false) {
                res.redirect('/error');
            }
        });
    }).catch(err => {
        console.log(err, 'error')
        res.redirect('/error')
        res.send(500);
    })
}

exports.getUserData = async function (req, res, next) {
    userModel.find({ _id: mongoose.Types.ObjectId(req.query._id) }).exec((err, data) => {
        console.log(data, 'line no................225')
        if (data.length > 0) {
            userModel.find({ _id: mongoose.Types.ObjectId(data[0]._id) }).exec((err, userData) => {
                console.log(userData, 'line no.......................228')
                var json = {
                    data: data[0],
                    userData: userData[0]
                }
                res.send(json)
            })
        }
        else {
            res.send(data[0])
            res.redirect('/error')
        }
    })
}

exports.deleteUsers = async function (req, res, next) {
    userModel.findByIdAndDelete({ _id: mongoose.Types.ObjectId(req.params.id) }).then(async data => {
        const postData = await postModel.deleteMany({ user_id: data._id });
        const postedVideoData = await postedVideoModel.deleteMany({ user_id: data._id });
        req.flash('error', 'User Deleted Successfully');
        res.redirect('/users')
    }).catch(err => {
        console.log(err, 'error in deleting User')
        res.redirect('/error')
    })
}

exports.businessUsers = async function (req, res, next) {
    userModel.find({ role: 1 }).sort({ createdAt: -1 }).exec().then(data => {
        res.locals = { title: 'Category' };
        // var profileImage = req.user.profileImage;
        getUserDetails(session_str.getItem('session_id'), function (result) {
            console.log(result)
            if (session_str.getItem('role_id') === "2") {
                res.render('Admin/businessUsers', { data, moment })
            } else if (result.businessUsers === true) {
                res.render('Admin/businessUsers', { data, moment })
            } else if (result.businessUsers === false) {
                res.redirect('/error');
            }
        });
    }).catch(err => {
        console.log(err, 'error')
        res.redirect('/error')
        res.send(500);
    })
}

exports.deleteBusinessUsers = async function (req, res, next) {
    userModel.findByIdAndDelete({ _id: mongoose.Types.ObjectId(req.params.id) }).then(async data => {
        const postData = await postModel.deleteMany({ user_id: data._id });
        const postedVideoData = await postedVideoModel.deleteMany({ user_id: data._id });
        req.flash('error', 'User Deleted Successfully');
        res.redirect('/users')
    }).catch(err => {
        console.log(err, 'error in deleting User')
        res.redirect('/error')
    })
}

function getUserDetails(roleId, callback) {
    var user = {};
    role.find({ user_id: mongoose.Types.ObjectId(roleId) }).exec(function (err, roles) {
        if (err) { return next(err); }
        callback(roles[0]);
    });
}
