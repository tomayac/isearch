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

/**
 * login function
 */
exports.login = function(options, callback){
	
	var verifyURL = "http://gdv.fh-erfurt.de/i-search/apc-dummy/index.php?"
        + 'f=validateUser'
        + '&email=' + options.email
        + '&pw=' + options.pw;

	restler
	.get(verifyURL)
	.on('complete', function(data) {		
		
		//Check if return data is ok
        if(data.error) {
        	callback(data.error, null);
        }
        if(!data.user) {
        	callback('The user data was delivered in an invalid format.', null);
        }
        
        callback(null, data.user);
	})
	.on('error', function(error) {
		callback(error, null);
	});
	
};
