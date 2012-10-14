
define("mylibs/query",
  [
    "mylibs/config",
    "mylibs/results",
    "mylibs/loader"
  ],
  function(config,results,loader) {

  var queryItemTypes = {
    'Text'   : 'Text',
    'Image'  : 'ImageType',
    'Video'  : 'VideoType',
    'Audio'  : 'SoundType',
    'Threed' : 'Object3D'
  };
  
  var queryItemSubTypes = {
    'Rhythm'   : 'rhythm',
    'Sketch'   : 'sketch',
    'Emotion'  : 'emotion',
    'Location' : 'Location'
  };

  var allowedTypes = {
    'ImageType' : ['jpg','png','gif'],
    'VideoType' : ['webm','mp4','avi','ogv'],
    'Object3D'  : ['dae','3ds'],
    'SoundType' : ['oga','ogg','mp3','wav']
  };

  var queryId = false;
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
        'name'    : (new Date().getTime()) + '-' + 'sketch.png',
        'type'    : 'image/png',
        'data-subtype' : 'sketch',
        'base64'  : $(element)[0].toDataURL('image/png')
      });

    } catch(e) {
      console.dir(e);
      console.log('The specified element is not a canvas element and therefore not supported!');
    }

    //Go on, handle it like a normal file upload/drop
    return file;
  };

  /**
   * Creates an query item token within the token input
   */
  var createItem = function(id,type,data) {
    
    var tokenHtml = '';

    //Generate token html for query item
    if(typeof data === 'string') {
      tokenHtml += data;
    } else if (typeof data === 'object'){

      //Check if a specific query item id is wanted
      if(data.id) {
        id = data.id;
      }

      //Add appropriate opening tags depending on the query item type
      switch(type) {
        case queryItemTypes.Text  :
          //If an object is provided for text type, then meta data is added to the text
          //or overlay it with an provided image
          tokenHtml += data.image ? '<img src="' + data.image + '" title="' + data.text + '"' : '<span';
          break;
        case queryItemTypes.Image :
          tokenHtml += '<img src="' + (data.path ? data.path : '') + '" alt="' + data.name + '" title="' + data.name + '"';
          break;
        case queryItemTypes.Audio :
          tokenHtml += '<audio src="' + (data.path ? data.path : '') + '" title="' + data.name + '" controls="controls"';
          break;
        case queryItemTypes.Video :
          tokenHtml += '<video src="' + (data.path ? data.path : '') + '" title="' + data.name + '" controls="controls"';
          break;
        case queryItemTypes.Threed:
          tokenHtml += '<canvas width="60" height="25" title="' + data.name + '"';
          break;
      }

      //Add basic common attributes (ID and query item type)
      tokenHtml += ' id="' + id + '" data-type="' + type + '"';
      //Add custom attributes represented by HTML5 'data-' attributes
      for(var key in data) {
        if(key.indexOf('data-') > -1) {
          tokenHtml += ' ' + key + '="' + data[key] + '"';
        }
      }
      //Add appropriate closing characters or tags
      switch(type) {
        case queryItemTypes.Text  :
          tokenHtml += data.image ? ' />' : '>' + data.text + '</span>';
          break;
        case queryItemTypes.Image :
          tokenHtml += ' />';
          break;
        case queryItemTypes.Audio :
          tokenHtml += '>No audio preview.</audio>';
          break;
        case queryItemTypes.Video :
          tokenHtml += '>No video preview.</video>';
          break;
        case queryItemTypes.Threed:
          tokenHtml += '></canvas>"';
          break;
      }
    }
    //DEBUG
    //console.log(tokenHtml);

    //Add the generated query item to the query field
    $('#query-field').tokenInput('add',{id:id,name:tokenHtml});

  };

  /**
   * Sets data attributes for a given query item identified with the query item id
   */
  var setItemData = function(id,data) {

    var $queryItem = $('#' + id);

    if($queryItem.length < 1) {
      return false;
    }

    if($queryItem.attr('data-type') === queryItemTypes.Image) {
      $queryItem.attr('alt',data.name);
    } else {
      $queryItem.attr('title',data.name);
    }

    //Add custom attributes represented by HTML5 'data-' attributes
    for(var key in data) {
      if(key.indexOf('data-') > -1) {
        $queryItem.attr(key,data[key]);
      }
    }

    if(data.path) {
      // Sotiris: special handling for multiple audio formats
      // The path element may contain multiple objects pointing to files in different formats
      // Also a token attribute is returned to allow for reusing temporary files on the server during the query
      if ( !$.isArray(data.path) )
      {
        $queryItem.attr('src', data.path) ;
      }
      else
      {
        $queryItem.removeAttr('src').attr('preload', 'auto') ;

        for ( var i=0 ; i<data.path.length ; i++ )
        {
          var url = data.path[i].url ;
          var mime = data.path[i].mime ;

          $('<source/>', { src: url, type: mime }).appendTo($queryItem) ;
        }
      }
    }
  };
  
  // Sotiris: add extra object to pass in form data (used to designate that an uploaded audio file is a rhythm file)
  // Jonas: moved extra information to individual file object, but also added it to the generic
  // formData
  var uploadFile = function(file, id, callback) {

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
      }
      if(queryId) {
        formData.append('queryId', queryId);
      }
      
      //Check for extra meta information, based on data tags
      for(var key in file) {
        if(key.indexOf('data-') > -1) {
          formData.append(key.replace('data-',''), file[key]) ;
        }
      }

    } catch(e) {
      console.error('Browser does not support the creation of FormData! Exiting...');
      return;
    };

    //Upload progress handler function
    var uploadProgressHandler = function(event) {
      if (event.lengthComputable) {
        var percentage = Math.round((event.loaded * 100) / event.total);
        if (percentage <= 100) {
          $progressbar.css('width', (percentage*2) + 'px');
          $progressbar.find('p').text(percentage + '%');
        }
      }
    };

    //Upload error handler function
    var errorHandler = function(error) {
      console.log('Query item upload error: ' + error);
    };

    //Upload complete handler function
    var completeHandler = function(data) {
      //add load completed style to upload element
      $('#' + id).addClass('loaded');
      console.log("Query item upload with id " + id + " complete.");

      //Analyze the upload result data and get the file information
      var fileInfo = {};

      try {
        fileInfo = JSON.parse(data);
        //Adding an fileItem to the query will trigger the server to produce
        //a queryId, which is stored locally and send with every future upload 
        //query item and query submit event in order to identify what belongs to
        //a query
        queryId = queryId !== fileInfo.queryId ? fileInfo.queryId : queryId;
        console.dir(fileInfo);
      } catch(e) {
        fileInfo.error = 'Error while parsing result JSON from file upload.';
      }
      if(fileInfo.error) {
        alert('Woops...somehow your query input got lost through an error in space. You can try it again or report this error to my creators: \n' + fileInfo.error);
        return;
      }

      //Check if there's a need for special treatment of 3D content
      if($('#' + id).attr('data-type') === queryItemTypes.Threed) {
        //for 3D first check if an preview image is available
        if(fileInfo.preview) {
          //draw the preview image on the 3D canvas
          var canvas = $('#' + id).get(0) ;
		      var context = canvas.getContext('2d');
          
          if(context) {
            var img = new Image ;
            img.onload = function() {
              var ratioW = img.width/canvas.width;
              var ratioH = img.height/canvas.height;

              var thumbw, thumbh;

              if (ratioW > ratioH) {
                thumbw = canvas.width;
                thumbh = canvas.width*(img.height/img.width);
              } else {
                thumbh = canvas.height;
                thumbw = canvas.height*(img.width/img.height);
              }
              context.drawImage(img, (canvas.width - thumbw)/2, (canvas.height - thumbh)/2, thumbw, thumbh) ;
            };
            img.src = fileInfo.preview;
          }
        } else {
          //Use WebGL for presentation of 3D model
        }
        //remove the path after setting the 3d data source or preview
        fileInfo.path = false;
      }

      //For all other types just set the received data to the HTML query item token
      setItemData(id,fileInfo);

      //Hide user uploading message upon upload complete event
      //loader.stop();

      if(typeof callback === 'function') {
        callback(fileInfo);
      }
    };

    //Show a message to the user, that content is actually being uploaded...
    //loader.start("Uploading") ;

    $.ajax({
      url: config.constants.fileUploadServer || 'query/item',  //server script to process data
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
   //   cache: false,
      contentType: false,
      processData: false,
      dataType: "text"

    });
  };

  /**
   * addItems function
   * Adds query items to the current query.
   *
   * @param data Contains the data or a reference to an HTML element which contains data
   *             to be used for generating a query element.
   *             - If it contains an String it can either represent an ID of a Canvas element holding base64
   *               encoded data or the text used for an textual query item, if used with type types.Text
   *             - or it can contain an object with meta-data for textual query items, if used with type
   *               types.Text
   *             - It can represent a file information object which contains information about an
   *               already existing file
   *             - It can contain an event object including a files object which provide binary
   *               data for uploading and generating query items. Further
   * @param type The type of the payload data for the element can be one of the types defined in field @reference types
   * @param callback a function which is called after the query item(s) are successfully generated
   *
   */
  var addItems = function(data,type,callback) {
    
    //Basic vars for query item generation
    var id = 'queryItem' + itemCount;
    var tokenHtml = '';

    //a text item can be added directly via the token input...
    //no file upload needed
    if(type === queryItemTypes.Text) {

      //Generate token html for query item
      createItem(id,type,data);
      //Increase query item count
      itemCount++;

    } else {

      //Process non textual query items via upload of binary or base64 data or via referenced files
      if(typeof data === 'string' && $(data).length) {
        //Data is an ID for an Canvas element
        var files = getBase64File(data);
      } else if(typeof data === 'object' && data.path) {
        //Data is an file information object which references an already existing binary file
        //Format: { path : [url], name : [filename], type : [queryType], subtype : [sketch|recording|rythm], size : [bytes] }
        data.link = true;
        var files = [data];
      } else {
        //Data is an event object
        var files = data.files || data.target.files || data.dataTransfer.files;      
      }

      //Test if browser supports the File API
      if (typeof files !== 'undefined') {
        //iterate through the (uploaded) files
        for (var i=0; i < files.length; i++) {
          if ( files[i]["data-subtype"] === "recording")
          {
          	 createItem(id,type,files[i]);
          	 return id ;
          }
          //test if current file is allowed to be uploaded
          else if(isAllowedExtension(files[i].name,type)) {
            //check if extra additional data is provided via file upload
            //and add it to each file for html item creation
            if(data.extra) {
              for (var key in data.extra) {
                if(data.extra.hasOwnProperty(key)) {
                  files[i]['data-' + key] = data.extra[key]; 
                }
              }
            }
            //Create the query item token for the search bar
            createItem(id,type,files[i]);

            //Use the file reader API to display the uploaded data before it was actually uploaded
            if(type !== queryItemTypes.Threed && typeof FileReader !== 'undefined') {

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

            if(!files[i].path) {
              //Upload file to server
              uploadFile(files[i], id, i === (files.length -1) ? callback : null);
            } else {
              //all needed data is available, add it to query item
              setItemData(id, files[i]);
            }
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
    } //end text type else

    if(typeof callback === 'function') {
      callback(files);
    }
    
    return id ;
  };

  var updateItem = function(id,event,type,callback) {
    if(id) {
      $("#query-field").tokenInput("remove", {id: id});
      event.id = id;
      addItems(event,type,callback);
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
    //Tokenize remaining input
    if (remainingInput) {
      addItems(remainingInput,queryItemTypes.Text);
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

        if(queryToken.attr('data-subtype') == 'Emotion') {

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

        } else if(queryToken.attr('data-subtype') == 'Location') {

          var location = queryToken.attr('title');
          queryJson.location = location || false;
          console.log('found location with pos ' + location);

        } else if(queryToken.attr('data-subtype') == 'Rhythm') {

          queryJson.rhythm = {
              'duration'  :  parseInt(queryToken.attr('data-duration')),
              'intervals' :  queryToken.attr('title').split(',')
          };

        } else if(queryToken.attr('data-subtype') == 'Tag') {

          var recommendedTag = queryToken.text();
          if(!queryJson.tags) {
            queryJson.tags = [recommendedTag];
          } else {
            queryJson.tags.push(recommendedTag);
          }

        } else {

          queryItem.Type     = queryToken.attr('data-type');
          queryItem.RealType = queryToken.attr('data-subtype') || '';
          queryItem.Name     = queryToken.attr('title');
          queryItem.Content  = queryToken.attr('src');
		      queryItem.Token    = queryToken.attr('data-token');
		      queryItem.Url 	   = queryToken.attr('data-url');
		  
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
  
  var setQuery = function(json) {
    
    $('#query-field').tokenInput("clear");
    itemCount = 0; 
    
    if(typeof json === 'object') {
      
      var data = {};
      
      //1. process file items
      for(var i in json.fileItems) {
       
        if(json.fileItems[i].Type === queryItemTypes.Text) {
          data = json.fileItems[i].Content;
        } else {
          data = { 
            'name' : json.fileItems[i].Name,
            'path' : json.fileItems[i].Content,
            'data-subtype' : json.fileItems[i].RealType,
          }
        }
        //Generate token html for query item
        createItem('queryItem' + itemCount,json.fileItems[i].Type,data);
        itemCount++;
      }
      
      //2. test for emotion in query
      if(typeof json.emotion === 'object') {
        
        var value = (json.emotion.valence / 2) + 0.5;
        
        var div = $("#emotion-slider")[0];
        slider = new SmileySlider(div);
        slider.position(value);
        var canvas = $("#emotion-slider canvas:first")[0];
        var data = {
          'image'        : canvas.toDataURL("image/png"), //if image if given, then it is used as replacement instead of showing the text value
          'text'         : value,
          'data-subtype' : 'Emotion'
        };
        //Generate token html for query item
        createItem('queryItem' + itemCount,queryItemTypes.Text,data);
        itemCount++;
      }
      
      //3. test for location in query
      if(json.location) {
        var data = {
          'image'        : 'img/fake/fake-geolocation.jpg', //if image if given, then it is used as replacement instead of showing the text value
          'text'         : json.location,
          'data-subtype' : 'Location'
        };
        //Generate token html for query item
        createItem('queryItem' + itemCount,queryItemTypes.Text,data);
        itemCount++;
      }
      
      //4. test for rhythm in query
      if(typeof json.rhythm === 'object') {
        var data = {
          'image'         : 'img/fake/fake-sound.jpg', //if image if given, then it is used as replacement instead of showing the text value
          'text'          : json.rhythm.intervals.join(','),
          'data-subtype'  : 'Rhythm',
          'data-duration' : json.rhythm.duration
        };
        //Generate token html for query item
        createItem('queryItem' + itemCount,queryItemTypes.Text,data);
        itemCount++;
      }
    }
  }
  
  var getQueryHtml = function(json) {
    
    var listHtml = '';
    
    if(typeof json === 'object') {
      for(var i in json.fileItems) {
        var item = json.fileItems[i];
        var itemHtml = '';
        switch(item.Type) {
          case queryItemTypes.Text  :
            itemHtml += '<p>' + item.Content + '</p>';
            break;
          case queryItemTypes.Image :
            itemHtml += '<img src="' + item.Content + '" alt="' + item.Name + '" data-type="' + item.Type + '"';
            break;
          case queryItemTypes.Audio :
            itemHtml += '<audio src="' + item.Content + '" title="' + item.Name + '" controls="controls">No audio preview.</audio>';
            break;
          case queryItemTypes.Video :
            itemHtml += '<video src="' + item.Content + '" title="' + item.Name + '" controls="controls">No video preview.</video>';
            break;
          case queryItemTypes.Threed:
            itemHtml += '<canvas width="60" height="25" title="' + item.Name + '"></canvas>';
            break;
        }
        listHtml += '<li class="token-input-token-isearch">' + itemHtml + '</li>';
      }
    }
    
    return listHtml;
    
  };
  
  var isValidQuery = function(query) {
    var valid = false;
    
    if(query.fileItems && query.fileItems.length > 0) {
      valid = true;
    } else if (query.relevant && query.relevant.length > 0) {
      valid = true;
    } else if(
      query.emotion  != false    || 
      query.location != false    || 
      query.rhythm   != false    || 
      query.tags     != false    || 
      query.similarTo     
    ) {
      valid = true;
    } 
    
    return valid;
  };
  
  /**
   * 
   * @param {Object} refineOptions
   * @param {Object} callback optional, if provided error and special result data is possible, 
   * otherwise only a valid result is pushed to the display function of the results module
   */
  var submit = function(refineOptions, callback) {
    
    var query = getItems();
    
    if(typeof refineOptions === 'object') {
      var keys = Object.keys(refineOptions);
      for(var i in keys) {
        if(keys[i] == 'similarTo') {
          query = { 'similarTo' : refineOptions[keys[i]] };
          break;
        }
        query[keys[i]] = refineOptions[keys[i]];
      }
    }
  
    if(isValidQuery(query)) 
    { 
      //Add the queryId if available (means: if file items have been uploaded before)
      if(queryId) {
        query.queryId = queryId;
      }

      console.log('searching for query data: ');
      console.log(query);

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
          var success = false;
          if(!data.error) {
            console.log("Query result:");
            console.dir(data);
            if(data.queryId) {
              queryId = data.queryId;
            }
            success = true;
          }
          
          if(typeof callback === 'function') {
            callback(success, data) ;
          } else if(success) {
            results.display(data);
          }
        },
        error: function(jqXHR, error, object) {
          data = {error: "the server gave me an invalid result."};
          console.log("Error during submitting query: " + data.error);
          if(typeof callback === 'function') {
            callback(false, data) ;
          }
        },
        complete: function() {
          $.event.trigger( "ajaxStop" );
        }
      });

    } else {
      var data = {error: "the query seems to be a bit too short."};
      if(typeof callback === 'function') {
        callback(false, data) ;
      }  
    }
  };

  var updateItemCount = function(p1,p2) {
    itemCount = $(".token-input-list-isearch li").size()-1;
  };
  
  var reset = function() {
    $("#query-field").tokenInput("clear");
    itemCount = 0;
  };

  return {
    types           : queryItemTypes,
    subtypes        : queryItemSubTypes,
    queryId         : queryId,
    addItems        : addItems,
    updateItem      : updateItem,
    updateItemCount : updateItemCount,
    getQueryHtml    : getQueryHtml,
    setQuery        : setQuery,
    submit          : submit,
    reset           : reset
  };

});
