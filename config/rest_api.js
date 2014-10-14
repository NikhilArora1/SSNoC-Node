var host_url = process.env.REST_API_URL || "http://ec2-54-68-51-131.us-west-2.compute.amazonaws.com:5454/ssnoc";

var RestAPI = {
  'get_all_users' : host_url + '/users',
  'is_password_valid' : host_url + '/user/',
  'get_user' : host_url + '/user/',
  'get_status' : host_url + '/status/userName/',
  'post_new_user' : host_url + '/user/signup',
  'get_wall_messages' : host_url + '/messages/wall',
  'start_measurement' : host_url + '/memory/start',
  'stop_measurement' : host_url + '/memory/stop',
  'delete_memory' : host_url + '/memory',
  'get_default_measurement' : host_url + '/memory',
  'get_latest_statuses' : host_url + '/statuscrumbs',
  'setup_performance' : host_url + '/performance/setup',
  'teardown_performance' : host_url + '/performance/teardown'
};

RestAPI.authenticate_user = function(userName){
  return host_url + '/user/' + userName + '/authenticate'
}

RestAPI.post_status = function(userName){
  return host_url + '/status/' + userName; 
}

RestAPI.post_wall_message = function(userName){
	return host_url + '/message/' + userName;
}

RestAPI.send_chat_message = function(sendinguserName, receivinguserName){
	return host_url + '/message/' + sendinguserName + '/' + receivinguserName;
}

RestAPI.get_chat_messages = function(Username1, Username2){
	return host_url + '/messages/' + Username1 + '/' + Username2;
}

RestAPI.get_users = function(userName){
	return host_url + '/users/' + userName + '/chatbuddies' ;
}

RestAPI.retrieve_message = function(messageID){
	return host_url + '/message/' + messageID;
}

RestAPI.get_interval_measurement = function(timeWindow){
	return host_url + '/memory/interval/' + timeWindow;
}

module.exports = RestAPI;
