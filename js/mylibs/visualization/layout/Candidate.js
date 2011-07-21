Candidate = function( feature, x, y, w, h )	
{	
	this.feature = feature;	
	this.removed = false;	
	this.m_extent = new Extent( x, y, x + w, y + h );	
}	

var p = Candidate.prototype; 	

p.m_extent = null ;	
p.feature = null ;	
p.removed = false ;	
p.cost = 0 ;	
p.overlapping = [] ;	
			
p.remove = function()	
{	
	this.removed = true;	
	this.feature.cost += this.feature.cost / 4.0;	
} 	
        