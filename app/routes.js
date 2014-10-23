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

  app.get("/", isTestRunning, user_controller.getJoinCommunity);
  app.get("/home", isTestRunning, isLoggedIn, function(req, res){
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

  app.get("/WelcomePage", isTestRunning, isLoggedIn, user_controller.getWelcomePage);
  
  app.get("/people1", isTestRunning, isLoggedIn, user_controller.getPeoplePage);
  app.get("/poster", isTestRunning, isLoggedIn, function(req, res){
    res.render("poster");
  });
  app.get("/logout", isLoggedIn, user_controller.getLogout);
  app.get("/publicWall", isTestRunning, isLoggedIn, function(req, res){
    res.render("publicWall");
  });
  app.get("/privateChat", isTestRunning, isLoggedIn, function(req, res){
    console.log("private chat with: " + req.query.name);
    res.render("privateChat", {buddyName: req.query.name});
  });
  
  app.post("/status", user_controller.postPeoplePage);

  // data routes
  app.get("/user", isLoggedIn, user_controller.getUser);
  app.get("/wall", isLoggedIn, messages_controller.getWallContents);
  app.get("/participants", isLoggedIn, function(req, res){
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
  app.get("/chatBuddies", isLoggedIn, messages_controller.getChatBuddies);
  app.get("/privateMessages", isLoggedIn, messages_controller.getPrivateMessages);

  // measure memory routes
  app.post("/memory/start", isLoggedIn, memory_controller.postStartMemoryProfile);
  app.post("/memory/stop", isLoggedIn, memory_controller.postStopMemoryProfile);
  app.post("/memory/delete", isLoggedIn, memory_controller.postDeleteMemoryProfile);
  app.get("/memory", isLoggedIn, memory_controller.getMemoryProfile);

  // measure performance routes
  app.get("/performance", isLoggedIn, performance_controller.getPerformancePage);
  app.post("/performance/start", isLoggedIn, performance_controller.startPerformanceTests);
  app.post("/performance/stop", isLoggedIn, performance_controller.endPerformanceTests);
  app.get("/systemMaintenance", function(req, res){
    res.send("System undergoing maintenance");
  });

  // social network analysis
  app.get("/analyze", isLoggedIn, sna_controller.getSocialNetworkAnalysis);
  
  // administer profile routes
  app.get("/loadUser", isLoggedIn, ap_controller.loadUser);
  app.post("/updateUser", isLoggedIn, ap_controller.updateUser);
  
  //post announcement routes
  app.get("/announcements", isLoggedIn, messages_controller.getAnnouncements);
  app.post("/announcement", isLoggedIn, messages_controller.postAnnouncement);

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

};

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
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
