function init(){
	var serverBaseUrl = document.domain;

  	var socket = io.connect(serverBaseUrl);

  	var sessionId = '';
  	var userName =  '';
  	var user = '';

  	socket.on('connect', function () {
    	sessionId = socket.socket.sessionid;
    	$.ajax({
      		url:  '/user',
      		type: 'GET',
      		dataType: 'json'
    	}).done(function(data) {
      		userName = data.local.name;
      		user = data.local;
      		$("#username").append(userName);
      		socket.emit('newUser', {id: sessionId, name: userName});
      		console.log("user connected: " + userName);
    	});
  	});

  	socket.on('newConnection', function (data) {
    	updateParticipants(data.participants);
  	});

  	socket.on('userDisconnected', function(data) {
    	updateParticipants(data.participants);
  	});

  	socket.on('error', function (reason) {
   		console.log('Unable to connect to server', reason);
  	});

  	socket.on('newWallMessage', function(data){
		addNewWallMessage($("#messages"), data);
	});

	socket.on('newStatusMessage', function(data){
		console.log("new status message: " + JSON.stringify(data) );
		addNewStatusMessage($("#messages"), data);
		refreshPeopleDirectory();
	});

	$("#submitWallMessage").click(function(){
		var text = $("#wallMessage").val();
		socket.emit('postWallMessage', {username: userName, message: text, timestamp: new Date().toString('yyyy-MM-dd hh:mm')});
		$("#wallMessage").val("");
	});

	$("#selectStatus").change(function(){
		var text = $("#selectStatus").val();
		socket.emit('postStatus', {username: userName, status: text, timestamp: new Date().toString('yyyy-MM-dd hh:mm')});
		$("#statusMessage").val("");
	});

	socket.on('newPrivateMessage', function(data){
		console.log("private message received... " + JSON.stringify(data));
		onNewPrivateMessage(data.message);
	});

	$("#privateChatSubmit").click(function(){
		var text = $("#privateChatInput").val();
		var user = userName;
		var buddy = chatBuddy;
		console.log("send private message: " + user + " / " + buddy + " / " + text);
		socket.emit('sendPrivateMessage', {author: user, target: buddy, message: text, timestamp: new Date().toString('yyyy-MM-dd hh:mm')});
	});

	$.addTemplateFormatter({
		StatusFormatter : function(value, template){
			if(value == "GREEN"){
				return "OK";
			} else if(value == "RED"){
				return "Emergency";
			} else if(value == "YELLOW"){
				return "Help";
			}
		}
	});
}

$(document).on('ready', init);