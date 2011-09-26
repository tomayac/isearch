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
    musebag = require('./musebag');

var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'isearchsession' }));
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
	musebag.login({email: req.body.email, pw: req.body.pw}, function(error, data) {
		console.log("User logged in.");
	});
});

app.listen(8081);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
