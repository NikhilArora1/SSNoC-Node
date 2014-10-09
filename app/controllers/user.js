var User = require('../models/UserRest');
var Status = require('../models/StatusRest');

module.exports = function(_, io, participants, passport, refreshAllUsers) {
  return {
    getLogin : function(req, res) {
      res.render("join", {message: req.flash('loginMessage')});
    },

    getLogout : function(req, res) {
      req.logout();
      res.redirect('/');
    },

    getWelcomePage : function(req, res) {
    	res.render('WelcomePage');
    },
    
    getPeoplePage : function(req,res) {
    	var user_name=req.session.passport.user.user_name;
    	User.getUsers(user_name, function(err,users) {
    		if(users!==null) {
    		  var offline = [];
    		  var online = []
    		  participants.all = [];
    		  users.forEach(function(user) {
    		    participants.all.push(user);
            if(participants.online.hasOwnProperty(user.local.name)){
              online.push(user.local);
            } else {
              offline.push(user.local); 
            }
          });
    			res.render('people1', { users: users, online: online, offline: offline });
    		}
    	});
    	},
    
    postPeoplePage : function(req,res) {
      var user_name = req.session.passport.user.user_name;
      console.log(req.body);
      // this is a fixed timestamp for now, will update later
      Status.postStatus(user_name, req.body.statusCode, "2014-10-04 10:05:55-0700", function(err, body) {
        res.redirect('/people1');
      });
    },
    
    getSignup : function(req, res) {
      res.render('signup', {message: req.flash('signupMessage')});
    },

    getUser : function(req, res) {
      var user_name = req.session.passport.user.user_name;
      User.getUser(user_name, function(err, user) {
        if (user !== null) {
          res.json(200, user);
        }
      });
    },

    postSignup : function(req, res, next) {
      passport.authenticate('local-signup', function(err, user, info) {
        if (err)
          return next(err);
        if (!user)
          return res.redirect('/signup');
        req.logIn(user, function(err) {
          if (err)
            return next(err);
          participants.all.push({'userName' : user.local.name});
          return res.redirect('/welcome');
        });
      })(req, res, next);
    },

    getWelcome : function(req, res) {
      res.render('welcome', {title: "Hello " + req.session.passport.user.user_name + " !!"} );
    },
    
    getJoinCommunity : function(req, res){
      res.render('joinCommunity', {message: req.flash('joinMessage')});
    },
    
    postJoinCommunity : function(req, res, next) {
      passport.authenticate('local-joinCommunity', function(err, user, info){
        if(err)
          return next(err);
        
        if(!user)
          return res.redirect('/joinCommunity');
        
        req.logIn(user, function(err){
          if(err)
            return next(err);
            
          if(user.local.new_user){
            participants.all.push(user.local.name);
            res.redirect('/WelcomePage');
          } else {
            res.redirect('/home');
          }
          console.log("participants: " + JSON.stringify(participants));
          return;
        });
        
      })(req, res, next);
    }
  };
};
