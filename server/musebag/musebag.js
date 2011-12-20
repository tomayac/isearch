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

      //Check if return data is ok
      if(data.error) {
        msg.error = data.error;
        callback(msg,null);
        return;
      }
      //Add the public path, move the original local file system path
      fileInfo.originPath = tmpUrl + '/' + fileInfo.path.substring(fileInfo.path.lastIndexOf('/'),fileInfo.path.length);
      fileInfo.path = data.file;
      fileInfo.subtype = fileInfo.subtype || '';
      
      callback(null,fileInfo);
    })
   .on('error', function(data,response) {
      msg.error = response.message;
      callback(msg,null);
    });
    
  }); //end function fs.readFile
};

var isGuest = function(req) {
  //Does a user is logged in?
  if(req.session.user.ID == 'guest') {
    return true;
  } else {
    return false;
  }
};

var getSessionStore = function(req) {
  //Does a user is logged in?
  if(!req.session.user) {
    //If not create an guest session store
    req.session.user = { 
      ID : 'guest',
      Settings : '{"maxResults" : 100}'
    };
  };
    
  return req.session.user;
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
	.on('error', function(data,response) {
		msg.error = response.message;
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
	//Get the right session storage (depending on log in status - guest if not, user if yes)
	var sessionStore = getSessionStore(req);

	//Does the requested profile attribute is available
	if(sessionStore[attrib]) {
		var data = {};
		data[attrib] = sessionStore[attrib];
		res.send(JSON.stringify(data));
	} else {
		res.send(JSON.stringify({error : 'The requested user profile attribute is not available!'}));
	}
};

exports.setProfile = function(req, res) {
  
  console.log("Set profile function called...");
  
  var attrib = req.params.attrib;
  //get post data
  var data   = req.body.data;
  //Get the right session storage (depending on log in status - guest if not, user if yes)
  var sessionStore = getSessionStore(req);
  
  //Does the requested profile attribute is available
  if(sessionStore[attrib] && data.length > 0) {
    
    var changed = false;
    
    if(attrib === 'Settings') {
      //treat user settings in JSON format
      try {
        //check if new settings are already in the session storage
        var newSettings = JSON.parse(data);
        console.log(sessionStore[attrib]);
        var settings = JSON.parse(sessionStore[attrib]);
        
        for (var key in newSettings) {
          if(!settings[key] || settings[key] !== newSettings[key]) {
            settings[key] = newSettings[key];
            changed = true;
          }
        } 
        
        //ok, the settings object is updated, so transform it back to a JSON string
        //and store it in the session
        sessionStore[attrib] = JSON.stringify(settings);
        
      } catch(e) {
        res.send(JSON.stringify({error : 'malformed'}));
        return;
      }
    } else {
      //Set the profile attribute to the new value as long as it is a logged in user
      if(sessionStore[attrib] !== data && !isGuest(req)) {
        sessionStore[attrib] = data;
        changed = true;
      }
    }

    //If nothing changed we don't need to go on
    if(!changed) {
      res.send(JSON.stringify({error : 'nochange'}));
      return;
    }
    
    if(isGuest(req)) {
      //if it's a guest user we don't store the information in the profile (it is stored already in the session)
      res.send(JSON.stringify({info : 'guest'}));
      return;
    } else { 
  
      //if we have a logged in user, we store everything in the profile
      var storeURL = "http://gdv.fh-erfurt.de/i-search/apc-dummy/index.php?"
        + 'f=profileData';
      
      var callData = {
          "userid" : sessionStore['ID'],
          "data"   : sessionStore[attrib]
      };
      //save the user data in the user profile
      restler
      .post(storeURL, { 
        data     : callData
      })
      .on('complete', function(data) {         
        //Check if return data is ok
        if(!data.success) {
          msg.error = data.error;
          res.send(JSON.stringify(msg));
        } else {
          //Notify client about success full save
          res.send(JSON.stringify(data));
        }
      })
      .on('error', function(data,response) {
        msg.error = response.message;
        res.send(JSON.stringify(msg));
      });
    } //end if guest
  } else {
    res.send(JSON.stringify({error : 'unknown parameter to set'}));
    return;
  }//end if requested profile attribute is available
};

exports.query = function(req, res) {
	
	console.log("Query function called...");
	//Compose the query
	
	
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
      var uploadItem = { path : tmpPath + "/" + fields.name,
                         name : fields.name, 
                         type : 'image/png',
                         subtype: fields.subtype,
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


