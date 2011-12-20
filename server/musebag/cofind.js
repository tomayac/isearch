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

/**
 * private functions
 */

/**
 * public functions
 */
exports.initialize = function(server) {
  //Initialize now.js which is the base for CoFind
  everyone = now.initialize(server);
  console.log("Register CoFind functions...");
  //setup all functions needed for CoFind
  everyone.now.registerUser = function(email){
    console.log('Register: ' + email + '(' + this.user.clientId + ')');
  };
  
  everyone.now.inviteUser = function(email){
    console.log('Invite: ' + email + '(' + this.user.clientId + ')');
    everyone.now.triggerInvitation(email);
  };
  
};


