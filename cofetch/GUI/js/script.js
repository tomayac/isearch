/* Author: Arnaud */

$(document).ready(function(){
  
  /*===============================
    Load Data and populate the form
    ===============================*/
    
    var currentID = cofetchHandler.getParameterByName('id');
    if (currentID === "") {
      currentID = 1;
    };
    console.log(currentID);
    
    cofetchHandler.fetch(currentID);
    cofetchHandler.populateForm();
    
  /*===================================
    Registering all the events handlers
    ===================================*/

  $("#change-image").click(function(){
    cofetchHandler.setImage(true);
    return false;
  });
  
  $("#change-video").click(function(){
    cofetchHandler.setVideo(true);
    return false;
  });
  
  $("#change-sound").click(function(){
    cofetchHandler.setSound(true);
    return false;
  });
  
  $("#previous").click(function(){
    //Load the previous URL
    //i.e take the parameter, decrement it, and load the page
    var currentLocation = window.location;
    var newLocation = window.location.href.substring(0,window.location.href.indexOf("?"));
    newID = parseInt(currentID) - 1;
    newLocation += "?id=" + newID ;
    console.log(newLocation);
    window.location = newLocation;
    return false;
  });
  
  $("#next").click(function(){
    //load next
    var currentLocation = window.location;
    var newLocation = window.location.href.substring(0,window.location.href.indexOf("?"));
    newID = parseInt(currentID) + 1;
    newLocation += "?id=" + newID ;
    console.log(newLocation);
    window.location = newLocation;
    return false;
  });
  
  $("#save").click(function(){
    var jsonFile = cofetchHandler.save();
    console.log(jsonFile);
    return false;
    //post JSON to the correct handler server:8082/save/ID
  });
  
});























