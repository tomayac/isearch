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
var restler = require('restler');

var verifyUser = function(email,pw,callback) {
	
	var verifyURL = "http://gdv.fh-erfurt.de/i-search/apc-dummy/index.php?"
        + 'f=validateUser'
        + '&email=' + email
        + '&pw=' + pw;
	
	rest.get(verifyURL)
	.on('complete', function(data) {
		console.log(data);
		
		//Check if return data is ok
        if(data.error) {
        	console.log(data.error);
        	callback(data.error, null);
        }
        if(!data.user) {
        	console.log('The user data was delivered in an invalid format.');
        	callback('The user data was delivered in an invalid format.', null);
        }
        
        callback(null, data.user);
	})
	.on('error', function(error) {
		console.log(error);
		callback(error, null);
	});
};

/**
 * login function
 */
exports.login = function(options, callback){
	
	verifyUser(options.email,options.pw,callback);
};
