Complex = function(re, im) {
	this.real = re ;
	this.imag = im ;
}

var p = Complex.prototype;

p.real = 0.0 ;
p.imag = 0.0 ;
p.constructor = Complex ;

Complex.norm = function(c)
{
	return c.real*c.real + c.imag*c.imag ;
}
		
Complex.mult = function(a, c)
{
	return new Complex(a.real*c.real - a.imag*c.imag, a.imag*c.real + a.real*c.imag) ; 
}
		
Complex.add = function(a, c)
{
	return new Complex(a.real + c.real, a.imag + c.imag) ;
}
		
Complex.sub = function(a, c)
{
	return new Complex(a.real - c.real, a.imag - c.imag) ;
}
		
Complex.cmult = function(a, c)
{
	return new Complex(a.real * c, a.imag * c) ; 
}
		
Complex.div = function(a, c)
{
	var d = c.real * c.real + c.imag * c.imag ;
	return new Complex((a.real*c.real + a.imag*c.imag)/d, 
							   (a.imag*c.real - a.real*c.imag)/d) ; 
}
		
Complex.conj = function(a)
{
	return new Complex(a.real, -a.imag) ;
}
