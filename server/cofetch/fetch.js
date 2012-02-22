/*
 * This script collects and manages all data for a content objects
 */
var step     = require('./lib/step');
    sketchup = require('./services/sketchup');
    modeldb  = require('./services/modeldb');
    dbpedia  = require('./services/dbpedia');
    flickr   = require('./services/flickr');
    youtube  = require('./services/youtube'),
    sound    = require('./services/freesound'),
    weather  = require('./services/wunderground'),
    rucod    = require('./store');

var Fetch = function() {	
};

/**
 *  Helper function for cleaning an unnecessary deep nested result set     
 **/
Fetch.prototype.cleanResult = function(result, callback) {
	var cleanResult = new Array();
	
	for(var i=0; i < result.length; i++) {
		if(typeof result[i][0] === 'object') {
			cleanResult[i] = result[i][0];
		}
	}
	
	if(cleanResult.length != result.length) {
		callback(result);
	} else {
		callback(cleanResult);
	}
};

/**
 *  Helper function for automatically getting the best matches within a result
 *  set based on their titles and a improved Levensthein method.     
 **/
Fetch.prototype.getBestMatch = function(query, results, callback) {
	
	var levenDistance = function(v1, v2){
        d = [];
        
        for( i=0; i < v1.length; i++)
				d[i] = [];
				
		if (v1[0] != v2[0])
			d[0][0] = 1;
		else
			d[0][0] = 0;

        for( i=1; i < v1.length; i++)
            d[i][0] = d[i-1][0] + 1;
		
        for( j=1; j < v2.length; j++)
			d[0][j] = d[0][j-1] + 1;
            
        for( i=1; i < v1.length; i++)
		{
            for( j=1; j < v2.length; j++)
            {
                cost = 0;
                if (v1[i] != v2[j])
                    cost = 1;
                
                d[i][j] = d[i-1][j] + 1;
                if ( d[i][j] > d[i][j-1]+1 ) d[i][j] = d[i][j-1] + 1;
                if ( d[i][j] > d[i-1][j-1]+cost ) d[i][j] = d[i-1][j-1] + cost;
            }
		}

        return d[v1.length-1][v2.length-1] || 0;
    };
	
	var q = query || '';
	var r = results || [];
	var matchList = [];
	var diffList = [];
	
	if(q.length < 3 || r.length < 1) {
		callback('Missing Input', null);
	} else {
		
		
		//Get all words of query
		var qwords = q.split(" ");
		//Remove query words shorter than 3 characters (e.g. "is" or "a")
		var removeShort = function(words) {
			for(var i=0; i < words.length; i++) {
				if(words[i].length < 3) {
					words.splice(i,1);
					removeShort(words);
				}
			}
			return words;
		};
		qwords = removeShort(qwords);
		
		//1. First round - generate a list of occurrences of the query words within the result titles 
		
		//For each result item
		for(var i=0; i < r.length; i++) {
			
			matchList[i] = 0;
			
			//For each relevant query word
			for(var w=0; w < qwords.length; w++) {
				//Find if the query word exists in the result item name
				var rx = new RegExp(qwords[w],"gi");
				//And add a point for this result item if so	
				if(r[i].Name.search(rx) !== -1) {
					matchList[i] = (isNaN(matchList[i]) ? 1 : matchList[i] + 1);
				}
			}
		}
		
		//2. Second round - generate a list of differences between query and result titles
		
		var joinedQuery = qwords.join(' ');
		
		//For each result item
		for(var res=0; res < r.length; res++) {
			diffList[res] = 0;
			diffList[res] = levenDistance(r[res].Name.toLowerCase(),joinedQuery.toLowerCase());
		}
		
		//3. Third round - generate the result with the two most fitting result items
		
		var w1 = {Id: -1, Matches: 0, Diff: 1000}, 
	        w2 = {Id: -1, Matches: 0, Diff: 1000};
		
		for(var i=0; i < r.length; i++) {
			if(matchList[i] >= w1.Matches && diffList[i] < w1.Diff && diffList[i] <= 30) {
				if(w1.Id > -1) {
					w2.Id = w1.Id;
					w2.Matches = w1.Matches;
					w2.Diff = w1.Diff;
				}
				w1.Matches = matchList[i];
				w1.Diff = diffList[i];
				w1.Id = i;
			}
		}
		
		//4. Test the results
		
		//If we have both winners, return both in an array
		if(w1.Id > -1 && w2.Id > -1) {
			callback(null, new Array(r[w1.Id],r[w2.Id]));
		//Else just return the available winner	
		} else if(w1.Id > -1){
			callback(null, new Array(r[w1.Id]));
		} else if(w2.Id > -1) {
			callback(null, new Array(r[w2.Id]));	
		//or nothing	
		} else {
			callback(null, null);
		}	
	}
};

/**
 *  Fetches results for a specific media type as part of a Content Object      
 **/
