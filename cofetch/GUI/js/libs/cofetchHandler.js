/* Author: Arnaud */

var cofetchHandler = (function() {
  
  var contentObjectID;
  
  //Variable to hold the scraped data
  var scraperData = {};
  var threed = {}; //How do we populate this one?
  var videos = [];
  var sounds = [];
  var images = [];
  
  var fetch = function(id) {
    
    contentObjectID = id;
    //Request
    //and store data into scraperData
    
  };
  
  var populateForm = function() {
    var changes = [
      {id: "main-name", value: "here is the name"},
      {id: "main-categoryPath", value: "animal/fish"},
      {id: "main-screenshot", value: "3d"}, //defaut: 3d screenshot
      {id: "text-content", value: scraperData.FreeText}
    ];
    set(changes);
    
    set3d();
    setVideo();
    setSound();
    setImage();
    
  };
  
  var set3d = function() {
    
    //Set the preview image to the right SRC
    $('#threed-preview').attr(
      {'src': threed.Preview}
    );
    
    //Let's prepare the array of changes
    var changes = [
      {id: "threed-name", value: threed.Name},
      {id: "threed-tags", value: threed.Tags},
      {id: "threed-extension", value: threed.Extension},
      {id: "threed-license", value: threed.License},
      {id: "threed-licenseURL", value: threed.LicenseURL},
      {id: "threed-author", value: threed.Author},
      {id: "threed-date", value: threed.Date},
      {id: "threed-size", value: threed.Size},
      {id: "threed-url", value: threed.URL},
      {id: "threed-preview", value: threed.Preview},
      {id: "threed-emotions", value: threed.Emotions},
      {id: "threed-location", value: threed.Location},
      {id: "threed-weather-condition", value: threed.Weather.condition},
      {id: "threed-weather-wind", value: threed.Weather.wind},
      {id: "threed-weather-temperature", value: threed.Weather.temperature},
      {id: "threed-weather-humidity", value: threed.Weather.humidity},
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
    $('#video-previewFlickr').attr(
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
        setField(changes[i].id, changes[i].value)
      }
    }
  };
  
  var setField = function(id, value) {
    
    //jQuery is awesome. Whether it be a select, a multiple select or a simple text field, 
    //it handles it through this simple call. Hooray :)
    $("#" + id).val(value);

  };
  
  return {
    fetch: fetch,
    populateForm: populateForm,
    setVideo: setVideo,
    setSound: setSound, 
    setImage: setImage,
    save: save
  };
  
}());