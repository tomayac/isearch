/**
 * Image fetch for Content Object production.
 * Facilitates Flickr API with node.io
 */
var restler = require('restler'),
    weather = require('./wunderground'),
    step    = require('./step');

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

//Flickr API Key
var apiKey = '5226908fe75b3dae6290f60162a501d5';

var getImageInfo = function(imageId, callback) {
  if(!imageId) {
    callback('No image ID given!', null);
    return;
  }
  
  //Get the image info for the current image
  var infoURL = "http://api.flickr.com/services/rest/?"
    + 'method=flickr.photos.getInfo'
    + '&api_key=' + apiKey
    + '&photo_id=' + imageId
    + '&format=json'
    + '&nojsoncallback=1'; 
  
  restler
  .get(infoURL, {
    parser: restler.parsers.json
  }).on('success', function(data) {    
    try { 
      
      var photo = data.photo || {};
      
      //First, grab the user tags of the image
      var tags = new Array();
      
      if(photo.tags) {
        for(var t=0; t < photo.tags.tag.length; t++) {
          tags.push(photo.tags.tag[t]['_content']);
          //make sure to get not too many tags
          if(t > 6) {
            break;
          }
        }
      }
      //then collect all the data we can get from this request
      var result = {
        "FlickrId" : imageId,  
        "Type": "ImageType",
        "Name": photo.title['_content'] || "",
        "Description": photo.description['_content'] || "",
        "Tags": tags,
        "Extension": photo.originalformat || 'jpg',
        "License": licenses[photo.license].name, 
        "LicenseURL": licenses[photo.license].url,
        "Author": photo.owner.realname || photo.owner.username,
        "Date": photo.dates.taken,
        "Size": "",
        "URL": "",
        "Preview": "",
        "Emotions": [],
        "Location": [],
        "Weather": {}
      };
      
      //Check if we have an location
      if(photo.location) {
        result.Location = [photo.location.latitude || 0 ,photo.location.longitude || 0,0,0];
        
        //get weather data if we have a location
        weather.fetchWeather({Date: photo.dates.taken, Location: result.Location}, function(error, data) {
          if(error) {
            console.log('No weather data found for image with id ' + imageId);
          } else {
            result.Weather = data;
          }
          //Ok, got everything here so give the result back
          callback(null, result);
        });
      } else {
        //No location, hence no weather, just return the result
        callback(null, result);
      }
      
    } catch (error) {
      callback(error, null);
    }
  })
  .on('error', function(data,response) {
    callback(response.message, null);
  });  
};

var getImageSize = function(imageId, callback) {
  if(!imageId) {
    callback('No image ID given!', null);
    return;
  }
  
  //Get the image sizes for the current image
  var sizesURL = "http://api.flickr.com/services/rest/?"
    + 'method=flickr.photos.getSizes'
    + '&api_key=' + apiKey
    + '&photo_id=' + imageId
    + '&format=json'
    + '&nojsoncallback=1';
  
  restler
  .get(sizesURL, {
    parser: restler.parsers.json
  })
  .on('success', function(data) {    
    try { 
      
      var result = {};
      
      var sizeData = data.sizes.size;
      var sizecount = sizeData.length;
      
      //Get the biggest available image index
      var sizeindex = sizecount-1;
      if(sizeData[sizeindex].label == 'Original') {
        sizeindex -= 1;
      }
      
      result.Preview = sizeData[0].source;
      result.URL     = sizeData[sizeindex].source;
      //Image size calculating: width x height x (24Bit = 3 Byte) / ( 5 = 1/5 of the bitmap size = the estimated jpg size)   
      result.Size    = (sizeData[sizeindex].width * sizeData[sizeindex].height * 3) / 5;
      
      callback(null, result);
  
    } catch (error) {
      callback(error, null);
    }
  })
  .on('error', function(data,response) {
    callback(response.message, null);
  }); 
};

var fetchImage = function(query, geo, callback) {
  
  if (!query) {
    callback('No arguments were given to the Flickr job', null);
    return;
  }
  
  //Replace spaces
  var query = query.replace(/\s/g,'+');
  //Store if we search for images with geolocation
  var geo = geo;
  
  //The array for storing the results
  var results = new Array();
  //maximum count of images to retrieve
  var maxResults = 10;
  
  var searchURL = "http://api.flickr.com/services/rest/?"
    + 'method=flickr.photos.search'
    + '&api_key=' + apiKey
    + '&text=' + query;
  
  if(geo == 1) {
    searchURL += '&has_geo=1';
  }
  
  searchURL += '&per_page=' + maxResults
    + '&format=json'
    + '&nojsoncallback=1'
    + '&sort=relevance';
  
  //DEBUG:
  //console.log(searchURL);
  
  restler
  .get(searchURL, {
    parser: restler.parsers.json
  })
  .on('success', function(data) {
    try {
     
      var photos = data.photos.photo || new Array();
      
      //No images found, get back
      if(photos.length < 1) {
        callback(null, results);
        return;
      }
  
      //Adjust the maxResults parameter if there weren't enough results
      if(photos.length < maxResults) {
        maxResults = photos.length;
      }
      
      //Fetch image info for all images below the maximum of images to retrieve 
      for(var i=0; i < maxResults; i++) {
      
        step(
          function initialize() {
              getImageInfo(photos[i].id, this.parallel());
              getImageSize(photos[i].id, this.parallel());
          },
          function assemble(error, info, size) {
            if(error) {
              console.log("Flickr error: " + error);
              maxResults--;
            } else {
              info.Size    = size.Size || "";
              info.URL     = size.URL || "";
              info.Preview = size.Preview || "";

              results.push(info);
            }
            if (results.length === maxResults) {
              //Exit the job if we're done, i.e Array full
              callback(null, results);
            }
          }
        ); //End step
      }; //End for
      
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
    module.exports.fetchImage = fetchImage; 
}   
