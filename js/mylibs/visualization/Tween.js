Tween = function(o, startVal, endVal, duration, easef)
{
	var count=0, stopAt = Tween.fps*duration/1000, startVal,endVal, 
		easef = easef || Tween.easeOut;
		
	var that = this ;
	
	var f = function(){
		count++;
		if (count>=stopAt) {
			that.stop(o);
			o.onTweenEnd(endVal) ;
		} else {
			
			o.onTweenUpdate(easef(count, startVal, endVal - startVal, stopAt)) ;
		}
	}
	clearInterval(this._tween_int);
	this._tween_int = setInterval(f, duration/Tween.fps);
}

Tween.fps = 30 ;

var p = Tween.prototype ;

p._tween_int = null ;

p.stop = function()
{ 
	clearInterval(this._tween_int); 
}

//R.Penner Quart easing t=time,b=start,c=delta,d=duration
Tween.easeIn = function (t, b, c, d) { return c*(t/=d)*t*t*t + b;}
Tween.easeOut = function (t, b, c, d) {	return -c * ((t=t/d-1)*t*t*t - 1) + b;}
Tween.easyInOut = function (t, b, c, d) { if ((t/=d/2) < 1) return c/2*t*t*t*t + b; return -c/2 * ((t-=2)*t*t*t - 2) + b; }

Tween.linear = function(t, b, c, d) { return c*(t/=d) + b ; }

Tween.bounceEaseIn = function(t,b,c,d){
	return c - Tween.bounceEaseOut (d-t, 0, c, d) + b;
	}
Tween.bounceEaseInOut = function(t,b,c,d){
	if (t < d/2) return Tween.bounceEaseIn (t*2, 0, c, d) * .5 + b;
	else return Tween.bounceEaseOut (t*2-d, 0, c, d) * .5 + c*.5 + b;
	}

Tween.strongEaseInOut = function(t,b,c,d){
	return c*(t/=d)*t*t*t*t + b;
	}

Tween.regularEaseIn = function(t,b,c,d){
	return c*(t/=d)*t + b;
	}
Tween.regularEaseOut = function(t,b,c,d){
	return -c *(t/=d)*(t-2) + b;
	}

Tween.regularEaseInOut = function(t,b,c,d){
	if ((t/=d/2) < 1) return c/2*t*t + b;
	return -c/2 * ((--t)*(t-2) - 1) + b;
	}
Tween.strongEaseIn = function(t,b,c,d){
	return c*(t/=d)*t*t*t*t + b;
	}
Tween.strongEaseOut = function(t,b,c,d){
	return c*((t=t/d-1)*t*t*t*t + 1) + b;
	}

Tween.strongEaseInOut = function(t,b,c,d){
	if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
	return c/2*((t-=2)*t*t*t*t + 2) + b;
	}