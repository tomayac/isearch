/**
 * @package MuseBag - Multimodal Search Interface
 * 
 * @description This file exposes all functions dedicated to the server part of the 
 * Multimodal Search Interface of I-SEARCH.
 * 
 * @author Arnaud Brousseau and Jonas Etzold
 * @company Google Deutschland GmbH, University of Applied Sciences Erfurt
 */
this.title = "MuseBag - The Multimodal Search Interface for I-SEARCH";
this.name = "MuseBag";
this.version = "0.1.0";
this.endpoint = "http://isearch.ai.fh-erfurt.de/musebag";

//The parse function
exports.parse = function(options, callback){
	var body = "You called the server procedure 'parse' of I-SEARCH. It is treated as a test.";
  	callback(null, body);
};
//Documentation for parse function
exports.parse.description = "This is the parse method, it parses the query contents from the GUI form. It generates a request RUCoD header and transmit it to the Multimodal Query Formulator";
exports.parse.schema = {
  query: { 
    type: 'string',
    optional: false 
  }
};
