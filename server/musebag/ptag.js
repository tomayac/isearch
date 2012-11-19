/**
 * @package pTag - Personal Content Tagging Component
 * 
 * @description This file exposes all functions dedicated to personal content tagging
 * within I-SEARCH.
 * 
 * @author Jonas Etzold
 * @company University of Applied Sciences Fulda
 */

/**
 * Required node modules
 */
var restler = require('restler'),
    redis   = require("redis"),
    config  = require('./config'),
    helper  = require('./helper');

/**
 * Global variables
 */
var tagSetSize = 20;
var filterTagSetSize = 10;

var tags = {
    'kojomisch'     : [['flight',1.0],['travel',1.5],['airplane',2.8],['sky',0.8],['rocket',1.0],['USA',0.9],['NASA',1.3],['space',1.8],['Apollo Program',1.2],['Saturn V',0.8],['Viking',1.0],['Space probes',1.8],['ISS',1.2]],
    'julia.ziemens' : [['trees',2.0],['nature',1.8],['enviromental landscaping',1.0],['green energy',1.5],['electric cars',0.6],['Renault',0.5],['tulip',0.7],['garden',1.0],['pine tree',1.2],['forest',0.9],['Kanada',2.0]],
    'stratos'       : [['bike',0.9],['biker',1.5],['bicycle',0.6],['Harley Davidson',2.0],['Motorcycle',2.8],['speed',1.0],['sexyness',0.5],['A beast',0.9],['Vendors',2.0],['black',1.2],['round fuel tank',0.8],['Rocker',1.6]],
    'petros'        : [['red chairs',2.5],['room',1.5],['bright',2.0],['IKEA',1.0],['design furniture',2.8],['idea',0.8],['big room',0.6],['colorful',1.5],['home office',2.0],['interior',0.8],['furniture assembling',0.6]],
    'tomac'         : [['WoW',3.0],['MMRPG Avatars',1.2],['Game avatar',1.5],['Knight',2.0],['Magican',2.5],['World of Warcraft',1.8],['Lost Chaos',1.0],['Forsaken World',0.8],['Elf',1.8],['Warrior',3.0],['Hunter avatar',2.2],['High level avatars',1.2],['Special characters',0.8]],
    'familie.etzold': [['shark',2.0],['fish',2.5],['dolphin',1.5],['Atlantic',1.0],['Fishing',0.8],['Diving',1.5],['dive license',0.6],['Pacific',1.5],['Hammerhead',2.0],['Hawaii',3.0],['Marlin',1.0],['Seahorse',1.8],['Best diving grounds',2.3]]
};

//Stores the redis client connection
var client = null;
//Stores client IPs with already retrieved countries
var countryList = [];

/**
 *  -----------------------------------------------------------------------------
 *  Private Functions
 *  -----------------------------------------------------------------------------
 */
var extractTags = function(queryData) {
  
  var tags = [];
  
  if(typeof queryData !== 'object' || !queryData.result.raw) {
    return tags;
  }
  
  //Make sure to not include tags from search queries were
  //no results have been found
  if(!queryData.result.raw.documentList.length < 1) {
    return tags;
  }
  
  //Get tags from query
  if(queryData.query.json) {
    if(queryData.query.json.tags) {
      tags.concat(queryData.query.json.tags);
    }
    if(queryData.query.json.fileItems.length > 0) {
      for(var i in queryData.query.json.fileItems) {
        if(queryData.query.json.fileItems[i].Type === 'Text') {
          tags.push(queryData.query.json.fileItems[i].Content.capitalize());
        } 
      }
    }
  }
  //Get tags from relevant result items
  if(queryData.result.relevant && queryData.result.relevant.length > 0) {
    for(var r in queryData.result.relevant) {
      var itemTags = queryData.result.relevant[r].tags;
      for(var t in itemTags) {
        tags.push(itemTags[t]);
      }
    }
  }
  
  return tags;
};

