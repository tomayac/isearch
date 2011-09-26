/**
 * @package CoFind - Collaborative Search Component
 * 
 * @description This is the main entry point for serving the functionalities for collaborative search
 * within I-SEARCH.
 * 
 * The general workflow in CoFind is:
 * - user logs into I-SEARCH over Search Interface
 * - login approved by Personalisation Component
 * - Search Interface establishes session
 * - Search Interface registers user in CoFind (registerUser(email))
 * - Search Interface queries CoFind interfaceSnippet(email) function to retrieve CoFind HTML Snippet and register the user
 * - 
 * 
 * @author Jonas Etzold
 * @company University of Applied Sciences Erfurt
 */
var webservice = require('webservice'),
    io = require('socket.io'),
    helper = require('./helper');

webservice.createServer(helper);
io.listen(webservice);
webservice.listen(8084);
console.log(' > CoFind webservice started on port 8084');

//
io.sockets.on('connection', function (socket) {
  
	socket.emit('message', { data: 'You are connected!' });
    
	socket.on('registerUser', function (data) {
		//Register user in CoFind database
		//
    });
    
	socket.on('addUser', function (data) {
		console.log(data);
		//Add web socket flag to data object
		
		helper.getUser({email: data.email}, function(error, user) {
			if(error) {
				socket.emit('message',{data: error});
			}
			
			//Sent invitation message to specific user
			
			//Handle all socket communication here
			socket.emit('message',{data: 'User invite sent.'});
		});
		
	});
	
	socket.on('joinSession', function (data) {
		console.log(data);
		
		//Handle all socket communication here
		socket.emit('message',{data: 'User joined session.'});
		
	});
	
	socket.on('distributeInterfaceChange', function (data) {
		console.log(data);
		
		helper.getUser({email: data.email}, function(error, user) {
			if(error) {
				socket.emit('message',{data: error});
			}
			
			//Handle all socket communication here
			socket.emit('update',{elementID: data.elementID, content: data.content});
		});
		
	});
	
	socket.on('sendMessage', function (data) {
		console.log(data);
		
		helper.getUser({email: data.email}, function(error, user) {
			if(error) {
				socket.emit('message',{data: error});
			}
			
			//Handle all socket communication here
			socket.emit('message',{data: data.message});
		});
		
	});
	
	socket.on('deleteUser', function (data) {
		console.log(data);
		
		helper.getUser({email: data.email}, function(error, user) {
			if(error) {
				socket.emit('message',{data: error});
			}
			
			//Handle all socket communication here
			socket.emit('message',{data: 'User deleted from session.'});
		});
		
	});
	
	socket.on('closeSession', function (data) {
		console.log(data);
			
		//Handle all socket communication here
		socket.emit('message',{data: 'Session closed.'});
		
		//Close session
		
	});
});