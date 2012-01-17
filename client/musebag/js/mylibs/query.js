define("mylibs/query", ["mylibs/config",], function(config) {
  
  var getQueryItems = function() {
    
    var now = new Date();
    
    var queryJson = {
        fileItems : [],
        emotion   : false,
        datetime  : now.getUTCFullYear() + '-' + ((now.getUTCMonth()+1) < 10 ? '0' + (now.getUTCMonth()+1) : (now.getUTCMonth()+1)) + '-' + (now.getUTCDate() < 10 ? '0' + now.getUTCDate() : now.getUTCDate()) + 'T' + (now.getUTCHours() < 10 ? '0' + now.getUTCHours() : now.getUTCHours()) + ':' + (now.getUTCMinutes() < 10 ? '0' + now.getUTCMinutes() : now.getMinutes()) + ':' + (now.getUTCSeconds() < 10 ? '0' + now.getUTCSeconds() : now.getUTCSeconds()) + '.000Z',
        location  : false,
        tags      : false
    };
    
    //Check if the user has enter something which is not tokenized yet
    var remainingInput = $(".token-input-list-isearch li input").val();
    //Tokenize remaining input
    if (remainingInput) {
      $("#query-field").tokenInput('add',{id:remainingInput,name:remainingInput});
    }
    
    //get all elements of the query
    $('#query ul li').each(function(index) {
      
      var queryItem = {
        Type     : 'Text',
        RealType : 'Text',
        Name     : '',
        Content  : ''
      };
      
      if($(this).find('p').children().size() > 0) {
        
        var queryToken = $(this).find('p:first').children(':first');

        if(queryToken.attr('class') == 'Emotion') {
          
          var intensity = parseFloat(queryToken.attr('title'));
          var localIntensity = 0;
          console.log('found emotion with intensity ' + intensity);
          if(intensity >= 0.8) {
            localIntensity = (1 / 0.19) * (intensity - 0.8); 
            queryJson.emotion = {name : 'Happy', intensity : localIntensity};
          } else if(intensity >= 0.5 && intensity < 0.8) {
            localIntensity = (1 / 0.29) * (intensity - 0.5);
            queryJson.emotion = {name : 'Content', intensity : localIntensity};
          } else if(intensity >= 0.3 && intensity < 0.5) {
            localIntensity = 1 - (1 / 0.19) * (intensity - 0.3);
            queryJson.emotion = {name : 'Disappointed', intensity : localIntensity};
          } else {
            localIntensity = 1 - (1 / 0.29) * (intensity - 0.0);
            queryJson.emotion = {name : 'Sad', intensity : localIntensity};
          }
          
        } else if(queryToken.attr('class') == 'Location') {
          
          var location = queryToken.attr('title');
          queryJson.location = location || false;
          console.log('found location with pos ' + location);
          
        } else if(queryToken.attr('class') == 'Tag') {
          
          var recommendedTag = queryToken.text();
          if(!queryJson.tags) {
            queryJson.tags = [recommendedTag];
          } else {
            queryJson.tags.push(recommendedTag);
          }
          
        } else {
          
          queryItem.Type     = queryToken.attr('data-mode');
          queryItem.RealType = queryToken.attr('class');
          queryItem.Name     = queryToken.attr('alt');
          queryItem.Content  = queryToken.attr('src');

          console.log('found file item with name ' + queryItem.Name);
          queryJson.fileItems.push(queryItem);
          
        }
      } else if($(this).find('p:first').text().length > 3){
        
        queryItem.Content  = $(this).find('p:first').text();
        queryJson.fileItems.push(queryItem);
      }
      
    });
    
    return queryJson;
  };
  
  var submit = function(callback) {
    
    var query = getQueryItems();
    
    if (query.fileItems.length > 0 || query.emotion != false || query.location != false) { 
      console.log('searching for query data: ');
      console.log(query);
      //Send it to the server
      $.ajax({
        type: "POST",
		crossDomain: true,
        url:  config.constants.queryFormulatorUrl || 'query',
        data: JSON.stringify(query),
        success: function(data) {
          //parse the result
          try {
            data = JSON.parse(data);
          } catch(e) {
            data = {error: "The server gave me an invalid result."};  
          }
          
          if(data.error) {
            console.log("Error during submitting query: " + data.error);
			
			callback(false, data) ;
          } else {
            console.log("Search query submitted.");
			
			callback(true, data) ;
          }
        },
        dataType: "text",
        contentType : "application/json; charset=utf-8"
      });
      return true;
    } else {
      return false;
    }
  };
  
  var reset = function() {
    
  };
  
  return {
    submit: submit,
    reset: reset
  };
    
});