var User = require('../models/UserRest');

module.exports = function(_, io, participants, passport, refreshAllUsers){
	return {
		loadUser : function(req, res) {
			// localhost:8080/adminProfile?name=cef
			var user_name = req.query.name;
			console.log("admin profile for user: " + user_name);
			User.getUser(user_name, function(err, user) {
				if (user !== null) {
					console.log("user: " + user);
					res.render('adminUser', {
						username: user.local.name,
						password: user.local.password,
						privilegeLevel: user.local.privilegeLevel,
						accountStatus: user.local.accountStatus,
						message: req.flash('message'),
						errorMessage: req.flash('errorMessage')
					});
				} else {
					res.status(500).send("Error: " + err);
				}
			});
		},
		
		updateUser : function(req, res) {
			var user = req.body.originalUsername;
			var userData = {
				userName: (req.body.username.length > 0) ? req.body.username : null,
				password: (req.body.password.length > 0) ? req.body.password : null,
				accountStatus: req.body.accountStatus,
				privilegeLevel: req.body.privilegeLevel
			};
			console.log("updating info for user: " + user + " info: " + JSON.stringify(userData));
			User.updateUser(user, userData, function(err, userObj) {
				if(err){
					req.flash('errorMessage', "Failed to update profle: " + err);
			          res.redirect("/adminProfile?name=" + user);
				} else {
					req.flash('message', "Update successful!");
			          res.redirect("/adminProfile?name=" + userObj.local.name);
			    }
			});
		}
	};
};