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
if (com.isearch.menu) {
  throw new Error("com.isearch.menu already exists");
}
com.isearch.menu = {};
com.isearch.menu.hasNav = false;

//Config
var config = {};
config.SLIDE_UP_ANIMATION_TIME = 200;
config.SLIDE_DOWN_ANIMATION_TIME = 200;
config.MENU_WIDTH = 470; //cf ../../css/style.css for explanations

com.isearch.menu.reset = function() {
    $('.panel').slideUp(config.SLIDE_UP_ANIMATION_TIME);
    $('nav li').removeClass('active');
}

com.isearch.menu.adjust = function() {
  console.log('entered adjust function');
  var menuWidth = config.MENU_WIDTH;
  com.isearch.menu.overflow = menuWidth - document.width;
  //console.log('document.width: ' + document.width + '| menuWidth: ' + menuWidth);
  if (document.width < menuWidth) {
    com.isearch.menu.addControls();
  } else {
    com.isearch.menu.removeControls();
  }
}

com.isearch.menu.addControls = function() {
 //Add control buttons if they're not here
 if (com.isearch.menu.hasNav === false) {
      $('<a/>', {  
        id: 'navButtonLeft',  
        href: '#',  
      }).appendTo('nav').click(function(){ 
        com.isearch.menu.shift('right',20); 
      });
      $('<a/>', {  
        id: 'navButtonRight',  
        href: '#',  
      }).appendTo('nav').click(function(){ 
        com.isearch.menu.shift('left',20); 
      });
      com.isearch.menu.hasNav = true;
  } 
}

com.isearch.menu.removeControls = function() {
  if (com.isearch.menu.hasNav === true) {
    $('nav>a').remove();
    com.isearch.menu.hasNav = false;
  }  
}

com.isearch.menu.shift = function(direction, amount) {
  //Direction must be either 'left' or 'right'
  if (direction !== 'left' && direction !== 'right') {
    return;
  }
  if (direction === 'left') {
    //A shift-left of 20px is the same as a shift-right by -20px
    amount = -amount;
    direction = 'right';
  }
  console.log('will shift menu to ' + direction + ' from ' + amount + 'px'); 
  var originalMarginInPx = $('nav ul').css('margin-left');
  var originalMargin = parseInt(originalMarginInPx.substring(0,originalMarginInPx.length - 2)) //Drops the "px"

  console.log('margin is currently' + originalMargin);
  var newMargin = originalMargin + parseInt(amount);
  console.log('new margin: ' + newMargin);
  $('nav ul').css('margin-left', newMargin);
  /* TODO: Take into account margins, padding */
  // if ( !((originalMargin >= 0-amount && direction === 'right')
  //       || (originalMargin <= -com.isearch.menu.overflow + amount  && direction === 'right')) ) {
  //   var newMargin = originalMargin + amount;
  //   $('nav ul').css('margin-left', newMargin);
  // }
  
}

com.isearch.menu.getRequestedMode = function(jQueryObject) {
  //the requested "mode", i.e "audio", "picture",...
  //is stored in the "data-mode" html5 attribute of the DOM elt.
  return jQueryObject.attr('data-mode');
}

com.isearch.menu.showPanel = function(mode) {
  $('.' + mode).slideDown(config.SLIDE_DOWN_ANIMATION_TIME);
  com.isearch.menu.attachEvents(mode);
}

com.isearch.menu.hidePanels = function() {
  $('.panel').slideUp(config.SLIDE_UP_ANIMATION_TIME);
}

com.isearch.menu.attachEvents = function(mode) {
  if (mode === 'text') {
    com.isearch.menu.attachTextEvents();
  } else if (mode === 'geolocation') {
  } else if (mode === '3d') {
  } else if (mode === 'picture') {
  } else if (mode === 'sound') { 
  } else {
    console.warn('Couldn\'t attach the event for mode ' + mode);
    return;
  }
}

com.isearch.menu.attachTextEvents = function() {
  $('.panel.text input').click(function(){
    $(this).val('');
  });
  $('.panel.text button').click(function(){
    console.log('Text button clicked');
    
    var textIcon = $('nav li[data-mode="text"]')
    textIcon.addClass('uploading');

    var searchQuery = $('.panel.text input').val();
    console.log('Search term is ' + searchQuery);
    
    textIcon.removeClass('uploading').addClass('ready');
    com.isearch.menu.reset();

  });
}
