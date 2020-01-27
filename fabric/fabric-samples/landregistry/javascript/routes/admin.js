var express = require('express');
var router = express.Router();
 var queryAllRequests= require('./call_functions/350/queryAllRequests');
 var queryRequest= require('./call_functions/350/queryRequest');
 var deleteRequest= require('./call_functions/350/deleteRequest');
 var enrollAdmin = require('./call_functions/enrollAdmin');
 var createNotification= require('./call_functions/350/createNotification');
 var changeOwnerShip= require('./call_functions/350/changeOwnerShip');
 var changeUserNR= require('./call_functions/350/changeUserNR');
 var getHistoryofAsset= require('./call_functions/350/getHistoryofAsset');
 var queryAsset= require('./call_functions/350/queryAsset');


 //////////
//unique keys//
function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

 ///////

router.get('/',async function(req, res, next) {
  if(req.session.admin)res.redirect('/admin/requests');
  else{
  enrollAdmin();
    res.render('AdminLogin' , {title: "Admin Login" ,  error: req.session.error, AdminPage: true});
    req.session.error = false;
  }
  });
  router.post('/loginAsAdmin',async function(req, res, next) {

    if(req.body.password == "123"){
      req.session.admin = true;
      res.redirect('/admin/requests');
      
    }
    else{
      req.session.error = true;
      res.redirect('/admin');  
    }
  });
  router.get('/requests',async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/admin');
    else{var result = await queryAllRequests("admin");
    var obj;
    if(result != ""){
      obj = JSON.parse(result);
    }
    res.render('AdminPanel' , {title: "Admin Panel" ,  Admin: req.session.admin, obj: obj ,  success: req.session.success , AdminPage: true});
    req.session.success = false;
  }
  });
  router.get('/ViewRequest/:key',async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/admin');
    else{var result = await queryRequest(req.params.key , "admin");
    var obj;
    obj = JSON.parse(result);
    res.render('ViewRequest' , {title:  req.params.key, key: req.params.key , obj: obj, result: result , Admin: req.session.admin , AdminPage: true});
  }
  });

  router.get('/logout',async function(req, res, next) {
    req.session.admin = null;
    res.redirect('/admin');
    
  });

  router.get('/rejectRequest/:key', async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/admin');
    else{var result = await queryRequest(req.params.key , "admin");
    var obj;
    obj = JSON.parse(result);

    await changeUserNR(obj.OwnerNID,"IncreaseN");
    await changeUserNR(obj.RequestedByNID,"IncreaseN");

    await createNotification("admin",makeid(5),obj.AssetCode,"","","","",new Date().toString(),"Rejected",obj.OwnerNID,obj.RequestedByNID)
    await deleteRequest("admin",req.params.key);
    req.session.success = "rejected";
     res.redirect('/admin/requests');
  }
  });


  router.get('/acceptRequest/:key', async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/admin');
    else{var result = await queryRequest(req.params.key , "admin");
    var obj;
    obj = JSON.parse(result);

    await changeUserNR(obj.OwnerNID,"IncreaseN");
    await changeUserNR(obj.RequestedByNID,"IncreaseN");
    
    await createNotification("admin",makeid(5),obj.AssetCode,obj.OwnerNID,obj.OwnerName,obj.RequestedByNID,obj.RequestedByName,new Date().toString(),"Accepted","","")
    await changeOwnerShip("admin",obj.AssetCode,obj.RequestedByName,obj.RequestedByNID);
    await deleteRequest("admin",req.params.key);
    req.session.success = "accepted";
     res.redirect('/admin/requests');
  }
  });

  router.get('/searchPage', async function(req, res, next) {
    if(req.session.admin == null)res.redirect('/admin');
    else{
    res.render('SearchPage' , {title:  "Search Asset", error: req.session.error
   , Admin: req.session.admin , AdminPage: true});
    req.session.error = false;
    }
  });
  
  router.post('/searchAsset',async function(req, res, next) {
    var obj,obj1;
    var result = await queryAsset(req.body.code , 'admin');
    var history = await getHistoryofAsset(req.body.code , 'admin');
    if(result == "" && history == "[]"){
      req.session.error = true;
      res.redirect('/admin/searchPage');
    }
    else{
      if(result != "")
      obj = JSON.parse(result);
      obj1 = JSON.parse(history);
    //
      res.render('History' , {title:  "Asset History of "+req.body.code, key:req.body.code, obj: obj , 
       obj1: obj1 , result: result , Admin: req.session.admin , AdminPage: true});
    }
  });
  



 
  

  module.exports = router;