var MemoryRest = require('../models/Memory');

module.exports = function(_, io, participants, passport) {
  return {
    postStartMemoryProfile: function(req, res){
      MemoryRest.startMeasurement(function(err, data){
        if(err){
          res.status(500).send("Error: " + err);
        } else {
          res.send(200);
        }
      });
    },
    postStopMemoryProfile: function(req, res){
      MemoryRest.stopMeasurement(function(err, data){
        if(err){
          res.status(500).send("Error: " + err);
        } else {
          res.send(200);
        }
      });
    },
    postDeleteMemoryProfile: function(req, res){
      MemoryRest.deleteMemory(function(err, data){
        if(err){
          res.status(500).send("Error: " + err);
        } else {
          res.send(200);
        }
      });
    },
    getMemoryProfile: function(req, res){
      var callback = function(err, data){
        res.render("MeasureMemory", {memory: data, timeWindow: req.query.timeWindow});
      };
      console.log("time window: " + req.query.timeWindow);
      if(req.query.timeWindow == undefined){
        MemoryRest.getDefaultMeasurement(callback);
      } else {
        MemoryRest.getIntervalMeasurement(req.query.timeWindow, callback);
      }
    }
  };
};