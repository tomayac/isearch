/* Author: Arnaud Brousseau */

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

define("main",
    ["mylibs/com.isearch.menu", "mylibs/com.isearch.config", 
    "mylibs/com.isearch.tags", "mylibs/com.isearch.results", 
    "libs/jquery.tokeninput"],
    function(menu, config, tags, results) {

    var start = function() {
      console.log('In the start function');
      $(document).ready(function(){

        //Resizing of the menu on load and when window resizes

        menu.adjust();

        var resizeTimer;
        
        $(window).resize(function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(menu.adjust(), 200);
        });

        //Initializes the settings panel
        config.initPanel();

        //Initializes the tagging system
        tags.init();

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

        // Behaviour of text field -- tokenizer
        $("#query-field").tokenInput([
                      {id: 7, name: "Enzo"},
                      {id: 11, name: "Ferrari"},
                      {id: 13, name: "Wonderful car"},
                      {id: 17, name: "Harley Davidson"},
                      {id: 19, name: "cars"},
                      {id: 23, name: "pleasure"},
                      {id: 29, name: "delight"},
                      {id: 31, name: "Italian"},
                      {id: 37, name: "red"},
                      {id: 41, name: "Absolute best"},
                      {id: "Cow", name: "Cow"},
                      {id: 47, name: "Nature"}
                  ], {theme: "isearch"});


        //Close button of the panel
        $('.panel footer a').click(function(){
          $('.panel').slideUp(200);
        });

        //Page behaviour when the query is submitted
        $( "#query-submit").click(function (e) {

          //prevent the page to reload
          e.preventDefault() ;
          
          var query = menu.retrieveQuery(); 
          console.log('searching for query ' + query);   
          if (query) { 
            //Collapses the menu
            menu.collapse();

            //Remove the tags
            $(".tags").hide();

            //Displays the results
            results.display(query);

          } else {
            alert('woops! No query!');
          }
          return false;
        });
      });
    }
    
    //Public methods, returned at the end
    return {
      start: start
    }
  }
);



