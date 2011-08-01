var http  = require('http'),
    url   = require('url');

this.handle = function(request, response)  {	
    
	console.log("I-SEARCH specific server handle called");
    
	var reqpath = url.parse(request.url).pathname; 
	
	if(reqpath.search(/\/server\/parse/i) == 0) {
		
		var body = "You called a server procedure of I-SEARCH. It is treated as a test.";
		
		response.writeHead(200,"OK",{ 'Content-Length': Buffer.byteLength(body,'utf8'),
			                          'Content-Type'  : 'text/plain' });
		
		response.write(body);
		response.end();
		
		return false;
	}
	
	//the requested function was not found, so tell the calling process that the request still needs handling
	return true;
    
};
