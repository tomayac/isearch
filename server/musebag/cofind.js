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
var store = null;
var everyone = null;
var users = [];
var userCount = 0;

/**
 * private functions
 */
var getSessionId = function(cookie) {
  var first = null;
  
  for (var key in cookie) {
    first = cookie[key];
    if (cookie.hasOwnProperty(key) && typeof(first) !== 'function') {
        break;
    }
  }
  return first;
};

var getUser = function(email) {
  if(email in users) {
    return users[email].clients.length > 0 ? users[email] : false;
  } else {
    return false;
  }
};

var getEmailByClient = function(clientId) {
  for(var email in users) {
    if(users[email].clients.indexOf(clientId) != -1) {
      return email;
    }
  }
  return false;
};

var getGroupUsers = function(group,callback, onlyEmails) {
   var onlyEmail = onlyEmails || false;
   if(group) {
     group.getUsers(function(users) { 
       var groupUsers = [];
       for (var i in users) {
         var email = getEmailByClient(users[i]);
         //Only add the user if the given clientId has an associated email address in the users
         //array and if this email address doesn't already exists in the groupUsers array
         if(email && !groupUsers.hasOwnProperty(email)) {
           if(onlyEmail) {
             groupUsers.push(email);
           } else {
             var tempUser = getUser(email);  
             groupUsers.push([email,tempUser.messages]);
           }
         }
       }
       callback(null,groupUsers);
     });
   } else {
     callback(false,null);
   }
};

var hasGroup = function(groupName, callback) {
  now.getGroups(function(groups) {
    for(var index in groups) {
      if(groupName === groups[index]) {
        callback(true);
        return;
      }
    }
    callback(false);
  });
};

var removeGroupFromUser = function(email,groupName) {
  var gId = users[email].groups.indexOf(groupName);
  if(gId > -1) {
    users[email].groups.splice(gId, 1);
  }
};

var removeGroup = function(group) {
  if(!group || typeof group != 'object') {
    return false;
  }
  //trigger the client to clear its group state
  group.now.updateGroupState(false,[],false);
  //and to remove its result basket
  group.now.removeResultBasket();
  //save the result basket in the search histories of the users
  group.now.saveResultBasket(group.now.resultBasket,function(isSaved) {
    //remove the group relation from every user when the group is removed
    for(var email in users) {
      user = getUser(email);
      if(user) {
        removeGroupFromUser(email,group.groupName);
      }
    }
    //remove the group
    now.removeGroup(group.groupName);
  });
  
  return true;
};

var handleGroupLeave = function(groupName,email,clientId) {
  console.log('handleGroupLeave...');
  
  var group = now.getGroup(groupName);
  //don't care about super group events   
  if(group.isSuperGroup) {
    return;
  }
  
  if(group.groupName === 'group-' + email) {
    //if the group founder leaves the group, 
    //inform the other users
    group.now.notify(email + ' has closed the session.', 'error');
    //remove the group and do all informative steps
    removeGroup(group);
    
  } else {
    
    //inform other group users      
    //first check if group contains more than one user
    group.count(function(c) {
      if(c < 2) {       
        //remove the group if the leaving user is the last user who left in the group
        removeGroup(group);
      } else {
        //unregister user from group
        group.removeUser(clientId);
        //remove the group relation from user
        removeGroupFromUser(email,group.groupName);
        //if there is at least one user left, notify them
        group.now.notify(email + ' has left the session.', 'info');
        //update the group user list of all group members in the client
        getGroupUsers(group, function(error, users) {
          group.now.updateGroupState(group.groupName,users);
        });
        
        //save the result basket in the search history of the leaving user
        callUserFunction(email, 'saveResultBasket', [group.now.resultBasket,function(isSaved) {
            console.log('Result basket for leaving user ' + email + ' saved: ' + isSaved);
          }
        ]);
        //Reset everything on the user client
        callUserFunction(email, 'removeResultBasket', []);
        callUserFunction(email, 'updateGroupState', [false,[]]);
      } 
    });
  } //end if groupName
  
};

