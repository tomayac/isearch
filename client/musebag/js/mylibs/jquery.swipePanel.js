/**
 * @author Stefan Mirea <steven.mirea@gmail.com>
 * @NOTE: depends on:
 *      - jquery.mousewheel.js
 * @description
 */
define(['jquery', '!js/libs/jquery.mousewheel.js'], function($) {

  // global options
  $.swipePanel = {
    /* will innerWrapp the root
        if set to null, a default one will be created
        if set to a DOM/jQuery object, that will be used instead
    */
    container: null,
    /* for which children to apply the events
      if options.container is not null, then this option will have no effect
      and all options.container.children() will be used
    */
    children: '> *',
    // how much to shift when scrolling once with the mousewheel
    scrollSize: 10,
    // whether the slider is horizontal or vertical
    vertical: false,
    /* on which elements to disable native browser dragging
        (cause scroll to malfunction on images and links)
    */
    disableDrag: 'img, a'
  };

  var methods = {
    updateContainerSize: function(index, Element) {
      var data = $(this).data('swipePanel');
      if (data) {
        data.components.rootSize = $(this)[data.options._dimension]();
        console.log( $(this)[data.options._dimension]() );
      }
    },
    remove: function(index, Element) {
      var data = $(this).data('swipePanel');
      if (data) {
        $(this)
          .unbind('.startSlide')
          .unbind('.slide')
          .unbind('.stopSlide');
        if (data.options.container) {
          data.options.container.css(data.options.container.data('origCSS'));
        } else {
          // if a custom container is not used, reset the structure
          data.components.root.append(data.components.container.children());
          data.components.container.remove();
        }
        $(this).data('swipePanel', null);
      }
    }
  };

  /**
   * @description
   * @param {object} options
   */
  $.fn.swipePanel = function(userOptions) {
    // if first parameter is string, then call the method with the same name
    if (typeof userOptions == 'string') {
      if( typeof methods[userOptions] == 'function' ){
        return this.each(methods[userOptions]);
      } else {
        console.warn('[$.swipePanel] Unknown method: '+userOptions);
      }
    }

    var options = $.extend({}, $.swipePanel, userOptions);
    if (options.vertical) {
      options._dimension = 'height';
      options._direction = 'top';
      options._axis = 'Y';
    } else {
      options._dimension = 'width';
      options._direction = 'left';
      options._axis = 'X';
    }

    return this.each(function() {
      var components = {
        root: $(this),
        rootSize: $(this)[options._dimension](),
        // wrapper for all the children in the root - used to scroll
        container: options.container || $(document.createElement('div')),
        containerSize: null,
        pivot: 0
      };

      components.root.data('swipePanel', {
        components: components,
        options: options
      });

      if (options.disableDrag) {
        components.container.find(options.disableDrag)
          .live('dragstart', function(event) { event.preventDefault(); });
      }

      // add mouse events
      var stopSlideMouse = function(event) {
        pointerUp(components, event);
      };

      components.root
        .bind('mouseleave.stopSlide', stopSlideMouse)
        .bind('mouseup.stopSlide', stopSlideMouse)
        .bind('mousedown.startSlide', function(event) {
          pointerDown(components, options, event);
        })
        .bind('mousewheel.startSlide', function(event, delta) {
          event.preventDefault();
          event.stopPropagation();
          changePosition(components, options, delta * options.scrollSize);
        });

        // add touch events
        var stopSlide = function(event) {
          var e = event.originalEvent;
          components.pivot = null;
        }

        components.root
          .bind('touchstart.startSlide', function(event) {
            event.stopPropagation();
            var e = event.originalEvent;
            components.pivot = e.touches[0]['page'+options._axis];
          })
          .bind('touchmove.slide', function(event) {
            event.preventDefault();
            event.stopPropagation();
            var e = event.originalEvent;
            var pivot = e.touches[0]['page'+options._axis];
            changePosition(components, options, pivot - components.pivot);
            components.pivot = pivot;
          })
          .bind('touchleave.stopSlide', stopSlide)
          .bind('touchcancel.stopSlide', stopSlide)
          .bind('touchend.stopSlide', stopSlide);

      // update container if it is not a custom one
      if (!options.container){
        components.container
          .append(components.root.find(options.children))
          .appendTo(components.root);
      }

      // remember the initial CSS of the container and update its Size
      var oldAttributes = {};
      var cssAttr = ['width', 'height', 'position', 'left', 'top'];
      for (var i=0; i<cssAttr.length; ++i) {
        oldAttributes[cssAttr[i]] = components.container.css(cssAttr[i]);
      }
      components.container
        .data('origCSS', oldAttributes)
        .css({
          position: 'relative'
        })
      updateRealInnerSize(components, options);
    });
  }

  /* find out the real inner size of the root
      (real inner size = size of all children put on the same axis)
  */
  function updateRealInnerSize(components, options) {
    // find out which size function to use (outerWidth or outerHeight)
    var getSizeMethod = 'outer'
                        + options._dimension.charAt(0).toUpperCase()
                        + options._dimension.slice(1);
    components.containerSize = 0;
    components.container
      .children()
      .each(function() {
        components.containerSize += $(this)[getSizeMethod](true);
      });
    components.container.css(options._direction, 0);
    components.container.css(options._dimension, components.containerSize);
  }

  function pointerDown(components, options, event) {
    event.stopPropagation();
    components.pivot = event.originalEvent['page'+options._axis];
    components.root
      .unbind('.slide')
      .bind('mousemove.slide', function(event) {
        pointerMove(components, options, event);
      });
  }

  function pointerUp(components, event) {
    components.root.unbind('mousemove.slide');
  }

  function pointerMove(components, options, event) {
    event.preventDefault();
    event.stopPropagation();
    var pivot = event['page'+options._axis];
    changePosition(components, options, pivot - components.pivot);
    components.pivot = pivot;
  }

  function changePosition(components, options, value) {
    var newPosition = parseInt(components.container.css(options._direction), 10)
                      + value;
    if (newPosition > 0) {
      newPosition = 0;
    }
    if (newPosition < components.rootSize - components.containerSize) {
      newPosition = components.rootSize - components.containerSize;
    }
    components.container.css(options._direction, newPosition+'px');
    components.root.trigger('swipePanel-move');
  }
});