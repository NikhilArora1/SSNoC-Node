var bcrypt = require('bcrypt-nodejs');
var request = require('request');
var rest_api = require('../../config/rest_api');
var util = require('../util')

function Status(user_name, status){
  this.local = {
    name : user_name,
    status : status,
  };
}
Status.postStatus=function(username, status, callback) {
    var options = {
    url : rest_api.post_status(username),
    body : {updatedAt : util.formatDate(new Date()),
            statusCode : status },
    json: true
    };
    request.post(options, function(err, res, body) {
    if (err){
      callback(err,null);
      return;
    }
    else
    {
        callback(null, body);
        return;
    }
    });
};

module.exports = Status;