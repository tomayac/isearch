/**
 * @package CoFind - Collaborative Search Component
 * 
 * @description This is the main entry point for serving the functionalities for collaborative search
 * within I-SEARCH.
 * 
 * @author Jonas Etzold
 * @company University of Applied Sciences Erfurt
 */
var webservice = require('./lib/webservice'),
    cofind = require('./cofind');

webservice.createServer(cofind).listen(8084);
console.log(' > CoFind webservice started on port 8084'.cyan);