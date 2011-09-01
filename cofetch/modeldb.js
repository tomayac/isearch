var nodeio = require('node.io');

var modelMethods = {
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
           this.exit(error); 
        }
        
        var modelDbResponse = JSON.parse(data);
        var model = modelDbResponse[0];
        
        if(!model.Name) {
        	this.exit('Not found');
        }
        
        var lindex = model.Files[0].URL.lastIndexOf('.');
        var ext = model.Files[0].URL.substr(lindex+1);
        var base = model.Files[0].URL.substring(0,lindex);
        
        var result;      
        result = {
            "Type": "Object3d",
            "Category": model.Category,
            "CategoryPath": model.CategoryPath,
            "Name": model.Title || model.Name,
            "Description": "",
            "Tags": "",
            "Extension": (model.Files[0].Type == 'max') ? '3ds' : model.Files[0].Type,
            "License": model.License, 
            "LicenseURL": model.LicenseURL,
            "Author": model.Author,
            "Date": model.Date,
            "Size": model.Files[0].Size,
            "URL": (ext == 'max') ? base+'.3ds' : model.Files[0].URL,
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

var fetchModel = function(id, callback) {
	//Creates the job
	var modelJob = new nodeio.Job({timeout:10}, modelMethods);
	nodeio.start(modelJob, {args: [id]}, callback, true);
};

//Exposes it publicly
if (typeof module !== 'undefined' && "exports" in module) {
	  module.exports.fetchModel = fetchModel; 
}  