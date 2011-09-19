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
    'isearch.ai.fh-erfurt.de/'        : '127.0.0.1:8081',
    'isearch.ai.fh-erfurt.de/musebag' : '127.0.0.1:8082',
    'isearch.ai.fh-erfurt.de/pTag'    : '127.0.0.1:8083',
    'isearch.ai.fh-erfurt.de/cofind'  : '127.0.0.1:8084',
    'isearch.ai.fh-erfurt.de/cofetch' : '127.0.0.1:8085'
  }
};

//Server, Router setup
var proxyServer = httpProxy.createServer(options);
proxyServer.listen(80);