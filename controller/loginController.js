var user = require('../models/userModel');
const bcrypt = require('bcryptjs');
const session_str = require('node-sessionstorage')
const mongoose = require('mongoose')
const moment = require('moment')
const role = require('../models/role');
const postModel = require('../models/postModel')
const postedVideoModel = require('../models/postedVideoModel')
var SALT_FACTOR = 10;

function comparePassword(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        console.log("user model line no 69 isMatch", isMatch)
        callback(null, isMatch);
    });
};

exports.login = async function (req, res, next) {
    if (session_str.setItem('session_id')) {
        // req.flash('success', 'Login Succesfuly');
        res.redirect('/');
    } else {
        // req.flash('error', 'Invalid Credential');
        res.render('Auth/login');
    }
}
exports.changePasswordPage = function (req, res, next) {
    res.locals = { title: 'change Password' };
    res.render('Admin/changePassword');
}

exports.changePassword = async function (req, res, next) {
    console.log(session_str.getItem('email'), 'line no. 211')
    user.find({ email: session_str.getItem('email') }).exec().then(data => {
        console.log(data, 'line no....24')
        if (data.length > 0) {
            if (req.body.old_password) {
                comparePassword(req.body.old_password, data[0].password, function (err, isMatch) {
                    console.log(isMatch, 'line no........218')
                    if (isMatch) {
                        bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
                            if (err) {
                                console.log(err);
                                return done(err);
                            }
                            bcrypt.hash(req.body.pwd1, salt, function (err, hashedPassword) {
                                if (err) {
                                    return done(err);
                                }

                                user.password = hashedPassword;
                                var Variables = {
                                    password: user.password,
                                };
                                console.log(Variables, hashedPassword, req.body.pwd1, salt, 'line no.......231');
                                user.update({ _id: session_str.getItem('session_id') }, Variables, function (err, raw) {
                                    req.flash('success', 'Password Change Successfully');
                                    res.render('Auth/login');
                                })
                            });
                        });
                    }
                    else {
                        res.locals = { title: 'change Password' };
                        res.render('Auth/login');
                    }
                })
            }
            else {
                bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
                    if (err) {
                        console.log(err);
                        return done(err);
                    }
                    bcrypt.hash(req.body.pwd1, salt, noop, function (err, hashedPassword) {
                        if (err) { return done(err); }

                        let password = hashedPassword;
                        var Variables = {
                            password: password,
                        };
                        user.update({ _id: session_str.getItem('session_id') }, Variables, function (err, raw) {
                            if (err) {
                                console.log(err)
                                res.locals = { title: 'login' };
                                res.render('Auth/login');
                            }
                            else {
                                res.locals = { title: 'login' };
                                res.render('Auth/login');
                            }
                        })
                    });
                });
            }
        }
    })
}

//<<<<<<<<<<<<<<<<<< Verification Api's >>>>>>>>>>>>>>>>>>>>>>>

exports.verificationRequest = async function (req, res, next) {
    user.find({verificationStatus: "REQUESTED"}).sort({ createdAt: -1 }).exec().then(data => {
        var profileImage = session_str.getItem('profileImage');
        getUserDetails(session_str.getItem('session_id'), function (result) {
            console.log(result)
            if (session_str.getItem('role_id') === "2") {
                res.render('Admin/newVerificationRequest', { data, moment })
            } else if (result.newVerificationRequest === true) {
                res.render('Admin/newVerificationRequest', { data, moment })
            } else if (result.newVerificationRequest === false) {
                res.render('Admin/404');
            }
        });
    }).catch(err => {
        console.log(err, 'error')
        res.send(500);
    })
}

exports.deleteUser = async function (req, res, next) {
    user.findByIdAndDelete({ _id: mongoose.Types.ObjectId(req.params.id) }).then(async data => {
        const postData = await postModel.deleteMany({ user_id: data._id });
        const postedVideoData = await postedVideoModel.deleteMany({ user_id: data._id });
        req.flash('error', 'user deleted Successfully');
        res.redirect('/verificationRequest')
    }).catch(err => {
        console.log(err, 'error in deleting user')
        res.redirect('/verificationRequest')
    })
}

exports.verifyUser = async function (req, res, next) {
    try {
        user.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(req.query.id) }, { $set: { verificationStatus: "VERIFIED" } }).then(async data => {
            req.flash('success', 'User Approved successfully');
            console.log(data);
            res.redirect('/verificationRequest')
        })
    } catch (err) {
        console.log(err, 'error')
        res.redirect('/verificationRequest')
    }
}

exports.verifiedUsers = async function (req, res, next) {
    user.find({ verificationStatus: "VERIFIED" }).sort({ createdAt: -1 }).exec().then(data => {
        // var profileImage = req.user.profileImage;
        getUserDetails(session_str.getItem('session_id'), function (result) {
            console.log(result)
            if (session_str.getItem('role_id') === "2") {
                res.render('Admin/verifiedUser', { data, moment })
            } else if (result.verifiedUser === true) {
                res.render('Admin/verifiedUser', { data, moment })
            } else if (result.verifiedUser === false) {
                res.render('Admin/404');
            }
        });
    }).catch(err => {
        console.log(err, 'error')
        res.send(500);
    })
}

exports.deleteVerifiedUser = async function (req, res, next) {
    user.findByIdAndDelete({ _id: mongoose.Types.ObjectId(req.params.id) }).then(async data => {
        const postData = await postModel.deleteMany({ user_id: data._id });
        const postedVideoData = await postedVideoModel.deleteMany({ user_id: data._id });
        req.flash('error', 'User deleted Successfully');
        res.redirect('/verifiedUsers')
    }).catch(err => {
        console.log(err, 'error in deleting user')
        res.redirect('/verifiedUsers')
    })
}

exports.getUser = async function (req, res, next) {
    user.find({ _id: mongoose.Types.ObjectId(req.query._id) }).exec((err, data) => {
        if (data) {
            user.find({ _id: mongoose.Types.ObjectId(data[0]._id) }).exec((err) => {
                var json = {
                    data: data[0],
                }
                res.send(json)
                console.log(json, 'lin executable')
            })
        }
        else {
            res.send(data[0])
        }
    })
}

exports.updateUserStatus = function (req, res, next) {
    var url = req.params.url;
    if (req.params.status == 1) {
        console.log("true")
        var status = true;
    }
    else {
        console.log("false")
        var status = false;
    }

    user.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(req.query.id) }, { $set: { status } }, { new: true }, function (err, docs) {
        if (err) {
            console.log(err)
        }
        else {
            console.log("Updated Docs : ", docs);
            res.redirect(`/${url}`)

        }
    })
}

function getUserDetails(roleId, callback) {
    var user = {};
    role.find({ user_id: mongoose.Types.ObjectId(roleId) }).exec(function (err, roles) {
        if (err) { return next(err); }
        callback(roles[0]);
    });
}