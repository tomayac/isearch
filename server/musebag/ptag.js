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
var restler = require('restler');

/**
 * Global variables
 */
var user = ['kojomisch','julia.ziemens','stratos','petros','tomac','familie.etzold'];
var tags = [[['flight',1.0],['travel',1.5],['airplane',2.8],['sky',0.8],['rocket',1.0],['USA',0.9],['NASA',1.3],['space',1.8],['Apollo Program',1.2],['Saturn V',0.8],['Viking',1.0],['Space probes',1.8],['ISS',1.2]],
            [['trees',2.0],['nature',1.8],['enviromental landscaping',1.0],['green energy',1.5],['electric cars',0.6],['Renault',0.5],['tulip',0.7],['garden',1.0],['pine tree',1.2],['forest',0.9],['Kanada',2.0]],
            [['bike',0.9],['biker',1.5],['bicycle',0.6],['Harley Davidson',2.0],['Motorcycle',2.8],['speed',1.0],['sexyness',0.5],['A beast',0.9],['Vendors',2.0],['black',1.2],['round fuel tank',0.8],['Rocker',1.6]],
            [['red chairs',2.5],['room',1.5],['bright',2.0],['IKEA',1.0],['design furniture',2.8],['idea',0.8],['big room',0.6],['colorful',1.5],['home office',2.0],['interior',0.8],['furniture assembling',0.6]],
            [['shark',2.0],['fish',2.5],['dolphin',1.5],['Atlantic',1.0],['Fishing',0.8],['Diving',1.5],['dive license',0.6],['Pacific',1.5],['Hammerhead',2.0],['Hawaii',3.0],['Marlin',1.0],['Seahorse',1.8],['Best diving grounds',2.3]],
            [['WoW',3.0],['MMRPG Avatars',1.2],['Game avatar',1.5],['Knight',2.0],['Magican',2.5],['World of Warcraft',1.8],['Lost Chaos',1.0],['Forsaken World',0.8],['Elf',1.8],['Warrior',3.0],['Hunter avatar',2.2],['High level avatars',1.2],['Special characters',0.8]]];

/**
 *  -----------------------------------------------------------------------------
 *  Public Functions
 *  -----------------------------------------------------------------------------
 */

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
	
	var id = 0;
	
	if(req.params.userid.length > 3) {
	  id = user[req.params.userid] || 0;
	} 
	
	var userTags = tags[id];
	callback(null, userTags);
};

/**
 * filterTags function
 * 
 * This method generates tag recommendations as filter tags for a given result set 
 * based on a user profile. A user ID as well as the textual parts of the user query 
 * needs to be provided.
 * 
 * @param request object containing get keys: userId, query, resultSetTags
 * @param repsonse object
 */
var filterTags = function(req, res){
	
	var id = 1;
	if(req.params.userid > 0 && req.params.userid <= 6) {
		id = (req.params.userid-1);
	} 
	var userTags = tags[id];
	var filterTags = [];
	
	for(var c=0; c < 6; c++) {
		filterTags.push(userTags[Math.floor(Math.random()*(userTags.length + 1))]);
	}
	
	callback(null, filterTags);
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
	callback(null, tags);
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
	callback(null, stored);
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
	callback(null, stored);
};

//Export all public available functions
exports.tagRecommendations       = tagRecommendations;
exports.filterTags               = filterTags;
exports.resultTagRecommendations = resultTagRecommendations;
exports.tag                      = tag;
exports.implicitTags             = implicitTags;