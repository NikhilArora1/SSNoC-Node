function init(){
	var serverBaseUrl = document.domain;

  	var socket = io.connect(serverBaseUrl);

  	var sessionId = '';
  	var userName =  '';

  	socket.on('connect', function () {
    	sessionId = socket.socket.sessionid;
    	$.ajax({
      		url:  '/user',
      		type: 'GET',
      		dataType: 'json'
    	}).done(function(data) {
      		userName = data.local.name;
    	});
  	});

  	socket.on('error', function (reason) {
   		console.log('Unable to connect to server', reason);
  	});

  	socket.on('newWallMessage', function(data){
		$("#messages").prepend("<p> Message | user: " + data.message.author + " date: " 
			+ data.message.postedAt + " content: " + data.message.content + " | </p>");
	});

	socket.on('newStatusMessage', function(data){
		$("#messages").prepend("<p> Status: | user: " + data.status.username + " date: " + data.status.updatedAt 
			+ " status: " + data.status.status + " | </p>");
	});

	$("#submitWallMessage").click(function(){
		var text = $("#wallMessage").val();
		socket.emit('postWallMessage', {username: userName, message: text, timestamp: new Date().toString('yyyy-MM-dd hh:mm')});
		$("#wallMessage").val("");
	});

	$("#submitStatus").click(function(){
		var text = $("#statusMessage").val();
		socket.emit('postStatus', {username: userName, status: text, timestamp: new Date().toString('yyyy-MM-dd hh:mm')});
		$("#statusMessage").val("");
	});
}

$(document).on('ready', init);