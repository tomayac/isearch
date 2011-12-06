define("mylibs/menu",
  ["mylibs/config", "mylibs/uiiface", "mylibs/filehandler"],
  function(config, uiiface, filehandler) {
    
    var hasNav = false;
    var attachedModes = []; //Stock the attached events 
                            //(we don't want to attach them each time a panel is displayed)
    var reset = function() {
        $('.panel').slideUp(config.constants.slideUpAnimationTime);
        $('nav li').removeClass('active');
    };

    var adjust = function() {
      console.log('entered adjust function');

      //Fix canvas width and height in HTML
      //(it appears that CSS is not enough)
      //See http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#attr-canvas-width for more info
      fixCanvas();

      var menuWidth = config.constants.menuWidth;
      var overflow = menuWidth - document.width;
      //console.log('document.width: ' + document.width + '| menuWidth: ' + menuWidth);
      if (document.width < menuWidth) {
        addControls();
      } else {
        removeControls();
      }
    };
    
    var getQueryItemCount = function() {
    	return $(".token-input-list-isearch li").size()-1;
    };

    var addControls = function() {
     //Add control buttons if they're not here
     if (hasNav === false) {
          $('<a/>', {  
            id: 'navButtonLeft',  
            href: '#'  
          }).appendTo('nav').click(function(){ 
            shift('right',20); 
          });
          $('<a/>', {  
            id: 'navButtonRight',  
            href: '#'  
          }).appendTo('nav').click(function(){ 
            shift('left',20); 
          });
          hasNav = true;
      } 
    };

    var removeControls = function() {
      if (hasNav === true) {
        $('nav>a').remove();
        hasNav = false;
      }  
    };

    var fixCanvas = function() {

      var formWidth = $("#query").width();
      var $canvas = $("#sketch"); 

      canvasComputedWidth = Math.floor(0.7 * formWidth);
      if (canvasComputedWidth < 400) {
        $canvas.attr('width',canvasComputedWidth);
        $canvas.attr('height',270);
      } else {
        $canvas.attr('width',400);
        $canvas.attr('height',270);
        console.log("width to 400 and height to 270");
      }
    };

    var shift = function(direction, amount) {
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
      var originalMargin = parseInt(originalMarginInPx.substring(0,originalMarginInPx.length - 2)); //Drops the "px"

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
    };

    var getRequestedMode = function(jQueryObject) {
      //the requested "mode", i.e "audio", "picture",...
      //is stored in the "data-mode" html5 attribute of the DOM elt.
      return jQueryObject.attr('data-mode');
    };

    var showPanel = function(mode) {
      $('.' + mode).slideDown(config.constants.slideDownAnimationTime);
      attachEvents(mode);
    };

    var hidePanels = function() {
      $('.panel').slideUp(config.constants.slideUpAnimationTime);
    };

    var attachEvents = function(mode) {

      if (mode === 'text' && !isAttached('text')) {
        attachTextEvents();
      } else if (mode === 'geolocation' && !isAttached('geolocation')) {
        attachGeolocationEvents();
      } else if (mode === '3d' && !isAttached('3d')) {
        attach3dEvents();
      } else if (mode === 'picture' && !isAttached('picture')) {
        attachPictureEvents();
      } else if (mode === 'video' && !isAttached('video')) {
        attachVideoEvents();
      } else if (mode === 'emotion' && !isAttached('emotion')) {
        attachEmotionEvents();        
      } else if (mode === 'sketch' && !isAttached('sketch')) {
        attachSketchEvents();
      } else if (mode === 'sound' && !isAttached('sound')) { 
        attachSoundEvents();
      } else {
        console.log('Didn\'t attach the event for mode ' + mode);
        return;
      }
    };

    var isAttached = function(mode) {
      //is a mode attached to the menu? (i.e events bound)
      if($.inArray(mode, attachedModes) === -1) {
        return false;
      }
      return true;
    };

    var attachTextEvents = function() {
      $('.panel.text input').click(function(){
        $(this).val('');
      });
      $('.panel.text button').click(function(){
        console.log('Text button clicked');

        var textIcon = $('nav li[data-mode="text"]');
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

        reset();
        attachedModes.push('text');
      });
    };

    var attachGeolocationEvents = function() {
      $('.panel.geolocation button').click(function(){
        console.log('Button geolocation pressed');

        var pictureIcon = $('nav li[data-mode="geolocation"]');
        pictureIcon.addClass('uploading');

        //N.B: COMPLETELY FAKE!! 
        $("#query-field").tokenInput('add',{id:"geo",name:"<img src='img/fake/fake-geolocation.jpg'/>"});
        //Remove the "uploading style" | Note: this won't be visible, hopefully
        pictureIcon.removeClass('uploading');

        reset();
        attachedModes.push('geolocation');

      });
    };
    
    var attachEmotionEvents = function() {
      
      // emotions slider initialization
      var div = document.getElementById("emotion-slider");
      var s = new SmileySlider(div);
      var first = true;
      // start with neutral emotions
      s.position(0.5);
      var emotionIcon = $('nav li[data-mode="emotion"]');
      // get the smiley canvas
      var canvas = $("#emotion-slider canvas:first")[0];
      
      s.position(function (p) {
        //console.log('Changed emotion to ' + p);
        emotionIcon.addClass('uploading');
        //N.B: NO FAKE!! 
        if (!first && p != 0.5) {
          $("#query-field").tokenInput("remove", {id: "emotion"});
          $("#query-field").tokenInput('add',{id:"emotion",name:'<img src="' + canvas.toDataURL("image/png") + '" title="' + p + '"/>'});
        }
        
        first = false;
        //Remove the "uploading style" | Note: this won't be visible, hopefully
        emotionIcon.removeClass('uploading');

        //reset();
        attachedModes.push('emotion');
        
      });                
    };
    

    var attach3dEvents = function() {
    
    	//Drag and Drop of files
	    var handler = new filehandler.FileHandler('threedDrop',['dae','3ds'],'query/item',getQueryItemCount());
	    var pictureIcon = $('nav li[data-mode="3d"]');
	    
	    uiiface.registerEvent('threedDrop','drop',function(event) {
	    	
	    	pictureIcon.addClass('uploading');
	    	
	    	$.proxy(handler.handleFiles(event.originalEvent),handler);
	    	$('#threedDrop').removeClass("over");
	    	
	    	reset();
	        attachedModes.push('3d');
	    });
	    
	    //Invisible file input
	    $('#threedUpload').change(function(event) {
	    	
	    	$.proxy(handler.handleFiles(event),handler);
	    	
			event.preventDefault();
			return false; 
	    });

	    //Trigger button for file input  
	    $('.panel.3d button').click(function(){
        console.log('Button 3d pressed');
        pictureIcon.addClass('uploading');

        $('#threedUpload').click();

        reset();
        attachedModes.push('3d');

      });
    };

    var attachPictureEvents = function() {
    	
    	//Drag and Drop of files
	    var handler = new filehandler.FileHandler('imageDrop',['jpg','png','gif'],'query/item',getQueryItemCount());
	    var pictureIcon = $('nav li[data-mode="picture"]');
	    
	    //Drop trigger for image upload
	    uiiface.registerEvent('imageDrop','drop',function(event) {
	    	
	    	pictureIcon.addClass('uploading');
	    	
	    	$.proxy(handler.handleFiles(event.originalEvent),handler);
	    	$('#imageDrop').removeClass("over");
	    	
	    	reset();
	      attachedModes.push('3d');
	    });
	    
	    //Invisible file input
	    $('#imageUpload').change(function(event) {
	    	
	    	$.proxy(handler.handleFiles(event),handler);
	    	event.preventDefault();
	    	return false; 
	    	
	    });
	    //Trigger button for file input
	    $('.panel.picture button.upload').click(function(){
	    	
	      pictureIcon.addClass('uploading');  
	    	$('#imageUpload').click();
	    	
	    	reset();
	      attachedModes.push('picture');
	    });
	    
      $('.panel.picture button.shoot').click(function(){
        console.log('Button "Shoot picture" pressed');

        pictureIcon.addClass('uploading');

        $("#query-field").tokenInput('add',{id:"cat",name:"<img src='img/fake/fake-picture.jpg'/>"});
        //Remove the "uploading style" | Note: this won't be visible, hopefully
        pictureIcon.removeClass('uploading');

        reset();
        attachedModes.push('picture');

      });
    };
    
    var attachVideoEvents = function() {
    	
    	//Drag and Drop of files
	    var handler = new filehandler.FileHandler('videoDrop',['webm','mp4', 'avi'],'query/item',getQueryItemCount());
	    var videoIcon = $('nav li[data-mode="video"]');
	    
	    //Drop trigger for video upload
	    uiiface.registerEvent('videoDrop','drop',function(event) {
	    	
	    	videoIcon.addClass('uploading');
	    	
	    	$.proxy(handler.handleFiles(event.originalEvent),handler);
	    	$('#videoDrop').removeClass("over");
	    	
	    	reset();
	      attachedModes.push('video');
	    });
	    
	    //Invisible file input
	    $('#videoUpload').change(function(event) {
	    	
	    	$.proxy(handler.handleFiles(event),handler);

	    	event.preventDefault();
	    	return false; 
	    });
	    //Trigger button for file input
	    $('.panel.video button.upload').click(function(){
	    	
	        videoIcon.addClass('uploading');
	        
	    	$('#videoUpload').click();
	    	
	    	reset();
	        attachedModes.push('video');
	    });
	    
      $('.panel.video button.shoot').click(function(){
        console.log('Button "Shoot video" pressed');

        videoIcon.addClass('uploading');

        $("#query-field").tokenInput('add',{id:"dog",name:"<img src='img/fake/fake-video.jpg'/>"});
        //Remove the "uploading style" | Note: this won't be visible, hopefully
        videoIcon.removeClass('uploading');

        reset();
        attachedModes.push('video');

      });
    };    
    
    var attachSketchEvents = function() {
    	
    	uiiface.registerEvent('sketch','sketch', function(event, pen) {
	    	//console.dir(pen);
	    	var canvas = $('#sketch')[0];
	      var context = canvas.getContext('2d');   
	
	    	context.strokeStyle ='rgba('+pen.color+',.3)';
	      context.lineWidth = pen.size; 
	      context.beginPath();
	      context.moveTo(pen.oldX, pen.oldY);
	      context.lineTo(pen.x, pen.y);
	      context.closePath();
	      context.stroke(); 
    	});
    	
    	uiiface.registerEvent('sketch','delete',function(error) {
	    	
	    	if(error <= 0.4) {
	    		console.log('delete gesture detected with error: ' + error);
	    		var canvas = $('#sketch')[0];
	    		var context = canvas.getContext('2d');  
	    		context.clearRect(0, 0, canvas.width, canvas.height);
	    	}
	    }); 


      $('.panel.sketch button.done').click(function(event){
    	  
        console.log('Button "sketch done" pressed');
        //We don't need to bind it to
        var handler = new filehandler.FileHandler('sketch',['png'],'query/item',getQueryItemCount());
        
        var sketchIcon = $('nav li[data-mode="sketch"]');
        sketchIcon.addClass('uploading');
        
        //----
        $.proxy(handler.handleCanvasData(),handler);
        
        reset();
        attachedModes.push('sketch');
        //----

        event.preventDefault();
        return false; 

      });
    };
    
    var attachSoundEvents = function() {
    	
    	//Drag and Drop of files
	    var handler = new filehandler.FileHandler('soundDrop',['oga','ogg','mp3','wav'],'query/item',getQueryItemCount());
	    var pictureIcon = $('nav li[data-mode="sound"]');
	    
	    uiiface.registerEvent('soundDrop','drop',function(event) {
	    	
	    	pictureIcon.addClass('uploading');
	    	
	    	$.proxy(handler.handleFiles(event.originalEvent),handler);
	    	$('#soundDrop').removeClass("over");
	    	
	    	reset();
	        attachedModes.push('sound');
	    });
	    
	    //Invisible file input
	    $('#soundUpload').change(function(event) {
	    	
	    	$.proxy(handler.handleFiles(event),handler);

			event.preventDefault();
			return false; 
	    });
	    
	    //Trigger button for file input
	    $('.panel.sound button.upload').click(function(){
	    	
	        pictureIcon.addClass('uploading');
	        
	    	$('#soundUpload').click();
	    	
	    	reset();
	        attachedModes.push('sound');
	    });
    	
    };

    /*
     * Menu behaviour when the query is submitted
     */
    var collapse = function() {
      $(".query-composition").hide();  
      $("header h1").hide();
      $(document.createElement('a'))
          .html('Restart from scratch')
          .attr('href','')
          .attr('id','restart')
          .insertAfter('#query');
    };

    var retrieveQuery = function() {
      
      //Retrieve the tokenized query
      var queryString = $("#query-field").val();
      //Check if the user has enter something which is not tokenized yet
      var remainingInput = $(".token-input-list-isearch li input").val();
      //Tokenize remaining input
      if (remainingInput) {
        $("#query-field").tokenInput('add',{id:remainingInput,name:remainingInput});
      }
      return queryString + remainingInput;
    };
    
    
    return {
      attachEvents: attachEvents,
      retrieveQuery: retrieveQuery,
      collapse: collapse, 
      showPanel: showPanel, 
      hidePanels: hidePanels,
      getRequestedMode: getRequestedMode,
      adjust: adjust, 
      reset: reset
    };
      
  }
);
