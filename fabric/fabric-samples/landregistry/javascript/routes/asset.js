var express = require('express');
var router = express.Router();
var createAsset= require('./call_functions/350/createAsset');
var queryMyAsset= require('./call_functions/350/queryMyAsset');
var queryAsset= require('./call_functions/350/queryAsset');
var deleteAsset= require('./call_functions/350/deleteAsset');
var Advertise= require('./call_functions/350/Advertise');
var queryAdvertise= require('./call_functions/350/queryAdvertise');
var getHistoryofAsset= require('./call_functions/350/getHistoryofAsset');
var queryRequest= require('./call_functions/350/queryRequest');
var queryUser = require('./call_functions/350/queryUser');


//multer related to image uploadling
const multer = require('multer');
/////////////Image Uploading prerequisite////////////////
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/asset/locations');
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



/* GET users listing. */
router.get('/', async function(req, res, next) {
  if(req.session.NID == null)res.redirect('/user');
  else{

  var result = await queryMyAsset(req.session.NID);
  var obj;
  if(result != ""){
    obj = JSON.parse(result);
  }
  //notification fetching
  var r = await queryUser(req.session.NID);
  var obj1 = JSON.parse(r);
  var notifications = {N:obj1.Notification , S: obj1.SentRequest , R: obj1.ReceivedRequest};
  //
  res.render('MyAssets' , {title: "My Asset" , NID: req.session.NID , USERNAME: req.session.USERNAME , obj: obj, result: result, success: req.session.success
,notifications:notifications});
  req.session.success = false;
}
});

router.get('/ads', async function(req, res, next) {
  if(req.session.NID == null)res.redirect('/user');
  else{
    
  var result = await queryAdvertise(req.session.NID);
  var obj;
  if(result != ""){
    obj = JSON.parse(result);
  }
  //notification fetching
  var r = await queryUser(req.session.NID);
  var obj1 = JSON.parse(r);
  var notifications = {N:obj1.Notification , S: obj1.SentRequest , R: obj1.ReceivedRequest};
  //
  res.render('Ads' , {title: "Advertised Assets" , NID: req.session.NID , USERNAME: req.session.USERNAME , obj: obj, result: result
  ,notifications:notifications, success: req.session.success});
  req.session.success = false;
}
});


router.post('/upload',upload.single('assetLocation'),async function(req, res, next) {
  var assetcode = req.body.Division+req.body.District+req.body.MaujaNo_JL+req.body.KhatianNo+req.body.PlotNo;
  
  var result = await queryAsset(assetcode , req.session.NID);
  if(result == ""){
  var path = req.file.path.substring(13);
  req.session.success = true;
  await createAsset(req.body.assetname, assetcode , path , req.session.NID , req.session.USERNAME , new Date().toString()
  ,req.body.Division,req.body.District,req.body.MaujaNo_JL,req.body.KhatianNo,req.body.PlotNo);
  }
  else{
    req.session.error = true;
  }
  res.redirect('/asset/uploadpage');
});


router.get('/uploadpage',async function(req, res, next) {
  if(req.session.NID == null)res.redirect('/user');
  else{
    
  //notification fetching
  var r = await queryUser(req.session.NID);
  var obj1 = JSON.parse(r);
  var notifications = {N:obj1.Notification , S: obj1.SentRequest , R: obj1.ReceivedRequest};
  //
  res.render('UploadAsset' , {title: "Upload Asset" , success: req.session.success, error: req.session.error , NID: req.session.NID , USERNAME: req.session.USERNAME
,notifications:notifications});
  req.session.success = false;
  req.session.error = false;
  }
});

router.get('/ViewAsset/:key',async function(req, res, next) {
  if(req.session.NID == null)res.redirect('/user');
  else{
    
  var result = await queryAsset(req.params.key , req.session.NID);
  var obj;
  obj = JSON.parse(result);
  
  var request = await queryRequest(req.params.key+"R" , req.session.NID);
  var pending;
  if(request == "")pending = false;
  else pending = true;

  //notification fetching
  var r = await queryUser(req.session.NID);
  var obj1 = JSON.parse(r);
  var notifications = {N:obj1.Notification , S: obj1.SentRequest , R: obj1.ReceivedRequest};
  //
  res.render('ViewAsset' , {title:  req.params.key,pending: pending, key: req.params.key , NID: req.session.NID , USERNAME: req.session.USERNAME ,
    notifications:notifications, obj: obj, result: result, success:req.session.success , requestkey: req.params.key+"R"});
  req.session.success = false;
  }
});

router.get('/Advertise/:key', async function(req, res, next) {
  //Authentication
  var result = await queryAsset(req.params.key , req.session.NID);
  var obj;
  obj = JSON.parse(result);

  //Authentication!
  if(req.session.NID == null || req.session.NID != obj.OwnerNID)res.redirect('/user/logout');
  else{
  
  req.session.success = true;
  await Advertise(req.session.NID,req.params.key);
   res.redirect('/asset/ViewAsset/'+req.params.key);
  }
});
router.get('/deleteAsset/:key', async function(req, res, next) {
  //Authentication
  var result = await queryAsset(req.params.key , req.session.NID);
  var obj;
  obj = JSON.parse(result);

  //Authentication!
  if(req.session.NID == null || req.session.NID != obj.OwnerNID)res.redirect('/user/logout');
  else{

  await deleteAsset(req.session.NID,req.params.key);
  req.session.success = true;
   res.redirect('/asset');
  }
});


router.get('/searchPage', async function(req, res, next) {
  if(req.session.NID == null)res.redirect('/user/logout');
  else{
    
  //notification fetching
  var r = await queryUser(req.session.NID);
  var obj1 = JSON.parse(r);
  var notifications = {N:obj1.Notification , S: obj1.SentRequest , R: obj1.ReceivedRequest};
  //
  res.render('SearchPage' , {title:  "Search Asset", NID: req.session.NID , USERNAME: req.session.USERNAME, error: req.session.error
,notifications:notifications});
  req.session.error = false;
  }
});

router.post('/searchAsset',async function(req, res, next) {
  var obj,obj1;
  var result = await queryAsset(req.body.code , req.session.NID);
  var history = await getHistoryofAsset(req.body.code , req.session.NID);
  if(result == "" && history == "[]"){
    req.session.error = true;
    res.redirect('/asset/searchPage');
  }
  else{
    if(result != "")
    obj = JSON.parse(result);
    obj1 = JSON.parse(history);
    //notification fetching
  var r = await queryUser(req.session.NID);
  var obj2 = JSON.parse(r);
  var notifications = {N:obj2.Notification , S: obj2.SentRequest , R: obj2.ReceivedRequest};
  //
    res.render('History' , {title:  "Asset History of "+req.body.code,key:req.body.code, NID: req.session.NID , USERNAME: req.session.USERNAME, obj: obj , 
    notifications:notifications, obj1: obj1 , result: history});
  }
});

module.exports = router;
