var http      = require('http'),
    url       = require('url'),
    //util      = require('util'),
    fileserve = require('node-static'),
    guiserve  = require('./guiserver'),
    port      = 80;
    host      = '194.94.204.39';

// Nodules module reloading    
require.reloadable(function(){
    guiserver = require('./guiserver');
});

//
// Create a node-static server to serve the current directory
//
var file = new(fileserve.Server)('/var/www/isearch');   

http.createServer(function (request, response) {     
	
    request.addListener('end', function () {
	
	    var reqpath = url.parse(request.url).pathname;
	    var handle = true;

		//
	    // I-SEARCH GUI specific handler
	    //
	    if(reqpath.search(/\/server/i) == 0) {
	    	
	    	handle = guiserver.handle(request, response);
	    } 
	    
	    if(handle) {
		    // Go on, if guiserver couldn't handle the request
			if(request.url === '/') {
			    request.url += 'index.html';	    
		    };	
		 
		    file.serve(request, response, function (err, res) {
		    	if (err) {
		    		console.log("> Error serving " + request.url + " - " + err.message);
		    		
		    		if (err.status == 404) { // If the file wasn't found
		    			file.serveFile('/404.html', request, response);
		            } else {
			            response.writeHead(err.status, err.headers);
			            response.write("There was an unspecified error while processing your request.");	
			            response.end();
		            }
		        } else { 
		            console.log("> " + request.url + " - " + res.message);
		        }
		    });
	    }
	});
}).listen(port, host);

console.log('Server running at http://' + host + ':' + port + '/');