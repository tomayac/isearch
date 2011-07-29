var http  = require('http'),
    url   = require('url');

this.handle = function(request, response)  {	
    
	console.log("I-SEARCH specific server handle called");
    
	var reqpath = url.parse(request.url).pathname; 
	
	if(reqpath.search(/parse/i) == 0) {
		
		var body = "You called a server procedure of I-SEARCH. It is treated as a test.";
		
		response.writeHead(200,"OK",{ 'Content-Length': body.byteLength(),
			                          'Content-Type'  : 'text/plain' });
		
		response.write(body);
		response.end();
	}
	else {
		//the requested function was not found
		response.statusCode = 404;
	}
    
};
