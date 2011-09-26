
// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  arguments.callee = arguments.callee.caller;  
  if(this.console) console.log( Array.prototype.slice.call(arguments) );
};
// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();)b[a]=b[a]||c})(window.console=window.console||{});


/**
 * Custom swipe events in all 4 directions: up, down, left, right
 *
 * Fires following events:
 *  - swipestart  (as soon a swipe direction has been established)
 *  - swipeend    (when a swipe completes)
 *
 * Triggered Events are extended with an extra swipe property:
 * 
 *  Event.swipe = {
 *                  direction:  null, // up, down, left, right
 *                  dirX:       0,    // direction on x-axis -1|0|1
 *                  dirY:       0,    // direction on y-axis -1|0|1 
 *                  duration:   0,    // duration between start & stop in ms
 *                  size:       0     // percentage of element swiped
 *                };
 *           
 * Example usage:
 * 
 *    $('body').bind('swipestart', function (e) {
 *      console.log('swiping in direction = ' + e.swipe.direction);
 *    });
 *    
 *    $('body').bind('swipeend', function (e) {
 *      console.log('swipe ended, duration: ' + e.swipe.duration + 'ms, final swipe size:' + e.swipe.size);
 *    });
 *
 * @author david.lindkvist@shapeshift.se
 */
(function ($) {

  // initializes touch and scroll events
  var supportTouch    = $.support.touch, 
      touchStartEvent = (supportTouch ? "touchstart" : "mousedown"), 
      touchStopEvent  = (supportTouch ? "touchend" : "mouseup"), 
      touchMoveEvent  = (supportTouch ? "touchmove" : "mousemove");
  
  
  // handles all swiping
  $.event.special.swipeStartEnd = {
  
    minSwipeDuration: 100, // min duration in ms for a swipe to count
    
    setup: function () {
    
      var $this = $(this);
      
      /* Listen for new swipe */
      $this.bind(touchStartEvent, function (startEvent) {
        
        // normalize event and remember start point
        var nEvent = startEvent.originalEvent.touches ? startEvent.originalEvent.touches[0] : startEvent, 
            start = {
              time    : (new Date()).getTime(),
              x       : nEvent.pageX,
              y       : nEvent.pageY,
              origin  : $(startEvent.target)
            },
            swipe = {
              direction : null, // up, down, left, right
              dirX      : 0,    // direction on x-axis -1|0|1
              dirY      : 0,    // direction on y-axis -1|0|1 
              duration  : 0,    // duration between start & stop in ms
              size      : 0     // percentage of element swiped
            };
        
        
        /* called for every finger movement during swipe */
        function moveHandler(event) {
          
          // should never happen - but what the hell
          if (!start) { return; }
          
          // normalize event
          event = event.originalEvent.touches ? event.originalEvent.touches[0] : event;
          
          // figure out direction of swipe
          if ((new Date()).getTime() - start.time < $.event.special.swipeStartEnd.minSwipeDuration) {
            
            // swipe to quick to tell direction with confidence - wait for next move event
            return; 
          }
          else if (!swipe.direction) {
            
            // calculate deltas
            var deltaX = Math.abs(start.x - event.pageX), 
                deltaY = Math.abs(start.y - event.pageY);
            
            // horizontal or vertical plane movement?
            if (deltaY > deltaX) {
            
              if (start.y - event.pageY < 0) {
                swipe.direction = 'down';
                swipe.dirY = 1;
              }
              else {
                swipe.direction = 'up';
                swipe.dirY = -1;
              }
            }
            else {
            
              if (start.x - event.pageX < 0) {
                swipe.direction = 'right';
                swipe.dirX = 1;
              }
              else {
                swipe.direction = 'left';
                swipe.dirX = -1;
              }
            }
              
            // swipe was officially started - trigger event & unbind
            startEvent.type = 'swipestart';
            startEvent.swipe = swipe;
            start.origin.trigger(startEvent);
            $this.unbind(touchMoveEvent, moveHandler);
          }
        }
        
        // bind move handler and determine swipe direction
        $this.bind(touchMoveEvent, moveHandler);
        
        // bind stop event to document so that it always triggers
        $(document).one(touchStopEvent, function (stopEvent) {
          
          // unbind move if swipe was never started
          $this.unbind(touchMoveEvent, moveHandler);
          
          // calculate size of swipe - how much of the elment was swiped?
          if (swipe.direction) {
            
            // swipe duration in ms
            swipe.duration = (new Date()).getTime() - start.time;
            
            // normalize event
            var nEvent = stopEvent.originalEvent.changedTouches ? stopEvent.originalEvent.changedTouches[0] : stopEvent;
            
            // calculate swipe size in percentage
            if (swipe.dirX !== 0) {
            
              var deviceWidth = start.origin.outerWidth();
              swipe.size = Math.abs(nEvent.pageX - start.x) / deviceWidth;
            }
            else if (swipe.dirY !== 0) {
              
              var deviceHeight = start.origin.outerHeight();    
              swipe.size = Math.abs(nEvent.pageY - start.y) / deviceHeight;
            }
            
            // swipe ended - trigger event
            stopEvent.type = 'swipeend';
            stopEvent.swipe = swipe;
            start.origin.trigger(stopEvent);
          }
          
          start = undefined;
          swipe = undefined;
        });
      });
    }
  };
  
  //Adds the events to the jQuery events special collection
  $.each({
    swipestart: "swipeStartEnd",
    swipeend: "swipeStartEnd"
  }, function (event, sourceEvent) {
    $.event.special[event] = {
      setup: function () {
        $(this).bind(sourceEvent, $.noop);
      }
    };
  });
  
}(jQuery));

