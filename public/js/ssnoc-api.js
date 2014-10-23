var onlineUsers = '';
var chatBuddy = '';
var userName =  '';
var user = '';

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
    $('#myUser').html('');
	$('#onlineUsers').html('');
    $('#offlineUsers').html('');
    var map = {};
    var name = '';
    var userEle = '';
    for (var sId in participants.online){
      name = participants.online[sId].userName;
      if (map[name] == undefined){
        map[name] = {sId:sId};
      }
    }
    keys = Object.keys(map);
    keys.sort();

    participants.all.forEach(function(userObj){
    	var username = userObj.name;
        var chatEnabled = true;
    	var user = {
    		userProfileImage: '/img/photo4.png',
    		username: username,
    		status: userObj.status.status,
    		statusIcon: getStatusIcon(userObj.status.status),
    		updatedAt: userObj.status.updatedAt
    	};

        if(username === userName){
            user.userOnlineIcon='/img/green-dot.png';
            $target = $('#myUser');
            chatEnabled = false;
        } else if(map[username] == undefined){
    		user.userOnlineIcon='/img/grey-dot.png';
    		$target = $('#offlineUsers');
    	} else {
    		user.userOnlineIcon='/img/green-dot.png';
    		$target = $('#onlineUsers');
    	}

    	var $div = $("<div>").loadTemplate($('#people_directory_template'), user);
        if(chatEnabled){
            $div.find("#launchPrivateChat").click(function(){
                startPrivateChat(username);
            });
        } else {
            $div.find("#launchPrivateChat").remove();
        }
        // administrater user profile
        $div.find("#adminProfile").click(function(){
                adminProfile(username);
            }); 
        
    	$target.append($div);
    });

    onlineUsers = map;
}

function refreshPeopleDirectory(){
    $.ajax({
            url:  '/participants',
            type: 'GET',
            dataType: 'json'
        }).done(function(data) {
            updateParticipants(data);
        });
}

function refreshPublicWall(){
    $.ajax({
            url:  '/wall',
            type: 'GET',
            dataType: 'json'
        }).done(function(data) {
            var wall = $("#messages");
            wall.html('');
            data.forEach(function(message){
                if(message.type == "MESSAGE"){
                    addNewWallMessage(wall, {message: message});
                } else {
                    addNewStatusMessage(wall, {status: message});
                }
            })
        });
}

function refreshChatBuddies(){
    $.ajax({
        url: '/chatBuddies',
        type: 'GET',
        dataType: 'json'
    }).done(function(data){
        $buddies = $("#chatBuddies");
        $buddies.html('');
        data.forEach(function(user){
            $div = createChatBuddyCell(user);
            $buddies.append($div);
        });
    });
}

function addNewWallMessage(wall, data){
    var $div = $("<div>").loadTemplate($("#wall_message_template"), data.message);
    wall.prepend($div);
}

function addNewStatusMessage(wall, data){
    data.status.statusIcon = getStatusIcon(data.status.status);
    var $div = $("<div>").loadTemplate($("#wall_status_template"), data.status);
    wall.prepend($div);
}

function createChatBuddyCell(user){
    var name = user.local.name;
    var icon = '';
    if(onlineUsers[name] == undefined){
        icon='/img/grey-dot.png';
    } else {
        icon='/img/green-dot.png';
    }

    var $div = $("<div>").loadTemplate($("#chat_buddy_user"), {
        username: user.local.name,
        userOnlineIcon: icon
    });

    $div.click(function(){
        startPrivateChat(name);
    });

    return $div;
}

function startPrivateChat(user){
    var url = "/privateChat?name=" + user;
    console.log('starting chat with ' + url);
    window.location = url;
}

function adminProfile(user){
    var url = "/updateProfile?name=" + user;
    console.log('satrting admin profile of '+ user);
    window.location = url;
}

function onNewPrivateMessage(message){
    if(chatBuddy === message.author || chatBuddy === message.target){
        insertChatMessage(message);
    } else if(message.author !== userName) {
        notifyNewMessage(message);
    }
}

function insertChatMessage(chatMessage){
    var $div = $("<div>").loadTemplate($("#message_template"), {
        userProfileImage: '/img/photo4.png',
        username: chatMessage.author,
        timestamp: chatMessage.postedAt,
        message: chatMessage.content
    });
    $("#chatMessages").append($div);
}

function notifyNewMessage(chatMessage){
    var content = chatMessage.content;
    if(content.length > 20){
        content = content.substring(0,20) + "...";
    }
    toastr.success("New message from " + chatMessage.author + ": " + content);
}

function initializeToastr(){
    toastr.options.closeButton = true;
    toastr.options.timeout = 15; // How long the toast will display without user interaction
}

$(document).ready(function(){
    initializeToastr();
});
