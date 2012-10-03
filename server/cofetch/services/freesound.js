var restler = require('restler'),
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
          "PreviewMP3": sounddata['preview-lq-mp3'],
          "Length": sounddata.duration,
          "Emotions": [],
          "Location": [],
          "Weather": {}
        };

      if(sounddata.geotag) {
        result.Location = [sounddata.geotag.lat || 0, sounddata.geotag.lon || 0, 0 ,0];
      }
      //Ok, got everything here so give the result back
      callback(null, result);
      
    } catch (error) {
      callback(error, null);
    }
  })
  .on('error', function(data,response) {
    callback(response.message, null);
  });

};

var fetchSound = function(query, isGeo, page, callback) {

  if (!query) {
    callback('No arguments were given to the freesound job', null);
    return;
  }

  //Replace spaces
  var query = query.replace(/\s/g,'+');

  //The array for storing the results
  var results = new Array();
  //maximum count of images to retrieve
  var maxResults = 8;
  //page stuff
  var end = page * maxResults;
  var start = end - maxResults;
  var soundPage = Math.ceil(end / 30);

  var freesoundURL = "http://www.freesound.org/api/sounds/search?"
    + 'q=' + query
    + '&p=' + soundPage
    + '&api_key=' + APIKey
    + '&format=json';
  
  //Check if we search for sounds with geolocation
  if (isGeo === 1) {
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
      if(sounds.length < end) {
        end = sounds.length;
      }

      //Fetch sound info for all sounds below the maximum of sounds to retrieve
      var newArguments = [];
      var initializeClosure = function(soundID){
        return function initialize() {
          getSoundData(soundID, this);
        };
      };
      var assembleClosure = function assemble(error, sounditem) {
        if(error) {
          console.log("Freesound error: " + error);
          maxResults--;
        } else {
          results.push(sounditem);
        }
        if (results.length === end) {
          //Exit the job if we're done, i.e Array full
          callback(null, results);
        } else {
          this();
        }
      };
      for(var i=start; i < end; i++) {
        newArguments.push(
          initializeClosure(sounds[i].id),
          assembleClosure
        );
      }
      step.apply(step, newArguments);
    } catch (error) {
      callback(error, results);
    }
  })
  .on('error', function(data,response) {
    callback(response.message, results);
  });
};

//Exposes it publicly
if (typeof module !== 'undefined' && "exports" in module) {
    module.exports.fetchSound = fetchSound;
}