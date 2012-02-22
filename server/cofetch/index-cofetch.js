/**
 * This is the main server script of CoFetch,
 * a tool which is able to retrieve and create
 * semi- and automatically content objects for
 * I-SEARCH. 
 *
 * This script serves the GUI of this tools and handles all 
 * communication with it via typical HTTP requests
 * (e.g. GET and POST).
 * 
 * This tool was created by Google GmbH Germany
 * and the University of Applied Sciences Fulda, Germany
 * for the use within the European FP7 I-SEARCH Project.
 * 
 * @author Jonas Etzold and Arnaud Brousseau
 * 
 */
var express = require('express'),
    cofetch = require('./cofetch');

var port    = 8085;
var app     = module.exports = express.createServer();

//Configuration
app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static('../../client/cofetch'));
  app.use(express.logger({ format: ':method :url' }));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.enable("jsonp callback");

//Routes
console.log("Register CoFetch functions...");

app.get  ('/get/:query/:category/:automatic', cofetch.get);
app.get  ('/getCat'                         , cofetch.getCat);
app.get  ('/getPart/:type/:query/:page/:gps', cofetch.getPart);
app.post ('/post'                           , cofetch.post);

app.listen(port);

console.log("CoFetch Express server listening on port %d in %s mode", app.address().port, app.settings.env);
