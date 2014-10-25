var UserRest = require('./models/UserRest');
var MessageRest = require('./models/MessageRest');
var StatusRest = require('./models/StatusRest');

var isActive = function(username, next){
  UserRest.getUser(username, function(err, user){
    if(user !== null && user.local.accountStatus == "Active"){
      next();
    } else {
      console.log("User account is deactivated");
    }
  });
}

var checkPrivilegeLevel = function(username, allowedLevels, next){
  UserRest.getUser(username, function(err, user){
    if(user !== null && allowedLevels.indexOf(user.local.privilegeLevel) >= 0){
      next();
    } else {
      console.log("User does not have required privileges. User: " + username + " Required levels: " + JSON.stringify(allowedLevels));
    }
  });
}

module.exports = function(_, io, participants) {
  io.on("connection", function(socket){
    socket.on("newUser", function(data) {
      isActive(data.name, function(){
          // join this user's private message room
          socket.join(data.name);
          participants.online[data.id] = {'userName' : data.name, 'status': data.status};
          io.sockets.emit("newConnection", {participants: participants});
      })
    });

    socket.on("disconnect", function() {
      delete participants.online[socket.id];
      io.sockets.emit("userDisconnected", {id: socket.id, sender:"system", participants:participants});
    });

    // These set of listeners correspond to public walls
    socket.on("postWallMessage", function(data){
      var username = data.username;
      isActive(username, function(){
        var message = data.message;
        var timestamp = data.timestamp;
        MessageRest.postWallMessage(username, message, timestamp, function(err, message){
            if(err){
              console.log("error posting wall message " + err);
              return;
            }
            // assumption is that message is a full message object
            io.sockets.emit('newWallMessage', {message: message});
        });
      });
    });

    socket.on("postStatus", function(data){
        var username = data.username;
        isActive(username, function(){
          var status = data.status;
          var timestamp = data.timestamp;
          StatusRest.postStatus(username, status, timestamp, function(err, status){
              if(err){
                console.log("error posting status " + err);
                return;
              }
              io.sockets.emit('newStatusMessage', {status: status});
          });
        });
    });

    socket.on("sendPrivateMessage", function(data){
        var author = data.author;
        isActive(author, function(){
          var target = data.target;
          var message = data.message;
          var timestamp = data.timestamp;
          MessageRest.sendChatMessage(author, target, message, timestamp, function(err, msg){
            if(err){
                console.log("error sending message: " + err);
                return;
              }
            io.sockets.in(msg.author).emit('newPrivateMessage', {message: msg});
            io.sockets.in(msg.target).emit('newPrivateMessage', {message: msg});
          });
        });
    });
    
    socket.on("postAnnouncement", function(data){
        var username = data.username;
        isActive(username, function(){
          checkPrivilegeLevel(username, ["Coordinator", "Administrator"], function(){
            var message = data.message;
            var timestamp = data.timestamp;
            MessageRest.postAnnouncement(username, message, timestamp, function(err, message){
                if(err){
                  console.log("error posting announcement " + err);
                  return;
                }
                // assumption is that message is a full message object
                io.sockets.emit('newAnnouncement', {message: message});
            });
          });
        });
    });
  });
};
