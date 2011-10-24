/*
 * This script collects and manages all data for a content objects
 */
var step     = require('./step');
    sketchup = require('./sketchup');
    modeldb  = require('./modeldb');
    dbpedia  = require('./dbpedia');
    flickr   = require('./flickr');
    youtube  = require('./youtube'),
    sound    = require('./freesound'),
    weather  = require('./wunderground');

var Fetch = function() {	
};

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

		//For each result item
		for(var i=0; i < r.length; i++) {
			//For each relevant query word
			for(var w=0; w < qwords.length; w++) {
				//Find if the query word exists in the result item name
				var rx = new RegExp(qwords[w],"gi");
				//And add a point for this result item if so	
				if(r[i].Name.search(rx) !== -1) {
					matchList[i] = (isNaN(matchList[i]) ? 1 : matchList[i] + 1);
				} else {
					matchList[i] = 0;
				}
			}
		}
		
		var joinedQuery = qwords.join(' ');
		var realMatches = 0;
		
		var w1 = [0,0], 
		    w2 = [0,0];
		var wd1 = 1000, 
		    wd2 = 1000;
		
		for(var m=0; m < matchList.length; m++) {
			if(matchList[m] > 0) {
				realMatches++;
			}
		}

		//Check what result item has at least the two highest matching result item indexes with the query
		if(realMatches > 1) {
			for(var i=0; i < matchList.length; i++) {
				if(matchList[i] > w1[1]) {
					w2 = new Array(w1[0],w1[1]);
					w1[0] = i;
					w1[1] = matchList[i];
				}
			}

			//Get most similar candidate with a Levenstein distance calculation
			wd1 = levenDistance(r[w1[0]].Name,joinedQuery);
			wd2 = levenDistance(r[w2[0]].Name,joinedQuery);
			
		} else {
			
			var td = 0;
			for(var i=0; i < r.length; i++) {
				td = levenDistance(r[i].Name,joinedQuery);
				if(td < wd1) {
					wd2 = wd1;
					wd1 = td;
				}
			}
		}

		//return the closest result item
		if( wd1 <= wd2 ){
			callback(null, r[w1[0]]);
		} else {
			callback(null, r[w2[0]]);
		}
	}
};

Fetch.prototype.getPart = function(type, query, callback) {
	
	if(callback && (!type || !query)) {
		callback('Missing parameter', []);
	}
	
	var context = this;
	
	switch(type) {
		case '3d':
			step(
				function init() {
					//Fetch 3d model data
					sketchup.fetchThreed(query, this);
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
					flickr.fetchImage(query,0,this);
				},
				function getWeather(error,data) {
					//Be sure to have data before going on
					if(!error && data.length < 1) {
						error = 'No data could be retrieved.';
					}
					if(error) {
						console.log('error: ' + error);
						callback(error,[]);
					} else {
						weather.fetchWeather(data,this);
					}	
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
						
						context.cleanResult(data,function(result) {
							callback(null,result);
						});
					}
				}
			);
			break;
		case 'video':
			step(
				function init() {
					//Get videos for the given query
					youtube.fetchVideo(query,this);
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
					sound.fetchSound(query, true, this);
				},
				function getWeather(error,data) {
					if(error) {
						console.log('error: ' + error);
						callback(error,[]);
					} else {
						if(data.length < 1) {
							sound.fetchSound(query, false, this);
						} else {
							weather.fetchWeather(data,this);
						}
					}
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
					
						context.cleanResult(data,function(result) {
							callback(null,result);
						});
					}
				}
			);
			break;
	}
};

