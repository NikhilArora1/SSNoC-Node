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
    			res.render('people1', { users: users });
    		}
    	});
    	},
    
    postPeoplePage : function(req,res) {
      var user_name = req.session.passport.user.user_name;
      console.log(req.body);
      Status.postStatus(user_name, req.body.statusCode, function(err, body) {
        res.json(200, body);
      })
    },
    
    getSignup : function(req, res) {
      res.render('signup', {message: req.flash('signupMessage')});
    },

    getUser : function(req, res) {
      var user_name = req.session.passport.user.user_name;
      User.getUser(user_name, function(err, user) {
        if (user !== null) {
          res.json(200, {name:user.local.name});
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
            
          participants.all.push({'userName' : user.local.name});

          if(user.local.new_user){
            return res.redirect('/WelcomePage');
          } else {
            return res.redirect('/people1');
          }
          
        });
        
      })(req, res, next);
    }
  };
};
