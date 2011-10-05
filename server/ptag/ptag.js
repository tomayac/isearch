/**
 * @package pTag - Personal Content Tagging Component
 * 
 * @description This file exposes all functions dedicated to personal content tagging
 * within I-SEARCH.
 * 
 * @author Jonas Etzold
 * @company University of Applied Sciences Erfurt
 */
this.title = "pTag - Personal Content Tagging Service for I-SEARCH";
this.name = "pTag";
this.version = "0.1.0";
this.endpoint = "http://isearch.ai.fh-erfurt.de/ptag";

var tags = [['flight','travel','airplane','sky','rocket','USA','NASA','space','Apollo Program','Saturn V','Viking','Space probes','ISS'],
            ['trees','nature','enviromental landscaping','green energy','electric cars','Renault','tulip','garden','pine tree','forest','Kanada'],
            ['bike','biker','bicycle','Harley Davidson','Motorcycle','speed','sexyness','A beast','Vendors','black','round fuel tank','Rocker'],
            ['red chairs','room','bright','IKEA','design furniture','idea','big room','colorful','home office','interior','furniture assembling'],
            ['shark','fish','dolphin','Atlantic','Fishing','Diving','dive license','Pacific','Hammerhead','Hawaii','Marlin','Seahorse','Best diving grounds'],
            ['WoW','MMRPG Avatars','Game avatar','Knight','Magican','World of Warcraft','Lost Chaos','Forsaken World','Elf','Warrior','Hunter avatar','High level avatars','Special characters']];


/**
 * tagRecommendations function
 */
exports.tagRecommendations = function(options, callback){
	
	var id = 1;
	if(options.userID > 0 && options.userID <= 6) {
		id = (options.userID-1);
	} 
	var userTags = tags[id];
	
	callback(null, userTags);
};
//Documentation for tagRecommendations function
exports.tagRecommendations.description = "This method generates tag recommendations for search queries based on a user profile. The user profile is gathered through the provided user ID.";
exports.tagRecommendations.schema = {
  userID: { 
    type: 'int',
    optional: false 
  }
};

/**
 * filterTags function
 */
exports.filterTags = function(options, callback){
	
	var id = 1;
	if(options.userID > 0 && options.userID <= 6) {
		id = (options.userID-1);
	} 
	var userTags = tags[id];
	var filterTags = [];
	
	for(var c=0; c < 6; c++) {
		filterTags.push(userTags[Math.floor(Math.random()*(userTags.length + 1))]);
	}
	
	callback(null, filterTags);
};
//Documentation for filterTags function
exports.filterTags.description = "This method generates tag recommendations as filter tags for a given result set based on a user profile. A user ID as well as the textual parts of the user query needs to be provided.";
exports.filterTags.schema = {
  userID: { 
    type: 'int',
    optional: false 
  },
  query: { 
    type: 'string',
    optional: false 
  },
  resultSetTags: { 
    type: 'array',
    optional: false 
  }
};

/**
 * resultTagRecommendations function
 */
exports.resultTagRecommendations = function(options, callback){
	var tags = ['tag1','tag2','tag3','tag4','tag5','tag6','tag7','tag8','tag9','tag10'];
	callback(null, tags);
};
//Documentation for resultTagRecommendations function
exports.resultTagRecommendations.description = "Serves a personalised tag list, specific for the requested result item. To be used before the �Download� event of a result item.";
exports.resultTagRecommendations.schema = {
  userID: { 
    type: 'int',
    optional: false 
  },
  query: { 
    type: 'string',
    optional: false 
  },
  resultItemTags: { 
    type: 'array',
    optional: false 
  }
};

/**
 * tag function
 */
exports.tag = function(options, callback){
	var stored = false;
	//storeUserTags(RUCoDID,Tags) options.tags
	var rucodMangerUrl = "http://www.isearch-project.eu/rmn/storeUserTags?" 
		               + "rucodid=" + options.resultItemID + "&" 
		               + "tags=" + options.tags;
	
	//Use restler to post the data to external RUCoD manager
	
	//Return if the request succeeded or not
	callback(null, stored);
};
//Documentation for tag function
exports.tag.description = "Stores the provided tag in the RUCoD header for the provided Content Object provided via the resultItemID. To be used if a user supplies tags.";
exports.tag.schema = {
  userID: { 
    type: 'int',
    optional: false 
  },
  tags: { 
    type: 'string',
    optional: false 
  },
  resultItemID: { 
    type: 'string',
    optional: false 
  }
};

/**
 * implicitTags function
 */
exports.implicitTags = function(options, callback){
	var stored = false;
	//Extract the tags
	//var queryTags = options.query.split(',');
	//Filter user relevant tags
	//...
	
	//Store tags with RUCoD Manager 
	var rucodMangerURL = "http://www.isearch-project.eu/rmn/storeUserTags?" 
		               + "rucodid=" + options.resultItemID + "&" 
		               + "tags=" + options.tags;
	
	//Use restler to post the data to external RUCoD manager
	
	//Return if the request succeeded or not
	callback(null, stored);
};
//Documentation for implicitTags function
exports.implicitTags.description = "Derives a tag for the resultItem based on the query and user profile and stores it in the referring RUCoD. To be used if a �Download� event occurs without a user specified tag.";
exports.implicitTags.schema = {
  userID: { 
    type: 'int',
    optional: false 
  },
  query: { 
    type: 'string',
    optional: false 
  },
  resultItemID: { 
    type: 'string',
    optional: false 
  }
};