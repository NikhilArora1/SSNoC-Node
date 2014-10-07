var request = require('request');
var rest_api = require('../../config/rest_api');

function Message(author, content, postedAt){
    this.author = author;
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
            var message = new Message(body.author, body.content, body.postedAt);
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
                return new Message(item.author, item.content, item.postedAt);
            });
            callback(null, messages);
            return;
        }
    });
}

module.exports = Message;