/**
 * Normalizes relevance values in given tag set based on maximum relevance.
 * The normalized value is stored in tag set as 'size' property and can be
 * directly used to express relevance by font size.
 * 
 * @param tagSet
 * @returns tagSet with normalized relevance values as 'size' property
 */
var normalizeTagSet = function(tagSet) {
  if(!tagSet || typeof tagSet !== 'object' || !(tagSet instanceof Array)) {
    return tagSet;
  }
  
  //Get maximum relevance in tag set
  var maxRelevance = 1.0;
  for(var t in tagSet) {
    maxRelevance = Math.max(tagSet[t].relevance,maxRelevance);
  }
  //normalize relevance values
  for(var t in tagSet) {
    tagSet[t].size = (tagSet[t].relevance - 1.0) / (maxRelevance - 1.0);
  }
  
  return tagSet;
};

/**
 * 
 * @param tag - the tag to add to the tag set
 * @param tagSet - the current tag set
 * @param relevance - a user defined relevance for the given tag
 * @returns enhanced input tag set
 */
var addTag = function(tag,tagSet,relevance) {

  if(!tagSet || typeof tagSet !== 'object') {
    tagSet = [];
  }
 
  if(!tag) {
    return tagSet;
  }
  
  var exists = false;
  for(var t in tagSet) {
    var sim = helper.sift.similarity(tagSet[t].name.toLowerCase(),tag.toLowerCase());  
    if(tagSet[t].name.toLowerCase() === tag.toLowerCase() || sim > 0.9) {
      tagSet[t].relevance += 0.2;
      exists = true;
      break;
    }
  }
  if(!exists) {
    tagSet.push({
      'name' : tag,
      'relevance' : relevance || 1.0
    });
  }
  
  return tagSet;
};

/**
 * 
 * @param tagSet - the tag set which should be sorted based on the relevance values
 * @returns the relevance sorted tag set
 */
var sortTagSet = function(tagSet,sortBy) {
  
  if(!tagSet || typeof tagSet !== 'object' || !(tagSet instanceof Array)) {
    return tagSet;
  }
  
  if(!sortBy || sortBy === 'relevance') {
    tagSet.sort(function(a,b) { 
      return parseFloat(b.relevance) - parseFloat(a.relevance);
    });
  } else if (sortBy === 'name') {
    tagSet.sort(function(a, b){
      var nameA = a.name.toLowerCase(), nameB=b.name.toLowerCase();
      if (nameA < nameB) { return -1; } 
      if (nameA > nameB) { return  1; }
      return 0; //default return value (no sorting)
     });
  }
  
  return tagSet;
};

/**
 * 
 * @param ip - the client ip address
 * @param callback - function with error and country as parameters where 
 * country is the origin country of the client IP address 
 * @returns null
 */
var getClientCountry = function(ip,callback) {

  if(typeof callback !== 'function') {
    return;
  }
  //check if country for this IP is already discovered
  if(countryList[ip]) {
    callback(null,countryList[ip]);
    return;
  }
  
  var geoInfoUrl = config.geoInfoPath;
  //check if service is not running local
  if(ip !== '127.0.0.1') {
    geoInfoUrl += '?ip=' + ip;
  }
  //console.log(geoInfoUrl);
  
  //Get clients country
  restler
  .get(geoInfoUrl)
  .on('success', function(data,response) {
    if(data && data['country_name']) {
      countryList[data['ip']] = data['country_name'].toLowerCase();
      callback(null,data['country_name'].toLowerCase());
    } else {
      callback('Malformed or empty data during clients country retrieval.',null);
    }
  })
  .on('fail', function(data,response) {
    callback('pTag: External server error ' + response.statusCode + ' during clients country retrieval',null);
  })
  .on('error', function(data,response) {
    callback('pTag: Error ' + data.toString() + ' during clients country retrieval',null);
  });
};

/**
 * 
 * @param country - the country for which the generic tag set should be created
 * @param callback - function with error and tagSet as parmeters, tagSet would contain
 * the created tagSet 
 * @returns
 */
