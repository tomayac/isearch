/* Modified main.js to go directly to visualisation */

//Just to be safe if a console.log() is not removed
if(typeof console == "undefined") {
  var console = {
    log: function () {},
    error: function () {}
  };
}

//Initialize the authentication component
//----------------------------------------------------------
if (typeof window.janrain !== 'object') window.janrain = {};
window.janrain.settings = {};
janrain.settings.tokenUrl = 'http://localhost';
janrain.settings.tokenAction='event';
//----------------------------------------------------------

var Timeline_urlPrefix   = "js/libs/timeline_2.3.0/timeline_js/" ;
var Timeline_parameters  = "bundle=false";
var SimileAjax_urlPrefix = "js/libs/timeline_2.3.0/timeline_ajax/" ;

require(["jquery",
         "mylibs/config",
         "mylibs/results",
         "mylibs/query",
		 "mylibs/loader"
        ], 
    function($,  config, results, query, loader) {
      
      $(function() {
        
        console.log('In the start function');
        
        $(document).ready(function(){
          
                   
          //Initializes the settings panel
          config.initPanel();
          
                
          //Close button of the panel
          $('.panel footer a').click(function(){
            $('.panel').slideUp(200);
          });
		      	
          loader.create() ;
    
      	var mqfUrl = config.constants.queryFormulatorUrl || 'query' ;
	  
		if ( __queryParams.total ) mqfUrl += '&total=' + __queryParams.total ;
		if ( __queryParams.cls ) mqfUrl += '&cls=' + __queryParams.cls ;
		if ( __queryParams.tr ) mqfUrl += '&tr=' + __queryParams.tr ;
		if ( __queryParams.smatrix === true ) mqfUrl += '&smat=true' ;
		  
		
		if ( __queryParams.q )
			var query = { emotion: false, location: false, bluetooth: false, fileItems: [ {"Type":"Text","RealType":"Text","Name":"","Content":  __queryParams.q  }]} ;
		else if ( __queryParams.s )
			var query = { similarTo: __queryParams.s  } ;
				  
    	  $.ajax({
    	    type: "POST",
    	    crossDomain: true,
    	    url:  mqfUrl,
    	    contentType : "application/json; charset=utf-8",
    	    dataType : "json",
    	    data: JSON.stringify(query),
    	    success: function(data) {
    	     	results.display(data) ;
    	    },
    	    error: function(jqXHR, error, object) {
    	      data = {error: "the server gave me an invalid result."}; 
    	    },
    	    complete: function() {
    	      $.event.trigger( "ajaxStop" );
    	    }
    	  });
      
      	$('#restart').button() ;
    	
 	      		
        }); //end document.ready()
      }); //end anonymous function     
    } //end main module
); //end require
