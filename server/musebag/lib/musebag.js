/**
 * @package MuseBag - Multimodal Search Interface
 * 
 * @description This file exposes all functions dedicated to the server part of the 
 * Multimodal Search Interface of I-SEARCH.
 * 
 * @author Arnaud Brousseau and Jonas Etzold
 * @company Google Deutschland GmbH, University of Applied Sciences Erfurt
 */

/**
 * Required node modules
 */
var nodeio = require('node.io');

var verifyUser = function(email,pw) {
	
	var jobMethods = {
			input: false,
		    run: function() {
		    	
		    	//Let's get the arguments passed to the script
		        if (!this.options.args[0]) {
		          this.exit('No arguments were given to the dbpedia job');
		        }
		        
		        var email = this.options.args[0];
		        var pw    = this.options.args[1];
		    	
		    	var verifyURL = "http://gdv.fh-erfurt.de/i-search/apc-dummy/index.php?"
		            + 'f=validateUser'
		            + '&email=' + email
		            + '&pw=' + pw;
		    	
		    	this.get(verifyURL, function(error, data, headers) {
		            
		            //Exit if there was a problem with the request
		            if (error) {
		               this.exit(error); 
		            }
		            
		            var verifyResponse = JSON.parse(data);
		            
		            //Check if return data is ok
		            if(verifyResponse.error) {
		            	this.exit(verifyResponse.error);
		            }
		            if(!verifyResponse.user) {
		            	this.exit('The user data was delivered in an invalid format.');
		            }
		            
		            //Exit the Job and return the user data
		            this.emit(verifyResponse.user);
		    	}); //end of get
		    }
	}; // end of jobMethods
	
	//Creates the job
	var verifyJob = new nodeio.Job({timeout:10}, jobMethods);
	nodeio.start(verifyJob, {args: [email,pw]}, callback, true);
};

/**
 * login function
 */
exports.login = function(options, callback){
	verifyUser(options.email,options.pw, function(error, data) {
		//Exit if there was a problem with the request
        if (error) {
        	callback(error, null); 
        }
		//if anything went ok, establish a session with the user data
        
		callback(null, data);
	});
};
