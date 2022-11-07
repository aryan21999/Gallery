const mongoose = require('mongoose');
const user = require('../models/userModel');
const post = require('../models/postModel')
const category = require('../models/categoryModel')
const role = require('../models/role');
const session_str = require('node-sessionstorage')

exports.dashboard = async function (req, res, next) {
  var users = await user.count({ role: 2 }).exec();
  var businessUsers = await user.count({ role: 1 }).exec();
  var postList = await post.count({  }).exec();
  var approvePostList = await post.count({ status: 2 }).exec();
  var categoryList = await category.find({  }).countDocuments();

  console.log(session_str.getItem('session_id'), 'line no........15')
  console.log(session_str.getItem('role_id'), 'line no........16')

  getUserDetails(session_str.getItem('session_id'), function (result) {
    console.log(session_str.getItem('session_id'), 'line no.......1.9')
    if(session_str.getItem('role_id') === "2"){
      res.render('Admin/dashboard', {users, businessUsers, approvePostList, postList, categoryList})
    }else if(result.dashboard === true) {
      res.render('Admin/dashboard', {users, businessUsers, approvePostList, postList, categoryList})
    }else if(result.dashboard === false) {
        res.redirect('/error');
    }
  });
}

function getUserDetails(roleId, callback) {
  var user = {};
  role.find({user_id: mongoose.Types.ObjectId(roleId)}).exec(function (err, roles) {
          if (err) { return next(err); }
          callback(roles[0]);
      });
}
