/*
* Class to represent the user tags
*/

define("mylibs/com.isearch.tags", function(){
  
  var tags = [];
  
  
  var init = function() {  
    
    //Formatting of the tags
    $('.tags a').each(function() {
      var $thisTag = $(this);
      var fontSize = $thisTag.attr('data-rank');
      $thisTag.css('font-size', fontSize + 'em');
      tags.push($thisTag.text());
    });
    
    $(".tags a").click(function() {
      var tagText = $(this).text();
      var query = $('#query-field').val();
      $("#query-field").tokenInput('add',{id: tagText,name: tagText})    
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
  
  return {
    init: init,
    getTags: getTags, 
    getTokens: getTokens
  };
});