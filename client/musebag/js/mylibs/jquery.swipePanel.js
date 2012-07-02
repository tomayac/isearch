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
        if set to a DOM/jQuery element, that will be used instead
    */
    container: null,
    // for which children to apply the events.
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
    updateContainerWidth: function(index, Element) {
      var data = $(this).data('swipePanel');
      if (data) {
        data.components.rootWidth = $(this).width();
      }
    },
    remove: function(index, Element) {
      var data = $(this).data('swipePanel');
      if (data) {
        data.components.root
          .unbind('.startSlide')
          .unbind('.slide')
          .unbind('.stopSlide')
          .append(data.components.container.children());
        data.components.container.remove();
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
    if (typeof userOptions == 'string'
        && typeof methods[userOptions] == 'function'
    ) {
      return this.each(methods[userOptions]);
    }

    var options = $.extend({}, $.swipePanel, userOptions);
    return this.each(function() {
      var components = {
        root: $(this),
        rootWidth: $(this).width(),
        // wrapper for all the children in the root - used to scroll
        container: options.container || $(document.createElement('div')),
        containerWidth: null,
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

      updateRealInnerWidth(components, options);

      // add mouse events
      var stopSlideMouse = function(event) {
        pointerUp(components, event);
      };

      components.root
        .bind('mouseleave.stopSlide', stopSlideMouse)
        .bind('mouseup.stopSlide', stopSlideMouse)
        .bind('mousedown.startSlide', function(event) {
          pointerDown(components, event);
        })
        .bind('mousewheel.startSlide', function(event, delta) {
          event.preventDefault();
          event.stopPropagation();
          changePosition(components, delta * options.scrollSize);
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
            components.pivot = e.touches[0].pageX;
          })
          .bind('touchmove.slide', function(event) {
            event.preventDefault();
            event.stopPropagation();
            var e = event.originalEvent;
            var pivot = e.touches[0].pageX;
            changePosition(components, pivot - components.pivot);
            components.pivot = pivot;
          })
          .bind('touchleave.stopSlide', stopSlide)
          .bind('touchcancel.stopSlide', stopSlide)
          .bind('touchend.stopSlide', stopSlide);

      // update container
      if (options.container !== null) {
        // remove any custom container from the DOM to prevent exceptions
        components.container.remove();
      }
      components.container
        .append(components.root.find(options.children))
        .appendTo(components.root);
    });
  }

  function updateRealInnerWidth(components, options) {
    // find out the real inner width of the root
    //    (real inner width = total width of all children put on the same row)
    components.containerWidth = 0;
    components.root
      .find(options.children)
      .each(function() {
        components.containerWidth += $(this).outerWidth(true);
      });
      components.container.css({
        position: 'relative',
        left: 0,
        width: components.containerWidth
      });
  }

  function pointerDown(components, event) {
    event.stopPropagation();
    components.pivot = event.originalEvent.pageX;
    components.root
      .unbind('.slide')
      .bind('mousemove.slide', function(event) {
        pointerMove(components, event);
      });
  }

  function pointerUp(components, event) {
    components.root.unbind('mousemove.slide');
  }

  function pointerMove(components, event) {
    event.preventDefault();
    event.stopPropagation();
    var pivot = event.pageX;
    changePosition(components, pivot - components.pivot);
    components.pivot = pivot;
  }

  function changePosition(components, value) {
    var newPosition = parseInt(components.container.css('left'), 10) + value;
    if (newPosition > 0) {
      newPosition = 0;
    }
    if (newPosition < components.rootWidth - components.containerWidth) {
      newPosition = components.rootWidth - components.containerWidth;
    }
    components.container.css('left', newPosition+'px');
  }

});