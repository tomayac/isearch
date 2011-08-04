/**
 * Image fetch for Content Object production.
 * Facilitates Flickr API
 */
var nodeio = require('node.io');

var methods = {
	input: false,
	run: function() {

		//Let's get the arguments passed to the script
		if (!this.options.args[0]) {
			this.exit('No arguments were given to the Youtube job');
		}
		var query = this.options.args[0].replace(' ','+');
		var results = this.options.args[1];

		var apiKey = '5226908fe75b3dae6290f60162a501d5';
		var maxResults = 30;
		
		var searchURL = "http://api.flickr.com/services/rest/?"
			+ 'method=flickr.photos.search'
			+ '&api_key=' + apiKey
			+ '&text=' + query
			+ '&has_geo=1'
			+ '&per_page=' + maxResults
			+ '&format=json'
			+ '&nojsoncallback=1'
			+ '&sort=relevance';
		
		//Store the current context
	    var context = this;
		
		//Get results of photo search
		this.get(searchURL, function(error, data, headers) {

			//Exit if there was a problem with the request
			if (error) {
				context.exit(err); 
			}
			
			//Get the photo search result
			var photos = JSON.parse(data).photos.photo;
			//Iterate through every found photo
			for (i=0;i<photos.length;i++) {
				
				//Store the image IDs
				var photoId = photos[i].id;
				
				//Get the image info for the current image
				var infoURL = "http://api.flickr.com/services/rest/?"
					+ 'method=flickr.photos.getInfo'
					+ '&api_key=' + context.apiKey
					+ '&photo_id=' + photoId
					+ '&format=json'
					+ '&nojsoncallback=1';
				
				context.get(infoURL, function(infoerror, data, headers) {
					
					//Exit if there was a problem with the request
					if (infoerror) {
						context.exit(err); 
					}
					
					var infoData = JSON.parse(data).photo;
					
					var tags = new Array;
					for(var t=0; t < infoData.tags.tag.length; t++) {
						tags.push(infoData.tags.tag[t]._content);
					}
					
					var result = {
						"Type": "ImageType",
						"Name": infoData.title,
						"Tags": tags,
						"Extension": infoData.originalformat || 'jpg',
						"Licence": licenses[infoData.license].name, 
						"LicenceURL": licenses[infoData.license].url,
						"Author": infoData.owner.realname || infoData.owner.username,
						"Date": infoData.dates.taken,
						"Size": "",
						"URL": "",
						"Preview": "",
						"Emotions": [],
						"Location": [infoData.location.latitude || 0 ,infoData.location.longitude || 0,0,0],
						"Weather": {}
					};
					
					//Get the image sizes for the current image
					var sizesURL = "http://api.flickr.com/services/rest/?"
						+ 'method=flickr.photos.getSizes'
						+ '&api_key=' + context2.apiKey
						+ '&photo_id=' + photoId
						+ '&format=json'
						+ '&nojsoncallback=1';
					
					
					context.get(sizesURL, function(sizeserror, data, headers) {
						
						//Exit if there was a problem with the request
						if (sizeserror) {
							context.exit(err); 
						}
						
						var sizes = new Array;
						
						var sizeData = JSON.parse(data).sizes.size;
						var sizecount = sizeData.length;
						
						result.Preview = sizeData[0].source;
						result.URL     = sizeData[sizecount-1].source;
						result.Size    = {'width' :sizeData[sizecount-1].width,
					                      'height':sizeData[sizecount-1].height};
						
						console.log(result);
						context.results.push(result);
						
						if (context.results.length===context.maxResults) {
							//Exit the job if we're done, i.e Array full
							context.emit();
			            }
					}); // end images sizes callback
				}); // end image info callback
			} // end for 
		}); // end image search callback
	}
};

//Creates the job
var job = new nodeio.Job({timeout:10}, methods);

//Exposes it publicly
exports.fetch = function(query, results, callback) {
	nodeio.start(job, {args: [query, results]}, callback);
};
/*
var FlickrAPI= require('flickrnode').FlickrAPI,
    sys= require('sys'),
    flickr = new FlickrAPI('5226908fe75b3dae6290f60162a501d5', 'cc06237000c66b6c');

this.fetch = function(query) {

	var q = query.replace(' ','+');
	var photoInfo = new Array;
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

	flickr.photos.search({'text':q,'per_page':30},  function(error, results) {
		if(error){
	      return {'code':100,'body':'Whoops, something went wrong. Try that again.'};
	    }else{

	      var end = false;	
	      // Store photoIDs. Note: These come back in reverse chronological order.
	      for (var x=0; x < results.photo.length; x++) {
	        photoInfo.push({
	          'Type':'ImageType',	
	          'Name':'',
	          'Tags':'',
	          'Extension':'',
	          'License':'',
	          'LicenseURL' :'',
	          'Author' :'',
	          'Date' :'',
	          'Size':'',
	          'URL':'',
	          'Preview':'',
	          'Emotions':'',
	          'Location':'',
	          'Weather':''
	        });
	        };

	      // Get photo information

	      // Loop so that we keep track of the photo order
	      for (var x=0; x < photoInfo.length; x++) {

	        flickr.photos.getSizes(results.photo[x].id, x, function(error2, sizes, idx){
				// Populate array at a specific location, because results come back as fast as possible (not in order)
				if(!error2){
					var sizecount = sizes.size.length;
					photoInfo[x].Preview = sizes.size[0].source;
					photoInfo[x].URL = sizes.size[sizecount-1].source;
					photoInfo[x].Size = {'width' :sizes.size[sizecount-1].width,
							             'height':sizes.size[sizecount-1].height};
				}
	        });

	        //Get taken date, tags etc.
	        flickr.photos.getInfo(results.photo[x].id, '', function(error3, info, idx) {
	        	if(!error3){
		            photoInfo[x].Name = info.title;
		            photoInfo[x].Author = info.owner.realname || info.owner.username;
		            photoInfo[x].Date = info.dates.taken;
		            photoInfo[x].Extension = info.originalformat || 'jpg';
		            photoInfo[x].License = licenses[info.license].name;
		            photoInfo[x].LicenseURL = licenses[info.license].url;
		            photoInfo[x].Location = [info.location.latitude || 0 ,info.location.longitude || 0,0,0];

		            var tags = new Array;
		            for(var t=0; t < info.tags.tag.length; t++) {
		            	tags.push(info.tags.tag[t]._content);
		            }
		            photoInfo[x].Tags = tags;
		            console.log(photoInfo);
		            if(x == (photoInfo.length-1)) {
		            	end = true;
		            }
		        }
	        });

	      }; // for

	      if(end) {
	    	  console.log(photoInfo);
	    	  return {'code':200, 'body':photoInfo};
	      }
	    } // else
	});

};*/