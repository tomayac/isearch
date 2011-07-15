/*
* Class to represent the user tags
*/

define("mylibs/com.isearch.tags", function(){
  var init = function() {

    //Formatting of the tags
    $('.tags a').each(function() {
      var $thisTag = $(this);
      var fontSize = $thisTag.attr('data-rank');
      $thisTag.css('font-size', fontSize + 'em');
    });

    $(".tags a").click(function() {
      var tagText = $(this).text();
      var query = $('#query-field').val();
      $("#query-field").tokenInput('add',{id: tagText,name: tagText})    
    });
  };
  
  return {
    init: init
  };
});