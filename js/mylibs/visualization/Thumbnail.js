Thumbnail = function(url, size) {	
   this.url = url ;	
   this.image = new Image ;	
   this.size = size ;	
};	

var p = Thumbnail.prototype;	


Thumbnail.margin = 2 ;	
Thumbnail.padding = 2 ;	
Thumbnail.border = 1 ;	
Thumbnail.bgClr = "white" ;	
Thumbnail.borderClr = "gray" ;	
Thumbnail.size = 32 ;	

p.url = "" ;	
p.visible = false ;	
p.loaded = false ;	
p.image = null ;	
p.x = 0 ;	
p.y = 0 ;	
p.qx = 0 ;	
p.qy = 0 ;	
p.id = "" ;	
p.size = Thumbnail.size ;	
  	
p.show = function(ctx, x, y) {	
	this.visible = true ;	
	this.x = x ;	
	this.y = y ;	
			
	if ( !this.loaded )	
	{	
		var obj = this ;	
		this.image.onload = function() {	
			obj.loadCallback(ctx);	
		};	
		this.image.src = this.url;	
		
	}	
	else this.drawImage(ctx) ;	
		
};	

p.loadCallback = function(ctx) {	
	this.loaded = true ;	
	this.drawImage(ctx) ;	
};	

p.drawImage = function(ctx)	
{	
	var extra = Thumbnail.border + Thumbnail.padding + Thumbnail.margin ;	
	var dstx = this.x ;	
	var dsty = this.y ;	
	var dstw = this.size  ;	
	var dsth = this.size ;	
		
	var dstw2 = this.size - extra - extra;	
	var dsth2 = this.size - extra - extra;	
		
	var origw = this.image.width ;	
	var origh = this.image.height ;	
		
	var thumbw, thumbh ;	
		
	if ( origw > origh )	
	{	
		thumbw = dstw2 ;  	
		thumbh = dsth2*(origh/origw);  	
	}  	
	else if ( origw <= origh )   	
	{  	
		thumbh = dsth2 ;  	
		thumbw = dstw2*(origw/origh);  	
	}  	
			
	ctx.fillStyle = Thumbnail.bgClr ;	
	ctx.fillRect (this.x + Thumbnail.margin + Thumbnail.border, this.y + Thumbnail.margin + Thumbnail.border, 	
		dstw - 2*Thumbnail.border - 2*Thumbnail.margin, dsth - 2*Thumbnail.border - 2*Thumbnail.margin);	
	ctx.strokeStyle = Thumbnail.borderClr ;	
	ctx.lineWidth = Thumbnail.border ;	
	ctx.strokeRect(this.x + Thumbnail.margin, this.y + Thumbnail.margin, 	
		dstw - 2*Thumbnail.margin, dsth - 2*Thumbnail.margin) ;	
		
	ctx.drawImage(this.image, this.x + (dstw2 - thumbw)/2 + extra, this.y + (dsth2 - thumbh)/2 + extra, thumbw, thumbh) ;	
};	


p.hide = function() {	
	this.visible = false ;	
};	
