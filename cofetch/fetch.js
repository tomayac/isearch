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
	Step(
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
			contentObject.Name = data.Name;
			contentObject.Screenshot = data.Screenshot;
			contentObject.CategoryPath = data.Category;
			
			//We wont need the category path in the individual files
			delete data.Category;
			
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
			console.log(data);
			
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
			console.log(data);
			
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
				console.log(data);
				//Get weather data for sounds
				weather.fetch(data,this);
			}
		},
		function finalizeData(error,data) {
			if(error) {
				throw error;
			}
			
			console.log('7. Composed Sound data fetched!');
			console.log(data);
			for(var s=0; s < data.length; s++) {
				contentObject.Files.push(data[s]);
			}
			
			console.log('Finished!');
		}
	);
	
	//Return the collected content object
	callback(null, contentObject);
	/*
	//Start collecting the data for the given index
	modeldb.fetch(index, function(error, data) {
		
		if(error) {
			callback(error,null);
			return;
		}
		console.log(data);
		scrapingData.Name = data.Name;
		scrapingData.Screenshot = data.Screenshot;
		scrapingData.CategoryPath = data.Category;
		scrapingData.Files.push(data);
		
		scrapingData.Freetext = "";
		
		var flickrImages = new Array();
		console.log(scrapingData.Name);
		flickr.fetch(scrapingData.Name,flickrImages,function(error, data) {
			
			if(error) {
				callback(error + '(Flickr)',null);
				return;
			}
			
			console.log('Flickr data fetched!');
			weather.fetch(flickrImages,function(error, data) {
				console.log('Weather data fetched!');
				
				for(var w=0; w < data.length; w++) {
					scrapingData.Files.push(data[w]);
				}
				
				var youtubeVideos = new Array();
				
				youtube.fetch(scrapingData.Name,youtubeVideos,function(error,data) {
					
					if(error) {
						callback(error + '(Video)',null);
						return;
					}
					
					console.log('YouTube data fetched!');
					for(var y=0; y < youtubeVideos.length; y++) {
						scrapingData.Files.push(youtubeVideos[y]);
					}
					
					var sounds = new Array();
					
					sound.fetch(scrapingData.Name, sounds, true, function(error,data) {
						
						if(error) {
							callback(error + '(Sound)',null);
							return;
						}
						
						if(sounds.length > 0) { 
							console.log('Sound data fetched!');
							
							weather.fetch(sounds,function(error, data) {
								console.log('Weather data for sounds fetched!');
								
								for(var s=0; s < data.length; s++) {
									scrapingData.Files.push(data[s]);
								}
								//Return the collected data
								context.callback(null, scrapingData);
							});
						} else {
						
							//No sounds with location data was found, so try it without
							var sounds = new Array();
							
							sound.fetch(scrapingData.Name, sounds, false, function(error,data) {
								
								if(error) {
									callback(error + '(Sound)',null);
									return;
								}
								
								for(var s=0; s < sounds.length; s++) {
									scrapingData.Files.push(sounds[s]);
								}
								//Return the collected data
								context.callback(null, scrapingData);
							});
						}
						
						//End fetching
					});
					
				});
			});
		});
		
	});*/
};    
    
    