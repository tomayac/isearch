var fs = require('fs'), nodeio = require('node.io'), rucod = require('./store');

var basepath = '/var/www/isearch/client/cofetch/output/';

var job = new nodeio.Job({
  recurse : true
}, {
  input : basepath,
  run : function(full_path) {

    console.log('Recreate file path       : ' + full_path);
    var ext = (/[.]/.exec(full_path)) ? /[^.]+$/.exec(full_path) : undefined;
    console.log('Recreate file extension  : ' + ext);

    if (ext === 'json') {
      fs.readFile(full_path, function(error, data) {
        if (error) {
          console.log('Recreate file read error : ' + error);
        } else {
          console.log(data);/*
          rucod.store(data, true, true, false, function(error, data) {
            if (error) {
              console.log('Recreate store error     : ' + error);
            } else {
              console.log('Recreate store success   : ' + message);
            }
          });*/
        }
      });
    }

    this.emit();
  }
});

nodeio.start(job, {});