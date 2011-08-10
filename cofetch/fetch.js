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

exports.get = function(index, callback) {
	
	//content object data storage
	var contentObject = {
			  "ID": index,
			  "Name": "",
			  "Screenshot": "",
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
				throw error;
			}
			
			console.log('2. Model data fetched!');

			contentObject.Name = data[0].Name;
			contentObject.Screenshot = data[0].Screenshot;
			contentObject.CategoryPath = data[0].CategoryPath;
			
			var category = data[0].Category;
			
			//We wont need the category path in the individual files
			delete data[0].Category;
			delete data[0].CategoryPath;
			
			//Push the 3D model to the files array of the content object
			contentObject.Files.push(data);
			
			//Fetch free text data for the model
			dbpedia.fetch(contentObject.Name, category, this);
		},
		function getImageData(error,data) {
			if(error) {
				throw error;
			}
			
			console.log('3. Text data fetched! ('+data.length+')');
			
			if(data.Description) {
				contentObject.Name = data[0].Name;
				delete data[0].Name;
				//Push the text data in the Files array because it will be treated as MediaItem in RUCoD
				contentObject.Files.push(data);
			}
			
			flickr.fetch(contentObject.Name,this);
		},
		function getImageWeatherData(error,data) {
			if(error) {
				throw error;
			}
			console.log('4. Flickr images fetched!');
			//Get weather data for images
			weather.fetch(data,this);
		},
		function getVideoData(error,data) {
			if(error) {
				throw error;
			}
			console.log('4.1. Weather data for flickr images fetched!');
			
			for(var w=0; w < data.length; w++) {
				contentObject.Files.push(data[w]);
			}
			
			//Get videos for content object
			youtube.fetch(contentObject.Name,this);
		},
		function getSoundData(error,data) {
			if(error) {
				throw error;
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
				throw error;
			}
			
			if(data.length < 1) {
				//Get audio for content object
				sound.fetch(contentObject.Name, false, this);
			} else {
				console.log('x. Sound data with geo information fetched!');
				//Get weather data for sounds
				weather.fetch(data,this);
			}
		},
		function finalizeData(error,data) {
			if(error) {
				throw error;
			}
			
			console.log('6. Composed Sound data fetched!');
			for(var s=0; s < data.length; s++) {
				contentObject.Files.push(data[s]);
			}
			
			console.log('Finished!');
		}
	);
	
	//Return the collected content object
	callback(null, contentObject);
	
};    
    
    