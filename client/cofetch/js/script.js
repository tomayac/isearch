/* Author: Arnaud, Jonas */

$(document).ready(function(){
  
  /*===============================
    Initialize the script
    ===============================*/
	  $("#dialog").dialog({ autoOpen: false, modal: true, width: 800 });
	
    cofetchHandler.fetchCategories();
    
    //Init tabs
    $("#script-tabs").tabs({panelTemplate: '<section></section>'});
    //Init accordions
    $('.accordion').accordion({
      active: 0,
      autoHeight: false,
      collapsible: true
    });
    //Init autocomplete for keyword box
    $('#script-keywords,#search-text-phrase').autocomplete({
      source: function( request, response ) {
        $.ajax({
          url: "http://en.wikipedia.org/w/api.php",
          dataType: "jsonp",
          data: {
            action: "opensearch",
            format: "json",
            search: $('#script-keywords').val(),
            max: 10
          },
          success: function( data ) {
            response( $.map( data[1], function( item ) {
              return {
                label: item,
                value: item
              };
            }));
          }
        });
      },
      minLength: 2
    });
    
    /*if($("#script-automatic").attr("checked") !== undefined) {
    	$(".datatab").hide();
    }*/
    
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
    
    var resetSearchNav = function(type) {
      $("#search-" + type + "-prev").attr('disabled','disabled');
      $("#search-" + type + "-prev").attr('data-page',0);
      $("#search-" + type + "-next").attr('data-page',2);
    };
    
  /*===================================
    Registering all the events handlers
    ===================================*/
    
  $(".image-checkbox").click(function(){
    var idParts = $(this).attr('id').split('-');
    resetSearchNav(idParts[1]);
    if($(this).attr('data-value') == 0) {
      $(this).css('opacity',1.0);
      $(this).attr('data-value',1);
    } else {
      $(this).css('opacity',0.5);
      $(this).attr('data-value',0);
    }
    return false;
  });  
    
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
  	  cofetchHandler.resetForm();
  	  resetSearchNav('threed');
  	  resetSearchNav('image');
  	  resetSearchNav('audio');
  	  resetSearchNav('video');
  	  $('.datatab').show();
  		cofetchHandler.fetch($("#script-keywords").val(),$("#script-category").val(),$("#script-automatic").attr("checked"));
  	}
  	return false;
  });
  
  
  $(document).on('click','.search-nav-button',function(){
    
    var idparts = $(this).attr('id').split('-');
    
    var type  = idparts[1];
    var page  = parseInt($(this).attr('data-page'));
    var dir   = (idparts[2] === 'prev') ? -1 : 1;
    var func  = 'get';
        func += (type === 'threed') ? '3d' : (type.charAt(0).toUpperCase() + type.slice(1));

    var oppId = '#' + idparts[0] + '-' + idparts[1] + '-';
        oppId+= (idparts[2] === 'prev') ? 'next' : 'prev'; 
    
    var gps   = (type === 'threed') ? '0' : $('#search-' + type + '-gps').attr('data-value');
        
    var newpage = page + dir;
    cofetchHandler[func].apply(this, [$('#search-' + type + '-phrase').attr('data-last'), page, gps]);
    
    $('#search-' + type + '-loader').show('fast');
    
    $(this).attr('data-page',newpage);
    $(oppId).attr('data-page', page - dir);

    if(newpage <= 0 || newpage > 15) {
      $(this).attr('disabled','disabled');
    } else {
      $(this).removeAttr('disabled');
    }
    if($(oppId).attr('data-page') <= 0 || $(oppId).attr('data-page') > 15) {
      $(oppId).attr('disabled','disabled');
    } else {
      $(oppId).removeAttr('disabled');
    }
    return false;
  });
  
  $(document).on('click','#text-list li',function(){
    var index = parseInt($(this).attr('data-index'));
    cofetchHandler.setText(index);
    return false;
  });
  
  $("#search-text").click(function(){
    cofetchHandler.getText($("#search-text-phrase").val());
    $('#search-text-loader').show('fast');
    return false;
  });
  
  $(document).on('click','#threed-list li',function(){
    var index = parseInt($(this).attr('data-index'));
    cofetchHandler.set3d(index);
    return false;
  });
  
  $("#search-threed").click(function(){
    resetSearchNav('threed');
    $("#search-threed-phrase").attr('data-last',$("#search-threed-phrase").val());
    cofetchHandler.get3d($("#search-threed-phrase").val(),1);
    $('#search-threed-loader').show('fast');
    return false;
  });  
  
  $(document).on('click','#image-list li',function(){
    var index = parseInt($(this).attr('data-index'));
    cofetchHandler.setImage(index);
    return false;
  });
  
  $("#search-image").click(function(){
    resetSearchNav('image');
    $("#search-image-phrase").attr('data-last',$("#search-image-phrase").val());
    cofetchHandler.getImage($("#search-image-phrase").val(),1,$("#search-image-gps").attr('data-value'));
    $('#search-image-loader').show('fast');
    return false;
  });
  
  $(document).on('click','#video-list li',function(){
    var index = parseInt($(this).attr('data-index'));
    cofetchHandler.setVideo(index);
    return false;
  });
  
  $("#search-video").click(function(){
    resetSearchNav('video');
    $("#search-video-phrase").attr('data-last',$("#search-video-phrase").val());
    cofetchHandler.getVideo($("#search-video-phrase").val(),1,$("#search-video-gps").attr('data-value'));
    $('#search-video-loader').show('fast');
    return false;
  });
  
  $(document).on('click','#sound-list li',function(){
    var index = parseInt($(this).attr('data-index'));
    cofetchHandler.setSound(index);
    return false;
  });
  
  $("#search-sound").click(function(){
    resetSearchNav('sound');
    $("#search-sound-phrase").attr('data-last',$("#search-sound-phrase").val());
    cofetchHandler.getSound($("#search-sound-phrase").val(),1,$("#search-sound-gps").attr('data-value'));
    $('#search-sound-loader').show('fast');
    return false;
  });
  
  $("span.delete").click(function(){
    //Activate previous tab
    $(this).parent().prev().addClass('ui-tabs-selected ui-state-active');
    $(this).parent().show();
    //Activate previous tab content
    var newItemNameId = $(this).parent().prev().find('a').attr('href');
    $(newItemNameId).removeClass('ui-tabs-hide');
    
    //Hide actual tab
    $(this).parent().hide();
    $(this).parent().removeClass('ui-tabs-selected ui-state-active');
    //Reset actual tab content
    var itemNameId = $(this).prev().attr('href');
    $(itemNameId + '-name').val('');
    //Hide actual tab content 
    $(itemNameId).addClass('ui-tabs-hide');
  });
  
  $("#previous").click(function(){
    //Make all tabs visible again
    $(".datatab").show();
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
    //Make all tabs visible again
    $(".datatab").show();
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
    //Make all tabs visible again
    $(".datatab").show();
    //post JSON to the correct handler server
    cofetchHandler.save();
    
    return false;
  });
  
});























