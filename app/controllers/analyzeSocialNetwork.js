var SNARest = require('../models/SocialNetworkAnalyzer');

module.exports = function(_, io, participants, passport) {
  return {
    getSocialNetworkAnalysis: function(req, res){
      console.log("time window: " + req.query.timeWindow);
      SNARest.getUnconnectedUsers(req.query.timeWindow, function(err, groups){
        //res.json(200, groups);
        res.render("AnalyzeSocialNetwork", {groups: groups, timeWindow: req.query.timeWindow});
      });
    }
  };
};