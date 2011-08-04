/* Author: Arnaud */

$(document).ready(function(){
  
  /*===============================
    Load Data and populate the form
    ===============================*/
    
    cofetchHandler.populateForm();
  
  
  /*===================================
    Registering all the events handlers
    ===================================*/

  $("#change-image").click(function(){
    cofetchHandler.changeImage();
    return false;
  });
  
  $("#change-video").click(function(){
    cofetchHandler.changeVideo();
  });
  
  $("#change-sound").click(function(){
    cofetchHandler.changeSound();
  });
  
  $("#previous").click(function(){
    //Load the previous URL
    //i.e take the parameter, decrement it, and load the page
  });
  
  $("#next").click(function(){
    //load next
  });
  
  $("#save").click(function(){
    //save and go to next
  });
  
});























