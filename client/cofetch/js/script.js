/* Author: Arnaud, Jonas */

$(document).ready(function(){
  
  /*===============================
    Initialize the script
    ===============================*/
    
    cofetchHandler.fetchCategories();
    
    $( "#script-tabs" ).tabs({panelTemplate: '<section></section>'});
    
    if($("#script-automatic").attr("checked") !== undefined) {
    	$(".datatab").hide();
    }
    
    cofetchHandler.resetForm();
    
    if(!cofetchHandler.hasScraperData()) {
    	$("#save").attr('disabled', 'disabled');
    	$('#next').attr('disabled', 'disabled');
    	$('#previous').attr('disabled', 'disabled');
    } else {
    	$('#save').removeAttr('disabled');
    	$('#next').removeAttr('disabled');
    	$('#previous').removeAttr('disabled');
    }
    
  /*===================================
    Registering all the events handlers
    ===================================*/
  
  $("#script-automatic").change(function(event){
	  if(event.target.checked === true) {
		 $(".datatab").hide(); 
	  } else {
		 $(".datatab").show();
	  }
  });  
    
  $("#script-start").click(function(){
	if($("#script-keywords").val().length < 3 || $("#script-category").val() == "") {
		alert("Please specify at least one search keyword as well as the search category!");
	} else {
		cofetchHandler.fetch($("#script-keywords").val(),$("#script-category").val(),$("#script-automatic").attr("checked"));
	}
	return false;
  });
  
  $("#search-text").click(function(){
    cofetchHandler.getText($("#search-text-phrase").val());
    return false;
  });  
  
  $("#change-threed").click(function(){
	cofetchHandler.set3d(true);
	return false;
  });
  
  $("#search-threed").click(function(){
	cofetchHandler.get3d($("#search-threed-phrase").val());
	return false;
  });  
    
  $("#change-image").click(function(){
    cofetchHandler.setImage(true);
    return false;
  });
  
  $("#search-image").click(function(){
    cofetchHandler.getImage($("#search-image-phrase").val());
    return false;
  });
  
  $("#change-video").click(function(){
    cofetchHandler.setVideo(true);
    return false;
  });
  
  $("#search-video").click(function(){
    cofetchHandler.getVideo($("#search-video-phrase").val());
    return false;
  });
  
  $("#change-sound").click(function(){
    cofetchHandler.setSound(true);
    return false;
  });
  
  $("#search-sound").click(function(){
    cofetchHandler.getSound($("#search-sound-phrase").val());
    return false;
  });
  
  $("#previous").click(function(){
    //Load the previous co
	var prev = cofetchHandler.setPrevious();  
	if(prev === false || prev === 0) {
		$('#previous').attr('disabled', 'disabled');
		$('#next').removeAttr('disabled');
	} else {
		$('#next').removeAttr('disabled');
		$('#previous').removeAttr('disabled');
	}
    return false;
  });
  
  $("#next").click(function(){
    //load next co
	var next = cofetchHandler.setNext();  
	if(next === false || next === 0) {
		$('#next').attr('disabled', 'disabled');
		$('#previous').removeAttr('disabled');
	} else {
		$('#next').removeAttr('disabled');
		$('#previous').removeAttr('disabled');
	} 
    return false;
  });
  
  $("#save").click(function(e){
	
	e.preventDefault();  
	
	//post JSON to the correct handler server
    cofetchHandler.save();
    
    return false;
  });
  
});























