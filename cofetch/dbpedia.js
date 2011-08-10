/**
 * Text fetch for Content Object production.
 * Facilitates dbpedia.org API in combination with Node.io 
 */
var nodeio = require('node.io'),
    xml2js = require('xml2js');

var methods = {
    input: false,
    run: function() {
      
      //Let's get the arguments passed to the script
      if (!this.options.args[0]) {
        this.exit('No arguments were given to the dbpedia job');
      }
      
      var query = this.options.args[0].replace(/\s/g,'+');
      var qclass = this.options.args[1];
      
      var maxResults = 3;
      var dbpediaURL = "http://lookup.dbpedia.org/api/search.asmx/KeywordSearch?"
          + 'QueryClass=' + qclass
          + '&QueryString=' + query
          + '&MaxHits=' + maxResults;
        
      //Let's go and request our content
      this.get(dbpediaURL, function(error, data, headers) {
        
        //Exit if there was a problem with the request
        if (error) {
           this.exit(error); 
        }
        
        //The parser for parsing xml data of the dbpedia service
        var parser = new xml2js.Parser();
        //The function where the transformed JSON data comes in
        parser.on('end', function(data) {
        	console.log(data);
        	
        	var result = '';
        	//Exit the Job returning the results array
            this.emit(result);
        });
        
        //Convert the XML date to JSON
        parser.parseString(data);
        
      });
    }
};

//Creates the job
var job = new nodeio.Job({timeout:10}, methods);

//Exposes it publicly
exports.fetch = function(query, queryClass, callback) {
  nodeio.start(job, {args: [query,queryClass]}, callback, true);
};