var MessageRest = require('../models/MessageRest');
var PerformanceRest =require('../models/Performance');

module.exports = function(_, io, participants, passport) {

  var testRunning = false;
  var postRequestCounter = 0;
  var getRequestCounter = 0;
  var postRequestLimit = 1000;
  var nextRequest = 0;
  var testContent = "abcdefghijlmnopqrstu";
  var timeoutObject = null;
  var startTime = null;

  var setupTest = function(callback){
    PerformanceRest.setupPerformance(function(err){
        console.log("Setting up performance tests: " + err);
        callback();
     });
  }

  var initialize = function(duration, callback){
    if(!testRunning){
      postRequestCounter = 0;
      getRequestCounter = 0;
      start(duration, callback);
    } else {
      console.log("test is already running");
      callback();
    }
  }

  var start = function(duration, callback){
    startTime = new Date();
    testRunning = true;
    console.log("duration: " + duration);
    timeoutObject = setTimeout(function(){
      end();
    }, duration);
    spamRequests();
    callback();
  }

  var end = function(message, callback){
    if(testRunning){
      testRunning = false;
      clearTimeout(timeoutObject);
      timeoutObject = null;
      broadcastResults(message);
      PerformanceRest.teardownPerformance(function(err){
        if(callback){
          callback();
        }
      });
    } else {
      if(callback){
          callback();
        }
    }
  }

  var broadcastResults = function(message){
    var elapsedTime = (new Date().getTime() - startTime.getTime())/1000;
    if(message == undefined){
      message = "Tests Finished Successfully.";
    }
    io.sockets.emit('measurePerformanceEnded', {
      getRequestsPerSecond: getRequestCounter/elapsedTime,
      postRequestsPerSecond: postRequestCounter/elapsedTime,
      elapsedTime: elapsedTime,
      message: message
    });
  }

  var spamRequests = function(){
    if(testRunning){
      console.log("postRequestCounter: " + postRequestCounter + " | request limit: " + postRequestLimit);
      if(postRequestCounter < postRequestLimit){
          MessageRest.postWallMessage("TEST", testContent, "2014-12-12 12:12", function(){
            postRequestCounter++;
            MessageRest.getWallMessages(function(){
              getRequestCounter++;
              spamRequests();
            });
          });
      } else {
        end("POST Request Limit Reached (Limit:" + postRequestLimit + ")");
      }
    }
  }

  return {
    isTestRunning: function(){
      return testRunning;
    },
  	getPerformancePage: function(req, res){
      res.render("MeasurePerformance");
  	},
  	startPerformanceTests: function(req, res){
      setupTest(function(){
        initialize(req.body.testDuration * 1000, function(){
          res.send(200);
        });
      })
  	},
  	endPerformanceTests: function(req, res){
      end("Test ended by user", function(){
         res.send(200);
      })
  	}
  };
};