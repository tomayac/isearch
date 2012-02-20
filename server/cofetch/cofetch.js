var http      = require('http'),
    url       = require('url'),
    restler   = require('restler'),
    qs        = require('querystring'),
    util      = require('util'),
    fetch     = require('./fetch'),
    rucod     = require('./store');

//Global error message
var msg       = {error: 'Something went wrong.'};

var handleError = function(message, res) {
  msg.error = message;
  res.json(msg); //JSON.stringify(msg));
};

//Fetch helper function
var handleFetch = function(keywords, category, index, automatic, callback) {
  
  var cofetcher = new fetch.Fetch();
  var result = [];
  
  var fetchCallback = function(error, data, fIndex) {
    
    if(error) {
      callback(error, null);
    } else {
      
      //Check if content object is valid, e.g. contains files
      if(data.Files.length >= 1) {
        //Add retrieved content object data to result array
        result.push(data);
        console.log("Content Object Data fetched for query '" + keywords[fIndex] + "' with index " + fIndex + "!");
      } else {
        console.log("No Content Object Data could be fetched for query '" + keywords[fIndex] + "' with index " + fIndex + "!");
      }
      
      //Go for the next search keyword
      fIndex++;
      
      if(fIndex < keywords.length) {
        cofetcher.get(keywords[fIndex], category, fIndex, automatic, fetchCallback);
      } else {
        console.log("Fetched all content object data!");
        callback(null, result);
      } //End fetch if  
    } //End error if
  }; //End fetchCallback function
  
  //Fetch the data for this keyword
  cofetcher.get(keywords[index], category, index, automatic, fetchCallback); 
};  

/**
 * CoFetch get method
 */
exports.get = function(req, res) {
  //Set the connection timeout for fetching data for a whole content object to 10min
  req.connection.setTimeout((10 * 60 * 1000));
  //Initialize the rucod store library
  rucod.init('http://' + req.headers.host);
  
  var keywords = req.params.query || '';
      keywords = keywords.split(",");

  var category = req.params.category || '';
  var automatic = parseInt(req.params.automatic) === 1 ? true : false;
  
  //console.log('k:' + keywords + ' c:' + category + ' a:' + automatic);
  
  if(keywords.length < 1 || category.length < 3) {
    handleError("Missing or wrong parameters. Please verify that you submitted at least one keyword and the corresponding category.",res);
  } else {
  
    handleFetch(keywords, category, 0, automatic, function(error, result) {
      //Test for errors and decide weather to send data back for user verification or store the data directly as RUCoD
      if(error) {
        //Handle error
        handleError(error);
      } else if(automatic) {
        //Automatic storing
        rucod.storeAutomaticInput(result, function(error, data) {
          if(error) {
            handleError('Automatic storing ended with errors listed below:\n\r' + error, res);
          } else {
            //data = '_cofetchcb({"response":' + JSON.stringify(data) + '})';
            res.json(data);          
          }
        });
      } else {
        //Send data back for user verification
        //Store all results as JSON files
        rucod.storeJsonInput(result, function(error, data) {
          if(error) {
            console.log('Error while storing the JSON files for the corrosponding results.');
          } else {
            console.log('Fetched result stored in JSON files.');
          }
        });
        //Do it with verification of user
        //data = '_cofetchcb({"response":' + JSON.stringify(result) + '})';
        res.send(result);
      } //End error if
    }); //End handleFetch
  }
  
};

/**
 * CoFetch getCat method
 */
exports.getCat = function(req, res) {
  var serverURL = "http://gdv.fh-erfurt.de/modeldb/?do=getCategoryPaths";
  
  restler
  .get(serverURL)
  .on('complete', function(data) {    
    //data = JSON.stringify(data);
    res.json(data);    
  })
  .on('error', function(error) {
    handleError(error,res);
  });
};

/**
 * CoFetch getPart method
 */
exports.getPart = function(req, res) {
  //Set the connection timeout for fetching partial data for a content object to 3min
  req.connection.setTimeout((3 * 60 * 1000));
  var type  = req.params.type  || '';
  var query = req.params.query || '';
      query = query.replace(/[+]/g,' ');
  
  var cofetcher = new fetch.Fetch();
  cofetcher.getPart(type, query, function(error, data){
    
    if(error) {
      handleError(error,res);
    } else {
      console.log("Results for '" + type + "' with query '" + query + "' retrieved!");      
      data = '_cofetchcb({"response":' + JSON.stringify(data) + '})';
      res.send(data);
    }
  }); //End getPart
};

/**
 * CoFetch post method
 */
exports.post = function(req, res) {
  //Store the JSON content object data
  var coJson = req.body;
  //Initialize the rucod store library
  rucod.init('http://' + req.headers.host);
  
  rucod.store(coJson, true, false, false, function(error,info) {
    if(error) {
      handleError(error,res);
    } else {
      res.json(info);
    }
  });
};