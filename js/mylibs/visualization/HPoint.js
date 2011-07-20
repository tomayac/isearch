HPoint = function(re, im) {	
	this.real = re ;	
	this.imag = im ;	
}	

var p = HPoint.prototype = new Complex ;	

p.x = function() {	
	return this.real ;	
}	
			
p.y = function() {	
	return this.imag ;	
}	
			
p.moebius = function(theta, c)	
{	
	var num = Complex.sub(this, c) ;	
	var cjc = Complex.mult(Complex.conj(c),  this) ;	
	var den = Complex.sub(new Complex(1, 0), cjc) ;	
	var numProd = Complex.conj(den) ;	
	var denProd = Complex.mult(den,  Complex.conj(den)).real ;	
	var res =  Complex.cmult(Complex.mult(num,  numProd), 1.0 / denProd) ;	
	return new HPoint(res.real, res.imag) ;	
}		
