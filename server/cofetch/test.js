//var skp = require('./sketchup');
var yt = require('./youtube');
//var fs = require('./freesound');
//var mdb = require('./modeldb');
//var dbpedia = require('./dbpedia');
//var weather = require('./wunderground');
//var flickr = require('./flickr');

//flickr.fetchImage('red cat',1,function(error, data) {
//  if(error) {
//    console.log('Error: '+error);
//    return;
//  }
//  console.log(data);
//});

//weather.fetchWeather({Date: '1999-12-11 15:19:05', Location: [41.738528,42.13623]}, function(error, data) {
//  console.log('error: '+error);
//  console.log(data);
//});

//skp.fetchThreed('cow', function(error, data){
//  //results is now filled in with 3d models from google warehouse
//  console.log(data);
//});

//Uncomment this if you want to test Video
yt.fetchVideo('cow', 1, function(error, data){
  if(error) {
    console.log('Error: '+error);
    return;
  }
  //results is now filled in with the sounds
  console.log(data);
});

//Uncomment that if you want to test Audio
//fs.fetchSound('cow', 1, function(error, data){
//  if(error) {
//    console.log('Error: '+error);
//    return;
//  }
//  //results is now filled in with the sounds
//  console.log(data);
//});

//Uncomment that one to test dbpedia
//dbpedia.fetch("Blue Marlin", "Fish", function(error, data){
  //results is now filled in with the sounds
  //console.log(data);
