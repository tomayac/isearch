/**
 * This script takes the JSON data of a Content Object and stores it as
 * json files. It further provides functions for converting the json files
 * to RUCoD Headers including Real-World descriptor files.
 * 
 * @author Jonas
 */
var path   = require('path'),
    fs     = require('fs'),
    nodeio = require('node.io'),
    querystring = require('querystring');

var basepath = '/var/www/isearch/cofetch/output';
var fileOutputPath = '';
var publicOutputUrl = 'http://isearch.ai.fh-erfurt.de/cofetch/output';
var baseName = '';

var mime = new Array();
    mime['jpg']   = 'image/jpeg';
    mime['png']   = 'image/png';
    mime['3ds']   = 'application/x-3ds';
    mime['vrml']   = 'x-world/x-vrml';
    mime['blend'] = 'application/x-blender';
    mime['dwg']   = 'application/x-dwg';
    mime['dxf']   = 'application/x-dxf';
    mime['lwo']   = 'image/x-lwo';
    mime['max']   = 'application/x-max';
    mime['mb']    = 'application/x-mb';
    mime['obj']   = 'application/octet-stream';
    mime['wrl']   = 'x-world/x-vrml';
    mime['ogg']   = 'audio/ogg';
    mime['oga']   = 'audio/ogg';
    mime['ogv']   = 'video/ogg';
    mime['wav']   = 'audio/x-wav';
    mime['mp4']   = 'video/mp4';
    mime['mp3']   = 'audio/mpeg';
    mime['webm']  = 'video/webm';
    mime['flv']   = 'video/x-flv';

//enhance the array prototype to have a unique function which prevents
//double entries within an array
Array.prototype.unique = function() {

    var o = {};
    var tmp = [];

    for(var i = 0 ; i < this.length; i++) { o[this[i]] = true; }

    for(var i in o) { tmp[tmp.length] = i; }

    return tmp;

};    
    
var getISODateString = function(d){
	 function pad(n){
		 return n<10 ? '0'+n : n;
	 };
	 return d.getUTCFullYear()+'-'
	      + pad(d.getUTCMonth()+1)+'-'
	      + pad(d.getUTCDate())+'T'
	      + pad(d.getUTCHours())+':'
	      + pad(d.getUTCMinutes())+':'
	      + pad(d.getUTCSeconds())+'Z';
};
    
var getVideoSourceUrl = function(youtubeLink, id, callback) {
	
	var result = false;
	
	var videoId = youtubeLink.substr(youtubeLink.lastIndexOf('=')+1);
	var infoUrl = 'http://youtube.com/get_video_info?video_id=' + videoId;
	
	var job = new nodeio.Job({
	    input: false,
	    run: function () {
	        var url = this.options.args[0];
	        this.get(url, function(err, data) {
	            if (err) {
	                this.exit(err);
	            } else {
	            	
	            	var vInfoResponse = querystring.parse(data);
	                var vInfoUrls = vInfoResponse['url_encoded_fmt_stream_map'].split(',');
	                var vDataUrl = '';
	                
	                for(var u=0; u < vInfoUrls.length; u++) {
	                	vInfoUrls[u] = decodeURIComponent(vInfoUrls[u].replace(/\+/g,  " "));
	                	vInfoUrls[u] = vInfoUrls[u].substring(vInfoUrls[u].indexOf('=')+1,vInfoUrls[u].lastIndexOf(';') < 0 ? vInfoUrls[u].length : vInfoUrls[u].lastIndexOf(';'));
	                	if(vInfoUrls[u].indexOf('video/mp4') > 0) {
	                		vDataUrl = vInfoUrls[u];
	                	}
	                }
	            	
	                this.emit(vDataUrl);
	            }
	        });
	    }
	});
	
	nodeio.start(job, {args: [infoUrl]}, function(error,data) {
		
		if(error) {
			callback('error: ' + error, null);
			return;
		}

		callback(null, id, data[0]);
		
	}, true);

};  
    

/**
 * Converts the given Content Object data in JSON format into XML RUCoD format with their
 * respective RWML files.
 */
