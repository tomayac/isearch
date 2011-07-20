var Feature = function( labelGraphic, x, y, w, h )	
{	
	this.x = x ;	
	this.y = y ;	
	this.labelGraphic = labelGraphic;	
	var c0 = new Candidate( this, x, y, w, h) ;	
	var c1 = new Candidate( this, x, y        , w, h );	
	var c2 = new Candidate( this, x, y - h    , w, h );	
	var c3 = new Candidate( this, x - w, y    , w, h );	
	var c4 = new Candidate( this, x - w, y - h, w, h );	
	this.candidates = [c2,c1,c4,c3];	
	this.cost = 0 ;	
}	
