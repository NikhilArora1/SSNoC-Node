var MessageRest = require('../models/MessageRest')

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
    getChatBuddies : function(req, res){
        var user_name=req.session.passport.user.user_name;
        MessageRest.getChatBuddies(user_name, function(err, buddies){
            if(err === null){
                res.json(200, buddies);
            } else {
                res.status(500).send('Server Error: ' + err);
            }
        });
    }
  };
};
