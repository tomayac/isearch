//Namespace
var com;
if (!com) {
  com = {};
} else if (typeof com != "object") {
  throw new Error("com already exists and is not an object");
}
if (!com.isearch) {
  com.isearch = {}
} else if (typeof com.isearch != "object") {
  throw new Error("com.isearch already exists and is not an object");
}
if (com.isearch.tags) {
  throw new Error("com.isearch.tags already exists");
}

com.isearch.tags = {}

com.isearch.tags.init = function() {
  
  //Formatting of the tags
  $('.tags a').each(function() {
    var $thisTag = $(this);
    var fontSize = $thisTag.attr('data-rank');
    console.log(fontSize);
    $thisTag.css('font-size', fontSize + 'em');
  });
  
  $(".tags a").click(function() {
    var tagText = $(this).text();
    var query = $('#query-field').val();
    $("#query-field").tokenInput('add',{id: tagText,name: tagText})    
  });

}
