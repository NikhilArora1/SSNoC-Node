var User = require('../models/UserRest');

module.exports = function(_, io, participants, passport, refreshAllUsers){
	return {
		loadUser : function(req, res) {
			var user_name = req.session.passport.user.user_name;
			User.getUser(user_name, function(err, user) {
				if (user !== null) {
					res.render('administerProfile');
				}
			});
		},
		
		updateUser : function(req, res) {
			var user_name = req.session.passport.user.user_name;
			User.updateUser(user_name, password, accountStatus, privilegeLevel, function(err, user) {
				if(err){
			          res.status(500).send("Error: " + err);
				} else {
			          res.send(200);
			    }
			});
		}
	};
};