/**
 * @package CoFind - Collaborative Search Component
 * 
 * @description This file exposes all functions dedicated to collaborative search
 * within I-SEARCH.
 * 
 * @author Jonas Etzold
 * @company University of Applied Sciences Erfurt
 */
this.title = "CoFind - Collaborative Search Service for I-SEARCH";
this.name = "CoFind";
this.version = "0.1.0";
this.endpoint = "http://isearch.ai.fh-erfurt.de/cofind";

/**
 * getUser function
 */
exports.getUser = function(options, callback){
	var user = {};
	
	//Take options.email to build request URL for external component
	var getUserUrl = "http://www.isearch-project.eu/apc/getUser?" 
				   + "email=" + options.email;
	
	//Use node.io to get the data from the external Authentication/Personalisation Component
	
	//Get status or error of user
	var user = { id: 'dummyID' };
	
	//If user is online return user data, if not throw error 
	if(user) {
		callback(null, user);
	} else {
		callback('User is not logged in to I-SEARCH.', null);
	}
};
//Documentation for getUser function
exports.getUser.description = "Takes an email address of another I-SEARCH user. Function checks if user exists and is available";
exports.getUser.schema = {
  email: { 
    type: 'string',
    optional: false 
  } 
};

/**
 * interfaceSnippet function
 */
exports.interfaceSnippet = function(options, callback){
	var snippet = '<input type="text" name="cofind-invite" value="Enter a Email address to invite..." id="cofind-invite" class="form-text" />' + 
				  '<button id="cofind-invite">Invite</button>' +
	              '</div>' +
	              '<div id="cofind-message">' +
	              '</div>' +
	              '<script></script>';
	
	if(exports.getUser(options.email)) {
		callback(null, snippet);
	} else {
		callback('User is not logged in to I-SEARCH.', null);
	}
};
//Documentation for interfaceSnippet function
exports.interfaceSnippet.description = "Serves a HTML snippet which allows the user to create collaborative search sessions. To get the snippet the user must authenticated by the personalisation component which is checked by the given email address.";
exports.addUser.schema = {
  email: { 
    type: 'string',
    optional: false 
  }
};
