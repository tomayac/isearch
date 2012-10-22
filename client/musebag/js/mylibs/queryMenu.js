define("mylibs/queryMenu",
  [
    "mylibs/config",
    "mylibs/profile",
    "mylibs/location",
    "mylibs/query",
    "mylibs/queryTools",
    "mylibs/recorder",
    "mylibs/jquery.uiiface",
    "mylibs/jquery.swipePanel",
    "libs/progress-polyfill.min"
  ],
  function(config, profile, location, query, queryTools) {
  
    var hasGetUserMedia = function hasGetUserMedia() {
      // Note: Opera builds are unprefixed.
      return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia || navigator.msGetUserMedia);
    };

    var hasNav = false;
    var slider = null;

    var menu = $('nav.query-composition');

    var reset = function() {
      hidePanels();
      $('nav li').removeClass('active');
    };

    var adjust = function() {
      //Fix canvas width and height in HTML
      //(it appears that CSS is not enough)
      //See http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#attr-canvas-width for more info
      fixCanvas();

      if(slider) {
        slider.adjustSize($("#query").width());
      }

      var menuWidth = config.constants.menuWidth;
      var overflow = menuWidth - document.width;
      //console.log('document.width: ' + document.width + '| menuWidth: ' + menuWidth);

      if (document.width < menuWidth) {
        // addControls();
        updateSlider( menu );
      } else {
        //removeControls();
        removeSlider( menu );
      }
      
      //adjust submit button 
      if($('#query').hasClass('resultView')) {
        var submitRight = $('#query').innerWidth() - $('#query ul.token-input-list-isearch').outerWidth();
        $('#query-submit').css('right',submitRight);
      } 
      
      //adjust result query composition menu
      if($('nav.resultView').length) {
        
        //Query composition area with modality panels
        var compLeft = $('ul.resultView').offset().left + 3;
        if($(window).width() > $('#container').outerWidth()) {
          compLeft -= (($(window).width() - $('#container').innerWidth()) / 2);
        }
        var cssObj = {
          'margin-left' : compLeft,
          'width' : $('#query ul.token-input-list-isearch').outerWidth() - 8
        };
        $('.query-composition').css(cssObj);
        $('.panel.resultView').css(cssObj);
        
        //adjust menu trigger button
        if($('.query-composition li.active').length) {
          $('#menuTrigger').css('top','0em');
        } else {
          $('#menuTrigger').css('top','0.6em');
        }
      }
    };

    var updateSlider = function( menu ){
      if( menu.data('swipePanel') ){
        menu.swipePanel('updateContainerSize');
      } else {
        menu.swipePanel({
          container: menu.find('ul'),
          children: '> ul > li'
        });
      }
    };

    var removeSlider = function( menu ){
      if( menu.data('swipePanel') ){
        menu.swipePanel('remove');
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

    var getRequestedMode = function($object) {
      //the requested "mode", i.e "audio", "image",...
      //is stored in the "data-mode" html5 attribute of the DOM element.
      return $object.attr('data-mode');
    };

    var showPanel = function(mode) {
      if(typeof mode === 'object') {
        mode = getRequestedMode(mode);
      }
      $('.' + mode).slideDown(config.constants.slideDownAnimationTime);
      attachEvents(mode);
    };

    var hidePanels = function() {
      $('.panel').slideUp(config.constants.slideUpAnimationTime);
    };
    
    var attachEvents = function(mode) {
      if (mode === undefined) {
        for (var name in handledEvents) {
          if (!handledEvents[name].isAttached) {
            attachEvents(name);
          }
        }
      } else if (!handledEvents[mode]) {
        console.log('No events handle for `'+mode+'`');
      } else if (!handledEvents[mode].isAttached) {
        handledEvents[mode]();
        handledEvents[mode].isAttached = true;
      }
    };

    // Collection of all available events
    var handledEvents = {

      query: function() {
        $('#query').uiiface({
          events : 'drop',
          callback : function(event){
            console.log(event);
            var e = event.originalEvent;
            var files = e.files || e.target.files || e.dataTransfer.files;
            var types = {};

            var getAllowedType = function (name) {
              for (var type in query.allowedTypes) {
                if (query.isAllowedExtension(files[i].name, type)) {
                  return type;
                }
              }
              return null;
            };

            for (var i=0; i<files.length; ++i) {
              var type = getAllowedType(files[i].name);
              if (type) {
                types[type] = types[type] || [];
                types[type].push(files[i]);
              }
            }

            for (var type in types) {
              query.addItems({files:types[type]}, type, function (fileInfo) {
                //do something?
              });
            }
          }
        });
      },

      text: function() {
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

          //Transfer the query to the main field via the query handler
          query.addItems(searchQuery,query.types.Text,function() {
            textIcon.removeClass('uploading');
            //Empty the text field of the panel
            textBox.val('');
          });

          reset();
        });
      },

      /**
       * Triantafillos: find real location with HTML5 geo-location API.
       */
      geolocation: function() {
        $('.panel.geolocation #getCurrentLocation').click(function(){
          console.log('Button geolocation pressed');

          var geoIcon = $('nav li[data-mode="geolocation"]');
          geoIcon.addClass('uploading');

          location.getCurrentLocation(function(position) {

            var data = {
              'image'        : 'img/fake/fake-geolocation.jpg', //if image if given, then it is used as replacement instead of showing the text value
              'text'         : position.coords.latitude + ' ' + position.coords.longitude,
              'data-subtype' : 'Location'
            };

            query.addItems(data,query.types.Text,function() {
              geoIcon.removeClass('uploading');
            });

            reset();
          });

        });

        $('.panel.geolocation #chooseLocation').click(function(){
          location.showMap(function(lat, lon){
            var data = {
                'image'   : 'img/fake/fake-geolocation.jpg', //if image if given, then it is used as replacement instead of showing the text value
                'text' : lat + ' ' + lon,
                'data-subtype' : 'Location'
              };
            query.addItems(data,query.types.Text);

            reset();
          });
        });
      },

      emotion: function() {

        // emotions slider initialization
        var div = document.getElementById("emotion-slider");
        slider = new SmileySlider(div);
        var first = true;
        // start with neutral emotions
        slider.position(0.5);
        var emotionIcon = $('nav li[data-mode="emotion"]');
        // get the smiley canvas
        var canvas = $("#emotion-slider canvas:first")[0];
        var emotionTimeout = null;
        slider.position(function(p) {
          emotionIcon.addClass('uploading');
          if (!first && p != 0.5) {
            if (emotionTimeout) {
              clearTimeout(emotionTimeout);
            }
            emotionTimeout = setTimeout(function() {

              var data = {
                'image'        : canvas.toDataURL("image/png"), //if image if given, then it is used as replacement instead of showing the text value
                'text'         : p,
                'data-subtype' : 'Emotion'
              };
              query.updateItem('emotion',data,query.types.Text);

            }, 200);
          }

          first = false;
          //Remove the "uploading style" | Note: this won't be visible, hopefully
          emotionIcon.removeClass('uploading');

          //reset();
        });
      },


      '3d': function() {

        //Drag and Drop of files
        var pictureIcon = $('nav li[data-mode="3d"]');

        $('#threedDrop').uiiface({
          events : 'drop',
          callback : function(event){
            pictureIcon.addClass('uploading');
            query.addItems(event.originalEvent,query.types.Threed,function(fileInfo) {
              pictureIcon.removeClass('uploading');
            });
            reset();
          }
        });

        //Invisible file input
        $('#threedUpload').change(function(event) {

          query.addItems(event,query.types.Threed,function(fileInfo) {
            pictureIcon.removeClass('uploading');
          });

          event.preventDefault();
          return false;
        });

        //Trigger button for file input
        $('.panel.3d button').click(function(){
          console.log('Button 3d pressed');
          pictureIcon.addClass('uploading');

          $('#threedUpload').click();

          reset();
        });
      },

      image: function() {

        //Drag and Drop of files
        //var handler = new filehandler.FileHandler('imageDrop',['jpg','png','gif'],config.constants.fileUploadServer,getQueryItemCount());
        var pictureIcon = $('nav li[data-mode="image"]');

        //Drop trigger for image upload
        $('#imageDrop').uiiface({
          events : 'drop',
          callback : function(event){
            pictureIcon.addClass('uploading');
            //add Items takes the following parameters: fileDrop event || canvas element id,
            //type of uploaded media, callback function when upload is complete
            query.addItems(event.originalEvent,query.types.Image,function(fileInfo) {
              pictureIcon.removeClass('uploading');
            });
            reset();
          }
        });

        //Invisible file input
        $('#imageUpload').change(function(event) {

          query.addItems(event,query.types.Image,function(fileInfo) {
            pictureIcon.removeClass('uploading');
          });
          event.preventDefault();
          return false;

        });

        //Trigger button for file input
        $('.panel.image button.upload').click(function(){

          pictureIcon.addClass('uploading');
          $('#imageUpload').click();

          reset();
        });

        addMediaCapture('image');
      },

      video: function() {

        //Drag and Drop of files
        var videoIcon = $('nav li[data-mode="video"]');

        //Drop trigger for video upload
        $('#videoDrop').uiiface({
          events : 'drop',
          callback : function(event){
            videoIcon.addClass('uploading');
            query.addItems(event.originalEvent,query.types.Video,function(fileInfo) {
              videoIcon.removeClass('uploading');
              //Try to get the keyframes after 45 seconds...
              //setTimeout(queryTools.setupVideoKeyframeSelector,45000);
            });
            reset();
          }
        });

        //Invisible file input
        $('#videoUpload').change(function(event) {

          query.addItems(event,query.types.Video,function(fileInfo) {
            videoIcon.removeClass('uploading');
            //Try to get the keyframes after 45 seconds...
            //setTimeout(queryTools.setupVideoKeyframeSelector,45000);
          });

          event.preventDefault();
          return false;
        });
        //Trigger button for file input
        $('.panel.video button.upload').click(function(){

          videoIcon.addClass('uploading');
          $('#videoUpload').click();

          //reset();
        });

        addMediaCapture('video');
      },

      sketch: function() {

        $('#sketch').uiiface('sketch');

        $('#sketch').uiiface({
          events : 'reset',
          callback : function(event){
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
          query.addItems('#sketch',query.types.Image,function(fileInfo) {
            sketchIcon.removeClass('uploading');
          });

          reset();
          //----

          event.preventDefault();
          return false;

        });
      },

      sound: function() {

        //Drag and Drop of files
        var pictureIcon = $('nav li[data-mode="sound"]');

        $('#soundDrop').uiiface({
          events : 'drop',
          callback : function(event){
            pictureIcon.addClass('uploading');
            query.addItems(event.originalEvent,query.types.Audio,function(fileInfo) {
              pictureIcon.removeClass('uploading');
            });
            reset();
          }
        });

        //Invisible file input
        $('#soundUpload').change(function(event) {

          query.addItems(event,query.types.Audio,function(fileInfo) {
            pictureIcon.removeClass('uploading');
          });

          event.preventDefault();
          return false;
        });

        //Trigger button for file input
        $('.panel.sound button.upload').click(function(){

          pictureIcon.addClass('uploading');

          $('#soundUpload').click();

          reset();
        });

        // sound recording
        $('.panel.sound button.record').click(function(){

          pictureIcon.addClass('uploading');

          Wami.setUploadCallback(function(data){
            var fileInfo = JSON.parse(data[0]);
            var id = query.addItems(fileInfo,query.types.Audio);
           
            
           	//set the appropriate data tags for the html element
      			var ele = $('#' + id) ;
      
      			ele.removeAttr("src") ;
      			ele.attr("data-subtype", "recording") ;
      			
      			for ( var i=0 ; i<fileInfo.path.length ; i++ )
      			{
      				var url = fileInfo.path[i].url ;
      				var mime = fileInfo.path[i].mime ;
      
      				$('<source/>', { src: url, type: mime }).appendTo(ele) ;
      			}
			
            pictureIcon.removeClass('uploading');
            reset();
          });         
		  
          if($(this).text() === "Start") {
            $(this).text("Stop") ;
            Wami.startRecording(config.constants.fileUploadServer);
          } else {
            Wami.stopRecording() ;
            $(this).text("Start") ;
          }
        });
      },

      rhythm: function() {

        //Drag and Drop of files
        var rhythmIcon = $('nav li[data-mode="rhythm"]');

        $('#rhythmDrop').uiiface({
          events : 'drop',
          callback : function(event){
            rhythmIcon.addClass('uploading');
            event.originalEvent.extra = {
              'subtype' : query.subtypes.Rhythm
            };
            query.addItems(event.originalEvent,query.types.Audio,function(fileInfo) {
              rhythmIcon.removeClass('uploading');
            });
            reset();
          }
        });

        //Invisible file input
        $('#rhythmUpload').change(function(event) {
          //Jonas: added extra meta data to the event object, as this
          //makes it easier to use the data also for the creation of the html token
          event.extra = {
            'subtype' : query.subtypes.Rhythm
          };
            
          query.addItems(event,query.types.Audio,function(fileInfo) {
            rhythmIcon.removeClass('uploading');
          });

          event.preventDefault();
          return false;
        });

        //Trigger button for file input
        $('.panel.rhythm button.upload').click(function(){

          rhythmIcon.addClass('uploading');

          $('#rhythmUpload').click();

          reset();
        });

       //Rhythm tapping initialization
       $('#rhythm-progress').attr({
         'value' : 0,
         'max'   : 10
       });
       $('#rhythm-canvas').attr({
         'width'  : 200,
         'height' : 20
       });

       // initial state
       var tapRhythm = {
         disabled : false,
         running  : false,
         start    : 0,
         timer    : false,
         scalef   : parseInt($('#rhythm-canvas').attr('width')) / parseInt($('#rhythm-progress').attr('max')),
         context  : $('#rhythm-canvas')[0].getContext('2d'),
         data     : {
           duration : 0,
           taps : [],
           intervals : []
         }
       };

       // draw scale function
       var drawScale = function() {
         tapRhythm.context.fillStyle = 'rgb(200,0,0)';
         tapRhythm.context.clearRect (0 , 0, parseInt($('#rhythm-canvas').attr('width')), parseInt($('#rhythm-canvas').attr('height')));
         var i = 0;
         var x = 0;
         tapRhythm.context.fillStyle = 'rgb(0,0,0)';
         while(x <= $('#rhythm-canvas').attr('width')) {
           x = tapRhythm.scalef * i;
           tapRhythm.context.fillRect (x, 18, 1, 2);
           i++;
         }
         tapRhythm.context.fillStyle = 'rgb(200,0,0)';
       };

       //initially draw the scale
       drawScale();

       $('.panel.rhythm #rhythm-div').dblclick(function() {
         return false; // no-op
       });

       $('.panel.rhythm #duration-spinner').on('change', function(e) {
         $('#rhythm-progress').attr('max', $(this).val());
         $('#rhythm-progress').attr('value', 0);
       });

       $('.panel.rhythm #rhythm-div').click(function() {
         // on rhythm div click
         if (tapRhythm.disabled) {
           return;
         }
         // if state is "not running"
         if (!tapRhythm.running) {
           // set state to "running"
           $(this).text('Tap');
           //Reset rhythm elements
           tapRhythm.running = true;
           $('#rhythm-progress').attr('value', 0);
           drawScale();
           $('#duration-spinner').attr('disabled','disabled');
           tapRhythm.start = new Date().getTime();
           tapRhythm.scalef = parseInt($('#rhythm-canvas').attr('width')) / parseInt($('#rhythm-progress').attr('max'));

           //set data duration
           tapRhythm.data.duration = parseInt($('#rhythm-progress').attr('max'));

           // set timer
           tapRhythm.timer = setInterval(function() {
             // calculate the elapsed time since the beginning of the timer
             var elapsed = Math.floor((new Date().getTime() - tapRhythm.start) / 1000);
             $('#elapsed-span').text(elapsed);
             $('#rhythm-progress').attr('value',elapsed);

             // if the timer has ended
             if (elapsed >= tapRhythm.data.duration) {
               // set state to "not running"
               clearInterval(tapRhythm.timer);
               tapRhythm.disabled = true;
               $(this).text('Finished');

               setTimeout(function() {
                 tapRhythm.disabled = false;
                 $('#rhythm-div').text('Start');
               }, 5000);

               $('#duration-spinner').attr('disabled','');
               tapRhythm.running = false;
               tapRhythm.start = 0;
               tapRhythm.timer = false;

               //Calculate relative intervals from taps
               var oldInterval = false;

               for(var i=1; i < tapRhythm.data.taps.length; i++) {
                 var interval = tapRhythm.data.taps[i] - tapRhythm.data.taps[i-1];
                 if(oldInterval) {
                   tapRhythm.data.intervals.push(interval / oldInterval);
                 }
                 oldInterval = interval;
               }

               console.log(tapRhythm.data);
               //Append rhythm to search bar
               var data = {
                 'image'        : $('#rhythm-canvas')[0].toDataURL("image/png"), //if image if given, then it is used as replacement instead of showing the text value
                 'text'         : tapRhythm.data.intervals.join(','),
                 'data-subtype' : 'Rhythm',
                 'data-duration': tapRhythm.data.duration
               };
               query.addItems(data,query.types.Text);
             }
           }, 1000);
         // if state is "running"
         } else {
           $(this).toggleClass('tapped');
           setTimeout(function() {
             $('#rhythm-div').toggleClass('tapped');
           }, 100);
           var heartBeat = (new Date().getTime() - tapRhythm.start) / 1000;
           tapRhythm.data.taps.push(heartBeat);
           var x = Math.floor(tapRhythm.scalef * heartBeat);
           tapRhythm.context.fillRect(x, 0, 1, parseInt($('#rhythm-canvas').attr('height')));
         }
       });

       // rhythm recording
       $('.panel.rhythm button.record').click(function() {

        rhythmIcon.addClass('uploading');

        if ($(this).text() === "Start") {
          $(this).text("Stop") ;
          Wami.startRecording(config.constants.fileUploadServer) ;
        } else {
          Wami.setUploadCallback(function(data){
          
            var fileInfo = JSON.parse(data[0]);
            var id = query.addItems(fileInfo,query.types.Audio);
                
                       
           	//set the appropriate data tags for the html element
      			var ele = $('#' + id) ;
      
      			ele.removeAttr("src") ;
      			ele.attr("data-subtype", "rhythm") ;
      			
      			for ( var i=0 ; i<fileInfo.path.length ; i++ )
      			{
      				var url = fileInfo.path[i].url ;
      				var mime = fileInfo.path[i].mime ;
      
      				$('<source/>', { src: url, type: mime }).appendTo(ele) ;
      			}
            
            reset();
          });

          Wami.stopRecording() ;
          $(this).text("Start") ;
        }
       });
      }
    };

    /*
     * addMediaCapture - test if media can be captured via HTML getUserMedia
     * and handles all capturing and streaming
     */
    var addMediaCapture = function(type) {

      var type = type || 'picture';
      var icon = $('nav li[data-mode="' + type + '"]');

      if (hasGetUserMedia()) {
        // Good to go!
        var localStream = { stop: function() {} };

        var videoHandle = function(){
          console.log('Button "Shoot ' + type + '" pressed');

          var video = $('.panel.' + type + ' .device video');
          var canvas = $('.panel.' + type + ' .device canvas');
          var button = $(this);

          var onFailSoHard = function(e) {
            console.log('Reeeejected!', e);
            alert('Sorry, can\'t access the camera.');
          };

          var captureSetup = function() {
            video.parent().show();

            //Abort/Show button handling
            button.text('Abort');

            button.off('click');
            button.one('click', function(event) {
              event.stopPropagation();
              localStream.stop();
              video.attr('src','');
              video.parent().find('button').hide();
              video.parent().hide();
              $(this).text('Show camera');

              button.on('click', videoHandle);
              return false;
            });

            //Canvas handling
            var ctx = canvas[0].getContext('2d');
            var drawCanvasHint = function(ctx) {
              ctx.fillStyle = '#333';
              ctx.strokeStyle = '#fff';
              ctx.font = 'bold 20px sans-serif';
              ctx.strokeText('Click or tap to take ' + type, 55, 30);
              ctx.fillText('Click or tap to take ' + type, 55, 30);
            };
            drawCanvasHint(ctx);

            var canvasClick = function(event) {
              if(type === 'image') {
                ctx.drawImage(video[0], 0, 0, 352, 288);
              } else if(type === 'video') {
                ctx.clearRect(0,0,canvas[0].width, canvas[0].height);
                //start sending the stream to the server
                console.dir(localStream);
                //localStream.videoTracks[0]
              }
              video.parent().find('button').show();
            };

            canvas.one('click', canvasClick);

            //Token and recapture handler
            var useBtn = video.parent().find('.use');
            var newBtn = video.parent().find('.new');

            useBtn.one('click', function(event) {
              if(type === 'image') {
                icon.addClass('uploading');

                //For images use the new query class
                query.addItems('#imageCapture',query.types.Image,function(fileInfo) {
                  icon.removeClass('uploading');
                });

              } else if(type === 'video') {
                //For we videos we now stop sending data to the server
                localStream.stop();
              }
              reset();
              handledEvents[mode].isAttached = true;
              icon.removeClass('uploading');

              ctx.clearRect(0,0,canvas[0].width, canvas[0].height);
              button.trigger('click');
            });

            newBtn.on('click', function(event) {
              video.parent().find('button').hide();
              ctx.clearRect(0,0,canvas[0].width, canvas[0].height);
              drawCanvasHint(ctx);
              canvas.one('click', canvasClick);
            });
          };

          var getUserMediaOptions = {
            audio: true,
            video : true,
            toString : function(){
              return "video,audio";
            }
          };
          //Opera
          if (navigator.getUserMedia) {
            navigator.getUserMedia(getUserMediaOptions, function(stream) {
              video.attr('src',stream);
              captureSetup();
            }, onFailSoHard);
          //Webkit
          } else if (navigator.webkitGetUserMedia) {
            //normalize window.URL
            window.URL ||
              (window.URL = window.webkitURL || window.msURL || window.oURL);

            //normalize navigator.getUserMedia
            navigator.getUserMedia ||
              (navigator.getUserMedia = navigator.webkitGetUserMedia ||
                                        navigator.mozGetUserMedia ||
                                        navigator.msGetUserMedia
              );
            navigator.webkitGetUserMedia(getUserMediaOptions, function(stream) {
              video.attr('src',window.webkitURL.createObjectURL(stream));
              localStream = stream;
              captureSetup();
            }, onFailSoHard);
          }

          event.preventDefault();
          return false;
        };

        $('.panel.' + type + ' button.shoot').click(videoHandle);
      } else {
        $('.panel.' + type + ' button.shoot').parent().remove();
        console.log('getUserMedia() is not supported in your browser');
      }
    };

    /*
     * Menu behaviour when the query is submitted
     */
    var collapse = function() {
      $("#queryUseCase").hide();
      $(".query-composition").hide();
      $("header h1").hide();
      /**
       * Triantafillos: hide panel in case it was open.
       */
      $(".panel").hide();
      /** Triantafillos: added top property so that the query form
       *  on top of visualization is not cropped by the settings bar.
       */
      $("#queryContainer").css("top", "3.8em");
       /** Jonas: added query options menu open/close button.
       */
      if($('#menuTrigger').length === 0) {
        $(".tags").before('<button id="menuTrigger">Open options</button>');

        $("#menuTrigger").click(function(e){
          if(!$(".query-composition").is(":visible")) {
            $(".query-composition").addClass('resultView');
            $('#menuTrigger').css({
              'margin' : '0 auto 0 49%',
              'top'    : '0.7em'
            });  
          } else {
            $('.panel').hide();
            $(".query-composition li").removeClass('active');
          }
          
          $('.panel').toggleClass('resultView');
           
          $(".query-composition").slideToggle(200,function(){
            if($(this).is(":visible")) {
              adjust();             
              $("#menuTrigger").text('Close options');
            } else {
              $('#menuTrigger').css({
               'margin' : '0 auto 1em 49%',
               'top'    : '0.8em' 
              });
              
              $("#menuTrigger").text('Open options');
              $(".query-composition").removeClass('resultView'); 
            }
          });
          
          e.preventDefault();
          return false;
        });
      }
      /**
       * Jonas: added search result i-search logo, which also deals as home button
       */
      if($('#queryLogo').length === 0) {
        $("#queryContainer").prepend('<div id="queryLogo"><a href="' + $('#queryUseCase li.enabled a').attr('href') + '" title="Restart I-SEARCH"><img src="img/logo-result.png"/></a></div>');
        $("#query").addClass('resultView');
        $("#query ul").addClass('resultView');
        $("#query-submit").addClass('resultView'); 
        //Adjust menu again, since we added the logo in front of the search bar
        setTimeout(adjust,300);   
      }
    };
    
    /*
     * Use case related query options
     */
    var setupQueryOptions = function() {
      
      var uc = config.getUrlUseCase();
      
      var setOptionVisibility = function(uc) {
    
        $('#queryUseCase li').removeClass();
        $('.query-composition li').show();
        
        switch(uc) {
          case 'music' : 
            $('#queryUseCase li:eq(1)').removeClass().addClass('enabled');
            $('.query-composition li[data-mode="video"]').hide();
            $('.query-composition li[data-mode="image"]').hide();
            $('.query-composition li[data-mode="sketch"]').hide();
            $('.query-composition li[data-mode="3d"]').hide();
            config.updateConfig('uc1');
            break;
          case 'furniture' :
            $('#queryUseCase li:eq(2)').removeClass().addClass('enabled');
            $('.query-composition li[data-mode="sound"]').hide();
            $('.query-composition li[data-mode="rhythm"]').hide();
            $('.query-composition li[data-mode="video"]').hide();
            $('.query-composition li[data-mode="emotion"]').hide();
            config.updateConfig('uc3');
            break;
          case 'video' :
            $('#queryUseCase li:eq(3)').removeClass().addClass('enabled');
            $('.query-composition li[data-mode="sound"]').hide();
            $('.query-composition li[data-mode="rhythm"]').hide();
            $('.query-composition li[data-mode="3d"]').hide();
            $('.query-composition li[data-mode="sketch"]').hide();
            $('.query-composition li[data-mode="emotion"]').hide();
            config.updateConfig('uc6');
            break;
          default :
            $('#queryUseCase li:eq(0)').removeClass().addClass('enabled');
            $('.query-composition li[data-mode="rhythm"]').hide();
            $('.query-composition li[data-mode="video"]').hide();
            $('.query-composition li[data-mode="emotion"]').hide();
            config.updateConfig('uc6');
            break;
        }
        
       	
      };

      //This is more or less a fallback so that the page does not need to be reloaded
      //as soon as a user switches to another use case
      
      // Sotiris: I comment this out for the moment. I believe page reloading is unavoidable and simpler to implement
      // also users may want to visit /music url directly
      // Jonas: I comment it back again, as I refactored the whole use case switch system, you can now:
      // 1. switch via url call in these ways:
      //    1. localhost/[useCase] where [useCase] can be: music,furniture,video or nothing
      //    2. localhost/uc[number].html where [number] can be: 1,3,6 or simply type localhost to get basic setup
      //    3. localhost/?uc=uc[number] where [number] can be: 1,3,6
      // 2. switch via the buttons without the need to reload, 
      //    but if you think it's better to always reload, you can comment this out again
      $('#queryUseCase a').on('click', function(e){
        
        var uc = config.getUrlUseCase($(this).attr('href')) ;
        
        setOptionVisibility(uc);
        
        switch(uc) {
          case 'music' :
            config.constants.queryOptions.useCase = 'uc1';
            break;
          case 'furniture' : 
            config.constants.queryOptions.useCase = 'uc3';
            break;
          default:
            config.constants.queryOptions.useCase = 'uc6';
            break;
        }
        
        profile.set('settings',{'useCase' : config.constants.queryOptions.useCase});
        
        e.stopPropagation();
        e.preventDefault();
        return false;
      });
      
      //go on
      setOptionVisibility(uc);
    };

    return {
      attachEvents: attachEvents,
      collapse: collapse,
      setupQueryOptions : setupQueryOptions,
      showPanel: showPanel,
      hidePanels: hidePanels,
      getRequestedMode: getRequestedMode,
      adjust: adjust,
      reset: reset
    };

  }
);
