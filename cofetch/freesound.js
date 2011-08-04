var nodeio = require('node.io');

var methods = {
    input: false,
    run: function() {
      
      var APIKey = "57e0e646aa4941d69cf383575afec73d";
      
      //Let's get the arguments passed to the script
      if (!this.options.args[0]) {
        this.exit('No arguments were given to the Freesound job');
      }
      var query = this.options.args[0];
      var results = this.options.args[1];
      var isGeo = this.options.args[2];
      
      var maxResults = 10;
      var freesoundURL = "http://tabasco.upf.edu/api/sounds/search/?"
          + 'q=' + query
          + '&api_key=' + APIKey;
      
      if (isGeo) {
        //If we want geotagged sounds
        freesoundURL += '&f=is_geotagged:true';
      }
      //Store the current context
      var that = this;
      
      //Let's go and request our content
      this.get(freesoundURL, function(error, data, headers) {
        
        //Exit if there was a problem with the request
        if (error) {
           that.exit(error); 
        }
        
        var freesoundResponse = JSON.parse(data);
        var sounds = freesoundResponse.sounds;
                
        var i;
        var result;
        var soundID;
        var soundData
        var detailsURL;
        //let's loop through the array of videos
        for (i=0;i<5;i++) {
          
          //We get the ID of a sound
          soundID = sounds[i].id;
          
          //Building of the URL to get the details about a sound
          detailsURL = "http://beta.freesound.org/api/sounds/"
              + soundID
              + '?api_key=' + APIKey;
          
          that.get(detailsURL, function(detailsError, soundResponse, detailsHeaders) {
            //Exit if there was a problem with the request
            if (detailsError) {
               that.exit(detailsError); 
            }
            
            soundData = JSON.parse(soundResponse);
            result = {
              "Type": "SoundType",
              "Name": soundData['original_filename'],
              "Tags": soundData.tags,
              "Extension": soundData.type,
              "Licence": "CC", 
              "LicenceURL": soundData.license,
              "Author": soundData.user.username,
              "Date": soundData.created,
              "Size": "",
              "URL": soundData.url,
              "Preview": soundData.waveform_m,
              "Length": soundData.duration,
              "Emotions": [],
              "Location": [],
              "Weather": {}
            };
            
            results.push(result);
            if (results.length===5) {
              //Exit the job if we're done, i.e Array full
              that.emit();
            }
          }); 
        }
      });
    }
}

//Creates the job
var job = new nodeio.Job({timeout:10}, methods);

//Exposes it publicly
exports.fetch = function(query, results, isGeo, callback) {
  nodeio.start(job, {args: [query, results, isGeo]}, callback);
}