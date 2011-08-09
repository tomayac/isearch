var nodeio = require('node.io');

var methods = {
    input: false,
    run: function() {
      
      //Let's get the arguments passed to the script
      if (!this.options.args[0]) {
        this.exit('No arguments were given to the ModelDB job');
      }
      var query = this.options.args[0];
      
      var modelDbURL = "http://gdv.fh-erfurt.de/modeldb/?mode=json&pagination=1&pagerows=1&page="
          + query;
        
      //Let's go and request our content
      this.get(modelDbURL, function(error, data, headers) {
        
        //Exit if there was a problem with the request
        if (error) {
           this.exit(err); 
        }

        var modelDbResponse = JSON.parse(data);
        var model = modelDbResponse[0];
        
        if(!model.Name) {
        	this.exit('Not found');
        }
        
        var result;      
        result = {
            "Type": "Object3d",
            "Category": model.CategoryPath,
            "Name": model.Title || model.Name,
            "Tags": "",
            "Extension": (model.Files[0].Type == 'max') ? '3ds' : model.Files[0].Type,
            "Licence": model.License, 
            "LicenceURL": model.LicenseURL,
            "Author": model.Author,
            "Date": model.Date,
            "Size": model.Files[0].Size,
            "URL": model.Files[0].URL,
            "Preview": model.Screenshot,
            "Emotions": [],
            "Location": [],
            "Weather": {}
        };      
        
        //Exit the Job and return the result array of the model
        this.emit(result);
        
      });
    }
};

//Creates the job
var job = new nodeio.Job({timeout:10}, methods);

//Exposes it publicly
exports.fetch = function(id, results, callback) {
  nodeio.start(job, {args: [id]}, callback, true);
};