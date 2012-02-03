/* Author: Arnaud Brousseau, Jonas Etzold */

//Just to be safe if a console.log() is not removed
if(typeof console == "undefined") {
  var console = {
    log: function () {},
    error: function () {}
  };
}

 var Timeline_urlPrefix   = "js/libs/timeline_2.3.0/timeline_js/" ;
 var Timeline_parameters  = "bundle=false";
 var SimileAjax_urlPrefix = "js/libs/timeline_2.3.0/timeline_ajax/" ;

require(["jquery",
         "mylibs/menu",
         "mylibs/config",
         "mylibs/tags",
         "mylibs/results",
         "mylibs/uiiface",
         "mylibs/query",
         "mylibs/local",
         "libs/jquery.tokeninput",
         "libs/smiley-slider"], 
    function($, menu, config, tags, results, uiiface, query) {
      
      $(function() {
        
        console.log('In the start function');
        
        $(document).ready(function(){
          
          //Resizing of the menu on load and when window resizes
          menu.adjust();

          var resizeTimer;
          
          $(window).resize(function() {
              clearTimeout(resizeTimer);
              resizeTimer = setTimeout(function() {
                menu.adjust();
              }, 200);
          });
          
          //Initializes the settings panel
          config.initPanel();
          
          //Initializes the tagging system
          tags.init();

          //Initializes the UIIFace // GestureHint display on every screen element with enabled gestures
          uiiface.initialize({gestureHint:true});
          //test actions on logo
          //uiiface.registerEvent('logo','scale',function(event) {
          //  console.log(event);
          //});
          
          //Behaviour of the menu (panels, etc)
          $('nav li').click(function(){
            var clickedListItem = $(this);
            var isActive = clickedListItem.hasClass('active'); 
            menu.reset();
            if (!isActive) {
              var requestedMode = menu.getRequestedMode(clickedListItem);
              menu.hidePanels();
              menu.showPanel(requestedMode);
              clickedListItem.addClass('active');
            }
          });
          
          //Get tokens and load them as autosuggestion for the user
          var tokens = tags.getTokens();
          $("#query-field").tokenInput('init', tokens, {theme: "isearch", preventDuplicates:true});
          
          //Close button of the panel
          $('.panel footer a').click(function(){
            $('.panel').slideUp(200);
          });
		  
    		  // adding a global loader animation for long processes
    		  loader = $('<div class="ui-loader" style="top: 313.5px;"><span class="ui-icon-loading"></span><h1>loading</h1></div>').appendTo('#main') ;
    		  
    			loader.ajaxStart(function() {
    				$(this).show();
    			}).ajaxStop(function() {
    				$(this).hide();
    			}); 
    
          //hack to hardcode query parameters
      		if ( typeof (__queryParams) != 'undefined'  )
      		{
      			results.display('');
      		}
      		else
      		{	
    			  /**
      		   * Triantafillos:
      		   * Override the form submit event, so that in case the user
      		   * enters text and presses "Enter", then the query is not
      		   * submitted, only the text is tokenized, so the user can 
      		   * continue entering query tokens. The query will be
      		   * submitted only by clicking on the query-submit button.
      		   * Jonas:
      		   * Only prevent the submitting, if there is text input otherwise
      		   * just behave like any other search box
      		   */
      		  $('#query').live('submit', function(e) {
      		    e.preventDefault();
      		    
      		    var searchQuery = $(".token-input-list-isearch li input").val();
      		    
      		    //Tokenize text input
      		    if (searchQuery) {
      		      $("#query-field").tokenInput('add',{id:searchQuery,name:searchQuery});
      		    } else {
      		      $("#query-submit").trigger('click');
      		    }
      		    return false;  
      		  });
    		 
    				//Page behaviour when the query is submitted
    				$( "#query-submit").click(function (e) {
    		  
    					var resubmit = $(this).hasClass('resubmit') ;
    					if ( !resubmit ) $(this).addClass('resubmit') ;
    					
    					//prevent the page to reload
    					e.preventDefault() ;
    					
    					var relevant = []  ;
    					
    					if ( resubmit ) // gather user relevance feedback from the current document list
    					{
    						var docs = results.get() ;
    						for(var i=0 ; i<docs.docs.length ; i++ )
    						{
    							if ( docs.docs[i].relevant == true )
    							relevant.push(docs.docs[i].id) ;
    						}
    					}
    				  					
    					// Sotiris: submit takes callback function and a list of document id's that the user has marked as relevant
    					query.submit( relevant, 
    						function(result, data) 
    						{
    							if ( result ) 
    							{
    								//Collapses the menu
    								menu.collapse();
    		  
    								//Remove the tags
    								$(".tags").hide();
    								//Remove the autosuggestions
    								$(".token-input-dropdown-isearch").hide();
    		  
    								//Displays the results
    								results.display(data) ;
    							
    								//Dummy result display
    								//results.display('chair');
    							}
    							else {
    								alert('woops! No query!');
    							}
    						}
    					);
    				  
    					return false;
    				}); //end click query-submit button
      		} //end if query parameter	
        }); //end document.ready()
      }); //end anonymous function     
    } //end main module
); //end require



