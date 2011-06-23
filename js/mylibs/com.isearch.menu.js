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


com.isearch.menu.reset = function() {
    $('.panel').slideUp(com.isearch.config.slideUpAnimationTime);
    $('nav li').removeClass('active');
}

com.isearch.menu.adjust = function() {
  console.log('entered adjust function');
  var menuWidth = com.isearch.config.menuWidth;
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
  $('.' + mode).slideDown(com.isearch.config.slideDownAnimationTime);
  com.isearch.menu.attachEvents(mode);
}

com.isearch.menu.hidePanels = function() {
  $('.panel').slideUp(com.isearch.config.slideUpAnimationTime);
}

com.isearch.menu.attachEvents = function(mode) {
  if (mode === 'text') {
    com.isearch.menu.attachTextEvents();
  } else if (mode === 'geolocation') {
    com.isearch.menu.attachGeolocationEvents();
  } else if (mode === '3d') {
    com.isearch.menu.attach3dEvents();
  } else if (mode === 'picture') {
    com.isearch.menu.attachPictureEvents();
  } else if (mode === 'sound') { 
    com.isearch.menu.attachSoundEvents();
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
    
    var textBox = $('.panel.text input');
    var searchQuery = textBox.val();
    console.log('Search term is ' + searchQuery);
    
    //Transfer the query to the main field via tokenInput 
    $("#query-field").tokenInput('add',{id:searchQuery,name:searchQuery});
    //Remove the "uploading style" | Note: this won't be visible, hopefully
    textIcon.removeClass('uploading');
    //Empty the text field of the panel
    textBox.val('');
    
    com.isearch.menu.reset();
  });
}

com.isearch.menu.attachGeolocationEvents = function() {
  $('.panel.geolocation button').click(function(){
    console.log('Button geolocation pressed');
    
    var pictureIcon = $('nav li[data-mode="geolocation"]')
    pictureIcon.addClass('uploading');
    
    //N.B: COMPLETELY FAKE!! 
    $("#query-field").tokenInput('add',{id:"geo",name:"<img src='img/fake/fake-geolocation.jpg'/>"});
    //Remove the "uploading style" | Note: this won't be visible, hopefully
    pictureIcon.removeClass('uploading');
    
    com.isearch.menu.reset();

  });
}

com.isearch.menu.attach3dEvents = function() {
  $('.panel.3d button').click(function(){
    console.log('Button 3d pressed');
    
    var pictureIcon = $('nav li[data-mode="3d"]')
    pictureIcon.addClass('uploading');
    
    //N.B: COMPLETELY FAKE!! 
    $("#query-field").tokenInput('add',{id:"3d",name:"<img src='img/fake/fake-3d.jpg'/>"});
    //Remove the "uploading style" | Note: this won't be visible, hopefully
    pictureIcon.removeClass('uploading');
    
    com.isearch.menu.reset();

  });
}

com.isearch.menu.attachPictureEvents = function() {
  $('.panel.picture button.shoot').click(function(){
    console.log('Button "Shoot picture" pressed');
    
    var pictureIcon = $('nav li[data-mode="picture"]')
    pictureIcon.addClass('uploading');
    
    //N.B: COMPLETELY FAKE!! 
    $("#query-field").tokenInput('add',{id:"cat",name:"<img src='img/fake/fake-picture.jpg'/>"});
    //Remove the "uploading style" | Note: this won't be visible, hopefully
    pictureIcon.removeClass('uploading');
    
    com.isearch.menu.reset();

  });
}

com.isearch.menu.attachSoundEvents = function() {
  $('.panel.sound button').click(function(){
    console.log('Button in sound panel pressed');
    
    var pictureIcon = $('nav li[data-mode="sound"]')
    pictureIcon.addClass('uploading');
    
    //N.B: COMPLETELY FAKE!! 
    $("#query-field").tokenInput('add',{id:"sound",name:"<img src='img/fake/fake-sound.jpg'/>"});
    //Remove the "uploading style" | Note: this won't be visible, hopefully
    pictureIcon.removeClass('uploading');
    
    com.isearch.menu.reset();

  });
}

/*
 * Menu behaviour when the query is submitted
 */
com.isearch.menu.collapse = function() {
  $(".query-composition").hide();  
  $("header h1").hide();
  $(document.createElement('a'))
      .html('Restart from scratch')
      .attr('href','')
      .attr('id','restart')
      .insertAfter('#query');
}

com.isearch.menu.retrieveQuery = function() {
  return queryString = $("#query-field").val() ;
}