var callUserFunction = function(email, func, args) {
  var func = func || '';
  var user = getUser(email || '');
  if(!user) {
    return {'error' : 'User not online'};
  }
  
  if(user && everyone.now[func]) {
    for(var index in user.clients) {
      var clientId = user.clients[index];
      //console.log('execute ' + func + ' with args "' + args[0] + '" for user ' + email + ' with id ' + clientId);
      //Call the function for a specific user
      now.getClient(clientId, function() {
        this.now[func].apply(this, args);
      });
    };
    return {'success' :  true};
  } else {
    return {'error' : 'User function is unknown.'};
  }
};

var setupLogic = function() {
  /**
   *  registerUser function 
   */
  everyone.now.registerUser = function(email,groups){
    console.log('Register: ' + email + ' (' + this.user.clientId + ')');
    
    var clientId = this.user.clientId;
    
    if(email in users) {
      if(users[email].clients.indexOf(clientId) == -1) {
        //Since a user can be logged in multiple times on different browsers we'll deal with
        //multiple client ids
        users[email].clients.push(clientId);
      }
      //Check if user has a group
      if(users[email].groups.length > 0) {
        //And check if the group is still available
        for(var index in users[email].groups) {
          hasGroup(users[email].groups[index], function(exists) {
            //check if the group exists
            if(exists) {
              var group = now.getGroup(users[email].groups[index]);
              //Notify other group members that a member became online again
              group.now.notify(email + ' is online.', 'info');
              //add the user to the group 
              group.addUser(clientId);
              //ensure that each user of the group has an result basket upon joining to a group
              group.now.addResultBasket();
              //update the group user list of all group members in the client
              getGroupUsers(group, function(error, groupUsers) {
                group.now.updateGroupState(group.groupName, groupUsers, false);
              });
              //update result basket view of all group members
              group.now.updateResultBasket(group.now.resultBasket);
            }
          });
        }
      }
    } else {
      //Generally each user is identified by its client id(s)
      //further each group of a user is stored to restore the group links in nowjs 
      //in case of a connection lose
      users[email] = {
          "clients" : [clientId],
          "groups"  : [],
          "messages": []
      };
      userCount++;
    }
    //If the user has no group on the server but submitted a group to this function
    //the server must have been down, so send a sorry message to the user and recreate
    //the groups even if the result basket data is gone.
    if(groups.length > 0) {
      callUserFunction(email, 'notify', ['Uups! Your result basket is lost due to a server problem. Sorry :-(','error']);
      //Recreate the group
      for(var index in groups) {
        var groupName = groups[index];
        var group = now.getGroup(groupName);
        //re-add the user to its group 
        group.addUser(clientId);
        //add the group to the users group
        if(users[email].groups.indexOf(groupName) < 0) {
          users[email].groups.push(groupName);
        }
        //update the group user list of all group members in the client
        getGroupUsers(group, function(error, groupUsers) {
          group.now.updateGroupState(groupName, groupUsers, false);
        });
        //update result basket view of all group members
        group.now.updateResultBasket({items: []});
      }
    }
    
    //Populate the user list to all clients
    getGroupUsers(now.getGroup('everyone'), function(error, users) {   
      everyone.now.updateUserList(users);
    }, true);
    
    //console.log('Registry: ');
    //console.log(users);
  };
  /**
   *  unregisterUser function 
   */
  everyone.now.unregisterUser = function(email){
    console.log('Unregister: ' + email + ' (' + this.user.clientId + ')');  
    
    var clientId = this.user.clientId;
    
    this.getGroups(function(groups) {
      for(var index in groups) {
        handleGroupLeave(groups[index],email,clientId);
      } //end group for
    });
    
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
    
    //Populate the user list to all clients
    getGroupUsers(now.getGroup('everyone'), function(error, groupUsers) {
      everyone.now.updateUserList(groupUsers);
    }, true);
    
    //console.log('Registry: ');
    //console.log(users);
  };
  
  /**
   *  inviteUser function 
   */
  everyone.now.inviteUser = function(emailTo){
    
    var emailFrom = getEmailByClient(this.user.clientId);
    var userTo = getUser(emailTo);
    
    //prevent self-invitations
    if(emailFrom === emailTo) {
      callUserFunction(emailFrom, 'notify', ['Nope! You can\'t invite yourself.','error']);
      return;
    }
    
    if(userTo) {     
      //prevent double invitations
      for(var index in users[emailFrom].groups) {
        var groupName = users[emailFrom].groups[index];
        if(userTo.groups.indexOf(groupName) > -1) {
          callUserFunction(emailFrom, 'notify', ['This user is already a team mate.','error']);
          return;
        }
      }
      
      //prevent invitations to users which are already in a group
      if(userTo.groups.length > 0) {
        callUserFunction(emailFrom, 'notify', ['This user is already in another group.','error']);
        return;
      }
    }
    
    console.log('Invite: ' + emailTo + ' from ' + emailFrom + ' (' + this.user.clientId + ')');
    //Call the invited client specifically if the invited user exists
    var response = callUserFunction(emailTo, 'triggerInvitation', [emailFrom]);
    if(response.success) {
      callUserFunction(emailFrom, 'notify', ['User invited...','success']);
      //Create session group
      var groupName = 'group-' + emailFrom;
      var group = now.getGroup(groupName);
      //add the user who invited 
      group.addUser(this.user.clientId);
      //add the newly generated group to the users group list
      if(users[emailFrom].groups.indexOf(groupName) < 0) {
        users[emailFrom].groups.push(groupName);
      }
    } else {
      callUserFunction(emailFrom, 'notify', [response.error,'error']);
    }
    
  };
  
  /**
   *  acceptInvitation function 
   */
  everyone.now.acceptInvitation = function(email){
    console.log('acceptInvitation...');
   
    var emailFrom = getEmailByClient(this.user.clientId);
    
    if(!emailFrom) {
      console.log(this.user.clientId);
      console.log(users);
      callUserFunction(email, 'notify', [emailFrom + ' seems to be temporarily not reachable. Try it again.','error']);
      return;
    }
    
    var groupName = 'group-' + email;
    var group = now.getGroup(groupName);
    
    //add the user who accepted the invitation to the group creators group 
    group.addUser(this.user.clientId);
    //add the group to the users group list
    if(users[emailFrom].groups.indexOf(groupName) < 0) {
      users[emailFrom].groups.push(groupName);
    }
    //ensure that each user of the group has an result basket upon joining to a group
    group.now.addResultBasket();
    //Sent a notification for the user who invited
    callUserFunction(email, 'notify', [emailFrom + ' joined your session.','success']);
    //update the group user list of all group members in the client
    getGroupUsers(group, function(error, groupUsers) {
      group.now.updateGroupState(groupName,groupUsers, false);
    });
    //update result basket view of joined member
    callUserFunction(emailFrom, 'updateResultBasket', [group.now.resultBasket]);
  };
  
  /**
   *  declineInvitation function 
   */
  everyone.now.declineInvitation = function(email){
    console.log('declineInvitation...');
    
    var emailFrom = getEmailByClient(this.user.clientId);
    var groupName = 'group-' + email;
    //remove the group reference from the user group list
    removeGroupFromUser(email,groupName);
    //remove the group
    now.removeGroup(groupName);
    //notify group creator
    callUserFunction(email, 'notify', [emailFrom + ' rejected your invitation.','error']);
  };
  
  /**
   *  leaveGroup function 
   */
  everyone.now.leaveGroup = function(groupName) {
    
    console.log('LeaveGroup '+groupName+'...');
    
    if(!groupName) {
      console.log('LeaveGroup: no group name specified');
      return;
    }
    
    var email = getEmailByClient(this.user.clientId);
    var clientId = this.user.clientId;
    
    hasGroup(groupName, function(exists) {
      if(exists) {
        handleGroupLeave(groupName,email,clientId);
      }
    });
  };
  
  /**
   * distributeMessage function
   */
  everyone.now.distributeMessage = function(msg) {
    console.log('distributeMessage...' + msg);
    var email = getEmailByClient(this.user.clientId);
    if(email) {
      //Add user msg to user message array
      users[email].messages.push(msg);
      
      for(var index in users[email].groups) {
        var groupName = users[email].groups[index];
        var group = now.getGroup(groupName);
        //update the group user list of all group members in the client
        getGroupUsers(group, function(error, users) {
          group.now.updateGroupState(groupName,users,true);
        });
      }
    }
  };
  
  /**
   *  addItem function 
   */
  everyone.now.addItem = function(item){
    console.log('AddItem');
    //Check if the item is valid
    if(!item) {
      console.log('AddItem: no item to add');
      return;
    }
    if(!item.id) {
      console.log('AddItem: missing item id');
      return;
    }
    if(!item.tags) {
      console.log('AddItem: missing item tags');
      return;
    }
    
    //Get the group 
    this.getGroups(function(groups) {
      for(var index in groups) {
        var group = now.getGroup(groups[index]);
        //ignore the super group
        if(group.isSuperGroup) {
          continue;
        }
        
        //Check if there is already a result basket for the group
        if(('resultBasket' in group.now) == false) {
          //create a new one if no basket exists
          group.now.resultBasket = { items : undefined };
          group.now.resultBasket.items = [item];
          
        } else {
          
          var itemExists = false;
          for(var index in group.now.resultBasket.items) {
            var testItem = group.now.resultBasket.items[index];
            if(testItem.id == item.id) {
              itemExists = true;
              break;
            }
          }
          if(!itemExists) {
            //add item to the actual basket if it isn't already in there
            group.now.resultBasket.items.push(item);
          }
        }
        
        //update result basket view of all group members
        group.now.updateResultBasket(group.now.resultBasket);
      }
    });
  };
  /**
   *  deleteItem function 
   */
  everyone.now.deleteItem = function(itemid){
    //Check if a item id was provided
    if(!itemid) {
      console.log('deleteItem: missing item id');
      return;
    }
    //Get the group 
    this.getGroups(function(groups) {
      for(var index in groups) {
        var group = now.getGroup(groups[index]);   
        //ignore the super group
        if(group.isSuperGroup) {
          continue;
        }
        
        //Check if there is a result basket for the group
        if(group.now.resultBasket) {
          //delete item to the actual basket 
          for(var i=0; i < group.now.resultBasket.items.length; i++) {
            if(group.now.resultBasket.items[i].id === itemid) {
              group.now.resultBasket.items.splice(i, 1);
              console.log('deleteItem: item deleted from ' + group.groupName + ' basket');
              break;
            } 
          }
        }
        
       //update result basket view of all group members
       group.now.updateResultBasket(group.now.resultBasket);
      }
    });
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
      var index = users[email].clients.indexOf(this.user.clientId);
      if(index != -1) {
        //If there are more than one client connected
        if(users[email].clients.length > 1) {
          console.log('remove client id');
          //delete the client id from the users list
          users[email].clients.splice(index,1);
        } else {
          console.log('user offline');
          users[email].clients = [];
          for(var index in users[email].groups) {
            var groupName = users[email].groups[index];
            var group = now.getGroup(groupName);
            //Notify other group members of connection lose
            group.now.notify(email + ' is offline.', 'info');
            //unregister user from group
            group.removeUser(this.user.clientId);
            //update the group user list of all group members in the client
            getGroupUsers(group, function(error, groupUsers) {
              group.now.updateGroupState(group.groupName, groupUsers, false);
            });
          }
        }
      } 
      userIndex++;  
    }
    
    //console.log(users);
  });
  
};

/**
 * public functions
 */
exports.initialize = function(server,sessionStore) {
  //Initialize now.js which is the base for CoFind
  everyone = now.initialize(
      server, 
      {
        'socketio': { 
          'transports': ['websocket', 'flashsocket'], //, 'htmlfile', 'xhr-polling', 'jsonp-polling' 
          'try multiple transports' : true
        },
        'client': {
          'socketio' : {
            'force new connection' : true
          }
        }
      }
  );
  //Set a reference to the sessionStore of the web server
  store = sessionStore;
  
  console.log("Register CoFind functions...");
  
  setupLogic();
};