var createGenericTagSet = function(country,callback){
  
  if(typeof callback !== 'function') {
    return;
  }
  
  var getAllCountryTagsUrl = config.apcPath + 'resources/tags/tagsFor/country/' + country;   
  restler
  .get(getAllCountryTagsUrl)
  .on('success', function(data,response) {
    
    if(data && data.tag) {
      var genericTagSet = [];
      for(var t in data.tag) {
        genericTagSet = addTag(data.tag[t].tagText,genericTagSet);
      }
      genericTagSet = sortTagSet(genericTagSet);
      
      callback(null,genericTagSet);
    } else {
      callback('Malformed or empty data during tag retrieval for country ' + country,null);
    }
  })
  .on('fail', function(data,response) {
    callback('pTag: External server error ' + response.statusCode + ' during ' + country + ' tag set retrieval',null);
  })
  .on('error', function(data,response) {
    callback('pTag: Error ' + data.toString() + ' during ' + country + ' tag set retrieval',null);
  });;
};

/**
 * Retrieves a country specific generic tag set 
 * @param req
 * @param callback
 * @returns generic tag set
 */
var getGenericTagSet = function(req,callback) {
  
  if(typeof callback !== 'function') {
    return;
  }
  
  var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
  getClientCountry(ip, function(error,country) {
    if(country) {
      console.log('get client country: ' + country);
      //Check if a general tag set for this country is all ready created
      client.hgetall(country + 'TagSet', function (err, tagSet) {
        //if not: create it 
        if(helper.isObjectEmpty(tagSet)) {
          console.log('create initial ' + country + ' tag set...');
          createGenericTagSet(country, function(error, tagSet) {
            if(!error) {
              //Save country specific tag set for later use
              client.hmset(country + 'TagSet', 'tags', JSON.stringify(tagSet), function(err, obj) {
                if(err) {
                  console.log('Error while saving ' + country + 'TagSet: ' + err);
                } else {
                  console.log(country + 'TagSet successfully saved.');
                }
              });
              callback(null,{'name' : country + 'TagSet', 'data' : tagSet});
            } else {
              callback(error,null);
            }
          });
        //otherwise: parse it from redis store
        } else {
          console.log('got tags from redis database.');
          try{
            tagSet = JSON.parse(tagSet.tags);
          } catch(e) {
            tagSet = [];    
          }
          callback(null,{'name' : country + 'TagSet', 'data' : tagSet});
        }
      }); //end hgetall
    } else {
      callback('Client country could not be detected. (' + error + ')',{});
    } //end if country
  });
};

/**
 * Implements the automatic tag extraction algorithm per user 
 * @param req
 * @param callback
 * @returns personalized user tag set
 */
var getUserTagSet = function(req,callback) {
  
  if(typeof callback !== 'function') {
    return;
  }
  
  var sessionStore = helper.getSessionStore(req,false);
  var userId = sessionStore.user.userId;
  var getAllQueryTagsUrl = config.apcPath + 'resources/tags/tagsFor/' + userId + '/query/all';
  
  //Check if a user tag set is already created for this user
  if(!sessionStore.user.tagSet) {
    //if not create it
    restler
    .get(getAllQueryTagsUrl)
    .on('success', function(data,response) {
      if(data && data.tags) {
        var userTagSet = [];
        for(var t in data.tags) {
          //Skip two letter tags
          if(data.tags[t].tagText.length < 3) {
            continue;
          }     
          //Skip short number tags
          if(!isNaN(parseFloat(data.tags[t].tagText)) && isFinite(data.tags[t].tagText)) {
            continue;
          }
          //calculate tag relevance
          var relevance = 1 + (0.2 * (parseInt(data.tags[t].tagFreq) - 1));
          userTagSet = addTag(data.tags[t].tagText,userTagSet,relevance);
        }
        //Store user tag set in session for later use
        sessionStore.user.tagSet = sortTagSet(userTagSet);
      } else {
        callback('Malformed or empty data during tag retrieval ' + userId,null);
      }
    })
    .on('fail', function(data,response) {
      callback('pTag: External server error ' + response.statusCode + ' during query tags retrieval for ' + userId,null);
    })
    .on('error', function(data,response) {
      callback('pTag: Error ' + data.toString() + ' during query tags retrieval for ' + userId,null);
    }); 
  }
  
  callback(null,{ 'name' : userId, 'data' : sessionStore.user.tagSet});
};

