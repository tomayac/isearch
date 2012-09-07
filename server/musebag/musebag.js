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
var fs       = require('fs'),
    restler  = require('restler'),
    wunder   = require('./wunderground');

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

//External service paths
var apcPath = 'http://89.97.237.248:8089/IPersonalisation/'; //personalisation component
var mqfPath = 'http://vision.iti.gr/isearch/server/scripts/'; //multimodal query formulation component

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
 *  -----------------------------------------------------------------------------
 *  Private Functions
 *  -----------------------------------------------------------------------------
 */

var clone = function(obj) {
  if (null == obj || "object" != typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
  }
  return copy;
};

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
        "name"     : fileInfo.name, //for CERTH MQF
        "fileSize" : fileInfo.size,
        "fileType" : fileInfo.type,
        "subtype"  : fileInfo.type, //for CERTH MQF
        "files" : restler.file(fileInfo.path, fileInfo.type) //originally this property is called "file"
    };
    //add the additional call params
    for(var prop in callParams) {
      if(callParams.hasOwnProperty(prop)) {
        callData[prop] = callParams[prop];
      }
    } 
    
    //Initiate the external file distribution
    //31.07.2012 made this function error ignorant by using the local copy of the uploaded
    //file, if the external MQF has thrown an error. 
    restler
    .post(destinationUrl, { 
      multipart: true,
      data     : callData
    })
    .on('complete', function(data, response) { 

      //Check if return data is ok
      if(data.error) {
        msg.error = data.error;
        console.log(msg.error);
        //callback(msg,null);
        //return;
      }
      
      //Add the public path, move the original local file system path
      if(fileInfo.path.lastIndexOf('/') > -1) {
        fileInfo.originPath = tmpUrl + fileInfo.path.substring(fileInfo.path.lastIndexOf('/'),fileInfo.path.length);
      } else { 
        fileInfo.originPath = tmpUrl + '/' + fileInfo.path.substring(fileInfo.path.lastIndexOf('\\')+1,fileInfo.path.length);
      }
      
      //If there was an error uploading the file to MQF, then the "file" field with the external item URL
      //will not be set and instead of throwing an error the local file path is used
      fileInfo.path = data.file ? data.file : fileInfo.host + fileInfo.originPath;

      callback(null,fileInfo);
    })
   .on('error', function(data,response) {
      msg.error = data.toString();
      console.log(msg.error);
      //callback(msg,null);
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
      wunder.fetchWeather(0, {Date: datetime, Location: position}, function(error, data) {

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
      settings : '{"maxResults" : 100, "clusterType" : "3D", "numClusters" : 5, "transMethod" : "rand"}',
      queries : new Array()
    };
  };

  return clone(req.session.user);
};

var setSessionStore = function(req,user) {
  try {
    req.session.user = user;
  } catch(e) {
    console.error('Session store could not be set due to an error: ' + e.message);
  }
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
 *  -----------------------------------------------------------------------------
 *  Public Functions
 *  -----------------------------------------------------------------------------
 */

/**
 * login function
 */
var login = function(req, res){
	
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
	.on('success', function(data) {		
		
		//Check if return data is ok
    if(!data.profile) {
    	msg.error = data.err.msg;
    	res.send(JSON.stringify(msg));
    } else {
      //Collect initial user data
      var user = getSessionStore(req);
      
      //Set real user data
      user.userId = data.profile.verifiedEmail;
      user.name = data.profile.name.givenName || '';
      user.familyname = data.profile.name.familyName || '';
      user.email = data.profile.verifiedEmail;
      user.username = data.profile.displayName || '';
      
			//Test if the user is known by the personalisation component
			var checkUrl = apcPath + 'resources/users/profileFor/' + user.userId + '/withRole/Consumer';
			
			restler
		  .get(checkUrl)
		  .on('success', function(data, response) { 
		    
		    if(data) {		      
		      //assign retrieved data to local user profile
		      var name = data.user.name.split(' ');
		      user.name = name[0];
          user.familyname = name[1];
		      for(var key in data.user) {
		        if(key === 'name') {
		          continue;
		        }
		        //Special treatment for date of birth key
	          if(key === 'dateOfBirth') {
	            user[key] = data.user[key].substring(0,data.user[key].indexOf('T'));
	            continue;
	          }
		        user[key] = data.user[key];
		      }
		      console.log('User data received:');
          console.log(data.user);
		      
		    } else {
		      console.log('User does not exist, request additional user information...');
		      user.state = 'new';
		      
		      //Lets create the user in the personalisation service
		      var setUrl = apcPath + 'resources/users/setProfileDataFor/' + user.userId;
	        var callData = {
	          "name"   : user.name+' '+user.familyname,
	          "settings" : user.settings,
	          "role"   : "Consumer",
	          "userId" : user.userId
	        };
	        
	        restler
	        .postJson(setUrl, callData)
	        .on('success', function(data,response) {
	           if (response.statusCode == 201) {
	             console.log("User " + user.userId + " has been successfully created in personalisation component.");
	           } else {
	             console.log("Error during user creation of " + user.userId + " in personalisation component.");
	           }
	        })
	        .on('fail', function(data,response) {
            console.log("Personalisation component query error: response error " + response.statusCode);
          })
	        .on('error', function(data,response) {
	          console.log("Personalisation component query error: " + data.toString());
	        });	      
		    }
		    
		    //Store user data in session
        setSessionStore(req,user);
		    
		    //Return user data to client
        res.send(JSON.stringify(user));
		  })
		  .on('fail', function(data,response) {
		    msg.error = 'Error ' + response.statusCode;
        res.send(JSON.stringify(msg));
      })
		  .on('error', function(data, response) {
		    msg.error = 'The authentication service refuses connection (' + data.toString() + ')';
		    res.send(JSON.stringify(msg));
		  });    
    }
	})
	.on('error', function(data,response) {
		msg.error = data.toString();
		res.send(JSON.stringify(msg));
	});
	
};

var logout = function(req, res) {	
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

var profile = function(req, res) {
	
  console.log("get profile function called...");
  
	var attrib = req.params.attrib;
	//Get the right session storage (depending on log in status - guest if not, user if yes)
	var sessionStore = getSessionStore(req);
	
	if(!sessionStore['userId'] || sessionStore['userId'] === 'guest') {
	  res.send(JSON.stringify({
	    error : 'User is not logged in!',
	    settings : sessionStore['settings']
	  }));
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

var setProfile = function(req, res) {
  
  console.log("Set profile function called...");
  
  //get post data
  var data = req.body.data;
  //Get the right session storage (depending on log in status - guest if not, user if yes)
  var sessionStore = getSessionStore(req);
  //Does the requested profile attribute is available
  if(data) {
    
    var changed = false;

    for (var attrib in data) {

      if(attrib === 'settings') {
        //threat user settings in JSON format
        try {
          //check if new settings are already in the session storage
          var newSettings = data[attrib];
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
          data[attrib] += 'T00:00:00+02:00';
        }
        //Set the profile attribute to the new value as long as it is a logged in user
        if(sessionStore[attrib] !== data[attrib] && !isGuest(req)) {
          sessionStore[attrib] = data[attrib];
          changed = true;
        }
      }
    } //end for
    
    //If nothing changed we don't need to go on
    if(!changed) {
      res.send(JSON.stringify({info : 'nochange'}));
      return;
    }
    
    //set the changed temporary profile data to the session profile data
    setSessionStore(req,sessionStore);
    
    if(isGuest(req)) {
      //if it's a guest user we don't store the information in the profile (it is stored already in the session)
      res.send(JSON.stringify({info : 'guest'}));
      return;
      
    } else { 
  
      //if we have a logged in user, we store everything in the profile
      var storeURL = apcPath + 'resources/users/setProfileDataFor/' + sessionStore['userId'];
      var callData = {};
      
      for( var key in sessionStore ) {
        if(key === 'name') {
          callData['name'] = sessionStore['name']+' '+sessionStore['familyname']; 
        } else {
          callData[key] = sessionStore[key];
        }
      }
      //save the user data in the user profile
      restler
      .postJson(storeURL, sessionStore)
      .on('success', function(data,response) {         
        //use return data if it's there
        data = {success : attrib};
        sessionStore['state'] = 'member';
        console.log('Profile data sucessfully transmitted to personalisation web service.');
        //set the changed temporary profile data to the session profile data
        setSessionStore(req,sessionStore);
        //Notify client about success full save
        res.send(JSON.stringify(data));
      })
      .on('fail', function(data,response) {
        msg.error = 'Error ' + response.statusCode;
        res.send(JSON.stringify(msg));
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

var getProfileHistory = function(req, res) {
  
  console.log("get profile history function called...");
  
  //Get the right session storage (depending on log in status - guest if not, user if yes)
  var sessionStore = getSessionStore(req);
  
  var result = {};
  
  //Check if history update data is complete 
  if(!isGuest(req)) {
    //Submit the query to authentication/personalisation component
    var getURL = apcPath + 'resources/historydatas/getSearchHistoryFor/'  + sessionStore.userId + '/limit/5';
    
    restler
    .get(getURL)
    .on('success', function(data, response) { 
      //Notify client about successful save
      res.send(JSON.stringify(data));
    })
    .on('fail', function(data,response) {
      msg.error = 'Error ' + response.statusCode;
      res.send(JSON.stringify(msg));
    })
    .on('error', function(data,response) {
      result.error = data.toString();
      res.send(JSON.stringify(result));
    })
  } else {
    result.error = 'No history data available for guest users.';
    res.send(JSON.stringify(result));
  }//end if
};

var updateProfileHistory = function(req, res) {
  
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
    var storeURL = apcPath + 'resources/historydatas/updateSearchHistoryFor/'  + sessionStore.userId;
    
    var callData = {
        "userid" : sessionStore.userId,
        "query"  : JSON.stringify(sessionStore.query),
        "items"  : JSON.stringify(sessionStore.items)
    };
    
    console.log('callData:');
    console.log(callData);
    
    restler
    .postJson(storeURL, callData)
    .on('complete', function(data,repsonse) { 
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
        sessionStore.tags  = undefined;
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

var query = function(req, res) {
	
	console.log("Query function called...");
	
  //get post data
  var data = req.body;
  console.log(data);
  //Get the external session id of the MQF
  var extSessionId = getExternalSessionId(req);
  //Get the right session storage (depending on log in status - guest if not, user if yes)
  var sessionStore = getSessionStore(req);
  //Url of MQF component
  var queryFormulatorURL = mqfPath + 'mqf.php?index=uc6';
  
  var result = {};
  
  try {
    
    var queryId = -1 + sessionStore.queries.push({
      'tags'  : data.tags ? data.tags.join() : '', //store the used query tags in the session
      'query' : data //store query in session
    });
    
    //set the query parameters from the user settings
    var settings = JSON.parse(sessionStore.settings);
    
    if ( settings.maxNumResults ) queryFormulatorURL += '&total=' + settings.maxNumResults ;
    if ( settings.numClusters )   queryFormulatorURL += '&cls=' + settings.numClusters ;
    if ( settings.transMethod )   queryFormulatorURL += '&tr=' + settings.transMethod ;
    if ( !settings.smatrix )      queryFormulatorURL += '&smat=true' ;
    
   console.log(queryFormulatorURL);
    //Submit the query to MQF
    restler
    .post(queryFormulatorURL, { 
      data : JSON.stringify(data)
    })
    .on('complete', function(data) { 

      //Check if result is ok
      if(data.error) {
        result.error = data.error;
        console.log(result.error);
      } else {
        result = data.result;
      }
      
      //store result in session
      sessionStore.queries[queryId]['result'] = data;
      
      res.send(result);
      //After successful submission of query increase the query counter
      sessionStore.querycounter++;
    })
    .on('error', function(data,response) {
      console.log(response.client['_httpMessage']['res']['rawEncoded']);
      result.error = data.toString();
      res.send(JSON.stringify(result));
    });
    
    //Compose the query
    //This would be the specification conform MQF querying
    //but since it isn't ready we use the CERTH version which works without
    //RUCoD as query format
    /*
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
    */
    
  } catch(error) {
    result.error = 'Error while query processing: ' + error.message;
    console.log(result.error);
    res.send(JSON.stringify(result));
  }
	
};

var queryItem = function(req, res) {
	
	console.log("Queryitem function called...");

	//Url for forwarding the uploaded file to the multimodal query formulator
  var queryFormulatorURL = mqfPath + '/upload.php';
	
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
	//Create the initial file meta information object
	var uploadItem = {
	  'host' : 'http://' + req.headers.host  
	};
	
	//Check if we have a file item as query item
	if(req.files.files) {
	  
    var file = req.files.files;

    //Set the temporary information about the uploaded file
    uploadItem['path'] = file.path;
    uploadItem['name'] = file.name; 
    uploadItem['type'] = file.type;
    uploadItem['size'] = file.size;
	  
	  distributeFile(queryFormulatorURL, 
      {"f": "storeQueryItem", "session": sid}, //Not used with CERTH MQF
      uploadItem, 
      externalCallback
    );
	}
	
	//Check if we have sketch data as query item
	if(req.body.canvas) {
	  
    var base64Data = req.body.canvas.replace(/^data:image\/png;base64,/,"");
    var dataBuffer = new Buffer(base64Data, 'base64');
    
    //Set the temporary information about the created file
    uploadItem['path']    = tmpPath + "/" + req.body.name;
    uploadItem['name']    = req.body.name; 
    uploadItem['type']    = 'image/png';
    uploadItem['subtype'] = req.body.subtype;
    uploadItem['size']    = dataBuffer.length;
    
    fs.writeFile(uploadItem.path, dataBuffer, function(error) {
      if(error) {
        msg.error = error;
        res.send(JSON.stringify(msg));
        return;
      }
      
      distributeFile(
        queryFormulatorURL, 
        {"f": "storeQueryItem", "session": sid}, //Not used with CERTH MQF
        uploadItem, 
        externalCallback
      );
    });
	}
	
}; //end function queryItem

var queryStream = function(req, res) {
  
  console.log("QueryStream function called...");

}; //end function queryStream

//Export all public available functions
exports.login  = login;
exports.logout = logout;

exports.profile              = profile;
exports.setProfile           = setProfile;
exports.getProfileHistory    = getProfileHistory;
exports.updateProfileHistory = updateProfileHistory;

exports.query       = query;
exports.queryItem   = queryItem;
exports.queryStream = queryStream;
