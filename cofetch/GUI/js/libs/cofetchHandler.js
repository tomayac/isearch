/* Author: Arnaud */
var cofetchHandler = (function() {
  
  var contentObjectID;
  
  //Variable to hold the scraped data
  var scraperData = []; //I don't know why a simple empty object "{}" does not
                        //work here. It seems the script does have access to the
                        //variable inly if it's array. W.E.I.R.D ^^
  var threed = [];
  var text = [];
  var videos = [];
  var sounds = [];
  var images = [];
  
  var fetch = function(id) {
    
    //var serverURL = "http://isearch.ai.erfurt.de:8082/get/";
    var serverURL = "http://localhost:8082/get/";
    
    
    contentObjectID = id;
    console.log('Waiting results for object #' + id);
    
    //Request our data
    $.ajax({
      url: serverURL + contentObjectID,
      dataType: "jsonp",
      jsonpCallback: "_cofetchcb",
      timeout: 60000,
      success: function(data) {
        console.log('Data for CO #' + id + ' successfully fetched.');
                
        //Store the returned data
        scraperData.push(data.response);
        console.log("Scraped data: ",scraperData);
        
        //Now, let's sort the files according to their type
        var files = scraperData[0].Files;
        $.each(files, function(index, file){
          if (file.Type === "ImageType") {
            images.push(file);
          } else if (file.Type === "Object3d") {
            threed.push(file);
            console.log("Threed variable",threed);
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
        
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert('error ' + textStatus + " " + errorThrown);    
      }
    });
    
  };
  
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
  
  var set3d = function() {
    
    //Set the preview image to the right SRC
    $('#threed-visualPreview').attr(
      {'src': threed[0].Preview}
    );
    
    //Let's prepare the array of changes
    var changes = [
      {id: "threed-name", value: threed[0].Name},
      {id: "threed-tags", value: threed[0].Tags},
      {id: "threed-extension", value: threed[0].Extension},
      {id: "threed-license", value: threed[0].License},
      {id: "threed-licenseURL", value: threed[0].LicenseURL},
      {id: "threed-author", value: threed[0].Author},
      {id: "threed-date", value: threed[0].Date},
      {id: "threed-size", value: threed[0].Size},
      {id: "threed-url", value: threed[0].URL},
      {id: "threed-preview", value: threed[0].Preview},
      {id: "threed-emotions", value: threed[0].Emotions},
      {id: "threed-location", value: threed[0].Location},
      {id: "threed-weather-condition", value: threed[0].Weather.condition},
      {id: "threed-weather-wind", value: threed[0].Weather.wind},
      {id: "threed-weather-temperature", value: threed[0].Weather.temperature},
      {id: "threed-weather-humidity", value: threed[0].Weather.humidity},
    ];
    
    //And apply them
    set(changes);
    
  };
  
  var setVideo = function(shift) {
    if (typeof shift !== "undefined") {
      //if the "shift" argument is set, we must change the video
      //We do so by removing the first element of the array "videos"
      
      if (videos.length > 1) {
        videos.shift();
      } else {
        alert('No other videos to see');
        return;
      }
    }
    
    //Take the first video of the Array
    var video = videos[0];
    
    //Extract the ID of the YouTube video
    var videoID = video.URL.substring(video.URL.indexOf("="));
    
    //Set the YouTube IFRAME to the right URL
    $('#video-previewYT').attr(
      {'src': 'http://www.youtube.com/embed/' + videoID + '?wmode=opaque'}
    );
    
    //Let's prepare the array of changes
    var changes = [
      {id: "video-name", value: video.Name},
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
      {id: "video-emotions", value: video.Emotions},
      {id: "video-location", value: video.Location},
      {id: "video-weather-condition", value: video.Weather.condition},
      {id: "video-weather-wind", value: video.Weather.wind},
      {id: "video-weather-temperature", value: video.Weather.temperature},
      {id: "video-weather-humidity", value: video.Weather.humidity},
    ];
    
    //And apply them
    set(changes);
    
  };
  
  var setSound = function(shift) {
    if (typeof shift !== "undefined") {
      //if the "shift" argument is set, we must change the video
      //We do so by removing the first element of the array "sounds"
      
      if (sounds.length > 1) {
        sounds.shift();
      } else {
        alert('No other sound to hear');
        return;
      }
    }
    
    //Take the first sound of the array
    var sound = sounds[0];
    
    //Update the preview
    $('#sound-previewOGG').attr(
      {'src': sound['PreviewOGG']}
    );
    
    //Let's prepare the array of changes
    var changes = [
      {id: "sound-name", value: sound.Name},
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
      {id: "sound-emotions", value: sound.Emotions},
      {id: "sound-location", value: sound.Location},
      {id: "sound-weather-condition", value: sound.Weather.condition},
      {id: "sound-weather-wind", value: sound.Weather.wind},
      {id: "sound-weather-temperature", value: sound.Weather.temperature},
      {id: "sound-weather-humidity", value: sound.Weather.humidity},
    ];
    
    //And apply them
    set(changes);
  };
  
  var setImage = function(shift) {
    if (typeof shift !== "undefined") {
      //if the "shift" argument is set, we must change the video
      //We do so by removing the first element of the array "images"
      
      if (images.length > 1) {
        images.shift();
      } else {
        alert('No other images to look at!');
        return;
      }
    }
    
    //Take the first video of the Array
    var image = images[0];
    
    //Set the Flickr preview to the right URL
    $('#image-previewFlickr').attr(
      {'src': image.Preview}
    );
    
    //Let's prepare the array of changes
    var changes = [
      {id: "image-name", value: image.Name},
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
      {id: "image-location", value: image.Location},
      {id: "image-weather-condition", value: image.Weather.condition},
      {id: "image-weather-wind", value: image.Weather.wind},
      {id: "image-weather-temperature", value: image.Weather.temperature},
      {id: "image-weather-humidity", value: image.Weather.humidity},
    ];
    
    //And apply them
    set(changes);
  };
  
  var save = function() {
    
    //Let's serialize our form:   
    var jsonFile = {
      "ID": contentObjectID,
      "Name": $('#main-name').val(),
      "Screenshot": getScreenshot(),
      "CategoryPath": $('#main-categoryPath').val(), 
      "Freetext": $('#text-content').val(),
      "Files": [{
        "Type": "Object3D",
        "Name": $('#threed-name').val(), 
        "Tags": $('#threed-tags').val().split(","),
        "Extension": $('#threed-extension').val(),
        "License": $('#threed-license').val(),
        "LicenseURL": $('#threed-licenseURL').val(),
        "Author": $('#threed-author').val(),
        "Date": $('#threed-date').val(),
        "Size": $('#threed-size').val(),
        "URL": $('#threed-url').val(),
        "Preview": $('#threed-preview').val(),
        "Emotions": $('#threed-emotions').val(),
        "Location": $('#threed-location').val(),
        "Weather": {
          "condition": $('#threed-weather-condition').val(), 
          "wind": $('#threed-weather-wind').val(), 
          "temperature": $('#threed-weather-temperature').val(), 
          "humidity": $('#threed-weather-humidity').val()
        }
      },
      {
        "Type": "ImageType",
        "Name": $('#image-name').val(), 
        "Tags": $('#image-tags').val().split(","),
        "Extension": $('#image-extension').val(),
        "License": $('#image-license').val(),
        "LicenseURL": $('#image-licenseURL').val(),
        "Author": $('#image-author').val(),
        "Date": $('#image-date').val(),
        "Size": $('#image-size').val(),
        "URL": $('#image-url').val(),
        "Preview": $('#image-preview').val(),
        "Dimensions": $('#image-dimensions').val(),
        "Emotions": $('#image-emotions').val(),
        "Location": $('#image-location').val(),
        "Weather": {
          "condition": $('#image-weather-condition').val(), 
          "wind": $('#image-weather-wind').val(), 
          "temperature": $('#image-weather-temperature').val(), 
          "humidity": $('#image-weather-humidity').val()
        }
      },
      {
        "Type": "VideoType",
        "Name": $('#video-name').val(), 
        "Tags": $('#video-tags').val().split(","),
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
        "Emotions": $('#video-emotions').val(),
        "Location": $('#video-location').val(),
        "Weather": {
          "condition": $('#video-weather-condition').val(), 
          "wind": $('#video-weather-wind').val(), 
          "temperature": $('#video-weather-temperature').val(), 
          "humidity": $('#video-weather-humidity').val()
        }
      },
      {
        "Type": "SoundType",
        "Name": $('#sound-name').val(), 
        "Tags": $('#sound-tags').val().split(","),
        "Extension": $('#sound-extension').val(),
        "License": $('#sound-license').val(),
        "LicenseURL": $('#sound-licenseURL').val(),
        "Author": $('#sound-author').val(),
        "Date": $('#sound-date').val(),
        "Size": $('#sound-size').val(),
        "URL": $('#sound-url').val(),
        "Preview": $('#sound-preview').val(),
        "Length": $('#sound-length').val(),
        "Emotions": $('#sound-emotions').val(),
        "Location": $('#sound-location').val(),
        "Weather": {
          "condition": $('#sound-weather-condition').val(), 
          "wind": $('#sound-weather-wind').val(), 
          "temperature": $('#sound-weather-temperature').val(), 
          "humidity": $('#sound-weather-humidity').val()
        }
      }] 
    };
    
    return jsonFile;
  };
  
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
    
  }
  
  var set = function(changes) {
    //"changes" is an array of {id: id, value: value}
    if (changes.length === 0) {
      return;
    } else {
      //We have some fields to set
      var i;
      for (i=0; i<changes.length; i++){
        if(typeof changes[i].value !== undefined) {
          setField(changes[i].id, changes[i].value)
        }
      }
    }
  };
  
  var setField = function(id, value) {
    
    //jQuery is awesome. Whether it be a select, a multiple select or a simple text field, 
    //it handles it through this simple call. Hooray :)
    $("#" + id).val(value);

  };
  
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
  
  return {
    fetch: fetch,
    populateForm: populateForm,
    setVideo: setVideo,
    setSound: setSound, 
    setImage: setImage,
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