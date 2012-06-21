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
    wunder     = require('./wunderground');

/**
 * Global variables
 * 
 * if we should use the passport module for authentication these are the credentials 
 * for loging in with facebook:
 * 
 * var FACEBOOK_APP_ID = "404342262940021"
 * var FACEBOOK_APP_SECRET = "c307f87f6814efac143b1e1c7bb65ff2";
 * 
 */
var authApi = '3cab95115953b1b1b31f35c48eaa36a746b479af';
var msg     = {error: 'Something went wrong.'};
var tmpPath = '../../client/musebag/tmp';
var tmpUrl  = '/tmp';

var queryRucodTpl   = '<?xml version="1.0" encoding="UTF-8"?>'
                    + '<RUCoD xmlns="http://www.isearch-project.eu/isearch/RUCoD" xmlns:gml="http://www.opengis.net/gml" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
                    + '<Header>'
                    + '<ContentObjectType>Query</ContentObjectType>'
                    + '<ContentObjectName xml:lang="en-US">[[NAME]]</ContentObjectName>'
                    + '<ContentObjectID>[[SESSIONID]]</ContentObjectID>'
                    + '<ContentObjectCreationInformation>'
                    + '<Creator><Name>[[USER]]</Name></Creator>'
                    + '</ContentObjectCreationInformation>'
                    + '<Tags>[[TAGS]]</Tags>'
                    + '<ContentObjectTypes>'
                    + '[[MEDIACONTENT]]'
                    + '<RealWorldInfo><MetadataUri filetype="rwml">[[SESSIONID]].rwml</MetadataUri></RealWorldInfo>'
                    + '[[USERINFO]]'
                    + '</ContentObjectTypes>'
                    + '</Header>'
                    + '</RUCoD>';

var queryItemTpl    = '<MultimediaContent type="[[TYPE]]">'
                    + '<MediaName>[[NAME]]</MediaName>'
                    + '<MetaTag name="TypeTag" type="xsd:string">[[REALTYPE]]</MetaTag>'
                    + '<MediaLocator><MediaUri>[[URL]]</MediaUri></MediaLocator>'
                    + '</MultimediaContent>';

var userInfoTpl     = '<UserInfo>'
                    + '<UserInfoName>Emotion</UserInfoName>'
                    + '<emotion><category name="[[NAME]]" intensity="[[INTENSITY]]" set="everydayEmotions"/></emotion>'
                    + '</UserInfo>';

var queryRwmlTpl    = '<RWML>'
                    + '<ContextSlice>'
                    + '<DateTime><Date>[[DATETIME]]</Date></DateTime>'
                    + '[[LOCATION]]'
                    + '[[WEATHER]]'
                    + '</ContextSlice>'
                    + '</RWML>';

var queryLocTpl     = '<Location type="gml">'
                    + '<gml:CircleByCenterPoint numArc="1">'
                    + '<gml:pos>[[POSITION]]</gml:pos>'
                    + '<gml:radius uom="M">10</gml:radius>'
                    + '</gml:CircleByCenterPoint>'
                    + '</Location>';

var queryWeatherTpl = '<Weather>'
                    + '<Condition>[[CONDITION]]</Condition>'
                    + '<Temperature>[[TEMP]]</Temperature>'
                    + '<WindSpeed>[[WIND]]</WindSpeed>'
                    + '<Humidity>[[HUMIDITY]]</Humidity>'
                    + '</Weather>';

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
      if(fileInfo.path.lastIndexOf('/') > -1) {
      fileInfo.originPath = tmpUrl + '/' + fileInfo.path.substring(fileInfo.path.lastIndexOf('/'),fileInfo.path.length);
      } else { 
        fileInfo.originPath = tmpUrl + '/' + fileInfo.path.substring(fileInfo.path.lastIndexOf('\\')+1,fileInfo.path.length);
      }
      fileInfo.path = data.file;
      fileInfo.subtype = fileInfo.subtype || '';
      
      callback(null,fileInfo);
    })
   .on('error', function(data,response) {
      msg.error = data.toString();
      callback(msg,null);
    });
    
  }); //end function fs.readFile
};