var publishRUCoD = function(data, outputPath, callback) {
    	
	//Set the static structure of the RUCoD XML file
	var rucodHeadS = '<?xml version="1.0" encoding="UTF-8"?>' +
		             '<RUCoD xsi="http://www.isearch-project.eu/isearch/RUCoD" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml">' +
	                 '<Header>' +
	                 '<ContentObjectName xml:lang="en-US">' + data.Name + '</ContentObjectName>' +
	                 '<ContentObjectCreationInformation>' +
			         '<Creator>' +
				     '<Name>Jonas Etzold and Arnaud Brousseau</Name>' +
			         '</Creator>' +
			         '<Contributor>' +
				     '<Name>FHE and Google</Name>' +
			         '</Contributor>' + 			
		             '</ContentObjectCreationInformation>';
	var rucodHeadE = '</Header>' + 
	                 '</RUCoD>';
	
	var rucodBody = '<Tags>';
	
	var tagArray = new Array();
	//Grabbing the tags for the RUCoD header
	for(var f=0; f < data.Files.length; f++) {
		//Text has no tags ;-)
		if(data.Files[f].Type == 'Text') {
			continue;
		};
		for(var t=0; t < data.Files[f].Tags.length; t++) {
			tagArray.push(data.Files[f].Tags[t]);
		}
	}
	//Filtering the Array to have only unique tags in there
	var uniqueTags = tagArray.unique();
	//and print the tags into the header
	for(var t=0; t < uniqueTags.length; t++) {
		rucodBody += '<MetaTag name="UserTag" xsi:type="xsd:string">' + uniqueTags[t] + '</MetaTag>';
	}
	
	rucodBody += '</Tags>' +
                 '<ContentObjectTypes>';

	//First run, get the video data url for youtube videos 
	for(var f=0; f < data.Files.length; f++) {
		if (data.Files[f].Type == 'VideoType') {
			getVideoSourceUrl(data.Files[f].URL, f, function(error, id, url) {
			
				data.Files[id].URL = url;
				
				//Fitting the media files into RUCoD
				for(var f=0; f < data.Files.length; f++) {
					rucodBody += '<MultimediaContent xsi:type="' + data.Files[f].Type + '">';
					
					if(data.Files[f].Type == 'Text') {
						rucodBody += '<FreeText>' + data.Files[f].FreeText + '</FreeText>';
					} else  {	
						
						if(mime[data.Files[f].Extension]) {
							rucodBody += '<FileFormat>' + mime[data.Files[f].Extension] + '</FileFormat>';
						}
						
						if(data.Files[f].Description) {
							rucodBody += '<FreeText>' + data.Files[f].Description + '</FreeText>';
						}
						
						rucodBody += '<MediaCreationInformation>';
						rucodBody += '<Author>';
						rucodBody += '<Name>' + data.Files[f].Author + '</Name>';
						rucodBody += '</Author>';
						rucodBody += '<Licensing>' + data.Files[f].License + '</Licensing>';
						rucodBody += '</MediaCreationInformation>';
						
						rucodBody += '<MediaLocator>';
						rucodBody += '<MediaUri>' + data.Files[f].URL + '</MediaUri>';
						rucodBody += '<MediaPreview>' + data.Files[f].Preview + '</MediaPreview>';
						rucodBody += '</MediaLocator>';
						
						rucodBody += '<MediaName>' + data.Files[f].Name + '</MediaName>';
						
						if(data.Files[f].Length) {
							rucodBody += '<MediaTime>' + data.Files[f].Length + '</MediaTime>';
						}
						
						for(var t=0; t < data.Files[f].Tags.length; t++) {
							rucodBody += '<MetaTag name="UserTag" xsi:type="xsd:string">' + data.Files[f].Tags[t] + '</MetaTag>';
						}
							
					} 
					
					rucodBody += '</MultimediaContent>';
					
				} // End for loop
				
				rucodBody += '</ContentObjectTypes>';
				
				//Generate RWML data for each media item
				var rwml = '<RWML>';
				
				for(var f=0; f < data.Files.length; f++) {
					//Text does not has any real world information
					if(data.Files[f].Type == 'Text') {
						continue;
					}
					//Prepare the creation date of the media item for use in RWML 
					var rawDateParts = data.Files[f].Date.split(" ");
					var dateParts = (rawDateParts[0] || "2011-08-01").split("-");
					var timeParts = (rawDateParts[1] || "12:01:01").split(":");
					var rwmlDate = new Date(parseInt(dateParts[0]),parseInt(dateParts[1].replace(/0(\d\/)/g,'')),parseInt(dateParts[2].replace(/0(\d\/)/g,'')),parseInt(timeParts[0].replace(/0(\d\/)/g,'')),parseInt(timeParts[1].replace(/0(\d\/)/g,'')),parseInt(timeParts[2].replace(/0(\d\/)/g,'')));
					
					//Create the RWML file
					   rwml += '<ContextSlice>' +
					           '<DateTime>' +
					           '<Date>' + getISODateString(rwmlDate) + '</Date>' +	
					           '</DateTime>';
					//Do we have GPS
					if(data.Files[f].Location.length > 1) {
					   var location = data.Files[f].Location;	
					   rwml += '<Location type="gml">' +
					           '<gml:CircleByCenterPoint numArc="1">' +
					           '<gml:pos>' + location[0] + ' ' + location[1] + '</gml:pos>' +
					           '<gml:radius uom="M">10</gml:radius>' +
					           '</gml:CircleByCenterPoint>' +
					           '</Location>' +
					           '<Direction>' +
					           '<Heading>' + location[3] + '</Heading>' +
					           '<Tilt>0</Tilt>' +
					           '<Roll>0</Roll>' +
					           '</Direction>';
					}
					//Do we have weather
					if(data.Files[f].Weather.temperature.length > 1) {
					   rwml += '<Weather>' +
	                           '<Condition>' + data.Files[f].Weather.condition + '</Condition>' +
	                           '<Temperature>' + data.Files[f].Weather.temperature + '</Temperature>' +
	                           '<WindSpeed>' + data.Files[f].Weather.wind + '</WindSpeed>' +
	                           '<Humidity>' + data.Files[f].Weather.humidity + '</Humidity>' +
	                           '</Weather>';	
					}
					
					   rwml += '</ContextSlice>';
				} // End for loop for RWML
				
				rwml += '</RWML>';
				
				
				//Add the RWML to the RUCoD
				rucodBody += '<RealWorldInfo>' +
							 '<MetadataUri filetype="rwml">' + publicOutputUrl + '/' + baseName + '.rwml</MetadataUri> ' +
							 '</RealWorldInfo>';   
				
				//Find and add emotion if there are some
				var emoIndex = 0;
				
				for(var f=0; f < data.Files.length; f++) {
					if(data.Files[f].Type == 'Text') {
						continue;
					}
					if(data.Files[f].Emotions.length > 1 && data.Files[f].Emotions[0] != "Not set") {
						emoIndex = f;
						break;
					}
				}
				rucodBody += '<UserInfo>' +
							 '<UserInfoName>Emotion</UserInfoName>' +
				             '<emotion>' +
				             '<category set="everydayEmotions" name="' + data.Files[emoIndex].Emotions + '"/>' +
				             '</emotion>' +
				             '</UserInfo>';	

				//Write RWML file
				fs.writeFile(outputPath+ baseName + '.rwml', rwml, function (error) {
					if (error) throw error;
					console.log('RWML file created or overwritten under ' + outputPath + baseName + '.rwml');
					
					//Write RUCoD file
					fs.writeFile(outputPath + baseName + '_rucod.xml', (rucodHeadS + rucodBody + rucodHeadE), function (error) {
						if (error) throw error;
						console.log('RUCoD file created or overwritten under ' + outputPath + baseName + '_rucod.xml');
						
						callback('JSON and RUCoD files successfully saved.');
					});
				});
				
			}); //End asynchronous call
		}	
	} //End first run loop
};


