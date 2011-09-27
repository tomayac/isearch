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
	if(req.session.user) {
		res.send("Hello " + req.session.user.Email + ". You were born on " + req.session.user.Dob);
	}
	else {
		res.send("Sorry you're not logged in.");
	}
});

app.get('/profile/:attrib', function(req, res) {
	var attrib = req.params.attrib;
	
	//Does a user is logged in?
	if(!req.session.user) {
		res.send(JSON.stringify({error : 'You are not logged in!'}));
	}
	//Does the requested profile attribute is available
	if(req.session.user[attrib]) {
		res.send(JSON.stringify({'' + attrib + '' : req.session.user[attrib]}));
	} else {
		res.send(JSON.stringify({error : 'The requested user profile attribute is not available!'}));
	}
});

app.post('/login', function(req, res){
	console.log("Login function called...");

	musebag.login(req.body, function(error, data) {
		
		if(error) {
			console.log(error);
			res.send(error);
			return;
		}
		
		//Store user data in session
		req.session.user = data;
		
		res.send(JSON.stringify(data));
	});
});

app.listen(8081);
console.log("MuseBag Express server listening on port %d in %s mode", app.address().port, app.settings.env);