var getQueryRucod = function(query,sessionId,sessionStore,callback) {
  if(!query) {
    callback('No query', null);
  }
  
  var queryRucod = queryRucodTpl;
  var queryRwml  = queryRwmlTpl;
  var mmItems = '';
  var emotion = '';
  var tags    = '';

  for(var index in query.fileItems) {
    
    var item = query.fileItems[index];
    
    if(item.Type == 'Text') {
      mmItems += '<MultimediaContent type="Text"><FreeText>' + item.Content + '</FreeText></MultimediaContent>';
    } else {
      var tmpItem = queryItemTpl;
      tmpItem = tmpItem.replace("[[TYPE]]"    , item.Type)
                       .replace("[[REALTYPE]]", item.RealType)
                       .replace("[[NAME]]"    , item.name)
                       .replace("[[URL]]"     , item.Content);
      
      mmItems += tmpItem;
    }
  };
  
  if(query.tags) {
    for(var index in query.tags) {
      var tag = query.tags[index];
      tags += '<MetaTag name="TagRecommendation" type="xsd:string">' + tag + '</MetaTag>';
    }
  }
  
  if(query.emotion) {
    emotion = userInfoTpl;
    emotion = emotion.replace("[[NAME]]"     , query.emotion.name)
                     .replace("[[INTENSITY]]", query.emotion.intensity);
  }
  
  queryRucod = queryRucod.replace("[[NAME]]"        , 'UserQuery-' + sessionId)
                         .replace(/\[\[SESSIONID\]\]/g   , sessionId)
                         .replace("[[USER]]"        , (sessionStore.Email || 'Guest'))
                         .replace("[[TAGS]]"        , tags)
                         .replace("[[MEDIACONTENT]]", mmItems)
                         .replace("[[USERINFO]]"     , emotion);
  
  //Test what kind of real-world data we have and create the RWML for it
  if(query.datetime) {
    //Place holder for possible real-world data in query
    var location = '';
    var weather = '';
    //Check if we have more than a date time for the query
    if(query.location) {
      location = queryLocTpl;
      location = location.replace("[[POSITION]]", query.location);
      
      //Perform data format conversion for weather fetch
      var position = query.location.split(' ');
      position[2] = 0;
      position[3] = 0;
      
      var datetime = query.datetime.replace(/T/g    , ' ')
                                   .replace(/.000Z/g, '' )
                                   .replace(/-/g    , '.');
      
      //Try to fetch weather data for this location
      wunder.fetchWeather({Date: datetime, Location: position}, function(error, data) {

        if(error) {
          console.log('No weather data found for query with id ' + sessionId);
        } else {
          weather = queryWeatherTpl;
          weather = weather.replace("[[CONDITION]]", data.condition)
                           .replace("[[TEMP]]"     , data.temperature)
                           .replace("[[WIND]]"     , data.wind)
                           .replace("[[HUMIDITY]]" , data.humidity);
        }
        
        //Create the RWML with at least location data
        queryRwml = queryRwml.replace("[[DATETIME]]", query.datetime)
                             .replace("[[LOCATION]]", location)
                             .replace("[[WEATHER]]" , weather);
        
        callback(null, {rucod : queryRucod, rwml : queryRwml});
      });
    } else {
      //Create the RWML without any additional real world data
      queryRwml = queryRwml.replace("[[DATETIME]]", query.datetime)
                           .replace("[[LOCATION]]", location)
                           .replace("[[WEATHER]]" , weather);
      
      callback(null, {rucod : queryRucod, rwml : queryRwml});
    }
  } else {
    queryRwml = false;
    callback(null, {rucod : queryRucod, rwml : queryRwml});
  }
};

