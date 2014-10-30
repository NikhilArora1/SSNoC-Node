var onlineUsers = '';
var chatBuddy = '';
var userName =  '';
var user = '';

var publicWallMessages = [];
var filteredWallMessages = [];
var wallMessageFilterTerm = '';

var publicAnnouncements = [];
var filteredPublicAnnouncements = [];
var announcementsFilterTerm = '';

var filteredParticipants = [];
var participantsFilterTerm = '';
var participantsFilterType = '';

var privateMessages = [];
var filteredPrivateMessages = [];
var privateMessagesFilterTerm = '';

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

    if(participantsFilterType != "none"){
        participants.all = userFilter(participantsFilterTerm, participantsFilterType, participants.all);
    }

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
        if(privilegeLevel==="Administrator"){
            $div.find("#adminProfile").removeAttr("hidden");
        }
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

function onUsersChanged(){
    refreshPeopleDirectory(participantsFilterType, participantsFilterTerm);
}

function refreshPeopleDirectory(filterType, filterTerm){
    if(filterType == null || filterTerm == ""){
        participantsFilterType = "none";
        participantsFilterTerm = "";
    } else {
        participantsFilterType = filterType;
        participantsFilterTerm = filterTerm;
    }

    $.ajax({
            url:  '/participants',
            type: 'GET',
            dataType: 'json'
        }).done(function(data) {
            updateParticipants(data)
        });
}

function refreshPublicWall(searchTerm){
    $.ajax({
            url:  '/wall',
            type: 'GET',
            dataType: 'json'
        }).done(function(data) {
            var wall = $("#messages");
            wall.html('');
            publicWallMessages = [];
            data.forEach(function(message){
                if(message.type == "MESSAGE"){
                    publicWallMessages.unshift({message: message});
                } else {
                    publicWallMessages.unshift({status: message});
                }
            })
            if(searchTerm == undefined || searchTerm == ""){
                wallMessageFilterTerm = "";
                filteredWallMessages = publicWallMessages;
            } else {
                wallMessageFilterTerm = searchTerm;
                filteredWallMessages = messageFilter(searchTerm, publicWallMessages);
            }
            
            loadMoreWallMessages(wall);
        });
}

