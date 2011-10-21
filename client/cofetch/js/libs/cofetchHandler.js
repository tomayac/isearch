/* Author: Arnaud */
var cofetchHandler = (function() {
  
  var contentObjectID;
  
  //Variable to hold the scraped data
  var scraperData = []; //I don't know why a simple empty object "{}" does not
                        //work here. It seems the script does have access to the
                        //variable inly if it's array. W.E.I.R.D ^^
  var manualIndex = 0;
  
  var threed = [];
  var text = [];
  var videos = [];
  var sounds = [];
  var images = [];
  
  var iTd = 0, tdDir = 1;
  var iImg = 0, imgDir = 1;
  var iVid = 0, vidDir = 1;
  var iSou = 0, souDir = 1;
  
  //-------------------------------------------------------------  
  var fetchCategories = function() {
	  var serverURL = "/cofetch/getCat";  
	  
	  $.ajax({
    	  type: "GET",
    	  url: serverURL,
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

	var serverURL = "/cofetch/get"
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
      timeout: 300000,
      success: function(data) {
    	
    	//Store the returned data
	    scraperData.push(data.response);
	    console.log("Scraped data: ",scraperData);  
    	  
    	if(automatic && scraperData.success) {
    		console.log('Data for keywords "' + query + '" successfully fetched and stored as RUCoD.');
    	} else {
	        
	        if(automatic === 1) {
	        	
	        	alert(scraperData[0].success);
	        	
	        } else {
	        	
	        	console.log('Data for keywords "' + query + '" successfully fetched.');
	        	
	        	if(scraperData[0].length > 0) {
	        		$('#save').removeAttr('disabled');
	        	}
	        	if(scraperData[0].length > 1) {
	        		$('#next').removeAttr('disabled');
	        	}
	        	
	        	manualIndex = 0;
	        	setScraperData(manualIndex);
	        	
	        }
    	}
        $("#loading").hide();
        
      },
      error: function(jqXHR, textStatus, errorThrown) {
    	  errorData = JSON.parse(jqXHR.responseText);
    	  alert("An error occured: " + errorData.message || errorThrown + "\n\rPlease indicate if this error is relevant to your expected result. If yes, please try again or contact the administrator under jonas.etzold@fh-erfurt.de .");
    	  $("#loading").hide();
      }
    });
    
  };
  
  //-------------------------------------------------------------  
  var fetchPart = function(type, query) {
	  
	  var serverURL = "/cofetch/getPart/";
	  //var serverURL = "http://localhost:8082/get/";
	  
	  console.log('Waiting for results for ' + type + ' search with query "' + query + '"');
	    
	  //Request our data
	  $.ajax({
		  url: serverURL + type + '/' + query.replace(/\s/g,'+'),
		  dataType: "jsonp",
		  jsonpCallback: "_cofetchcb",
		  timeout: 80000,
		  success: function(data) {
			  console.log(type + 'data for query "' + query + '" successfully fetched.');
                
			  console.log("Scraped data: ",data);
        
			  //Now, let's sort the files according to their type
			  var files = data.response;
			  
	          if (type === "image") {
	        	  //Reset the old result
	        	  images = [];
	        	  
	        	  $.each(files, function(index, file){  
	        		  images.push(file);
	        	  });
	        	  
	        	  if(images.length > 0) {
	        		  setImage();
	        	  }
	        	  
	          } else if (type === "text") {
	        	  //Reset the old result
	        	  text = [];
	        	  
	        	  $.each(files, function(index, file){  
	        		  text.push(file);
	        	  });
	        	  
	        	  if(text.length > 0) {
	        		  setText();
	        	  }
	        	  
	          } else if (type === "video") {
	        	  //Reset the old result
	        	  videos = [];
	        	  
	        	  $.each(files, function(index, file){  
	        		  videos.push(file);
	        	  });
	        	  
	        	  if(videos.length > 0) {
	        		  setVideo();
	        	  }
	          } else if (type === "sound") {
	        	  //Reset the old result
	        	  sounds = [];
	        	  
	        	  $.each(files, function(index, file){  
	        		  sounds.push(file);
	        	  });
	        	  
	        	  if(sounds.length > 0) {
	        		  setSound();
	        	  }
	          } else if (type === "3d") {
	        	  //Reset the old result
	        	  threed = [];
	        	  
	        	  $.each(files, function(index, file){  
	        		  threed.push(file);
	        	  });
	        	  
	        	  if(threed.length > 0) {
	        		  set3d();
	        	  }
	          }
        
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert('error ' + textStatus + " " + errorThrown);    
      }
    });
  };
  
  //-------------------------------------------------------------
  var hasScraperData = function() {
	  if(scraperData.length > 0) {
		  return true;
	  } else {
		  return false;
	  }
  };
  
  //-------------------------------------------------------------
  var setScraperData = function(index) {
	  
	  //Now, let's sort the files according to their type
	  var files = scraperData[0][index].Files;
	  
	  $.each(files, function(index, file){
		  
	    if (file.Type === "ImageType") {
		  images.push(file);
		} else if (file.Type === "Object3d") {
		  threed.push(file);
		} else if (file.Type === "VideoType") {
		  videos.push(file);
		} else if (file.Type === "SoundType") {
		  sounds.push(file);
		} else if (file.Type === "TextType") {
		  text.push(file);
		}
	    
	  });
  
	  //Populate the form
	  populateForm();
  };
  
  //-------------------------------------------------------------
  var populateForm = function() {
    
    console.log(scraperData);
    
    var changes = [
      {id: "main-name", value: scraperData[0].Name},
      {id: "main-categoryPath", value: scraperData[0].CategoryPath},
      {id: "main-screenshot", value: "3d"}, //defaut: 3d screenshot
      {id: "text-content", value: text[0].FreeText}
    ];
    set(changes);
    
    console.log('Will set the individual mode fieldsets');
    
    if(threed.length > 0) { set3d(); }
    if(videos.length > 0) { setVideo(); }
    if(sounds.length > 0) { setSound(); }
    if(images.length > 0) { setImage(); }
    
  };

  //-------------------------------------------------------------
  var getText = function(searchPhrase) {
	  if (typeof searchPhrase !== "undefined") {
		  fetchPart('text',searchPhrase);
	  }
  }; 

  //-------------------------------------------------------------  
  var setText = function() {
	  var changes = [
         {id: "text-content", value: text[0].FreeText}
       ];
       set(changes);
  };
  
  //-------------------------------------------------------------  
  var get3d = function(searchPhrase) {
	  if (typeof searchPhrase !== "undefined") {
		  fetchPart('3d',searchPhrase);
	  }
  }; 
  
  //-------------------------------------------------------------  
  var set3d = function(shift) {
    
    if (typeof shift !== "undefined") {
        
        if (iTd == (threed.length-1)) {
        	tdDir = 0;
        	alert('No other 3D models to see, going back');
        } else if(iTd == 0){
        	tdDir = 1; 
        }
        
        if(tdDir == 1) {
          iTd++;
        } else {
      	  iTd--;
        }
     }
      
    //Take the first video of the Array
    var model = threed[iTd];  
	  
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
  var getVideo = function(searchPhrase) {
	  if (typeof searchPhrase !== "undefined") {
		  fetchPart('video',searchPhrase);
	  }
  }; 
  
  //-------------------------------------------------------------  
  var setVideo = function(shift) {
    if (typeof shift !== "undefined") {
      //if the "shift" argument is set, we must change the video
      //We do so by removing the first element of the array "videos"
      
      if (iVid == (videos.length-1)) {
    	vidDir = 0;
        alert('No other videos to see, going back');
      } else if(iVid == 0){
    	vidDir = 1; 
      }
      
      if(vidDir == 1) {
    	  iVid++;
      } else {
    	  iVid--;
      }
    }
    
    //Take the first video of the Array
    var video = videos[iVid];
    
    //Extract the ID of the YouTube video
    var videoID = video.URL.substring(video.URL.indexOf("=")+1);
    console.log(videoID);
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
  var getSound = function(searchPhrase) {
	  if (typeof searchPhrase !== "undefined") {
		  fetchPart('sound',searchPhrase);
	  }
  }; 
  
  //-------------------------------------------------------------  
  var setSound = function(shift) {
    if (typeof shift !== "undefined") {
        //if the "shift" argument is set, we must change the video
        //We do so by removing the first element of the array "sounds"
      
    	if (iSou == (sounds.length-1)) {
    		souDir = 0;
            alert('No other sounds to hear, going back');
        } else if(iSou == 0){
        	souDir = 1; 
        }
          
        if(souDir == 1) {
        	iSou++;
        } else {
        	iSou--;
        }
    }
    
    //Take the first sound of the array
    var sound = sounds[iSou];
    
    //Update the preview
    $('#sound-previewOGG').attr(
      {'src': sound['PreviewOGG']}
    );
    
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
  var getImage = function(searchPhrase) {
	  if (typeof searchPhrase !== "undefined") {
		  fetchPart('image',searchPhrase);
	  }
  }; 
  
  //-------------------------------------------------------------
  var setImage = function(shift) {
    if (typeof shift !== "undefined") {
      //if the "shift" argument is set, we must change the video
      //We do so by removing the first element of the array "images"
      
    	if (iImg == (images.length-1)) {
    		imgDir = 0;
            alert('No other images to see, going back');
        } else if(iImg == 0){
        	imgDir = 1; 
        }
          
        if(imgDir == 1) {
        	iImg++;
        } else {
        	iImg--;
        }
    }
    
    //Take the first video of the Array
    var image = images[iImg];
    
    //Set the Flickr preview to the right URL
    $('#image-previewFlickr').attr(
      {'src': image.Preview}
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
  var setNext = function() {
	  manualIndex++;
	  if(manualIndex < scraperData[0].length) {
		  setScraperData(manualIndex);
		  return true;
	  } else {
		  return false;
	  }
  };
  
  //-------------------------------------------------------------
  var setPrevious = function() {
	  manualIndex--;
	  if(manualIndex > 0) {
		  setScraperData(manualIndex);
		  return true;
	  } else {
		  return false;
	  }
  };
  
  //-------------------------------------------------------------  
  var save = function(callback) {
    
	var serverURL = "/cofetch/post/";  
	
	var tags = $('#threed-tags').val().split(",");
	for(var t=0; t < tags.length; t++) {
		tags[t] = tags[t].replace(/^\s*|\s*$/g,'');
		tags[t] = tags[t].charAt(0).toUpperCase() + tags[t].slice(1);
	}
	
    //Let's serialize our form:   
    var jsonFile = {
      "ID": contentObjectID,
      "Name": $('#main-name').val(),
      "Screenshot": getScreenshot(),
      "CategoryPath": $('#main-categoryPath').val(), 
      "Files": [{
          "Type": "Text",
          "FreeText": $('#text-content').val()
      },
      {
        "Type": "Object3D",
        "Name": $('#threed-name').val(), 
        "Description:": $('#threed-desc').val(),
        "Tags": tags,
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
      }]
    };
    
    if($('#image-name').val().length > 0) {
    	var tags = $('#image-tags').val().split(",");
    	for(var t=0; t < tags.length; t++) {
    		tags[t] = tags[t].replace(/^\s*|\s*$/g,'');
    		tags[t] = tags[t].charAt(0).toUpperCase() + tags[t].slice(1);
    	}
    	
    	jsonFile.Files.push(
			{
		        "Type": "ImageType",
		        "Name": $('#image-name').val(),
		        "Description": $('#image-desc').val(),
		        "Tags": tags,
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
    
    if($('#video-name').val().length > 0) {
    	var tags = $('#video-tags').val().split(",");
    	for(var t=0; t < tags.length; t++) {
    		tags[t] = tags[t].replace(/^\s*|\s*$/g,'');
    		tags[t] = tags[t].charAt(0).toUpperCase() + tags[t].slice(1);
    	}
    	
    	jsonFile.Files.push(
			{
		        "Type": "VideoType",
		        "Name": $('#video-name').val(), 
		        "Description": $('#video-desc').val(),
		        "Tags": tags,
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
    
    if($('#sound-name').val().length > 0) {
    	var tags = $('#sound-tags').val().split(",");
    	for(var t=0; t < tags.length; t++) {
    		tags[t] = tags[t].replace(/^\s*|\s*$/g,'');
    		tags[t] = tags[t].charAt(0).toUpperCase() + tags[t].slice(1);
    	}
    	
    	jsonFile.Files.push(
			{
		        "Type": "SoundType",
		        "Name": $('#sound-name').val(),
		        "Description": $('#sound-desc').val(),
		        "Tags": tags,
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
    
    //Send it to the server
    $.ajax({
    	  type: "POST",
    	  url: serverURL,
    	  data: JSON.stringify(jsonFile),
    	  success: function(data) {
    		  callback('Successfully saved! ('+data+')');
    		  scraperData[0].splice(manualIndex,1);
    		  if(!setNext()) {
    			  if(!setPrevious()) {
    				  alert('You revised every fetched Content Object. Please start a new search. Page will reload.');
    				  window.location.reload();
    			  }
    		  } 
    	  },
    	  traditional: true,
    	  dataType: "text",
    	  contentType : "application/json; charset=utf-8"
    });
    
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
    setNext: setNext,
    setPrevious: setPrevious,
    save: save, 
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