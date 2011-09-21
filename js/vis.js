/* Modified main.js to go directly to visualisation */

//Namespace
var com;
if (!com) {
  com = {};
} else if (typeof com != "object") {
  throw new Error("com already exists and is not an object");
}
if (!com.isearch) {
  com.isearch = {}
} else if (typeof com.isearch != "object") {
  throw new Error("com.isearch already exists and is not an object");
}

//Just to be safe if a console.log() is not removed
if(typeof console == "undefined") {
  var console = {
    log: function () {},
    error: function () {}
  }
}

define("vis",
    ["mylibs/com.isearch.menu", "mylibs/com.isearch.config", 
    "mylibs/com.isearch.tags", "mylibs/com.isearch.results", 
    "libs/jquery.tokeninput"],
    function(menu, config, tags, results) {

    var start = function() {
      console.log('In the start function');
      $(document).ready(function(){

        //Resizing of the menu on load and when window resizes

        var resizeTimer;
        
        $(window).resize(function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() { menu.adjust() }, 200);
        });

        //Initializes the settings panel
        config.initPanel();

      
		results.display(__queryParams.q);

      });
    }
    
    //Public methods, returned at the end
    return {
      start: start
    }
  }
);



