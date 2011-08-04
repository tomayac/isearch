/**
 * Image fetch for Content Object production.
 * Facilitates Flickr API, GoogleMaps API and wunderground.org
 */
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
					photoInfo[idx].Preview = sizes.size[0].source;
					photoInfo[idx].URL = sizes.size[sizecount-1].source;
					photoInfo[idx].Size = {'width' :sizes.size[sizecount-1].width,
							               'height':sizes.size[sizecount-1].height};
				}
	        });
	        
	        //Get taken date, tags etc.
	        flickr.photos.getInfo(results.photo[x].id, '', function(error3, info, idx) {
	        	if(!error3){
		            photoInfo[idx].Name = info.title;
		            photoInfo[idx].Author = info.owner.realname || info.owner.username;
		            photoInfo[idx].Date = info.dates.taken;
		            photoInfo[idx].Extension = info.originalformat || 'jpg';
		            photoInfo[idx].License = licenses[info.license].name;
		            photoInfo[idx].LicenseURL = licenses[info.license].url;
		            photoInfo[idx].Location = [info.location.latitude || 0 ,info.location.longitude || 0,0,0];
		            
		            var tags = new Array;
		            for(var t=0; t < info.tags.tag.length; t++) {
		            	tags.push(info.tags.tag[t]._content);
		            }
		            photoInfo[idx].Tags = tags;
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
	
};