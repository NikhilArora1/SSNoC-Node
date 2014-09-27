var LocalStrategy = require('passport-local').Strategy;
var request = require('request');
var User = require('../app/models/UserRest');

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, {user_name: user.local.name, new_user: user.local.new_user});
  });

  passport.deserializeUser(function(user_info, done) {
    User.getUser(user_info.user_name, function(err, user) {
      done(err, user);
    });
  });
  
  passport.use('local-joinCommunity', new LocalStrategy({
    usernameField:'name',
    passwordField:'password',
    passReqToCallback : true
  }, function(req, name, password, done){
    process.nextTick(function(){
      
      User.authenticate(name, password, function(err, success, failureReason){
        if(err){
          done(null, false, req.flash('joinMessage', 'Failed to join due to: ' + err));
          return;
        }
        
        if(!success && failureReason.errorCode == 401){
          // user already exists
          done(null, false, req.flash('joinMessage', 'Username already exists. Please enter a new username.'));
          return;
        }
        
        if(!success && failureReason.errorCode == 404){
          // create new user
          User.saveNewUser(name, password, function(err, user){
            if (err)
              return done(null, false, req.flash('joinMessage', 'Signup failed due to: ' + err));
            return done(null, user);
          });
          return;
        }
        
        if(success){
          // get the user object from the REST API
          User.getUser(name, function(err, user){
            if(err)
              return done(null, false, req.flash('joinMessage', 'Failed to login due to: ' + err));
            return done(null, user);
          });
        }
      });
      
    });
  }));

  passport.use('local-signup', new LocalStrategy({
    usernameField:'name',
    passwordField:'password',
    passReqToCallback : true
  },
  function(req, name, password, done) {
    process.nextTick(function() {
      User.saveNewUser(name, password, function(err, new_user) {
        if (err)
          return done(null, false, req.flash('signupMessage', 'Signup failed due to: ' + err));
        return done(null, new_user);
      });
    });
  }));
  passport.use('local-login', new LocalStrategy({
    usernameField : 'name',
    passwordField : 'password',
    passReqToCallback : true
  }, function(req, name, password, done) {
    User.getUser(name, function(err, user) {
      if (err){
        return done(err);
      }
      if (!user){
        return done(null, false, req.flash('loginMessage', 'User name not found'));
      }
      user.isValidPassword(password, function(isSuccessful){
        if (isSuccessful){
          return done(null, user);
        } else {
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong password'));
        }
      });
    });
  }));
};
