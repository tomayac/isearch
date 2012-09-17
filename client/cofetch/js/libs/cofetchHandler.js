/* Author: Arnaud, Jonas */
var cofetchHandler = (function() {
  
  var contentObjectID;
  
  //Variable to hold the scraped data
  var scraperData = []; //I don't know why a simple empty object "{}" does not
                        //work here. It seems the script does have access to the
                        //variable only if it's an array. W.E.I.R.D ^^
  var manualIndex = 0;
  var selectedItems = {};
  
  var threed = [];
  var text = [];
  var videos = [];
  var sounds = [];
  var images = [];
  
  //-------------------------------------------------------------  
  var fetchCategories = function() {
	  var serverURL = "getCat";  
	  
	  $.ajax({
    	  type: "GET",
    	  url: serverURL,
    	  dataType: 'JSON',
    	  success: function(data) {
      		$.each(data.paths, function(key,val) {
      			//console.log(key + ' - ' + val);
      		  $('#script-category')
      		    .append($('<option>', { value : val })
      		    .text(val)); 
      		});
    	  },
    	  error: function(jqXHR, textStatus, errorThrown) {
    		  console.log("fetchCategories error. " + errorThrown);
    	  }
      });
  };
  
  //-------------------------------------------------------------  
  var fetch = function(query,category,automatic) {

  	if(automatic !== undefined) {
  		automatic = 1;
  	} else {
  		automatic = 0;
  	}
  
  	var serverURL = "get"
		        + "/" + $.trim(query)
		        + "/" + encodeURIComponent(category)
		        + "/" + automatic;
	
    console.log('Waiting for results for query "' + query + '"');
    $("#loading").show();
    
    //Reset scraper data
    scraperData = [];
    
    //Request our data
    $.ajax({
      url: serverURL,
      dataType: "jsonp",
      jsonpCallback: "_cofetchcb",
      timeout: 1000000,
      success: function(data) {
	    
        if(automatic === 1) {
        	
        	var dialogHtml = '';
        	//Store the returned data
    	    scraperData = data;
    	    console.log("Scraped data: ",scraperData); 
        	
  	  		if(scraperData.length > 1) {
  	  		  dialogHtml += '<p><strong>Content Objects for the keywords "' + query + '" have been successfully created.</strong></p>';
  	  		  dialogHtml += '<p>Generated files:</p><ul>';
  	  		  for(index in scraperData) {
              var co = scraperData[index];
              if(co.urls) {
                for(var i=0; i < co.urls.length; i++) {
                  dialogHtml += '<li><a href="' + co.urls[i] + '" target="_blank">' + co.urls[i] + '</a></li>';
                }
              }
            }
  	  		  dialogHtml += '</ul>';
  	  		  
  	  		} else {
  	  			dialogHtml += '<p><strong>' + scraperData[0].message + '</strong></p>';
  	  			if(scraperData[0].urls) {
  	  				dialogHtml += '<p>Generated files:</p><ul>';
  	  				for(var i=0; i < scraperData[0].urls.length; i++) {
  	  					dialogHtml += '<li><a href="' + scraperData[0].urls[i] + '">' + scraperData[0].urls[i] + '</a></li>';
  	  				}
  	  				dialogHtml += '</ul>';
  	  			}
  	  		}
  	  		$("#dialog").html(dialogHtml);
  	  		$("#dialog").dialog('open');
        	
        } else {
        	
        	//Store the returned data
    	    scraperData = data;
    	    console.log("Scraped data: ",scraperData); 
        	
        	console.log('Data for keywords "' + query + '" successfully fetched.');
        	
        	if(scraperData.length > 0) {
        		$('#save').removeAttr('disabled');
        	}
        	if(scraperData.length > 1) {
        		$('#next').removeAttr('disabled');
        	}
        	
        	manualIndex = 0;
        	setScraperData(manualIndex);
        	
        	$('.search-part').attr('data-last',query);
        	
        	//$("#dialog").html("<p><strong>All results fetched!</strong><br/>Please verify them with the tabs provided and click the 'Save' button on the top if satisfied.</p>");
        	//$("#dialog").dialog("open");
        }
        
        $("#loading").hide();
        
      },
      error: function(jqXHR, textStatus, errorThrown) {
    	  var errorData = {};
    	  $("#loading").hide();
    	  
    	  try {
    		  errorData = JSON.parse(jqXHR.responseText);
    	  } catch (e) {}
    	  
    	  alert("An error occured: " + errorData.message || errorThrown + "\n\rPlease indicate if this error is relevant to your expected result. If yes, please try again or contact the administrator of this service.");
      }
    });
    
  };
  
  //-------------------------------------------------------------  
  var fetchPart = function(type, query, page, gps) {
	  
	  var serverURL = "getPart/";
	  
	  console.log('Waiting for results for ' + type + ' search with query "' + query + '"');
	    
	  //Request our data
	  $.ajax({
		  url: serverURL + type + '/' + query.replace(/\s/g,'+') + '/' + page + '/' + gps,
		  dataType: "jsonp",
		  jsonpCallback: "_cofetchcb",
		  timeout: 80000,
		  success: function(data) {
			  console.log(type + 'data for query "' + query + '" successfully fetched.');
                
			  console.log("Scraped data: ",data);
        
			  var files = [];
			  //Check if there was an error
			  if(data.error) {
			    console.log(data.error);
			  } else {
			    files = data.response;
			  }
			  
			  updateScraperData(manualIndex,type,files);
			  
			  //Now, let's sort the files according to their type
        if (type === "image") {    	  
      	  $('#search-image-loader').hide();
        } else if (type === "text") {
      	  $('#search-text-loader').hide();
        } else if (type === "video") {
      	  $('#search-video-loader').hide();
        } else if (type === "sound") {
      	  $('#search-sound-loader').hide();
        } else if (type === "3d") { 
      	  $('#search-threed-loader').hide();
        }
        
      },
      error: function(jqXHR, textStatus, errorThrown) {
    	  var errorData = {};
    	  
    	  try {
    		  errorData = JSON.parse(jqXHR.responseText);
    	  } catch (e) {}
    	  
    	  alert("An error occured: " + errorData.error || errorThrown + "\n\rPlease try again or contact the administrator under jonas.etzold@fh-erfurt.de .");  
      }
    });
  };
  
  //-------------------------------------------------------------
  var hasScraperData = function() {
	  if(scraperData === undefined) {
		  return false;
	  }
	  
	  if(scraperData.length > 0) {
		  return scraperData.length;
	  } else {
		  return false;
	  }
  };
  
  //-------------------------------------------------------------
  //after new partial retrieval of media items or after content object save,
  //update the scraper data array with the new retrieved partial data 
  //or remove the used items after a content object save 
  var updateScraperData = function(index, type, newItems) {

    var files = scraperData[index].Files;
    var realType = false;
    
    switch(type) {
      case 'text'  : realType = 'Text'; break;
      case '3d'    : realType = 'Object3D'; break;
      case 'image' : realType = 'ImageType'; break;
      case 'video' : realType = 'VideoType'; break;
      case 'sound' : realType = 'SoundType'; break;
    }
    var count = 0;
    
    for(var f in files) {
      if (files[f].Type === realType) {
        if(newItems[count]) {
          scraperData[index].Files[f] = newItems[count];
          count++;
        } else {
          scraperData[index].Files.splice(f,1);
        } 
      } 
    }
    //make sure to add new items again to the files array
    while(newItems[count]) {
      scraperData[index].Files.push(newItems[count]);
      count++;
    }

    setScraperData(index,realType);
  };
  
  //-------------------------------------------------------------
  var setScraperData = function(index,populatePart) {
    
	  //Now, let's sort the files according to their type
	  var files = scraperData[index].Files;
	  
	  if(files.length < 1) {
	    alert("No content object data could be found for '" + scraperData[index].Name + "'. You can try to find data for this keyword by individually searching within the individual modality tabs.");
	  }
	  
	  if(!populatePart) {
	    
	    //If not a specific type of the scraper data should be set,
	    //then reset and set everything new
	    images = [];
	    threed = [];
	    videos = [];
	    sounds = [];
	    text   = [];
	    
	    $.each(files, function(index, file){      
	      //avoid errors if weather is set to null
	      if(!file.Weather) {
	        file.Weather = {};
	      }

	      if (file.Type === "ImageType") {
	        images.push(file);
	      } else if (file.Type === "Object3D") {
	        threed.push(file);
	      } else if (file.Type === "VideoType") {
	        videos.push(file);
	      } else if (file.Type === "SoundType") {
	        sounds.push(file);
	      } else if (file.Type === "Text") {
	        text.push(file);
	      }      
	    });
	    
	  } else {
	    
	    var items = [];
	    
	    $.each(files, function(index, file){
	      if (file.Type === populatePart) {
	        //avoid errors if weather is set to null
	        if(!file.Weather) {
	          file.Weather = {};
	        }
	        items.push(file);
	      }     
	    });
	    
	    switch(populatePart) {
        case 'Text'      : text   = items; break;
        case 'Object3D'  : threed = items; break;
        case 'ImageType' : images = items; break;
        case 'VideoType' : videos = items; break;
        case 'SoundType' : sounds = items; break;
      }
	  }
	  
	  //Populate the form
	  populateForm(index,populatePart);
  };
  
  //-------------------------------------------------------------
  var populateForm = function(index,populatePart) {

    if(!populatePart) {
      var changes = [
        {id: "main-name", value: scraperData[index].Name},
        {id: "main-categoryPath", value: scraperData[index].CategoryPath},
        {id: "main-screenshot", value: "3d"} //defaut: 3d screenshot
      ];
      set(changes);   
    }
    console.log('Will set the individual mode fieldsets ' + (populatePart ? 'for ' + populatePart : ''));

    if(text.length   > 0 && (!populatePart || populatePart === 'Text'))      { setText(); }
    if(threed.length > 0 && (!populatePart || populatePart === 'Object3D'))  { set3d();    $('#search-threed-prev,#search-threed-next').show();}
    if(videos.length > 0 && (!populatePart || populatePart === 'VideoType')) { setVideo(); $('#search-video-prev,#search-video-next').show();}
    if(sounds.length > 0 && (!populatePart || populatePart === 'SoundType')) { setSound(); $('#search-sound-prev,#search-sound-next').show();}
    if(images.length > 0 && (!populatePart || populatePart === 'ImageType')) { setImage(); $('#search-image-prev,#search-image-next').show();}
   
  };
  
  //-------------------------------------------------------------
  var setMediaList = function(type,media,selected) {
    var selected = selected || 0;
    var list = '#' + type + '-list';
    
    if($(list).length > 0) {
       var listHtml = '';
       if(media.length > 0) {
         for(index in media) {
           var item = media[index];
  
           if(type == 'text') {
             if(!item.FreeText || typeof item.FreeText === 'object') {
               item.FreeText = '';
             }
             listHtml += '<li'+ (selected == index ? ' class="active"' : '') + ' data-index="' + index + '"><p>' +  item.FreeText.substr(0,80) + '...</p></li>';
           } else {
             listHtml += '<li'+ (selected == index ? ' class="active"' : '') + ' data-index="' + index + '"><img src="' + item.Preview + '" alt="' + item.Name + '" /></li>';
           }
         }
         $(list).next().hide();
       } else {
         $(list).next().show();
         resetPart(type);
       }
       $(list).html(listHtml);
    } 
  }; 
  
  //-------------------------------------------------------------
  var getText = function(searchPhrase) {
	  if (typeof searchPhrase !== "undefined") {
		  fetchPart('text',searchPhrase,1,0);
	  }
  }; 

  //-------------------------------------------------------------  
  var setText = function(id) {
    var index = 0;
    
    if (typeof id !== "undefined") {
      index = id;
    }
      
    //Take desired text
    if(!text[index]) {
      return;
    }
    
    setMediaList('text',text,index);
    selectedItems['text'] = index;
    
	  var changes = [
      {id: "text-content", value: text[index].FreeText},
      {id: "text-url", value: text[index].URL},
      {id: "text-visible-url", value: text[index].URL}
    ];
    
	  set(changes);
  };
  
  //-------------------------------------------------------------  
  var get3d = function(searchPhrase,page) {
	  if (typeof searchPhrase !== "undefined") {
		  fetchPart('3d',searchPhrase,page,0);
	  }
  }; 
  
  //-------------------------------------------------------------  
  var set3d = function(id) {
    
    var index = 0;
    
    if (typeof id !== "undefined") {
      index = id;
    }
      
    //Take desired 3d model
    if(!threed[index]) {
      return;
    }
    
    setMediaList('threed',threed,index);
    selectedItems['threed'] = index;
    
    var model = threed[index];
    
    //Set the preview image to the right SRC
    $('#threed-visualPreview').attr(
      {'src': model.Preview}
    );
  
    //Let's prepare the array of changes
    var changes = [
      {id: "threed-name", value: model.Name},
      {id: "threed-desc", value: model.Description},
      {id: "threed-tags", value: model.Tags},
      {id: "threed-extension", value: model.Extension},
      {id: "threed-license", value: model.License},
      {id: "threed-licenseURL", value: model.LicenseURL},
      {id: "threed-author", value: model.Author},
      {id: "threed-date", value: model.Date},
      {id: "threed-size", value: model.Size},
      {id: "threed-url", value: model.URL},
      {id: "threed-preview", value: model.Preview},
      {id: "threed-emotions", value: model.Emotions.join(",")},
      {id: "threed-location", value: model.Location.join(",")},
      {id: "threed-weather-condition", value: model.Weather.condition},
      {id: "threed-weather-wind", value: model.Weather.wind},
      {id: "threed-weather-temperature", value: model.Weather.temperature},
      {id: "threed-weather-humidity", value: model.Weather.humidity},
    ];
    
    //And apply them
    set(changes);
    
  };
  
  //-------------------------------------------------------------  
  var getVideo = function(searchPhrase,page,gps) {
	  if (typeof searchPhrase !== "undefined") {
		  fetchPart('video',searchPhrase,page,gps);
	  }
  }; 
  
  //-------------------------------------------------------------  
  var setVideo = function(id) {
    
    var index = 0;
    
    if (typeof id !== "undefined") {
      index = id;
    }
      
    //Take desired video
    if(!videos[index]) {
      return;
    }
    
    setMediaList('video',videos,index);
    selectedItems['video'] = index;
    
    var video = videos[index];
    
    //Extract the ID of the YouTube video
    var videoID = video.URL.substring(video.URL.indexOf("=")+1);
    
    //Set the YouTube IFRAME to the right URL
    $('#video-previewYT').attr(
      {'src': 'http://www.youtube.com/embed/' + videoID}
    );
    
    //Let's prepare the array of changes
    var changes = [
      {id: "video-name", value: video.Name},
      {id: "video-desc", value: video.Description},
      {id: "video-tags", value: video.Tags},
      {id: "video-extension", value: video.Extension},
      {id: "video-license", value: video.License},
      {id: "video-licenseURL", value: video.LicenseURL},
      {id: "video-author", value: video.Author},
      {id: "video-date", value: video.Date},
      {id: "video-size", value: video.Size},
      {id: "video-url", value: video.URL},
      {id: "video-preview", value: video.Preview},
      {id: "video-dimensions", value: video.Dimensions},
      {id: "video-length", value: video.Length},
      {id: "video-emotions", value: video.Emotions.join(",")},
      {id: "video-location", value: video.Location.join(",")},
      {id: "video-weather-condition", value: video.Weather.condition},
      {id: "video-weather-wind", value: video.Weather.wind},
      {id: "video-weather-temperature", value: video.Weather.temperature},
      {id: "video-weather-humidity", value: video.Weather.humidity},
    ];
    
    //And apply them
    set(changes);
    
  };
  
  //-------------------------------------------------------------  
  var getSound = function(searchPhrase,page,gps) {
	  if (typeof searchPhrase !== "undefined") {
		  fetchPart('sound',searchPhrase,page,gps);
	  }
  }; 
  
  //-------------------------------------------------------------  
  var setSound = function(id) {
    
    var index = 0;
    
    if (typeof id !== "undefined") {
      index = id;
    }
      
    //Take desired sounds
    if(!sounds[index]) {
      return;
    }
    
    setMediaList('sound',sounds,index);
    selectedItems['sound'] = index;
    
    var sound = sounds[index];
    
    //Update the preview
    if(!Modernizr.audio.mp3) {
      //console.log('using ogg');
      $('#sound-preview').attr({
        'src': sound['PreviewOGG'],
        'type' : 'audio/ogg'
      });   
    } else {
      //console.log('using mp3');
      $('#sound-preview').attr({
        'src': sound['PreviewMP3'],
        'type' : 'audio/mp3'
      }); 
    }
    
    //Let's prepare the array of changes
    var changes = [
      {id: "sound-name", value: sound.Name},
      {id: "sound-desc", value: sound.Description},
      {id: "sound-tags", value: sound.Tags},
      {id: "sound-extension", value: sound.Extension},
      {id: "sound-license", value: sound.License},
      {id: "sound-licenseURL", value: sound.LicenseURL},
      {id: "sound-author", value: sound.Author},
      {id: "sound-date", value: sound.Date},
      {id: "sound-size", value: sound.Size},
      {id: "sound-url", value: sound.URL},
      {id: "sound-preview", value: sound.Preview},
      {id: "sound-length", value: sound.Length},
      {id: "sound-emotions", value: sound.Emotions.join(",")},
      {id: "sound-location", value: sound.Location.join(",")},
      {id: "sound-weather-condition", value: sound.Weather.condition},
      {id: "sound-weather-wind", value: sound.Weather.wind},
      {id: "sound-weather-temperature", value: sound.Weather.temperature},
      {id: "sound-weather-humidity", value: sound.Weather.humidity},
    ];
    
    //And apply them
    set(changes);
  };
  
  //-------------------------------------------------------------  
  var getImage = function(searchPhrase,page,gps) {
	  if (typeof searchPhrase !== "undefined") {
		  fetchPart('image',searchPhrase,page,gps);
	  }
  }; 
  
  //-------------------------------------------------------------
  var setImage = function(id) {
    
    var index = 0;
    
    if (typeof id !== "undefined") {
      index = id;
    }
      
    //Take desired sounds
    if(!images[index]) {
      return;
    }
    
    setMediaList('image',images,index);
    selectedItems['image'] = index;
    
    var image = images[index];
    
    //Set the Flickr preview to the right URL
    $('#image-previewFlickr').attr(
      {'src': image.URL}
    );
    
    //Let's prepare the array of changes
    var changes = [
      {id: "image-name", value: image.Name},
      {id: "image-desc", value: image.Description},
      {id: "image-tags", value: image.Tags},
      {id: "image-extension", value: image.Extension},
      {id: "image-license", value: image.License},
      {id: "image-licenseURL", value: image.LicenseURL},
      {id: "image-author", value: image.Author},
      {id: "image-date", value: image.Date},
      {id: "image-size", value: image.Size},
      {id: "image-url", value: image.URL},
      {id: "image-preview", value: image.Preview},
      {id: "image-dimensions", value: image.Dimensions},
      {id: "image-emotions", value: image.Emotions},
      {id: "image-location", value: image.Location.join(",")},
      {id: "image-weather-condition", value: image.Weather.condition},
      {id: "image-weather-wind", value: image.Weather.wind},
      {id: "image-weather-temperature", value: image.Weather.temperature},
      {id: "image-weather-humidity", value: image.Weather.humidity},
    ];
    
    //And apply them
    set(changes);
  };
  
  //-------------------------------------------------------------
  var unsetItem = function(type) {
    if(selectedItems[type]) {
      selectedItems[type] = false;
    }
  };
  
  //-------------------------------------------------------------
  var setNext = function() {
	  manualIndex++;
	  if(manualIndex < scraperData.length) {
		  setScraperData(manualIndex);
		  return (scraperData.length - 1 - manualIndex);
	  } else {
		  return false;
	  }
  };
  
  //-------------------------------------------------------------
  var setPrevious = function() {
	  manualIndex--;
	  if(manualIndex >= 0) {
		  setScraperData(manualIndex);
		  return manualIndex;
	  } else {
		  return false;
	  }
  };
  
  //------------------------------------------------------------- 
  var getTags = function(tagFieldId) {
    if($(tagFieldId).length < 1) {
      return [];
    }
    var tags = $(tagFieldId).val().split(",");
    for(var t=0; t < tags.length; t++) {
      tags[t] = tags[t].replace(/^\s*|\s*$/g,'');
      tags[t] = tags[t].charAt(0).toUpperCase() + tags[t].slice(1);
    }
    
    return tags;
  };
  
  //-------------------------------------------------------------  
  var save = function() {
	  
  	var serverURL = "post/";  
  	
  	if($('#main-name').val().length < 2) {
  		alert("You need at least a valid name for the Content Object in order to save it!");
  		return;
  	}
	
    //Let's serialize our form:   
    var jsonFile = {
      "ID": contentObjectID,
      "Name": $('#main-name').val(),
      "Screenshot": getScreenshot(),
      "CategoryPath": $('#main-categoryPath').val(), 
      "Files": []
    };
    
    if($('input[name="text"]').attr('checked') === 'checked') {
      jsonFile.Files.push({
        "Type": "Text",
        "FreeText": $('#text-content').val(),
        "URL": $('#text-url').val()
      });
    }
    
    if($('input[name="threed"]').attr('checked') === 'checked') {
      
      jsonFile.Files.push(
      {
        "Type": "Object3D",
        "Name": $('#threed-name').val(), 
        "Description": $('#threed-desc').val(),
        "Tags": getTags('#threed-tags'),
        "Extension": $('#threed-extension').val(),
        "License": $('#threed-license').val(),
        "LicenseURL": $('#threed-licenseURL').val(),
        "Author": $('#threed-author').val(),
        "Date": $('#threed-date').val(),
        "Size": $('#threed-size').val(),
        "URL": $('#threed-url').val(),
        "Preview": $('#threed-preview').val(),
        "Emotions": $('#threed-emotions').val() || [],
        "Location": $('#threed-location').val().split(","),
        "Weather": {
          "condition": $('#threed-weather-condition').val(), 
          "wind": $('#threed-weather-wind').val(), 
          "temperature": $('#threed-weather-temperature').val(), 
          "humidity": $('#threed-weather-humidity').val()
        }
      });
    }
    
    if($('input[name="image"]').attr('checked') === 'checked') {
    
    	jsonFile.Files.push(
			{
		        "Type": "ImageType",
		        "Name": $('#image-name').val(),
		        "Description": $('#image-desc').val(),
		        "Tags": getTags('#image-tags'),
		        "Extension": $('#image-extension').val(),
		        "License": $('#image-license').val(),
		        "LicenseURL": $('#image-licenseURL').val(),
		        "Author": $('#image-author').val(),
		        "Date": $('#image-date').val(),
		        "Size": $('#image-size').val(),
		        "URL": $('#image-url').val(),
		        "Preview": $('#image-preview').val(),
		        "Dimensions": $('#image-dimensions').val(),
		        "Emotions": $('#image-emotions').val() || [],
		        "Location": $('#image-location').val().split(","),
		        "Weather": {
		          "condition": $('#image-weather-condition').val(), 
		          "wind": $('#image-weather-wind').val(), 
		          "temperature": $('#image-weather-temperature').val(), 
		          "humidity": $('#image-weather-humidity').val()
		        }
		    }
    	); 
    };
    
    if($('input[name="video"]').attr('checked') === 'checked') {
    	
    	jsonFile.Files.push(
			{
		        "Type": "VideoType",
		        "Name": $('#video-name').val(), 
		        "Description": $('#video-desc').val(),
		        "Tags": getTags('#video-tags'),
		        "Extension": $('#video-extension').val(),
		        "License": $('#video-license').val(),
		        "LicenseURL": $('#video-licenseURL').val(),
		        "Author": $('#video-author').val(),
		        "Date": $('#video-date').val(),
		        "Size": $('#video-size').val(),
		        "URL": $('#video-url').val(),
		        "Preview": $('#video-preview').val(),
		        "Dimensions": $('#video-dimensions').val(),
		        "Length": $('#video-length').val(),
		        "Emotions": $('#video-emotions').val() || [],
		        "Location": $('#video-location').val().split(","),
		        "Weather": {
		          "condition": $('#video-weather-condition').val(), 
		          "wind": $('#video-weather-wind').val(), 
		          "temperature": $('#video-weather-temperature').val(), 
		          "humidity": $('#video-weather-humidity').val()
		        }
		    }
    	);
    };
    
    if($('input[name="sound"]').attr('checked') === 'checked') {
    	
    	jsonFile.Files.push(
			{
		        "Type": "SoundType",
		        "Name": $('#sound-name').val(),
		        "Description": $('#sound-desc').val(),
		        "Tags": getTags('#sound-tags'),
		        "Extension": $('#sound-extension').val(),
		        "License": $('#sound-license').val(),
		        "LicenseURL": $('#sound-licenseURL').val(),
		        "Author": $('#sound-author').val(),
		        "Date": $('#sound-date').val(),
		        "Size": $('#sound-size').val(),
		        "URL": $('#sound-url').val(),
		        "Preview": $('#sound-preview').val(),
		        "Length": $('#sound-length').val(),
		        "Emotions": $('#sound-emotions').val() || [],
		        "Location": $('#sound-location').val().split(","),
		        "Weather": {
		          "condition": $('#sound-weather-condition').val(), 
		          "wind": $('#sound-weather-wind').val(), 
		          "temperature": $('#sound-weather-temperature').val(), 
		          "humidity": $('#sound-weather-humidity').val()
		        }
		     }
    	);
    };

    $("#loading").show();
    
    //Send it to the server
    $.ajax({
    	  type: "POST",
    	  url: serverURL,
    	  data: JSON.stringify(jsonFile),
    	  success: function(data) {
    	    
    	    $("#loading").hide();
    	    
    	    $.each(selectedItems, function(key, value) {
    	      if(!value) {
    	        return;
    	      }
    	      switch(key) {
      	      case 'text'  : text.splice(value, 1); updateScraperData(manualIndex, 'text', text); break;
      	      case 'threed': threed.splice(value, 1); updateScraperData(manualIndex, '3d', threed); break;
      	      case 'image' : images.splice(value, 1); updateScraperData(manualIndex, 'image', images); break;
      	      case 'video' : videos.splice(value, 1); updateScraperData(manualIndex, 'video', videos); break;
      	      case 'sound' : sounds.splice(value, 1); updateScraperData(manualIndex, 'sound', sounds); break;
      	    }
    	    });
    	    
    	    selectedItems = {};

    		  var restData = hasScraperData();
    		  var dialogHtml = '';
    		  
    		  data = JSON.parse(data);
    		  if(typeof data === 'object') {
    			  dialogHtml += '<p><strong>' + data.message || 'Error' + '</strong></p>';
    			  if(data.urls) {
    				  dialogHtml += '<p>Generated files:</p><ul>';
    				  for(var i=0; i < data.urls.length; i++) {
    					  dialogHtml += '<li><a href="' + data.urls[i] + '">' + data.urls[i] + '</a></li>';
    				  }
    				  dialogHtml += '</ul>';
    			  }
    		  }
    		  
    		  if(restData < 1 || restData == false) {
    			  
    			  dialogHtml += '<p>You revised and saved every fetched Content Object. Please start a new search.</p>';
    			  $('#script-keywords').val('');
    			  $(".datatab").hide();
    			  $("#save").attr('disabled', 'disabled');
    			  $("#dialog").html(dialogHtml);
    			  
    		  } else {
    			  
    			  $("#dialog").html(dialogHtml);
    			  /*
    			  var next = setNext();  
    			  if(next === false || next === 0) {
    				  $('#next').attr('disabled', 'disabled');
    			  } else {
    				  $('#next').removeAttr('disabled');
    			  }
    			  */
    		  }

    		  $("#dialog").dialog('open');
    	  },
    	  error: function(jqXHR, textStatus, errorThrown) {
    	    
    	    $("#loading").hide();
    	    
    		  var errorData = {};
        	  try {
        		  errorData = JSON.parse(jqXHR.responseText);
        	  } catch (e) {}
        	  
        	  alert("An error occured: " + errorData.message || errorThrown + "\n\rPlease try again or contact the administrator of this service.");  
          },
    	  traditional: true,
    	  dataType: "text",
    	  contentType : "application/json; charset=utf-8"
    });
    
  };
  
  //-------------------------------------------------------------  
  var resetForm = function() {
	  $('#script-tabs').each (function(){
		  
		  var key = $('#script-keywords').val();
		  var cat = $('#script-category').val();
		  var aut = $('#script-automatic').attr("checked");
		
		  this.reset();
		  
		  $('#script-keywords').val(key);
		  $('#script-category').val(cat);
		  $('#script-automatic').attr("checked", aut);
		  
	  });
	  
	  setMediaList('text',[]);
	  setMediaList('threed',[]);
	  setMediaList('image',[]);
	  setMediaList('sound',[]);
	  setMediaList('video',[]);
	  
	  $("#script-tabs").tabs( "select" , 0);
  };
  
  //-------------------------------------------------------------  
  var resetPart = function(type) {
    
    if(type == 'text') {
      var changes = [
        {id: "text-content", value: ''}
      ];
    } else {
      //Let's prepare the array of changes
      var changes = [
        {id: type + "-name", value: ''},
        {id: type + "-desc", value: ''},
        {id: type + "-tags", value: ''},
        {id: type + "-extension", value: ''},
        {id: type + "-license", value: ''},
        {id: type + "-licenseURL", value: ''},
        {id: type + "-author", value: ''},
        {id: type + "-date", value: ''},
        {id: type + "-size", value: ''},
        {id: type + "-url", value: ''},
        {id: type + "-preview", value: ''},
        {id: type + "-dimensions", value: ''},
        {id: type + "-length", value: ''},
        {id: type + "-emotions", value: ''},
        {id: type + "-location", value: ''},
        {id: type + "-weather-condition", value: ''},
        {id: type + "-weather-wind", value: ''},
        {id: type + "-weather-temperature", value: ''},
        {id: type + "-weather-humidity", value: ''},
      ];
    }
    //And apply them
    set(changes);
  };
  
  //-------------------------------------------------------------  
  var getScreenshot = function() {
    
    var screenshotValue = $('#main-screenshot').val();
    
    if (screenshotValue === "image") {
      return $('#image-preview').val();
    }
    if (screenshotValue === "3d") {
      return $('#threed-preview').val();
    }
    if (screenshotValue === "video") {
      return $('#video-preview').val();
    }
    if (screenshotValue === "sound") {
      return $('#sound-preview').val();
    }   
  };
  
  //-------------------------------------------------------------  
  var set = function(changes) {
    //"changes" is an array of {id: id, value: value}
    if (changes.length === 0) {
      return;
    } else {
      //We have some fields to set
      var i;
      for (i=0; i<changes.length; i++){
        if(typeof changes[i].value !== undefined) {
          setField(changes[i].id, changes[i].value);
        } 
      }
    }
  };
  
  //-------------------------------------------------------------  
  var setField = function(id, value) {
    
    if($("#" + id).is("a")) {
      $("#" + id).attr('href',value);
      $("#" + id).text(value);
      return;
    }
    
    //jQuery is awesome. Whether it be a select, a multiple select or a simple text field, 
    //it handles it through this simple call. Hooray :)
    $("#" + id).val(value);

  };
  
  //-------------------------------------------------------------  
  function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if(results == null)
      return "";
    else
      return decodeURIComponent(results[1].replace(/\+/g, " "));
  }
  
  //-------------------------------------------------------------  
  return {
    fetchCategories: fetchCategories, 
    fetch: fetch,
    fetchPart: fetchPart,
    hasScraperData: hasScraperData,
    populateForm: populateForm,
    getText: getText,
    setText: setText,
    get3d: get3d,
    set3d: set3d,
    getVideo: getVideo,
    setVideo: setVideo,
    getSound: getSound,
    setSound: setSound,
    getImage: getImage,
    setImage: setImage,
    unsetItem: unsetItem,
    setNext: setNext,
    setPrevious: setPrevious,
    save: save, 
    resetForm: resetForm,
    getParameterByName: getParameterByName,
    //For debug purpose, this could be useful
    scraperData: scraperData,
    videos: videos,
    sounds: sounds,
    images: images, 
    threed: threed, 
    text: text
  };
  
}());