define("mylibs/query",
  [
    "mylibs/config",
    "mylibs/loader"
  ],
  function(config,loader) {

  var queryTypes = {
    'Text'   : 'Text',
    'Image'  : 'ImageType',
    'Video'  : 'VideoType',
    'Audio'  : 'SoundType',
    'Threed' : 'Object3D'
  };

  var allowedTypes = {
    'ImageType' : ['jpg','png','gif'],
    'VideoType' : ['webm','mp4','avi','ogv'],
    'Object3D'  : ['dae','3ds'],
    'SoundType' : ['oga','ogg','mp3','wav']
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
        case queryTypes.Text  :
          //If an object is provided for text type, then meta data is added to the text
          //or overlay it with an provided image
          tokenHtml += data.image ? '<img src="' + data.image + '" title="' + data.text + '"' : '<span';
          break;
        case queryTypes.Image :
          tokenHtml += '<img src="" alt="' + data.name + '"';
          break;
        case queryTypes.Audio :
          tokenHtml += '<audio src="" controls="controls"';
          break;
        case queryTypes.Video :
          tokenHtml += '<video src="" controls="controls"';
          break;
        case queryTypes.Threed:
          tokenHtml += '<canvas width="60" height="25"';
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
        case queryTypes.Text  :
          tokenHtml += data.image ? ' />' : '>' + data.text + '</span>';
          break;
        case queryTypes.Image :
          tokenHtml += ' />';
          break;
        case queryTypes.Audio :
          tokenHtml += '>No audio preview.</audio>';
          break;
        case queryTypes.Video :
          tokenHtml += '>No video preview.</video>';
          break;
        case queryTypes.Threed:
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

    if($queryItem.attr('data-type') === queryTypes.Image) {
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
        console.dir(fileInfo);
      } catch(e) {
        fileInfo.error = 'Error while parsing result JSON from file upload.';
      }
      if(fileInfo.error) {
        alert('Woops...somehow your query input got lost through an error in space. You can try it again or report this error to my creators: \n' + fileInfo.error);
        return;
      }

      //Check if there's a need for special treatment of 3D content
      if($('#' + id).attr('data-type') === queryTypes.Threed) {
        //for 3D first check if an preview image is available
        if(fileInfo.preview) {
          //draw the preview image on the 3D canvas
          var context = $('#' + id).get(0).getContext('2d');
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
      cache: false,
      contentType: false,
      processData: false
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
   *               data for uploading and generating query items.
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
    if(type === queryTypes.Text) {

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
        //Data is an file information object which references an already exiting binary file
        //Format: { path : [url], name : [filename], type : [queryType], subtype : [sketch|recording|rythm], size : [bytes] }
        data.link = true;
        var files = [data];
      } else {
        //Data is an event object
        var files = data.files || data.target.files || data.dataTransfer.files;
      }

      //Test if browser supports the File API
      if (typeof files !== 'undefined') {
        console.log(files);
        //iterate through the (uploaded) files
        for (var i=0; i < files.length; i++) {
          //test if current file is allowed to be uploaded
          if(isAllowedExtension(files[i].name,type)) {

            //Create the query item token for the search bar
            createItem(id,type,files[i]);

            //Use the file reader API to display the uploaded data before it was actually uploaded
            if(type !== queryTypes.Threed && typeof FileReader !== 'undefined') {

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
      addItems(remainingInput,queryTypes.Text);
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
          console.log("Query result:");
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
    types               : queryTypes,
    allowedTypes        : allowedTypes,
    isAllowedExtension  : isAllowedExtension,
    addItems            : addItems,
    updateItem          : updateItem,
    submit              : submit,
    updateItemCount     : updateItemCount,
    reset               : reset
  };

});
