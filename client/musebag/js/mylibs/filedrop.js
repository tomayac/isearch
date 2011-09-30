/**
 * 
 */
define("mylibs/filedrop", ["libs/jquery.hasEventListener.min"], function(){
	
	FileDrop = function(elementID,accept,serverURL) {
		this.dropContainer = document.getElementById(elementID);
		this.accept = accept || [];
		this.serverURL = serverURL || 'http://gdv.fh-erfurt.de/i-search/gui/server/handle.php';
		this.count = 0;
	
		this.ModelHandler = function(model,canvas) {
			this.model     = model;
	        this.canvas    = document.getElementById(canvas);
		};
		
		this.ModelHandler.prototype.initialize = function() {
	        //Scope magic
	        var that = this;
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
	                model.setDocument(that.model,window.location.href);
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
	        
	        doc.load("scene.xml");
		};
	};
	
	//Function for calculate the progress of the upload progress bar
	FileDrop.prototype.uploadProgressXHR = function(event) {
	    if (event.lengthComputable) {
	        var percentage = Math.round((event.loaded * 100) / event.total);
	        if (percentage <= 100) {
	            event.target.log.lastChild.firstChild.style.width = (percentage*2) + "px";
	            event.target.log.lastChild.firstChild.textContent = percentage + "%";
	        }
	    } 
	};
	
	//Logging notification function, fires if upload complete 
	FileDrop.prototype.loadedXHR = function(event) {
	    var currentItem = event.target.log;
	    currentItem.className += " loaded";
	    console.log("xhr upload of "+event.target.log.id+" complete");
	};
	    
	//Logging notification function, fires if there was an error during upload
	FileDrop.prototype.uploadError = function(error) {
	    console.log("error: " + error);
	};
	    
	//Handles the file upload with 
	FileDrop.prototype.processXHR = function(file, index) {
	    var xhr        = new XMLHttpRequest(),
	        formData   = new FormData(),
	        container  = document.getElementById('dropComponent'+index),
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
	            var fileInfo = JSON.parse(xhr.responseText);
	            //3D model display via GLGE
	            if((/dae/i).test(fileInfo.name)) {
	            	var modelHandler = new that.ModelHandler(fileInfo.path,'dropComponent' + index + '-canvas');
	            	modelHandler.initialize();
	            }
	            //Image display in query field
	            console.log(fileInfo);
	            if((/image/i).test(fileInfo.type)) {
	            	$("#query-field").tokenInput('add',{id:"cat",name:"<img src='" + fileInfo.path + "'/>"});
	            	$("#dropComponent" + index).remove();
	            }
	        }  
	    };
	    
	    xhr.upload.log = container;
	    xhr.upload.curLoad = 0;
	    xhr.upload.prevLoad = 0;
	    xhr.upload.addEventListener("progress", this.uploadProgressXHR, false);
	    xhr.upload.addEventListener("load", this.loadedXHR, false); 
	    xhr.upload.addEventListener("error", this.uploadError, false); 
	    
	    formData.append('files', file);
	    xhr.open("POST", this.serverURL, true);
	    xhr.send(formData);
	    
	};
	    
	//Drop event handler for image component
	FileDrop.prototype.handleFiles = function(event) {
	    
		var files = event.files || event.dataTransfer.files;
		
		event.stopPropagation();
		event.preventDefault();
		
	    //Test if browser supports the File API
	    if (typeof files !== "undefined") {
	    	
	        for (var i=0, l=files.length; i<l; i++) {
	            
	        	//State if current file is allowed to be uploaded
	        	var acceptFile = false;
	        	
	            //Generate the query component with preview based on the file type
	            var componentDiv   = document.createElement('div');
	            
	            componentDiv.id    = "dropComponent" + this.count;
	            componentDiv.className += "component";
	
	            /*
	                If the file is an image and the web browser supports FileReader,
	                present a preview in the file list
	            */
	            if (typeof FileReader !== "undefined") {
	            	//Test if images are uploaded and accepted
	            	if((/image/i).test(files[i].type) && ($.inArray('jpg',this.accept) || $.inArray('png',this.accept))) {
	            		acceptFile = true;
	            		
	            		componentDiv.className += " image";
	            		
	            		//Generates img element for images
	            		var componentImg = document.createElement("img");
		                componentDiv.appendChild(componentImg);
		                
		                //Create Filereader instance
		                reader = new FileReader();
		                reader.onload = (function (theImg) {
		                    return function (evt) {
		                        theImg.src = evt.target.result;
		                    };
		                }(componentImg));
		                //Read image data from file into img - DOM element
		                reader.readAsDataURL(files[i]);
	            	}
	            	//Test if dae 3d models are uploaded and accepted
	            	if(((/dae/i).test(files[i].name) && $.inArray('dae',this.accept)) || 
	            	   ((/zip/i).test(files[i].name) && $.inArray('zip',this.accept))) {
	            		acceptFile = true;
	                    componentDiv.className += " model";
	                    
	                    //Generate canvas for 3D models
	                    var canvasField = document.createElement('canvas');
	                    canvasField.id = componentDiv.id + "-canvas";
	                    canvasField.setAttribute('width','200px');
	                    canvasField.setAttribute('height','200px');
	                    componentDiv.appendChild(canvasField);
	                }
	            }
	
	            if(acceptFile) {
		            this.dropContainer.appendChild(componentDiv);
		            
		            this.processXHR(files[i], this.count);
		            //Increase drop component count
		            this.count++;
	            } else {
	            	delete componentDiv;
	            }
	        }
	        //End for
	    }
	    else {
	        dropContainer.innerHTML = "No support for the File API in this web browser";
	    }
	};
	
	return {
		FileDrop : FileDrop
	};
	
}); //End 