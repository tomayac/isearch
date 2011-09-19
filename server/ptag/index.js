/**
 * @package pTag - Personal Content Tagging Component
 * 
 * @description This is the main entry point for serving the functionalities for personal content tagging
 * within I-SEARCH.
 * 
 * @author Jonas Etzold
 * @company University of Applied Sciences Erfurt
 */
var webservice = require('webservice'),
    ptag = require('./ptag');

webservice.createServer(ptag).listen(8083);
console.log(' > pTag webservice started on port 8083'.cyan);