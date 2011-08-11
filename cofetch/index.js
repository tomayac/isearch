/*******************************
 This script is the main JS file
 -------------------------------
 It will handle the connections
 and the interactions with the
 GUI (POST and GET requests).
 ******************************/
 
var cofetch = require('./fetch');
 
//Let's use express to handle GET and POST requests
var server = require('express').createServer();
var port = 8082;

server.get('/:id', function(req, res){
   
   //Fetch the CO
   cofetch.get(req.param.id, function(data){
   
     //Write the data back
     res.writeHead(200, {'Content-Type': 'text/plain'});
     res.end('cofetchcb(\'{"data": ' + data + '}\')');
   
   });
 });
 
server.post('/save', function(request, response){
  //Here is the JSON data
  console.log(request.body.json);
  
  //TODO: store the data
  
});

//Run the server on port #8082
server.listen(port);