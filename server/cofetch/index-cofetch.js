/**
 * @author Jonas
 */
var http      = require('http'),
    url       = require('url'),
    fileserve = require('node-static'),
    restler   = require('restler'),
    qs        = require('querystring'),
    fetch     = require('./fetch'),
    rucod     = require('./store');

var port      = 8085;

//
//Create a node-static server to serve the current directory
//
var file = new(fileserve.Server)('/var/www/isearch/client/cofetch');   

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
 
 var reqpath = url.parse(request.url).pathname;
 //Get the parameters of the request
 var parameters = reqpath.replace('/','').split('/');
 var status = {"code":200,"message":"OK"};
 var postData = '';
 
 if (request.method == 'POST') {
 
	 request.addListener('data', function(data) {
		 if (parameters[0] == 'post') {
			 postData += data;	
	     }
	 });
 
 }
	
 request.addListener('end', function () {
    	
    	//
	    // CoFetch specific handlers
	    //
	    if(parameters[0] == 'get') {
	    	
	    	console.log(parameters);
	    	var keywords = parameters[1].split(',');
	    	var category = parameters[2];
	    	var automatic = parameters[3];
	    	console.log('k:' + keywords + ' c:' + category + ' a:' + automatic);
	    	if(isNaN(index)) {
	    		
	    		handleError("Missing index parameter.");
	    		
	    	} else {
	    		
	    		var userQueries = {};
	    		//Check if we want to use special queries for each media type
	    		if(parameters.indexOf('text') != -1) {
	    			var ti = parameters.indexOf('text') +1;
	    			userQueries.Text = parameters[ti].replace(/[+]/g,' ');
	    		}
	    		if(parameters.indexOf('image') != -1) {
	    			var ii = parameters.indexOf('image') +1;
	    			userQueries.Image = parameters[ii].replace(/[+]/g,' ');
	    		}
	    		if(parameters.indexOf('video') != -1) {
	    			var vi = parameters.indexOf('video') +1;
	    			userQueries.Video = parameters[vi].replace(/[+]/g,' ');
	    		}
	    		if(parameters.indexOf('sound') != -1) {
	    			var si = parameters.indexOf('sound') +1;
	    			userQueries.Sound = parameters[si].replace(/[+]/g,' ');
	    		}
	    		
	    		var cofetcher = new fetch.Fetch();
	    		cofetcher.get(index, userQueries, function(error, data){
		    		
		    		if(error) {
		    			
		    			handleError(error);
		    			
		    		} else {
		    		
			    		console.log("Content Object Data fetched!");
			    		
			    		data = '_cofetchcb({"response":' + JSON.stringify(data) + '})';
			    		
			    		response.writeHead(status.code,status.message,{ 
			    			                	'Content-Length': Buffer.byteLength(data,'utf8'),
											  	'Content-Type'  : 'application/json; charset=utf8',
											  	'Access-Control-Max-Age': '3628800',
											  	'Access-Control-Allow-Methods':'GET'
										   });
						response.write(data);
						response.end();
		    		}
		    	});
	    	}
	    	
	    } else if (parameters[0] == 'getPart') {
	    	var type  = parameters[1] || '';
	    	var query = parameters[2].replace(/[+]/g,' ') || '';
	    	
	    	var cofetcher = new fetch.Fetch();
    		cofetcher.getPart(type, query, function(error, data){
	    		
	    		if(error) {
	    			
	    			handleError(error);
	    			
	    		} else {
	    		
		    		console.log("Results for '" + type + "' with query '" + query + "' retrieved!");
		    		
		    		data = '_cofetchcb({"response":' + JSON.stringify(data) + '})';
		    		
		    		response.writeHead(status.code,status.message,{ 
		    			                	'Content-Length': Buffer.byteLength(data,'utf8'),
										  	'Content-Type'  : 'application/json; charset=utf8',
										  	'Access-Control-Max-Age': '3628800',
										  	'Access-Control-Allow-Methods':'GET'
									   });
					response.write(data);
					response.end();
	    		}
	    	});
	    	
        } else if (parameters[0] == 'post') {
        	 //Store the JSON content object data
        	 //console.log('Debug output: ');
        	 //console.log(postData);
        	 var coJson = JSON.parse(postData);
        	 
        	 rucod.store(coJson,false,function(info) {
        		 response.writeHead(status.code,status.message,{ 
	                	'Content-Length': Buffer.byteLength(info,'utf8'),
					  	'Content-Type'  : 'plain/text; charset=utf8'
				 });
				 response.write(info);
				 response.end(); 
        	 });
             	
	    } else if(parameters[0] == 'getCat') {
	    
	    	var serverURL = "http://gdv.fh-erfurt.de/modeldb/?do=getCategoryPaths";
	    	
	    	restler
	    	.get(serverURL)
	    	.on('complete', function(data) {		
	    		
	    		data = JSON.stringify(data);
	    		
	    		response.writeHead(status.code,status.message,{ 
                	'Content-Length': Buffer.byteLength(data,'utf8'),
				  	'Content-Type'  : 'application/json; charset=utf8',
				  	'Access-Control-Max-Age': '3628800',
				  	'Access-Control-Allow-Methods':'GET'
			    });
				response.write(data);
				response.end();
	    		
	    	})
	    	.on('error', function(error) {
	    		handleError(error);
	    	});
	    	
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
}).listen(port);

console.log('Cofetch Server running at port ' + port);