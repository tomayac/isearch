/**
 * @author Jonas
 */
define("mylibs/visualization/Cubes", 
  [ 
    "libs/jquery.hoverIntent.min",
    "order!js/mylibs/visualization/audio/dsp.js",
    "order!js/mylibs/visualization/audio/audio.js",
    "order!js/mylibs/visualization/audio/audioRenderer.js",
    "order!js/mylibs/visualization/ThumbContainer.js",
  ], 
  function(){
    //Private Cubes object declaration  
    Cubes = function( searchResults, containerDiv, options, ctx ) {
      //Create the internal settings and data object
      this.settings = {
        "ctx"       : ctx,
        "container" : containerDiv,
        "thumb"     : options.thumbOptions
      };
      this.data = {
        "results"   : searchResults,
        "cluster"   : searchResults.clusters
      };
      
      //Load the necessary CSS styles for displaying the cubes
      $("head script").before("<link>");
      var css = $("head script:first").prev();
      css.attr({
        rel:  "stylesheet",
        type: "text/css",
        href: "/css/cubes.css"
      });
      
      var that = this;
      //wait before initialising to prevent intermittent load error      
      setTimeout(function() {
        //Create the layout based on the items within the result set
        that.createLayout();
      },250);
    };
    
    //Define initial object attribute values
    Cubes.prototype.settings = {};
    Cubes.prototype.data     = {};
    Cubes.prototype.cubes    = [];
    
    //Define constants of the object
    Cubes.prototype.CUBE_NAV_TEMPLATE = '<nav>'
      + '<button class="btop" name="[[TSIDE]]"><img src="[[TIMG]]" alt="[[TALT]]" /></button>'
      + '<button class="bright" name="[[RSIDE]]"><img src="[[RIMG]]" alt="[[RALT]]" /></button>'
      + '<button class="bleft" name="[[LSIDE]]"><img src="[[LIMG]]" alt="[[LALT]]" /></button>'
      + '<button class="bbottom" name="[[BSIDE]]"><img src="[[BIMG]]" alt="[[BALT]]" /></button>'
      + '</nav>';
    
    Cubes.prototype.CUBE_TEMPLATE = '<article class="cube-container">' 
      + '<section class="cube-canvas">'
      + '<div class="cube" id="[[ID]]">'
      + '<figure class="front disabled">[[IMAGE]]</figure>'
      + '<figure class="back">[[OPTIONS]]</figure>'
      + '<figure class="right disabled">[[3D]]</figure>'
      + '<figure class="left disabled">[[VIDEO]]</figure>'
      + '<figure class="top disabled">[[AUDIO]]</figure>'
      + '<figure class="bottom disabled">[[TEXT]]</figure>'
      + '</div>'
      + '</section>'
      + '</article>';
    Cubes.prototype.FACES = ['show-front','show-back','show-right','show-left','show-top','show-bottom'];
    
    /**
     * createLayout function - main function for creating the view of the result cubes
     */
    Cubes.prototype.createLayout = function() {
      console.log('Create cubes layout...');
      
      //Setup display environment 
      $(this.settings.container).empty();
      var results = $('<div>', { 
        id: "cubes-result", 
        css: { 
          width: "100%", 
          position: "absolute", 
          top: 0, 
          height: $(this.settings.container).height() 
        }
      }).appendTo(this.settings.container);
      
      //Create cubes
      //this class uses a simplified version for creation
      for(var c=0 ; c<this.data.results.docs.length; c++)
      {
        var resultItem = this.data.results.docs[c];
        this.createCube(resultItem);
      }
      //register events associated with cubes
      this.setCubeEvents();
    };
    
    /**
     * createCube - creates a cube, based on a result item
     * 
     * @param resultItem 
     */
    Cubes.prototype.createCube = function(resultItem) {
      
      //Check if the resultItem is empty
      if(resultItem.media.length < 1) {
        return;
      }
      
      var tmpCube = this.CUBE_TEMPLATE;
      var itemMedia = {  
        "image" : {"count" : 0, "html" : ""},
        "threed": {"count" : 0, "html" : ""},
        "video" : {"count" : 0, "html" : ""},
        "audio" : {"count" : 0, "html" : ""},
        "text"  : {"count" : 0, "html" : ""}
      };
      
      //Create media specific HTML
      for(var m=0; m<resultItem.media.length; m++) {
        var media = resultItem.media[m];
        
        if(media.type === 'ImageType') {
          itemMedia.image.count += 1;
          itemMedia.image.html += '<img src="' + media.previews[0].url + '" alt="Image" />';
        } else if (media.type === 'Object3D') {
          itemMedia.threed.count += 1;
        } else if (media.type === 'VideoType') {
          itemMedia.video.count += 1;
        } else if (media.type === 'AudioType') {
          itemMedia.audio.count += 1;
        } else if (media.type === 'Text') {
          itemMedia.text.count += 1;
          itemMedia.text.html += '<p>' + media.text.substring(0,50) + '...</p>';
        }
      }
      
      //Fill cube template
      tmpCube = tmpCube.replace("[[ID]]", resultItem.id);
      tmpCube = tmpCube.replace("[[OPTIONS]]" , '<p><input type="text" name="addTag" value="add a tag" /><button name="Download">Download</button></p>');
      
      if(itemMedia.image.count > 0) {
        tmpCube = tmpCube.replace("[[IMAGE]]" , itemMedia.image.html);
        tmpCube = tmpCube.replace("front disabled" , "front");
      } else {
        tmpCube = tmpCube.replace("[[IMAGE]]" , '<p>Sorry, no images</p>');
      } 
      if(itemMedia.threed.count > 0) {
        tmpCube = tmpCube.replace("[[3D]]" , itemMedia.threed.html);
        tmpCube = tmpCube.replace("right disabled" , "right");
      } else {
        tmpCube = tmpCube.replace("[[3D]]" , '<p>Sorry, no 3D models</p>');
      } 
      if(itemMedia.video.count > 0) {
        tmpCube = tmpCube.replace("[[VIDEO]]" , itemMedia.video.html);
        tmpCube = tmpCube.replace("left disabled" , "left");
      } else {
        tmpCube = tmpCube.replace("[[VIDEO]]" , '<p>Sorry, no videos</p>');
      } 
      if(itemMedia.audio.count > 0) {
        tmpCube = tmpCube.replace("[[AUDIO]]" , itemMedia.audio.html);
        tmpCube = tmpCube.replace("top disabled" , "top");
      } else {
        tmpCube = tmpCube.replace("[[AUDIO]]" , '<p>Sorry, no audio</p>');
      } 
      if(itemMedia.text.count > 0) {
        tmpCube = tmpCube.replace("[[TEXT]]"  , itemMedia.text.html);
        tmpCube = tmpCube.replace("bottom disabled" , "bottom");
      } else {
        tmpCube = tmpCube.replace("[[TEXT]]" , '<p>Sorry, no text</p>');
      }      
      
      //Set initial navigation buttons
      tmpCube = tmpCube.replace('</section>','</section>' + this.getCubeNavigation('show-front'));
      
      $('#cubes-result').append(tmpCube);
      
      //Add initial visual cube data
      resultItem.face = "show-front";
      resultItem.big  = false; 
      
      this.cubes[resultItem.id] = resultItem;
    };
    
    /**
     * removeCube - removes a cube from the list based on the Content Object ID
     * 
     * @param id
     */
    Cubes.prototype.removeCube = function(id) {
      
    };
  
    /**
     * setupCubeEvents
     */
    Cubes.prototype.setCubeEvents = function() {
      var that = this;
      //Show nav buttons if mouse is over cube
      $('.cube-container').find('.cube').hoverIntent({    
        over: function() { 
          $(this).parents('.cube-container').find('nav').animate({'opacity': 1}, 200);
          $(this).parents('.cube-container').find('nav').css({
            'display': 'inline-block',
            'z-index': 5 
          });
          $(this).parents('.cube-container').find('button').css('display', 'block');
        },    
        timeout: 500,
        out: function() {}
      });
      $('.cube-container').hoverIntent({    
        over: function() {},    
        timeout: 200,
        out: function() { 
          $(this).find('nav').animate({'opacity': 0}, 200);
          $(this).parents('.cube-container').find('nav').css('display', 'none');
          $(this).parents('.cube-container').find('button').css('display', 'none');
        }
      });
      
      var navClick = function(event) {
        console.log('cubenav button clicked...');
        
        var cubeRef = $(this).parent().prev().find('.cube');
        var cube = that.cubes[cubeRef.attr('id')];
        var face = cube.face;
        var toFace = $(this).attr('name');
        
        if(cube.big === true) {
          var tmpface = cube.face.split('-');
          face = tmpface[0] + '-big' + tmpface[1];
          var toBigFace = toFace.split('-');
          toBigFace = toBigFace[0] + '-big' + toBigFace[1];
        }

        cubeRef.removeClass(face);
        cube.face = toFace;
        if(cube.big === true) {
          cubeRef.addClass(toBigFace);
        } else {
          cubeRef.addClass(toFace);
        }
        
        var nav = that.getCubeNavigation(cube.face);
        if(cube.big === true) {
          nav = nav.replace('btop','bigbtop')
                   .replace('bbottom','bigbbottom')
                   .replace('bright','bigbright')
                   .replace('bleft','bigbleft');
        }
        cubeRef.parents('.cube-container').children('nav').replaceWith(nav);
        
        setTimeout(function() {      
          $('.cube-container nav button').on('click', navClick);
          cubeRef.parents('.cube-container').find('nav').animate({'opacity': 1}, 200);
          cubeRef.parents('.cube-container').find('nav').css({
            'display': 'inline-block',
            'z-index': 5 
          });
          cubeRef.parents('.cube-container').find('button').css('display', 'block');
        },950);
      };
      
      $('.cube-container nav button').on('click', navClick);
      
      //Make big event
      $('.cube').on('dblclick', {context: this}, this.setCubeSize);
      
      return false;
    };
    
    /**
     * getCubeNavigation - Prepares the cube navigation buttons for the given side
     * 
     * @param side
     */
    Cubes.prototype.getCubeNavigation = function(side) {
      
      var cubeNav = this.CUBE_NAV_TEMPLATE;
      
      if(side === 'show-back' ||
         side === 'show-front' ||
         side === 'show-right' ||
         side === 'show-left') {
      
        cubeNav = cubeNav.replace("[[TSIDE]]", 'show-top')
                         .replace("[[TIMG]]" , 'img/ui-icon-media-audio.png')
                         .replace("[[TALT]]" , 'Go to audio items')
                         .replace("[[BSIDE]]", 'show-bottom')
                         .replace("[[BIMG]]" , 'img/ui-icon-media-text.png')
                         .replace("[[BALT]]" , 'Go to text items');    
      } 
      
      if(side === 'show-top' ||
         side === 'show-bottom') {
        
        cubeNav = cubeNav.replace("[[RSIDE]]", 'show-right')
                         .replace("[[RIMG]]" , 'img/ui-icon-media-3d.png')
                         .replace("[[RALT]]" , 'Go to 3D items')
                         .replace("[[LSIDE]]", 'show-left')
                         .replace("[[LIMG]]" , 'img/ui-icon-media-video.png')
                         .replace("[[LALT]]" , 'Go to video items');   
      } 
      
      if(side === 'show-front') {
         
        cubeNav = cubeNav.replace("[[RSIDE]]", 'show-right')
                         .replace("[[RIMG]]", 'img/ui-icon-media-3d.png')
                         .replace("[[RALT]]", 'Go to 3D items')
                         .replace("[[LSIDE]]", 'show-left')
                         .replace("[[LIMG]]", 'img/ui-icon-media-video.png')
                         .replace("[[LALT]]", 'Go to video items');  
      }
      
      if(side === 'show-back') {
        
        /*cubeNav = cubeNav.replace("[[TSIDE]]", 'show-bottom')
        .replace("[[TIMG]]" , 'img/ui-icon-media-text.png')
        .replace("[[TALT]]" , 'Go to text items')
        .replace("[[BSIDE]]", 'show-top')
        .replace("[[BIMG]]" , 'img/ui-icon-media-audio.png')
        .replace("[[BALT]]" , 'Go to audio items'); */
        cubeNav = cubeNav.replace("[[RSIDE]]", 'show-left')
                         .replace("[[RIMG]]" , 'img/ui-icon-media-video.png')
                         .replace("[[RALT]]" , 'Go to video items')
                         .replace("[[LSIDE]]", 'show-right')
                         .replace("[[LIMG]]" , 'img/ui-icon-media-3d.png')
                         .replace("[[LALT]]" , 'Go to 3D items');
        
      }
      
      if(side === 'show-right') {
        
        cubeNav = cubeNav.replace("[[RSIDE]]", 'show-back')
                         .replace("[[RIMG]]" , 'img/ui-icon-sortby-relevance.png')
                         .replace("[[RALT]]" , 'Go to options')
                         .replace("[[LSIDE]]", 'show-front')
                         .replace("[[LIMG]]" , 'img/ui-icon-media-image.png')
                         .replace("[[LALT]]" , 'Go to image items');  
      }
      
      if(side === 'show-left') {
        
        cubeNav = cubeNav.replace("[[RSIDE]]", 'show-front')
                         .replace("[[RIMG]]" , 'img/ui-icon-media-image.png')
                         .replace("[[RALT]]" , 'Go to image items')
                         .replace("[[LSIDE]]", 'show-back')
                         .replace("[[LIMG]]" , 'img/ui-icon-sortby-relevance.png')
                         .replace("[[LALT]]" , 'Go to options');
        
      }
      
      if(side === 'show-top') {
        cubeNav = cubeNav.replace("[[TSIDE]]", 'show-back')
                         .replace("[[TIMG]]", 'img/ui-icon-sortby-relevance.png')
                         .replace("[[TALT]]", 'Go to options')
                         .replace("[[BSIDE]]", 'show-front')
                         .replace("[[BIMG]]", 'img/ui-icon-media-image.png')
                         .replace("[[BALT]]", 'Go to image items');      
      }
      
      if(side === 'show-bottom') {
        cubeNav = cubeNav.replace("[[TSIDE]]", 'show-front')
                         .replace("[[TIMG]]", 'img/ui-icon-media-image.png')
                         .replace("[[TALT]]", 'Go to image items')
                         .replace("[[BSIDE]]", 'show-back')
                         .replace("[[BIMG]]", 'img/ui-icon-sortby-relevance.png')
                         .replace("[[BALT]]", 'Go to options'); 
      }
      
      return cubeNav;
    };
    
    /**
     * setCubeSize - Resizes the cube to either full view size or back to initial thumbnail size
     * @param event
     */
    Cubes.prototype.setCubeSize = function(event) {
      var cubeContainer = $(this).parents('.cube-container');
      var cube = event.data.context.cubes[$(this).attr('id')];
      
      if(cube.big === false) { 
        cube.big = true;
        
        cubeContainer.css({
          'width' : '+=100',
          'height': '+=100'
        });
        
        cubeContainer.find('.cube-canvas').css({
          'width' : '+=100',
          'height': '+=100'
        });
        
        cubeContainer.find('.cube figure').css({
          'width' : '+=100',
          'height': '+=100'
        });
        
        cubeContainer.find('.cube .back').removeClass('back').addClass('bigback');
        cubeContainer.find('.cube .left').removeClass('left').addClass('bigleft');
        cubeContainer.find('.cube .right').removeClass('right').addClass('bigright');
        cubeContainer.find('.cube .top').removeClass('top').addClass('bigtop');
        cubeContainer.find('.cube .bottom').removeClass('bottom').addClass('bigbottom');
        
        cubeContainer.find('.btop').removeClass('btop').addClass('bigbtop');
        cubeContainer.find('.bbottom').removeClass('bbottom').addClass('bigbbottom');
        cubeContainer.find('.bright').removeClass('bright').addClass('bigbright');
        cubeContainer.find('.bleft').removeClass('bleft').addClass('bigbleft');
        
      } else {
        cube.big = false;
        
        cubeContainer.css({
          'width' : '-=100',
          'height': '-=100'
        });
        
        cubeContainer.find('.cube-canvas').css({
          'width' : '-=100',
          'height': '-=100'
        });
        
        cubeContainer.find('.cube figure').css({
          'width' : '-=100',
          'height': '-=100'
        });
        
        cubeContainer.find('.cube .bigback').removeClass('bigback').addClass('back');
        cubeContainer.find('.cube .bigleft').removeClass('bigleft').addClass('left');
        cubeContainer.find('.cube .bigright').removeClass('bigright').addClass('left');
        cubeContainer.find('.cube .bigtop').removeClass('bigtop').addClass('top');
        cubeContainer.find('.cube .bigbottom').removeClass('bigbottom').addClass('bottom');
        
        cubeContainer.find('.bigbtop').removeClass('bigbtop').addClass('btop');
        cubeContainer.find('.bigbbottom').removeClass('bigbbottom').addClass('bbottom');
        cubeContainer.find('.bigbright').removeClass('bigbright').addClass('bright');
        cubeContainer.find('.bigbleft').removeClass('bigbleft').addClass('bleft');
      }
      
      
    };
    
    //Public interface for Cubes
    return {
      create: function(searchResults, containerDiv, options, ctx) {
            return new Cubes(searchResults, containerDiv, options, ctx);
        }
    };
  }
);