Fetch.prototype.get = function(keyword, categoryPath, index, automatic, callback) {
	
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
	
	var context = this;
	
	//Step through the content object data collection
	step(
		function getModelData() {	
			
			console.log('1. Start fetching Content Object data for 3D models with query "' + keyword + '"');
			sketchup.fetchThreed(keyword, this);
		},
		function getTextData(error,data) {
			
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
				if(automatic === 1) {
					//Push the best matching 3D model to the files array of the content object
					context.getBestMatch(contentObject.Name, data, function(error, model) {
						if(error || typeof model !== 'object') {
							contentObject.Files.push(data[0]);
						} else {
							contentObject.Files.push(model);
						}
					});
					
				} else {
					for(var m=0; m < data.length; m++) {
						contentObject.Files.push(data[m]);
					}
				}
			}
			
			//Even if nothing was found for 3D, go on ant try to find some text
			var dbpediaQuery = contentObject.Name;
			
			//Fetch free text data for the model
			dbpedia.fetchText(dbpediaQuery, '', this);
		},
		function getImageData(error,data) {
			//Be sure to have data before going on
			if(!error && data.length < 1) {
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
			
			flickr.fetchImage(flickrQuery,1,this);
		},
		function getImageWeatherData(error,data) {
			//Be sure to have data before going on
			if(!error && data.length < 1) {
				error = 'No image data could be retrieved.';
			}
			if(error) {
				console.log('flickr error: '+error);
				return [];
			}
			console.log('4. Flickr images fetched!');
			//Get weather data for images
			weather.fetchWeather(data,this);
		},
		function getVideoData(error,data) {
			//Be sure to have data before going on
			if(!error && data.length < 1) {
				error = 'No weather data could be retrieved.';
			}
			if(error) {
				console.log('weather error: '+error);
			} else {
				console.log('4.1. Weather data for flickr images fetched!');
				
				context.cleanResult(data,function(result) {

					//If automatic mode is on, than just store the first retrieved image (e.g. the most relevant)
					if(automatic === 1) {
						//Push the best matching image to the files array of the content object
						context.getBestMatch(contentObject.Name, result, function(error, image) {
							if(error || typeof image !== 'object') {
								contentObject.Files.push(result[0]);
							} else {
								contentObject.Files.push(image);
							}
						});
						
					} else {
						for(var w=0; w < result.length; w++) {
							contentObject.Files.push(result[w]);
						}
					}
				});
			}
			
			//Some query adjustments for youtube
			var youtubeQuery = contentObject.Name;
			
			if(queryAdjustment[contentObject.Category]) {
				youtubeQuery += queryAdjustment[contentObject.Category];
			} 
			
			//Get videos for content object
			youtube.fetchVideo(youtubeQuery,this);
		},
		function getSoundData(error,data) {
			//Be sure to have data before going on
			if(!error && data.length < 1) {
				error = 'No video data could be retrieved.';
			}
			if(error) {
				console.log('youtube error: '+error);
			} else {
				console.log('5. YouTube data fetched!');
				
				//If automatic mode is on, than just store the first retrieved video (e.g. the most relevant)
				if(automatic === 1) {
					//Push the best matching video to the files array of the content object
					context.getBestMatch(contentObject.Name, data, function(error, video) {
						if(error || typeof video !== 'object') {
							contentObject.Files.push(data[0]);
						} else {
							contentObject.Files.push(video);
						}
					});
				} else {
					for(var y=0; y < data.length; y++) {
						contentObject.Files.push(data[y]);
					}
				}
			}
			var soundQuery = contentObject.Name; 
			
			//Get audio for content object
			sound.fetchSound(soundQuery, true, this);
		},
		function evaluateSoundData(error,data) {
			if(error) {
				console.log('sound error: '+error);
			}
			
			if(data.length < 1) {
				
				var soundQuery = contentObject.Name; 
				
				//Get audio for content object
				sound.fetchSound(soundQuery, false, this);
			} else {
				console.log('5.1 Sound data with geo information fetched!');
				//Get weather data for sounds
				weather.fetchWeather(data,this);
			}
		},
		function finalizeData(error,data) {
			//Be sure to have data before going on
			if(!error && data.length < 1) {
				error = 'No composed sound data could be retrieved.';
			}
			if(error) {
				console.log('sound error: '+error);
			} else { 
			
				console.log('6. Composed Sound data fetched!');
				
				context.cleanResult(data,function(result) {
					//If automatic mode is on, than just store the first retrieved sound (e.g. the most relevant)
					if(automatic === 1) {
						//Push the best matching sound to the files array of the content object
						context.getBestMatch(contentObject.Name, result, function(error, sound) {
							if(error || typeof sound !== 'object') {
								contentObject.Files.push(result[0]);
							} else {
								contentObject.Files.push(sound);
							}
						});
	
					} else {
						for(var s=0; s < result.length; s++) {
							contentObject.Files.push(result[s]);
						}
					}
				});
			}
			
			delete contentObject.Category;
			
			console.log('Finished!');
			
			//Return the collected content object
			callback(null, contentObject);
		}
	);
};    

//Hook into commonJS module systems
if (typeof module !== 'undefined' && "exports" in module) {
  module.exports.Fetch = Fetch;
}   