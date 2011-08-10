/*
 * This script collects and manages all data for a content objects
 */
var step    = require('step');
    modeldb = require('./modeldb');
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
			  "Freetext": "",
			  "Files": []
	};
	
	//Step through the content object data collection
	step(
		function getModelData() {	
			console.log('1. Start fetching Content Object data for 3D model with index '+index);
			modeldb.fetch(index, this);
		},
		function getImageData(error,data) {
			if(error) {
				throw error;
			}
			
			console.log('2. Model data fetched!');
			console.log(data);
			contentObject.Name = data[0].Name;
			contentObject.Screenshot = data[0].Screenshot;
			contentObject.CategoryPath = data[0].Category;
			
			//We wont need the category path in the individual files
			delete data[0].Category;
			
			//Push the 3D model to the files array of the content object
			contentObject.Files.push(data);
			
			contentObject.Freetext = "";
			flickr.fetch(contentObject.Name,this);
		},
		function getImageWeatherData(error,data) {
			if(error) {
				throw error;
			}
			console.log('3. Flickr images fetched!');
			//Get weather data for images
			weather.fetch(data,this);
		},
		function getVideoData(error,data) {
			if(error) {
				throw error;
			}
			console.log('4. Weather data for flickr images fetched!');
			
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
				console.log('6. Sound data with geo information fetched!');
				//Get weather data for sounds
				weather.fetch(data,this);
			}
		},
		function finalizeData(error,data) {
			if(error) {
				throw error;
			}
			
			console.log('7. Composed Sound data fetched!');
			for(var s=0; s < data.length; s++) {
				contentObject.Files.push(data[s]);
			}
			
			console.log('Finished!');
		}
	);
	
	//Return the collected content object
	callback(null, contentObject);
	
};    
    
    