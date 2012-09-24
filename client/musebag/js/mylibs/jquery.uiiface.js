/**
UIIFace - Unified Interaction Interface
Copyright (c) 2011, Jonas Etzold, Fulda University of Applied Sciences (HSF)

Interaction Component of I-SEARCH (http://www.isearch-project.eu)
All rights reserved.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS' AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*
if( typeof self.options.callback === 'function' ) {
  self.options.callback.apply( self.element[0], []);
}
 */

define("mylibs/uiiface-v1",
  [
    "jquery",
    "libs/jquery.elementFromPoint.min",
    "libs/modernizr.min",
    "libs/wami-2.0"
  ],
  function($, undefined) {

    /**
     *  -------------------------------------------
     *  Core UIIFace object
     *  -------------------------------------------
     */
    var UIIFace = {
      //is UIIFace ready to work?
      isReady : false,
      //Input modality features
      config : {
        modalities : {
          'mouse'    : true,
          'keyboard' : true,
          'speech'   : false,
          'touch'    : false,
          'kinect'   : false
        },
        //Array for storing available touch events if applicable
        touchEvents : {},
        //Stores the last clicked/selected/used element
        activeElement : undefined,
        //Stores the current reference cursor position (not only the current mouse)
        cursorPosition : { x : 0, y : 0},
        //Predefined custom events with their basic handlers
        eventRegister : {
          'move'      : {
            'keyboard' : {
              'keys'    : '37-40', //[from]-[to] or [a],[b],... combinations with [a]+[b] (with OR connections for multiple keys between +), and * for any key
              'context' : 'this' //context element for which the event should be triggered //values: this = default || active || cursor
            },
            'handler'  : function(event) { console.log('move handler'); }
          },
          'select'    : {
            'keyboard' : { 'keys' : '16+13', 'context' : 'cursor' },
            'trigger'  : { 'events': 'up', 'context' : 'this' },
            'handler'  : function(event) { console.log('select handler'); console.log(event); console.log(this); }
          },
          'selection' : {
            'keyboard' : { 'keys' : '16+37-40', 'context' : 'active' },
            'handler'  : function(event) { console.log('selection handler'); console.log(arguments); console.log(this); }
          },
          'submit'    : {
            'keyboard' : { 'keys' : '13', 'context' : 'this' },
            'handler'  : function(event) { console.log('submit handler'); }
          },
          'drag'      : {
            'mouse'    : { 'events' : 'dragstart', 'context' : 'this' },
            'handler'  : function(event) { console.log('drag handler'); }
          },
          'drop'      : {
            'mouse'    : { 'events' : 'drop dragenter dragleave', 'context' : 'this' },
            'handler'  : function(event) {
              switch(event.type) {
                case 'dragenter' :
                  var elem = $(event.currentTarget);
                  var count = elem.data('dragenter-count');
                  count = (count || 0) + 1;
                  elem.data('dragenter-count', count);
                  if (count === 1) {
                    elem.addClass('over');
                  }
                  break;
                case 'dragleave' :
                  var elem = $(event.currentTarget);
                  var count = elem.data('dragenter-count');
                  --count;
                  elem.data('dragenter-count', count);
                  if (!count) {
                    elem.removeClass('over');
                  }
                  break;
                case 'drop' :
                  //check if there is an custom handler which should be called for this event
                  event.preventDefault();
                  var elem = $(event.currentTarget);
                  elem.data('dragenter-count', 0);
                  elem.removeClass('over');
                  $(event.target).removeClass("over");
                  if(typeof event.data.customHandler === 'function') {
                    event.data.customHandler.apply(this, [event]);
                  }
                  break;
              }
            },
            'internalHandlerCall': true
          },
          'pan'       : {
            'trigger'    : { 'events' : 'down move up', 'context' : 'this' },
            'handler'  : function(event) {
              var self = this;
              try {
              var first = event.epoints.first();
              } catch(e) {
                console.log(event.epoints);
              }
              $('#debug').text(first.x+', ' +first.y);
              console.log('check keys');
              event.epoints.foreach(function(index, point) {
                console.log(index,point);
              });

              if($(self).css('background-color') == 'rgb(170, 0, 0)') {
                $(self).css({'background-color' : 'transparent'});
              } else {
                $(self).css({'background-color' : '#a00'});
              }
              /*$(this).css({
                'position' : 'absolute',
                'left' : $(this).data('left') + event.pan.x + 'px',
                'top'  : $(this).data('top') + event.pan.y + 'px'
               });*/
            }
          },
          'scale'     : {
            'keyboard' : { 'keys' : '107,109', 'context' : 'active' }, //+ and - on numpad
            'handler'  : function(event) { console.log('scale handler'); }
          },
          'rotate'    : {
            'mouse'    : { 'events' : 'move', 'context' : 'active' },
            'handler'  : function(event) { console.log('rotate handler'); }
          },
          'delete'    : {
            'keyboard' : { 'keys' : '27', 'context' : 'active' },
            'handler'  : function(event) { console.log('delete handler'); }
          },
          'add'       : {
            'keyboard' : { 'keys' : '13', 'context' : 'this' },
            'handler'  : function(event) { console.log('add handler'); }
          },
          'text'      : {
            'keyboard' : { 'keys' : '*', 'context' : 'this' },
            'handler'  : function(event) { console.log('text handler'); }
          },
          'reset'     : {
            'keyboard' : { 'keys' : '16+82', 'context' : 'this' }, //shift + r
            'handler'  : function(event) { console.log('reset handler'); }
          },
          'up'        : {
            'keyboard' : { 'keys' : '38', 'context' : 'this' },
            'handler'  : function(event) { console.log('up handler'); }
          },
          'down'      : {
            'keyboard' : { 'keys' : '40', 'context' : 'this' },
            'handler'  : function(event) { console.log('down handler'); }
          },
          'next'      : {
            'keyboard' : { 'keys' : '39', 'context' : 'this' },
            'handler'  : function(event) { console.log('next handler'); }
          },
          'previous'  : {
            'keyboard' : { 'keys' : '37', 'context' : 'this' },
            'handler'  : function(event) { console.log('previous handler'); }
          },
          'hold'      : {
            'mouse'    : { 'events' : 'down', 'context' : 'active' },
            'handler'  : function(event) { console.log('hold handler'); }
          },
          'sketch'    : {
            'trigger'  : { 'events' : 'move', 'context' : 'this' },
            'handler'  : function(event) {
              var canvas = this;
              if(!canvas.getContext || !event.epoints) {
                return;
              }

              var offset = $(this).offset();
              var context = canvas.getContext('2d');

              event.epoints.foreach(function(key, point) {
                //console.log(key + '= x:'+parseFloat(point.x - offset.left)+' y:'+parseFloat(point.y - offset.top));
                context.strokeStyle = 'rgba(40,0,0,.3)';
                context.lineWidth = 3;
                context.lineCap = 'round';
                context.lineJoin = 'round';
                context.beginPath();
                context.moveTo(parseFloat(point.oldX - offset.left), parseFloat(point.oldY - offset.top));
                context.lineTo(parseFloat(point.x - offset.left), parseFloat(point.y - offset.top));
                context.closePath();
                context.stroke();
              });
            }
          }
        } // end eventRegister object
      },
      /**
       * Initialize function
       *
       * @param options
       * @param element
       */
      initialize : function( options, element ) {
        var self = this;

        self.element = $( element );

        //Parsing the options
        self.events = typeof options === 'string'
          ? options
          : options.events;

        if(!self.events) {
          return;
        }

        self.events = self.events.indexOf(' ') > -1
          ? self.events.split(' ')
          : [self.events];

        //taking the passed options and preserving the defaults
        self.options = $.extend( {}, $.fn.uiiface.options, options);

        if(!self.isReady) {
          self.setup();
        }
        self.register();
        self.config.index++;
      },
      register : function() {
        var self = this;

        $.each(self.events, function(index, event) {

          var eventDefinition = self.config.eventRegister[event];

          if(eventDefinition) {
            //add element to event
            if(self.config.eventRegister[event].elements) {
              self.config.eventRegister[event].elements.push(self.element);
            } else {
              self.config.eventRegister[event].elements = [self.element];
            }
            //call handler
            self.commandMapper(event,eventDefinition);
          }
        });
      },
      commandMapper : function(event, eventDefinition) {
        var self = this;
        //Parse event definition
        var handler = eventDefinition.handler;
        //Allowing custom event handler
        var customHandler = false;
        if(typeof self.options.callback === 'function') {
          if(eventDefinition.internalHandlerCall) {
            customHandler = self.options.callback;
          } else {
            handler = self.options.callback;
          }
        }
        //always assign custom event to element for reference
        $(self.element).on(event, { customHandler : customHandler }, handler);

        var getEventElement = function(element) {
          var foundItem = false;

          if(element) {
            $.each(self.config.eventRegister[event].elements, function() {
              if($(this).find(element).length > 0) {
                foundItem = this;
                return false;
              }
            });
          }
          return foundItem;
        };

        /**
         * @param referrer
         * @param data
         * @param context
         * @param callback
         * @returns
         */
        var assignEvent = function(referrer,data,context,callback) {

          //Determine the context and assign event
          switch(context) {
            case 'active':
              if(self.config.index > 0) { break; }
              $(document).on(referrer, function(e) {
                var element = getEventElement(self.config.activeElement);
                if(element) {
                  e.data = data;
                  e.currentTarget = element;
                  callback.apply(element, [e]);
                }
              });
              break;
            case 'cursor':
              if(self.config.index > 0) { break; }

              $(document).on(referrer, function(e) {
                //Get element at mouse position
                var element = $.elementFromPoint(UIIFace.config.cursorPosition.x, UIIFace.config.cursorPosition.y);
                element = getEventElement(element);
                if(element) {
                  e.data = data;
                  e.currentTarget = element;
                  callback.apply(element, [e]);
                }
                return false;
              });
              break;
            default:
              //this context
              $(self.element).on(referrer, data, callback);
          }
        };

        //Parse all the modality trigger conditions for the given event definition
        $.each(eventDefinition, function(modality, value) {
          if(modality !== 'handler') {

            switch(modality) {
              case 'keyboard':
                //Parse trigger rule
                var rule = {
                  operator : false,
                  keys : []
                };

                //Range and list parser function
                var parseKeys = function(keyDefinition) {
                  var keys = [];
                  //Only range
                  if(keyDefinition.indexOf('-') > -1 && keyDefinition.indexOf(',') == -1) {
                    var range = keyDefinition.split('-');
                    for(var k = range[0]; k <= range[1]; k++) {
                      keys.push(k);
                    }
                  }
                  //Only list
                  else if(keyDefinition.indexOf(',') > -1 && keyDefinition.indexOf('-') == -1) {
                    keys = keyDefinition.split(',');
                  }
                  //only single keys
                  else {
                    keys = [keyDefinition];
                  }
                  return keys;
                };

                //has 'all keys' (*) place holder?
                if(value.keys.indexOf('*') > -1) {
                  rule.keys = ['*'];
                }
                //has 'and' (+) operator?
                else if(value.keys.indexOf('+') > -1) {
                  var keys = value.keys.split('+');
                  rule.prekeys  = parseKeys(keys[0]);
                  rule.operator = '+';
                  rule.keys     = parseKeys(keys[1]);
                } else {
                  rule.keys = parseKeys(value.keys);
                }

                //Determining the desired trigger combination
                var parseHandler = function(event) {

                  //Should trigger on every key?
                  if(rule.keys[0] === '*') {
                    handler.apply(this, [event]);
                  } else if (!rule.operator){
                    //Should trigger on specific keys
                    $.each(rule.keys, function(i, k) {
                      if(event.which == k) {
                        handler.apply(this, [event]);
                      }
                    });
                  } else if (rule.operator === '+') {
                    //Should trigger on specific combinations
                    $.each(rule.prekeys, function(i, k) {
                      if(event.which == k) {
                        //As soon as one pre-key is pressed the precondition is met
                        rule.prepressed = true;
                        return false;
                      }
                    });
                    $.each(rule.keys, function(i, k) {
                      if(event.which == k) {
                        //As soon as one key from the keys array is pressed the 2nd part of the condition is met
                        rule.pressed = true;
                        return false;
                      }
                    });
                    //Test if combination rule is met
                    if(rule.prepressed && rule.pressed) {
                      handler.apply(this, [event]);
                      delete rule.prepressed;
                      delete rule.pressed;
                    }
                  }
                };

                assignEvent('keydown', {}, value.context, parseHandler);
                break;

              case 'speech':
                //Parse phrase
                break;
              default:
                if(value.events) {

                  var mergeHandler = function(event, data) {
                    event.epoints = data;
                    handler.apply(this, [event]);
                  };
                  assignEvent(value.events, {}, value.context, mergeHandler);
                  var listener = new self.basicInterpreter(self.element);
                  listener.initialize();
                }
            }
          } // end if
        }); //end modality each

      },
      setup : function() {
        var self = this;
        self.tools.setModalities();
        self.tools.setHelperEvents();
        self.isReady = true;
      },
      tools : {
        setModalities : function() {
          //Test for touch events
          if (Modernizr.touch){

            var isMozilla = Modernizr.mq('all and (-moz-touch-enabled)');

            if(isMozilla) {
              //If it's a mozilla browser with touch, assign the specialized touch events
              UIIFace.config.touchEvents['down'] = 'MozTouchDown';
              UIIFace.config.touchEvents['move'] = 'MozTouchMove';
              UIIFace.config.touchEvents['up']   = 'MozTouchUp';
            } else {
              //Assign the basic touch events (all mobile devices I guess)
              UIIFace.config.touchEvents['down'] = 'touchstart';
              UIIFace.config.touchEvents['move'] = 'touchmove';
              UIIFace.config.touchEvents['up']   = 'touchend';
            }
            UIIFace.config.modalities['touch'] = true;
          }

          //Need a working test for this
          UIIFace.config.modalities['speech'] = true;

          //Kinect test
          //UIIFace.websocketConnector.kinect();

        },
        hasModality : function(modality) {
          if( UIIFace.config.modalities[modality] !== undefined ) {
            return UIIFace.config.modalities[modality];
          }
          return false;
        },
        setHelperEvents : function() {
          $(document).on('click', function(event) {
            UIIFace.config.activeElement = event.target;
            //cursorPosition refers to the event position
            UIIFace.config.cursorPosition = {
              'x' : event.pageX || 0,
              'y' : event.pageY || 0
            };
          });
          var getMousePosition = function(timeout) {
            // "one" attaches the handler to the event and removes it after it has executed once
            $(document).one('mousemove', function (event) {
              //epoint '0' always refers to the mouse cursor position
              UIIFace.config.cursorPosition = {
                'x' : event.pageX || 0,
                'y' : event.pageY || 0
              };
              // set a timeout so the handler will be attached again after a little while
              setTimeout(function() { getMousePosition(timeout); }, timeout);
            });
          };
          getMousePosition(150);
        }
      },
      basicInterpreter : function(element) {

        var PointList = function() {};
        PointList.prototype = {
          size : function() {
            var size = 0, key;
            for (key in this) {
              if (key === 'size' || key === 'first') continue;
              if (this.hasOwnProperty(key)) size++;
            }
            return size;
          },
          first : function() {
            var key;
            var first = null;
            for (key in this) {
              if (key === 'size' || key === 'first') continue;
              if (this.hasOwnProperty(key)) {
                first = this[key];
                break;
              }
            }
            return first;
          },
          remove : function(key) {
            if (key === 'size' || key === 'first') return;
            delete this[key];
          },
          foreach : function(callback) {
            var index = 0;
            for (key in this) {
              if (typeof this[key] === 'function') continue;
              if (this.hasOwnProperty(key) && typeof this[key] === 'object') {
                callback( key, this[key], index );
                index++;
              }
            }
          }
        };

        var PointEventListener = function(element) {
          this.element = element;
          //Stores the current mouse/touch/hand event positions
          this.epoints = new PointList();
          this.interval = false;
          this.test = {
            'running'   : false,
            'lastMove'  : 0,
            'refPoints' : false
          };
        };

        PointEventListener.prototype = {
            initializeElementData : function() {
              if(element.data('lastPan')) {
                element.data('pan', element.data('lastPan'));
                element.removeData('lastPan');
              }
              if(element.data('lastScale')) {
                element.data('scale', element.data('lastScale'));
                element.removeData('lastScale');
              }
              if(element.data('lastRotation')) {
                element.data('rotation', element.data('lastRotation'));
                element.removeData('lastRotation');
              }

              element.data('rotation', element.data('rotation') || false);
              element.data('scale', element.data('scale') || false);
              element.data('pan', element.data('pan') || { x : false, y : false});
              element.data('initialDistance', 0);
              element.data('initialRotation', 0);
              element.data('offsetX', 0);
              element.data('offsetY', 0);

            },
            testMove : function() {
              var self = this;
              var d = new Date();
              self.test.lastMove = d.getTime();

              if(self.test.running) {
                return;
              }

              var testFunc = function() {
                var d = new Date();
                var c = d.getTime();
                if((c - self.test.lastMove) > 500) {
                  console.log('no move since 500 milliseconds');
                  self.epoints = new PointList();
                  self.test.running = false;
                  self.test.refPoints = false;
                  self.initializeElementData();
                } else {
                  setTimeout(testFunc,505);
                }
              };

              setTimeout(testFunc,505);
              self.test.running = true;
            },
            testPoints : function() {
              var self = this;
              //don't process if no points are available
              if(self.epoints.size() < 1) {
                return false;
              }
              //determine equal points in set
              var eq = 0;
              self.epoints.foreach(function(key, point) {
                if(point.x === point.oldX && point.y === point.oldY) {
                  eq++;
                } else if(self.test.refPoints) {
                  if(self.test.refPoints.size() == epoints.size()) {
                    //Fallback test if old values were not set in last move event
                    if(point.x === self.test.refPoints[key].x && point.y === self.test.refPoints[key].y) {
                      eq++;
                    }
                  }
                }
              });
              //ignore if nothing changed
              if(eq == self.epoints.size()) {
                return false;
              }
              self.test.refPoints = $.extend({},self.epoints);
              return true;
            },
            handlePoints : function(e,mode) {
              //Normalizing different touch API data to the
              //basic touch API
              if(!e.originalEvent.changedTouches ) {
                return;
              }

              var self = this;
              var i = e.originalEvent.changedTouches.length;
              var touch = 0;
              var id;
              while(i--) {
                touch = e.originalEvent.changedTouches[i];
                id = 'p'+touch.identifier;
                self.epoints[id] = {
                  oldX : self.epoints[id] ? self.epoints[id].x : 0,
                  oldY : self.epoints[id] ? self.epoints[id].y : 0,
                  x    : touch.pageX || 0,
                  y    : touch.pageY || 0
                };
              }
              //Mode dependend point handling
              if(mode === 1) {
                $(element).trigger('down',self.epoints);
                //calculateManipulation(1);
              } else if(mode === 2){
                $(element).trigger('move',self.epoints);
                /*if(!interval) {
                  interval = setInterval(calculateManipulation, 10, 2);
                }*/
              } else {
                $(element).trigger('up',self.epoints);
                //$(element).trigger('click',self.epoints);
                clearInterval(self.interval);
                self.interval = false;
                self.test.refPoints = false;
                self.initializeElementData();

                i = e.originalEvent.changedTouches.length;
                while(i--) {
                  touch = e.originalEvent.changedTouches[i];
                  id = 'p'+touch.identifier;
                  self.epoints.remove(id);
                }
              }
            },
            initialize : function() {
              var self = this;
              //init
              self.initializeElementData();

              //set events
              $(element).on('touchstart kinectstart', function(e, kinectData) {
                e.preventDefault();
                if(kinectData) {
                  e.originalEvent = kinectData;
                }
                self.handlePoints(e,1);
              });

              $(element).on('touchmove kinectmove', function(e, kinectData) {
                e.preventDefault();
                if(kinectData) {
                  e.originalEvent = kinectData;
                }
                //ensure resetting
                self.testMove();

                self.handlePoints(e,2);
              });

              $(element).on('touchend kinectend', function(e, kinectData) {
                e.preventDefault();
                if(kinectData) {
                  e.originalEvent = kinectData;
                }
                self.handlePoints(e,3);
              });

              //Mouse and Mozilla touch handler
              $(element).on('mousedown MozTouchDown', function(e) {
                e.preventDefault();
                e.originalEvent.changedTouches = [{
                  'identifier' : e.originalEvent.streamId || 0,
                  'pageX' : e.originalEvent.pageX,
                  'pageY' : e.originalEvent.pageY
                }];
                self.handlePoints(e,1);
                //If mouse is down then we listen to mousemove events
                $(element).on('mousemove MozTouchMove', function(e) {
                  e.preventDefault();
                  e.originalEvent.changedTouches = [{
                    'identifier' : e.originalEvent.streamId || 0,
                    'pageX' : e.originalEvent.pageX,
                    'pageY' : e.originalEvent.pageY
                  }];
                  self.handlePoints(e,2);
                });
              });
              $(element).on('mouseup MozTouchUp', function(e) {
                e.preventDefault();
                e.originalEvent.changedTouches = [{
                  'identifier' : e.originalEvent.streamId || 0,
                  'pageX' : e.originalEvent.pageX,
                  'pageY' : e.originalEvent.pageY
                }];
                self.handlePoints(e,3);
                //Unbind mouse move on mouse up
                $(element).off('mousemove MozTouchMove');
              });
            }
        };

        if(!element) { return null; }
        return new PointEventListener(element);
      },
      websocketConnector : {
        /**
         * Determines websocket capabilities and tries to establish
         * a web socket connection
         *
         * @param uri
         * @returns the socket object or false
         */
        connect : function(uri) {
          var socket = false;

          if (Modernizr.websockets){

            if(window.MozWebSocket) {
              window.WebSocket = window.MozWebSocket;
            }
            socket = new window.WebSocket(uri);
          }

          return socket;
        },
        /**
         * Initializes a websocket connection to a locally running
         * Kinect skeleton broadcast service.
         * @returns {Boolean}
         */
        kinect : function() {
          var self = this;
          var socket = self.connect('ws://localhost:8181/KinectHtml5');

          if (!socket){
            console.log('No websockets available.');
            return false;
          }

          // Stores relevant data for Kinect hands
          var hands = [{
            'cur'   : {z : 0},
            'old'   : {z : 0},
            'state' : 'free'
          },{
            'cur'   : {z : 0},
            'old'   : {z : 0},
            'state' : 'free'
          }];

          var dispatchKinectEvent = function(type,data) {
            var kinectData = {};
            var touches = [];

            if(data.length < 1) {
              return;
            }
            //Make Kinect event behave like a standard touch event
            for(var h=0; h < data.length; h++) {
              $('.kinectHand').hide();
              var element = $.elementFromPoint(data[h].x, data[h].y);
              $('.kinectHand').show();
              //Allow Kinect touches on different DOM elements
              if(h > 0) {
                if(touches[h-1]) {
                  if(touches[h-1].target != element) {
                    kinectData.touches = touches;
                    kinectData.targetTouches = touches;
                    kinectData.changedTouches = touches;
                    $(touches[h-1].target).trigger('kinect'+type, kinectData);
                    touches = [];
                  }
                }
              }
              touches.push({
                'identifier' : h,
                'pageX' : data[h].x,
                'pageY' : data[h].y,
                'target': element
              });
            }
            //If all Kinect touches have the same target DOM element, this code will trigger the event
            kinectData.touches = touches;
            kinectData.targetTouches = touches;
            kinectData.changedTouches = touches;

            $(touches[0].target).trigger('kinect'+type, kinectData);
          };

          // Observer function which determines "click" events based on Kinect hand joints
          var eventObserver = function() {

            //Stores z delta value between two hand z values
            var deltaZ,deltaX,deltaY;
            var type = false;
            var data = [];

            var inter = setInterval(function() {

              if(hands[0].old.z == 0 || hands[1].old.z == 0) {
                if(hands[0].cur.z != 0 && hands[1].cur.z !=0) {
                  hands[0].old = hands[0].cur;
                  hands[1].old = hands[1].cur;
                  return;
                }
              }
              type = false;
              data = [];

              for(var h=0; h < 2; h++) {
                deltaX = Math.abs(hands[h].old.x - hands[h].cur.x);
                deltaY = Math.abs(hands[h].old.y - hands[h].cur.y);
                deltaZ = (hands[h].old.z - hands[h].cur.z);

                if((hands[h].state === 'start' || hands[h].state === 'move') && (deltaX > 3 || deltaY > 3)) {
                  //Trigger hand move (while down)
                  type = 'move';
                  hands[h].state = type;
                  data.push(hands[h].cur);
                }
                if(hands[h].state === 'end') {
                  hands[h].state = 'free';
                }

                if(deltaZ > 0.05) {
                  if(hands[h].state === 'free' && deltaX < 15 && deltaY < 15) {
                    //Trigger hand start
                    type = 'start';
                    console.log(hands[h].cur.name + ' start x:' + hands[h].cur.x + ' y:'+hands[h].cur.y);
                    hands[h].state = type;
                    data.push(hands[h].cur);
                  }
                }
                else if(deltaZ < -0.05) {
                  if(hands[h].state === 'start' || hands[h].state === 'move') {
                    //Trigger hand end and click
                    type = 'end';
                    console.log(hands[h].cur.name + ' end');
                    hands[h].state = type;
                    data.push(hands[h].cur);
                  }
                }
              }
              hands[0].old = hands[0].cur;
              hands[1].old = hands[1].cur;

              if(type != false) {
                dispatchKinectEvent(type,data);
              }
            }, 150);
          };

          //Preparing visual helpers
          if(UIIFace.options.gestureHints) {
            $('<div/>', {
              'class' : 'kinectHand',
              'id'  : 'handLeft',
              'css' : {
                'position': 'fixed',
                'top': 0,
                'left': 0,
                'height': '15px',
                'width': '15px',
                'background-color': '#600',
                'border-radius': '15px',
                'z-index' : 9999,
                'display' : 'none'
              }
            }).appendTo($('body'));
            $('<div/>', {
              'class' : 'kinectHand',
              'id'  : 'handRight',
              'css' : {
                'position': 'fixed',
                'top': 0,
                'left': 0,
                'height': '15px',
                'width': '15px',
                'background-color': '#A00',
                'border-radius': '15px',
                'z-index' : 9999,
                'display' : 'none'
              }
            }).appendTo($('body'));
          }

          //Attach an Kinect ready visual helper
          $('<div/>', {
            'id'  : 'kinectReady',
            'css' : {
              'position': 'fixed',
              'top': ($(window).outerHeight() / 2) - 50 + 'px',
              'left': ($(window).outerWidth() / 2) - 100 + 'px',
              'height': '100px',
              'width': '200px',
              'color': '#0A0',
              'font-size': '30px',
              'font-weight': 'bold',
              'text-align': 'center',
              'z-index' : 9999,
              'display' : 'none'
            },
            'text' : 'Kinect is ready to use'
          }).appendTo($('body'));

          socket.onerror = function(error) {
            console.log('Kinect connection could not be established',error);
          };

          socket.onopen = function () {
            console.log('Kinect connection established');
            UIIFace.config.modalities['kinect'] = true;

            //Showing a message that Kinect can be used
            $('#kinectReady').fadeIn(200).delay(3000).fadeOut(200);

            //Initialize the Kinect event observer
            eventObserver();

            //Sending initial scale command to Kinect server
            socket.send('ScaleTo ' + $(document).width() + ' ' + $(document).height());

            //Making sure that window size changes are reflected in the transmitted Kinect data
            var resizeTimer;

            $(document).on('DOMSubtreeModified',function(e) {
              clearTimeout(resizeTimer);
              resizeTimer = setTimeout(function() {
                socket.send('ScaleTo ' + $(document).width() + ' ' + $(document).height());
              }, 200);
            });
            $(window).on('resize',function() {
              clearTimeout(resizeTimer);
              resizeTimer = setTimeout(function() {
                socket.send('ScaleTo ' + $(document).width() + ' ' + $(document).height());
              }, 200);
            });
          };

          var hideTimer;

          socket.onmessage =  function (msg) {
            //console.log('Kinect data received.');

            // Get the data in JSON format.
            var jsonObject = JSON.parse(msg.data);

            // Display the skeleton hand joints if wanted.
            if(UIIFace.options.gestureHints) {
              $('.kinectHand').show(200);
            }

            for (var i = 0; i < jsonObject.skeletons.length; i++) {
                for (var j = 0; j < jsonObject.skeletons[i].joints.length; j++) {
                    var joint = jsonObject.skeletons[i].joints[j];
                    if(joint.name == 'handleft') {
                      hands[0].cur = joint;
                      $('#handLeft').css({
                        'top'    : joint.y + 'px',
                        'left'   : joint.x + 'px',
                        'width'  : 15 + (10 * joint.z) + 'px',
                        'height' : 15 + (10 * joint.z) + 'px'
                      });
                    }
                    if(joint.name == 'handright') {
                      hands[1].cur = joint;
                      $('#handRight').css({
                        'top'    : joint.y + 'px',
                        'left'   : joint.x + 'px',
                        'width'  : 15 + (10 * joint.z) + 'px',
                        'height' : 15 + (10 * joint.z) + 'px'
                      });
                    }
                }
                //Only process the first skeleton
                break;
            }

            //Making sure visual helpers disappear if no changes are transmitted
            if(UIIFace.options.gestureHints) {
              clearTimeout(hideTimer);
              hideTimer = setTimeout(function() {
                $('.kinectHand').stop().fadeOut(200);
              }, 1000);
            }
            // Inform the server about the update.
            //socket.send("Skeleton updated on: " + (new Date()).toDateString() + ", " + (new Date()).toTimeString());
          };

          socket.onclose = function() {
            console.log('Kinect connection closed');
            if(UIIFace.options.gestureHints) {
              $('.kinectHand').hide();
            }
          };

        } //end kinect function
      } //end webSocketConnector namespace

    };

    /**
     * -------------------------------------------
     * Jquery Plugin Entry
     * -------------------------------------------
     */
    $.fn.uiiface = function( options ) {
      UIIFace.config.index = 0; //Processed element index
      UIIFace.config.elements = this; //All jquery selected elements

      return this.each(function() {
        UIIFace.initialize( options, this );
      });
    };

    /**
     * -------------------------------------------
     * Global default options
     * -------------------------------------------
     */
    $.fn.uiiface.options = {
        //Event which should be triggered on given element
        events : '',
        //Which function should be called in case the given event is triggered
        callback : null,
        //Displaying visual hints for gestures
        gestureHints: true
    };
  }
);
