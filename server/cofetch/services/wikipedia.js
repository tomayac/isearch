/**
 * Text fetch for Content Object production.
 * Facilitates dbpedia.org API in combination with Node.io 
 */
var restler = require('restler'),
    step    = require('../lib/step'),
    jsdom   = require('jsdom');

var getTextContent = function(title, callback) {

  if(!title) {
    callback('No article title was given!', null);
    return;
  }
  
  //Replace spaces
  title = title.replace(/\s/g,'_');
  
  //Building of the URL to get the content for an wikipedia article
  var contentURL = "http://en.wikipedia.org/w/api.php?"
      + 'action=parse'
      + '&prop=text|categories|images|links'
      + '&page=' + title
      + '&section=0'
      + '&redirects'
      + '&format=json';

  //DEBUG
  //console.log(detailsURL);

  restler
  .get(contentURL, {
    parser: restler.parsers.json
  })
  .on('success', function(textdata) {
    try {
      
      var basetext = textdata.parse.text['*'];
      basetext = basetext.substr(basetext.indexOf('<p>'));
      basetext = basetext.replace(/(<([^>]+)>)/ig,'').replace(/(\r\n|\n|\r)/gm,'');
      var errorIndex = basetext.indexOf('Cite error');
      if(errorIndex > -1) {
        basetext = basetext.substring(0,errorIndex);
      }

      var result = {
          "Type":"Text",
          "Name": textdata.parse.title,
          "FreeText": basetext,
          "URL":"http://en.wikipedia.org/wiki/" + title
      };
      
      //Ok, got everything here so give the result back
      callback(null, result);
      
    } catch (error) {
      callback(error, null);
    }
  })
  .on('error', function(data,response) {
    callback(response.message, null);
  });

};


var fetchText = function(query, queryClass, callback) {
  
  if (!query) {
    callback('No arguments were given to the text job', null);
    return;
  }
  
  var context = this;
  //The array for storing the results
  var results = new Array();
  var maxResults = 5;

  var wikipediaURL = "http://en.wikipedia.org/w/api.php?"
      + 'action=opensearch'
      + '&search=' + query
      + '&format=json' 
      + '&max=' + maxResults;
  
  //DEBUG:
  //console.log(wikipediaURL);

  restler
  .get(wikipediaURL, {
    parser: restler.parsers.json
  })
  .on('success', function(data) {
    try {
      if(data.error) {
        callback(data.error.info, null);
        return;
      }      
      var articles = data[1] || new Array();
      
      if(articles.length < 1) {
        callback(null, articles);
        return;
      }
      
      //Adjust the maxResults parameter if there aren't enough results
      if(articles.length < maxResults) {
        maxResults = articles.length;
      }
      
      //Fetch text content for all found articles below the maximum of texts to retrieve
      var newArguments = [];
      var initializeClosure = function(title){
        return function initialize() {
          getTextContent(title, this);
        };
      };
      var assembleClosure = function assemble(error, textitem) {
        if(error) {
          console.log("Wikipedia error: " + error);
          maxResults--;
        } else {
          results.push(textitem);
        }
        if (results.length === maxResults) {
          //Exit the job if we're done, i.e Array full
          callback(null, results);
        } else {
          this();
        }
      };
      
      for(var t=0; t < maxResults; t++) {
        newArguments.push(
          initializeClosure(articles[t]),
          assembleClosure
        );
      }
      step.apply(step, newArguments);
      
    } catch (error) {
      callback(error, null);
    }
  })
  .on('error', function(data,response) {
    callback(response.message, null);
  });;
  
};

//Exposes it publicly
if (typeof module !== 'undefined' && "exports" in module) {
	  module.exports.fetchText = fetchText; 
}   