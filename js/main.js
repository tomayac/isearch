/* Author: Arnaud Brousseau */

$(document).ready(function(){
  
  //Resizing of the menu on load and when window resizes
  var iMenu = com.isearch.menu
  iMenu.adjust();
  
  $(window).resize(function(){
    iMenu.adjust();
  }); 
  
  //Initializes the settings panel
  com.isearch.config.initUI();
 
  //Initializes the tagging system
  com.isearch.tags.init();

  //Behaviour of the menu (panels, etc)
  $('nav li').click(function(){
    console.log('hop, li clicked');
    var clickedListItem = $(this);
    var isActive = clickedListItem.hasClass('active'); 
    iMenu.reset();
    if (!isActive) {
      var requestedMode = iMenu.getRequestedMode(clickedListItem);
      iMenu.hidePanels();
      iMenu.showPanel(requestedMode);
      clickedListItem.addClass('active');
    }
  });

  //Behaviour of text field -- tokenizer
  // $("#query-field").tokenInput([
  //               {id: 7, name: "Ruby"},
  //               {id: 11, name: "Python"},
  //               {id: 13, name: "JavaScript"},
  //               {id: 17, name: "ActionScript"},
  //               {id: 19, name: "Scheme"},
  //               {id: 23, name: "Lisp"},
  //               {id: 29, name: "C#"},
  //               {id: 31, name: "Fortran"},
  //               {id: 37, name: "Visual Basic"},
  //               {id: 41, name: "C"},
  //               {id: 43, name: "C++"},
  //               {id: 47, name: "Java"}
  //           ], {theme: "facebook"});


  //Close button of the panel
  $('.panel footer a').click(function(){
    $('.panel').slideUp(200);
  });

  //Page behaviour when the query is submitted
  $( "#query-submit").click(function (e) {
    
    //prevent the page to reload
    e.preventDefault() ;
   
    //Collapses the menu
    com.isearch.menu.collapse();

    var query = com.isearch.menu.retrieveQuery();
    if (query) {
      com.isearch.results.display(query);
    } else {
      alert('woops! No query!');
    }
    return false;
  });
});


