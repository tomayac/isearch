/**
 * @description Content editing tools for different media types (e.g. visual word selector for video)
 * @author Jonas Etzold
 */
define("mylibs/queryTools", [
    "mylibs/config"
  ],
  function(config) {
    
    function setupVideoKeyframeSelector () {
      var $videoKeyframes = $('#videoKeyframes');
      /*HACK: this is just a temporary hack to develop the UI for
       * the video upload.
       */
      $.ajax({
        type: 'GET',
        url: 'dummy_video_response.xml',
        dataType: 'xml',
        success: function(xml){
          console.log('Loaded dummy xml file');
          var $root = $(xml).children().eq(0);
          var imageData = [];
          $root
            .children()
            .each(function(){
              var $self = $(this).children().eq(0);
              var getAttr = function(attr){
                return $self.attr(attr);
              };
              imageData.push({
                uri: getAttr('uri'),
                score: parseInt(getAttr('score')),
                width: parseInt(getAttr('xMax') - getAttr('xMin')),
                height: parseInt(getAttr('yMax') - getAttr('yMin'))
              });
            });
          var $containers = $();
          var maxWidth = 80;
          var maxHeight = 80;
          for(var i in imageData){
            var $keyframeContainer = $(document.createElement('span'));
            $keyframeContainer
              .attr({
                score: imageData[i].score,
                uri: imageData[i].uri,
                imageWidth: imageData[i].width,
                imageHeight: imageData[i].height
              })
              .css({
                position: 'relative',
                display: 'inline-block',
                border: '1px solid #ccc',
                background: "#fff url('"+imageData[i].uri+"') no-repeat",
                backgroundSize: 'cover',
                width: maxWidth+'px',
                height: maxHeight+'px',
                margin: '2px',
                padding: '2px'
              })
              .bind('click.zoom', function(){
                if (!$videoKeyframes.data('swipePanel').components.swiped) {
                  keyframeZoom.call(this, event);
                }
              });
  
            $containers = $containers.add($keyframeContainer);
          }
          $containers.attr('class', 'keyframeContainer');
          $videoKeyframes
            .show()
            .html($containers)
            .swipePanel('remove')
            .swipePanel({
              scroll: 40
            })
            .bind('swipePanel-move', function(event){
              //TODO: actually preload nearby images
            });
        }
      });
  
      var keyframeZoom = (function(){
        var $lastZoom = null;
  
        $(document).bind('click.hideZoom', function(event){
          if ($lastZoom) {
            var $callTree = $(event.target).parents().add($(event.target));
            if ($callTree.filter($lastZoom).length == 0
                && $callTree.filter('.keyframeZoom').length == 0){
              hideZoom($lastZoom);
            }
          }
        });
  
        return function keyframeZoom (event) {
          $(this).addClass('keyframeZoom');
          var $container = $(document.createElement('div'));
          var width = $(this).width();
          var height = $(this).height();
          var src = $(this).attr('uri');
          var offset = $(this).offset();
          $container
            .appendTo($('body'))
            .css({
              position: 'absolute',
              zIndex: 100000,
              left: offset.left,
              top: offset.top,
              border: '1px solid #bbb',
              background: 'rgba(0, 0, 0, 0.8)',
              width: width,
              height: height,
              opacity: 0.1
            })
            .animate({
              left: offset.left - ($(this).attr('imageWidth') - width) / 2,
              top: offset.top - ($(this).attr('imageHeight') - height) / 2,
              width: $(this).attr('imageWidth'),
              height: $(this).attr('imageHeight'),
              opacity: 1
            }, 500, function(){
              var image = $(document.createElement('img'));
              image
                .hide()
                .attr('src', src)
                .fadeIn(400)
                .appendTo($container);
            });
            var $addButton = $(document.createElement('a'));
            var $closeButton = $(document.createElement('a'));
  
            $addButton
              .add($closeButton)
              .data('target', $container)
              .attr('href', 'javascript:void(0)')
              .appendTo($container);
            $addButton
              .attr('class', 'keyframe-button keyframe-add')
              .html('add')
              .bind('click.add', function(event){
                var src = $(this).data('target').find('img').eq(0).attr('src');
                if ($(".token-input-list-isearch li img").filter('[src="'+src+'"]').length == 0) {
                  var token = '<img src="'+src+'" alt="loading..." />';
                  var id = 'fileQueryItem'+($(".token-input-list-isearch li").size()-1);
                  $("#query-field").tokenInput('add',{id:id, name:token});
                }
                hideZoom();
              });
            $closeButton
              .attr('class', 'keyframe-button keyframe-close')
              .html('close')
              .bind('click.close', function(){
                hideZoom();
              });
  
            hideZoom($lastZoom);
            $lastZoom = $container;
            $videoKeyframes.swipePanel('pause');
        };
  
        function hideZoom (){
          $videoKeyframes.swipePanel('unpause');
          if ($lastZoom && $lastZoom.jquery) {
            var offset = $lastZoom.offset();
            $lastZoom.find('img').remove();
            $lastZoom
              .stop()
              .animate({
                left: offset.left + $lastZoom.width() / 2 - 1,
                top: offset.top + $lastZoom.height() / 2 - 1,
                width: 2,
                height: 2,
                opacity: 0
              }, 300, function(){
                $(this).remove();
              });
          }
        }
      })();
    } // End setupVideoKeyframeSelector
  
    //Public variables and functions
    return {
      setupVideoKeyframeSelector : setupVideoKeyframeSelector
    };
    
  }
);

