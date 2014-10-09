function getStatusIcon(status){
	var icon = '';
	if(status == "GREEN"){
		icon = "/img/green.png";
	} else if(status == "RED"){
		icon = "/img/red.png";
	} else if(status == "YELLOW"){
		icon = "/img/yellow.png";
	}
	return icon;
}

function updateParticipants(participants){
	$('#onlineUsers').html('');
    $('#offlineUsers').html('');
    var map = {};
    for (var sId in participants.online){
      userName = participants.online[sId].userName;
      if (map[userName] == undefined || map[userName] !== sessionId){
        map[userName] = {sId:sId};
      }
    }

    participants.all.forEach(function(userObj){
    	var username = userObj.name;
    	console.log(JSON.stringify(userObj));
    	var user = {
    		userProfileImage: '/img/photo4.png',
    		username: username,
    		status: userObj.status.statusCode,
    		statusIcon: getStatusIcon(userObj.status.statusCode),
    		updatedAt: userObj.status.updatedAt
    	};

    	if(map[username] == undefined){
    		user.userOnlineIcon='/img/grey-dot.png';
    		$target = $('#offlineUsers');
    	} else {
    		user.userOnlineIcon='/img/green-dot.png';
    		$target = $('#onlineUsers');
    	}

    	var $div = $("<div>").loadTemplate($('#people_directory_template'), user);
    	$target.append($div);

    });

}