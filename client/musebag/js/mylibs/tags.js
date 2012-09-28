/*
* Class to represent the user tags
*/

define("mylibs/tags", [
    "mylibs/config"
  ], function(config){
  
  var tags = []; 
  
  var init = function() {  
    
    //Formatting of the tags
    $('.tags a').each(function() {
      var $thisTag = $(this);
      var fontSize = $thisTag.attr('data-rank');
      $thisTag.css('font-size', fontSize + 'em');
      $thisTag.css('margin-right', '0.4em');
    });
    
    $(".tags a").hover(function() {
      var itemHtml = '<a href="http://www.google.com"><img src="img/fake/11.png" /></a>'
                   + '<a href="http://www.google.com"><img src="img/fake/12.png" /></a>'
                   + '<a href="http://www.google.com"><img src="img/fake/13.png" /></a>';
      
      $('#itemRecom span').html(itemHtml);
      
      /** @TODO: Bind click events on links in item recommendation HTML */
      
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
        
    $(".tags a").click(function() {
      var tagText = $(this).text().replace('&nbsp;',' ');
      var query = $('#query-field').val();
      //Recommended tags will get a special behaviour for search, unlike normal text input
      $("#query-field").tokenInput('add',{id: tagText, name: '<span class="Tag" data-subtype="Tag">' + tagText + '</span>'});    

      return false ;
    });
  };
  
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
  var getUserTags = function(userId) {

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
    getUserTags : getUserTags
  };
});
