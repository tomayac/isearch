/*
 *  CoFind Client
 */
define("mylibs/cofind", ["libs/modernizr-2.0.min", "/nowjs/now.js"], function(){

  //Static HTML snippets for CoFind interface
  var buttonSnippet = '<li id="button-cofind-settings"><a href="#"><img src="img/collaborate.png" alt="Collaborate" title="Collaboration panel" style="max-height: 31px;"></a></li>';
  var settingSnippet = '<div class="settings-panel" id="cofind-settings"><form method="post" action="#" class="clearfix"><p>Just enter the Email address of a friend with which you would like to share your results.</p><section class="setting"><label for="email">Invite Email</label><input type="text" id="cofind-email" name="email" /></section><button id="invite-user" class="float-button">Invite</button></form></div>  ';
  var generalSnippet = '<div class="bottom-overlay" id="cofind-resultbag"></div>';
  
  //RegEx for testing a valid email
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  //CoFind options
  var options = {};
  
  //Registers a logged in user for the use of CoFind
  var registerUser = function(email) {
    
    if(re.test(email)) {
      console.log('Now.js register...');
      now.registerUser(email);
      return true;
    } else {
      return false;
    }
  };
  
  //Invites a registered user to a CoFind session
  var inviteUser = function(email) {
    
    if(re.test(email)) {
      console.log('Now.js login...');
      now.inviteUser(email);
      return true;
    } else {
      return false;
    }
    
  };
  
  now.triggerInvitation = function(email) {
    console.log('You got an invitation from ' + email);
  };
  
  var setup = function(options) {
    
    options = (options && typeof(options) == 'object') ? options : null; 
    
    if(!options) {
      throw 'CoFind needs appropriate setup parameters in order to work.';
    }
    
    //Try to register the user for CoFind
    if(options.userEmail) {
      now.ready(function(){
        registerUser(options.userEmail);
      });
    }
    
    //Attach the GUI for CoFind
    var animationTime = options.animationTime || 200;
    
    if($(options.addButtonTo)) {
      $(options.addButtonTo + ":last-child").before(buttonSnippet);
    }
    if($(options.addSettingsTo)) {
      $(options.addSettingsTo + ":last-child").append(settingSnippet);
    }
    if($(options.addWorkspaceTo)) {
      $(options.addWorkspaceTo + ":last-child").append(generalSnippet);
    }
    
    //register mouse events to CoFind settings
    $("#button-cofind-settings").click(function(){
      if($("#button-cofind-settings").hasClass('active')) {
        if(inviteUser($("#cofind-settings").find("#cofind-email").val())) {
          options.messageCallback("Invitation sent...","info");
        } else {
          $("#cofind-settings").hide(animationTime);
        }
        $("#button-cofind-settings").removeClass('active');
      } else {
        options.panels.hide(animationTime);
        $("#cofind-settings").show(animationTime);
        $("#button-cofind-settings").addClass('active');
      }
    });
    //register enter key down to
    $("#cofind-settings form").keypress(function(event) {
      if ( event.which == 13 ) {
        event.preventDefault();
        
        if($("#button-cofind-settings").hasClass('active')) {
          if(inviteUser($("#cofind-settings").find("#cofind-email").val())) {
            options.messageCallback("Invitation sent...","info");
          } else {
            $("#cofind-settings").hide(animationTime);
          }
          $("#button-cofind-settings").removeClass('active');
        }
        return false;
      }
    });
  };
  
  var remove = function() {
    //need to trigger a disconnect function on the server instead of doing this:
    now.core.socketio.disconnect();
    
    $('button-cofind-settings').remove();
    $('cofind-settings').remove();
    $('cofind-resultbag').remove();
  };
  
  return {
    setup : setup,
    remove: remove
  };
  
});