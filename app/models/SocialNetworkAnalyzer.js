var request = require('request');
var rest_api = require('../../config/rest_api');

function SocialNetworkAnalyzer(){

}

SocialNetworkAnalyzer.getUnconnectedUsers=function(timeWindow, callback){

	var url = rest_api.get_unconnected_users;
	if(timeWindow != null){
		url = rest_api.get_unconnected_users_with_interval(timeWindow);
	}

	var options = {
			url : url,
			json: true
	};
	request.get(options, function(err, res, body){
		if(err){
			callback(err, null);
			return;
		}
		else{
			console.log(body);
			var groups=body.map(function(item, idx, arr){
				return item.users;
			});
			callback(null, groups);
		}
	});
};

module.exports = SocialNetworkAnalyzer;