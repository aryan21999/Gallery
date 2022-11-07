const router = require('express').Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const session_str = require('node-sessionstorage')
const bcrypt = require('bcrypt')


const users = require('./models/userModel')
const app = require('./controller/app/appController');
const auth = require('./controller/app/authController')
const user = require('./controller/app/userController')
const dashboardController = require('./controller/dashboardController')
const postController = require('./controller/postController')
const authController = require('./controller/loginController')
const profile = require('./controller/subadminController')


exports.login = async function(req,res){
    try{
        var username = req.body.username;
        var password = req.body.password;
        const users = await user.findOne({$or: [{email: req.body.username},{mobile: req.body.username}]});
        if (users) {
            const validPassword = await bcrypt.compare(password, users.password);
            if (validPassword) {
                res.status(200).json({ 'status': 200, message: "Login successfully", 'data': users });
            } else {
                res.status(500).json({ 'status': 500, error: "Invalid Password", 'data': null });
            }
        }else{
            res.status(500).json({ 'status': 500, error: "User Not Exist", 'data': null });
        }
    }catch(error){
        res.send({ 'status': 500, 'msg': 'something went wrong', 'data': null });
    }
}

router.post('/login', async function (req, res) {

    const query = { $and: [{ $or: [{ "role": "2" }, { "role": "3" }] }, { $or: [{ email: req.body.username }, { phoneNumber: req.body.username }] }] }
    const data = await users.findOne(query);
    console.log(data, 'line no...........38')
    if (data) {
        const validPassword = await bcrypt.compare(req.body.password, data.password, function (err, isMatch) {
        // compare(req.body.password, data.password, function (err, isMatch) {
            console.log(isMatch, 'line no.....42')
            if (isMatch) {
                session_str.setItem('session_id', data._id)
                session_str.setItem('profileImage', data.profileImage)
                session_str.setItem('username', data.username)
                session_str.setItem('email', data.email)
                session_str.setItem('phoneNumber', data.phoneNumber)
                session_str.setItem('role_id', data.role)
                res.redirect("/dashboard")

                // console.log(session_str.getItem('profileImage'), 'IN')
            }
            else { 
                // req.flash("error", "Invalid Credential");
                res.redirect('/login')
                console.log('OUT')
            }
        })
    } else {
        // req.flash("error", "Username is wrong");
        res.redirect("/login")
        console.log('IN')
    }

});


function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    console.log(bearerHeader, typeof bearerHeader, req.headers)
    if (typeof bearerHeader !== 'undefined') {
        console.log('hsjj')
        const bearer = bearerHeader.split(' ');
        const beareTOKEN = bearer[1];
        jwt.verify(beareTOKEN, 'testing', (err, authData) => {
            if (err) {
                console.log(err)
                res.sendStatus(400)
            }
            else {
                req.auth = authData;
                console.log(req.auth)
                next();
            }
        })
    } else {
        res.sendStatus(403)
    }
}

function requireLogin(req, res, next) {
    if (session_str.getItem('session_id')) {
        return next();
    } else {
        res.locals = { title: 'pages-blank' };
        // req.flash('error','Please Login');
        res.redirect('/login');
    }
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './upload')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
});
var upload = multer({ storage: storage });


//****************************************    ADMIN ROUTES   ****************************************** */
router.get('', authController.login, function (req, res) {
    res.render('Auth/login')
});

router.get('/login', authController.login)
router.get('/dashboard', requireLogin, dashboardController.dashboard);

router.get('/profile', requireLogin, profile.profile);
router.post('/editProfile',requireLogin,  upload.single('picture'), profile.editProfile);
router.post('/changePassword',requireLogin,authController.changePassword);
router.get('/changePassword',requireLogin, authController.changePasswordPage);

router.get('/newPost', requireLogin, postController.newPost);
router.get('/approve', requireLogin, postController.approve);
router.get('/getPostData', requireLogin, postController.getPostData);
router.get('/ApprovePost', requireLogin, postController.approvePost);
router.get('/deleteNewPost/:id', requireLogin, postController.deleteNewPost);
router.get('/deleteApprovePost/:id', requireLogin, postController.deleteApprovePost);

router.get('/users', requireLogin, postController.users);
router.get('/deleteUsers/:id', requireLogin, postController.deleteUsers);
router.get('/getUserData', requireLogin, postController.getUserData)
router.get('/businessUsers', requireLogin, postController.businessUsers);
router.get('/deleteBusinessUsers/:id', requireLogin, postController.deleteBusinessUsers)

router.post('/addCategory', requireLogin, postController.addCategory);
router.get('/getCategoryDetail', requireLogin, postController.getCategoryDetail)
router.post('/editCategory', requireLogin, postController.editCategory)
router.get('/categoryList', requireLogin, postController.categoryList);
router.get('/delete_category/:id', requireLogin, postController.deleteCategory);

router.post('/addBusinessType', requireLogin, postController.addBusinessType);
router.get('/getBusinessTypeDetail', requireLogin, postController.getBusinessTypeDetail)
router.post('/editBusinessType', requireLogin, postController.editBusinessType)
router.get('/businessType', requireLogin, postController.businessTypeList);
router.get('/deleteBusinessType/:id', requireLogin, postController.deleteBusinessType);

