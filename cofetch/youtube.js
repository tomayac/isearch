var nodeio = require('node.io');

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
              //make sure to get not too many tags
              if(i > 6) {
            	  break;
              }
            }
            return tags;
          } else {
            return [];
          }
        };

        var youtubeResponse = JSON.parse(data);
        var videos = youtubeResponse['feed']['entry'];
        
        //No sounds found, get back
        if(videos.length < 1) {
        	this.emit(results);
        	return;
        }
        
        //Adjust the maxResults parameter if there weren't enough results
		if(videos.length < maxResults) {
        	maxResults = videos.length;
        }
        
        var result;
        
        //let's loop through the array of videos
        for (var i=0;i<maxResults;i++) {
            
            result = {
                    "Type": "VideoType",
                    "Name": videos[i]['title']['$t'],
                    "Description": videos[i]['media$group']['media$description']['$t'],
                    "Tags": getTags(videos[i]),
                    "Extension": "",
                    "License": "All right reserved", 
                    "LicenseURL": "http://www.youtube.com",
                    "Author": videos[i].author[0].name['$t'],
                    "Date": videos[i].published['$t'],
                    "Size": "",
                    "URL": "https://www.youtube.com/watch?v="+videos[i]['media$group']['yt$videoid']['$t'],
                    "Preview": videos[i]['media$group']['media$thumbnail'][0].url,
                    "Dimensions": [],
                    "Length": videos[i]['media$group']['yt$duration'].seconds,
                    "Emotions": [],
                    "Location": [],
                    "Weather": {}
                  };
             
            results.push(result);

        } //End for loop
        
        //Exit the Job returning the results array
        this.emit(results);
        
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