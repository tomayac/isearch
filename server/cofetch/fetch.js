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

Fetch.prototype.getPart = function(type, query, callback) {
	
	if(callback && (!type || !query)) {
		callback('Missing parameter', []);
	}
	
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
						var result = [];
						for(var w=0; w < data.length; w++) {
							result.push(data[w][0]);
						}
						
						callback(null,result);
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
					
						var result = [];
						
						if(data[0][0]) {
							for(var w=0; w < data.length; w++) {
								result.push(data[w][0]);
							}
						} else {
							result = data;
						}
						callback(null,result);
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
				
				//If automatic mode is on, than just store the first retrieved model (e.g. the most relevant)
				if(automatic === 1) {
					//Push the 3D model to the files array of the content object
					contentObject.Files.push(data[0]);
				} else {
					for(var m=0; m < data.length; m++) {
						contentObject.Files.push(data[m]);
					}
				}
			}
			
			//Even if nothing was found for 3D, go on ant try to find some text
			var dbpediaQuery = contentObject.Name;
			
			//Fetch free text data for the model
			dbpedia.fetchText(dbpediaQuery, contentObject.Category, this);
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
				
				//If automatic mode is on, than just store the first retrieved image (e.g. the most relevant)
				if(automatic === 1) {
					contentObject.Files.push(data[0][0]);
				} else {
					for(var w=0; w < data.length; w++) {
						contentObject.Files.push(data[w][0]);
					}
				}
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
					contentObject.Files.push(data[0]);
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
				
				//If automatic mode is on, than just store the first retrieved sound (e.g. the most relevant)
				if(automatic === 1) {
					contentObject.Files.push(data[0]);
				} else {
					for(var s=0; s < data.length; s++) {
						contentObject.Files.push(data[s]);
					}
				}
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