Fetch.prototype.getPart = function(type, query, page, gps, callback) {
	
	if(callback && (!type || !query)) {
		callback('Missing parameter', []);
	}
	
	var context = this;
	
	switch(type) {
		case '3d':
			step(
				function init() {
					//Fetch 3d model data
					sketchup.fetchThreed(query, page, this);
				},
				function getResult(error,data) {
					//Be sure to have data before going on
					if(!error && data.length < 1) {
						error = 'No data could be retrieved.';
					}
					if(error) {
						console.log('error: ' + error);
						callback(error,[]);
					} else {
						callback(null,data);
					}	
				}
			);
			break;
		case 'text':
			step(
				function init() {
					//Fetch free text data for the model
					dbpedia.fetchText(query, '', this);
				},
				function getResult(error,data) {
					//Be sure to have data before going on
					if(!error && data.length < 1) {
						error = 'No data could be retrieved.';
					}
					if(error) {
						console.log('error: ' + error);
						callback(error,[]);
					} else {
						callback(null,data);
					}	
				}
			);
			break;
		case 'image':
			step(
				function init() {
					//Fetch images for the given query
					flickr.fetchImage(query, gps, page, this);
				},
				function getResult(error,data) {
					//Be sure to have data before going on
					if(!error && data.length < 1) {
						error = 'No data could be retrieved.';
					}
					if(error) {
						console.log('error: ' + error);
						callback(error,[]);
					} else {
						callback(null,data);
					}
				}
			);
			break;
		case 'video':
			step(
				function init() {
					//Get videos for the given query
					youtube.fetchVideo(query, gps, page, this);
				},
				function getResult(error,data) {
					//Be sure to have data before going on
					if(!error && data.length < 1) {
						error = 'No data could be retrieved.';
					}
					if(error) {
						console.log('error: ' + error);
						callback(error,[]);
					} else {
						callback(null,data);
					}	
				}
			);
			break;
		case 'sound':
			step(
				function init() {
					//Get audio for the given query
					sound.fetchSound(query, gps, page, this);
				},
				function getResult(error, data) {
					//Be sure to have data before going on
					if(!error && data.length < 1) {
						error = 'No data could be retrieved.';
					}
					if(error) {
						console.log('error: ' + error);
						callback(error,[]);
					} else {
						callback(null,data);
					}
				}
			);
			break;
	}
};

/**
 *  Main fetch function. Collects multimedia data for a specific keyword from
 *  different public web services to create a content object in RUCoD format.
 *  This final creation process of a RUCoD file based on the retrieved data
 *  can be complete automatic or semi-automatic through a revisioning step by the
 *  user who triggered the content search process.         
 **/
