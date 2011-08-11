/*
 * This script collects and manages all data for a content objects
 */
var step    = require('./step');
    modeldb = require('./modeldb');
    dbpedia = require('./dbpedia');
    flickr  = require('./flickr');
    youtube = require('./youtube'),
    sound   = require('./freesound'),
    weather = require('./wunderground');

exports.get = function(index, callback) {
	
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
			modeldb.fetch(index, this);
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
			
			//Fetch free text data for the model
			dbpedia.fetch(contentObject.Name, contentObject.Category, this);
		},
		function getImageData(error,data) {
			if(error) {
				console.log('dbpedia error: '+error);
				return;
			}
			
			console.log('3. Text data fetched! ('+data.length+')');
			
			if(data.Description) {
				//Push the text data in the Files array because it will be treated as MediaItem in RUCoD
				contentObject.Files.push(data[0]);
			}
			
			var flickrQuery = contentObject.Name;
			
			if(contentObject.Category === 'Fish') {
				//flickrQuery += '+underwater';
			}
			
			flickr.fetch(flickrQuery,this);
		},
		function getImageWeatherData(error,data) {
			if(error) {
				console.log('flickr error: '+error);
				return;
			}
			console.log('4. Flickr images fetched!');
			//Get weather data for images
			weather.fetch(data,this);
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
			
			if(contentObject.Category === 'Fish') {
				//youtubeQuery += '+underwater';
			}
			
			//Get videos for content object
			youtube.fetch(youtubeQuery,this);
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
			
			//Get audio for content object
			sound.fetch(contentObject.Name, true, this);
		},
		function evaluateSoundData(error,data) {
			if(error) {
				console.log('sound error: '+error);
				return [];
			}
			
			console.log('6. Sound data with geo information fetched!');
			
			if(data.length < 1) {
				//Get audio for content object
				sound.fetch(contentObject.Name, false, this);
			} else {
				//Get weather data for sounds
				weather.fetch(data,this);
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
			callback(null, contentObject);
		}
	);
};    
    
    