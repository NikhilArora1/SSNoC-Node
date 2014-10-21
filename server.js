var express = require("express"),
  app = express(),
  util = require("./app/util"),
  http = require("http").createServer(app),
  io = require("socket.io").listen(http),
  _ = require("underscore"),
  passport = require('passport'),
  flash = require('connect-flash'),
  User = require('./app/models/UserRest');

  var sna = require('./app/models/SocialNetworkAnalyzer');

var participants = {
  online : {},
  all : []
};

process.chdir(__dirname);

require('./config/passport')(passport);

app.set("ipaddr", "0.0.0.0");

app.set("port", process.env.PORT || 8888);

app.set("views", __dirname + "/app/views");

app.set("view engine", "ejs");

app.use(express.logger('dev'));

app.use(express.static("public", __dirname + "/public"));

app.use(express.bodyParser());

app.use(express.cookieParser());

app.use(express.session({secret : 'ssnocwebapplication', cookie : {maxAge : 3600000*24*10 }}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

User.getUsers(null, function(err, users) {
  if (!err && users !== null) {
    users.forEach(function(user) {
      participants.all.push(user.local);
    });
  }
  console.log("participants: " + JSON.stringify(participants));
  require('./app/routes')(app, _, io, participants, passport);
  require('./app/socket')(_, io, participants);
});

http.listen(app.get("port"), app.get("ipaddr"), function() {
  console.log(util.formatDate(new Date()) + " Server up and running. Go to http://" + app.get("ipaddr") + ":" + app.get("port"));
});
