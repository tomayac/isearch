define("mylibs/query", ["mylibs/config",], function(config) {
  
  var getQueryItems = function() {
    
    var now = new Date();
    
    var queryJson = {
        fileItems : [],
        emotion   : false,
        datetime  : now.getUTCFullYear() + '-' + ((now.getUTCMonth()+1) < 10 ? '0' + (now.getUTCMonth()+1) : (now.getUTCMonth()+1)) + '-' + (now.getUTCDate() < 10 ? '0' + now.getUTCDate() : now.getUTCDate()) + 'T' + (now.getUTCHours() < 10 ? '0' + now.getUTCHours() : now.getUTCHours()) + ':' + (now.getUTCMinutes() < 10 ? '0' + now.getUTCMinutes() : now.getMinutes()) + ':' + (now.getUTCSeconds() < 10 ? '0' + now.getUTCSeconds() : now.getUTCSeconds()) + '.000Z',
        location  : false,
        rhythm    : false,
        tags      : false
    };
    
    //Check if the user has entered something which is not tokenized yet
    var remainingInput = $(".token-input-list-isearch li input").val();
    console.log('remaining input: ');
    console.log(remainingInput);
    //Tokenize remaining input
    if (remainingInput) {
      $("#query-field").tokenInput('add',{id:remainingInput,name:remainingInput});
      console.log(remainingInput);
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
		      var valence = 2*(intensity - 0.5) ;
          console.log('found emotion with intensity ' + intensity);
          if(intensity >= 0.8) {
            localIntensity = (1 / 0.19) * (intensity - 0.8); 
            queryJson.emotion = {name : 'Happy', intensity : localIntensity, "valence": valence };
          } else if(intensity >= 0.5 && intensity < 0.8) {
            localIntensity = (1 / 0.29) * (intensity - 0.5);
            queryJson.emotion = {name : 'Content', intensity : localIntensity, "valence": valence};
          } else if(intensity >= 0.3 && intensity < 0.5) {
            localIntensity = 1 - (1 / 0.19) * (intensity - 0.3);
            queryJson.emotion = {name : 'Disappointed', intensity : localIntensity, "valence": valence};
          } else {
            localIntensity = 1 - (1 / 0.29) * (intensity - 0.0);
            queryJson.emotion = {name : 'Sad', intensity : localIntensity, "valence": valence};
          }
          
        } else if(queryToken.attr('class') == 'Location') {
          
          var location = queryToken.attr('title');
          queryJson.location = location || false;
          console.log('found location with pos ' + location);
          
        } else if(queryToken.attr('class') == 'Rhythm') {
          
          queryJson.rhythm = {
              'duration'  :  parseInt(queryToken.attr('data-duration')),
              'intervals' :  queryToken.attr('title').split(',')
          };
          
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
		      queryItem.Token    = queryToken.attr('data-token') ;
		  
          console.log('found file item with name ' + queryItem.Name);
          queryJson.fileItems.push(queryItem);
          
        }
      } else if($(this).find('p:first').text().length > 2){
        queryItem.Content  = $(this).find('p:first').text();
        queryJson.fileItems.push(queryItem);
      }
	  
	  //
	  queryJson.bluetooth = 2;
      
    });
    
    return queryJson;
  };
  
  var submit = function(relevant, callback) {
    
    var query = getQueryItems();
    
    if (query.fileItems.length > 0 || query.emotion != false || query.location != false || query.rhythm != false || query.tags != false) { 
      console.log('searching for query data: ');
      console.log(query);
	
      query.relevant = relevant ;
	  
      //Send it to the server
	  
	  var mqfUrl = config.constants.queryFormulatorUrl || 'query' ;
	  
	  if ( config.constants.queryOptions.maxNumResults ) mqfUrl += '&total=' + config.constants.queryOptions.maxNumResults ;
	  if ( config.constants.queryOptions.clusters0 ) mqfUrl += '&cls=' + config.constants.queryOptions.clusters0 ;
	  if ( config.constants.queryOptions.trans ) mqfUrl += '&trans=' + config.constants.queryOptions.trans ;
	  
      $.ajax({
        type: "POST",
        crossDomain: true,
        url:  mqfUrl,
        data: JSON.stringify(query),
        contentType : "application/json; charset=utf-8",
        dataType : "json",
        success: function(data) {
          //parse the result
          console.log("Search query submitted.");
          console.dir(data);
          callback(true, data) ;
        },
        error: function(jqXHR, error, object) {
          data = {error: "the server gave me an invalid result."}; 
          console.log("Error during submitting query: " + data.error);
          callback(false, data) ;
        },
        complete: function() {
          $.event.trigger( "ajaxStop" );
        }
      });
      
    } else {
      var data = {error: "the query seems to be a bit too short."};
      callback(false, data) ;
    }
  };
  
  var reset = function() {
    
  };
  
  return {
    submit: submit,
    reset: reset
  };
    
});
