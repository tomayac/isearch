/**
 * 
 * @description This component represents the main router for all I-SEARCH related
 * GUI services. Currently it routes to the following services which are hosted
 * on this server:
 * 
 * - pTag as Personal Content Tagging Service for I-SEARCH
 * - CoFind as Collaborative Search Service for I-SEARCH
 * - CoFetch for Semi-automatic Content Object creation based on the FHE 3D Model Database or 3D Warehouse of Google
 * - Multimodal Search Interface as general GUI for I-SEARCH
 *    
 * @author Jonas Etzold
 * 
 */
//Required packages
var httpProxy = require('http-proxy');
var server = 'isearch.ai.fh-erfurt.de';
var port   = 80;

//Configuration variables
var options = {
  router: {
    'isearch.ai.fh-erfurt.de/ptag'    : 'isearch.ai.fh-erfurt.de:8083',
    'isearch.ai.fh-erfurt.de/cofind'  : 'isearch.ai.fh-erfurt.de:8084',
    'isearch.ai.fh-erfurt.de/cofetch' : 'isearch.ai.fh-erfurt.de:8085',
    'isearch.ai.fh-erfurt.de'         : 'isearch.ai.fh-erfurt.de:8081'	
  }
};

//Server, Router setup
var proxyServer = httpProxy.createServer(options);
proxyServer.listen(port);
console.log("I-SEARCH proxy is listing on port " + port + " at " + server);