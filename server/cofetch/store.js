/**
 * This script takes the JSON data of a Content Object and stores it as json
 * files. It further provides functions for converting the json files to RUCoD
 * Headers including Real-World descriptor files.
 * 
 * @author Jonas
 */
var fs          = require('fs'), 
    nodeio      = require('node.io'),
    restler     = require('restler'),
    querystring = require('querystring'),
    weather     = require('./services/wunderground');

var basepath = '../../client/cofetch/output';
var publicOutputUrl = 'http://isearch.ai.fh-erfurt.de/cofetch/output';
var baseName = '';

var mime = new Array();
mime['jpg'] = 'image/jpeg';
mime['png'] = 'image/png';
mime['3ds'] = 'application/x-3ds';
mime['vrml'] = 'x-world/x-vrml';
mime['blend'] = 'application/x-blender';
mime['dwg'] = 'application/x-dwg';
mime['dxf'] = 'application/x-dxf';
mime['lwo'] = 'image/x-lwo';
mime['max'] = 'application/x-max';
mime['mb'] = 'application/x-mb';
mime['obj'] = 'application/octet-stream';
mime['wrl'] = 'x-world/x-vrml';
mime['ogg'] = 'audio/ogg';
mime['oga'] = 'audio/ogg';
mime['ogv'] = 'video/ogg';
mime['wav'] = 'audio/x-wav';
mime['mp4'] = 'video/mp4';
mime['mp3'] = 'audio/mpeg';
mime['webm'] = 'video/webm';
mime['flv'] = 'video/x-flv';

//enhance the array prototype to have a unique function which prevents
//double entries within an array
Array.prototype.unique = function() {

  var o = {};
  var tmp = [];

  for ( var i = 0; i < this.length; i++) {
    o[this[i]] = true;
  }

  for ( var i in o) {
    tmp[tmp.length] = i;
  }

  return tmp;

};

var getISODateString = function(d) {
  function pad(n) {
    return n < 10 ? '0' + n : n;
  }
  ;
  return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-'
  + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':'
  + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + 'Z';
};

var encodeXml = function(s) {
  return (s
      .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\t/g, '&#x9;').replace(/\n/g, '&#xA;').replace(/\r/g, '&#xD;')
  );
};

var getLastFileVersion = function(fileOutputPath,baseName,returnNextVersion) {
  var version = 1;
  var latestName = baseName;
  var exists = fs.existsSync(fileOutputPath + baseName + '_' + version + '.json');
  while(exists) {
    latestName = baseName + '_' + version;
    version++;
    exists = fs.existsSync(fileOutputPath + baseName + '_' + version + '.json');
  }
  if(returnNextVersion) {
    return baseName + '_' + version;
  } else {
    return latestName;
  }
};

var getVideoSourceUrl = function(youtubeLink, id, callback) {

  var result = false;

  var videoId = youtubeLink.substr(youtubeLink.lastIndexOf('=') + 1);
  var infoUrl = 'http://youtube.com/get_video_info?video_id=' + videoId;

  restler
  .get(infoUrl)
  .on('complete', function(data) {    
    try {
      var vInfoResponse = querystring.parse(data);

      if (vInfoResponse['status'] === "fail") {
        throw 'The video seems to be unavaiable in your country. Please choose another one.';
      }

      var vInfoUrls = vInfoResponse['url_encoded_fmt_stream_map'].split(',');
      var vDataUrl = '';

      for ( var u = 0; u < vInfoUrls.length; u++) {
        vInfoUrls[u] = decodeURIComponent(vInfoUrls[u].replace(/\+/g, " "));
        //get everything after 'url=' 
        vInfoUrls[u] = vInfoUrls[u].substring(
            vInfoUrls[u].indexOf('=') + 1,
            vInfoUrls[u].lastIndexOf(';') < 0 ? vInfoUrls[u].length : vInfoUrls[u].lastIndexOf(';')
        );
        //get the right video format
        if (vInfoUrls[u].indexOf('video/mp4') > 0) {
          callback(null, id, decodeURIComponent(vInfoUrls[u]));
          break;
        }
      }

    } catch (error) {
      callback(error, id, null);
    }
  })
  .on('error', function(data,response) {
    callback(response.message, id, null);
  }); 

};