//});
/*
var rucod = require('./store');
var coJson = {"ID":1,"Name":"Blue Marlin","Screenshot":"http://gdv.fh-erfurt.de/modeldb/media/model/BulueMarlin0.jpg","CategoryPath":"Animal/Fish","Files":[{"Type":"Text","FreeText":"The Atlantic blue marlin (Makaira nigricans) is a species of marlin endemic to the Atlantic Ocean. The Atlantic blue marlin (hereafter, marlin) feeds on a wide variety of organisms near the surface. By using its bill, it can stun, injure, or kill while knifing through a school of prey and then return later at its leisure to eat. Marlin is a popular game fish and has commercial value because its meat has a relatively high fat content."},{"Type":"Object3D","Name":"Blue Marlin","Tags":[""],"Extension":"3ds","License":"GPL","LicenseURL":"http://www.gnu.org/licenses/gpl-3.0.html","Author":"Unkown","Date":"2010-09-02 18:54:52","Size":"212472","URL":"http://gdv.fh-erfurt.de/modeldb/media/model/BulueMarlin0.3ds","Preview":"http://gdv.fh-erfurt.de/modeldb/media/model/BulueMarlin0.jpg","Emotions":null,"Location":"","Weather":{"condition":"","wind":"","temperature":"","humidity":""}},{"Type":"ImageType","Name":"Sailfish? Marlin ? Swordfish ?","Tags":["galapagos","diving","scuba","nikond80","underwaterphotography","aggressor1","水中写真","潛水"],"Extension":"jpg","License":"All Rights Reserved","LicenseURL":"","Author":"Dominic","Date":"2008-12-21 12:54:21","Size":"[object Object]","URL":"http://farm4.static.flickr.com/3250/3140042404_1af0577858_b.jpg","Preview":"http://farm4.static.flickr.com/3250/3140042404_1af0577858_s.jpg","Dimensions":"","Emotions":null,"Location":"0.381772,-90.4216,0,0","Weather":{"condition":"","wind":"","temperature":"","humidity":""}},{"Type":"VideoType","Name":"Blue Marlin underwater encounter at La Parguera, Puerto Rico","Tags":[""],"Extension":"","License":"All right reserved","LicenseURL":"http://www.youtube.com","Author":"detourPR","Date":"2009-02-12T05:43:22.000Z","Size":"","URL":"https://www.youtube.com/watch?v=4kvpYWk4HYo","Preview":"http://i.ytimg.com/vi/4kvpYWk4HYo/default.jpg","Dimensions":"","Length":"115","Emotions":null,"Location":"","Weather":{"condition":"","wind":"","temperature":"","humidity":""}},{"Type":"SoundType","Name":"CFv1_track12.wav","Tags":["baja-california-sur","isla-san-jose","agua-verde","aguasonic","delphinus-delphis"],"Extension":"wav","License":"","LicenseURL":"","Author":"aguasonic","Date":"2008-11-24 13:14:57","Size":"","URL":"http://beta.freesound.org/people/aguasonic/sounds/63595/","Preview":"http://beta.freesound.org/data/displays/63/63595_610919_wave_M.png","Length":"241.816780045","Emotions":["affectionate"],"Location":"","Weather":{"condition":"","wind":"","temperature":"","humidity":""}}]};

rucod.store(coJson,1,function(info) {
	 console.log(info);
});*/
// Test for best match selection
/*
var tq = "Samurai Sword";
var tr = [{Name: "Samurai Swords"},
          {Name: "Samurai Swords"},
          {Name: "Samurai Sword Kata"},
          {Name: "Samurai Swords"},
          {Name: "Samurai 3000 Swords"},
          {Name: "Samurai Swords"},
          {Name: "Samurai sword"},
          {Name: "Samurai Katana"},
          {Name: "Glistening blades of Samurai swords"},
          {Name: "Fuji FinePix HS10.Flash+Macro+Optical Zoom.Scabbard And Samurai Sword.October 29th 2010."}];

var getBestMatch = function(query, results, callback) {
	
	var levenDistance = function(v1, v2){
        d = [];
        
        for( i=0; i < v1.length; i++)
				d[i] = [];
				
		if (v1[0] != v2[0])
			d[0][0] = 1;
		else
			d[0][0] = 0;

        for( i=1; i < v1.length; i++)
            d[i][0] = d[i-1][0] + 1;
		
        for( j=1; j < v2.length; j++)
			d[0][j] = d[0][j-1] + 1;
            
        for( i=1; i < v1.length; i++)
		{
            for( j=1; j < v2.length; j++)
            {
                cost = 0;
                if (v1[i] != v2[j])
                    cost = 1;
                
                d[i][j] = d[i-1][j] + 1;
                if ( d[i][j] > d[i][j-1]+1 ) d[i][j] = d[i][j-1] + 1;
                if ( d[i][j] > d[i-1][j-1]+cost ) d[i][j] = d[i-1][j-1] + cost;
            }
		}

        return d[v1.length-1][v2.length-1] || 0;
    };
	
	var q = query || '';
	var r = results || [];
	var matchList = [];
	var diffList = [];
	
	if(q.length < 3 || r.length < 1) {
		callback('Missing Input', null);
	} else {
		
		
		//Get all words of query
		var qwords = q.split(" ");
		//Remove query words shorter than 3 characters (e.g. "is" or "a")
		var removeShort = function(words) {
			for(var i=0; i < words.length; i++) {
				if(words[i].length < 3) {
					words.splice(i,1);
					removeShort(words);
				}
			}
			return words;
		};
		qwords = removeShort(qwords);
		
		//1. First round - generate a list of occurrences of the query words within the result titles 
		
		//For each result item
		for(var i=0; i < r.length; i++) {
			
			matchList[i] = 0;
			
			//For each relevant query word
			for(var w=0; w < qwords.length; w++) {
				//Find if the query word exists in the result item name
				var rx = new RegExp(qwords[w],"gi");
				//And add a point for this result item if so	
				if(r[i].Name.search(rx) !== -1) {
					matchList[i] = (isNaN(matchList[i]) ? 1 : matchList[i] + 1);
				}
			}
		}
		
		//2. Second round - generate a list of differences between query and result titles
		
		var joinedQuery = qwords.join(' ');
		
		//For each result item
		for(var res=0; res < r.length; res++) {
			diffList[res] = 0;
			diffList[res] = levenDistance(r[res].Name.toLowerCase(),joinedQuery.toLowerCase());
		}
		
		//3. Third round - generate the result with the two most fitting result items
		
		var w1 = {Id: -1, Matches: 0, Diff: 1000}, 
	        w2 = {Id: -1, Matches: 0, Diff: 1000};
		
		for(var i=0; i < r.length; i++) {
			if(matchList[i] >= w1.Matches && diffList[i] < w1.Diff && diffList[i] <= 30) {
				if(w1.Id > -1) {
					w2.Id = w1.Id;
					w2.Matches = w1.Matches;
					w2.Diff = w1.Diff;
				}
				w1.Matches = matchList[i];
				w1.Diff = diffList[i];
				w1.Id = i;
			}
		}
		
		//4. Test the results
		
		//If we have both winners, return both in an array
		if(w1.Id > -1 && w2.Id > -1) {
			callback(null, new Array(r[w1.Id],r[w2.Id]));
		//Else just return the available winner	
		} else if(w1.Id > -1){
			callback(null, new Array(r[w1.Id]));
		} else if(w2.Id > -1) {
			callback(null, new Array(r[w2.Id]));	
		//or nothing	
		} else {
			callback(null, null);
		}
		
	}
};

getBestMatch(tq, tr, function(error, data) {
	if(error) {
		console.log("error: "+error);
	}
	console.log("The closest result:" + data[0].Name);
	console.log("The second closest result:" + data[1].Name);
});*/
//Test get youtube video source
/*
var restler = require('restler'),
    querystring = require('querystring');

var getVideoSourceUrl = function(youtubeLink, id, callback) {

  var result = false;

  var videoId = youtubeLink.substr(youtubeLink.lastIndexOf('=') + 1);
  var infoUrl = 'http://youtube.com/get_video_info?video_id=' + videoId;

  restler
  .get(infoUrl)
  .on('complete', function(data) {    
    try {
      var vInfoResponse = querystring.parse(data);
      
      if (vInfoResponse['status'] === "fail") {
        throw 'The video seems to be unavaiable in your country. Please choose another one.';
      }

      var vInfoUrls = vInfoResponse['url_encoded_fmt_stream_map'].split(',');
      var vDataUrl = '';

      for ( var u = 0; u < vInfoUrls.length; u++) {
        vInfoUrls[u] = decodeURIComponent(vInfoUrls[u].replace(/\+/g, " "));
        //get everything after 'url=' 
        vInfoUrls[u] = vInfoUrls[u].substring(
                vInfoUrls[u].indexOf('=') + 1,
                vInfoUrls[u].lastIndexOf(';') < 0 ? vInfoUrls[u].length : vInfoUrls[u].lastIndexOf(';')
        );
        //get the right video format
        if (vInfoUrls[u].indexOf('video/mp4') > 0) {
          callback(null, id, decodeURIComponent(vInfoUrls[u]));
          break;
        }
      }
      
    } catch (error) {
      callback(error, id, null);
    }
  })
  .on('error', function(error) {
    callback(error, id, null);
  }); 

};

getVideoSourceUrl('http://www.youtube.com/watch?v=hBUdimWVcyw', 0, function(error, id, data) {
  if(error) {
    console.log('Error ' + id + ': ' + error);
    return;
  }
  console.log('Data ' + id + ': ' + data);
});
*/