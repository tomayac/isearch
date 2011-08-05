/* Author: Arnaud */

$(document).ready(function(){
  
  /*===============================
    Load Data and populate the form
    ===============================*/
    
    //cofetchHandler.populateForm();
  
  
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
    return false;
  });
  
  $("#next").click(function(){
    //load next
    return false;
  });
  
  $("#save").click(function(){
    var jsonFile = cofetchHandler.save();
    console.log(jsonFile);
    return false;
    //post JSON to the correct handler server:8082/save/ID
  });
  
});























