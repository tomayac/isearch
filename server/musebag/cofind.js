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

/**
 * Required node modules
 */
var now        = require('now'),
    restler    = require('restler');

/**
 * Global variables
 */
var everyone = null;
var users = [];
var userCount = 0;

/**
 * private functions
 */
var getUser = function(email) {
  if(email in users) {
    return users[email] != undefined ? users[email] : false;
  } else {
    return false;
  }
};

var getUserByClient = function(clientId) {
  for(var email in users) {
    if(users[email].indexOf(clientId) != -1) {
      return email;
    }
  }
  return false;
};

var callUserFunction = function(email, func, args) {
  var func = func || '';
  var user = getUser(email || '');
  if(!user) {
    return {'error' : 'User not online'};
  }
  
  if(user && everyone.now[func]) {
    user.forEach(function(clientId) {
      //Call the function for a specific user
      now.getClient(clientId, function() {
        this.now[func].apply(this, args);
      });
    });
    return {'success' :  true};
  } else {
    return {'error' : 'User function is unknown.'};
  }
};


var setupLogic = function() {
  /**
   *  registerUser function 
   */
  everyone.now.registerUser = function(email){
    console.log('Register: ' + email + '(' + this.user.clientId + ')');
    if(email in users) {
      if(!(this.user.clientId in users[email])) {
        //Since a user can be logged in multiple times on different browsers we'll deal with
        //multiple client ids
        users[email].push(this.user.clientId);
      }
    } else {
      users[email] = [this.user.clientId];
      userCount++;
    }
    console.log('Registry: ');
    console.log(users);
  };
  /**
   *  unregisterUser function 
   */
  everyone.now.unregisterUser = function(email){
    console.log('Unregister: ' + email + '(' + this.user.clientId + ')');
    
    //delete the whole user from the registry
    if(userCount > 1) {
      var userIndex = 0;
      if(email in users) {
        delete users[email];
        userCount--;
      }
    } else {
      users = [];
      userCount = 0;
    }
    console.log('Registry: ');
    console.log(users);
  };
  /**
   *  inviteUser function 
   */
  everyone.now.inviteUser = function(emailTo){
    
    var emailFrom = getUserByClient(this.user.clientId);
    
    console.log('Invite: ' + emailTo + ' from ' + emailFrom + ' (' + this.user.clientId + ')');
    //Call the invited client specifically if the invited user exists
    var response = callUserFunction(emailTo, 'triggerInvitation', [emailFrom]);
    if(response.success) {
      callUserFunction(emailFrom, 'notify', ['User invited...','success']);
      //Create session group
      var group = now.getGroup('group-' + emailFrom);
      //add the user who invited 
      group.addUser(this.user.clientId);
    } else {
      callUserFunction(emailFrom, 'notify', [response.error,'error']);
    }
    
  };
  
  /**
   *  acceptInvitation function 
   */
  everyone.now.acceptInvitation = function(email){
    
    var emailFrom = getUserByClient(this.user.clientId);
    
    var group = now.getGroup('group-' + email);
    //add the user who invited 
    group.addUser(this.user.clientId);
    
    callUserFunction(email, 'notify', [emailFrom + ' joined your session.','success']);
  };
  
  /**
  *  declineInvitation function 
  */
  everyone.now.declineInvitation = function(email){
    
    var emailFrom = getUserByClient(this.user.clientId);
    
    callUserFunction(email, 'notify', [emailFrom + ' declined your invitation.','error']);
  };
  
  /**
   *  addUser function 
   */
  everyone.now.addUser = function(email){
    
  };
  /**
   *  removeUser function 
   */
  everyone.now.removeUser = function(email){
    
  };
  
  /**
   * disconnected function
   * called everytime a client lost the connection to CoFind.
   * The function then removes the client id from the user registry
   */
  everyone.disconnected(function(){
    console.log('disconnected: '+this.user.clientId);

    var userIndex = 0;
    for(var email in users) {
      var index = users[email].indexOf(this.user.clientId);
      if(index != -1) {
        //If there are more than one client connected
        if(users[email].length > 1) {
          console.log('delete client id');
          //delete the client id from the users list
          users[email].splice(index,1);
        } else {
          console.log('delete user '+userIndex);
          //delete the whole user from the registry
          if(userCount > 1) {
            delete users[email];
            userCount--;
          } else {
            users = [];
            userCount = 0;
          }
        }
      } 
      userIndex++;  
    }
    console.log(users);
  });
  
};

/**
 * public functions
 */
exports.initialize = function(server) {
  //Initialize now.js which is the base for CoFind
  everyone = now.initialize(server);
  console.log("Register CoFind functions...");
  setupLogic();
};


