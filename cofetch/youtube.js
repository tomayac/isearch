var nodeio = require('node.io');

var methods = {
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
          + '&orderby=published'
          + '&max-results=' + maxResults
          + '&v=2'
          + '&alt=json';
        
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
                
        var i;
        var result;
        //let's loop through the array of videos
        for (i=0;i<10;i++) {
          result = {
            "Type": "VideoType",
            "Name": videos[i]['title']['$t'],
            "Tags": getTags(videos[i]),
            "Extension": "",
            "Licence": "All right reserved", 
            "LicenceURL": "http://www.youtube.com",
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
        }
        
        //Exit the Job returning the results array
        this.emit(results);
        
      });
    }
};

//Creates the job
var job = new nodeio.Job({timeout:10}, methods);

//Exposes it publicly
exports.fetch = function(query, callback) {
  nodeio.start(job, {args: [query]}, callback, true);
};