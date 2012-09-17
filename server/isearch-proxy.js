/**
 * 
 * @description This component represents the main router for all I-SEARCH related
 * GUI services. Currently it routes to the following services which are hosted
 * on this server:
 * 
 * - Multimodal Search Interface as general GUI for I-SEARCH
 * - Server component of Multimodal Search interface, which handles the communication between GUI and Search Engine
 * - pTag as Personal Content Tagging Service for I-SEARCH
 * - CoFetch for semi-automatic Content Object creation based on the FHE 3D Model Database, Google Sketchup and many other multimedia services.
 *    
 * @author Jonas Etzold
 * 
 */
//Required packages
var httpProxy = require('http-proxy'); 

//Configuration variables
var port = 80;
var options = {
  router: {
    'localhost/cofetch' : '127.0.0.1:8085',
    'localhost'         : '127.0.0.1:8081'	
  }
};

//Check if the server should listen to a user specific port
var arguments = process.argv.splice(2);
if(!isNaN(arguments[0])) {
  port = parseInt(arguments[0]);
}

//Server, Router setup
var proxyServer = httpProxy.createServer(options);
proxyServer.listen(port);

console.log("I-SEARCH proxy is listing on port " + port);