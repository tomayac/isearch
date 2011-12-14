var restler = require('restler'),
    weather = require('./wunderground'),
    step    = require('./step');

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

var getVideoData = function(video, callback) {
  
  if(!video) {
    callback('No video data given!', null);
    return;
  }
  
  var result = {
    "Type": "VideoType",
    "Name": video['title']['$t'],
    "Description": video['media$group']['media$description']['$t'],
    "Tags": getTags(video),
    "Extension": "",
    "License": "All right reserved", 
    "LicenseURL": "http://www.youtube.com",
    "Author": video.author[0].name['$t'],
    "Date": video.published['$t'],
    "Size": "",
    "URL": "https://www.youtube.com/watch?v="+video['media$group']['yt$videoid']['$t'],
    "Preview": video['media$group']['media$thumbnail'][0].url,
    "Dimensions": [],
    "Length": video['media$group']['yt$duration'].seconds,
    "Emotions": [],
    "Location": [],
    "Weather": {}
  };
  
  //Check if we have an location
  if(video['georss$where']) {
    var loc = video['georss$where']['gml$Point']['gml$pos']['$t'];
    loc = loc.split(' ');
    result.Location = [loc[0] || 0 ,loc[1] || 0,0,0];
    
    //get weather data if we have a location
    weather.fetchWeather({Date: result.Date, Location: result.Location}, function(error, data) {
      if(error) {
        console.log('No weather data found for video with name "' + result.Name + '"');
      } else {
        result.Weather = data;
      }
      //Ok, got everything here so return the result
      callback(null, result);
    }); //end fetch weather
  } else {
    //No location, hence no weather, just return the result
    callback(null, result);
  }
};

var fetchVideo = function(query, geo, callback) {
  if (!query) {
    callback('No arguments were given to the YouTube job', null);
    return;
  }
  
  //Replace spaces
  var query = query.replace(/\s/g,'+');
  //Store if we search for videos with geolocation
  var geo = geo;
  
  //The array for storing the results
  var results = new Array();
  //maximum count of images to retrieve
  var maxResults = 10;
  
  var youtubeURL = "https://gdata.youtube.com/feeds/api/videos?"
    + 'q=' + query
    + '&orderby=relevance'
    + '&max-results=' + maxResults
    + '&v=2'
    + '&alt=json';
  
  if(geo) {
    //If we want geotagged videos
    youtubeURL += '&location=';
  }
  
  restler
  .get(youtubeURL, {
    parser: restler.parsers.json
  })
  .on('success', function(data) {    
    try {
      
      var videos = data['feed']['entry'] || [];
      
      //No videos found, get back
      if(videos.length < 1) {
        callback(null, results);
        return;
      }
      //Adjust the maxResults parameter if there weren't enough results
      if(videos.length < maxResults) {
        maxResults = videos.length;
      }
      
      //let's loop through the array of videos
      for (var i=0; i < maxResults; i++) {
        
        step(
            function initialize() {
              getVideoData(videos[i], this);
            },
            function assemble(error, videoitem) {
              if(error) {
                console.log("YouTube error: " + error);
                maxResults--;
              } else {
                results.push(videoitem);
              }
              if (results.length === maxResults) {
                //Exit the job if we're done, i.e Array full
                callback(null, results);
              }
            }
          ); //End step
      } //End for loop
      
    } catch (error) {
      callback(error, null);
    }
  })
  .on('error', function(data,response) {
    callback(response.message, null);
  });  
};

//Exposes it publicly
if (typeof module !== 'undefined' && "exports" in module) {
    module.exports.fetchVideo = fetchVideo; 
} 