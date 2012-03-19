define("mylibs/loader",  [],   function(){
	
	var create = function() {
		// adding a global loader animation for long processes
    	var loader = $('<div class="ui-loader" style="top: 313.5px; background-color: #444;"><span class="ui-icon-loading"></span><h1 id="loader-msg">loading</h1></div>').appendTo('#main') ;
    		  
    	loader.ajaxStart(function() {
    		$(this).show();
    	}).ajaxStop(function() {
    		$(this).hide();
    	}); 
		
	} ;
	
	var start = function(msg) {
		if ( msg ) 
			$('.ui-loader #loader-msg').text(msg) ;
			
		$('.ui-loader').show() ;
	
	} ;
	
	var stop = function() {
		$('.ui-loader #loader-msg').text("Loading") ;
		$('.ui-loader').hide() ;
	} ;
		
	return {
	  start: start,
	  stop: stop,
	  create: create
	};
  }
);
