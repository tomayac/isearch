define("mylibs/menu",
  ["mylibs/config", "mylibs/uiiface", "mylibs/filedrop"],
  function(config, uiiface, filedrop) {
    
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

    var attach3dEvents = function() {
      $('.panel.3d button').click(function(){
        console.log('Button 3d pressed');

        var pictureIcon = $('nav li[data-mode="3d"]');
        pictureIcon.addClass('uploading');

        //N.B: COMPLETELY FAKE!! 
        $("#query-field").tokenInput('add',{id:"3d",name:"<img src='img/fake/fake-3d.jpg'/>"});
        //Remove the "uploading style" | Note: this won't be visible, hopefully
        pictureIcon.removeClass('uploading');

        reset();
        attachedModes.push('3d');

      });
    };

    var attachPictureEvents = function() {
    	
    	//Drag and Drop of files
	    var dropHandler = new filedrop.FileDrop('imageDrop',['jpg','png','gif'],'http://isearch.ai.fh-erfurt.de/query/item');
	    
	    uiiface.registerEvent('imageDrop','drop',function(event) {
	    	$.proxy(dropHandler.handleFiles(event.originalEvent),dropHandler);
	    	$('#imageDrop').removeClass("over");
	    });
	    
	    $('#imageUpload').change(function(event) {
	    	
	    	var xhr    = new XMLHttpRequest();
	        formData   = new FormData();
			$.each(event.target.files, function(i, file){
				formData.append('file-' + i, file);
			});
			
			var success = function(event) {
				var fileInfo = JSON.parse(data);
				console.log("Image uploaded...");
				$("#query-field").tokenInput('add',{id:"cat",name:"<img src='" + fileInfo.path + "'/>"});
				//Remove the "uploading style" | Note: this won't be visible, hopefully
				$('.panel.picture button.upload').removeClass('uploading');
			};
			
			xhr.upload.addEventListener("load", success, false); 
			xhr.open("POST", "query/item", true);
			xhr.send(formData);

			event.preventDefault();
			return false; 
	    });
	    
	    $('.panel.picture button.upload').click(function(){
	    	$('.panel.picture button.upload').addClass('uploading');
	    	$('#imageUpload').click();
	    });
	    
      $('.panel.picture button.shoot').click(function(){
        console.log('Button "Shoot picture" pressed');

        var pictureIcon = $('nav li[data-mode="picture"]');
        pictureIcon.addClass('uploading');

        $("#query-field").tokenInput('add',{id:"cat",name:"<img src='img/fake/fake-picture.jpg'/>"});
        //Remove the "uploading style" | Note: this won't be visible, hopefully
        pictureIcon.removeClass('uploading');

        reset();
        attachedModes.push('picture');

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

        var sketchIcon = $('nav li[data-mode="sketch"]');
        sketchIcon.addClass('uploading');
        
        //----
        var xhr    = new XMLHttpRequest(),
            formData   = new FormData(),
            canvas = $('#sketch')[0];
        
        var imgData = canvas.toDataURL("image/png");
        imgData.replace(/^data:image\/(png|jpg);base64,/, "");
		formData.append('file', imgData);
		
		var success = function(event) {
			var fileInfo = JSON.parse(data);
			$("#query-field").tokenInput('add',{id:"cat",name:"<img src='" + fileInfo.path + "'/>"});
			//Remove the "uploading style" | Note: this won't be visible, hopefully
	        sketchIcon.removeClass('uploading');
		};
		
		xhr.upload.addEventListener("load", success, false); 
		xhr.open("POST", "query/item", true);
		xhr.send(formData);

		event.preventDefault();
		return false; 
		//----

        reset();
        attachedModes.push('sketch');

      });
    };
    
    var attachSoundEvents = function() {
      $('.panel.sound button').click(function(){
        console.log('Button in sound panel pressed');

        var pictureIcon = $('nav li[data-mode="sound"]');
        pictureIcon.addClass('uploading');

        //N.B: COMPLETELY FAKE!! 
        $("#query-field").tokenInput('add',{id:"sound",name:"<img src='img/fake/fake-sound.jpg'/>"});
        //Remove the "uploading style" | Note: this won't be visible, hopefully
        pictureIcon.removeClass('uploading');

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
