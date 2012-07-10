/**
 *
 */
define("mylibs/filehandler", ["mylibs/loader", "libs/glge-compiled-min"], function(loader, GLGE){

	FileHandler = function(dataElementID,accept,serverURL,startCount) {
		this.dataContainer = document.getElementById(dataElementID) || false;
		this.accept = accept || [];
		this.serverURL = serverURL || 'query/item';
		this.count = startCount || 0;

		this.ModelHandler = function(model,canvas) {
			this.model  = model;
	    this.canvas = document.getElementById(canvas);
		};

		this.ModelHandler.prototype.initialize = function() {
	        //Scope magic
	        var that = this;
	        var GLGE = window.GLGE;
	        //Initialize the basic 3D scene with GLGE
	        var doc = new GLGE.Document();
	        doc.onLoad = function(){

	            //create the renderer
	            var gameRenderer = new GLGE.Renderer(that.canvas);
	            gameScene = new GLGE.Scene();
	            gameScene = doc.getElement("mainscene");
	            gameRenderer.setScene(gameScene);

	            var spin = new GLGE.AnimationVector();
	            spin = doc.getElement("spin");

	            var camera = new GLGE.Camera();
	            camera = doc.getElement("maincamera");

	            function addModel() {
	                var model = new GLGE.Collada();
	                model.setDocument(that.model);
	                model.setUseLights(true);
	                model.setLocX(0);
	                model.setLocY(0);
	                model.setLocZ(0);
	                model.setRot(0,0,Math.PI/2);
	                model.setScale(0.085);
	                model.setAnimation(spin);

	                gameScene.addCollada(model);

	                camera.setLookat(model);
	            }

	            function render(){
	                gameRenderer.render();
	            }

	            addModel();
	            setInterval(render,10);
	        };

	        doc.load("js/mylibs/scene.xml");
		};
	};

	FileHandler.prototype.isAllowedExtension = function(fileName)
	{
        var ext = (-1 !== fileName.indexOf('.')) ? fileName.replace(/.*[.]/, '').toLowerCase() : '';
        var allowed = this.accept;

        if (!allowed.length){return true;}

        for (var i=0; i<allowed.length; i++){
            if (allowed[i].toLowerCase() == ext){ return true;}
        }

        return false;
    };

	//Function for calculate the progress of the upload progress bar
	FileHandler.prototype.uploadProgressXHR = function(event) {
	    if (event.lengthComputable) {
	        var percentage = Math.round((event.loaded * 100) / event.total);
	        if (percentage <= 100) {
	            event.target.log.lastChild.firstChild.style.width = (percentage*2) + "px";
	            event.target.log.lastChild.firstChild.textContent = percentage + "%";
	        }
	    }
	};

	//Logging notification function, fires if upload complete
	FileHandler.prototype.loadedXHR = function(event) {
	    var currentItem = event.target.log;
	    currentItem.className += " loaded";
	    console.log("xhr upload of "+event.target.log.id+" complete");
	};

	//Logging notification function, fires if there was an error during upload
	FileHandler.prototype.uploadError = function(error) {
	    console.log("error: " + error);
	};

	//Handles the file upload with
	FileHandler.prototype.processXHR = function(file, id) {
	    var xhr        = new XMLHttpRequest(),
	        formData   = new FormData(),
	        container  = document.getElementById(id),
	        progressDomElements = [
	            document.createElement('div'),
	            document.createElement('p')
	        ];

	    var that = this;

	    progressDomElements[0].className = "progressBar";
	    progressDomElements[1].textContent = "0%";
	    progressDomElements[0].appendChild(progressDomElements[1]);

	    container.appendChild(progressDomElements[0]);

	    //Handle file display after upload of a media file
	    xhr.onreadystatechange =  function (event) {
	        if (xhr.readyState == 4) {

            var fileInfo = {};
            var pictureIcon = {};
            var genericItemType = 'Text';

            try {
              fileInfo = JSON.parse(xhr.responseText);
            } catch(e) {
              fileInfo.error = 'Error while parsing result JSON for file upload.';
            }
            if(fileInfo.error) {
              alert('Woops...somehow your query input got lost through an error in space. You can try it again or report this error to my creators: \n' + fileInfo.error);
              return;
            }

            //3D model display via GLGE
            if((/dae/i).test(fileInfo.name) && !fileInfo.preview) {
            	console.log("3D uploaded...");
            	pictureIcon = $('nav li[data-mode="3d"]');
            	genericItemType = 'Object3D';

            	var modelHandler = new that.ModelHandler(fileInfo.originPath,id);
            	modelHandler.initialize();

            	var ele = $('#' + id) ;

	            //set the appropriate data tags for the html element
	            ele.attr({
      					'alt'       : fileInfo.name,
      					'class'     : fileInfo.subtype,
      					'src'		: fileInfo.path,
      					'data-token': fileInfo.token,
      					'data-mode' : "Object3D"
      				});

            } else {

              if ( fileInfo.preview ) {

                if (fileInfo.subtype != '') {
    						  console.log(fileInfo.subtype + " uploaded...");
    						  pictureIcon = $('nav li[data-mode="' + fileInfo.subtype + '"]');
    						  genericItemType = fileInfo.type ;
    						  var ele = $('#' + id) ;

    						  //set the appropriate data tags for the html element
    						  ele.attr({
    							  'alt'       : fileInfo.name,
    							  'class'     : fileInfo.subtype,
    							  'data-mode' : genericItemType,
								  'data-token': fileInfo.token
    						  });

    						  var canvas = ele.get(0) ;
    						  var context = canvas.getContext('2d');

    						  if (context) {
    							  var img = new Image ;
    							  img.onload = function() {
    								  var dstw2 = canvas.width ;
    								  var dsth2 = canvas.height;

    								  var origw = img.width ;
    								  var origh = img.height ;

    								  var ratioW = origw/dstw2 ;
    								  var ratioH = origh/dsth2 ;

    								  var thumbw, thumbh, offx, offy ;

    								  if ( ratioW > ratioH )
    								  {
    									  thumbw = dstw2 ;
    									  thumbh = dstw2*(origh/origw);
    								  }
    								  else
    								  {
    									  thumbh = dsth2 ;
    									  thumbw = dsth2*(origw/origh);
    								  }

    								  offx = (dstw2 - thumbw)/2 ;
    								  offy = (dsth2 - thumbh)/2 ;

    								  context.drawImage(img, offx, offy, thumbw, thumbh) ;
    							  };
    							  img.src = fileInfo.preview ;
  					      }
  				      }
              }
      				else
      				{
      				  //Image display in query field
      					if((/image/i).test(fileInfo.type)) {
      						if(fileInfo.subtype != '') {
      							console.log(fileInfo.subtype + " uploaded...");
      							pictureIcon = $('nav li[data-mode="' + fileInfo.subtype + '"]');
      						} else {
      							console.log("Image uploaded...");
      							pictureIcon = $('nav li[data-mode="picture"]');
      						}
      						genericItemType = 'ImageType';
      					}

      					//Sound display in query field
      					if((/audio/i).test(fileInfo.type)) {
      						console.log("Audio uploaded...");
      						pictureIcon = $('nav li[data-mode="sound"]');
							if ( !pictureIcon.hasClass("uploading") )
								pictureIcon = $('nav li[data-mode="rhythm"]');
      						genericItemType = 'SoundType';
      					}

      					//Video display in query field
      					if((/video/i).test(fileInfo.type)) {
      						console.log("Video uploaded...");
      						pictureIcon = $('nav li[data-mode="video"]');
      						genericItemType = 'VideoType';
                  setupVideoKeyframeSelector();
      					}

      					var ele = $('#' + id) ;

      					//set the appropriate data tags for the html element
      					ele.attr({
      						'alt'       : fileInfo.name,
      						'class'     : fileInfo.subtype,
      						'data-mode' : genericItemType
      					});

        				// Sotiris: special handling for multiple audio formats
        				// The path element may contain multiple objects pointing to files in different formats
        				// Also a token attribute is returned to allow for reusing temporary files on the server during the query
        				if ( !$.isArray(fileInfo.path) )
        				{
        					ele.attr({'src': fileInfo.path, 'data-token': fileInfo.token}) ;
        				}
        				else
        				{
        					ele.empty().removeAttr('src').attr({'preload':'auto', 'data-token':fileInfo.token }) ;

        					for ( var i=0 ; i<fileInfo.path.length ; i++ )
        					{
        						var url = fileInfo.path[i].url ;
        						var mime = fileInfo.path[i].mime ;

        						$('<source/>', { src: url, type: mime }).appendTo(ele) ;
        					}
        				}
              } // end if fileInfo.preview
	          } // end if 3D model dae

	          $(pictureIcon).removeClass('uploading');

			  loader.stop() ;


	        } //End readystate if
	    };

	    xhr.upload.log = container;
	    xhr.upload.curLoad = 0;
	    xhr.upload.prevLoad = 0;
	    xhr.upload.addEventListener("progress", this.uploadProgressXHR, false);
	    xhr.upload.addEventListener("load", this.loadedXHR, false);
	    xhr.upload.addEventListener("error", this.uploadError, false);
      if(!file.base64) {
        formData.append('files', file);
      } else {
        formData.append('canvas', file.base64);
        formData.append('name', file.name);
        formData.append('subtype', file.subtype || '');
      }
	    xhr.open("POST", this.serverURL, true);

	  loader.start("Uploading") ;

	  xhr.send(formData);

    function setupVideoKeyframeSelector () {
      var $videoKeyframes = $('#videoKeyframes');
      /*HACK: this is just a temporary hack to develop the UI for
       * the video upload.
       */
      $.ajax({
        type: 'GET',
        url: 'dummy_video_response.xml',
        dataType: 'xml',
        success: function(xml){
          console.log('Loaded dummy xml file');
          var $root = $(xml).children().eq(0);
          var imageData = [];
          $root
            .children()
            .each(function(){
              var $self = $(this).children().eq(0);
              var getAttr = function(attr){
                return $self.attr(attr);
              };
              imageData.push({
                uri: getAttr('uri'),
                score: parseInt(getAttr('score')),
                width: parseInt(getAttr('xMax') - getAttr('xMin')),
                height: parseInt(getAttr('yMax') - getAttr('yMin'))
              });
            });
          var $containers = $();
          var maxWidth = 80;
          var maxHeight = 80;
          for(var i in imageData){
            var $keyframeContainer = $(document.createElement('span'));
            //var width = Math.min(imageData[i].width, maxWidth);
            //var height = Math.min(imageData[i].height, maxHeight);
            $keyframeContainer
              .attr({
                score: imageData[i].score,
                uri: imageData[i].uri,
                imageWidth: imageData[i].width,
                imageHeight: imageData[i].height
              })
              .css({
                position: 'relative',
                display: 'inline-block',
                border: '1px solid #ccc',
                background: "#fff url('"+imageData[i].uri+"') no-repeat",
                backgroundSize: 'cover',
                width: maxWidth+'px',
                height: maxHeight+'px',
                margin: '2px',
                padding: '2px'
              })
              .bind('click.zoom', function(){
                if (!$videoKeyframes.data('swipePanel').components.swiped) {
                  visualWordZoom.call(this, event);
                }
              });
            $containers = $containers.add($keyframeContainer);
          }
          $containers.attr('class', 'keyframeContainer');
          $videoKeyframes
            .show()
            .html($containers)
            .swipePanel('remove')
            .swipePanel({
              scroll: 40
            })
            .bind('swipePanel-move', function(event){
              //TODO: actually preload nearby images
            });
        }
      });

      var visualWordZoom = (function(){
        var $lastZoom = null;

        $(document).bind('click.hideZoom', function(event){
          if ($lastZoom) {
            var $callTree = $(event.target).parents().add($(event.target));
            if ($callTree.filter($lastZoom).length == 0
                && $callTree.filter('.visualWordZoom').length == 0){
              hideZoom($lastZoom);
            }
          }
        });

        return function visualWordZoom (event) {
          $(this).addClass('visualWordZoom');
          var container = $(document.createElement('div'));
          var width = $(this).width();
          var height = $(this).height();
          var src = $(this).attr('uri');
          var offset = $(this).offset();
          container
            .appendTo($('body'))
            .css({
              position: 'absolute',
              zIndex: 100000,
              left: offset.left,
              top: offset.top,
              border: '1px solid #bbb',
              background: 'rgba(0, 0, 0, 0.8)',
              width: width,
              height: height,
              opacity: 0.1
            })
            .animate({
              left: offset.left - ($(this).attr('imageWidth') - width) / 2,
              top: offset.top - ($(this).attr('imageHeight') - height) / 2,
              width: $(this).attr('imageWidth'),
              height: $(this).attr('imageHeight'),
              opacity: 1
            }, 500, function(){
              var image = $(document.createElement('img'));
              image
                .attr('src', src)
                .appendTo(container)
                .hide()
                .fadeIn(400);
            });
            hideZoom($lastZoom);
            $lastZoom = container;
            $videoKeyframes.swipePanel('pause');
        };

        function hideZoom (){
          $videoKeyframes.swipePanel('unpause');
          if ($lastZoom && $lastZoom.jquery) {
            var offset = $lastZoom.offset();
            $lastZoom.find('img').remove();
            $lastZoom
              .stop()
              .animate({
                left: offset.left + $lastZoom.width() / 2 - 1,
                top: offset.top + $lastZoom.height() / 2 - 1,
                width: 2,
                height: 2,
                opacity: 0
              }, 300, function(){
                $(this).remove();
              });
          }
        }
      })();
    }

	};

	//Drop event handler for image component
	FileHandler.prototype.handleFiles = function(event) {

		var files = event.files || event.target.files || event.dataTransfer.files;
		//Stop event from being executed in the normal way if necessary
		if(event.stopPropagation) {
		  event.stopPropagation();
		}
		if(event.preventDefault) {
		  event.preventDefault();
		}
    //Test if browser supports the File API
    if (typeof files !== "undefined") {

        for (var i=0, l=files.length; i<l; i++) {

        	//State if current file is allowed to be uploaded
        	if(this.isAllowedExtension(files[i].name)) {

        		//Create the token for the search bar
        		var id = "fileQueryItem" + this.count;
        		var token = "";
        		var supportDirectData = true;

        		//Create token content dependend from the media input
						console.log(files[i].type);
        		if((/image/i).test(files[i].type)) {
        			token = '<img id="' + id + '" alt="" src="" />';

        		} else if((/audio/i).test(files[i].type) || (/ogg/i).test(files[i].name)) {
        			token = '<audio controls="controls" id="' + id + '" >No audio preview.</audio>';
        		} else if((/video/i).test(files[i].type)) {
	        		token = '<video src="" controls="controls" id="' + id + '" width="60" height="25">No video preview.</video>';
        		} else if((/dae/i).test(files[i].name) || (/3ds/i).test(files[i].name) || (/md2/i).test(files[i].name) || (/obj/i).test(files[i].name)) {
        			token = '<canvas id="' + id + '" width="60" height="25"></canvas>';
        			supportDirectData = false;
        		}

        		$("#query-field").tokenInput('add',{id:id,name:token});

        		if(supportDirectData && typeof FileReader !== "undefined") {

        			var domToken = document.getElementById(id),

	        		//Create Filereader instance
	            reader = new FileReader();
	            reader.onload = (function (theDataToken) {
	              return function (event) {
	                theDataToken.src = event.target.result;
	              };
	            }(domToken));
	            //Read media data from file into img, audio, video - DOM element
	            if(!files[i].base64) {
	              reader.readAsDataURL(files[i]);
	            } else {
	              domToken.src = files[i].base64;
	            }
        		}

        		//Upload file to server
            this.processXHR(files[i], id);
	          //Increase drop component count
	          this.count++;

        	}
        	else {
        		alert("Sorry, the submitted file " + files[i].name + " is not supported. Please use one of the following file types: " + this.accept.join(','));
        	}

        }
        //End for
    }
    else {
        alert("No files to handle. Maybe this web browser does not support the File API");
    }
	};

	FileHandler.prototype.handleCanvasData = function(name,type,subtype) {

	  var fileName = name    || 'sketch.png';
	  var mime     = type    || 'image/png';
	  var subtype  = subtype || 'sketch';

	  try {
	    //Create a file object for the actual canvas data
      var fileData = {
          files : new Array({
            name    : (new Date().getTime()) + '-' + fileName,
            type    : mime,
            subtype : subtype,
            base64  : this.dataContainer.toDataURL(mime)
          })
      };
      fileData.length = fileData.files.length;

      //Go on, handle it like a normal file upload/drop
      this.handleFiles(fileData);

	  } catch(e) {
	    console.dir(e);
	    console.log('The specified data container is not a canvas element and therefore not supported!');
	  }
	};

	return {
		FileHandler : FileHandler
	};

}); //End
