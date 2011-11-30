var fs = require('fs'), nodeio = require('node.io'), rucod = require('./store');

var basepath = '/var/www/isearch/client/cofetch/output';

var job = new nodeio.Job({
  recurse : true
}, {
  input : basepath,
  run : function(full_path) {

    var ext = (/[.]/.exec(full_path)) ? /[^.]+$/.exec(full_path) : undefined;
    console.log('ext: '+ext);
    if (ext == 'json') {
      console.log('Recreate file path       : ' + full_path);
      var context = this;
      
      var fileContents = fs.readFileSync(full_path,'utf8');
      try {
        var coJson = JSON.parse(fileContents);
        console.log(coJson);
        context.emit();/*
        rucod.store(data, true, true, false, function(error, data) {
          if (error) {
            console.log('Recreate store error     : ' + error);
          } else {
            console.log('Recreate store success   : ' + message);
          }
        });*/
      } catch (e) {
        console.log('Recreate file read error : ' + e);
      }
    } else {
      this.emit();
    }

  }
});

nodeio.start(job, {});