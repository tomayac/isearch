var ResultsVisualiser = function() {
}

var p = ResultsVisualiser.prototype ;

p.widget = null ;
p.results = null ;
p.element = null ;

p.draw = function(res, ele, options)
{
	this.results = res ;
	this.element = ele ;
	
	this.redraw(options.method, options) ;
}

p.setOptions = function(options) 
{
	if ( options.method )
		this.redraw(options.method, options) ;
	else
		this.widget.setOptions(options) ;
}

p.redraw = function(method, options)
{
	$(this.element).empty() ;
		
	if ( method == "hpanel" )
	{
		this.widget = new HPanel(this.results, this.element, options) ;
	
	}
	else if ( method == "tmap" )
	{
		this.widget = new TreeMap(this.results, this.element, options) ;  
	}
	else if ( method == "htree" )
	{
		this.widget = new HyperbolicTree(this.results, this.element, options) ;
	}
}



