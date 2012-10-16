/**
 * @package MuseBag - Multimodal Search Interface
 * 
 * @description This is the main entry point for the server functionalities of the Multimodal
 * Search Interface of I-SEARCH.
 * 
 * @author Arnaud Brousseau and Jonas Etzold
 * @company Google Deutschland GmbH, University of Applied Sciences Fulda
 */

var express    = require('express'),
    redisStore = require('connect-redis')(express),
    fs         = require('fs'),
    config     = require('./config'),
    musebag    = require('./musebag'),
    ptag       = require('./ptag'),
    cofind     = require('./cofind');

var sess  = new redisStore;
var app   = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser({uploadDir: config.tempPath, encoding: 'binary', keepExtensions: true}));
  app.use(function(req, res, next) {
    //Special handling for recorded raw audio data
    if(req.headers['content-type'] === 'audio/x-wav') {
      var start = 0;
      var dataBuffer = new Buffer(parseInt(req.headers['content-length']));
      
      req.on('data', function(chunk) {
        chunk.copy(dataBuffer,start);
        start += chunk.length;
      });
      req.on('end', function() {
        var fileName = new Date().getTime() + '-recording.wav';
        fs.writeFile(config.tempPath + '/' + fileName, dataBuffer, function(error) {
          if(error) {
            console.log(error);
          } else {
            console.log('wav uploaded and stored');
            req.files = { 
              'files' : {
                'path' : config.tempPath + '/' + fileName,
                'name' : fileName,
                'type' : req.headers['content-type'],
                'size' : dataBuffer.length,
                'data-subtype' : 'recording'
              }
            };
          }               
          next();
        });
      });      
    } else {
      next();
    }
  });
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: "isearchsession", store: sess }));
  app.use(app.router);
  app.use(express.static(__dirname+'/../../client/musebag'));
  app.use(express.logger({ format: ':method :url' }));
  app.enable('trust proxy');
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
app.post('/profile'         , musebag.setProfile);
app.post('/profile/history' , musebag.updateProfileHistory);

app.post('/query/stream'    , musebag.queryStream);
app.post('/query/item'      , musebag.queryItem);
app.post('/query'           , musebag.query);

app.post('/result/item'     , musebag.addResultItem);
app.del ('/result/item'     , musebag.deleteResultItem);

//use case specific routes
app.get('/'                         , musebag.setUseCase);
app.get(/\/(music|furniture|video)/ , musebag.setUseCase);

//Routes for pTag
console.log("Register pTag functions...");

app.get  ('/ptag/tagRecommendations', ptag.tagRecommendations);
app.get  ('/ptag/filterTags', ptag.filterTags);
app.get  ('/ptag/resultTagRecommendations/:queryId/:resultItemTags', ptag.resultTagRecommendations);
app.post ('/ptag/tag', ptag.tag);
app.post ('/ptag/implicitTags', ptag.implicitTags);

//Start listening
app.listen(8081);

//Initialize pTag component
ptag.initialize();

//Start CoFind for collaborative search
cofind.initialize(app,sess);

console.log("MuseBag Express server listening on port %d in %s mode", app.address().port, app.settings.env);

