var request = require('request');
var rest_api = require('../../config/rest_api');
var User = require('./UserRest');
var Status = require('./StatusRest');

function Message(author, target, content, postedAt){
    this.author = author;
    this.target = target;
    this.content = content;
    this.postedAt = postedAt;
}

Message.postWallMessage=function(username, message, timestamp, callback) {
    var options = {
        url : rest_api.post_wall_message(username),
        body : {
                content : message,
                postedAt : timestamp
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
            console.log(body);
            var message = new Message(body.author, null, body.content, body.postedAt);
            callback(null, message);
            return;
        }
    });
};

Message.getWallMessages=function(callback){
    var options = {
        url : rest_api.get_wall_messages,
        json: true
    };
    request.get(options, function(err, res, body){
        if(err){
            callback(err,null);
            return;
        }
        else {
            console.log(body);
            var messages = body.map(function(item, idx, arr){
                return new Message(item.author, null, item.content, item.postedAt);
            });
            messages.sort(function(a,b) {
                return a.postedAt > b.postedAt;
            });
            callback(null, messages);
            return;
        }
    });
}

Message.sendChatMessage=function(sendingusername, receivingusername, message, timestamp, callback) {
    var options = {
        url : rest_api.send_chat_message(sendingusername, receivingusername),
        body : {
                content : message,
                postedAt : timestamp
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
            console.log(body);
            var message = new Message(body.author, body.target, body.content, body.postedAt);
            callback(null, message);
            return;
        }
    });
};

Message.getChatMessages=function(Username1, Username2, callback){
    var options = {
        url : rest_api.get_chat_messages(Username1, Username2),
        json: true
    };
    request.get(options, function(err, res, body){
        if(err){
            callback(err,null);
            return;
        }
        else {
            console.log(body);
            var messages = body.map(function(item, idx, arr){
                return new Message(item.author, item.target, item.content, item.postedAt);
            });
            messages.sort(function(a,b){
                var d1 = new Date(a.postedAt);
                var d2 = new Date(b.postedAt);
                return d1-d2;
            });
            callback(null, messages);
            return;
        }
    });
};

Message.getChatBuddies=function(username, callback){
    var options = {
        url : rest_api.get_users(username),
        json: true
    };
    request.get(options, function(err, res, body){
        if(err){
            callback(err,null);
            return;
        }
        else {
            console.log(body);
           
	        var users = body.map(function(item, idx, arr){
	        	 var lastStatusCode = item.lastStatusCode;
			      var new_status = null;
			      if(lastStatusCode != null){
			         new_status = new Status(item.userName, lastStatusCode.statusCode, lastStatusCode.updatedAt);
			      } else {
			       new_status = new Status(item.userName, "GREEN", null);
			   }
		        return new User(item.userName, null, new_status, false);
            });
            callback(null, users);
            return;
        }
    });
};

Message.retrieveMessage=function(messageID, callback){
    var options = {
        url : rest_api.retrieve_message(messageID),
        json: true
    };
    request.get(options, function(err, res, body){
        if(err){
            callback(err,null);
            return;
        }
        else {
            console.log(body);
              var message = new Message(body.author, body.target, body.content, body.postedAt);
              callback(null, message)
       
            
            return;
        }
    });
};


module.exports = Message;