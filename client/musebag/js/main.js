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

          //hack to hardcode query parameters
      		if ( typeof (__queryParams) != 'undefined'  )
      		{
      			results.display();
      		}
      		else
      		{
		 
            //Page behaviour when the query is submitted
            $( "#query-submit").click(function (e) {
      
              //prevent the page to reload
              e.preventDefault() ;
              
              var result = query.submit();
              
              if (result) { 
                //Collapses the menu
                menu.collapse();
      
                //Remove the tags
                $(".tags").hide();
                //Remove the autosuggestions
                $(".token-input-dropdown-isearch").hide();
      
                //Displays the results
                console.log(result);
                //Dummy result display
                results.display('chair');
      
              } else {
                alert('woops! No query!');
              }
              
              return false;
            }); 
      		}
        }); //end document.ready()
      }); //end anonymous function     
    }
);



