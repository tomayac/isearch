var yt = require('./youtube');
//var fs = require('./freesound');
//var mdb = require('./modeldb');
//var dbpedia = require('./dbpedia');

//Uncomment this if you want to test Video
yt.fetchVideo('cow', function(error, data){
  //results is now filled in with YouTube videos
  console.log(data);
});

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