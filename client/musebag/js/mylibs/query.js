define("mylibs/query", ["mylibs/config",], function(config) {
  
  var allowedTypes = {
    'image' : ['jpg','png','gif'],
    'video' : ['webm','mp4','avi','ogv'],
    '3d'    : ['dae','3ds'],
    'audio' : ['oga','ogg','mp3','wav']
  };
  
  var itemCount = 0;
  
  var isAllowedExtension = function(fileName, type) {
    var ext = (-1 !== fileName.indexOf('.')) ? fileName.replace(/.*[.]/, '').toLowerCase() : '';
    
    if (!allowedTypes[type].length){return false;}
    
    for (var i=0; i<allowedTypes[type].length; i++){
      if (allowedTypes[type][i].toLowerCase() == ext){ return true;}
    }

    return false;
  };
  
  var getBase64File = function(element) {
    
    var file = new Array();
    
    try {
      //Create a file object for the actual canvas data
      file = new Array({
        name    : (new Date().getTime()) + '-' + 'sketch.png',
        type    : 'image/png',
        subtype : 'sketch',
        base64  : document.getElementById(element).toDataURL('image/png')
      });

    } catch(e) {
      console.dir(e);
      console.log('The specified data container is not a canvas element and therefore not supported!');
    } 
    
    //Go on, handle it like a normal file upload/drop
    return file;
  };
  
  var uploadFile = function(file,id) {
    
    //Create upload bar
    var $progressbar = $('<div class="progressBar"><p>0%</p></div>').appendTo('#' + id);
    
    //Form data creation
    try {
      var formData = new FormData();
      if(!file.base64) {
        formData.append('files', file);
      } else {
        formData.append('canvas', file.base64);
        formData.append('name', file.name);
        formData.append('subtype', file.subtype || '');
      }
    } catch(e) {
      console.error('Browser does not support the creation of FormData! Exiting...');
      return;
    };
    
    //Upload handler functions
    var uploadProgressHandler = function(event) {
      if (event.lengthComputable) {
        var percentage = Math.round((event.loaded * 100) / event.total);
        if (percentage <= 100) {
          $progressbar.css('width', (percentage*2) + 'px');
          $progressbar.find('p').text(percentage + '%');
        }
      }
    };
    
    var errorHandler = function(error) {
      console.log('Query item upload error: ' + error);
    };
    
    var completeHandler = function(event) {
      //add load completed style to upload element 
      $('#' + id).addClass('loaded');
      console.log("Query item upload with id " + id + " complete.");
      
      console.dir(event);
    };
    
    $.ajax({
      url: config.constants.queryFormulatorUrl || 'query/item',  //server script to process data
      type: 'POST',
      xhr: function() {  // custom xhr
          myXhr = $.ajaxSettings.xhr();
          if(myXhr.upload){ // check if upload property exists
              myXhr.upload.addEventListener('progress',uploadProgressHandler, false); // for handling the progress of the upload
          }
          return myXhr;
      },
      //Ajax events
      success: completeHandler,
      error: errorHandler,
      // Form data
      data: formData,
      //Options to tell JQuery not to process data or worry about content-type
      cache: false,
      contentType: false,
      processData: false
    });
  };
  
  var addItems = function(element,event,type,isBase64Format) {
    
    var files = event.files || event.target.files || event.dataTransfer.files;
    
    if(isBase64Format) {
      files = getBase64File(element);
    }
    
    //Test if browser supports the File API
    if (typeof files !== "undefined") {
      //iterate through the uploaded files
      for (var i=0; i < files.length; i++) {
        //test if current file is allowed to be uploaded
        if(isAllowedExtension(files[i].name,type)) {
          
          //Create the query item token for the search bar
          var id = "fileQueryItem" + itemCount;
          var tokenHtml = "";
          var supportDirectData = true;

          //Create token content dependend from the media input
          console.log(files[i].type);
          if((/image/i).test(files[i].type)) {
            tokenHtml = '<img id="' + id + '" alt="" src="" />';
          } else if((/audio/i).test(files[i].type) || (/ogg/i).test(files[i].name)) {
            tokenHtml = '<audio controls="controls" id="' + id + '" >No audio preview.</audio>';
          } else if((/video/i).test(files[i].type)) {
            tokenHtml = '<video src="" controls="controls" id="' + id + '" width="60" height="25">No video preview.</video>';
          } else if((/dae/i).test(files[i].name) || (/3ds/i).test(files[i].name) || (/md2/i).test(files[i].name) || (/obj/i).test(files[i].name)) {
            tokenHtml = '<canvas id="' + id + '" width="60" height="25"></canvas>';
            //WebGL 3D data must be uploaded before it can be displayed
            supportDirectData = false;
          }

          $("#query-field").tokenInput('add',{id:id,name:tokenHtml});
          
          //Use the file reader API to display the uploaded data before it was actually uploaded
          if(supportDirectData && typeof FileReader !== "undefined") {

            var dataToken = document.getElementById(id),

            //Create Filereader instance
            reader = new FileReader();
            reader.onload = (function (theDataToken) {
              return function (event) {
                theDataToken.src = event.target.result;
              };
            }(dataToken));
            //Read media data from file into img, audio, video - DOM element
            if(!files[i].base64) {
              reader.readAsDataURL(files[i]);
            } else {
              dataToken.src = files[i].base64;
            }
          }

          //Upload file to server
          processXHR(files[i], id);
          //Increase query item count
          itemCount++;

        } else {
          alert("Sorry, the submitted file " + files[i].name + " is not supported. Please use one of the following file types: " + allowedTypes[type].join(','));
        }
      } //end file for loop 
    } else {
      //Send message if File API is not available
      alert("No files to handle. Maybe this web browser does not support the File API");
    }   
  };
  
  var getItems = function() {
    
    var now = new Date();
    
    var queryJson = {
        fileItems : [],
        emotion   : false,
        datetime  : now.getUTCFullYear() + '-' + ((now.getUTCMonth()+1) < 10 ? '0' + (now.getUTCMonth()+1) : (now.getUTCMonth()+1)) + '-' + (now.getUTCDate() < 10 ? '0' + now.getUTCDate() : now.getUTCDate()) + 'T' + (now.getUTCHours() < 10 ? '0' + now.getUTCHours() : now.getUTCHours()) + ':' + (now.getUTCMinutes() < 10 ? '0' + now.getUTCMinutes() : now.getMinutes()) + ':' + (now.getUTCSeconds() < 10 ? '0' + now.getUTCSeconds() : now.getUTCSeconds()) + '.000Z',
        location  : false,
        rhythm    : false,
        tags      : false
    };
    
    //Check if the user has entered something which is not tokenized yet
    var remainingInput = $(".token-input-list-isearch li input").val();
    console.log('remaining input: ');
    console.log(remainingInput);
    //Tokenize remaining input
    if (remainingInput) {
      $("#query-field").tokenInput('add',{id:remainingInput,name:remainingInput});
      console.log(remainingInput);
    }
    
    //get all elements of the query
    $('#query ul li').each(function(index) {
      
      var queryItem = {
        Type     : 'Text',
        RealType : 'Text',
        Name     : '',
        Content  : ''
      };
      
      if($(this).find('p').children().size() > 0) {
        
        var queryToken = $(this).find('p:first').children(':first');

        if(queryToken.attr('class') == 'Emotion') {
          
          var intensity = parseFloat(queryToken.attr('title'));
          var localIntensity = 0;
		      var valence = 2*(intensity - 0.5) ;
          console.log('found emotion with intensity ' + intensity);
          if(intensity >= 0.8) {
            localIntensity = (1 / 0.19) * (intensity - 0.8); 
            queryJson.emotion = {name : 'Happy', intensity : localIntensity, "valence": valence };
          } else if(intensity >= 0.5 && intensity < 0.8) {
            localIntensity = (1 / 0.29) * (intensity - 0.5);
            queryJson.emotion = {name : 'Content', intensity : localIntensity, "valence": valence};
          } else if(intensity >= 0.3 && intensity < 0.5) {
            localIntensity = 1 - (1 / 0.19) * (intensity - 0.3);
            queryJson.emotion = {name : 'Disappointed', intensity : localIntensity, "valence": valence};
          } else {
            localIntensity = 1 - (1 / 0.29) * (intensity - 0.0);
            queryJson.emotion = {name : 'Sad', intensity : localIntensity, "valence": valence};
          }
          
        } else if(queryToken.attr('class') == 'Location') {
          
          var location = queryToken.attr('title');
          queryJson.location = location || false;
          console.log('found location with pos ' + location);
          
        } else if(queryToken.attr('class') == 'Rhythm') {
          
          queryJson.rhythm = {
              'duration'  :  parseInt(queryToken.attr('data-duration')),
              'intervals' :  queryToken.attr('title').split(',')
          };
          
        } else if(queryToken.attr('class') == 'Tag') {
          
          var recommendedTag = queryToken.text();
          if(!queryJson.tags) {
            queryJson.tags = [recommendedTag];
          } else {
            queryJson.tags.push(recommendedTag);
          }
          
        } else {
          
          queryItem.Type     = queryToken.attr('data-mode');
          queryItem.RealType = queryToken.attr('class');
          queryItem.Name     = queryToken.attr('alt');
          queryItem.Content  = queryToken.attr('src');
		      queryItem.Token    = queryToken.attr('data-token') ;
		  
          console.log('found file item with name ' + queryItem.Name);
          queryJson.fileItems.push(queryItem);
          
        }
      } else if($(this).find('p:first').text().length > 2){
        queryItem.Content  = $(this).find('p:first').text();
        queryJson.fileItems.push(queryItem);
      }
    }); //end each query list item
    
    //Set the mysterious bluetooth value to something default 
    queryJson.bluetooth = 2;
    
    return queryJson;
  };
  
  var submit = function(relevant, callback) {
    
    var query = getItems();
    
    if (query.fileItems.length > 0 || query.emotion != false || 
        query.location != false    || query.rhythm  != false || 
        query.tags != false        || relevant.length > 0 ) 
    { 
      
      console.log('searching for query data: ');
      console.log(query);
	
      query.relevant = relevant ;
	  
      //Send it to the server  
	    var mqfUrl = config.constants.queryFormulatorUrl || 'query';
	  
      $.ajax({
        type: "POST",
        crossDomain: true,
        url:  mqfUrl,
        data: JSON.stringify(query),
        contentType : "application/json; charset=utf-8",
        dataType : "json",
        success: function(data) {
          //parse the result
          console.log("Search query submitted.");
          console.dir(data);
          callback(true, data) ;
        },
        error: function(jqXHR, error, object) {
          data = {error: "the server gave me an invalid result."}; 
          console.log("Error during submitting query: " + data.error);
          callback(false, data) ;
        },
        complete: function() {
          $.event.trigger( "ajaxStop" );
        }
      });
      
    } else {
      var data = {error: "the query seems to be a bit too short."};
      callback(false, data) ;
    }
  };
  
  var updateItemCount = function() {
    itemCount = $(".token-input-list-isearch li").size()-1;
  };
  
  var reset = function() {
    $("#query-field").tokenInput("clear");
    itemCount = 0;
  };
  
  return {
    addItems        : addItems,
    submit          : submit,
    updateItemCount : updateItemCount,
    reset           : reset
  };
    
});
