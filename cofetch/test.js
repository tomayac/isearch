var yt = require('./youtube');
var fs = require('./freesound');
var mdb = require('./modeldb');

//Uncomment this if you want to test Video
//var results = [];
//yt.fetch('cow', results, function(error, data){
//  //results is now filled in with YouTube videos
//  console.log(results)
//});

//Uncomment that if you want to test Audio
//var audioResults = [];
//fs.fetch('cow', audioResults, true, function(error, data){
//  //results is now filled in with the sounds
//  console.log(audioResults);
//});

//Uncomment that one to test ModelDB
var modelDbResults = [];
mdb.fetch(1, modelDbResults, function(error, data){
  //results is now filled in with the sounds
  console.log(modelDbResults);
});