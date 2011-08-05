/**
 * Weather fetch for Content Object production.
 * Facilitates Node.io to get contents from wunderground.com
 */
var nodeio = require('node.io');

var methods = {
		input: false,
		run: function() {
			
			//Let's get the arguments passed to the script
			if (!this.options.args[0]) {
				this.exit('No arguments were given to the Wunderground job');
			}
			
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
				GR	Grêle - hail
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
			weatherCondition['Freezing Drizzle'] = 'SN';
			weatherCondition['Freezing Rain'] = 'SN';
			weatherCondition['Freezing Fog'] = 'FG';
			weatherCondition['Overcast'] = 'OVC';
			weatherCondition['Clear'] = 'NSC';
			weatherCondition['Partly Cloudy'] = 'SCT';
			weatherCondition['Mostly Cloudy'] = 'BKN';
			weatherCondition['Scattered Clouds'] = 'FEW';
			
			var result = this.options.args[0];
			var count = 0;
			
			for(var i=0; i < result.length; i++) {
				
				var condition = '',
			        temperature = '',
			        windspeed = '',
			        humidity = '';
				
				//Only try to get weather data for items for which we have
				//a date and a location
				if(result[i].Date && result[i].Location[0] > 0) {
					
					var tempDate = result[i].Date.split(' ');
					var td = tempDate[0].split('-');
					var tt = tempDate[1].split(':');
					var dateObj = new Date(td[0],td[1],td[2],tt[0],tt[1],tt[2]);
					
					var requestURL = 'http://api.wunderground.com/history/cgi-bin/findweather/getForecast?'
						+ 'airportorwmo=query'
						+ '&historytype=DailyHistory' 
						+ '&code=' + result[i].Location[0] + ',' + result[i].Location[1]
						+ '&month=' + dateObj.getMonth()
						+ '&day=' + dateObj.getDate()
						+ '&year=' + dateObj.getFullYear();
					
					var context = this;
					
					this.getHtml(requestURL, function(error, $) {
						
						//Handle any request / parsing errors
			            if (error) {
			            	this.exit(error);
			            }
			            
			            //Get weather table on site
			            $('#obsTable td:nth-child(1)').each(function(index) {
			                if(index < 1 || found) {
			                    return;
			                }
			                
			                var splitTime = $(this).text().split(' ');
			                var timeElements = splitTime[0].split(':');
			                timeElements[0] = parseInt(timeElements[0]);
			                timeElements[0] = (splitTime[1] == 'PM') ? timeElements[0] += 12 : timeElements[0];
			                timeElements[1] = parseInt(timeElements[1]);
			                
			                var rowTime = new Date('2006','8','10',timeElements[0],timeElements[1],0); 

			                if(dateObj.getHours() == rowTime.getHours() && Math.abs(dateObj.getMinutes() - rowTime.getMinutes()) <= 30) {
			                    found = true;
			                    index += 1;
			                    
			                    //Get the tempearture for the most fitting time
			                    var value = $('#obsTable tr:eq('+index+') td:eq(1) .b').text();
			                    temperature = parseFloat(value).toFixed(1);
			                    
			                    //Get the humidity for the most fitting time
			                    value = $('#obsTable tr:eq('+index+') td:eq(3)').text();
			                    humidity = parseInt(value);
			                    
			                    //Get the windspeed for the most fitting time
			                    value = $('#obsTable tr:eq('+index+') td:eq(7) .b:eq(0)').text();
			                    windspeed = Math.round(parseFloat(value));
			                    
			                    //Calculate the beaufort number for the determined windspeed
			                    for(var b=0; b < beaufortScale.length; b++) {
			                        if(windspeed >= beaufortScale[b].min && windspeed <= beaufortScale[b].max) {
			                            windspeed = beaufortScale[b].id;
			                            break;
			                        }
			                    }
			                    
			                    //Get the condition for the most fitting time
			                    value = $('#obsTable tr:eq('+index+') td:eq(11)').text().replace(/^\s+|\s+$/g,"");
			                    //Get the condition identifier for the determined condition
			                    if(weatherCondition[value]) {
			                        condition = weatherCondition[value];
			                    }
			                    
			                    //Get the event condition for the most fitting time
			                    value = $('#obsTable tr:eq('+index+') td:eq(10)').text().replace(/^\s+|\s+$/g,"");
			                    //Get the event condition identifier for the determined event condition
			                    if(weatherCondition[value]) {
			                        condition += ' ' + weatherCondition[value];
			                    }
			                    
			                  //Set the gathered weather values to the current result
			    			  result[count].Weather = {"condition": condition, "wind": windspeed, "temperature": temperature, "humidity": humidity};
			    			  
			                } // End if
			                return; 
			            }); // End each time cell in table
			            
			            count++;
		    			  
		    			if(count === result.length) {
		    				this.emit();
		    			}
					}); // End getHtml		
				} // End if 
				
			} // End for
			
		} // End run function
};

//Creates the job
var job = new nodeio.Job({timeout:10}, methods);

//Exposes it publicly
exports.fetch = function(results, callback) {
	nodeio.start(job, {args: [results]}, callback);
};