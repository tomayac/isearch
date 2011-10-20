var nodeio = require('node.io');

var threedMethods = {
	input: false,
	run: function() {

		//Let's get the arguments passed to the script
		if (!this.options.args[0]) {
			this.exit('No arguments were given to the Google SketchUp job');
		}
		//console.log(this.options.args);
		
		var query = this.options.args[0].replace(/\s/g,'+');
		var results = new Array();

		var maxResults = 10;
		
		var licenses = [
	                   { "name": "All Rights Reserved", "url": "" },
	                   { "name": "Attribution-NonCommercial-ShareAlike License", "url": "http://creativecommons.org/licenses/by-nc-sa/2.0/"},
	                   { "name": "Attribution-NonCommercial License", "url": "http://creativecommons.org/licenses/by-nc/2.0/"},
	                   { "name": "Attribution-NonCommercial-NoDerivs License", "url": "http://creativecommons.org/licenses/by-nc-nd/2.0/" },
	                   { "name": "Attribution License", "url": "http://creativecommons.org/licenses/by/2.0/" },
	                   { "name": "Attribution-ShareAlike License", "url": "http://creativecommons.org/licenses/by-sa/2.0/" },
	                   { "name": "Attribution-NoDerivs License", "url": "http://creativecommons.org/licenses/by-nd/2.0/" },
	                   { "name": "No known copyright restrictions", "url": "http://www.flickr.com/commons/usage/" },
	                   { "name": "United States Government Work", "url": "http://www.usa.gov/copyright.shtml" }
	               ];

		var searchURL = "http://sketchup.google.com/3dwarehouse/data/entities?"
			+ 'q=title%3A' + query + '+is%3Amodel+filetype%3Azip'
			+ '&scoring=t'
			+ '&max-results=10'
			+ '&file=zip'
			+ '&alt=json';
		
		//add "is%3Ageo+" to q= parameter to filter search for geo tagged models
		//console.log(searchURL);
		
		//Store the current context
	    var context = this;
		
		//Get results of photo search
		this.get(searchURL, function(error, data, headers) {

			//Exit if there was a problem with the request
			if (error) {
				context.exit(error); 
			}
			
			var models = new Array();
			
			try {
				//Get the photo search result
				models = JSON.parse(data).feed.entry;
			} catch(e) {}
			
			//No sounds found, get back
	        if(models.length < 1) {
	        	context.emit(results);
	        	return;
	        }
			
			//Adjust the maxResults parameter if there weren't enough results
			if(models.length < maxResults) {
	        	maxResults = models.length;
	        }
			
			//Iterate through every found photo
			for (var i=0;i<maxResults;i++) {
				
				//Store the model IDs
				var modelId = models[i]['id']['$t'];
				
				var fileinfo = models[i]['media$group']['media$content'][models[i]['media$group']['media$content'].length-1];
				var url = fileinfo['url'];
				var filesize = fileinfo['fileSize'];  
				var ext = 'zip';
				
				if(fileinfo['type'].search(/.kmz/g) != -1) {
					url = url.replace(/rtyp=k2/g,'rtyp=zip');
					url = url.replace(/rtyp=s6/g,'rtyp=zip');
					url = url.replace(/rtyp=s7/g,'rtyp=zip');
				} else {
					ext = fileinfo['type'].substr(fileinfo['type'].lastIndexOf('.')+1);
				}
				
				var filesize = fileinfo['fileSize'];    
				    
				var gml = '0 0';
				
				if(models[i]['gml$Point']) {
					gml = models[i]['gml$Point']['gml$pos']['$t'];
				}
				gml = gml.split(' ');
				    
				var result = {
					"Type": "Object3d",
					"Category": "",
		            "CategoryPath": "",
					"Name": models[i]['title']['$t'],
					"Description": models[i]['summary']['$t'],
					"Tags": [],
					"Extension": ext,
					"License": 'Google 3D Warehouse License', 
					"LicenseURL": 'http://sketchup.google.com/intl/en/3dwh/tos.html',
					"Author": models[i]['author'][0]['name']['$t'] + ' (' + models[i]['author'][0]['uri']['$t'] + ')',
					"Date": models[i]['published']['$t'],
					"Size": filesize,
					"URL": url,
					"Preview": models[i]['media$group']['media$thumbnail'][0]['url'],
					"Emotions": [],
					"Location": [gml[0],gml[1],0,0],
					"Weather": {}
				};
				
				results.push(result);
				
			} // end for 
			
			//Exit the Job returning the results array
	        this.emit(results);
			
		}); // end model search callback
	}
};

var fetchThreed = function(query, callback) {
	//Creates the job
	var threedJob = new nodeio.Job({timeout:10}, threedMethods);
	nodeio.start(threedJob, {args: [query]}, callback, true);
};

//Exposes it publicly
if (typeof module !== 'undefined' && "exports" in module) {
	  module.exports.fetchThreed = fetchThreed; 
}   
