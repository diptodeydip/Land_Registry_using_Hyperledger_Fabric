var express = require('express');
var router = express.Router();
var createRequest= require('./call_functions/350/createRequest');
var queryAllRequests= require('./call_functions/350/queryAllRequests');
var queryAsset= require('./call_functions/350/queryAsset');
var Advertise= require('./call_functions/350/Advertise');
var queryRequest= require('./call_functions/350/queryRequest');
var deleteRequest= require('./call_functions/350/deleteRequest');
var changeOwnerAck= require('./call_functions/350/changeOwnerAck');
var changeUserNR= require('./call_functions/350/changeUserNR');
var queryUser = require('./call_functions/350/queryUser');



//////////////////
router.get('/myRequests',async function(req, res, next) {
  if(req.session.NID == null)res.redirect('/user');
  else{
  var result = await queryAllRequests(req.session.NID);
  var obj;
  if(result != ""){
    obj = JSON.parse(result);
  }
  await changeUserNR(req.session.NID,"ZeroS");
  //notification fetching
  var r = await queryUser(req.session.NID);
  var obj1 = JSON.parse(r);
  var notifications = {N:obj1.Notification , S: obj1.SentRequest , R: obj1.ReceivedRequest};
  //
  res.render('myRequests' , {title: "Sent Requests" , NID: req.session.NID , USERNAME: req.session.USERNAME , obj: obj, result: result, success: req.session.success
,notifications:notifications});
  req.session.success = false;
}
});

router.get('/ReceivedRequests',async function(req, res, next) {
  if(req.session.NID == null)res.redirect('/user');
  else{
  var result = await queryAllRequests(req.session.NID);
  var obj;
  if(result != ""){
    obj = JSON.parse(result);
  }
  await changeUserNR(req.session.NID,"ZeroR");
  //notification fetching
  var r = await queryUser(req.session.NID);
  var obj1 = JSON.parse(r);
  var notifications = {N:obj1.Notification , S: obj1.SentRequest , R: obj1.ReceivedRequest};
  //
  res.render('ReceivedRequests' , {title: "Received Requests" , NID: req.session.NID , USERNAME: req.session.USERNAME , obj: obj, result: result
  ,notifications:notifications, success: req.session.success});
  req.session.success = false;
}
});

router.get('/createRequest/:key',async function(req, res, next) { // this key is asset's key
if(req.session.NID == null)res.redirect('/user');
  else{
  var result = await queryAsset(req.params.key , req.session.NID);
  var obj;
  obj = JSON.parse(result);
  await Advertise(req.session.NID,req.params.key);

  //notifications
  await changeUserNR(req.session.NID,"IncreaseS");
  await changeUserNR(obj.OwnerNID,"IncreaseR");

  await createRequest(obj.OwnerNID,obj.OwnerName,req.session.NID,req.session.USERNAME,obj.AssetName,req.params.key ,  new Date().toString());
  req.session.success = true;
  res.redirect('/asset/ads');
  }
});

router.get('/ViewRequest/:key',async function(req, res, next) {
  if(req.session.NID == null)res.redirect('/user');
  else{
  var result = await queryRequest(req.params.key , req.session.NID);
  var obj;
  obj = JSON.parse(result);
  //notification fetching
  var r = await queryUser(req.session.NID);
  var obj1 = JSON.parse(r);
  var notifications = {N:obj1.Notification , S: obj1.SentRequest , R: obj1.ReceivedRequest};
  //
  res.render('ViewRequest' , {title:  req.params.key, key: req.params.key , NID: req.session.NID , USERNAME: req.session.USERNAME , obj: obj, result: result,
  notifications:notifications});
  }
});

router.get('/deleteRequest/:key', async function(req, res, next) {
  //Authentication
  var result = await queryRequest(req.params.key , req.session.NID);
  var obj;
  obj = JSON.parse(result);

  //Authentication!
  if(req.session.NID == null || req.session.NID != obj.RequestedByNID)res.redirect('/user/logout');
  else{

  await Advertise(req.session.NID,obj.AssetCode);
  await deleteRequest(req.session.NID,req.params.key);
  req.session.success = true;
   res.redirect('/request/myRequests');
  }
});

router.get('/acceptRequest/:key', async function(req, res, next) {
  //Authentication
  var result = await queryRequest(req.params.key , req.session.NID);
  var obj;
  obj = JSON.parse(result);

  //Authentication!
  if(req.session.NID == null || req.session.NID != obj.OwnerNID)res.redirect('/user/logout');
  else{
  
  await changeOwnerAck(req.session.NID,req.params.key);
  req.session.success = "accepted";
   res.redirect('/request/ReceivedRequests');
  }
});
router.get('/rejectRequest/:key', async function(req, res, next) {
  //Authentication
  var result = await queryRequest(req.params.key , req.session.NID);
  var obj;
  obj = JSON.parse(result);

  //Authentication!
  if(req.session.NID == null || req.session.NID != obj.OwnerNID)res.redirect('/user/logout');
  else{


  await Advertise(req.session.NID,obj.AssetCode);
  await deleteRequest(req.session.NID,req.params.key);
  req.session.success = "rejected";
   res.redirect('/request/ReceivedRequests');
  }
});






//////////////////


module.exports = router;
