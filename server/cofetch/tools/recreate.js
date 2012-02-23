var fs     = require('fs'), 
    nodeio = require('node.io'), 
    rucod  = require('../store'), 
    step   = require('../lib/step');

var basepath = '../../../client/cofetch/output';
var weburl = 'http://isearch.ai.fh-erfurt.de';

var search = 'client/'; 
var errorCount = 0;

var fs = require('fs');
var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};

//Check if the a user specific server url was given
var arguments = process.argv.splice(2);
if(isNaN(arguments[0]) && arguments[0].length > 5) {
  weburl = 'http://' + arguments[0];
} 

walk(basepath, function(err, results) {
  if (err) throw err;
  
  var count = 0;
  var jsoncount = 0;
  var errorcount = 0;
  var processed = 0;
  var countxml = 0;
  
  var errorlist = '';
  
  var endtest = function() {
    if((errorcount+processed) == jsoncount) {
      console.log(errorlist);
      console.log('json: ' + jsoncount + ' xml: ' + countxml + ' processed: ' + processed + ' errors: ' + errorcount);
    }
  };  
  
  results.forEach(function(file) {
    count++;
    var ext = (/[.]/.exec(file)) ? /[^.]+$/.exec(file) : undefined;
    if (ext == 'json') {
      jsoncount++;
      var fileContents = fs.readFileSync(file);
      try {
        var coJson = JSON.parse(fileContents);
        var outputPath = file.substring(0,(file.lastIndexOf('/')+1));
        var webOutputUrl = weburl + file.substring((file.lastIndexOf(search)+search.length),file.length);
        
        rucod.publishRUCoD(coJson, outputPath, webOutputUrl, true, function(error, data) {
          if (error) {
            console.log('Recreate store error     : ' + error);
            errorcount++;
            endtest();
          } else {
            console.log('Recreate store success   : ' + data.message);
            processed++;
            endtest();
          }
        });
      } catch (e) {
        errorlist += 'Recreate error in ' + file + ': ' + e.message + '\n';
        errorcount++;
        endtest();
      }
    }
    if(ext == 'xml') {
      countxml++;
    }
  });
  
});