function refreshAnnouncements(searchTerm){
    $.ajax({
            url:  '/announcements',
            type: 'GET',
            dataType: 'json'
        }).done(function(data) {
            var wall = $("#announcements");
            wall.html('');
            publicAnnouncements = [];
            data.forEach(function(announcement){
                publicAnnouncements.unshift({message: announcement});
            })
            if(searchTerm == undefined || searchTerm == ""){
                announcementsFilterTerm = "";
                filteredPublicAnnouncements = publicAnnouncements;
            } else {
                announcementsFilterTerm = searchTerm;
                filteredPublicAnnouncements = messageFilter(searchTerm, publicAnnouncements);
            }

            loadMoreAnnouncements(wall);
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

function loadMoreWallMessages(wall){
    var currentCount = wall.children().length;
    if(currentCount < filteredWallMessages.length){
        for(var i=currentCount; i < (currentCount+10) && i < filteredWallMessages.length; i++){
            if(filteredWallMessages[i].message !== undefined){
                addNewWallMessage(wall, filteredWallMessages[i], true);
            } else {
                addNewStatusMessage(wall, filteredWallMessages[i], true);
            }
        }
    }
    if(wall.children().length < filteredWallMessages.length){
        $("#loadMoreMessages").show();
    } else {
        $("#loadMoreMessages").hide();
    }

    if(filteredWallMessages.length == 0 && wallMessageFilterTerm.length > 0){
        $("#noMessagesBar").show();
    } else {
        $("#noMessagesBar").hide();
    }
}

function loadMoreAnnouncements(wall){
    var currentCount = wall.children().length;
    if(currentCount < filteredPublicAnnouncements.length){
        for(var i=currentCount; i < (currentCount+10) && i < filteredPublicAnnouncements.length; i++){
            if(filteredPublicAnnouncements[i].message !== undefined){
                addNewPublicAnnouncement(wall, filteredPublicAnnouncements[i], true);
            }
        }
    }
    if(wall.children().length < filteredPublicAnnouncements.length){
        $("#loadMoreAnnouncements").show();
    } else {
        $("#loadMoreAnnouncements").hide();
    }

    if(filteredPublicAnnouncements.length == 0 && announcementsFilterTerm.length > 0){
        $("#noAnnouncementsBar").show();
    } else {
        $("#noAnnouncementsBar").hide();
    }
}

function wallMessageReceived(wall, data){
    publicWallMessages.unshift(data);
    if(wallMessageFilterTerm.length == 0){
        addNewWallMessage(wall, data, false);
    }
}

function statusMessageReceived(wall, data){
    publicWallMessages.unshift(data);
    if(wallMessageFilterTerm.length == 0){
        addNewStatusMessage(wall, data, false);
    }
    refreshPeopleDirectory(participantsFilterType, participantsFilterTerm);
}

function announcementReceived(wall, data){
    publicAnnouncements.unshift(data);
    if(announcementsFilterTerm.length == 0){
        addNewPublicAnnouncement(wall, data, false);
    }
}

function addNewWallMessage(wall, data, append){
    var $div = $("<div>").loadTemplate($("#wall_message_template"), data.message);
    if(append){
        wall.append($div);
    } else {
        wall.prepend($div);
    }
}

function addNewPublicAnnouncement(wall, data, append){
    var $div = $("<div>").loadTemplate($("#public_announcement_template"), data.message);
    if(append){
        wall.append($div);
    } else {
        wall.prepend($div);
    }
}

function addNewStatusMessage(wall, data, append){
    data.status.statusIcon = getStatusIcon(data.status.status);
    var $div = $("<div>").loadTemplate($("#wall_status_template"), data.status);
    if(append){
        wall.append($div);
    } else {
        wall.prepend($div);
    }
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
    var url = "/adminProfile?name=" + user;
    console.log('satrting admin profile of '+ user);
    window.location = url;
}

function setPrivateMessages(messages, filterTerm){
    if(filterTerm == null || filterTerm == ""){
        privateMessagesFilterTerm = "";
    } else {
        privateMessagesFilterTerm = filterTerm;
    }

    privateMessages = [];
    messages.forEach(function(message){
         privateMessages.unshift({message: message});
    });

    if(privateMessagesFilterTerm.length > 0){
        filteredPrivateMessages = messageFilter(privateMessagesFilterTerm, privateMessages);
    } else {
        filteredPrivateMessages = privateMessages;
    }

    loadMorePrivateMessages();
}

function loadMorePrivateMessages(){
    var wall = $("#chatMessages");
    var currentCount = wall.children().length;
    if(currentCount < filteredPrivateMessages.length){
        for(var i=currentCount; i < (currentCount+10) && i < filteredPrivateMessages.length; i++){
            if(filteredPrivateMessages[i].message !== undefined){
                insertChatMessage(filteredPrivateMessages[i].message, false);
            }
        }
    }
    if(wall.children().length < filteredPrivateMessages.length){
        $("#loadMoreBar").show();
    } else {
        $("#loadMoreBar").hide();
    }

    if(filteredPrivateMessages.length == 0 && privateMessagesFilterTerm.length > 0){
        $("#noMessagesBar").show();
    } else {
        $("#noMessagesBar").hide();
    }
}

function insertChatMessage(chatMessage, append){
    var $div = $("<div>").loadTemplate($("#message_template"), {
        userProfileImage: '/img/photo4.png',
        username: chatMessage.author,
        timestamp: chatMessage.postedAt,
        message: chatMessage.content
    });
    if(append){
        $("#chatMessages").append($div);
    } else {
        $("#chatMessages").prepend($div);
    }
}

function onNewPrivateMessage(message){
    if(chatBuddy === message.author || chatBuddy === message.target){
        if(privateMessagesFilterTerm.length == 0){
            insertChatMessage(message, true);
        }
    } else if(message.author !== userName) {
        notifyNewMessage(message);
    }
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
