/**
 * Weather fetch for Content Object production.
 * Facilitates Node.io to get contents from wunderground.com
 */
var nodeio = require('node.io');

var weatherMethods = {
		input: function (start, num, callback) {
	        //Handling the input
			//Let's get the arguments passed to the script
			if (!this.options.args[0]) {
				this.exit('No arguments were given to the Wunderground job');
			}
			//We won't allow more than one input line to be processed as once
			if(num > 1) {
				this.exit('The take parameter can not be set higher than 1 for this job');
			}
			
			var data = this.options.args[0];
			
			if(start < data.length) {
				//Return the current result object
				console.log('Process weather data for input item: '+start);
				callback([data[start]]);
				
			} else {
				console.log('End of fetching weather data');
				//There is nothing left for the job, so stop it
				callback(null,false);
			}
	    },
	    run: function(input) {		
	    	
	    	//Initial static definitions
			var beaufortScale = [
                 {'id':0, 'min':0,'max':0},
                 {'id':1, 'min':1,'max':6},
                 {'id':2, 'min':7,'max':11},
                 {'id':3, 'min':12,'max':19},
                 {'id':4, 'min':20,'max':29},
                 {'id':5, 'min':30,'max':39},
                 {'id':6, 'min':40,'max':50},
                 {'id':7, 'min':51,'max':62},
                 {'id':8, 'min':63,'max':75},
                 {'id':9, 'min':76,'max':87},
                 {'id':10,'min':88,'max':102},
                 {'id':11,'min':103,'max':117},
                 {'id':12,'min':118,'max':1000},
            ]; 
			/*
			    RA	Rain
				SN	Snow
				GR	Gr�le - hail
				FG	Fog
				NSC	No cloud
				FEW	1/8 to 2/8 of cloud coverage
				SCT	3/8 to 4/8 of cloud coverage
				BKN	5/8 to 7/8 of cloud coverage
				OVC	8/8 of cloud coverage
				TS  Thunderstorm
			 */
			var weatherCondition = new Array();
				weatherCondition['Unknown']           = '';
				weatherCondition['Drizzle']           = 'RA';
				weatherCondition['Rain']              = 'RA';
				weatherCondition['Snow']              = 'SN';
				weatherCondition['Snow Grains']       = 'SN';
				weatherCondition['Ice Crystals']      = 'GR';
				weatherCondition['Ice Pellets']       = 'GR';
				weatherCondition['Hail']              = 'GR';
				weatherCondition['Mist']              = 'FG';
				weatherCondition['Fog']               = 'FG';
				weatherCondition['Smoke']             = 'FG';
				weatherCondition['Volcanic Ash']      = 'FG';
				weatherCondition['Widespread Dust']   = 'FG';
				weatherCondition['Sand']              = 'FG';
				weatherCondition['Haze']              = 'FG';
				weatherCondition['Spray']             = 'RA';
				weatherCondition['Dust Whirls']       = 'FG';
				weatherCondition['Sandstorm']         = 'FG';
				weatherCondition['Low Drifting Snow'] = 'SN';
				weatherCondition['Low Drifting Widespread Dust'] = 'FG';
				weatherCondition['Low Drifting Sand'] = 'FG';
				weatherCondition['Blowing Snow']      = 'SN';
				weatherCondition['Blowing Widespread Dust'] = 'FG';
				weatherCondition['Blowing Sand']      = 'FG';
				weatherCondition['Rain Showers']      = 'RA';
				weatherCondition['Snow Showers']      = 'SN';
				weatherCondition['Ice Pellet Showers']= 'GR';
				weatherCondition['Hail Showers']      = 'GR';
				weatherCondition['Small Hail Showers']= 'GR';
				weatherCondition['Thunderstorm']      = 'TS';
				weatherCondition['Thunderstorms and Rain'] = 'TS RA';
				weatherCondition['Thunderstorms and Snow'] = 'TS SN';
				weatherCondition['Thunderstorms and Ice Pellets'] = 'TS SN';
				weatherCondition['Thunderstorms with Hail'] = 'TS GR';
				weatherCondition['Thunderstorms with Small Hail'] = 'TS GR';
				weatherCondition['Freezing Drizzle']  = 'SN';
				weatherCondition['Freezing Rain']     = 'SN';
				weatherCondition['Freezing Fog']      = 'FG';
				weatherCondition['Overcast']          = 'OVC';
				weatherCondition['Clear']             = 'NSC';
				weatherCondition['Partly Cloudy']     = 'SCT';
				weatherCondition['Mostly Cloudy']     = 'BKN';
				weatherCondition['Scattered Clouds']  = 'FEW';
			
			//Preserve the context of this function	
			var context = this;
			//Initialize the object for storing column indexes of the weather table
			var dataColumns = {
				'temperature': 0,
				'humidity': 0,
				'windspeed': 0,
				'condition': 0
			};
			//Temporal result storage for interesting weather data
			var condition = '',
			    temperature = '',
			    windspeed = '',
			    humidity = '';
			
			//Only try to get weather data for items for which we have
			//a date and a location
			if(input.Date && input.Location[0] > 0) {
				
				//Formatting the result date, assuming the format yyyy.mm.dd hh:mm:ss
				var tempDate = input.Date.split(' ');
				var resDate = tempDate[0].split('-');
				var resTime = tempDate[1].split(':');
				resTime[0] = parseInt(resTime[0].replace(/0(\d\/)/g,''));
				resTime[1] = parseInt(resTime[1].replace(/0(\d\/)/g,''));
				resTime = new Date(2010,1,1,resTime[0],resTime[1],0);

				var requestURL = 'http://api.wunderground.com/history/cgi-bin/findweather/getForecast?'
					+ 'airportorwmo=query'
					+ '&historytype=DailyHistory' 
					+ '&code=' + input.Location[0] + ',' + input.Location[1]
				    + '&month=' + resDate[1]
				    + '&day=' + resDate[2]
				    + '&year=' + resDate[0];
				
				context.getHtml(requestURL, function(error, $) {		
					
					//console.log(requestURL);
					
					var weatherTable = {};
					
					var targetRow = 0;
					var currentRow = 0;
					var minDiff = 1439; //initial: (24 * 60min) - 1;
					
					//Try to get the weather table on site
					try{
						//Handle any request / parsing errors
						if(error) {
							console.log('Something went wrong: ' + error);
							console.log('While fetching: ' + requestURL);
							throw new Error(error);
						}
						weatherTable = $('#obsTable tr');
						
					}catch(e) {
						console.log('No weather data for this item.');
						weatherTable = {};
					}
					
					//Make sure we got an weather table on the resulting site
					if(weatherTable.each) {
					
						//Fetching the best fitting row for the given time 
						weatherTable.each(function(element) {
							//Get the column index for interesting fields from the table header
							if(element.children[0].name === 'th') {
								for(var h=0; h < element.children.length; h++) {
									if(element.children[h].children[0].data == 'Temp.') {
										dataColumns.temperature = h;
									}
									if(element.children[h].children[0].data == 'Humidity') {
										dataColumns.humidity = h;
									}
									if(element.children[h].children[0].data == 'Wind Speed') {
										dataColumns.windspeed = h;
									}
									if(element.children[h].children[0].data == 'Conditions') {
										dataColumns.condition = h;
									}
								};
								currentRow++;	
								return;
							}
							
							//Formatting the wunderground time from format hh:mm AM/PM
							var splitTime = element.children[0].children[0].data.split(' ');
							var chkTime = splitTime[0].split(':');
							chkTime[0] = parseInt(chkTime[0]);
							chkTime[0] = (splitTime[1] == 'AM' && chkTime[0] == 12) ? 0 : chkTime[0];
							chkTime[0] = (splitTime[1] == 'PM' && chkTime[0] < 12) ? chkTime[0] + 12 : chkTime[0];
							chkTime[1] = parseInt(chkTime[1]);
							chkTime = new Date(2010,1,1,chkTime[0],chkTime[1],0);
							
							//Determining is the time of the current row is closer to the time of the result
							curDiff = resTime.getTime()-chkTime.getTime();
							curDiff = Math.abs(Math.floor(curDiff/1000/60));
							if(curDiff < minDiff) {
								minDiff = curDiff;
								targetRow = currentRow;
							}
							currentRow++;	
						});
						
						//Get the temperature for the most fitting time (usually 1st column)
						try {
							temperature = weatherTable[targetRow].children[dataColumns.temperature].children[0].children[0].children[0].data;
							temperature = parseFloat(temperature).toFixed(1);
						} catch(e) {}
						
						//Get the humidity for the most fitting time (usually 3rd column)
						try {
							humidity = weatherTable[targetRow].children[dataColumns.humidity].children[0].data;
							humidity = parseInt(humidity);
						} catch(e) {}
						
						//Get the windspeed for the most fitting time
						try {
							var winddata = weatherTable[targetRow].children[dataColumns.windspeed].children[0].data.replace(/^\s*|\s*$/g,'');
							windspeed = (winddata == 'Calm' || winddata == '-') ? parseFloat('0.0') : Math.round(parseFloat(weatherTable[targetRow].children[dataColumns.windspeed].children[0].children[0].children[0].data));
							
			                //Calculate the beaufort number for the determined windspeed
			                for(var b=0; b < beaufortScale.length; b++) {
			                    if(windspeed >= beaufortScale[b].min && windspeed <= beaufortScale[b].max) {
			                        windspeed = beaufortScale[b].id;
			                        break;
			                    }
			                }
						} catch(e) {}
						
		                //Get the condition for the most fitting time
		                try {
			                condition = weatherTable[targetRow].children[dataColumns.condition].children[0].data.replace(/^\s+|\s+$/g,"");
			                condition = condition.replace('Light ','');
			                condition = condition.replace('Heavy ','');
			                //Get the condition identifier for the determined condition
			                if(weatherCondition[condition]) {
			                    condition = weatherCondition[condition];
			                }
		                } catch(e) {}
		                //Set the gathered weather values to the current result
		                input.Weather = {"condition": condition, "wind": windspeed, "temperature": temperature, "humidity": humidity};
					
					} //end if weatherTable.each 
					
					context.emit(input);

				}); // End getHtml		
			} else {
				//We are unable to gather weather data for this input so just left it unchanged
				context.emit(input);
			}// End if
			
		} // End run function
};

//Specify the options
var options = {
	    timeout: 20,   //Timeout after 20 seconds
	    max: 1,        //Run 1 thread concurrently (when run() is async)
	    retries: 3,    //Threads can retry 3 times before failing
	    flatten: false
	};

var fetchWeather = function(results, callback) {
	//Creates the job
	var weatherJob = new nodeio.Job(options, weatherMethods);
	nodeio.start(weatherJob, {args: [results]}, callback, true);
};

//Exposes it publicly
if (typeof module !== 'undefined' && "exports" in module) {
	  module.exports.fetchWeather = fetchWeather; 
}  