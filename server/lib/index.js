var http      = require('http'),
    url       = require('url'),
    //util      = require('util'),
    fileserve = require('node-static'),
    guiserve  = require('./guiserver'),
    port      = 80;
    host      = '194.94.204.39';

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
	       
		//
	    //I-SEARCH GUI specific handler
	    //
	    if(reqpath.search(/\/server/i) == 0) {
	    	
	    	guiserver.handle(request, response);
	    } 
	    // Go on, if guiserver couldn't handle the request
	    if(response.statusCode === 404) {
	    
			if(request.url === '/') {
			    request.url += 'index.html';	    
		    };	
		 
		    file.serve(request, response, function (err, res) {
		    	if (err) {
		    		if (err.status === 404) { // If the file wasn't found
		    			fileServer.serveFile('/404.html', request, response);
		            }
		            console.log("> Error serving " + request.url + " - " + err.message);
		            response.writeHead(err.status, err.headers);
		            response.end();
		        } else { 
		            console.log("> " + request.url + " - " + res.message);
		        }
		    });
	    }
	});
}).listen(port, host);

console.log('Server running at http://' + host + ':' + port + '/');