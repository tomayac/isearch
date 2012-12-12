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
    path     = require('path'),
    restler  = require('restler'),
    config   = require('./config'),
    helper   = require('./helper'),
    ptag     = require('./ptag'),
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

var generateVideoLLDescriptors = function(fileInfo,extSessionId) {
  
  var callData = {
    'mediaURL' : fileInfo.path,
    'fileFormat' : fileInfo.type.substr(fileInfo.type.indexOf('/')+1),
    'ContentObjectID' : extSessionId,
    'mediaName' : fileInfo.name
  };
  
  console.log('generateVideoLLDescriptors called');
  console.dir(callData);
  
  //Initiate special treatment for video files
  restler
  .post(config.videoLLdPath, { 
    data : callData
  })
  .on('success', function(data, response) { 
    if(data) {
     console.log(data); 
    }
  })
  .on('fail', function(data,response) {
    console.log(response.rawEncoded);
    console.log('VideoDescriptorExtractor failed: ' + response.statusCode);
  })
  .on('error', function(data,response) {
    console.log('VideoDescriptorExtractor error: ' + data.toString());
  });
};

/**
 * @description distributes a media file to the Multimodal Query Formulator and 
 * for video files to the VideoDescriptorExtractor component in order to get
 * visual words for the user to select from. 
 *  
 */
