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
  
  var isActive = function(req, res, next){
	    if(User.accountStatus == "Active"){
	    	next();
	    }
	    else{
	    	res.redirct("/Inactive");
	    	return;
	    }
	  }
  
  
  app.get("/", isTestRunning, isLoggedIn, isActive, function(req, res){
    res.redirect("/home");
  });
  app.get("/home", isTestRunning, isLoggedIn, isActive, function(req, res){
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
  app.get("/joinCommunity", isTestRunning, isActive, user_controller.getJoinCommunity);
  app.post("/joinCommunity", isActive, user_controller.postJoinCommunity);

  app.get("/WelcomePage", isTestRunning, isLoggedIn, isActive, user_controller.getWelcomePage);
  
  app.get("/people1", isTestRunning, isLoggedIn, isActive, user_controller.getPeoplePage);
  app.get("/poster", isTestRunning, isLoggedIn, isActive, function(req, res){
    res.render("poster");
  });
  app.get("/logout", isLoggedIn, isActive, user_controller.getLogout);
  app.get("/publicWall", isTestRunning, isLoggedIn, isActive, function(req, res){
    res.render("publicWall");
  });
  app.get("/privateChat", isTestRunning, isLoggedIn, isActive, function(req, res){
    console.log("private chat with: " + req.query.name);
    res.render("privateChat", {buddyName: req.query.name});
  });
  
  app.post("/status", isActive, user_controller.postPeoplePage);

  // data routes
  app.get("/user", isLoggedIn, isActive, user_controller.getUser);
  app.get("/wall", isLoggedIn, isActive, messages_controller.getWallContents);
  app.get("/participants", isLoggedIn, isActive, function(req, res){
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
  app.get("/chatBuddies", isLoggedIn, isActive, messages_controller.getChatBuddies);
  app.get("/privateMessages", isLoggedIn, isActive, messages_controller.getPrivateMessages);

  // measure memory routes
  app.post("/memory/start", isLoggedIn, isActive, memory_controller.postStartMemoryProfile);
  app.post("/memory/stop", isLoggedIn, isActive, memory_controller.postStopMemoryProfile);
  app.post("/memory/delete", isLoggedIn, isActive, memory_controller.postDeleteMemoryProfile);
  app.get("/memory", isLoggedIn, isActive, memory_controller.getMemoryProfile);

  // measure performance routes
  app.get("/performance", isLoggedIn, isActive, performance_controller.getPerformancePage);
  app.post("/performance/start", isLoggedIn, isActive, performance_controller.startPerformanceTests);
  app.post("/performance/stop", isLoggedIn, isActive, performance_controller.endPerformanceTests);
  app.get("/systemMaintenance", function(req, res){
    res.send("System undergoing maintenance");
  });

  // social network analysis
  app.get("/analyze", isLoggedIn, isActive, sna_controller.getSocialNetworkAnalysis);
  
  // administer profile routes
  app.get("/loadUser", isLoggedIn, isActive, ap_controller.loadUser);
  app.post("/updateUser", isLoggedIn, isActive, ap_controller.updateUser);
  
  //post announcement routes
  app.get("/announcements", isLoggedIn, isActive, messages_controller.getAnnouncements);
  
  //administer profile routes
  app.get("/adminProfile", isLoggedIn, isActive, ap_controller.loadUser);
  app.post("/updateProfile", isLoggedIn, isActive, ap_controller.updateUser);

  app.get("/Inactive", function(req, res){
	    res.send("Access Not Allowed, Get out of here!!!!");
  });
  // deprecated routes
  app.post("/signup", isLoggedIn, user_controller.postSignup);
  app.get("/welcome", isLoggedIn, user_controller.getWelcome);
  app.get("/people", isLoggedIn, people_controller.getPeople);
  app.get('/signup', user_controller.getSignup);
  app.post("/login", passport.authenticate('local-login', {
    successRedirect : '/people',
    failureRedirect : '/',
    failureFlash: true
  }));

	
function isAdminstrator(req, res, next){
	if (User.privilegeLevel == 'Administrator'){
		next();
	}
	else{
		res.redirct("/Inactive");
		return;
	}
}

function isCoordinator(req, res, next){
	if (User.privilegeLevel == 'Coordinator'){
		next();
	}
	else{
		res.redirct("/Inactive");
		return;
	}
}

function isMonitor(req, res, next){
	if (User.privilegeLevel == 'Monitor'){
		next();
	}
	else{
		res.redirct("/Inactive");
		return;
	}
}

function isCitizen(req, res, next){
	if (User.privilegeLevel == 'Citizen'){
		next();
	}
	else{
		res.redirct("/Inactive");
		return;
	}
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