/**
 * Stores the given JSON data as file on the servers file system.
 * @param the Content Object data in JSON format
 * @param overwrite indicates weather an existing file for content object should be overwritten or not
 */
exports.store = function(data, overwrite, callback) {
	//Get the category path of the CO json
	var catpath = data.CategoryPath.split('/');
	//And check if the folders for those categories exist
	//in the file system, if not create them
	var fileOutputPath = basepath;
	
	for(var p=0; p < catpath.length; p++) {
		fileOutputPath += '/' + catpath[p];
		publicOutputUrl += '/' + catpath[p];
		if(!path.existsSync(fileOutputPath)) {
			if(fs.mkdirSync(fileOutputPath, 0755)) {
				break;
			}
		}
	}
	
	baseName = data.Name.replace(/\s/g,'_');
	
	//Set the general output path for this content object
	fileOutputPath += '/';
	
	//Check if the folder for this content object already exists
	path.exists(fileOutputPath + baseName + '.json', function (exists) {
		//Pre check
		if(exists && overwrite === false) {
			console.log('File exists!');
			callback('File already exists and overwrite was not allowed');
			return;
		} 
		
		//Write JSON file
		fs.writeFile(fileOutputPath + baseName + '.json', JSON.stringify(data), function (error) {
		  if (error) throw error;
		  console.log('JSON file created or overwritten under ' + fileOutputPath + baseName + '.json');
		  
		  //Create RUCoD for Content Object data
		  publishRUCoD(data,fileOutputPath,callback);
		  
		});
		
		
		
	});
};