var distributeFile = function(callParams, fileInfo, callback) {

  var context = this;
  //URL for forwarding the uploaded file to the multimodal query formulator
  var destinationUrl = config.mqfPath + '/upload.php';
  
  fs.readFile(fileInfo.path, function (error, filedata) {
    if(error) {
      msg.error = error;
      callback(msg,null);
      return;
    }  
    //creating the call parameter
    var callData = fileInfo;
    callData['files'] = restler.file(fileInfo.path, fileInfo.type); //originally this property is called "file"
    
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
      
      //Initiate the low-level descriptor extractor if the file was a video
      console.dir(fileInfo);
      if((/video/i).test(fileInfo.type)) {
        generateVideoLLDescriptors(fileInfo,callParams.session);
      }
      
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
      var sessionStore = helper.getSessionStore(req,true);
      //Set real user data
      if(!data.profile.verifiedEmail) {
        data.profile.verifiedEmail = data.profile.preferredUsername + '@' + data.profile.providerName.toLowerCase() + '.com';
        if(data.profile.displayName) {
          var nameArray = data.profile.displayName.split(' ');
          data.profile.name.givenName = nameArray[0];
          data.profile.name.familyName = nameArray[1];
        }
      }
        
      sessionStore.user.userId = data.profile.verifiedEmail;
      sessionStore.user.name = data.profile.name.givenName || '';
      sessionStore.user.familyname = data.profile.name.familyName || '';
      sessionStore.user.email = data.profile.verifiedEmail;
      sessionStore.user.username = data.profile.preferredUsername || '';
      
			//Test if the user is known by the personalisation component
			var checkUrl = config.apcPath + 'resources/users/profileFor/' + sessionStore.user.userId + '/withRole/Consumer';
			console.log(checkUrl);
			restler
		  .get(checkUrl)
		  .on('complete', function(data, response) { 
		    
		    if(data && data.user) {		      
		      //assign retrieved data to local user profile
		      for(var key in data.user) {
		        if(key === 'name') {
		          var name = data.user[key].split(' ');
		          sessionStore.user.name = name[0];
		          sessionStore.user.familyname = name[1];
		          continue;
		        }
		        //Special treatment for date of birth key
	          if(key === 'dateOfBirth') {
	            sessionStore.user[key] = data.user[key].substring(0,data.user[key].indexOf('T'));
	            continue;
	          }
	          sessionStore.user[key] = data.user[key];
		      }
		      console.log('User data received:');
          console.log(data.user);
		      
		    } else {
		      console.log('User does not exist, request additional user information...');
		      sessionStore.user.state = 'new';
		      
		      //Lets create the user in the personalisation service
		      var setUrl = config.apcPath + 'resources/users/setProfileDataFor/' + sessionStore.user.userId;
	        var callData = {
	          "name"   : sessionStore.user.name+' '+sessionStore.user.familyname,
	          "settings" : sessionStore.user.settings,
	          "role"   : "Consumer",
	          "userId" : sessionStore.user.userId
	        };
	        console.log(setUrl);
	        console.dir(callData);
	        restler
	        .postJson(setUrl, callData)
	        .on('success', function(data,response) {
	           if (response.statusCode == 201) {
	             console.log("User " + sessionStore.user.userId + " has been successfully created in personalisation component.");
	           } else {
	             console.log("Error during user creation of " + sessionStore.user.userId + " in personalisation component.");
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
        helper.setSessionStore(req,sessionStore);
		    
		    //Return user data to client
        res.send(JSON.stringify(sessionStore.user));
		  })
		  .on('fail', function(data,response) {
		    msg.error = 'The authentication service refuses connection (Error ' + response.statusCode + ')';
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
	var sessionStore = helper.getSessionStore(req,false);
	
	if(!sessionStore.user['userId'] || sessionStore.user['userId'] === 'guest') {
	  res.send(JSON.stringify({
	    error : 'User is not logged in!',
	    settings : sessionStore.user['settings']
	  }));
	  return;
	}
	
	//If no key attribute is supplied, we simply return the whole profile
	if(!attrib) {
	  res.send(JSON.stringify(sessionStore.user));
	} else {
  	//Does the requested profile attribute is available
  	if(sessionStore.user[attrib]) {
  		var data = {};
  		data[attrib] = sessionStore.user[attrib];
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
  var sessionStore = helper.getSessionStore(req,false);
  //Does the requested profile attribute is available
  if(data) {
    
    var changed = false;

    for (var attrib in data) {

      if(attrib === 'settings') {
        //threat user settings in JSON format
        try {
          //check if new settings are already in the session storage
          var newSettings = typeof data[attrib] === 'object' ? data[attrib] : JSON.parse(data[attrib]);
          var settings = JSON.parse(sessionStore.user[attrib]);
        
          for (var key in newSettings) {
            if(!settings[key] || settings[key] !== newSettings[key]) {
              settings[key] = newSettings[key];
              changed = true;
            }
          }        
          
          //ok, the settings object is updated, so transform it back to a JSON string
          //and store it in the session
          sessionStore.user[attrib] = JSON.stringify(settings);
          
        } catch(e) {
          res.send(JSON.stringify({error : 'malformed'}));
          return;
        }
      } else {

        //Set the profile attribute to the new value as long as it is a logged in user
        if(sessionStore.user[attrib] !== data[attrib] && !helper.isGuest(req)) {
          sessionStore.user[attrib] = data[attrib];
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
    //helper.setSessionStore(req,sessionStore);
    
    if(helper.isGuest(req)) {
      //if it's a guest user we don't store the information in the profile (it is stored already in the session)
      res.send(JSON.stringify({info : 'guest'}));
      return;
      
    } else { 
  
      //if we have a logged in user, we store everything in the profile
      var storeURL = config.apcPath + 'resources/users/setProfileDataFor/' + sessionStore.user['userId'];
      var callData = {};
      
      for( var key in sessionStore.user ) {
        if(key === 'name' || key === 'familyname') {
          callData['name'] = sessionStore.user['name']+' '+sessionStore.user['familyname']; 
        } else if(key === 'dateOfBirth') {
          callData[key] = sessionStore.user[key] + 'T00:00:00+02:00';
        } else {
          callData[key] = sessionStore.user[key];
        }
      }
      console.log(storeURL);
      console.dir(callData);
      //save the user data in the user profile
      restler
      .postJson(storeURL, callData)
      .on('success', function(data,response) {         
        //use return data if it's there
        data = {success : attrib};
        sessionStore.user['state'] = 'member';
        console.log('Profile data sucessfully transmitted to personalisation web service.');
        //set the changed temporary profile data to the session profile data
        //helper.setSessionStore(req,sessionStore);
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
  var sessionStore = helper.getSessionStore(req);
  
  var result = {};
  
  //Check if history update data is complete 
  if(!helper.isGuest(req)) {
    //Submit the query to authentication/personalisation component
    var getURL = config.apcPath + 'resources/historydatas/getSearchHistoryFor/'  + sessionStore.user.userId + '/limit/5';
    
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
    });
    
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
  var sessionStore = helper.getSessionStore(req,false);
  var result = {};
  
  //Check what we got with this POST request
  if(data.items && sessionStore.queries[data.queryId]) {
    console.log('add relevant result items from post resquest');
    sessionStore.queries[data.queryId].result.relevant = sessionStore.queries[data.queryId].result.relevant ? data.items.concat(sessionStore.queries[data.queryId].result.relevant) : data.items;
  }
  
  //We iterate through all remaining queries in the session to make sure we also
  //store queries which havn't been finished or have been interrupted in the past
  for(var index in sessionStore.queries) {
    var queryData = sessionStore.queries[index];
    
    ptag.updateGenericTagSet(req,queryData);
    
    //Check if history update data is complete 
    if(!helper.isGuest(req) && queryData.query && queryData.result.relevant) {
      //Submit the query to authentication/personalisation component
      var storeURL = config.apcPath + 'resources/historydatas/updateSearchHistory';
      
      var callData = {
          "userId" : sessionStore.user.userId,
          "query"  : { 
            'id'    : queryData.query.id,
            'rucod' : JSON.stringify(queryData.query.json)
          },
          "items"  :  queryData.result.relevant
      };
      
      console.log(storeURL);
      console.log('callData:');
      console.log(callData);
      
      restler
      .postJson(storeURL, callData)
      .on('success', function(data,response) {
        //Check if result is ok
        if(response.statusCode != 201) {
          console.log('Error during history update with code: ' + response.statusCode);
        } else {
          console.log('History entry for query with index '+ index +' has been saved.');
        }
      })
      .on('fail', function(data,response) {
        console.dir(response.rawEncoded);
        console.log('Error ' + response.statusCode);
      })
      .on('error', function(data,response) {
        console.log(data.toString());  
      });
    } else {  
      console.log('History data cannot be saved for query with index '+ index +' because of insufficient data.');
    }//end if
    
    //reset each session query entry after save request was sent
    sessionStore.queries.splice(index, 1);
  }//end for
  
  res.send({'success' : true});
};

var query = function(req, res) {
	
	console.log("Query function called...");
	
  //get post data
  var data = req.body;
  console.log(data);
  //Get the external session id of the MQF
  var extSessionId = helper.getExternalSessionId(req);
  //Get the actual queryId
  var queryId = helper.getQueryId(req);
  //Get the right session storage (depending on log in status - guest if not, user if yes)
  //Second parameter determines if we get a copy of the session storage or the original object
  var sessionStore = helper.getSessionStore(req,false);
  //Url of MQF component
  var queryFormulatorURL = config.mqfPath + 'mqf.php?index='; //'submitQuery/';
  
  var result = {};  
    
  //Compose the query in the specification conform MQF way which generates a query RUCoD and RWML
  getQueryRucod(data, extSessionId, sessionStore, function(error,queryData) {
    if(error) {   
      result.error = 'Query error: ' + error;
      console.log(result.error);
      res.send(JSON.stringify(result));
    } else {
      
      try {
       
        //set the query parameters from the user settings
        var settings = JSON.parse(sessionStore.user.settings);
        
        //store the query in the session
        sessionStore.queries[queryId].query = {
            'id'   : extSessionId,
            'rucod': queryData.rucod,
            'rwml' : queryData.rwml,
            'json' : data
        };
        
        //increase query counter for the current session (used to create unique extSessionId)
        sessionStore.querycount++;
        
        //creating the call parameters
        //This would be the specification conform MQF querying
        //but since it isn't ready we use the CERTH version which works without
        //RUCoD as query format
        /*var callData = {
            "f"       : "submitQuery",
            "rucod"   : queryData.rucod,
            "rwml"    : queryData.rwml,
            "session" : extSessionId,
            "options" : settings
        };*/
        
        queryFormulatorURL += (settings.useCase ? settings.useCase : 'uc6');
        
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
          
          try {
            //Data cleaning
            data = data.replace(/^\s+|\s+$/g, '').substring(data.indexOf('{')-1,data.lastIndexOf('}')+1);
            //Data parsing
            data = typeof data === 'object' ? data : JSON.parse(data);
          } catch(e) {
            console.dir(e);
            data = {'error' : 'the server gave me an invalid result.'};
          }
          
          //Check if result is ok
          if(data.error) {
            result.error = data.error;
            console.log('Error: ' + result.error);
          } else {
            result = data;
            result.queryId = queryId;
          }
          
          //store result in session
          sessionStore.queries[queryId].result.raw = result;
          //send the result back to the client
          res.send(result);
        })
        .on('error', function(data,response) {
          console.log(response.client['_httpMessage']['res']['rawEncoded']);
          result.error = data.toString();
          res.send(JSON.stringify(result));
        });
        
      } catch(error) {
        result.error = 'Error while query processing: ' + error.message;
        console.log(result.error);
        res.send(JSON.stringify(result));
      }  
    } //End no error else
  }); //End getQueryRucod
  
};

var queryItem = function(req, res) {
	
	console.log("Queryitem function called...");
	
  //Get the external service session id
  var sid = helper.getExternalSessionId(req);
  //Get the actual queryId
  var queryId = helper.getQueryId(req);
  
  //Callback function for external webservice calls
  var externalCallback = function(error,data) {
    if(error) {
      res.send(JSON.stringify(error));
      return;
    }   
    //Return query item path to client
    data.queryId = queryId;
    res.send(JSON.stringify(data));
  };
	
	//Create the initial file meta information object
	var uploadItem = {
	  'host' : 'http://' + req.headers.host  
	};
	
	//Create additional call parameter 
  //Not used with CERTH MQF
	var callParams = {
	  "f": "storeQueryItem", 
	  "session": sid
	};
	
	//Check if we have a file item as query item
	if(req.files.files) {
	  
    var file = req.files.files;

    //Set the temporary information about the uploaded file
    uploadItem['path'] = file.path;
    uploadItem['name'] = file.name; 
    uploadItem['fileName'] = file.name; //For Exalead MQF
    uploadItem['type'] = file.type;
    uploadItem['fileType'] = file.type; //For Exalead MQF
    uploadItem['size'] = file.size;
    uploadItem['fileSize'] = file.size; //For Exalead MQF
    
    //add additional meta data to upload item
    if(typeof req.body === 'object') {
      for (var key in req.body) {
        if(req.body.hasOwnProperty(key)) {
          uploadItem[key] = req.body[key]; 
        }
      }
    }
	  
	  distributeFile(callParams, uploadItem, externalCallback);
	}
	
	//Check if we have sketch data as query item
	if(req.body.canvas) {
	  
    var base64Data = req.body.canvas.replace(/^data:image\/png;base64,/,"");
    var dataBuffer = new Buffer(base64Data, 'base64');
    
    //Set the temporary information about the created file
    uploadItem['path']     = tmpPath + "/" + req.body.name;
    uploadItem['name']     = req.body.name; 
    uploadItem['fileName'] = req.body.name; //For Exalead MQF
    uploadItem['type']     = 'image/png';
    uploadItem['fileType'] = 'image/png'; //For Exalead MQF
    uploadItem['subtype']  = req.body.subtype;
    uploadItem['size']     = dataBuffer.length;
    uploadItem['fileSize'] = dataBuffer.length; //For Exalead MQF
    
    fs.writeFile(uploadItem.path, dataBuffer, function(error) {
      if(error) {
        msg.error = error;
        res.send(JSON.stringify(msg));
        return;
      }
      
      distributeFile(callParams, uploadItem, externalCallback);
    });
	}
	
}; //end function queryItem

var queryStream = function(req, res) {
  
  console.log("QueryStream function called...");

}; //end function queryStream

var addResultItem = function(req, res) {
  
  console.log("addResultItem function called...");

  //get post data
  var data = req.body;  
  //Get the right session storage (depending on log in status - guest if not, user if yes)
  var sessionStore = helper.getSessionStore(req,false);
  
  //Check what we got with this POST request
  if(data.item && sessionStore.queries[data.queryId]) {    
    
    var itemExists = false;
    
    if(sessionStore.queries[data.queryId].result.relevant.length > 1) {
      for(var index in sessionStore.queries[data.queryId].result.relevant) {
        var testItem = sessionStore.queries[data.queryId].result.relevant[index];
        if(testItem.id === data.item.id) {
          itemExists = true;
          break;
        }
      }
    }
    if(!itemExists) {
      sessionStore.queries[data.queryId].result.relevant.push(data.item);
    }

    res.send({'success' : true});
  } else {
    res.send({'success' : false});
  }
  
}; //end function addResultItem

var deleteResultItem = function(req, res) {
  
  console.log("deleteResultItem function called...");
  
  //get post data
  var data = req.body;
  
  //Get the right session storage (depending on log in status - guest if not, user if yes)
  var sessionStore = helper.getSessionStore(req,false);
  
  //Check what we got with this POST request
  if(data.item && sessionStore.queries[data.queryId]) { 
    
    for(var index in sessionStore.queries[data.queryId].result.relevant) {
      if(sessionStore.queries[data.queryId].result.relevant[index].id === data.item.id) {
        sessionStore.queries[data.queryId].result.relevant.splice(index, 1);
        break;
      }
    }
    res.send({'success' : true});
  } else {
    res.send({'success' : false});
  }
  
}; //end function deleteResultItem

var setUseCase = function(req, res) {
  console.log('set use case to ' + req.route.params[0]);
  
  var sessionStore = helper.getSessionStore(req,false);
  var settings = JSON.parse(sessionStore.user.settings);
  
  switch(req.route.params[0]) {
    case 'music'     : settings.useCase = 'uc1'; break;
    case 'furniture' : settings.useCase = 'uc3'; break;
    case 'video'     : settings.useCase = 'uc6'; break;
    default : settings.useCase = 'uc6'; break;
  }
  
  sessionStore.user.settings = JSON.stringify(settings);
  
  var filepath = path.normalize(__dirname + '/../../client/musebag/index.html');
  res.sendfile(filepath);
};

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

exports.addResultItem    = addResultItem;
exports.deleteResultItem = deleteResultItem;

exports.setUseCase = setUseCase;
