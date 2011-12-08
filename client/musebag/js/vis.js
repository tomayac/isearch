/* Modified main.js to go directly to visualisation */

//Just to be safe if a console.log() is not removed
if(typeof console == "undefined") {
  var console = {
    log: function () {},
    error: function () {}
  };
}

require(["jquery", 
         "mylibs/menu",
         "mylibs/config",
         "mylibs/tags",
         "mylibs/results",
         "mylibs/uiiface", 
         "libs/jquery.tokeninput",
         "libs/canvas-toBlob.min",
         "libs/smiley-slider"], 
    function($, menu, config, tags, results, uiiface) {
      
      $(function() {
        console.log('In the start function');
        $(document).ready(function(){
          
          console.log('In the start function');
          $(document).ready(function(){

            //Resizing of the menu on load and when window resizes

            var resizeTimer;
            
            $(window).resize(function() {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function() { menu.adjust(); }, 200);
            });

            //Initializes the settings panel
            config.initPanel();
            results.display(__queryParams.q);
          });
        }); //end document.ready()
      }); //end anonymous function     
    }
);