var getWeatherData = function(co, callback) {
  if(co.Files) {
    var requestCount = 0;
    var wdate = null;
    for(var f = 0; f < co.Files.length; f++) {
      if(!co.Files[f].Location) {
        continue;
      }
      if(co.Files[f].Location.length > 1) {
        requestCount++;
        wdate = co.Files[f].Date.replace('T',' ').replace('.000Z','');
        //Start weather data query
        weather.fetchWeather(f, {Date: wdate, Location: co.Files[f].Location}, function(error, data, id) {
          if(error || !data) {
            console.log('No weather data found for content object item with id ' + id);
          } else {
            co.Files[id].Weather = data;
          }
          requestCount--;
          
          if(requestCount < 1) {
            //Ok, got everything here so give the result back
            callback(co);
          }
        });
      }
    }
    if(requestCount < 1) {
      //This case happens if no location information is stored within the selected items
      //so we simply call the callback
      callback(co);
    }
  } else {
    callback(co);
  }
};

var storeMultipleContentObjectData = function(data, onlyJson, callback) {

  var options = {
      timeout : 10, // Timeout after 10 seconds
      max : 1, // Run 1 thread concurrently (when run() is async)
      retries : 3, // Threads can retry 3 times before failing
      flatten : true
  };

  var job = new nodeio.Job(
      options,
      {
        input : function(start, num, callback) {
          // Handling the input
          // Let's get the arguments passed to the script
          if (!this.options.args[0]) {
            this.exit('No arguments were given to the multiple CO store job');
          }
          // We won't allow more than one input line to be processed as once
          if (num > 1) {
            this.exit('The take parameter can not be set higher than 1 for this job');
          }

          var data = this.options.args[0];

          if (start < data.length) {
            // Return the current result object
            callback([ data[start] ]);

          } else {
            // There is nothing left for the job, so stop it
            callback(null, false);
          }
        },
        run : function(input) {
          //if the data is already loaded from file we don't need to save it again
          if(input.fromFile) {
            var data = {
              message : 'Skipped saving of content object with file origin.'  
            };
            console.log(data.message);
            this.emit(data);
            return;
          }
          
          var onlyJson = false;

          if (this.options.args[1]) {
            onlyJson = true;
          }

          // Preserve the context of this function
          var context = this;

          exports.store(input, true, true, onlyJson, function(error, data) {

            var endData = "";

            if (error) {
              endData = "Error CO '" + input.Name + "' - " + error + "\n";
            } else {
              endData = "CO '" + input.Name + "' - " + data.message + "\n";
            }

            data.message = endData;
            context.emit(data);
          });
        }
      });

  nodeio.start(job, {
    args : [ data, onlyJson ]
  }, function(error, data) {

    if (error) {
      callback(error, null);
      return;
    }
    callback(null, data);

  }, true);

};

/**
 * Initializes the store object and sets important output paths 
 */
exports.init = function(serverUrl) {

  if(!serverUrl) {
    return;
  }

  if(serverUrl.length > 10) {
    publicOutputUrl = serverUrl + '/cofetch/output';
  }
}; 

/**
 * Converts the given Content Object data in JSON format into XML RUCoD format
 * with their respective RWML files.
 * 
 * @param automatic -
 *          indicates whether the publishRUCoD routine is part of an automatic
 *          storing process
 */
