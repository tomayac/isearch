/**
 * 
 * @description This component represents the main router for all I-SEARCH related
 * GUI services. Currently it routes to the following services which are hosted
 * on this server:
 * 
 * - Multimodal Search Interface as general GUI for I-SEARCH
 * - Server component of Multimodal Search interface, which handles the communication between GUI and Search Engine
 * - pTag as Personal Content Tagging Service for I-SEARCH
 * - CoFind as Collaborativ Search Service for I-SEARCH
 * - CoFetch for Semi-automatic Content Object creation based on the FHE 3D Model Database
 *    
 * @author Jonas Etzold
 * 
 */
//Required packages
var httpProxy = require('http-proxy'); 

//Configuration variables
var options = {
  router: {
    'localhost/ptag'    : '127.0.0.1:8083',
    'localhost/cofind'  : '127.0.0.1:8084',
    'localhost/cofetch' : '127.0.0.1:8085',
    'localhost'         : '127.0.0.1:8081'	
  }
};

//Server, Router setup
var proxyServer = httpProxy.createServer(options);
proxyServer.listen(80);
console.log("I-SEARCH proxy is listing on port 80 at localhost");