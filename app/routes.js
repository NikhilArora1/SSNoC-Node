var User = require('./models/UserRest');

module.exports = function(app, _, io, participants, passport) {
  var user_controller = require('./controllers/user')(_, io, participants, passport, refreshAllUsers);
  var people_controller = require('./controllers/people')(_, io, participants, passport);
  var messages_controller = require('./controllers/messages')(_, io, participants, passport);
  var memory_controller = require('./controllers/measureMemory')(_, io, participants, passport);
  var performance_controller = require('./controllers/MeasurePerformance')(_, io, participants, passport);
  var sna_controller = require('./controllers/analyzeSocialNetwork')(_, io, participants, passport);
  var ap_controller = require('./controllers/administerProfile')(_, io, participants, passport);


  var isTestRunning = function(req, res, next){
    if(performance_controller.isTestRunning()){
        res.redirect("/systemMaintenance");
        return;
    }
    next();
  }
  
  app.get("/", isTestRunning, isLoggedIn, isActive, function(req, res){
    res.redirect("/home");
  });
  app.get("/home", isTestRunning, isLoggedIn, isActive, checkPrivilege("Citizen"), function(req, res){
    User.getUsers(null, function(err, users){
      if (!err && users !== null) {
        participants.all = [];
        users.forEach(function(user) {
          participants.all.push(user.local);
        });
        res.render("home");
      } else {
        res.redirect("/home");
      }
    });
  });
  app.get("/joinCommunity", isTestRunning, user_controller.getJoinCommunity);
  app.post("/joinCommunity", user_controller.postJoinCommunity);

  app.get("/WelcomePage", isTestRunning, isLoggedIn, isActive, checkPrivilege("Citizen"), user_controller.getWelcomePage);
  
  app.get("/people1", isTestRunning, isLoggedIn, isActive, checkPrivilege("Citizen"), user_controller.getPeoplePage);
  app.get("/logout", isLoggedIn, isActive, user_controller.getLogout);
  app.get("/publicWall", isTestRunning, isLoggedIn, isActive, checkPrivilege("Citizen"), function(req, res){
    res.render("publicWall");
  });
  app.get("/privateChat", isTestRunning, isLoggedIn, isActive, checkPrivilege("Citizen"), function(req, res){
    console.log("private chat with: " + req.query.name);
    res.render("privateChat", {buddyName: req.query.name});
  });
  
  app.post("/status", isActive, checkPrivilege("Citizen"), user_controller.postPeoplePage);

  // data routes
  app.get("/user", isLoggedIn, isActive, user_controller.getUser);
  app.get("/wall", isLoggedIn, isActive, checkPrivilege("Citizen"), messages_controller.getWallContents);
  app.get("/participants", isLoggedIn, isActive, checkPrivilege("Citizen"), function(req, res){
    User.getUsers(null, function(err, users){
      if (!err && users !== null) {
        participants.all = [];
        users.forEach(function(user) {
          participants.all.push(user.local);
        });
      }
      res.json(200, participants);
    });
  });
  app.get("/chatBuddies", isLoggedIn, isActive, checkPrivilege("Citizen"), messages_controller.getChatBuddies);
  app.get("/privateMessages", isLoggedIn, isActive, checkPrivilege("Citizen"), messages_controller.getPrivateMessages);

  // measure memory routes
  app.post("/memory/start", isLoggedIn, isActive, checkPrivilege("Monitor"), memory_controller.postStartMemoryProfile);
  app.post("/memory/stop", isLoggedIn, isActive, checkPrivilege("Monitor"), memory_controller.postStopMemoryProfile);
  app.post("/memory/delete", isLoggedIn, isActive, checkPrivilege("Monitor"), memory_controller.postDeleteMemoryProfile);
  app.get("/memory", isLoggedIn, isActive, checkPrivilege("Monitor"), memory_controller.getMemoryProfile);

  // measure performance routes
  app.get("/performance", isLoggedIn, isActive, checkPrivilege("Monitor"), performance_controller.getPerformancePage);
  app.post("/performance/start", isLoggedIn, isActive, checkPrivilege("Monitor"), performance_controller.startPerformanceTests);
  app.post("/performance/stop", isLoggedIn, isActive, checkPrivilege("Monitor"), performance_controller.endPerformanceTests);
  app.get("/systemMaintenance", function(req, res){
    res.send("System undergoing maintenance");
  });

  // social network analysis
  app.get("/analyze", isLoggedIn, isActive, checkPrivilege("Coordinator"), sna_controller.getSocialNetworkAnalysis);
  
  //post announcement routes
  app.get("/announcements", isLoggedIn, isActive, checkPrivilege("Citizen"), messages_controller.getAnnouncements);
  
  //administer profile routes
  app.get("/adminProfile", isLoggedIn, isActive, checkPrivilege("Administrator"), ap_controller.loadUser);
  app.post("/updateProfile", isLoggedIn, isActive, checkPrivilege("Administrator"), ap_controller.updateUser);

  app.get("/Inactive", function(req, res){
	    res.send("Access Not Allowed, Get out of here!!!!");
  });

  // deprecated routes
  app.get("/poster", isTestRunning, isLoggedIn, isActive, function(req, res){
    res.render("poster");
  });
  app.post("/signup", isLoggedIn, user_controller.postSignup);
  app.get("/welcome", isLoggedIn, user_controller.getWelcome);
  app.get("/people", isLoggedIn, people_controller.getPeople);
  app.get('/signup', user_controller.getSignup);
  app.post("/login", passport.authenticate('local-login', {
    successRedirect : '/people',
    failureRedirect : '/',
    failureFlash: true
  })
);

function checkPrivilege(requiredLevel){

    // allowedLevels is an array containing the valid privilegeLevels
    var privilegeCheckerBuilder = function(allowedLevels){
      return function(req, res, next){
          var user_name = req.session.passport.user.user_name;
          User.getUser(user_name, function(err, user) {
              if (allowedLevels.indexOf(user.local.privilegeLevel) >= 0){
                next();
              }
              else {
                res.redirect("/Inactive");
                return;
              }
          });
      }
    }

    if(requiredLevel == "Administrator"){
        return privilegeCheckerBuilder(["Administrator"]);
    } 
    else if(requiredLevel == "Coordinator"){
        return privilegeCheckerBuilder(["Coordinator", "Administrator"]);
    }
    else if(requiredLevel == "Monitor"){
        return privilegeCheckerBuilder(["Monitor", "Administrator"]);
    }
    else if(requiredLevel == "Citizen"){
        return privilegeCheckerBuilder(["Citizen", "Monitor", "Coordinator", "Administrator"]);
    } else {
        return function(req, res, next){
          res.redirect("/Inactive");
        }
    }
}

function isActive(req, res, next){
    var user_name = req.session.passport.user.user_name;
    User.getUser(user_name, function(err, user) {
      if (user !== null && user.local.accountStatus == "Active") {
        next();
        return;
      } else {
        res.redirect("/Inactive");
        return;
      }
    });
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/joinCommunity');
}

function refreshAllUsers(participants, callback) {
  participants.all = [];
  User.getAllUsers(function(err, users) {
    users.forEach(function(user) {
      participants.all.push({'userName' : user.local.name});
    });
    callback();
  });
}
}
