var stopWordsString = "a,able,about,across,after,all,almost,also,am,among,an,and,any,are,as,at,be,because,been,but,by,can,cannot,could,dear,did,do,does,either,else,ever,every,for,from,get,got,had,has,have,he,her,hers,him,his,how,however,i,if,in,into,is,it,its,just,least,let,like,likely,may,me,might,most,must,my,neither,no,nor,not,of,off,often,on,only,or,other,our,own,rather,said,say,says,she,should,since,so,some,than,that,the,their,them,then,there,these,they,this,tis,to,too,twas,us,wants,was,we,were,what,when,where,which,while,who,whom,why,will,with,would,yet,you,your";
var stopWordsArray = stopWordsString.split(",");

console.log("stop words: " + stopWordsArray);

// var User1={local:{name:"jack",status:"ok"}}
// var User2={local:{name:"rose",status:"ok"}}
// var users=[User1,User2];

// @param:
//	searchTarget: string
// 	filterType: string (name or status)
//	users: list of users
// @return:
//	results: list of users
function userFilter(searchTarget, filterType, users){
	var n1=-1,n2=-1;
	var results = [];
	var reg = new RegExp(searchTarget,"i");
	console.log("search target: " + searchTarget + " filter: " + filterType);
	for(i=0;i<users.length;i++){
		console.log("user: " + JSON.stringify(users[i]));
		if(filterType == "name"){
			n1=users[i].name.search(reg,"i");
		} else if(filterType == "status"){
			n2=users[i].status.status.search(reg,"i");
		}
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

	// chop searchTarget into an array of search words
	var searchTerms = searchTarget.split(" ");
	console.log("search terms: " + JSON.stringify(searchTerms));
	for(i=searchTerms.length; i >=0 ; i--){
		if(stopWordsArray.indexOf(searchTerms[i]) > -1){
			console.log("filtering search term: " + searchTerms[i]);
			searchTerms.splice(i, 1);
		}
	}
	console.log("filtered search terms: " + JSON.stringify(searchTerms));

	if(searchTerms.length == 0){
		// if searchTarget is all stop words,
		// or empty filter
		// return an empty result set.
		return results;
	}
	var expression = "(" + searchTerms.join("|") + ")"; 
	console.log("regex pattern: " + expression);
	var reg = new RegExp(expression,"i");
	for(i=0;i<messages.length;i++){
		// reset filters
		n1=n2=n3=n4=-1;
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
				n3=s.updatedAt.search(reg,"i");
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