/* Author: Arnaud */

var cofetchHandler = (function() {
  
  var contentObjectID;
  
  //Variable to hold the scraped data
  var scraperData = {};
  var videos = [];
  var sounds = [];
  var images = [];
  
  var fetch = function(id) {
    
    contentObjectID = id;
    //Request
    //and store data into scraperData
    
  };
  
  var populateForm = function() {
    //BIG function, to populate the form with the values
  };
  
  var save = function() {
    //Call server:8082/save/contentObjectID
  };
  
  return {
    fetch: fetch,
    populate: populate,
    post: post
  };
  
}());