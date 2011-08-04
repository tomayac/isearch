/* Author: Arnaud */

var cofetchHandler = (function() {
  
  var contentObjectID;
  
  //Variable to hold the scraped data
  var scraperData = {};
  var threed = {} //How do we populate this one?
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
      {id: "text-content", value: image.FreeText}
    ];
    set(changes);
    
    set3d();
    setVideo();
    setSound();
    setImage();
    
  };
  
  var set3d = function() {
    
    //Let's prepare the array of changes
    var video = videos[0];
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
    
    //Let's prepare the array of changes
    var video = videos[0];
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
    
    //Let's prepare the array of changes
    var sound = sounds[0];
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
    
    //Let's prepare the array of changes
    var image = images[0];
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
    //Call server:8082/save/contentObjectID
  };
  
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
    changeVideo: changeVideo,
    changeSound: changeSound, 
    changeImage: changeImage,
    save: save
  };
  
}());