/**
 * 
 * @param result
 * @returns
 */
var getResultTags = function(result) {
  
  var resultTagSet = [];
  
  if(!result || typeof result !== 'object') {
    return resultTagSet;
  }
  
  try {
    for(var i=0; i < result.documentList.length; i++) {
      var docTags = result.documentList[i].tags;
      for(var t=0; t < docTags.length; t++) {
        resultTagSet = addTag(docTags[t],resultTagSet);
      }
    }
    resultTagSet = sortTagSet(resultTagSet);
  } catch(e) {
    console.log('Error during getResultTags: ' + e.toString());
  }
  return resultTagSet;
};

/**
 * 
 * @param resultTags
 * @param userTags
 * @returns filterTags
 */
var getFilterTags = function(resultTags, userTags) {
  
  var filterTags = [];
  
  if(resultTags.length < 1 || userTags.length < 1) {
    return filterTags;
  }
  
  for(var u=0; u < userTags.length; u++) {
    for(var r=0; r < resultTags.length; r++) {
      if(userTags[u].name.toLowerCase() === resultTags[r].name.toLowerCase()) {
        filterTags = addTag(userTags[u].name,filterTags,userTags[u].relevance + resultTags[r].relevance);
      }
    }
  }
  
  if(filterTags.length < filterTagSetSize) {
    for(var r=0; r < resultTags.length; r++) {
      filterTags = addTag(resultTags[r].name,filterTags);
      if(filterTags.length === filterTagSetSize) {
        break;
      }
    }
  }
  
  return sortTagSet(filterTags);
};

/**
 *  -----------------------------------------------------------------------------
 *  Public Functions
 *  -----------------------------------------------------------------------------
 */

/**
 * Initializes the pTag component.
 * Mainly creates a connection to the redis store.
 */
var initialize = function() {
  client = redis.createClient();
  client.on('error', function (err) {
    console.log('pTag Redis Error: ' + err);
  }); 
};

/**
 * updateGenericTagSet update function
 * 
 * Updates the client's generic country tag set as soon
 * as a query is finished by the user and queryData can be provided. 
 * 
 * @param req - the express or connect request object
 * @param queryData - object containing all session saved query and result data
 * @returns null;
 */
var updateGenericTagSet = function(req, queryData) {
  console.log('updateGenericTagSet called...');
  
  var tags = extractTags(queryData);
  
  if(tags.length > 0) {
    //Get current generic tag set
    getGenericTagSet(req, function(error, tagSet) {
      if(!tagSet || typeof tagSet !== 'object') {
        return;
      }
      for(var t in tags) {
        tagSet.data = addTag(tags[t],tagSet.data);
      }
      tagSet.data = sortTagSet(tagSet.data);
      
      //Save the new tag set to the redis store
      client.hmset(tagSet.name, 'tags', JSON.stringify(tagSet.data),function(err, obj) {
        if(err) {
          console.log('Error while updating ' + tagSet.name + ': ' + err);
        } else {
          console.log(tagSet.name + ' successfully updated.');
        }
      });
    });
  }
};

/**
 * tagRecommendations function
 * 
 * This method generates tag recommendations for search queries based on a user profile. 
 * The user profile is gathered through the provided user ID.
 * 
 * @param request object containing get key: userId
 * @param repsonse object 
 */
