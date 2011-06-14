/* Author: Arnaud Brousseau */

$(document).ready(function(){
  
  //Hide Url bar in iOS
  //MBP.hideUrlBar();  
  
  //Create the splash screen on iPad & iPhone
  //new MBP.splash();
  var iMenu = com.isearch.menu
  iMenu.adjust();

  $(window).resize(function(){
    iMenu.adjust();
  });

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

  $('.panel footer a').click(function(){
    $('.panel').slideUp(200);
  });

});


