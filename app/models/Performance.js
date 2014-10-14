var request = require('request');
var rest_api = require('../../config/rest_api');

function Performance(postsPerSecond, getsPerSecond){
	this.postsPerSecond = postsPerSecond;
	this.getsPerSecond = getsPerSecond;
}

Performance.setupPerformance=function(callback){
	var options = {
			url : rest_api.setup_performance,
			json : true
	};
	request.post(options, function(err, res, body){
		if(err){
			callback(err, null);
			return;
		}
		else{
			console.log("Performance Setup");
			console.log(body);
			callback(null, null);
			return;
		}
	});
};

Performance.teardownPerformance=function(callback){
	var options = {
			url : rest_api.teardown_performance,
			json : true
	};
	request.post(options, function(err, res, body){
		if(err){
			callback(err, null);
			return;
		}
		else{
			console.log("Performance Teardown");
			console.log(body);
			callback(null, null);
			return;
		}
	});
};

module.exports = Performance;