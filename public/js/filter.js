// var User1={local:{name:"jack",status:"ok"}}
// var User2={local:{name:"rose",status:"ok"}}
// var users=[User1,User2];

// @param:
//	searchTarget: string
//	users: list of users
// @return:
//	results: list of users
function userFilter(searchTarget,users){
	var n1=-1,n2=-1;
	var results = [];
	var reg = new RegExp(searchTarget,"i");
	for(i=0;i<users.length;i++){
		n1=users[i].local.name.search(reg,"i");
		n2=users[i].local.status.search(reg,"i");
		if(n1>=0||n2>=0){
			results[results.length]=users[i];
		}
	}
	return results;
}
// var searchTarget="ja";
// userFilter(searchTarget,users);

function messageFilter(searchTarget,messages){
	var n1=-1,n2=-1,n3=-1,n4=-1;
	var results = [];
	var reg = new RegExp(searchTarget,"i");
	for(i=0;i<messages.length;i++){
		if(messages[i].message !== undefined){
			var m = messages[i].message;
			if(m.author != null){
				n1=m.author.search(reg,"i");
			}
			if(m.target != null){
				n2=m.target.search(reg,"i");
			}
			if(m.content != null){
				n3=m.content.search(reg,"i");
			}
			if(m.postedAt != null){
				n4=m.postedAt.search(reg,"i");
			}
		} else {
			// check wall messages for possible statuses
			var s = messages[i].status;
			if(s.username != null){
				n1=s.username.search(reg,"i");
			}
			if(s.status != null){
				n2=s.status.search(reg,"i");
			}
			if(s.updatedAt != null){
				n2=s.updatedAt.search(reg,"i");
			}
		}
		if(n1>=0||n2>=0||n3>=0||n4>=0){
			results[results.length]=messages[i];
		}
	}
	return results;
}

function statusFilter(searchTarget,statuses){
	var n1=-1,n2=-1,n3=-1;
	var results = [];
	var reg = new RegExp(searchTarget,"i");
	for(i=0;i<statuses.length;i++){
		n1=statuses[i].username.search(reg,"i");
		n2=statuses[i].status.search(reg,"i");
		n2=statuses[i].updatedAt.search(reg,"i");
		if(n1>=0||n2>=0||n3>=0){
			results[results.length]=statuses[i];
		}
	}
	return resutls;
}