exports.publishRUCoD = function(data, outputPath, webOutputUrl, baseName, automatic, callback) {

  // Set the static structure of the RUCoD XML file
  var rucodHeadS = '<?xml version="1.0" encoding="UTF-8"?>'
    + '<RUCoD xmlns="http://www.isearch-project.eu/isearch/RUCoD" xmlns:gml="http://www.opengis.net/gml" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
    + '<Header>'
    + '<ContentObjectType>Multimedia Collection</ContentObjectType>'
    + '<ContentObjectName xml:lang="en-US">' + data.Name + '</ContentObjectName>'
    + '<ContentObjectID/>'
    + '<ContentObjectVersion>1</ContentObjectVersion>'
    + '<ContentObjectCreationInformation>'
    + '<Creator><Name>CoFetch Script</Name></Creator>'
    + '<Contributor><Name>HS Fulda</Name></Contributor>'
    + '<Contributor><Name>Google</Name></Contributor>'
    + '<Contributor><Name>flickr.com</Name></Contributor>'
    + '<Contributor><Name>wikipedia.org</Name></Contributor>'
    + '<Contributor><Name>freesound.org</Name></Contributor>'
    + '<Contributor><Name>wunderground.com</Name></Contributor>'
    + '<Contributor><Name>youtube.com</Name></Contributor>'
    + '</ContentObjectCreationInformation>';
  var rucodHeadE = '</Header>' + '</RUCoD>';

  var rucodBody = '<Tags>';

  var hasVideo = false;
  var tagArray = new Array();
  // Grabbing the tags for the RUCoD header
  for ( var f = 0; f < data.Files.length; f++) {
    // Text has no tags ;-)
    if (data.Files[f].Type == 'Text') {
      continue;
    }
    ;
    // We need to know if there is video since the way to get the video source
    // url is quite complicated
    if (data.Files[f].Type == 'VideoType') {
      hasVideo = true;
    }
    ;

    for ( var t = 0; t < data.Files[f].Tags.length; t++) {
      tag = data.Files[f].Tags[t].replace(/^\s*|\s*$/g, '');
      tag = tag.charAt(0).toUpperCase() + tag.slice(1);
      tagArray.push(tag);
    }
  }
  // Filtering the Array to have only unique tags in there
  var uniqueTags = tagArray.unique();
  // and print the tags into the header
  for ( var t = 0; t < uniqueTags.length; t++) {
    rucodBody += '<MetaTag name="UserTag" type="xsd:string">' + encodeXml(uniqueTags[t]) + '</MetaTag>';
  }

  rucodBody += '</Tags>';

  // ------------------------------------------------
  var saveRucodMedia = function(rucodBody, data, outputPath, callback) {

    var rucodname = baseName || data.Name.replace(/\s/g, '_').replace(/[|&;$%@"<>()+,]/g, '').replace(/\//g,'-'); 

    rucodBody += '<ContentObjectTypes>';

    // Fitting the media files into RUCoD
    for ( var f = 0; f < data.Files.length; f++) {

      if (data.Files[f].Type === undefined) {
        continue;
      }

      rucodBody += '<MultimediaContent type="' + data.Files[f].Type + '">';
      if (data.Files[f].Type == 'Text') {
        if(typeof(data.Files[f].FreeText) == 'string') {
          rucodBody += '<FreeText>' + encodeXml(data.Files[f].FreeText) + '</FreeText>';
        } else {
          rucodBody += '<FreeText>' + encodeXml(data.Files[f].Name) + '</FreeText>';
        }
      } else {

        if (data.Files[f].Description) {
          rucodBody += '<FreeText>' + encodeXml(data.Files[f].Description) + '</FreeText>';
        }

        rucodBody += '<MediaName>' + encodeXml(data.Files[f].Name) + '</MediaName>';

        if (mime[data.Files[f].Extension]) {
          rucodBody += '<FileFormat>' + mime[data.Files[f].Extension]
          + '</FileFormat>';
        }

        for ( var t = 0; t < data.Files[f].Tags.length; t++) {
          rucodBody += '<MetaTag name="UserTag" type="xsd:string">'
            + encodeXml(data.Files[f].Tags[t]) + '</MetaTag>';
        }

        rucodBody += '<MediaLocator>';
        rucodBody += '<MediaUri>' + encodeURI(data.Files[f].URL.replace(/&/g, '&amp;')) + '</MediaUri>';
        rucodBody += '<MediaPreview>' + encodeURI(data.Files[f].Preview.replace(/&/g, '&amp;')) + '</MediaPreview>';
        rucodBody += '</MediaLocator>';

        rucodBody += '<MediaCreationInformation>';
        rucodBody += '<Author>';
        rucodBody += '<Name>' + encodeXml(data.Files[f].Author) + '</Name>';
        rucodBody += '</Author>';
        rucodBody += '<Licensing>' + data.Files[f].License + '</Licensing>';
        rucodBody += '</MediaCreationInformation>';     

        if (data.Files[f].Size) {
          rucodBody += '<Size>' + Math.ceil(data.Files[f].Size) + '</Size>';
        }

        if (data.Files[f].Length) {
          rucodBody += '<MediaTime>' + Math.ceil(data.Files[f].Length) + '</MediaTime>';
        }

      }

      rucodBody += '</MultimediaContent>';

    } // End for loop

    // Generate RWML data for each media item
    var rwml = '<RWML>';

    for ( var f = 0; f < data.Files.length; f++) {
      if (data.Files[f].Type === undefined) {
        continue;
      }
      // Text does not has any real world information
      if (data.Files[f].Type == 'Text') {
        continue;
      }
      // Prepare the creation date of the media item for use in RWML
      var rwmlDate = data.Files[f].Date;

      if (data.Files[f].Date.indexOf('.000Z') == -1) {
        var rawDateParts = data.Files[f].Date.split(" ");
        var dateParts = (rawDateParts[0] || "2011-08-01").split("-");
        var timeParts = (rawDateParts[1] || "12:01:01").split(":");
        rwmlDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]
        .replace(/0(\d\/)/g, '')), parseInt(dateParts[2].replace(
            /0(\d\/)/g, '')), parseInt(timeParts[0].replace(/0(\d\/)/g, '')),
            parseInt(timeParts[1].replace(/0(\d\/)/g, '')),
            parseInt(timeParts[2].replace(/0(\d\/)/g, '')));
        rwmlDate = getISODateString(rwmlDate);
      }
      // Create the RWML file
      rwml += '<ContextSlice>' + '<DateTime>' + '<Date>' + rwmlDate + '</Date>'
      + '</DateTime>';
      // Do we have GPS
      if (data.Files[f].Location.length > 1) {
        var location = data.Files[f].Location;
        rwml += '<Location type="gml">'
          + '<gml:CircleByCenterPoint numArc="1">' + '<gml:pos>'
          + location[0] + ' ' + location[1] + '</gml:pos>'
          + '<gml:radius uom="M">10</gml:radius>'
          + '</gml:CircleByCenterPoint>' + '</Location>' + '<Direction>'
          + '<Heading>' + location[3] + '</Heading>' + '<Tilt>0</Tilt>'
          + '<Roll>0</Roll>' + '</Direction>';
      }
      // Do we have weather
      if (data.Files[f].Weather.temperature !== undefined) {
        if (data.Files[f].Weather.temperature.length > 1) {
          rwml += '<Weather>' + '<Condition>' + data.Files[f].Weather.condition
          + '</Condition>' + '<Temperature>'
          + data.Files[f].Weather.temperature + '</Temperature>'
          + '<WindSpeed>' + data.Files[f].Weather.wind + '</WindSpeed>'
          + '<Humidity>' + data.Files[f].Weather.humidity + '</Humidity>'
          + '</Weather>';
        }
      }

      rwml += '</ContextSlice>';
    } // End for loop for RWML

    rwml += '</RWML>';

    // Add the RWML to the RUCoD
    rucodBody += '<RealWorldInfo>' + '<MetadataUri filetype="rwml">' + rucodname + '.rwml</MetadataUri> ' + '</RealWorldInfo>';

    // Find and add emotion if there are some
    var emoIndex = -1;

    for ( var f = 0; f < data.Files.length; f++) {
      if (data.Files[f].Type === undefined) {
        continue;
      }
      if (data.Files[f].Type == 'Text') {
        continue;
      }
      if (data.Files[f].Emotions.length > 0
          && data.Files[f].Emotions[0] != "Not set"
            && data.Files[f].Emotions[0].length > 0) {
        emoIndex = f;
        break;
      }
    }

    if (emoIndex >= 0) {
      rucodBody += '<UserInfo>' + '<UserInfoName>Emotion</UserInfoName>';
      for ( var e = 0; e < data.Files[emoIndex].Emotions.length; e++) {
        rucodBody += '<emotion><category name="' + data.Files[emoIndex].Emotions[e] + '" set="everydayEmotions" /></emotion>';
      }
      rucodBody += '</UserInfo>';
    }
    rucodBody += '</ContentObjectTypes>';

    console.log("Temporary RUCoD data collected. Writing files...");

    var paths = [];

    // Write RWML file
    fs.writeFile(outputPath + rucodname + '.rwml', rwml, function(error) {
      if (error) {
        callback(error, null);
      } else {
        console.log('RWML file created or overwritten under ' + outputPath
            + rucodname + '.rwml');
        paths.push(webOutputUrl + '/' + rucodname + '.rwml');
        // Write RUCoD file
        fs.writeFile(outputPath + rucodname + '_rucod.xml', (rucodHeadS
            + rucodBody + rucodHeadE), function(error) {
          if (error) {
            callback(error, null);
          } else {
            console.log('RUCoD file created or overwritten under ' + outputPath
                + rucodname + '_rucod.xml');
            paths.push(webOutputUrl + '/' + rucodname + '_rucod.xml');
            callback(null, {
              message : 'JSON and RUCoD files successfully saved.',
              urls : paths
            });
          }
        });
      }
    });
  }; // Function saveRucodMedia end

  saveRucodMedia(rucodBody, data, outputPath, callback);

  //The video source url is only a short time available, so it's senseless to store it in the RUCoD,
  //it must be created right before the actual download of the video.
  /*
  if (hasVideo) {
    // First run, get the video data url for youtube videos
    for ( var f = 0; f < data.Files.length; f++) {
      if (data.Files[f].Type == 'VideoType') {
        getVideoSourceUrl(data.Files[f].URL, f, function(error, id, url) {

          if (error) {

            if (automatic !== true) {
              // If not in automatic mode, give the error back
              callback(error, null);
              return;

            } else {
              // Otherwise just remove the video item from the files array
              data.Files[id] = {};
            }

          } else {
            // If no error occured store the video data url in the files array
            data.Files[id].URL = url;
          }
          // Save the rucod
          saveRucodMedia(rucodBody, data, outputPath, callback);

        }); // End asynchronous call
      }
    } // End first run loop

  } else {
    // No video in JSON so don't go through the video source url retrieval path
    saveRucodMedia(rucodBody, data, outputPath, callback);
  }*/
};

