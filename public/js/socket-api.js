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
		var status = data.status.status;
		if(status == "GREEN"){
			data.status.statusIcon = "/img/green.png";
		} else if(status == "RED"){
			data.status.statusIcon = "/img/red.png";
		} else if(status == "YELLOW"){
			data.status.statusIcon = "/img/yellow.png";
		}
		var $div = $("<div>").loadTemplate($("#wall_status_template"), data.status);
		$("#messages").prepend($div);
		//$("#messages").prepend("<p> Status: | user: " + data.status.username + " date: " + data.status.updatedAt 
		//	+ " status: " + data.status.status + " | </p>");
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