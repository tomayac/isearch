/**
 * @package MuseBag - Multimodal Search Interface
 * 
 * @description This file exposes all functions dedicated to the server part of the 
 * Multimodal Search Interface of I-SEARCH.
 * 
 * @author Arnaud Brousseau and Jonas Etzold
 * @company Google Deutschland GmbH, University of Applied Sciences Erfurt
 */

/**
 * Required node modules
 */
var fs         = require('fs'),
    restler    = require('restler'),
    formidable = require('formidable');

/**
 * Global variables
 */
var msg     = {error: 'Something went wrong.'};
var tmpPath = '/var/www/isearch/client/musebag/tmp';
var tmpUrl  = '/tmp';

/**
 * private functions
 */
var distributeFile = function(destinationUrl, callParams, fileInfo, callback) {
  
  var context = this;
  
  fs.readFile(fileInfo.path, function (error, filedata) {
    if(error) {
      msg.error = error;
      callback(msg,null);
      return;
    }  
    //creating the call parameter
    var callData = {
        "fileName" : fileInfo.name,
        "fileSize" : fileInfo.size,
        "fileType" : fileInfo.type,
        "file" : restler.file(fileInfo.path, fileInfo.type)
    };
    //add the additional call params
    for(var prop in callParams) {
      if(callParams.hasOwnProperty(prop)) {
        callData[prop] = callParams[prop];
      }
    } 
    
    //Initiate the external file distribution
    restler
    .post(destinationUrl, { 
      multipart: true,
      data     : callData
    })
    .on('complete', function(data) { 
      console.log('test:');
      console.log(data);
      //Check if return data is ok
      if(data.error) {
        msg.error = data.error;
        callback(msg,null);
        return;
      }
      //Add the public path, move the original local file system path
      fileInfo.originPath = tmpUrl + '/' + fileInfo.name;
      fileInfo.path = data.file;
      
      callback(null,fileInfo);
    })
    .on('error', function(error) {
      msg.error = error;
      callback(msg,null);
    });
    
  }); //end function fs.readFile
};

/**
 * login function
 */
exports.login = function(req, res){
	
	console.log("Login function called...");
	
	var verifyURL = "http://gdv.fh-erfurt.de/i-search/apc-dummy/index.php?"
        + 'f=validateUser'
        + '&email=' + req.body.email
        + '&pw=' + req.body.pw;

	restler
	.get(verifyURL)
	.on('complete', function(data) {		
		
		//Check if return data is ok
    if(!data.user) {
    	msg.error = data.error;
    	res.send(JSON.stringify(msg));
    } else {
      //Store user data in session
			req.session.user = data.user;
			//Return user data to client
      res.send(JSON.stringify(data.user));
    }
	})
	.on('error', function(error) {
		msg.error = error;
		res.send(JSON.stringify(msg));
	});
	
};

exports.logout = function(req, res) {
	
	console.log("Logout function called...");
	
	//Destroy the session
	req.session.destroy(function(error) {
		
		if(error) {
			msg.error = error;
			res.send(JSON.stringify(msg));
		} else {
			//Return user data to client
			res.send(JSON.stringify({msg: true}));
		}
	});
	
};

exports.profile = function(req, res) {
	
	var attrib = req.params.attrib;
	
	//Does a user is logged in?
	if(!req.session.user) {
		res.send(JSON.stringify({error : 'You are not logged in!'}));
		return;
	}
	//Does the requested profile attribute is available
	if(req.session.user[attrib]) {
		var data = {};
		data[attrib] = req.session.user[attrib];
		res.send(JSON.stringify(data));
	} else {
		res.send(JSON.stringify({error : 'The requested user profile attribute is not available!'}));
	}
};

exports.query = function(req, res) {
	
	console.log("Query function called...");
	
};

exports.queryItem = function(req, res) {
	
	console.log("Queryitem function called...");
  
	//Url for forwarding the uploaded file to the multimodal query formulator
  var queryFormulatorURL = "http://gdv.fh-erfurt.de/i-search/mqf-dummy/handle.php";
	
  //Callback function for external webservice calls
  var externalCallback = function(error,data) {
    if(error) {
      res.send(JSON.stringify(error));
      return;
    }
    
    //Store query item data in session
    console.log(data);
    req.session.query.items.push(data);

    //Return query item path to client
    res.send(JSON.stringify(data));
    
  };
  
	//Check if a query object exists in this session
	if(!req.session.query) {
		req.session.query = { 'items' : [] };
	}
	
	//Store the session id
	var sid = req.sessionID.substring(req.sessionID.length-32,req.sessionID.length);
	req.session.extSessionId = sid;
	
	//Create the upload parser
	var upload = new formidable.IncomingForm();
	//Set the upload settings
	upload.uploadDir = tmpPath; 
	upload.keepExtensions = true;
	upload.maxFieldsSize = 8 * 1024 * 1024; // 8 MB
	upload.encoding = 'binary';
	//Check for every uploaded file
	upload.addListener('file', function(name, file) {

		//The temporary information about the uploaded file
		var uploadItem = { path : file.path,
				               name : file.name, 
				               type : file.type,
				               size : file.size};
    
		distributeFile(queryFormulatorURL, 
		  {"f": "storeQueryItem", "session": sid}, 
		  uploadItem, 
		  externalCallback
	  );
		
	});
	
	//Parse the upload data
	upload.parse(req, function(error, fields, files) {
		
		if(error) {
			msg.error = error;
			res.send(JSON.stringify(msg));
			return;
		}
		
		if(fields.canvas) {

		  var base64Data = fields.canvas.replace(/^data:image\/png;base64,/,"");
		  var dataBuffer = new Buffer(base64Data, 'base64');
		  
		  //The temporary information about the created file
      var uploadItem = { path : tmpPath + "/" + (new Date().getTime()) + '-' + fields.name,
                         name : (new Date().getTime()) + '-' + fields.name, 
                         type : 'image/png',
                         size : dataBuffer.length};
		  
		  fs.writeFile(uploadItem.path, dataBuffer, function(error) {
		    if(error) {
		      msg.error = error;
		      res.send(JSON.stringify(msg));
		      return;
		    }
		    
		    distributeFile(queryFormulatorURL, 
		      {"f": "storeQueryItem", "session": sid}, 
		      uploadItem, 
		      externalCallback
		    );
		  });
		  
		}

	}); //end function upload.parse
	
}; //end function queryItem


