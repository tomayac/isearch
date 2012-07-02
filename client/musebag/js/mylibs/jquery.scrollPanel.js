/**
 * @author Stefan Mirea <steven.mirea@gmail.com>
 * @NOTE: depends on:
 *      - jquery.mousewheel.js
 * @description
 */
define(['jquery', '!js/libs/jquery.mousewheel.js'], function( $ ){
  
  // global options
  $.scrollPanel = {
    /* for which children to apply the events.
        NOTE: this is due to a bug that makes touchmove events fire very slowly
                at the beginning of the drag. Once that is fixed, this option can be
                removed and the binding can only be done on the parent container only
    */
    children : '> *',
    // how much to shift when scrolling once with the mousewheel
    scrollSize : 10
  };
  
  var methods = {
    updateContainerWidth : function( index, Element ){
      var data = $(this).data('scrollPanel');
      if( data ){
        data.com.containerWidth = $(this).innerWidth();
      }
    },
    remove : function( index, Element ){
      var data = $(this).data('scrollPanel');
      if( data ){
        data.com.container
          .add( data.com.container.find( data.opt.children ) )
          .unbind( '.startSlide' )
          .unbind( '.slide' )
          .unbind( '.stopSlide' )
          .append( data.com.holder.children() );
          
        data.com.holder.remove();
        $(this).data('scrollPanel', null);
      }
    }
  };
  
  /**
   * @description
   * @param {object} options
   */
  $.fn.scrollPanel = function( options ){
    // if first parameter is string, then call the method with the respective name
    if( typeof options === 'string' && typeof methods[options] === 'function' ){  
      return this.each( methods[options] );
    }
    
    var opt = $.extend( {}, $.scrollPanel, options );
    return this.each(function(){
      var com = {
        container : $(this),
        containerWidth : $(this).innerWidth(),
        // wrapper for all the children in the container - used to scroll
        holder : $(document.createElement('div')),
        holderWidth : null,
        pivot : 0
      };

      com.container.data('scrollPanel', {com:com, opt:opt});
      
      updateRealInnerWidth( com, opt );

      // add mouse events
      var stopSlideMouse = function(event){ 
        pointerUp(com, event); 
      };

      com.container
        .bind('mouseleave.stopSlide', stopSlideMouse)
        .bind('mouseup.stopSlide', stopSlideMouse)
        .find( opt.children )
        .add( com.holder )
        .bind('mousedown.startSlide', function(event){ pointerDown(com, event); })
        .bind('mousewheel.startSlide', function(event, delta){
          event.preventDefault();
          event.stopPropagation();
          console.log( '----wrum wrruuuum', delta, opt, event.delta );
          changePosition( com, delta * opt.scrollSize );
        });
      
        // add touch events
        var stopSlide = function(event){
          var e = event.originalEvent;
          com.pivot = null;
        }

        com.container
          .bind('touchstart.startSlide', function(event){
            event.preventDefault();
            event.stopPropagation();
            var e = event.originalEvent;
            com.pivot = e.touches[0].pageX;
          })
          .bind('touchmove.slide', function(event){
            event.preventDefault();
            event.stopPropagation();
            var e = event.originalEvent;
            var pivot = e.touches[0].pageX;
            changePosition( com, pivot - com.pivot );
            com.pivot = pivot;
          })
          .bind('touchleave.stopSlide', stopSlide)
          .bind('touchcancel.stopSlide', stopSlide)
          .bind('touchend.stopSlide', stopSlide);
      
      // update wrapper
      com.holder
        .append( com.container.children() )
        .appendTo( com.container );
    });
  };
  
  function updateRealInnerWidth( com, opt ){
    // find out the real inner width of the container
    //    ( real inner width = total width of all children put on the same row )
    com.holderWidth = 0;
    com.container
      .find( opt.children )
      .each(function(){
        com.holderWidth += $(this).outerWidth( true );
      });
      com.holder.css({
        position : 'relative',
        left : 0,
        width : com.holderWidth
      });
  }
  
  function pointerDown( com, event ){
    event.stopPropagation();
    com.pivot = event.originalEvent.pageX;
    com.container
      .unbind('.slide')
      .bind('mousemove.slide', function(event){ pointerMove(com, event); });
  };
  
  function pointerUp( com, event ){
    com.container.unbind('mousemove.slide');
  };
  
  function pointerMove( com, event ){
    event.preventDefault();
    event.stopPropagation();
    var pivot = event.pageX !== undefined ? event.pageX : event.originalEvent.originalEvent.pageX;
    changePosition( com, pivot - com.pivot );
    com.pivot = pivot;
  };
  
  function changePosition( com, value ){
    console.log( com.containerWidth, com.holderWidth );
    var newPosition = parseInt(com.holder.css('left')) + value;
    if( newPosition > 0 ){
      newPosition = 0;
    }
    if( newPosition < com.containerWidth - com.holderWidth ){
      newPosition = com.containerWidth - com.holderWidth;
    }
    com.holder.css( 'left', newPosition+'px' );
  };
  
});