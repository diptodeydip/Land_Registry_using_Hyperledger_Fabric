var express = require('express');
var router = express.Router();
var enrollAdmin = require('./call_functions/enrollAdmin');
// var registerUserManually = require('./call_functions/registerUser1');
var registerUser = require('./call_functions/350/registerUser');
// var query = require('./call_functions/query');
//var getHistory = require('./call_functions/getHistory');
// var dlt = require('./call_functions/delete');
// var invoke= require('./call_functions/invoke');
var createUser= require('./call_functions/350/createUser');
var checkNid= require('./call_functions/350/checkNid');
var queryUser = require('./call_functions/350/queryUser');
var editUserInfo= require('./call_functions/350/editUserInfo');
var editUserDp = require('./call_functions/350/editUserDp');

//multer related to image uploadling
const multer = require('multer');
/////////////Image Uploading prerequisite////////////////
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/user/uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/gif') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});
///////////////////////////



router.get('/enrollAdmin', function(req, res, next) {
  enrollAdmin();
  res.send('Admin created');
});



//////User Login & Register related routes //////////////


/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.NID) res.redirect('/user/profile');
  else{
  enrollAdmin();
  var obj = {success: req.session.success, error: req.session.error, title: '350 Login'};
  //var obj = { title: '350 Login' , Array:['First Element',2,3] , check: req.session.flag , obj1:{t:1} };
  req.session.success = false;
  req.session.error = false;
   res.render('index', obj);
  }
});

//login system
router.post('/login',async function(req, res, next) {
  var result = await queryUser(req.body.NID);
  
  if(result == ""){
    req.session.error = true;
    res.redirect('/user');
  }else{
      var obj = JSON.parse(result);
      if(obj.Password == req.body.password){
        req.session.USERNAME = obj.Name;
        req.session.NID = req.body.NID;
        res.redirect('/user/profile');
      }else{
        req.session.error = true;
        res.redirect('/user');
      }
  }
  //res.send(result);
});
router.get('/profile',async function(req, res, next) {
  if(req.session.NID == null)res.redirect('/user');
  else{
  var result = await queryUser(req.session.NID);
  var obj = JSON.parse(result);
  var notifications = {N:obj.Notification , S: obj.SentRequest , R: obj.ReceivedRequest};
  res.render('Profile', { title: 'Profile' ,success: req.session.success, obj: obj , NID: req.session.NID , USERNAME: req.session.USERNAME,
   notifications:notifications , Check: true});
  req.session.success = false;
}
});

router.get('/editInfo',async function(req, res, next) {
  if(req.session.NID == null)res.redirect('/user');
  else{
  var result = await queryUser(req.session.NID);
  var obj = JSON.parse(result);
  var notifications = {N:obj.Notification , S: obj.SentRequest , R: obj.ReceivedRequest};

  res.render('editInfo', { title: 'Edit Info', passerror: req.session.passerror , obj: obj , NID: req.session.NID , USERNAME: req.session.USERNAME, notifications:notifications});
  req.session.passerror = false;
}
});

router.post('/updateInfo', async function(req, res, next) {
  var passerror = false;
  if(req.body.confirmpassword != req.body.password)  passerror = true;

  if(passerror){
    req.session.passerror = passerror;
    res.redirect('/user/editInfo');
  }
  else{
    req.session.success = true;
    req.session.USERNAME = req.body.username;
    await editUserInfo(req.body.username, req.body.password ,req.body.email, req.session.NID);
    //res.send(path);
    res.redirect('/user/profile');
  }
});


router.get('/editDp',async function(req, res, next) {
  if(req.session.NID == null)res.redirect('/user');
  else{
  var result = await queryUser(req.session.NID);
  var obj = JSON.parse(result);
  var notifications = {N:obj.Notification , S: obj.SentRequest , R: obj.ReceivedRequest};
  res.render('editDp', { title: 'Edit Dp',  NID: req.session.NID , USERNAME: req.session.USERNAME, notifications:notifications});
}
});

router.post('/UpdateDp',upload.single('profileimage') , async function(req, res, next) {
    req.session.success = true;
    var path = req.file.path.substring(12);
    await editUserDp(path, req.session.NID);
    //res.send(path);
    res.redirect('/user/profile');
});



router.get('/logout', function(req, res, next) {
    req.session.NID = null;
    res.redirect('/user');
});

router.get('/signUp',async function(req, res, next) {
  var obj = {nidexists: req.session.nidexists, passerror: req.session.passerror , title: 'SignUp'}
  req.session.nidexists = false;
  req.session.passerror = false;
  req.session.success = false;
  res.render('signUp', obj);
});


router.post('/register',upload.single('profileimage') , async function(req, res, next) {
  var passerror = false;
  var nidexists = false;
  if(req.body.confirmpassword != req.body.password)  passerror = true;
  nidexists =await checkNid(req.body.NID);

  if(passerror || nidexists){
    req.session.nidexists = nidexists;
    req.session.passerror = passerror;
    req.session.success = false;
    res.redirect('/user/signUp');
  }
  else{
    req.session.success = true;
    if(req.file)
    var path = req.file.path.substring(12);
    await registerUser(req.body.NID);
    await createUser(req.body.username,req.body.password,req.body.email,path,req.body.NID);
    //res.send(path);
    res.redirect('/user');
  }
});


router.get('/searchPage', async function(req, res, next) {
  if(!req.session.NID)res.redirect('/user');
   //notification fetching
  var result = await queryUser(req.session.NID);
  var obj = JSON.parse(result);
  var notifications = {N:obj.Notification , S: obj.SentRequest , R: obj.ReceivedRequest};
  //
  res.render('UserSearchPage' , {title:  "Search user", NID: req.session.NID , USERNAME: req.session.USERNAME, error: req.session.error,notifications:notifications});
  req.session.error = false;
});

router.post('/searchUser',async function(req, res, next) {
  var result = await queryUser(req.body.NID);
  if(result != ""){

    var obj = JSON.parse(result);
     //notification fetching
    var notifications = {N:obj.Notification , S: obj.SentRequest , R: obj.ReceivedRequest};
    res.render('Profile', { title: req.body.NID+'s Profile' , obj: obj , NID: req.session.NID , USERNAME: req.session.USERNAME,notifications:notifications});
    }
    else {
      req.session.error = true;
      res.redirect('/user/searchPage');
    }
});








module.exports = router;
