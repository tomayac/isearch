/**
 * @author Jonas
 */
var http      = require('http'),
    url       = require('url'),
    fileserve = require('node-static'),
    fetch     = require('./fetch');

var port      = 8081;
    host      = '194.94.204.39';

//
//Create a node-static server to serve the current directory
//
var file = new(fileserve.Server)('/var/www/isearch/cofetch/GUI');   

http.createServer(function (request, response) {     
 
 //Error handle function
 var handleError = function(error) {
	 
	 var data   = '{"error":1,"message":"'+error+'"}';
     var status = {"code":404,"message":"Not found"};
	 
	 response.writeHead(status.code,status.message,{ 
     	    'Content-Length': Buffer.byteLength(data,'utf8'),
		  	'Content-Type'  : 'application/json; charset=utf8',
		  	'Access-Control-Max-Age': '3628800',
		  	'Access-Control-Allow-Methods':'GET'
	 });
	 response.write(data);
	 response.end();
	 return;
 };
	
 request.addListener('end', function () {
	
	    var reqpath = url.parse(request.url).pathname;
	    //Get the parameters of the request
    	var parameters = reqpath.replace('/','').split('/');
		
    	//
	    // CoFetch specific handlers
	    //
	    if(parameters[0] == 'get') {
	    	
	    	var status = {"code":200,"message":"OK"};
	    	var index = parseInt(parameters[1]);
	    	
	    	if(isNaN(index)) {
	    		
	    		handleError("Missing index parameter.");
	    		
	    	} else {
	    		
		    	fetch.get(index, function(error, data){
		    		
		    		if(error) {
		    			handleError(error);
		    		}
		    		
		    		console.log("Content Object Data fetched!");
		    		
		    		data = '_cofetchcb({"response":'+data+'})';
		    		
		    		response.writeHead(status.code,status.message,{ 
		    			                	'Content-Length': Buffer.byteLength(data,'utf8'),
										  	'Content-Type'  : 'application/json; charset=utf8',
										  	'Access-Control-Max-Age': '3628800',
										  	'Access-Control-Allow-Methods':'GET'
									   });
					response.write(data);
					response.end();
		    	});
	    	}
	    	
	    } else {
		    // Handle normal static site requests
			if(request.url === '/') {
			    request.url += 'index.html';	    
		    };	
		 
		    file.serve(request, response, function (err, res) {
		    	if (err) {
		    		console.log("> Error serving " + request.url + " - " + err.message);
		    		
			        response.writeHead(err.status, err.headers);
			        response.write("There was an error while processing your request: " + err.message);	
			        response.end();
		            
		        } else { 
		            console.log("> " + request.url + " - " + res.message);
		        }
		    });
	    }
	});
}).listen(port, host);

console.log('Cofetch Server running at http://' + host + ':' + port + '/');