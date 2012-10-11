/*
 *  CoFind Client
 */
define("mylibs/cofind",
  [
    "mylibs/query",
    "mylibs/profile",
    "libs/modernizr.min",
    "libs/jquery.hoverIntent.min",
    "/nowjs/now.js",
    "order!js/libs/jquery-ui-1.8.17.custom.min.js",
    "order!libs/jquery.ui.touch-punch.min"
  ],
  function(query,profile){

  //Static HTML snippets for CoFind interface
  var buttonSnippet  = '<li id="button-cofind-settings"><a href="#"><img src="img/collaborate.png" alt="Collaborate" title="Collaboration panel" style="max-height: 31px;"></a></li>';
  var settingSnippet = '<div class="settings-panel" id="cofind-settings"><form method="post" action="#" class="clearfix"><section class="setting"><label for="email">Invite a friend to collaborate:</label><input type="text" id="cofind-email" name="Email" value="Email" /></section></form></div>  ';
  var generalSnippet = '<div class="bottom-overlay" id="cofind-resultbasket"><p>Your result basket is empty.<br/>Drop here any results you like to share.</p></div>';

  //RegEx for testing a valid email
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  //CoFind options
  var options = {};
  //Indicates whether CoFind is connected or not
  var online = false;
  //queue for CoFind functions which needs a real-time connection to the server
  var callQueue = [];
  //storage for last notification message
  var lastMsg = {content: '', time: 0};

  var dummyCounter = 0;

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
      //After executing all functions of queue, reset it
      callQueue = [];
    }
  };

  //Helper function
  var hasItem = function(value,key,items) {
    var itemExists = false;
    for(var index in items) {
      var item = items[index];
      if(value == item[key]) {
        itemExists = true;
        break;
      }
    }
    return itemExists;
  };

  //Helper function to generate css conform ids from an email address
  var getEmailId = function(email) {
    return email.replace('@','-').replace('.','-');
  };

  //setup chat functionality for each user
  var setupUserChat = function() {
    var email = options.user || '';
    var emailId = getEmailId(email);

    //add focus and blur handling of chat input box
    $('#chat-input-' + emailId).on('focus', function(event) {
      if($(this).val() == $(this).attr('name')) {
        $(this).val('');
      }
    });
    $('#chat-input-' + emailId).on('blur', function(event) {
      if($(this).val() == '') {
        $(this).val($(this).attr('name'));
      }
    });

    //add the enter keypress event to the users chat box
    $('#chat-input-' + emailId).on('keypress', function(event) {
      if(event.keyCode == 13) {
        var message = $(this).val() || '';
        if(message.length > 2) {
          //$('#chat-input-' + emailId).parent().before('<li><p>' + message + '</p></li>');
          callFunction('distributeMessage',[message]);
          message = '';
        }
        return false;
      }
    });

    $('.chat-container ul li').on('click', function(event) {

      if($(this).find('input').length > 0) {
        return false;
      }

      var currentIndex = $(this).index();
      var containerWidth = $(this).parent().parent().outerWidth();
      var scrollLeft = $(this).parent().parent().scrollLeft();
      var itemWidth = $(this).outerWidth(true);
      var scrollTo = 0;

      $(this).parent().children('li').each(function(index) {
        if(index >= currentIndex) {
          if(scrollTo > 15) {
            scrollTo -= 15;
          }
          return false;
        }
        scrollTo += $(this).outerWidth(true);
      });

      if((containerWidth - itemWidth) < 15) {
        if(scrollLeft <= scrollTo) {
          scrollTo += (Math.abs((containerWidth - itemWidth)) + 15);
        }
      }

      $(this).parent().parent().animate({
        scrollLeft: scrollTo
      }, 200, 'swing');
      return false;
    });
  };

  var scrollChat = function() {
    //scroll to end of the messages
    $('.chat-container ul li:last-child').each(function(index) {

      var position = $(this).position();
      var itemWidth = $(this).outerWidth(true);
      var containerWidth = $(this).parent().parent().outerWidth();
      var scrollEnd = (position.left + itemWidth) - (1.5 * containerWidth);
      //console.log(scrollEnd + ' = ('+position.left+' + ' + itemWidth + ') - (1.5 * ' + containerWidth + ')');
      $(this).parent().parent().animate({
        scrollLeft: scrollEnd
      }, 200, 'swing');

    });
  };

  //Registers a logged in user for the use of CoFind
  var registerUser = function(email) {

    if(re.test(email)) {
      console.log('CoFind register user...');
      var groups = options.groups;
      callFunction('registerUser',[email,groups]);
      return true;
    } else {
      return false;
    }
  };

  //Invites a registered user to a CoFind session
  var inviteUser = function(email) {

    if(re.test(email)) {
      console.log('CoFind invite user...');
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
    console.log('CoFind connected...');
    online = true;
    callFunction();

    now.core.socketio.on('disconnect', function () {
      console.log('CoFind disconnected...');
      online = false;
      registerUser(options.user || '');
    });

    now.core.socketio.on('reconnect', function () {
      console.log('CoFind reconnect...');
    });
  });

  //Basic notification function for CoFind
  now.notify = function(message, type) {
    var time = Math.round(new Date().getTime() / 1000);
    if(message != lastMsg.content || (message == lastMsg.content && (time - lastMsg.time) > 3)) {
      options.messageCallback(message,type,false);
      lastMsg.content = message;
      lastMsg.time = time;
    }
  };

  //Add result basket function
  now.addResultBasket = function() {
    if($('#cofind-resultbasket').length < 1 && $(options.addWorkspaceTo)) {
      $(options.addWorkspaceTo).append($(generalSnippet).css('bottom','-150px').animate({bottom: '-110px'},500));

      //register hover event and touch events for result basket
      attachBasketEvents();
    }
  };
  //Remove result basket function
  now.removeResultBasket = function() {
    if($('#cofind-resultbasket').length > 0) {
      $('#cofind-resultbasket').remove();
    }
  };

  //Information update for user invitation auto-complete
  now.updateUserList = function(users) {
    var excludeIndex = users.indexOf(options.user);
    users.splice(excludeIndex, 1);
    $('#cofind-email').autocomplete({
      source: users,
      open: function() {
        $('.ui-autocomplete').width($('#cofind-email').width()+5);
        $('.ui-autocomplete').removeClass('ui-corner-all');
      }
    });
  };

  //Information update function for the members of the current session
  now.updateGroupState = function(groupName, users, newMessage) {
    console.log('updateGroupState...');
    var newMsg = newMessage || false;

    //if no group is provided remove all group sections
    if(groupName === false) {
      options.groups = [];
      $('#cofind-settings .groupstatus').remove();
      return;
    }

    //save groupName in options
    if(options.groups) {
      if($.inArray(groupName, options.groups) == -1) {
        options.groups.push(groupName);
      }
    } else {
      options.groups = [groupName];
    }

    //generate group status html
    var stateHtml = '';
    var groupId = groupName.replace('@','-').replace('.','-');
    if(users) {
      if(users.length > 0) {
        stateHtml += '<section id="' + groupId + '" class="groupstatus"><h6>Group center for ' + groupName + ' <button class="textbutton" name="' + groupName + '" id="leave-' + groupId + '" title="Leave group">X</button></h6><ul>';
        for(var index in users) {
          var user = users[index];
          var emailId = getEmailId(user[0]);
          stateHtml += '<li><p class="chat-name';
          if(user[0] === options.user) {
            stateHtml += ' highlight';
          }
          stateHtml += '">' + user[0].substring(0,user[0].indexOf('@')) + '</p><div class="chat-container" id="chat-' + emailId + '"><ul>';
          //Add stored messages of each user
          if(user[1].length > 0) {
            for(var index in user[1]) {
              var msg = user[1][index];
              stateHtml += '<li><span>' + msg + '</span></li>';
            }
          }
          //Only add chat text box to own user row
          if(user[0] === options.user) {
            stateHtml += '<li><input type="text" class="chatbox" id="chat-input-' + emailId + '" name="Enter message..." value="Enter message..." /></li>';
          }
          stateHtml += '</ul></div></li>';
        }
        stateHtml += '</ul></section>';
      }
    }

    //handle the appropriate group section and update the group status
    if($('#' + groupId).length) {
      $('#' + groupId).replaceWith(stateHtml);
    } else {
      $('#cofind-settings').append(stateHtml);
    }

    //add the group delete event to the group leave buttons
    $('#leave-' + groupId).on('click', { group : groupName }, function(event) {
      console.log('leaveGroup clicked...');
      //unregister user from CoFind group
      callFunction('leaveGroup',[event.data.group]);
    });

    //initiate the chat box for each user
    setupUserChat();

    //if a new message was added to the chat, then force the panel to open
    if(newMsg === true) {
      $('#cofind-settings').show(200,function() { scrollChat(); });
    }
  };

  //Result basket update function
  now.updateResultBasket = function(resultBasket) {
    console.log('updateResultBasket...');

    if(typeof resultBasket === "undefined" || resultBasket === null) {
      return;
    }

    //Stuff for eye candy and visualization
    var items = resultBasket.items;
    var currentItems = $('#cofind-resultbasket .item').length;
    var newItems = items.length;
    var diff = newItems - currentItems;
    //distance between items
    var distance = 10;
    //No changes, so nothing to do
    if(diff == 0) {
      return;
    }

    if(currentItems == 0 && newItems > 0) {
      $('#cofind-resultbasket p').hide();
    }

    //pop-up the result basket
    $('#cofind-resultbasket').animate({
      bottom: '-30px'
    }, 500, function() {
      // Animation complete.
      // determine how close the items should be to each other
      console.log('new: '+newItems);
      if(newItems > 4) {
        distance = distance - ((newItems - 3) * 15);
        console.log(distance + ' = ' + distance + ' - ((' + newItems + ' - 3) * 10');
      }

      if(diff > 0) {
        for(var index in items) {
          var item = items[index];
          //Array converting
          var tags = [];
          for(var prop in item.tags)
          {
            tags.push(item.tags[prop]);
          }
          item.tags = tags;
          if(currentItems > 0) {
            //check if the current processed item is not in the list of existing items
            if($('#cofind-resultbasket').has('#' + item.id).length < 1) {
              //and then just append it and put an animation on it
              $('#cofind-resultbasket').append($('<section class="item" id="' + item.id + '" title="' + item.tags.join(',') + '" style="opacity : 0;">' + item.html + '</section>').animate({'opacity': 1,'margin-right': distance}, 500));
            } else {
              $('#cofind-resultbasket #' + item.id).css('margin-right', distance);
            }
          } else {
            $('#cofind-resultbasket').append($('<section class="item" id="' + item.id + '" title="' + item.tags.join(',') + '" style="opacity : 0;">' + item.html + '</section>').animate({'opacity': 1,'margin-right': distance}, 500));
          }
        }
      } else {
        //check which items to delete from the basket
        $('#cofind-resultbasket .item').each(function(index) {
          if(!hasItem($(this).attr('id'),'id',items)) {
            $(this).remove();
          }
        });
        //check if there are no result items left in the basket
        if($('#cofind-resultbasket .item').length < 1) {
          $('#cofind-resultbasket p').show();
        }
      }

      //register draggable and droppable events
      $('#cofind-resultbasket .item').draggable({
        opacity : 0.7,
        delay : 500,
        revert: 'invalid',
        containment : 'document',
        stop: function(event, ui) {

           callFunction('deleteItem',[$(this).attr('id')]);
           $(this).hide('slow');
        }
      });

      //hide the result basket away again
      $('#cofind-resultbasket').delay(500).animate({bottom: '-110px'}, 500);
    });

  };

  //Result basket save function
  now.saveResultBasket = function(resultBasket,callback) {
    console.log('saveResultBasket...');

    //nothing needs to be stored if the group has no result basket
    if(typeof(resultBasket) === 'undefined' || resultBasket === null) {
      callback(true);
      return;
    }

    //Clean up the result basket for storage
    var resultItems = {
      //add latest queryId stored in query module to identify resultBasket with query
      'queryId' : query.queryId,
      'items'   : new Array()
    };
    //reduce items to only contain the CO id and tags
    for(var index in resultBasket.items) {
      resultItems.items[index] = {
          id   : resultBasket.items[index].id,
          tags : resultBasket.items[index].tags
      };
    }
    
    profile.updateHistory(resultItems,callback);

  };

  now.triggerInvitation = function(email) {
    //Create html for action buttons for invitation
    var actionHtml = '<button id="cofind-invite-accept">Accept</button>' +
                     '<button id="cofind-invite-decline">Decline</button>';

    //Display invite message with accept and decline button
    options.messageCallback('You got an invitation from ' + email, 'info', actionHtml);

    //Bind the event handlers for both buttons
    $(document).on('click', '#cofind-invite-accept', function(event) {
      setInvitationResponse('accept',email);

      $("#messages").hide(200);
      event.stopPropagation();
    });
    $(document).on('click', '#cofind-invite-decline', function(event) {
      setInvitationResponse('decline',email);

      $("#messages").hide(200);
      event.stopPropagation();
    });
  };

  var attachBasketEvents = function() {
    var self = this;

    //register hover event and touch events for result basket
    $('#cofind-resultbasket').hoverIntent({
      over: function() { $(this).animate({bottom: '-30px'}, 500); },
      timeout: 300,
      out: function () { $(this).animate({bottom: '-110px'}, 500); }
    });

    $('#cofind-resultbasket').on('MozTouchUp touchend', function() {
      console.log($(this).css('bottom'));
      if($(this).css('bottom') < 0) {
        $(this).animate({bottom: '-30px'}, 500);
      } else {
        $(this).animate({bottom: '-110px'}, 500);
      }
    });

    $('#cofind-resultbasket').droppable ({
      accept: ".ui-draggable",
      greedy: true,
      tolerance: "pointer",
      hoverClass: "ui-state-hover",
      activeClass: "ui-state-highlight",
      over: function(e, ui) {
        $(this).animate({bottom: '-30px'}, 500);
      },
      out: function(e, ui) {
        $(this).animate({bottom: '-110px'}, 500);
      },
      drop: function(e, ui) {
        var resultSet = require('mylibs/results').get() || {};
        var item = {};
        if(resultSet.docs) {
          for(var r=0; r < resultSet.docs.length; r++) {
            if(resultSet.docs[r].coid == ui.draggable.attr('docid')) {

              item.id = resultSet.docs[r].coid;

              var src = '', text = '';
              for(var i in resultSet.docs[r].media) {
                if(resultSet.docs[r].media[i].type == 'ImageType') {
                  src = resultSet.docs[r].media[i].previews[0].url;
                }
                if(resultSet.docs[r].media[i].type == 'Text') {
                  text = resultSet.docs[r].media[i].text;
                }
              }
              item.html = '<img src="' + src + '" alt="' + text + '" />';
              item.tags = resultSet.docs[r].tags;

              callFunction('addItem', [item]);
            }
          }
        }
      }
  });
  };

  var setup = function(opt) {

    options = (opt && typeof(opt) == 'object') ? opt : null;

    if(!options) {
      throw 'Missing appropriate setup parameters for collaboration functions.';
    }

    //Adding a group array in the options object
    options.groups = [];

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

    //register mouse events to CoFind settings
    $("#button-cofind-settings").click(function(event){
      if($("#button-cofind-settings").hasClass('active')) {
        if(inviteUser($("#cofind-settings").find("#cofind-email").val())) {
          $("#cofind-settings").hide(animationTime);
          options.messageCallback("Invitation sent...","info");
          //reset input field
          $("#cofind-settings").find("#cofind-email").val('');
        }
        $("#cofind-settings").hide(animationTime);
        $("#button-cofind-settings").removeClass('active');
      } else {
        console.log('open invite');
        options.panels.hide(animationTime);
        $("#cofind-settings").show(animationTime,function() { scrollChat(); });
        $("#button-cofind-settings").addClass('active');
        $("body").one("click", function(e) {
          options.panels.hide(animationTime);
        });
      }
      event.stopPropagation();
    });
    $("#cofind-settings").click(function(event) {
      event.stopPropagation();
    });

    //register enter key down to close settings panel
    $("#cofind-settings form").keypress(function(event) {
      if ( event.which == 13 ) {
        event.preventDefault();

        if($("#button-cofind-settings").hasClass('active')) {
          if(inviteUser($("#cofind-settings").find("#cofind-email").val())) {
            options.messageCallback("Invitation sent...","info");
            //reset input field
            $("#cofind-settings").find("#cofind-email").val('');
          }
          $("#cofind-settings").hide(animationTime);
          $("#button-cofind-settings").removeClass('active');
        }
        return false;
      }
    });

    //register clear input on focus event for invitation input
    $('#cofind-email').focus(function(event) {
      if($(this).val() == $(this).attr('name')) {
        $(this).val('');
      }
    });
    $('#cofind-email').blur(function(event) {
      if($(this).val() == '') {
        $(this).val($(this).attr('name'));
      }
    });
  };

  var remove = function(user) {
    console.log('Remove CoFind called...' + user);

    //unregister user from cofind session
    callFunction('unregisterUser',[user]);

    $('#button-cofind-settings').remove();
    $('#cofind-settings').remove();
    $('#cofind-resultbasket').remove();

    //reset options
    options = {};
  };

  return {
    setup : setup,
    remove: remove
  };

});