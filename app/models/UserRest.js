var bcrypt = require('bcrypt-nodejs');
var request = require('request');
var rest_api = require('../../config/rest_api');
var util = require('../util');
var Status = require('./StatusRest');

function User(user_name, password, latest_status, accountStatus, privilegeLevel, new_user){
  this.local = {
    name : user_name,
    password : password,
    status : latest_status,
    accountStatus : accountStatus,
    privilegeLevel : privilegeLevel,
    new_user: new_user
  };
  this.setStatus = function(status){
    this.local.status = status;
  };
  this.getStatus = function(){
    return this.local.status;
  };
}


User.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

User.prototype.isValidPassword = function(password, callback) {
  request.post(rest_api.is_password_valid + this.local.name + '/authenticate', {json:true, body:{password:password}}, function(err, res, body) {
    if (err || res.statusCode !== 200){
      callback(false);
      return;
    }

    callback(true);
  });
};



User.getUser = function(user_name, callback) {
  request(rest_api.get_user + user_name, {json:true}, function(err, res, body) {
    if (err){
      callback(err,null);
      return;
    }
    if (res.statusCode === 200) {
      var lastStatusCode = body.lastStatusCode;
      var new_status = null;
			if(lastStatusCode != null){
			   new_status = new Status(body.userName, lastStatusCode.statusCode, lastStatusCode.updatedAt);
			 } else {
  			 new_status = new Status(body.userName, "GREEN", null);
  		}
      var user = new User(body.userName, null, new_status, body.accountStatus, body.privilegeLevel, false);
      callback(null, user);
      return;
    }
    if (res.statusCode !== 200) {
      callback(null, null);
      return;
    }
  });
};

User.getUsers = function(username, callback) {
	request(rest_api.get_all_users, {json:true}, function(err,res,body){
		if (err){
			callback(err,null);
			return;
		}
		if (res.statusCode == 200) {
		 
			var users = body.map(function(item, idx, arr){
			      var lastStatusCode = item.lastStatusCode;
			      var new_status = null;
			      if(lastStatusCode != null){
			         new_status = new Status(item.userName, lastStatusCode.statusCode, lastStatusCode.updatedAt);
			      } else {
  			       new_status = new Status(item.userName, "GREEN", null);
  			   }
		        return new User(item.userName, null, new_status, item.accountStatus, item.privilegeLevel, false);
		      });

		      users.sort(function(a,b) {
		        return a.userName > b.userName;
		      });
		      console.log("@@@@@ in User.getAllUser succeed users :" + JSON.stringify(users));
		      callback(null, users);
		} else {
		  callback(null,null);
		}
	})
};

User.getAllUsers = function(callback) {
  request(rest_api.get_all_users, {json:true}, function(err, res, body) {
    if (err){
      callback(err,null);
      return;
    }
    if (res.statusCode === 200) {
      var users = body.map(function(item, idx, arr){
    	  var lastStatusCode = item.lastStatusCode;
	      var new_status = null;
	      if(lastStatusCode != null){
	         new_status = new Status(item.userName, lastStatusCode.statusCode, lastStatusCode.updatedAt);
	      } else {
		       new_status = new Status(item.userName, "GREEN", null);
		   }
        return new User(item.userName, null, new_status, item.accountStatus, item.privilegeLevel, false);
      });

      users.sort(function(a,b) {
        return a.userName > b.userName;
      });

      console.log("@@@@@ in User.getAllUser succeed users :" + JSON.stringify(users));
      callback(null, users);
      return;
    }
    if (res.statusCode !== 200) {
      callback(null, null);
      return;
    }
  });
};

User.saveNewUser = function(user_name, password, callback) {
  var options = {
    url : rest_api.post_new_user,
    body : {userName: user_name, 
            password: password, 
            createdAt: util.formatDate(new Date())},
    json: true
  };

  request.post(options, function(err, res, body) {
    if (err){
      callback(err,null);
      return;
    }
    if (res.statusCode !== 200 && res.statusCode !== 201) {
      callback(res.body, null);
      return;
    }
    var lastStatusCode = body.lastStatusCode;
    var new_status = null;
    if(lastStatusCode != null){
       new_status = new Status(body.userName, lastStatusCode.statusCode, lastStatusCode.updatedAt);
    } else {
       new_status = new Status(body.userName, "GREEN", null);
   }
    var new_user = new User(body.userName, body.password, new_status, body.accountStatus, body.privilegeLevel, true);
    callback(null, new_user);
    return;
  });
};

User.updateUser = function(user, userData, callback) {
	var options = {
		url : rest_api.update_user(user),
		body : userData,
		json: true
	};
	
	request.put(options, function(err, res, body) {
		if (err) {
			callback(err, null);
			return;
		} else if(res.statusCode === 200 || res.statusCode === 201){
      var lastStatusCode = body.lastStatusCode;
      var new_status = null;
      if(lastStatusCode != null){
         new_status = new Status(body.userName, lastStatusCode.statusCode, lastStatusCode.updatedAt);
      } else {
           new_status = new Status(body.userName, "GREEN", null);
        }
    var new_user = new User(body.userName, body.password, new_status, body.accountStatus, body.privilegeLevel, false);
      callback(null, new_user);
    } else {
      callback(body, null);
    }
		
	});
};

// callback should be of the form
// function(err, successful, failureReason)
// where:
//    err - error from server
//    successful - boolean whether the call was successful or not
//    failureReason - an object specifying the error code
//        and the failure message reason
User.authenticate = function(username, password, callback){
  var options = {
    url : rest_api.authenticate_user(username),
    body : {password: password},
    json: true
  }
  
  request.post(options, function(err, res, body){
    if(err){
      callback(err, null);
      return;
    }
    
    if(res.statusCode === 200){
      callback(null, true);
    } else {
      var reason = "Unknown Error";
      if(res.statusCode === 401){
        reason = body;
      } else if(res.statusCode === 404){
        reason = "User does not exist.";
      }
      callback(null, false, {errorCode: res.statusCode, reason: reason});
    }
    
  });
};

module.exports = User;
