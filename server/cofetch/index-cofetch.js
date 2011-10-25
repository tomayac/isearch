/**
 * @author Jonas
 */
var http      = require('http'),
    url       = require('url'),
    fileserve = require('node-static'),
    restler   = require('restler'),
    qs        = require('querystring'),
    fetch     = require('./fetch'),
    util      = require('util'),
    rucod     = require('./store');

var port      = 8085;

//
//Create a node-static server to serve the current directory
//
var file = new(fileserve.Server)('/var/www/isearch/client/cofetch');   

http.createServer(function (request, response) {     
	//Set response timeout to 5 min
	request.socket.setTimeout((5 * 60 * 1000));
	
	//Error handle function
	var handleError = function(error) {

		var data   = JSON.stringify({error:1,message: error});
	    var status = {"code":418,"message":"I am a teapot"};
	    
		response.writeHead(status.code,status.message,{ 
	    	    'Content-Length': Buffer.byteLength(data,'utf8'),
			  	'Content-Type'  : 'application/json; charset=utf8',
			  	'Access-Control-Max-Age': '3628800',
			  	'Access-Control-Allow-Methods':'GET'
		});
		response.write(data);
		response.end();
	};
	
	//Fetch helper function
	var handleFetch = function(keywords, category, index, automatic, callback) {
		
		var cofetcher = new fetch.Fetch();
		var result = [];
		
		var fetchCallback = function(error, data) {
			
			if(error) {
				callback(error, null);
			} else {
				
				//Add retrieved content object data to result array
				result.push(data);
				console.log("Content Object Data fetched for query '" + keywords[index] + "' with index " + index + "!");
				
				//Go for the next search keyword
				index++;
				
				if(index < keywords.length) {
					
					//If data for the given keyword already exists, we do not need to get it again
					rucod.exists(keywords[index], category, function(data) {
						if(data != undefined) {
							console.log("Stored data loaded for query " + (index+1) +" of " + keywords.length + ": '" + keywords[index] + "'...");
							fetchCallback(null,data);
						} else {
							console.log("Fetching data for query " + (index+1) +" of " + keywords.length + ": '" + keywords[index] + "'...");
							cofetcher.get(keywords[index], category, index, automatic, fetchCallback);
						}
					});
				
				} else {
					
					console.log("Fetched all content object data!");
					callback(null, result);
					
				} //End fetch if	
			} //End error if
		}; //End fetchCallback function
		
		//If data for the given keyword already exists, we do not need to get it again
		rucod.exists(keywords[index], category, function(data) {
			if(data != undefined) {
				console.log("Stored data loaded for query " + (index+1) +" of " + keywords.length + ": '" + keywords[index] + "'...");
				fetchCallback(null,data);
			} else {
				console.log("Fetching data for query " + (index+1) +" of " + keywords.length + ": '" + keywords[index] + "'...");
				cofetcher.get(keywords[index], category, index, automatic, fetchCallback);
			}
		});
		
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
	    	
	    	var keywords = decodeURI(parameters[1]);
	    	    keywords = keywords.split(",");
	    	var category = decodeURIComponent(parameters[2]);
	    	var automatic = parseInt(parameters[3]);
	    	
	    	//console.log('k:' + keywords + ' c:' + category + ' a:' + automatic);
	    	
	    	if(keywords.length < 1 || (keywords.length > 0 && keywords[0].length < 3) || category.length < 3 || isNaN(automatic)) {
	    		
	    		handleError("Missing or wrong parameters. Please verify that you submitted at least one keyword and the corresponding category.");
	    		
	    	} else {
	    		
	    		response.writeContinue();
	    		
	    		handleFetch(keywords, category, 0, automatic, function(error, result) {
	    			
	    			if(error) {
	    				handleError(error);
	    			} else {
	    			
		    			//Decide weather to send data back for user verification or store the data directly as RUCoD
						if(automatic) {
	
				        	rucod.storeAutomaticInput(result, false, function(error, data) {
				        		 
				        		if(error) {

				        			handleError('Automatic storing ended with errors listed below:\n\r' + error);
				    			
				        		} else {

									data = '_cofetchcb({"response":' + JSON.stringify(data) + '})';
									 
									response.writeHead(status.code,status.message,{ 
										'Content-Length': Buffer.byteLength(data,'utf8'),
									    'Content-Type'  : 'plain/text; charset=utf8'
									});
									response.write(data);
									response.end(); 
				    			}
				        	 });
				        	
						} else {
							
							//Store all results as JSON files
							rucod.storeJsonInput(result, function(error, data) {
								if(error) {
									console.log('Error while storing the JSON files for the corrosponding results.');
								} else {
									console.log('Fetched result stored in JSON files.');
								}
							});
							
							//Do it with verification of user
							data = '_cofetchcb({"response":' + JSON.stringify(result) + '})';
				    		
				    		response.writeHead(status.code,status.message,{ 
			                	'Content-Length': Buffer.byteLength(data,'utf8'),
							  	'Content-Type'  : 'application/json; charset=utf8',
							  	'Access-Control-Max-Age': '3628800',
							  	'Access-Control-Allow-Methods':'GET'
						    });
							response.write(data);
							response.end();
						} // End automatic if
	    			} //End error if
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
        	 
        	 rucod.store(coJson, true, false, false, function(error,info) {
        		 if(error) {
        			 handleError(error);
        		 } else {
	        		 response.writeHead(status.code,status.message,{ 
	                	'Content-Length': Buffer.byteLength(info,'utf8'),
					  	'Content-Type'  : 'plain/text; charset=utf8'
					 });
					 response.write(info);
					 response.end();
        		 }
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