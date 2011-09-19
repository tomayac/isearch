/**
 * @package MuseBag - Multimodal Search Interface
 * 
 * @description This is the main entry point for the server functionalities of the Multimodal
 * Search Interface of I-SEARCH.
 * 
 * @author Arnaud Brousseau and Jonas Etzold
 * @company Google Deutschland GmbH, University of Applied Sciences Erfurt
 */
var webservice = require('./lib/webservice'),
    musebag = require('./musebag');


// Nodules module reloading    
require.reloadable(function(){
	musebag = require('./musebag');
});

webservice.createServer(musebag).listen(8082);
console.log(' > pTag webservice started on port 8082'.cyan);