var tagRecommendations = function(req, res){
	console.log('tagRecommendations function called...');
	
	var callback = function(error, tagSet) {
	  
	  var userTags = [];
	  
	  if(!error) {
	    userTags = normalizeTagSet(sortTagSet(tagSet.data.slice(0,tagSetSize),'name'));
	  } else {
	    console.log('Error while retrieving tag recommendations: ' + error);
	  } 
	  
	  res.send(JSON.stringify(userTags));
  };
	
	if(helper.isGuest(req)) {
	  getGenericTagSet(req,callback);
	} else {
	  getUserTagSet(req,callback);
	}
	
	//Dummy code
	/*
	var id = 0;
	var userKey = '';
	
	if(req.session.musebag.user.userId) {
	  userKey = req.session.musebag.user.userId.substr(0,req.session.musebag.user.userId.indexOf('@'));
	} 
	
	var userTags = tags[userKey] ? tags[userKey] : tags['familie.etzold'];
	res.send(JSON.stringify(userTags));
  */
};

/**
 * filterTags function
 * 
 * This method generates tag recommendations as filter tags for a given result set 
 * based on a user profile. A user ID as well as the textual parts of the user query 
 * needs to be provided.
 * 
 * @param request object containing get keys: resultSetTags
 * @param repsonse object
 */
var filterTags = function(req, res){
	
  console.log('filterTags function called...');

  var sessionStore = helper.getSessionStore(req,false);
  var resultTags = getResultTags(sessionStore.queries[sessionStore.queries.length-1].result.raw);
  
  var callback = function(error, tagSet) {
    
    var filterTags = [];
      
    if(!error) {
      filterTags = getFilterTags(resultTags,tagSet.data);
    } else {
      console.log('Error while retrieving filter tags: ' + error);
    } 
    
    res.send(JSON.stringify(filterTags));
  };
  
  if(helper.isGuest(req)) {
    getGenericTagSet(req,callback);
  } else {
    getUserTagSet(req,callback);
  }
};

/**
 * resultTagRecommendations function
 * 
 * Serves a personalised tag list, specific for the requested result item. 
 * To be used before the �Download� event of a result item.
 * 
 * @param request object containing keys: userId, query, resultItemTags
 * @param repsonse object 
 */
var resultTagRecommendations = function(req, res){
  
	var tags = ['tag1','tag2','tag3','tag4','tag5','tag6','tag7','tag8','tag9','tag10'];	
	
	res.send(JSON.stringify(tags));
};

/**
 * tag function
 * 
 * Stores the provided tag in the RUCoD header for the provided Content Object provided 
 * via the resultItemID. To be used if a user supplies tags.
 * 
 * @param request object containing get keys: userId, tags, resultItemId
 * @param repsonse object 
 */
var tag = function(req, res){
  
  var data = req.body;
  
	var stored = false;
	//storeUserTags(RUCoDID,Tags) data.tags
	var rucodMangerUrl = "http://www.isearch-project.eu/rmn/storeUserTags?" 
		                 + "rucodid=" + data.resultItemId 
		                 + "&tags=" + data.tags;
	
	//Use restler to post the data to external RUCoD manager
	
	//Return if the request succeeded or not
	res.send(JSON.stringify({'success' : stored}));
};

/**
 * implicitTags function
 * 
 * Derives a tag for the resultItem based on the query and user profile and stores it in the 
 * referring RUCoD. To be used if a �Download� event occurs without a user specified tag.
 * 
 * @param request object containing keys: userId, query, resultItemId
 * @param repsonse object
 */
var implicitTags = function(req, res){
	
  var stored = false;
	var data = req.body;
	
	//Extract the tags
	//var queryTags = data.query.split(',');
	//Filter user relevant tags
	//...
	
	//Store tags with RUCoD Manager 
	var rucodMangerURL = "http://www.isearch-project.eu/rmn/storeUserTags?" 
		               + "rucodid=" + data.resultItemId + "&" 
		               + "tags=" + data.tags;
	
	//Use restler to post the data to external RUCoD manager
	
	//Return if the request succeeded or not
	res.send(JSON.stringify({'success' : stored}));
};

//Export all public available functions
exports.initialize               = initialize;
exports.updateGenericTagSet      = updateGenericTagSet;
exports.tagRecommendations       = tagRecommendations;
exports.filterTags               = filterTags;
exports.resultTagRecommendations = resultTagRecommendations;
exports.tag                      = tag;
exports.implicitTags             = implicitTags;