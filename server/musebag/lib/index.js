/**
 * @package MuseBag - Multimodal Search Interface
 * 
 * @description This is the main entry point for the server functionalities of the Multimodal
 * Search Interface of I-SEARCH.
 * 
 * @author Arnaud Brousseau and Jonas Etzold
 * @company Google Deutschland GmbH, University of Applied Sciences Erfurt
 */

var express = require('express'),
    redisStore = require('connect-redis')(express),
    musebag = require('./musebag');

var app = module.exports = express.createServer();

//Nodules module reloading    
require.reloadable(function(){
	musebag = require('./musebag');
});

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: "isearchsession", store: new redisStore }));
  app.use(app.router);
  app.use(express.static('/var/www/isearch/client/musebag'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
app.get('/blaa', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

app.post('/login', function(req, res){
	console.log("Login function called...");
	console.log(req.body);
	musebag.login(req.body, function(error, data) {
		
		if(error) {
			console.log(error);
			res.send(error);
			return;
		}
		
		console.log("User logged in.");
		console.log(data);
		
		res.send("User logged in.");
	});
});

app.listen(8081);
console.log("MuseBag Express server listening on port %d in %s mode", app.address().port, app.settings.env);
