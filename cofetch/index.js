/*******************************
 This script is the main JS file
 -------------------------------
 It will handle the connections
 and the interactions with the
 GUI (POST and GET requests).
 -------------------------------
 To make this work: 
 1. node npm install -g express
 2. node index.js (this file)
 3. visit http://localhost/get/23 
    (for instance)
 ******************************/
 
var cofetch = require('./fetch');
 
//Let's use express to handle GET and POST requests
var server = require('express').createServer();
var port = 8082;

server.get('/get/:id', function(req, res){
   
   //Fetch the CO
   cofetch.get(req.params.id, function(blablaWillBeNul, data){
      
     var responseString = JSON.stringify(data);
     console.log("Success! Here is the CO: ");
     console.log(responseString);
     
     //Write the data back
     res.writeHead(200, {'Content-Type': 'text/plain'});
     res.end('cofetchcb(\'{' + responseString + '}\')');
   
   });
 });
 
server.post('/save', function(request, response){
  //Here is the JSON data
  console.log(request.body.json);
  
  //TODO: store the data
  
});

//Run the server on port #8082
server.listen(port);