const mongoose = require('mongoose');
const moment = require('moment')

const user = require('../models/userModel')
const role = require('../models/role');
const bcrypt = require('bcryptjs');
const Roles = require('../models/role');
const session_str = require('node-sessionstorage')

exports.profile = async function (req, res, next) {
    var profileImage = session_str.getItem('profileImage');
    try {
        let getUser = await user.find({ _id: session_str.getItem('session_id') }).exec();
        console.log(getUser[0], 'line no................12')
        res.locals = { title: 'Profile' };
        res.render('Admin/profile', { getUser: getUser, profileImage });
    } catch (err) {
        res.send(err, 500)
    }
}

exports.editProfile = async function (req, res, next) {
    // console.log(session_str.getItem('profileImage'), 'IN');return false;
    var profileImage = session_str.getItem('profileImage');
    var userVariable = {};
    if (req.file == ' ' || req.file == null) {
        userVariable = {
            username: req.body.username,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            // password: req.body.password
        }
    }
    else {
        userVariable = {
            username: req.body.username,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            // password: req.body.password,
            profileImage: req.file.filename
        }
    }
    console.log(userVariable, "line on.........106")

    var editUserData = await user.updateOne({ _id: mongoose.Types.ObjectId(session_str.getItem('session_id')) }, { $set: userVariable })

    var getUserData = await user.findOne({ _id: mongoose.Types.ObjectId(session_str.getItem('session_id')) }).exec();
    if (editUserData.length > 0) {
        console.log(editUserData, 'line no.....112');
        res.locals = { title: 'Profile' };
        req.flash('error', 'Invalid Data')
        res.redirect('/profile');
    }
    else {
        req.flash('success', 'Profile Updated Successfully')
        res.redirect('/profile');
    }
}

exports.subadminList = async function (req, res, next) {
    user.find({ role: 3 }).sort({ createdAt: -1 }).exec().then(data => {
        res.locals = { title: 'sub-Admin' };
        var profileImage = session_str.getItem('profileImage')
        getUserDetails(session_str.getItem('session_id'), function (result) {
            console.log(result)
            if (session_str.getItem('role_id') === "2") {
                res.render('Admin/subadmin', { data, moment });
            } else if (result.subAdmin === true) {
                res.render('Admin/subadmin', { data, moment });
            } else if (result.subAdmin === false) {
                res.redirect('/error');
            }
        });
    }).catch(err => {
        console.log(err, 'error')
        res.redirect('/error')
        res.send(500);
    })
}

exports.addSubadmin = async function (req, res, next) {
    console.log('line no.79****************')
    console.log(req.body.username)
    var json = {
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password),
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        role: 3
    }
    if (req.file) {
        json.profileImage = req.file.filename
    }
    console.log(json, 'dssdsdsdf')

    user.count({ "$or": [{ email: req.body.email }, { phoneNumber: req.body.phoneNumber }] }).exec().then(data => {
        console.log(data, 'count ++++++')

        if (data < 1) {
            let addSubadmin = new user(json);
            console.log(addSubadmin)
            addSubadmin.save().then(async function (data) {
                console.log(data, 'here******************');
                try {
                    let subadminData = await new role({ user_id: mongoose.Types.ObjectId(data._id), updatedby: mongoose.Types.ObjectId(session_str.getItem('session_id')) }).save()
                    console.log(subadminData, 'subadminData')
                    req.flash('success', 'subadmin added successfully');
                    res.redirect('/subadmin')
                }
                catch (err) {
                    req.flash('error', 'added new subadmin');

                    console.log(err, 'error is here added subadmin');
                    res.redirect('/subadmin')
                }
            }).catch(err => {
                req.flash('error', err);

                res.redirect('/subadmin')
            });
        }
        else {
            req.flash('error', 'email or number already registered ');

            res.redirect('/subadmin')
        }
    }).catch(err => {
        req.flash('error', 'something went wrong');

        console.log(err, 'error is here added subadmin');
        res.redirect('/subadmin')
    })
}



exports.editSubadminDetail = async function (req, res, next) {
    console.log(req.query.id)
    let editDetails = await user.find({ _id: mongoose.Types.ObjectId(req.query.id) }).exec()
    res.send({ editDetails: editDetails[0] })

}

exports.saveEditSubadmin = async function (req, res, next) {
    var profileImage = session_str.getItem('profileImage')

    if (req.file == " " || req.file == undefined) {
        var json = {
            username: req.body.username,
            email: req.body.email,
            phoneNumber: req.body.number,
        }
    }
    else {
        var json = {
            username: req.body.username,
            email: req.body.email,
            phoneNumber: req.body.number,
            profileImage: req.file.filename,
        }
    }
    user.updateOne({ _id: mongoose.Types.ObjectId(req.body.editId) }, { $set: json }).then(async function (data) {
        req.flash('success', 'Updated subadmin Successfully');
        res.redirect('/subadmin')
    }).catch(err => {
        // req.flash('error', 'updated subadmin');
        res.redirect('/error')
    })
}

exports.permissionUser = async function (req, res, next) {
    var module = req.query.module;
    // console.log(req.query.module, 'line no.......211' )
    var input = {
        updatedby: session_str.getItem('session_id'),
    };
    // console.log(req.user._id, 'line no......215')
    input[module] = req.query.value;
    var options = {
        new: true,
        upsert: true,
    };
    console.log(req.query.value, 'line no.......222')
    Roles.updateOne({ user_id: mongoose.Types.ObjectId(req.query.user_id) }, input, options).then(function (docs) {
        res.status(200).json({
            collections: docs
        });
    }).catch(function (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}

exports.assignRole = async function (req, res, next) {
    res.locals = { title: 'permission' };
    // var profileImage = req.user.profileImage;
    var usersList = await user.find({ _id: mongoose.Types.ObjectId(req.params.id) }).exec();
    var userRoleDetail = await role.find({ user_id: usersList[0]._id }).exec();
    console.log(userRoleDetail, 'line no........242')
    res.render('Admin/permission', { usersList, userRoleDetail });
}

exports.deleteSubadmin = function (req, res, next) {
    role.deleteOne({ user_id: mongoose.Types.ObjectId(req.params.id) }).exec().then(data => {
        user.deleteOne({ _id: mongoose.Types.ObjectId(req.params.id) }).exec().then(user => {
            req.flash('error', 'Subadmin deleted Successfully');
            res.redirect('/subadmin')
        }).catch(err => {
            // req.flash('error', 'something went wrong');

            res.redirect('/subadmin')

        })
    }).catch(err => {
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
