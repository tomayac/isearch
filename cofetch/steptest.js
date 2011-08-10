var Step = require('step');

function fetch(request,callback) {
	console.log("The request was: "+request);
	
	var result = "The answer lays in " + request;
	
	callback(null,result);
};

function fetch2(request,callback) {
	console.log("The request was: "+request);
	
	var result = request.replace('a','E');
	
	callback(null,result);
};


Step(
	  function step1() {
	    fetch('America', this);
	  },
	  function step2(err, text) {
	    if (err) {
	      throw err;
	    }
	    fetch2('Another thought about '+text,this);
	  },
	  function step3(err, newText) {
	    console.log('And the final answer is: ' + newText);
	  }
);