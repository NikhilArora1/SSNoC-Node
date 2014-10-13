var bcrypt = require('bcrypt-nodejs');
var request = require('request');
var rest_api = require('../../config/rest_api');
var util = require('../util');

function Status(username, status, updatedAt){
  this.username = username;
  this.status = status;
  this.updatedAt = updatedAt;
}

Status.postStatus=function(username, status, timestamp, callback) {
    var options = {
        url : rest_api.post_status(username),
        body : {
            updatedAt : timestamp,
            statusCode : status 
        },
        json: true
    };
    request.post(options, function(err, res, body) {
        if (err){
            callback(err,null);
            return;
        }
        else
        {
            var status = new Status(body.userName, body.statusCode, body.updatedAt);
            callback(null, status);
            return;
        }
    });
};

Status.getLatestStatuses=function(callback){
    var options = {
        url : rest_api.get_latest_statuses,
        json: true
    };
    request.get(options, function(err, res, body){
        if(err){
            callback(err,null);
            return;
        } else {
            var statuses = body.map(function(item, idx, arr){
                return new Status(item.userName, item.statusCode, item.updatedAt);
            });

            statuses.sort(function(a,b) {
                return a.updatedAt > b.updatedAt;
            });

            callback(null, statuses);
            return;
        }
    });
}

module.exports = Status;