var nodeio = require('node.io'),
    querystring = require('querystring');

var urlDecode = function (utftext) {
	var string = "";
	var i = 0;
	var c = c1 = c2 = 0;

	while ( i < utftext.length ) {

		c = utftext.charCodeAt(i);

		if (c < 128) {
			string += String.fromCharCode(c);
			i++;
		}
		else if((c > 191) && (c < 224)) {
			c2 = utftext.charCodeAt(i+1);
			string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
			i += 2;
		}
		else {
			c2 = utftext.charCodeAt(i+1);
			c3 = utftext.charCodeAt(i+2);
			string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
			i += 3;
		}

	}

	return string;
}

var videoMethods = {
    input: false,
    run: function() {
      
      //Let's get the arguments passed to the script
      if (!this.options.args[0]) {
        this.exit('No arguments were given to the Youtube job');
      }
      var query = this.options.args[0].replace(/\s/g,'+');
      var results = new Array();
      
      var maxResults = 10;
      var youtubeURL = "https://gdata.youtube.com/feeds/api/videos?"
          + 'q=' + query
          + '&orderby=relevance'
          + '&max-results=' + maxResults
          + '&v=2'
          + '&alt=json';
      
      console.log("Now fetching " + maxResults + " YouTube videos for query '" + query + "'.");
      
      //Let's go and request our content
      this.get(youtubeURL, function(error, data, headers) {
    	  
        //Exit if there was a problem with the request
        if (error) {
           this.exit(error); 
        }
        
        //Function to get tags
        var getTags = function(videoEntry) {
          var categories = videoEntry['category'];
          var tags = [];
          if (categories) {
            var i;
            //Loop through the categories. NB: the first item is skipped because it's always a URL
            for (i=1; i<categories.length; i++) {
              tags.push(categories[i].term);
            }
          } else {
            return [];
          }
        };

        var youtubeResponse = JSON.parse(data);
        var videos = youtubeResponse['feed']['entry'];
        
        //Adjust the maxResults parameter if there weren't enough results
		if(videos.length < maxResults) {
        	maxResults = videos.length;
        }
        
        var result;
        var context = this;
        
        //let's loop through the array of videos
        for (var i=0;i<maxResults;i++) {
          
          var vInfoUrl = 'http://youtube.com/get_video_info?video_id=' + videos[i]['media$group']['yt$videoid']['$t'];
        	
          //Get the specific video content
          this.get(vInfoUrl, function(error, data, headers) {
              
            //Exit if there was a problem with the request
            if (error) {
              this.exit(error); 
            }
            
            var vInfoResponse = querystring.parse(data);
            var vInfoUrls = urlDecode(vInfoResponse['url_encoded_fmt_stream_map']).split(',');
            var vDataUrl = '';
            
            for(var u=0; u < vInfoUrls.length; u++) {
            	vInfoUrls[u] = vInfoUrls[u].substring(vInfoUrls[u].indexOf('=')+1,vInfoUrls[u].lastIndexOf(';') < 0 ? vInfoUrls[u].length : vInfoUrls[u].lastIndexOf(';'));
            	if(vInfoUrls[u].indexOf('video/mp4') > 0) {
            		vDataUrl = vInfoUrls[u];
            	}
            }
            
            console.log(vInfoUrls);
            console.log('data url:');
            console.log(vDataUrl);
            
            result = {
                    "Type": "VideoType",
                    "Name": context.videos[i]['title']['$t'],
                    "Tags": context.getTags(videos[i]),
                    "Extension": "",
                    "License": "All right reserved", 
                    "LicenseURL": "http://www.youtube.com",
                    "Author": context.videos[i].author[0].name['$t'],
                    "Date": context.videos[i].published['$t'],
                    "Size": "",
                    "URL": "https://www.youtube.com/watch?v="+context.videos[i]['media$group']['yt$videoid']['$t'],
                    "DataURL": vDataUrl,
                    "Preview": context.videos[i]['media$group']['media$thumbnail'][0].url,
                    "Dimensions": [],
                    "Length": context.videos[i]['media$group']['yt$duration'].seconds,
                    "Emotions": [],
                    "Location": [],
                    "Weather": {}
                  };
             
            results.push(result);
             
            //Exit the Job returning the results array
            this.emit(results);
          });
        } //End for loop
      });
    }
};

var fetchVideo = function(query, callback) {
	//Creates the job
	var videoJob = new nodeio.Job({timeout:10}, videoMethods);
	nodeio.start(videoJob, {args: [query]}, callback, true);
};

//Exposes it publicly
if (typeof module !== 'undefined' && "exports" in module) {
	  module.exports.fetchVideo = fetchVideo; 
} 