/**
 * Checks wether the given CO name already exists and returns the CO data if so.
 * 
 * @param name -
 *          the name of the content object
 * @param categoryPath -
 *          the category path of the content object
 * @param callback
 */
exports.exists = function(name, categoryPath, callback) {

  var fileOutputPath = basepath + '/' + categoryPath + '/';
  var coName = name.replace(/\s/g, '_').replace(/[|&;$%@"<>()+,]/g, '').replace(/\//g,'-');
  console.log('Test exist: ' + fileOutputPath + coName + '.json');

  // Check if the folder for this content object already exists
  fs.exists(fileOutputPath + coName + '.json', function(exists) {
    if (exists) {
      var fileContents = fs.readFileSync(fileOutputPath + coName + '.json');
      try {
        var data = JSON.parse(fileContents);
        callback(data);
      } catch (e) {
        callback(undefined);
      }

    } else {
      callback(undefined);
    }
  });

};

/**
 * Stores the given JSON data as file on the servers file system.
 * 
 * @param co -
 *          the Content Object data in JSON format
 * @param overwrite -
 *          indicates wether an existing file for content object should be
 *          overwritten or not
 * @param automatic -
 *          indicates wether the store routine is part of an automatic storing
 *          process
 * @param onlyJson -
 *          indicates weather to store only json files without creating RUCoD
 * @param callback
 */
exports.store = function(co, overwrite, automatic, onlyJson, callback) {

  var onlyJson = onlyJson || false;
  
  var storeFiles = function(co) {
    
    // Get the category path of the CO json
    var catpath = co.CategoryPath.split('/');
    // And check if the folders for those categories exist
    // in the file system, if not create them
    var fileOutputPath = basepath;
    var webOutputUrl = publicOutputUrl;
  
    for ( var p = 0; p < catpath.length; p++) {
      fileOutputPath += '/' + catpath[p];
      webOutputUrl += '/' + catpath[p];
      if (!fs.existsSync(fileOutputPath)) {
        if (fs.mkdirSync(fileOutputPath, 0755)) {
          break;
        }
      }
    }
  
    baseName = co.Name.replace(/\s/g, '_').replace(/[|&;$%@"<>()+,]/g, '').replace(/\//g,'-');
  
    // Set the general output path for this content object
    fileOutputPath += '/';
     
    console.log("StoreData: Name=" + baseName + ' (' + co.Name + ')');
  
    // Check if the folder for this content object already exists
    fs.exists(fileOutputPath + baseName + '.json', function(exists) {
      // Pre check
      if (exists && overwrite === false) {
        if(fs.existsSync(fileOutputPath + baseName + '_rucod.xml')) {
          console.log('JSON and RUCoD files exist!');
          baseName = getLastFileVersion(fileOutputPath, baseName, true);
          console.log('Saving with new file name: ' + baseName);
        }
      }
  
      // Write JSON file
      fs.writeFile(fileOutputPath + baseName + '.json', JSON.stringify(co), function(error) {
        if (error) {
          throw error;
        }
        console.log('JSON file ' + (exists === false ? 'created' : 'overwritten') + ' under ' + fileOutputPath + baseName + '.json');
  
        if(!onlyJson) {
          // Create RUCoD for Content Object data
          exports.publishRUCoD(co, fileOutputPath, webOutputUrl, baseName, automatic, callback);
        } else {
          callback(null, {
            message : "JSON successfully saved.",
            urls : [ webOutputUrl + '/' + baseName + '.json' ]
          });
        }
  
      }); //end write JSON file 
    }); //end exist test for JSON file 
  };
  
  if(!onlyJson) {
    //Get weather data for media items within CO
    getWeatherData(co, storeFiles); //end getWeatherData
  } else {
    storeFiles(co);
  }
};

/**
 * Stores a given JSON array containing multiple Content Object data as file on
 * the servers file system. The function should be applied for automatic
 * retrieved content object data, e.g. content object data which was not revised
 * by an user.
 * 
 * @param codata -
 *          an array of Content Object data in JSON format
 * @param callback -
 *          the function which should be called upon finishing of the storing
 *          process
 */
exports.storeAutomaticInput = function(codata, callback) {

  console.log("Start automatic storing of " + codata.length + " Content Objects...");
  storeMultipleContentObjectData(codata, false, callback);

};

/**
 * Stores a given JSON array containing multiple Content Object data as JSON
 * file on the servers file system. The function should be applied for manual
 * retrieved content object data.
 * 
 * @param codata -
 *          an array of Content Object data in JSON format
 * @param callback -
 *          the function which should be called upon finishing of the storing
 *          process
 */
exports.storeJsonInput = function(codata, callback) {

  console.log("Start JSON storing of " + codata.length + " Content Objects...");
  storeMultipleContentObjectData(codata, true, callback);

};