router.post('/addCountry', requireLogin, postController.addCountry);
router.get('/getCountryDetail', requireLogin, postController.getCountryDetail)
router.post('/editCountry', requireLogin, postController.editCountry)
router.get('/country', requireLogin, postController.countryList);
router.get('/deleteCountry/:id', requireLogin, postController.deleteCountry);

router.get('/subadmin', requireLogin, profile.subadminList);
router.post('/saveSubadmin', requireLogin, upload.single('picture'), profile.addSubadmin);
router.get('/editSubadmin', requireLogin, profile.editSubadminDetail);
router.get('/permissionUser', requireLogin, profile.permissionUser);
router.get('/permission:id', requireLogin, profile.assignRole);
router.post('/saveEditSubadmin', requireLogin, upload.single('picture'), profile.saveEditSubadmin);
router.get('/deleteSubadmin:id', requireLogin, profile.deleteSubadmin);

router.get('/verificationRequest', requireLogin, authController.verificationRequest);
router.get('/verifyUser', requireLogin, authController.verifyUser);
router.get('/verifiedUsers', requireLogin, authController.verifiedUsers);
router.get('/getUser', requireLogin, authController.getUser)
router.get('/deleteUser/:id', requireLogin, authController.deleteUser)
router.get('/deleteVerifiedUser/:id', requireLogin, authController.deleteVerifiedUser)
router.get('/updateUserStatus/:url/:status', requireLogin, authController.updateUserStatus);

router.get('/error', function(req, res) {
    res.render('Admin/404')
})

router.get('/logout', function (req, res, next) {
    if (req.session) {
        console.log(req.session, 'line no.....157')
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
                console.log('INN')
                console.log(err, 'hjghgh')
                return next(err);
            } else {
                console.log('OUT')
                res.redirect('/');
            }
        });
    }
});

//****************************************    USER ROUTES   ****************************************** */

router.post('/api/register', auth.register); 
router.get('/api/registrationList', auth.registrationList);
router.post('/api/login', auth.login); 
router.post('/api/change_password', verifyToken, user.changePassword);
router.post('/api/forgotPassword', user.forgotpassword);
router.post('/api/sendOtp', app.sendOtp);
router.post('/api/edit_profile', upload.single('profileImage'), user.editProfile);
router.post('/api/viewUserDetail', user.viewUserDetail);
router.post('/api/userDetail', user.userDetail);
router.post('/api/userCategory', user.userCategory);
router.post('/api/changeAccountStatus', user.changeAccountStatus)
router.post('/api/requestForVerification', upload.single('document'), user.requestForVerification)

router.post('/api/follower', app.follower)
router.post('/api/following', app.following)

router.post('/api/userList', app.userList)
router.post('/api/userData', app.userData)

router.post('/api/dashboard', app.dashboard)
router.post('/api/search', app.search)
router.post('/api/postHistory', app.postHistory)

router.post('/api/notificationList', app.notificationList)
router.post('/api/categoryList', app.categoryList)

router.post('/api/addAboutUs', app.addAboutUs)
router.post('/api/addContactUs', app.addContactUs)
router.post('/api/contactUs', app.contactUs)
router.post('/api/aboutUs', app.aboutUs)

router.post('/api/generateToken', auth.generateToken)
router.post('/api/sendJoinRequest', auth.sendJoinRequest)
router.post('/api/sendInvitation', auth.sendInvitation)
router.post('/api/goLive', auth.goLive)

// Post API's
router.post('/api/addPost', upload.array('postImage', 10), user.addPost);
router.post('/api/likePost', user.likePost);
router.post('/api/likePostData', user.likePostData);
router.post('/api/commentPost', user.commentPost);
router.post('/api/commentList', user.commentList)
router.post('/api/postList', user.postList);
router.post('/api/postDetail', user.postDetail);
router.post('/api/postStory', upload.array('storyImg', 10), user.postStory);
router.post('/api/getStory', user.getStory);
router.post('/api/deleteStory', user.deleteStory);

// <<<<<<<<<<< Video Post Api's >>>>>>>>>>>>>>
router.post('/api/postVideo', upload.single('postedVideo'), user.postVideo);
router.post('/api/postedVideoDetail', user.postedVideoDetail)
router.post('/api/videoDetail', user.videoDetail)
router.post('/api/postedVideos', user.postedVideos)
router.post('/api/likeVideo', user.likeVideo);
router.post('/api/likeVideoData', user.likeVideoData);
router.post('/api/commentVideo', user.commentVideo);
router.post('/api/commentVideoList', user.commentVideoList)

router.post('/api/joinUser', auth.joinUser)

router.post('/api/testFcm', user.testFcm)


router.get('/privacypolicy', function(req, res) {
    res.render('Admin/privacyPolicy')
})

router.get('/term&Condition', function(req, res) {
    res.render('Admin/term')
})

module.exports = router;