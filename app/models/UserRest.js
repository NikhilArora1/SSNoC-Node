var bcrypt = require('bcrypt-nodejs');
var request = require('request');
var rest_api = require('../../config/rest_api');

function User(user_name, password, new_user){
  this.local = {
    name : user_name,
    password : password,
    new_user: new_user
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
      var user = new User(body.userName, body.password, false);
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
		        return new User(item.userName, item.status, false);
		      });

		      users.sort(function(a,b) {
		        return a.userName > b.userName;
		      });
		      
		      callback(null, users);
		}
	})
}

User.getAllUsers = function(callback) {
  request(rest_api.get_all_users, {json:true}, function(err, res, body) {
    if (err){
      callback(err,null);
      return;
    }
    if (res.statusCode === 200) {
      var users = body.map(function(item, idx, arr){
        return new User(item.userName, item.password, false);
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
    body : {userName: user_name, password: password},
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
    var new_user = new User(body.userName, password, true);
    callback(null, new_user);
    return;
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
        reason = "Username and password do not match."
      } else if(res.statusCode === 404){
        reason = "User does not exist.";
      }
      callback(null, false, {errorCode: res.statusCode, reason: reason});
    }
    
  });
}

module.exports = User;
