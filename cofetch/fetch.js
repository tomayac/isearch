/*
 * This script collects and manages all data for a content objects
 */
var step    = require('step');
    modeldb = require('./modeldb');
    dbpedia = require('./dbpedia');
    flickr  = require('./flickr');
    youtube = require('./youtube'),
    sound   = require('./freesound'),
    weather = require('./wunderground');

var Fetch = function() {	
};  

Fetch.prototype.get = function(index, queries, callback) {
	
	var userQuery = {
			'Text':queries.Text ? queries.Text : null, 
			'Image':queries.Image ? queries.Image : null,
			'Video':queries.Video ? queries.Video : null,
			'Sound':queries.Sound ? queries.Sound : null
	};
	
	var queryAdjustment = new Array();
	    queryAdjustment['Fish'] = ' underwater';
	
	//content object data storage
	var contentObject = {
			  "ID": index,
			  "Name": "",
			  "Screenshot": "",
			  "Category": "",
			  "CategoryPath": "", 
			  "Files": []
	};
	
	//Step through the content object data collection
	step(
		function getModelData() {	
			console.log('1. Start fetching Content Object data for 3D model with index '+index);
			modeldb.fetchModel(index, this);
		},
		function getTextData(error,data) {
			if(error) {
				console.log('modeldb error: '+error);
				return;
			}
			
			console.log('2. Model data fetched!');

			contentObject.Name = data[0].Name;
			contentObject.Screenshot = data[0].Preview;
			contentObject.CategoryPath = data[0].CategoryPath;
			contentObject.Category = data[0].Category;
			
			//We wont need the category path in the individual files
			delete data[0].Category;
			delete data[0].CategoryPath;
			
			//Push the 3D model to the files array of the content object
			contentObject.Files.push(data[0]);
			
			var dbpediaQuery = contentObject.Name;
			
			if(userQuery.Text) {
				dbpediaQuery = userQuery.Text;
			}
			
			//Fetch free text data for the model
			dbpedia.fetchText(contentObject.Name, contentObject.Category, this);
		},
		function getImageData(error,data) {
			if(error) {
				console.log('dbpedia error: '+error);
				return;
			}
			
			console.log('3. Text data fetched!');
			//Push the text data in the Files array because it will be treated as MediaItem in RUCoD
			contentObject.Files.push(data[0]);
			
			var flickrQuery = contentObject.Name;
			
			if(userQuery.Image) {
				flickrQuery = userQuery.Image;
			} else if (queryAdjustment[contentObject.Category]) {
				flickrQuery += queryAdjustment[contentObject.Category];
			} else {
				flickrQuery += ' '+contentObject.Category;
			}
			
			flickr.fetchImage(flickrQuery,this);
		},
		function getImageWeatherData(error,data) {
			if(error) {
				console.log('flickr error: '+error);
				return;
			}
			console.log('4. Flickr images fetched!');
			//Get weather data for images
			weather.fetchWeather(data,this);
		},
		function getVideoData(error,data) {
			if(error) {
				console.log('weather error: '+error);
				return;
			}
			console.log('4.1. Weather data for flickr images fetched!');
			
			for(var w=0; w < data.length; w++) {
				contentObject.Files.push(data[w][0]);
			}
			//Some query adjustments for youtube
			var youtubeQuery = contentObject.Name;
			
			if(userQuery.Video) {
				youtubeQuery = userQuery.Video;
			} else if(queryAdjustment[contentObject.Category]) {
				youtubeQuery += queryAdjustment[contentObject.Category];
			} else {
				youtubeQuery += ' '+contentObject.Category;
			}
			
			//Get videos for content object
			youtube.fetchVideo(youtubeQuery,this);
		},
		function getSoundData(error,data) {
			if(error) {
				console.log('youtube error: '+error);
				return;
			}
			console.log('5. YouTube data fetched!');
			
			for(var y=0; y < data.length; y++) {
				contentObject.Files.push(data[y]);
			}
			
			var soundQuery = contentObject.Name;
			
			if(userQuery.Sound) {
				soundQuery = userQuery.Sound;
			} 
			
			//Get audio for content object
			sound.fetchSound(soundQuery, true, this);
		},
		function evaluateSoundData(error,data) {
			if(error) {
				console.log('sound error: '+error);
				return [];
			}
			
			console.log('6. Sound data with geo information fetched!');
			
			if(data.length < 1) {
				
				var soundQuery = contentObject.Name;
				
				if(userQuery.Sound) {
					soundQuery = userQuery.Sound;
				} 
				
				//Get audio for content object
				sound.fetchSound(soundQuery, false, this);
			} else {
				//Get weather data for sounds
				weather.fetchWeather(data,this);
			}
		},
		function finalizeData(error,data) {
			if(error) {
				console.log('sound error: '+error);
			} else {
			
				console.log('7. Composed Sound data fetched!');
				for(var s=0; s < data.length; s++) {
					contentObject.Files.push(data[s][0]);
				}
			}
			
			delete contentObject.Category;
			
			console.log('Finished!');
			
			//Return the collected content object
			callback(null, JSON.stringify(contentObject));
		}
	);
};    

//Hook into commonJS module systems
if (typeof module !== 'undefined' && "exports" in module) {
  module.exports = Fetch;
}   