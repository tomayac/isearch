var fs = require('fs'), nodeio = require('node.io'), rucod = require('./store'), step = require('./step');

var basepath = '/var/www/isearch/client/cofetch/output';
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

walk(basepath, function(err, results) {
  if (err) throw err;
  
  var count = 0;
  var jsoncount = 0;
  var errorcount = 0;
  var processed = 0;
  var countxml = 0;
  
  var endtest = function() {
    if((errorcount+processed) == jsoncount) {
      console.log('json: ' + count + ' xml: ' + countxml + ' processed: ' + processed + ' errors: ' + errorcount);
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
        var webOutputUrl = file.replace(/\/var\/www\/isearch\/client\//g, 'http://isearch.ai.fh-erfurt.de/');
        
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
        console.log('Recreate error : '+ e);
        errorcount++;
        endtest();
      }
    }
    if(ext == 'xml') {
      countxml++;
    }
  });
  
});
/*
var job = new nodeio.Job({
  recurse : true
}, {
  input : basepath,
  run : function(full_path) {

    var ext = (/[.]/.exec(full_path)) ? /[^.]+$/.exec(full_path) : undefined;

    if (ext == 'json') {
      
      var context = this;
      
      var fileContents = fs.readFileSync(full_path);
      try {
        var coJson = JSON.parse(fileContents);
        var outputPath = full_path.substring(0,(full_path.lastIndexOf('/')+1));
        var webOutputUrl = full_path.replace(/\/var\/www\/isearch\/client\//g, 'http://isearch.ai.fh-erfurt.de/');
        
        rucod.publishRUCoD(coJson, outputPath, webOutputUrl, true, function(error, data) {
          if (error) {
            console.log('Recreate store error     : ' + error);
          } else {
            console.log('Recreate store success   : ' + data.message);
          }
          context.emit();
        });
        context.emit();
      } catch (e) {
        errorCount++;
        console.log('Recreate error ' + errorCount + ': '+ e);
        this.emit();
      }
    } else {
      this.emit();
    }
  }
});

nodeio.start(job, {});*/