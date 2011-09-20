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

exports.tagRecommendations = function(options, callback){
	var tags = ['tag1','tag2','tag3','tag4','tag5','tag6','tag7','tag8','tag9','tag10'];
	callback(null, tags);
};
//Documentation for tagRecommendations function
exports.tagRecommendations.description = "This method generates tag recommendations for search queries based on a user profile. The user profile is gathered through the provided user ID.";
exports.tagRecommendations.schema = {
  userID: { 
    type: 'int',
    optional: false 
  }
};

exports.filterTags = function(options, callback){
  setTimeout(function(){
    callback(null, 'pong');
  }, 2000);
};
//Documentation for ping function
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
  resultSet: { 
    type: 'object',
    optional: false 
  }
};