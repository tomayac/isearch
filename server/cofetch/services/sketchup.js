var restler = require('restler');

var fetchThreed = function(query, page, callback) {
  
  if (!query) {
    callback('No arguments were given to the Google SketchUp job', null);
    return;
  }

  //Use the query keywords as tags for the retrieved model
  var modelTag = query.split(" ");
      modelTag = modelTag[modelTag.length-1];
  //Replace spaces
  var query = query.replace(/\s/g,'+');
  //The array for storing the results
  var results = new Array();
  //maximum count of 3D Models to retrieve
  var maxResults = 10;
  //page stuff
  var end = page * maxResults;
  var start = end - maxResults;

  var searchURL = "http://sketchup.google.com/3dwarehouse/data/entities?"
    + 'q=' + query + '+is%3Amodel+filetype%3Azip'
    + '&scoring=t'
    + '&max-results=' + end
    + '&file=zip'
    + '&alt=json';
  console.log(searchURL);
  restler
  .get(searchURL, {
    parser: restler.parsers.json
  })
  .on('success', function(data) {    
    try {

      var models = new Array();
      
      if(data.feed["openSearch$totalResults"]["$t"] != 0) {
        models = data.feed.entry;
      }
      
      //No 3d models found, so return an empty result set
      if(models.length < 1) {
        callback(null, results);
        return;
      }
      
      //Requested start page does not exist, return empty result
      if(start > models.length) {
        callback(null, results);
        return;
      }
  
      //Adjust the maxResults parameter if there aren't enough results
      if(models.length < end) {
        end = models.length;
      }
      
      //Iterate through every found 3d model
      for (var i=start; i < end; i++) {
        
        try {
          
          var mediaContent = {};
          
          if(models[i]['media$group']['media$content']) {
            mediaContent = models[i]['media$group']['media$content'];
          } else if(models[i]["'media$group'"]["'media$content'"]) {
            mediaContent = models[i]["'media$group'"]["'media$content'"];
          } else {
            throw "Invalid model content data";
          }
          
          var mediaThumbnail = {};
          
          if(models[i]['media$group']['media$thumbnail']) {
            mediaThumbnail = models[i]['media$group']['media$thumbnail'];
          } else if(models[i]["'media$group'"]["'media$thumbnail'"]) {
            mediaThumbnail =  models[i]["'media$group'"]["'media$thumbnail'"];
          } else {
            throw "Invalid model thumbnail data";
          }
          
          //Store the model IDs
          var modelId = models[i]['id']['$t'];
          
          var mediaIndex = mediaContent.length-1;
          var fileinfo = mediaContent[mediaIndex];
          var url = fileinfo['url'];
          var filesize = fileinfo['fileSize'];  
          var ext = 'zip';
          
          if(fileinfo['type'].search(/.kmz/g) != -1) {
            url = url.replace(/rtyp=k2/g,'rtyp=zip');
            url = url.replace(/rtyp=s6/g,'rtyp=zip');
            url = url.replace(/rtyp=s7/g,'rtyp=zip');
          } else {
            ext = fileinfo['type'].substr(fileinfo['type'].lastIndexOf('.')+1);
          }
          
          var filesize = fileinfo['fileSize'];    
              
          var gml = [];
          
          if(models[i]['gml$Point']) {
            gml = models[i]['gml$Point']['gml$pos']['$t'];
            gml = gml.split(' ');
          }
              
          var result = {
            "Type": "Object3d",
            "Name": models[i]['title']['$t'] || models[i]['title']["'$t'"],
            "Description": models[i]['summary']['$t'] || models[i]['summary']["'$t'"],
            "Tags": [modelTag],
            "Extension": ext,
            "License": 'Google 3D Warehouse License', 
            "LicenseURL": 'http://sketchup.google.com/intl/en/3dwh/tos.html',
            "Author": (models[i]['author'][0]['name']['$t'] || models[i]['author'][0]['name']["'$t'"]) + ' (' + (models[i]['author'][0]['uri']['$t'] || models[i]['author'][0]['uri']["'$t'"]) + ')',
            "Date": models[i]['published']['$t'] || models[i]['published']["'$t'"],
            "Size": filesize,
            "URL": url,
            "Preview": mediaThumbnail[0]['url'],
            "Emotions": [],
            "Location": gml.length > 1 ? [parseInt(gml[0]),parseInt(gml[1]),0,0] : [],
            "Weather": {}
          };
          
          results.push(result);
        } catch(e) {
          console.log('SketchUp - Result "'+ query +'": Something was missing for result number ' + i);
          //console.log(e.message);
        }
        
      } // end for 
      
      //Return the result set
      callback(null, results);
      
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
    module.exports.fetchThreed = fetchThreed; 
}   