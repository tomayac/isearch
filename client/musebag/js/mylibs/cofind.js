/*
 *  CoFind Client
 */
define("mylibs/cofind", ["libs/modernizr-2.0.min", "/nowjs/now.js"], function(){

  //Static HTML snippets for CoFind interface
  var buttonSnippet = '<li id="button-cofind-settings"><a href="#"><img src="img/collaborate.png" alt="Collaborate" title="Collaboration panel" style="max-height: 31px;"></a></li>';
  var settingSnippet = '<div class="settings-panel" id="cofind-settings"><form method="post" action="#" class="clearfix"><p>Just enter the Email address of a friend with which you would like to share your results.</p><section><label for="email">Invite Email</label><input type="text" id="cofind-email" name="email" /></section></form></div>  ';
  var generalSnippet = '<div class="bottom-overlay" id="cofind-resultbag"></div>';
  
  //RegEx for testing a valid email
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  //CoFind options
  var options = {};
  //Indicates wether CoFind is connected
  var online = false;
  //queue for CoFind functions which needs a real-time connection to the server 
  var callQueue = [];
  
  //Queues CoFind function calls and executes them as soon as now.js is connected to the server component of CoFind 
  var callFunction = function(func, args) {
    //If there are arguments, the function stores the newly arrived function in the call queue 
    if(arguments.length > 0) {
      var func = arguments[0];
      var args = arguments[1] || [];
      
      //Make sure we have something to work with
      if(!func || typeof func != 'string') {
        return false;
      }
      //push the function to the queue
      callQueue.push([func, args]);
    }
    
    if(online) {
      callQueue.forEach(function(func) {
        if(now[func[0]]) {
          now[func[0]].apply(this, func[1]);
        }
      });
    }
  }; 
  
  //Registers a logged in user for the use of CoFind
  var registerUser = function(email) {
    
    if(re.test(email)) {
      console.log('Now.js register...');
      callFunction('registerUser',[email]);
      return true;
    } else {
      return false;
    }
  };
  
  //Invites a registered user to a CoFind session
  var inviteUser = function(email) {
    
    if(re.test(email)) {
      console.log('Now.js login...');
      callFunction('inviteUser',[email]);
      return true;
    } else {
      return false;
    }
    
  };
  
  //handle invitation response
  var setInvitationResponse = function(mode,email) {
    if(re.test(email)) {
      if(mode == 'accept') {
        console.log('CoFind accept invitation...');
        callFunction('acceptInvitation',[email]);
      } else {
        console.log('CoFind decline invitation...');
        callFunction('declineInvitation',[email]);
      }
    }
  };
  
  //Fired when CoFind gets a real-time connection to the server via now.js  
  now.ready(function() {
    console.log('nowjs connected...');
    online = true;
    callFunction();
    
    now.core.socketio.on('disconnect', function () {
      console.log('nowjs disconnected...');
      online = false;
    }); 
  });
  
  //Basic notification function for CoFind
  now.notify = function(message, type) {
    options.messageCallback(message,type,false);
  };
  
  now.triggerInvitation = function(email) {
    //Create html for action buttons for invitation
    var actionHtml = '<button id="cofind-invite-accept">Accept</button>' + 
                     '<button id="cofind-invite-decline">Decline</button>';

    //Bind the event handlers for both buttons
    $("#cofind-invite-accept").on('click', function(event) {
      
      setInvitationResponse('accept',email);
      
      $("#messages").hide(200);
      event.stopPropagation();
    });
    $("#cofind-invite-decline").on('click', function(event) {
      
      setInvitationResponse('decline',email);
      
      $("#messages").hide(200);
      event.stopPropagation();
    });
    //Display invite message with accept and decline button
    options.messageCallback('You got an invitation from ' + email, 'info', actionHtml);
  };
  
  var setup = function(opt) {
    
    options = (opt && typeof(opt) == 'object') ? opt : null; 
    
    if(!options) {
      throw 'Appropriate setup parameters for collaboration functions are missing.';
    }
    
    //Try to register the user for CoFind
    if(options.user) {
      try {
        if(!registerUser(options.user)) {
          options.messageCallback('Invalid Email address for collaboration functions.','error');
        }
      } catch(e) {
        console.log(e);
        options.messageCallback('Collaboration functions could not be attachted due to connection problems.','error');
      }
    }
    
    //Attach the GUI for CoFind
    var animationTime = options.animationTime || 200;
    
    if($(options.addButtonTo)) {
      $(options.addButtonTo + ":last-child").before(buttonSnippet);
    }
    if($(options.addSettingsTo)) {
      $(options.addSettingsTo + ":last").after(settingSnippet);
    }
    if($(options.addWorkspaceTo)) {
      $(options.addWorkspaceTo).append(generalSnippet);
    }
    
    //register mouse events to CoFind settings
    $("#button-cofind-settings").click(function(event){
      if($("#button-cofind-settings").hasClass('active')) {
        if(inviteUser($("#cofind-settings").find("#cofind-email").val())) {
          $("#cofind-settings").hide(animationTime);
          options.messageCallback("Invitation sent...","info");
        }
        $("#cofind-settings").hide(animationTime);
        $("#button-cofind-settings").removeClass('active');
      } else {
        console.log('open invite');
        options.panels.hide(animationTime);
        $("#cofind-settings").show(animationTime);
        $("#button-cofind-settings").addClass('active');
      }
      event.stopPropagation();
    });
    $("#cofind-settings").click(function(event) {
      event.stopPropagation();
    });
    
    //register enter key down to
    $("#cofind-settings form").keypress(function(event) {
      if ( event.which == 13 ) {
        event.preventDefault();
        
        if($("#button-cofind-settings").hasClass('active')) {
          if(inviteUser($("#cofind-settings").find("#cofind-email").val())) {
            options.messageCallback("Invitation sent...","info");
          }
          $("#cofind-settings").hide(animationTime);
          $("#button-cofind-settings").removeClass('active');
        }
        return false;
      }
    });
  };
  
  var remove = function(user) {
    console.log('Remove CoFind called...');
    //need to trigger a disconnect function on the server instead of doing this:
    callFunction('unregisterUser',[user]);
    
    $('#button-cofind-settings').remove();
    $('#cofind-settings').remove();
    $('#cofind-resultbag').remove();
  };
  
  return {
    setup : setup,
    remove: remove
  };
  
});