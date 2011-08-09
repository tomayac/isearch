/*
 * This script collects and manages all data for a content objects
 */
var nodeio  = require('node.io');
    modeldb = require('./modeldb');
    flickr  = require('./flickr');
    youtube = require('./youtube'),
    sound   = require('./freesound'),
    weather = require('./wunderground');

exports.get = function(index, callback) {
	
	//scraping data storage
	var scrapingData = {
			  "ID": index,
			  "Name": "",
			  "Screenshot": "",
			  "CategoryPath": "", 
			  "Freetext": "",
			  "Files": []
	};
	
	var context = this;
	
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
		
	});
};    
    
    