var MessageRest = require('../models/MessageRest')

module.exports = function(_, io, participants, passport) {
  return {
    getWallMessages : function(req, res) {
    	MessageRest.getWallMessages(function(err, messages){
    		if(err === null){
    			res.json(200, messages);
    		} else {
    			res.send(500);
    		}
    	});
    },
  };
};