Fetch.prototype.get = function(keyword, categoryPath, index, automatic, callback) {
	
	var context = this;
	keyword = keyword.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	
	//Check whether we need to fetch the data or can just retrieved a previous stored JSON object
	rucod.exists(keyword, categoryPath, function(data) {
	  if(data != undefined) {
	    console.log("LOADED: query data for '" + keyword +"'.");
		  callback(null,data,index);
	  } else {
  		console.log("LOAD: data for query '" + keyword +"'...");
  	
  		var queryAdjustment = {};
  		queryAdjustment['Fish'] = ' underwater';
  		
  		var category = categoryPath.split("/");
  		
  		//content object data storage
  		var contentObject = {
  				  "ID": index + '-' + new Date().getTime(),
  				  "Name": keyword.toLowerCase().replace(/\b[a-z]/g, function(letter) {
  					    	return letter.toUpperCase();
  				  		  }),
  				  "Screenshot": "",
  				  "Category": category[category.length-1],
  				  "CategoryPath": categoryPath, 
  				  "Files": []
  		};
  		
  		//console.log("FetchData: k=" + keyword + " c=" + categoryPath + " i=" + index +" a=" + automatic); 		
  		try {
  			//Step through the content object data collection
  			step(
  				function initialize() {	
  					
  					console.log('1. Start fetching Content Object data for 3D models with query "' + keyword + '"');
  					sketchup.fetchThreed(keyword, 1, this);
  				},
  				function getModelData(error,data) {
  					
  					//Be sure to have data before storing something which is not there
  					if(!error && data.length < 1) {
  						error = 'No model data could be retrieved.';
  					}
  					if(error) {
  						console.log('SketchUp error: ' + error);
  					} else {
  						//Nothing went wrong so possibly we have something to store
  						console.log('2. 3D model data fetched!');
  						
  						//Use the preview image of the first 3D model as preview for the content object
  						contentObject.Screenshot = data[0].Preview;
  						
  						//If automatic mode is on, than just store the best matching retrieved model (e.g. the most relevant)
  						if(automatic === true) {
  							//Push the best matching 3D model to the files array of the content object
  							context.getBestMatch(contentObject.Name, data, function(error, matches) {
  								if(!error && matches !== null) {
  									for(var m=0; m < matches.length; m++) {
  										contentObject.Files.push(matches[m]);
  									}
  								} 
  							});
  							
  						} else {
  							for(var m=0; m < data.length; m++) {
  								contentObject.Files.push(data[m]);
  							}
  						}
  					}  					
  					//Even if nothing was found for 3D, go on and try to find some text
  					var dbpediaQuery = contentObject.Name;
  					
  					//Fetch free text data for the model
  					dbpedia.fetchText(dbpediaQuery, '', this);
  				},
  				function getTextData(error,data) {
  					//Be sure to have data before going on
  					if(!error && data[0].Type === undefined) {
  						error = 'No text data could be retrieved.';
  					}
  					if(error) {
  						console.log('dbpedia error: '+error);
  					} else {
  						
  						console.log('3. Text data fetched!');
  						//Push the text data in the Files array because it will be treated as MediaItem in RUCoD
  						contentObject.Files.push(data[0]);
  					}
  					
  					var flickrQuery = contentObject.Name;
  					
  					if (queryAdjustment[contentObject.Category]) {
  						flickrQuery += queryAdjustment[contentObject.Category];
  					}
  					
  					flickr.fetchImage(flickrQuery, 1, 1, this);
  				},
  				function getImageData(error,data) {
  					//Be sure to have data before going on
  					if(!error && data.length < 1) {
  						error = 'No image data could be retrieved.';
  					}
  					if(error) {
  						console.log('flickr error: '+error);
  						return [];
  					}
  					console.log('4. Flickr images fetched!');
  					
  				  //If automatic mode is on, than just store the first retrieved image (e.g. the most relevant)
            if(automatic === true) {
              //Push the best matching image to the files array of the content object
              context.getBestMatch(contentObject.Name, data, function(error, matches) {
                
                if(!error && matches !== null) {
                  for(var m=0; m < matches.length; m++) {
                    contentObject.Files.push(matches[m]);
                  }
                } 
              });
              
            } else {
              for(var i=0; i < data.length; i++) {
                contentObject.Files.push(data[i]);
              }
            } //end automatic if 
            
            //Some query adjustments for youtube
            var youtubeQuery = contentObject.Name;
            
            if(queryAdjustment[contentObject.Category]) {
              youtubeQuery += queryAdjustment[contentObject.Category];
            } 
            
            //Get videos for content object
            youtube.fetchVideo(youtubeQuery, 1, 1, this);
  				},
  				function getVideoData(error,data) {
  				  //Be sure to have data before going on
            if(!error && data.length < 1) {
              error = 'No video data could be retrieved.';
            }
            if(error) {
              console.log('YouTube error: '+error);
            } else {
              console.log('5. YouTube data fetched!');
              
              //If automatic mode is on, than just store the first retrieved video (e.g. the most relevant)
              if(automatic === true) {
                //Push the best matching video to the files array of the content object
                context.getBestMatch(contentObject.Name, data, function(error, matches) {
        
                  if(!error && matches !== null) {
                    for(var m=0; m < matches.length; m++) {
                      contentObject.Files.push(matches[m]);
                    }
                  } 
                });
              } else {
                for(var y=0; y < data.length; y++) {
                  contentObject.Files.push(data[y]);
                }
              } // end automatic if
            }
            
            var soundQuery = contentObject.Name; 
            //Get audio for content object
            sound.fetchSound(soundQuery, 1, 1, this);
  				},
  				function getSoundData(error,data) {
  					if(error) {
  						console.log('Freesound error: '+error);
  					}
  					
  					if(data.length < 1) {
  						var soundQuery = contentObject.Name; 
  						//Get audio for content object
  						sound.fetchSound(soundQuery, 0, this);
  					} else {
  						return data;
  					}
  				},
  				function finalize(error,data) {
  					//Be sure to have data before going on
  					if(!error && data.length < 1) {
  						error = 'No sound data could be retrieved.';
  					}
  					if(error) {
  						console.log('Freesound error: '+error);
  					} else { 
  					
  						console.log('6. Composed Sound data fetched!');
  						
  					  //If automatic mode is on, than just store the first retrieved sound (e.g. the most relevant)
              if(automatic === true) {
                //Push the best matching sound to the files array of the content object
                context.getBestMatch(contentObject.Name, data, function(error, matches) {
    
                  if(!error && matches !== null) {
                    for(var m=0; m < matches.length; m++) {
                      contentObject.Files.push(matches[m]);
                    }
                  } 
                });
      
              } else {
                for(var s=0; s < data.length; s++) {
                  contentObject.Files.push(data[s]);
                }
              } //end automatic if
  					}
  					
  					delete contentObject.Category;
  					
  					console.log('Finished with CO "' + contentObject.Name + '"!');
  					
  					//Return the collected content object
  					callback(null, contentObject, index);
  				}
  			); //End step function
  		} catch(e) {
  			callback(e.message, null, index);
  		}
  	} //End exists if
	}); //End rucod.exists function
};    

//Hook into commonJS module systems
if (typeof module !== 'undefined' && "exports" in module) {
  module.exports.Fetch = Fetch;
}   