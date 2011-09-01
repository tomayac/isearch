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

var getVideoSourceUrl = function(youtubeLink,callback) {
	
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
		
		callback(null,data[0]);
		
	}, true);
	
};  
    

/**
 * Converts the given Content Object data in JSON format into XML RUCoD format with their
 * respective RWML files.
 */
var publishRUCoD = function(data,callback) {
    
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
	
	//Grabbing the tags for the RUCoD header
	for(var f=0; f < data.Files; f++) {
		//Text has no tags ;-)
		if(data.Files[f].Type == 'Text') {
			continue;
		};
		for(var t=0; t < data.Files[f].Tags; t++) {
			rucodBody += '<MetaTag name="UserTag" xsi:type="xsd:string">' + data.Files[f].Tags[t] + '</MetaTag>';
		}
	}
	
	rucodBody += '</Tags>' +
                 '<ContentObjectTypes>';
	//Fitting the media files into RUCoD
	for(var f=0; f < data.Files; f++) {
		
		getVideoSourceUrl(data.Files[f].URL, function(error, url) {
			rucodBody += '<MultimediaContent xsi:type="' + data.Files[f].Type + '">';
			
			if(data.Files[f].Type == 'Text') {
				rucodBody += '<FreeText>' + data.Files[f].FreeText + '</FreeText>';
			} else {
				rucodBody += '<MediaName>' + data.Files[f].Name + '</MediaName>';
				if(mime[data.Files[f].Extension]) {
					rucodBody += '<FileFormat>' + mime[data.Files[f].Extension] + '</FileFormat>';
				}
				for(var t=0; t < data.Files[f].Tags; t++) {
					rucodBody += '<MetaTag name="UserTag" xsi:type="xsd:string">' + data.Files[f].Tags[t] + '</MetaTag>';
				}
				rucodBody += '<MediaLocator>';
				rucodBody += '<MediaUri>' + url + '</MediaUri>';
				rucodBody += '<MediaPreview>' + data.Files[f].Preview + '</MediaPreview>';
				rucodBody += '</MediaLocator>';
				rucodBody += '<MediaCreationInformation>';
				rucodBody += '<Licensing>' + data.Files[f].License + '</Licensing>';
				rucodBody += '<Creator>';
				rucodBody += '<Name>' + data.Files[f].Author + '</Name>';
				rucodBody += '</Creator>';
				rucodBody += '</MediaCreationInformation>';
			
			}
			rucodBody += '</MultimediaContent>';

		});
	}
	
	
	rucodBody += '</ContentObjectTypes>';
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
	//in the file system
	var copath = basepath;

	for(var p=0; p < catpath.length; p++) {
		copath += '/' + catpath[p];
		if(path.existsSync(copath)) {
			if(!fs.mkdirSync(copath, 0755)) {
				break;
			}
		}
	}
	
	var coname = data.Name.replace(/\s/g,'_') + '.json';
	
	//Check if the folder for this content object already exists
	path.exists(copath + '/' + coname, function (exists) {
		//Pre check
		if(exists && overwrite === false) {
			console.log('File exists!');
			callback('File already exists and overwrite was not allowed');
			return;
		} 
		
		//Write JSON file
		fs.writeFile(copath + '/' + coname, data, function (error) {
		  if (error) throw error;
		  console.log('JSON file created or overwritten under ' + copath + '/' + coname);
		  
		  //Create RUCoD for Content Object data
		  publishRUCoD(data,callback);
		});
		
		
		
	});
};