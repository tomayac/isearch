var http       = require('http'),
    nodestatic = require('node-static');

var port      = 8081;

//
// Create a node-static server to serve the current directory
//
var staticGui = new(nodestatic.Server)('/var/www/isearch/client/musebag');   

http.createServer(function (request, response) {     
	
    request.addListener('end', function () {
	
	    // Check if the index was requested
		if(request.url === '/') {
		    request.url += 'index.html';	    
	    };	
	 
	    staticGui.serve(request, response, function (err, res) {
	    	if (err) {
	    		console.log("> Error serving " + request.url + " - " + err.message);
	    		
	    		if (err.status == 404) { // If the file wasn't found
	    			file.serveFile('/404.html', 200, {}, request, response);
	            } else {
		            response.writeHead(err.status, err.headers);
		            response.write("There was an unspecified error while processing your request.");	
		            response.end();
	            }
	        } else { 
	            console.log("> " + request.url + " - " + res.message);
	        }
	    }); //End 
	}); //End listener
    
}).listen(port);

console.log('Static MuseBag Server running at port ' + port);