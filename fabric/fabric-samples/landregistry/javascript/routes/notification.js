var express = require('express');
var router = express.Router();

 var queryAllNotification= require('./call_functions/350/queryAllNotification');
 var changeUserNR= require('./call_functions/350/changeUserNR');
 var queryUser = require('./call_functions/350/queryUser');

router.get('/',async function(req, res, next) {
    if(req.session.NID == null)res.redirect('/user');
    else{var result = await queryAllNotification(req.session.NID);
    var obj;
    if(result != ""){
      obj = JSON.parse(result);
    }
    //notification fetching
    var r = await queryUser(req.session.NID);
    var obj1 = JSON.parse(r);
    var notifications = {N:obj1.Notification , S: obj1.SentRequest , R: obj1.ReceivedRequest};
    //
    await changeUserNR(req.session.NID,"ZeroN");
    res.render('Notifications' , {title: "Notifications" , NID: req.session.NID , USERNAME: req.session.USERNAME , obj: obj, result: result,notifications:notifications});
  }
  });


module.exports = router;