var nodeio = require('node.io'),
    querystring = require('querystring');

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
            var vInfoUrls = new Buffer(vInfoResponse['url_encoded_fmt_stream_map'] || '', 'base64').toString('utf8').split(',');
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
                    "Name": videos[i]['title']['$t'],
                    "Tags": getTags(videos[i]),
                    "Extension": "",
                    "License": "All right reserved", 
                    "LicenseURL": "http://www.youtube.com",
                    "Author": videos[i].author[0].name['$t'],
                    "Date": videos[i].published['$t'],
                    "Size": "",
                    "URL": "https://www.youtube.com/watch?v="+videos[i]['media$group']['yt$videoid']['$t'],
                    "DataURL": vDataUrl,
                    "Preview": videos[i]['media$group']['media$thumbnail'][0].url,
                    "Dimensions": [],
                    "Length": videos[i]['media$group']['yt$duration'].seconds,
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