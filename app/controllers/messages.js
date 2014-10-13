var MessageRest = require('../models/MessageRest');
var StatusRest = require('../models/StatusRest');

module.exports = function(_, io, participants, passport) {
  return {
    getWallMessages : function(req, res) {
    	MessageRest.getWallMessages(function(err, messages){
    		if(err === null){
    			res.json(200, messages);
    		} else {
    			res.status(500).send('Server Error: ' + err);
    		}
    	});
    },
    getWallContents : function(req, res){
        var wallMessages = [];
        MessageRest.getWallMessages(function(err, messages){
            if(err == null){
                messages.forEach(function(msg){
                    msg.type = "MESSAGE";
                    wallMessages.push(msg);
                });
                
                // combine with status messages
                StatusRest.getLatestStatuses(function(err2, statuses){
                    if(err2 == null){
                        statuses.forEach(function(stat){
                            stat.type = "STATUS";
                            wallMessages.push(stat);
                        });
                    }

                    wallMessages.sort(function(a,b){
                        var d1, d2;
                        if(a.type === "MESSAGE"){
                            d1 = a.postedAt;
                        } else {
                            d1 = a.updatedAt;
                        }

                        if(b.type === "MESSAGE"){
                            d2 = b.postedAt;
                        } else {    
                            d2 = b.updatedAt;
                        }

                        var e1 = new Date(d1);
                        var e2 = new Date(d2);
                        var result = e1 - e2;
                        return result;
                    });
                    
                    // return wallMessages even if statuses fails  
                    res.json(200, wallMessages);
                }); 
            } else {
                res.status(500).send('Server Error: ' + err);
            }
        });     
    },
    getChatBuddies : function(req, res){
        var user_name=req.session.passport.user.user_name;
        MessageRest.getChatBuddies(user_name, function(err, buddies){
            if(err === null){
                res.json(200, buddies);
            } else {
                res.status(500).send('Server Error: ' + err);
            }
        });
    },
    getPrivateMessages : function(req, res){
        var user_name=req.session.passport.user.user_name;
        var buddy=req.query.buddy;
        MessageRest.getChatMessages(user_name, buddy, function(err, messages){
            if(err === null){
                res.json(200, messages);
            } else {
                res.send("error: " + err);
            }
        });
    }
  };
};