var isGuest = function(req) {
  //Does a user is logged in?
  if(req.session.user.userId == 'guest') {
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
      userId : 'guest',
      settings : '{"maxResults" : 100, "clusterType" : "3D"}',
      querycounter: 0
    };
  };
    
  return req.session.user;
};

var getExternalSessionId = function(req,renew) {
  
  if(req) {
    var sessionStore = getSessionStore(req);
    if(!req.session.user.extSessionId) {
      var sid = req.sessionID.substring(req.sessionID.length-32,req.sessionID.length) + '-' + sessionStore.querycounter;
      //remove illegal characters
      sid = sid.replace(/[|&;$%@"<>()+,\/]/g, '0');
      req.session.user.extSessionId = sid;
    } 
    return req.session.user.extSessionId;
  }
  
};

/**
 * a little but effective number test function
 */
var isNumber = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};


/**
 * login function
 */
exports.login = function(req, res){
	
	console.log("Login function called...");
	
	/*
	var verifyURL = "http://gdv.fh-erfurt.de/i-search/apc-dummy/index.php?"
        + 'f=validateUser'
        + '&email=' + req.body.email
        + '&pw=' + req.body.pw;
	*/
	var verifyURL = "https://rpxnow.com/api/v2/auth_info?"
    + 'apiKey=' + authApi
    + '&token=' + req.body.token;
	
	restler
	.get(verifyURL, { parser: restler.parsers.json })
	.on('complete', function(data) {		
		
		//Check if return data is ok
    if(!data.profile) {
    	msg.error = data.err.msg;
    	res.send(JSON.stringify(msg));
    } else {
      //Get initial user data
      var user = getSessionStore(req);
      //Set real user data
      user.userId = data.profile.verifiedEmail;
      user.name = data.profile.name.givenName || '';
      user.familyname = data.profile.name.familyName || '';
      user.email = data.profile.verifiedEmail;
      user.username = data.profile.displayName || '';
      
      //Store user data in session
			req.session.user = user; 
			
			//Test if the user is known by the personalisation component
			var checkUrl = 'http://89.97.237.248:8089/IPersonalisation/resources/users/profileFor/' + user.userId + '/withRole/Consumer';
			
			restler
		  .get(checkUrl)
		  .on('complete', function(data) { 
		    if(data) {
		      console.log('User data received:');
		      console.log(data.user);
		      //assign retrieved data to local user profile
		      var name = data.user.name.split(' ');
		      user.name = name[0];
          user.familyname = name[1];
		      for(var key in data.user) {
		        if(key === 'name') {
		          continue;
		        }
		        user[key] = data.user[key];
		      }
		      
		    } else {
		      console.log('User does not exist, request additional user information...');
		      user.state = 'new';
		      
		      //Lets create the user in the personalisation service
		      var setUrl = 'http://89.97.237.248:8089/IPersonalisation/resources/users/setProfileDataFor/' + user.userId;
	        var callData = {
	          "name"   : user.name+' '+user.familyname,
	          "settings" : user.settings,
	          "role"   : "Consumer",
	          "userId" : user.userId
	        };
	        
	        restler
	        .postJson(setUrl, callData)
	        .on('complete', function(data,response) {
	           if (response.statusCode == 201) {
	             console.log("User " + user.userId + " has been successfully created in personalisation component.");
	           } else {
	             console.log("Error during user creation of " + user.userId + " in personalisation component.");
	           }
	        })
	        .on('error', function(data,response) {
	          console.log("Personalisation component query error: " + data.toString());
	        }); 
		      
		    }
		    
		    //Return user data to client
        res.send(JSON.stringify(user));
		  })
		  .on('error', function(data, response) {
		    msg.error = data.toString();
		    res.send(JSON.stringify(msg));
		  });    
    }
	})
	.on('error', function(data,response) {
		msg.error = data.toString();
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
	
	if(sessionStore['userId'] === 'guest') {
	  res.send(JSON.stringify({error : 'User is not logged in!'}));
	  return;
	}
	
	//If no key attribute is supplied, we simply return the whole profile
	if(!attrib) {
	  res.send(JSON.stringify(sessionStore));
	} else {
  	//Does the requested profile attribute is available
  	if(sessionStore[attrib]) {
  		var data = {};
  		data[attrib] = sessionStore[attrib];
  		res.send(JSON.stringify(data));
  	} else {
  		res.send(JSON.stringify({error : 'The requested user profile attribute is not available!'}));
  	}
	}
};

exports.setProfile = function(req, res) {
  
  console.log("Set profile function called...");
  
  var attrib = req.params.attrib;
  //get post data
  var data   = req.body.data;
  //Get the right session storage (depending on log in status - guest if not, user if yes)
  var sessionStore = getSessionStore(req);
  console.log(attrib + ': ' +data);
  //Does the requested profile attribute is available
  if(data) {
    
    var changed = false;
    
    if(attrib === 'settings') {
      //threat user settings in JSON format
      try {
        //check if new settings are already in the session storage
        var newSettings = data;
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
      if(attrib === 'dateOfBirth') {
        data += 'T00:00:00+02:00';
      }
      //Set the profile attribute to the new value as long as it is a logged in user
      if(sessionStore[attrib] !== data && !isGuest(req)) {
        sessionStore[attrib] = data;
        changed = true;
      }
    }

    //If nothing changed we don't need to go on
    if(!changed) {
      res.send(JSON.stringify({info : 'nochange'}));
      return;
    }
    
    if(isGuest(req)) {
      //if it's a guest user we don't store the information in the profile (it is stored already in the session)
      res.send(JSON.stringify({info : 'guest'}));
      return;
      
    } else { 
  
      //if we have a logged in user, we store everything in the profile
      var storeURL = 'http://89.97.237.248:8089/IPersonalisation/resources/users/setProfileDataFor/' + sessionStore['userId'];
      var callData = sessionStore;
      callData.name = sessionStore['name']+' '+sessionStore['familyname'],
      console.log(callData);
      //save the user data in the user profile
      restler
      .postJson(storeURL, sessionStore)
      .on('complete', function(data,response) {         
        //Check if return data is ok
        if (response.statusCode == 201) {
          data = {success : attrib};
          //Notify client about success full save
          res.send(JSON.stringify(data));
        } else {
          msg.error = 'Error ' + response.statusCode;
          res.send(JSON.stringify(msg));
        }
      })
      .on('error', function(data,response) {
        msg.error = data.toString();
        res.send(JSON.stringify(msg));
      });
    } //end if guest
  } else {
    res.send(JSON.stringify({error : 'unknown parameter to set'}));
    return;
  }//end if requested profile attribute is available
};

exports.updateProfileHistory = function(req, res) {
  
  console.log("Update profile history function called...");
  
  //get post data
  var data = req.body;
  
  //Get the right session storage (depending on log in status - guest if not, user if yes)
  var sessionStore = getSessionStore(req);
  
  //Check what we got with this POST request
  if(data.items) {
    sessionStore.items = sessionStore.items ? data.items.concat(sessionStore.items) : data.items;
  }
  
  var result = {};
  
  //Check if history update data is complete 
  if(isNumber(sessionStore.userId) && sessionStore.query && sessionStore.items) {
    //Submit the query to authentication/personalisation component
    var storeURL = "http://gdv.fh-erfurt.de/i-search/apc-dummy/index.php";
    
    var callData = {
        "f"      : "updateSearchHistory",
        "userid" : sessionStore.userId,
        "query"  : JSON.stringify(sessionStore.query),
        "items"  : JSON.stringify(sessionStore.items)
    };
    
    console.log('callData:');
    console.log(callData);
    
    restler
    .post(storeURL, { 
      data : callData
    })
    .on('complete', function(data) { 

      //Check if result is ok
      if(data.error) {
        result.error = data.error;
        console.log(result.error);
      } else {
        result.success = 'History entry saved.';
        console.log(result);
        //After successful storing of search history entry reset session data
        sessionStore.query = undefined;
        sessionStore.items = undefined;
      }
      
      res.send(JSON.stringify(result));
   })
   .on('error', function(data,response) {
     result.error = data.toString();
     res.send(JSON.stringify(result));
   });
  } else {
    result.error = 'History data cannot be saved because of insufficient data.';
    res.send(JSON.stringify(result));
  }//end if
};

exports.query = function(req, res) {
	
	console.log("Query function called...");
	
  //get post data
  var data = req.body;
  //Get the external session id of the MQF
  var extSessionId = getExternalSessionId(req);
  //Get the right session storage (depending on log in status - guest if not, user if yes)
  var sessionStore = getSessionStore(req);
  //Url of MQF component
  var queryFormulatorURL = "http://gdv.fh-erfurt.de/i-search/mqf-dummy/handle.php";
  
  var result = {};
  
  try {
    
    //Compose the query
    getQueryRucod(data, extSessionId, sessionStore, function(error,queryData) {
      if(error) {
        result.error = 'Query error: ' + error;
        console.log(result.error);
        res.send(JSON.stringify(result));

      } else {
        
        var queryOptions = sessionStore['Settings'];
        
        //store the query in the session
        sessionStore.query = {
            id: extSessionId,
            rucod: queryData.rucod
        };
        
        //creating the call parameters
        var callData = {
            "f"       : "submitQuery",
            "rucod"   : queryData.rucod,
            "rwml"    : queryData.rwml,
            "session" : extSessionId,
            "options" : queryOptions
        };
        
        //Submit the query to MQF
        restler
        .post(queryFormulatorURL, { 
          data : callData
        })
        .on('complete', function(data) { 

          //Check if result is ok
          if(data.error) {
            result.error = data.error;
            console.log(result.error);
          } else {
            result = data.result;
          }
          
          res.send(result);
          //After successful submission of query increase the query counter
          sessionStore.querycounter++;
       })
       .on('error', function(data,response) {
          console.log(response.client['_httpMessage']['res']['rawEncoded']);
          result.error = data.toString();
          res.send(JSON.stringify(result));
       });
        
      } //End no error else
    }); //End getQueryRucod
    
  } catch(error) {
    result.error = 'Error while query processing: ' + error.message;
    console.log(result.error);
    res.send(JSON.stringify(result));
  }
	
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
    req.session.query.items.push(data);
    //Return query item path to client
    res.send(JSON.stringify(data));
  };
  
	//Check if a query object exists in this session
	if(!req.session.query) {
		req.session.query = { 'items' : [] };
	}
	
	//Store the session id
	var sid = getExternalSessionId(req);
	
	//Check if we have a file item as query item
	if(req.files.files) {
	  
    var file = req.files.files;
    
    //The temporary information about the uploaded file
    var uploadItem = { path : file.path,
                       name : file.name, 
                       type : file.type,
                       size : file.size };
	  
	  distributeFile(queryFormulatorURL, 
      {"f": "storeQueryItem", "session": sid}, 
      uploadItem, 
      externalCallback
    );
	}
	
	//Check if we have sketch data as query item
	if(req.body.canvas) {
	  
    var base64Data = req.body.canvas.replace(/^data:image\/png;base64,/,"");
    var dataBuffer = new Buffer(base64Data, 'base64');
    
    //The temporary information about the created file
    var uploadItem = { path : tmpPath + "/" + req.body.name,
                       name : req.body.name, 
                       type : 'image/png',
                       subtype: req.body.subtype,
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
	
}; //end function queryItem

exports.queryStream = function(req, res) {
  
  console.log("QueryStrem function called...");
  
}; //end function queryStream
