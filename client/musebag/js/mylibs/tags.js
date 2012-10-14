/*
* Class to represent the user tags
*/

define("mylibs/tags", ["mylibs/config", "js/mylibs/visualization/ThumbContainer.js"], function(config){
  
  var tags = []; 
  var recItemCount = 0 ;
  
  var fetchRecommendedMedia = function(tag, callback) {
  
  		var mqfUrl = config.constants.queryUrl || 'query' ;
  		
  		mqfUrl += "&total=5&cls=1&tr=rand" ;
	  
		var now = new Date();
		 
		var query = { 
			emotion: false, 
			location: false, 
			bluetooth: false, 
			tags: [tag],
		 	datetime  : now.getUTCFullYear() + '-' + ((now.getUTCMonth()+1) < 10 ? '0' + (now.getUTCMonth()+1) : (now.getUTCMonth()+1)) + '-' + (now.getUTCDate() < 10 ? '0' + now.getUTCDate() : now.getUTCDate()) + 'T' + (now.getUTCHours() < 10 ? '0' + now.getUTCHours() : now.getUTCHours()) + ':' + (now.getUTCMinutes() < 10 ? '0' + now.getUTCMinutes() : now.getMinutes()) + ':' + (now.getUTCSeconds() < 10 ? '0' + now.getUTCSeconds() : now.getUTCSeconds()) + '.000Z',
		 	fileItems: [ {"Type":"Text","RealType":"Text","Name":"","Content":  tag }]
		} ;
				  
    	$.ajax({
    	    type: "POST",
    	    crossDomain: true,
    	    url:  mqfUrl,
    	    contentType : "application/json; charset=utf-8",
    	    dataType : "json",
    	    data: JSON.stringify(query),
    	    success: function(data) {
    	      docs = [] ;
		
		  		for (var i=0 ; i<data.documentList.length ; i++ ) {
  					var doc = data.documentList[i] ;
		  			docs.push({ doc: doc }) ;
			  	}

    	     	callback(docs) ;
    	    },
    	    error: function(jqXHR, error, object) {
    	      data = {error: "the server gave me an invalid result."}; 
    	    },
    	    complete: function() {
    	      $.event.trigger( "ajaxStop" );
    	    }
    	});
      
  
  };
 
  
  var clickHandler = function(doc, mtype) {
  
  	var media = null ;
  	
    for(var i=0 ; i<doc.media.length ; i++ )
  	{
  		var mediaObj = doc.media[i] ;
  		if ( mediaObj.type == mtype ) {
  			media = mediaObj ;
  			break ;
  		}
  	}
  	
  	var query = $('#query-field').val();
  	  
  	//Create the token for the search bar
  	 var id = "recommendItem" + recItemCount;
  	 var token = "";
      
     if ( mtype == "ImageType" ) {
     	token = '<img id="' + id + '" alt="" src="' + media.previews[0].url + '" ' +
     		'class="picture" data-mode="ImageType" data-url="' + media.url + '" />';
   	 }
   	 else if ( mtype == "VideoType") {
	   	 token = '<img id="' + id + '" alt="" src="' + media.previews[0].url + '" ' +
     		'class="video" data-mode="VideoType" data-url="' + media.url + '" />';
   	 }
   	 else if ( mtype == "Object3D") {
	   	 token = '<img id="' + id + '" alt="" src="' + media.previews[0].url + '" ' +
     		'class="3d" data-mode="Object3D" data-url="' + media.url + '" />';   	 
   	 }
   	 else if ( mtype == "SoundType" ) {
   	 	token = '<audio controls="controls" id="' + id + '" ' + 
   	 	'class="audio" data-mode="SoundType" data-url="' + media.url + '" >';
   	 	   	 	
   	 	for ( var i=0 ; i<media.previews.length ; i++ )
      {
      	var url = media.previews[i].url ;
      	var format = media.previews[i].format ;
        	
      	if (  (/audio/i).test(format) ) {
      	  token += '<source src="' + url + '" type="' + format + '" />' ;
      	}
      }   	 	
   	 	token += '</audio>' ;
   	 
   	}
   	
    $("#query-field").tokenInput('add',{id: id,name: token});   
    recItemCount++ ;
  
  };
  
  var init = function() {
  
    //Formatting of the tags
    $('.tags a').each(function() {
      var $thisTag = $(this);
      var fontSize = $thisTag.attr('data-rank');
      $thisTag.css('font-size', fontSize + 'em');
      $thisTag.css('margin-right', '0.4em');
    });
    /*
    $(".tags a").hover(function() {
      var itemHtml = '<a href="http://www.google.com"><img src="img/fake/11.png" /></a>'
                   + '<a href="http://www.google.com"><img src="img/fake/12.png" /></a>'
                   + '<a href="http://www.google.com"><img src="img/fake/13.png" /></a>';
      
      $('#itemRecom span').html(itemHtml);
      
      // @TODO: Bind click events on links in item recommendation HTML 
      
      var offset = $(this).offset();
      var newPos = {
        top  : (offset.top - $('#itemRecom').height() - 22),
        left : (offset.left - ($('#itemRecom').width()/2) + ($(this).width()/2)) 
      };
      
      $('#itemRecom').stop(true).show();
      $('#itemRecom').offset(newPos);
      $('#itemRecom').off('mouseenter').on('mouseenter',function() {
        $(this).stop(true).show();
        $('#itemRecom').one('mouseleave',function() {
          $('#itemRecom').delay(400).fadeOut(200);
        });
      });
      
    },
    function(){
      $('#itemRecom').delay(400).fadeOut(200);
    });
        */
        
    $(".tags a").click(function() {
      
      /*
      var tagText = $(this).text();
      var query = $('#query-field').val();
      //Recommended tags will get a special behaviour for search, unlike normal text input
      $("#query-field").tokenInput('add',{id: tagText,name: '<span class="Tag">' + tagText + '</span>'});    
      */
      
      var tagText = $(this).text();
      
      var popup = $("<div/>").appendTo(document.body) ;
      
      var tagPos = $(this).offset() ;
      
  	  popup.dialog({
    		width: 400,
    		height: 180,
    		modal: true,
    		zIndex: 100,
    		closeOnEscape: true,
    		dialogClass: "itemrec",
    		position: [tagPos.left, tagPos.top+10],
  	    open: function () {
        	var container = $(this) ;
        	var that = this ;
        	
        	fetchRecommendedMedia(tagText, function(data) {
      	
      			var cont = $("<div/>", {css: {left: 0, right:0, top:10, bottom:10, position:"absolute", overflow: "hidden" }}).appendTo(container);
      			var close = $("<a/>", { href:"javascript:void(0)", text: "close"}).appendTo(cont) ;
        		var icons = $("<div/>", { css: { width: "100%", height: "100%"}}).appendTo(cont);
        		
        		close.click(function() {
        			container.remove() ;
        			return false ;	
        		}) ;
        		
        		if ( data.length == 0 ) { 
        			icons.html("<span>Sorry no recommendations</span>") ;
        		} else {
        			var modalities = ["image", "3d", "video", "audio"] ;
      				var tc = new ThumbContainer(icons, data, {showMenu: false, navbarMode: "hidden", findSimilar:false, onClick: clickHandler}, { "modalities": modalities, filterBar: { "modalities": function() {return modalities;} }}) ;
      				tc.draw() ;
        		}
        	}) ;
          	
        },     
        close: function() {
          //docPreview.empty() ;
  			}
  	  });
      
      return false ;
   });
  }; //End init function
  
  var getTags = function() {
    return tags;
  };
  
  //Returns the right format for TokenInput plugin
  //i.e, [{id:tag1, name:tag1}, {id:tag2, name:tag2}, etc]
  var getTokens = function() {
    var tokens = [];
    $.each(tags, function(index, tag) {
      tokens.push({
        id: tag, 
        name: tag
      });
    });
    return tokens;
  };
  
  //Get tag recommendations for the user which is logged in
  var setUserTags = function(userId) {

    //Ask for tag recommendations
    $.ajax({
      type: "GET",
      url: config.constants.tagRecomUrl,
      success: function(data) {
        
        try {
          data = JSON.parse(data);
          
          var html = '';
          console.dir(data);
          tags = [];
          
          //Create the tag cloud html for the user interface and store the retrieved tags
          //setting up the token input
          for(var t=0; t < data.length; t++) {
          	data[t][0] = data[t][0] + '';
            html += '<a href="#" data-rank="' + data[t][1] + '">' + data[t][0].replace(' ', '&nbsp;') + '</a>';
            tags.push(data[t][0]);
          }
            
          $(".tags").html(html);
          
          //Get tokens and load them as auto suggestions for the user
          var tokens = getTokens();
          //$(".token-input-list-isearch").remove();
          //$("#query-field").tokenInput("clear");
          $("#query-field").tokenInput('setOptions', { 'local_data' : tokens });
          
          //Initializes the tagging system
          init();
          
        } catch(e) {
          console.log('Error parsing tag recommendations: ' + e.toString());
        }
      },
      error: function(jqXHR, error, object) {
        console.log("Error getting tag recommendations: " + error);
      },
      dataType: "text",
      contentType : "application/json; charset=utf-8"
    });
  };
  
  return {
    init: init,
    getTags: getTags, 
    getTokens: getTokens,
    setUserTags : setUserTags
  };
});
