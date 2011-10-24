//var skp = require('./sketchup');
//var yt = require('./youtube');
//var fs = require('./freesound');
//var mdb = require('./modeldb');
//var dbpedia = require('./dbpedia');

//skp.fetchThreed('cow', function(error, data){
//  //results is now filled in with 3d models from google warehouse
//  console.log(data);
//});

//Uncomment this if you want to test Video
//yt.fetchVideo('cow', function(error, data){
//  //results is now filled in with YouTube videos
//  console.log(data);
//});

//Uncomment that if you want to test Audio
//var audioResults = [];
//fs.fetch('cow', audioResults, true, function(error, data){
//  //results is now filled in with the sounds
//  console.log(audioResults);
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

var tq = "the batman";
var tr = [{Name: "the Joker"},
          {Name: "is the best movie"},
          {Name: "a bat in disguise"},
          {Name: "joker strikes back"},
          {Name: "Comic Convention with Batman"},
          {Name: "Nice bat costum"},
          {Name: "Gotham City Hero"},
          {Name: "the original Batman movie"},
          {Name: "this Batman is awesome"}];

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

		//For each result item
		for(var i=0; i < r.length; i++) {
			//For each relevant query word
			for(var w=0; w < qwords.length; w++) {
				//Find if the query word exists in the result item name
				var rx = new RegExp(qwords[w],"gi");
				//And add a point for this result item if so	
				if(r[i].Name.search(rx) !== -1) {
					matchList[i] = (isNaN(matchList[i]) ? 1 : matchList[i] + 1);
				} else {
					matchList[i] = 0;
				}
			}
		}
		
		var joinedQuery = qwords.join(' ');
		var realMatches = 0;
		
		var w1 = [0,0], 
		    w2 = [0,0];
		var wd1 = 1000, 
		    wd2 = 1000;
		
		for(var m=0; m < matchList.length; m++) {
			if(matchList[m] > 0) {
				realMatches++;
			}
		}

		//Check what result item has the highest matching with the query
		if(realMatches > 1) {
			for(var i=0; i < matchList.length; i++) {
				if(matchList[i] > w1[1]) {
					w2 = new Array(w1[0],w1[1]);
					w1[0] = i;
					w1[1] = matchList[i];
				}
			}

			//Get most similar candidate with a Levenstein distance calculation
			wd1 = levenDistance(r[w1[0]].Name,joinedQuery);
			wd2 = levenDistance(r[w2[0]].Name,joinedQuery);
			
		} else {
			
			var td = 0;
			for(var i=0; i < r.length; i++) {
				td = levenDistance(r[i].Name,joinedQuery);
				if(td < wd2) {
					wd2 = td;
				}
				if(wd1 > wd2) {
					wd1 = wd2;
				}
			}
		}

		//return the closest result item
		if( wd1 <= wd2 ){
			callback(null, r[w1[0]]);
		} else {
			callback(null, r[w2[0]]);
		}
	}
};

getBestMatch(tq, tr, function(error, data) {
	if(error) {
		console.log("error: "+error);
	}
	console.log("The closest result:" + data.Name);
});