var request = require('request');
var rest_api = require('../../config/rest_api');

function Memory(createdAt, crumbID, usedVolatile, remainingVolatile, usedPersistent, remainingPersistent){
	this.createdAt = createdAt;
	this.crumbID = crumbID;
	this.usedVolatile = usedVolatile;
	this.remainingVolatile = remainingVolatile;
	this.usedPersistent = usedPersistent;
	this.availablePersistent = availablePersistent;
}

Memory.startMeasurement=function(callback){
	var options = {
			url : rest_api.start_measurement,
			json: true
	};
	request.post(options, function(err, res, body){
		if(err){
			callback(err, null);
			return;
		}
		else{
			console.log("Memory Measurement Started");
			console.log(body);
			callback(null, null);
			return;
			}
	});
};

Memory.stopMeasurement=function(callback){
	var options = {
			url : rest_api.stop_measurement,
			json: true
	};
	request.post(options, function(err, res, body){
		if(err){
			callback(err, null);
			return;
		}
		else{
			console.log("Memory Measurement Ended");
			console.log(body);
			callback(null, null);
			return;
			}
	});
};

Memory.deleteMemory=function(callback){
	var options = {
			url : rest_api.delete_memory,
			json: true
	};
	request.del(options, function(err, res, body){
		if(err){
			callback(err, null);
			return;
		}
		else{
			callback(null, null);
			return;
			}
	});
};

Memory.getDefaultMeasurement=function(callback){
	var options = {
			url : rest_api.get_default_measurement,
			json: true
	};
	request.get(options, function(err, res, body){
		if(err){
			callback(err, null);
			return;
		}
		else{
			console.log(body);
			var memory=body.map(function(item, idx, arr){
				return new Memory(item.createdAt, item.crumbID, item.usedVolatile, item.remainingVolatile, item.usedPersistent, item.remainingPersistent);
			});
			callback(null, memory);
		}
	});
}

Memory.getIntervalMeasurement=function(timeWindow, callback){
	var options = {
			url : rest_api.get_interval_measurement(timeWindow),
			json: true
	};
	request.get(options, function(err, res, body){
		if(err){
			callback(err, null);
			return;
		}
		else{
			console.log(body);
			var memory=body.map(function(item, idx, arr){
				return new Memory(item.createdAt, item.crumbID, item.usedVolatile, item.remainingVolatile, item.usedPersistent, item.remainingPersistent);
			});
			callback(null, memory);
		}
	});
}

module.exports = Memory;