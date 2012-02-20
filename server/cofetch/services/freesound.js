var restler = require('restler'),
    weather = require('./wunderground'),
    step    = require('../lib/step');

var APIKey = "e642ab56df1f4cfc87f419fbf9ac5088";

var getSoundData = function(soundId, callback) {
  
  if(!soundId) {
    callback('No sound ID given!', null);
    return;
  }
  
  //Building of the URL to get the details about a sound
  var detailsURL = "http://www.freesound.org/api/sounds/"
      + soundId
      + '?api_key=' + APIKey
      + '&format=json';
  
  //DEBUG
  //console.log(detailsURL);
  
  restler
  .get(detailsURL)
  .on('success', function(sounddata) { 
    try {
      var result = {
          "Type": "SoundType",
          "Name": sounddata['original_filename'],
          "Description": sounddata.description,
          "Tags": sounddata.tags,
          "Extension": sounddata.type,
          "License": "CC", 
          "LicenseURL": sounddata.license,
          "Author": sounddata.user.username,
          "Date": sounddata.created,
          "Size": sounddata.filesize,
          "URL": sounddata.serve + "?api_key=" + APIKey,
          "Preview": sounddata.waveform_m,
          "PreviewOGG": sounddata['preview-lq-ogg'],
          "Length": sounddata.duration,
          "Emotions": [],
          "Location": [],
          "Weather": {}
        };
      
      if(sounddata.geotag) {
        result.Location = [sounddata.geotag.lat || 0, sounddata.geotag.lon || 0, 0 ,0];
        //get weather data if we have a location
        weather.fetchWeather({Date: sounddata.created, Location: result.Location}, function(error, weatherdata) {
          if(error) {
            console.log('No weather data found for sound with id ' + soundId);
          } else {
            result.Weather = weatherdata;
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

var fetchSound = function(query, isGeo, callback) {
  
  if (!query) {
    callback('No arguments were given to the freesound job', null);
    return;
  }
  
  //Replace spaces
  var query = query.replace(/\s/g,'+');
  //Store if we search for sounds with geolocation
  var isGeo = isGeo;
  
  //The array for storing the results
  var results = new Array();
  //maximum count of images to retrieve
  var maxResults = 2;
  
  var freesoundURL = "http://www.freesound.org/api/sounds/search?"
    + 'q=' + query
    + '&p=1'
    + '&api_key=' + APIKey
    + '&format=json';
   
  if (isGeo) {
    //If we want geotagged sounds
    freesoundURL += '&f=is_geotagged:true';
  }
  
  //DEBUG:
  //console.log(freesoundURL);
  
  restler
  .get(freesoundURL, {
    parser: restler.parsers.json
  })
  .on('success', function(data) {
    try {      
      //No sounds found, get back
      if(!data.sounds) {
        callback(null, results);
        return;
      }
      
      if(data.sounds.length < 1) {
        callback(null, results);
        return;
      }
      
      var sounds = data.sounds || new Array();
      
      //Adjust the maxResults parameter if there weren't enough results
      if(sounds.length < maxResults) {
        maxResults = sounds.length;
      }
      
      //Fetch sound info for all sounds below the maximum of sounds to retrieve   
      for(var i=0; i < maxResults; i++) {         
        step(
          function initialize() {
            getSoundData(sounds[i].id, this);
          },
          function assemble(error, sounditem) {
            if(error) {
              console.log("Freesound error: " + error);
              maxResults--;
            } else {
              results.push(sounditem);
            }
            if (results.length === maxResults) {
              //Exit the job if we're done, i.e Array full
              callback(null, results);
            }
          }
        ); //End step
      }
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
    module.exports.fetchSound = fetchSound; 
} 