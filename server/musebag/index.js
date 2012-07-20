/**
 * @package MuseBag - Multimodal Search Interface
 * 
 * @description This is the main entry point for the server functionalities of the Multimodal
 * Search Interface of I-SEARCH.
 * 
 * @author Arnaud Brousseau and Jonas Etzold
 * @company Google Deutschland GmbH, University of Applied Sciences Erfurt
 */

var express    = require('express'),
    redisStore = require('connect-redis')(express),
    musebag    = require('./musebag'),
    cofind     = require('./cofind');

var sess  = new redisStore;
var app   = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser({uploadDir: '../../client/musebag/tmp', encoding: 'binary', keepExtensions: true}));
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: "isearchsession", store: sess }));
  app.use(app.router);
  app.use(express.static(__dirname+'/../../client/musebag'));
  app.use(express.logger({ format: ':method :url' }));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
console.log("Register MuseBag functions...");

app.post('/login'           , musebag.login);
app.del ('/login'           , musebag.logout);

app.get ('/profile'         , musebag.profile);
app.get ('/profile/history' , musebag.getProfileHistory);
app.get ('/profile/:attrib' , musebag.profile);
app.post('/profile/history' , musebag.updateProfileHistory);
app.post('/profile/:attrib' , musebag.setProfile);

app.post('/query/stream'    , musebag.queryStream);
app.post('/query/item'      , musebag.queryItem);
app.post('/query'           , musebag.query);

app.listen(8081);

//Start CoFind for collaborative search
cofind.initialize(app,sess);

console.log("MuseBag Express server listening on port %d in %s mode", app.address().port, app.settings.env);

