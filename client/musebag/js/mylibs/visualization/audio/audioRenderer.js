var AudioRenderer = function(containerDiv, urlMp3, urlOgg, urlImg, mediaUrl, visType, startTime, mode)
{
	var canvas, audio, tmpCanvas, tmpCtx ;
        	var ctx, displayQuality = 1.0  ;
	var channels,  rate,  frameBufferLength;
	var analyzer, sm2obj = null ;

	function loadedMetadata() {
        channels          = audio.mozChannels;
        rate              = audio.mozSampleRate;
        frameBufferLength = audio.mozFrameBufferLength;
         
		tmpCanvas = document.createElement("canvas");
		tmpCanvas.width = 100 ;
		tmpCanvas.height = 100 ;
		tmpCtx = tmpCanvas.getContext("2d")
		
        
	}


	function drawRect(x, y, w, h, fillStyle, strokeStyle, strokeWidth)
	{
		ctx.save() ;
		if (fillStyle) {
			ctx.fillStyle = fillStyle;
			ctx.fillRect(x * canvas.width, y * canvas.height, w * canvas.width, h * canvas.height ) ;
		}
	
		if (strokeStyle) {
			ctx.strokeStyle = strokeStyle;
			ctx.lineWidth = (strokeWidth || 1) * displayQuality;
			ctx.strokeRect(x * canvas.width, y * canvas.height, w * canvas.width, h * canvas.height ) ;
		}
		ctx.restore() ;
	}

	function decay(amount)
	{
		drawRect(0, 0, 1, 1, "rgba(0, 0, 0, " + amount + ")") ;
	}

	function drawActivePath(fillStyle, strokeStyle, strokeWidth) {
		if (fillStyle) {
			ctx.fillStyle = fillStyle;
			ctx.fill();
		}

		if (strokeStyle) {
			if (strokeWidth)
				ctx.lineWidth = strokeWidth * displayQuality;
			else
				ctx.lineWidth = 1 * displayQuality;
			ctx.strokeStyle = strokeStyle;
			ctx.stroke();
		}
	}

	function drawPath(points, close, fillStyle, strokeStyle, strokeWidth) {
		ctx.save();
		ctx.beginPath();

		if (points.length < 2) return ;

		var firstPoint = points[0];

		for (var j=0,k=points.length;j<k;j++) {
			var point = points[j];
			if (typeof point[0] == "number" && typeof point[1] == "number") {
				if (j == 0)
					ctx.moveTo(point[0]*canvas.width, point[1]*canvas.height);
				else
					ctx.lineTo(point[0]*canvas.width, point[1]*canvas.height);
			}
		}
		if (close) ctx.lineTo(firstPoint[0]*canvas.width, firstPoint[1]*canvas.height);
	
		drawActivePath(fillStyle, strokeStyle, strokeWidth);

		ctx.restore();
	}

	function drawCircles(circles, fillStyle, strokeStyle, strokeWidth) {
		ctx.save();
		ctx.beginPath();

		for (var i=0,l=circles.length;i<l;i++) {
			var c = circles[i];
			var r = c.radius;
			if (r < 0) r = 0;

			var startX = (c.x + r) * canvas.width;
			var startY = c.y * canvas.height;

			ctx.moveTo(startX, startY);
			ctx.arc(c.x*canvas.width, c.y*canvas.height, r*canvas.width, 0, Math.PI * 2, false);
		}
		ctx.closePath();

		drawActivePath(fillStyle, strokeStyle, strokeWidth);

		ctx.restore();
	}


	function deform(deformFunction, gridSizeX, gridSizeY, paintGrid, gridColor, gridLineWidth) {
		var width = canvas.width, height = canvas.height;
		tmpCanvas.width = width; tmpCanvas.height = height;

		var pixelMeshSizeX = Math.max(1, Math.min(32, gridSizeX || 7));
		var pixelMeshSizeY = Math.max(1, Math.min(32, gridSizeY || 7));

		var grid = [];

		for (var x=0;x<=pixelMeshSizeX;x++) {
			grid[x] = [];
			for (var y=0;y<=pixelMeshSizeY;y++) {
				var fx = x / pixelMeshSizeX;
				var fy = y / pixelMeshSizeY;

				var px = (fx - 0.5) * 2;
				var py = (fy - 0.5) * 2;

				var rad = Math.sqrt(px*px+py*py);
				var ang = Math.atan2(py,px);

				var pixelVars = deformFunction(rad, ang, fx, fy) || {};

				var cx = pixelVars.centerX;
				var cy = pixelVars.centerY;
				var sx = pixelVars.stretchX;
				var sy = pixelVars.stretchY;
				var dx = pixelVars.moveX;
				var dy = pixelVars.moveY;
				var zoom = pixelVars.zoom;
				var rot = pixelVars.rotate;

				if (typeof cx == "undefined" || isNaN(cx)) cx = 0;
				if (typeof cy == "undefined" || isNaN(cy)) cy = 0;
				if (typeof sx == "undefined" || isNaN(sx)) sx = 1;
				if (typeof sy == "undefined" || isNaN(sy)) sy = 1;
				if (typeof dx == "undefined" || isNaN(dx)) dx = 0;
				if (typeof dy == "undefined" || isNaN(dy)) dy = 0;
				if (typeof zoom == "undefined" || isNaN(zoom)) zoom = 1;
				if (typeof rot == "undefined" || isNaN(rot)) rot = 0;

				cx = (cx / 2 + 0.5);
				cy = (cy / 2 + 0.5);

				var u = px * 0.5 * zoom + 0.5;
				var v = py * 0.5 * zoom + 0.5;

				// stretch on X, Y:
				u = (u - cx) * sx + cx;
				v = (v - cy) * sy + cy;

				// rotation:
				if (rot) {
					var u2 = u - cx;
					var v2 = v - cy;
					var cos_rot = Math.cos(rot);
					var sin_rot = Math.sin(rot);
					u = u2*cos_rot - v2*sin_rot + cx;
					v = u2*sin_rot + v2*cos_rot + cy;
				}

				// translation:
				u += dx;
				v += dy;

				grid[x][y] = {
					x : u * width,
					y : v * height
				};
			}
		}

		var cellWidth = 1 / pixelMeshSizeX * width;
		var cellHeight = 1 / pixelMeshSizeY * height;

		for (var y=0;y<pixelMeshSizeY;y++) {
			var py = y / pixelMeshSizeY * height;
			for (var x=0;x<pixelMeshSizeX;x++) {
				var p00 = grid[x][y];
				var p10 = grid[x+1][y];
				var p01 = grid[x][y+1];
				var p11 = grid[x+1][y+1];

				var px = x / pixelMeshSizeX * width;

				var isIn00 = (p00.x > 0 || p00.x < 1 || p00.y > 0 || p00.y < 1);
				var isIn10 = (p10.x > 0 || p10.x < 1 || p10.y > 0 || p10.y < 1);
				var isIn01 = (p01.x > 0 || p01.x < 1 || p01.y > 0 || p01.y < 1);
				var isIn11 = (p11.x > 0 || p11.x < 1 || p11.y > 0 || p11.y < 1);

				if (isIn00 && isIn10 && isIn11) {
					renderTriangle(
						tmpCtx,  
						p00, p10, p11, 
						canvas,
						{ x : px, y : py },
						{ x : px+cellWidth, y : py },
						{ x : px+cellWidth, y : py+cellHeight }
					)
				}
				if (isIn00 && isIn01 && isIn11) {
					renderTriangle(
						tmpCtx, 
						p00, p01, p11,
						canvas,
						{ x : px, y : py },
						{ x : px, y : py+cellHeight },
						{ x : px+cellWidth, y : py+cellHeight }
					)
				}
			}
		}

		ctx.clearRect(0,0,width,height);
		ctx.drawImage(tmpCtx.canvas, 0, 0);

		if (paintGrid) {
			ctx.strokeStyle = gridColor || "rgb(0,255,0)";
			ctx.lineWidth = gridLineWidth || 2 * displayQuality;
			ctx.beginPath();
			for (var x=0;x<=pixelMeshSizeX-1;x++) {
				for (var y=0;y<=pixelMeshSizeY-1;y++) {
					var p1 = grid[x][y];
					var p2 = grid[x+1][y];
					var p3 = grid[x+1][y+1];
					var p4 = grid[x][y+1];

					ctx.moveTo(p1.x, p1.y);
					ctx.lineTo(p2.x, p2.y);
					ctx.lineTo(p3.x, p3.y);
					ctx.lineTo(p4.x, p4.y);
					ctx.lineTo(p1.x, p1.y);
				}
			}
			ctx.stroke();
		}
	}

// draws a triangle (s0, s1, s2) from srcCanvas using dstCtx to (d0, d1, d2)
// used by deform()
	function renderTriangle(dstCtx, d0, d1, d2, srcCanvas, s0, s1, s2) {
		var sax = s1.x - s0.x;
		var say = s1.y - s0.y;
		var sbx = s2.x - s0.x;
		var sby = s2.y - s0.y;

		var dinv = 1 / (sax * sby - say * sbx);

		var i11 = sby * dinv;
		var i22 = sax * dinv;
		var i12 = -say * dinv;
		var i21 = -sbx * dinv;

		var dax = d1.x - d0.x;
		var day = d1.y - d0.y;
		var dbx = d2.x - d0.x;
		var dby = d2.y - d0.y;

		var m11 = i11 * dax + i12 * dbx;
		var m12 = i11 * day + i12 * dby;
		var m21 = i21 * dax + i22 * dbx;
		var m22 = i21 * day + i22 * dby;

		dstCtx.save();
		dstCtx.beginPath();
		dstCtx.moveTo(d0.x, d0.y);
		dstCtx.lineTo(d1.x, d1.y);
		dstCtx.lineTo(d2.x, d2.y);
		dstCtx.clip();

		dstCtx.transform(m11, m12, m21, m22,
			d0.x - (m11 * s0.x + m21 * s0.y),
			d0.y - (m12 * s0.x + m22 * s0.y)
		);
		dstCtx.drawImage(srcCanvas, 0, 0);
		dstCtx.restore();
	}

	function stretch(x, y, ox, oy) {
		if (typeof ox == "undefined") ox = 0;
		if (typeof oy == "undefined") oy = 0;
		var w = canvas.width, h = canvas.height;
		tmpCanvas.width = w; tmpCanvas.height = h;
		ox *= w;
		oy *= h;
		tmpCtx.clearRect(0,0,w,h);
		tmpCtx.drawImage(canvas,0,0);
		ctx.globalCompositeOperation = "copy";
		ctx.clearRect(0,0,canvas.width, canvas.height);
		ctx.drawImage(tmpCanvas, -(x-1)*ox, -(y-1)*oy, canvas.width * x, canvas.height * y);
		ctx.globalCompositeOperation = "source-over";
	}

	function rotate(angle) {
		var w = canvas.width, h = canvas.height;
		tmpCanvas.width = w; tmpCanvas.height = h;
		tmpCtx.drawImage(canvas,0,0);
		ctx.save();
		ctx.globalCompositeOperation = "copy";
		ctx.clearRect(0,0,w,h);
		ctx.translate(w/2, h/2);
		ctx.rotate(angle);
		ctx.drawImage(tmpCanvas,-w/2,-h/2);
		ctx.restore();
		ctx.globalCompositeOperation = "source-over";
	}

	function drawCircle(x, y, radius, fillStyle, strokeStyle, strokeWidth) {
		drawCircles([{x:x, y:y, radius:radius}], fillStyle, strokeStyle, strokeWidth);
	}

	function audioAvailable(event, waveData, eqData) {

		analyzer.analyzeAudio(event, waveData, eqData) ;
	
		var audioData = analyzer.audioData ;
	
		if ( visType == "fft" )
		{
			decay(ctx, 0.2) ;
		
			var n = 32;

			var f = (255 / n) >> 0;
	
			for (var i=0;i<n;i++) {
				var h = audioData.eqDataL[i*f];

				drawRect(1.0/(n-1)*i, 1-h, 1.0/n, h, "white");
			}
		}
		else if ( visType == "waveform" )
		{
			var pointsL = [];

			displayQuality = 0.1 ;
		
			decay(0.5);

			for (var i=0;i<128;i++)
				pointsL[i] = [ 1/127*i, 0.5 + audioData.waveDataL[i*2] * 0.4 ];

			var h = ((audioData.frameCount ) % 360) >> 0;

			drawPath(pointsL, false, null, "hsl(" + h + ",100%,15%)", 28);
			drawPath(pointsL, false, null, "hsl(" + h + ",100%,25%)", 20);

			displayQuality = 0.75 ;

			drawPath(pointsL, false, null, "white", 2);
		
		}
		else if ( visType == "flower" )
		{
		
			var soundData = {
				bass : audioData.relFreqBands[0],
				mid : audioData.relFreqBands[1],
				treb : audioData.relFreqBands[2],
				waveDataL : audioData.waveDataL,
				waveDataR : audioData.waveDataR,
				eqDataL : audioData.eqDataL,
				eqDataR : audioData.eqDataR,
				currentTime : audioData.currentTime,
				duration : audioData.duration
			} ;
		
			decay(0.8);

			var n = 60, p1 = [], p2 = [];

			displayQuality = 0.8;

			var r = 0.2 + 0.02 * soundData.bass;

			for (var i=0;i<n;i++) {
				var spec = Math.pow(soundData.eqDataL[(i/n*256)>>0], 0.7) * 0.4;

				var d = i * Math.PI*2/n - Math.PI*0.5;
				var d2 = d + Math.PI*2 * 1.0/n;
				var r2 = r + spec * 0.3;
			
				p1.push([.5 + Math.cos(d)*r, .5 + Math.sin(d)*r]);
				p1.push([.5 + Math.cos(d)*r2, .5 + Math.sin(d)*r2]);
				p1.push([.5 + Math.cos(d2)*r2, .5 + Math.sin(d2)*r2]);
			}

			var n2 = 128;
			for (var i=0;i<n2;i++) {
				var wave = soundData.waveDataL[(i/n2*256)>>0] * 0.2;
				var wr = 0.1 + 0.2 * wave;  
				p2.push([.5 - r * 0.90 + i/n2 * r * 2 * 0.90, .5 + 0.2 * wave * (1 / 0.3 * Math.sin((i + 0.0)/n2 * Math.PI))]);
			}

			drawPath(p1, false, "rgb(120,120,120)", "white", 2);

			drawCircle(0.5, 0.5, r - 0.05, "black");

			drawPath(p2, false, null, "rgb(120,120,120)", 10);
			drawPath(p2, false, null, "rgb(220,220,220)", 2);
		}
	}
	
	var sm2sound = null ;
	
	function getTime(nMSec,bAsString) 
	{
		// convert milliseconds to mm:ss, return as object literal or string
		var nSec = Math.floor(nMSec/1000),
        min = Math.floor(nSec/60),
        sec = nSec-(min*60);
		// if (min === 0 && sec === 0) return null; // return 0:00 as null
		return (bAsString?(min+':'+(sec<10?'0'+sec:sec)):{'min':min,'sec':sec});
	};

	function fallbackSM2() 
	{

		$.getScript("js/mylibs/visualization/audio/soundmanager/soundmanager2.js", function(data, textStatus) {
		
			soundManager.flashVersion = 9;
			soundManager.flash9Options.useEQData = true;
			soundManager.flash9Options.useWaveformData = true;
		//	soundManager.useHTML5Audio = true ;
		//	soundManager.preferFlash = false ;
			
			//soundManager.useHighPerformance = true;
			soundManager.allowPolling = true;
			soundManager.url = '/isearch/client/musebag/js/mylibs/visualization/audio/soundmanager/'; // path to directory containing SoundManager2 .SWF file
			soundManager.onload = function() {
			
				soundManagerLoaded = true;
			
			
			
				var audioElement = $('<div/>', { "class": "sm2-audio-fallback" }).appendTo(containerDiv) ;
				var playButton = $("<a/>", { "class": "sm2-play-button", href: "javascript:void(0)" }).appendTo(audioElement) ;
				var durationEle = $("<span/>", {"class": "sm2-duration"}).appendTo(audioElement) ;
			
				
				playButton.click(function() {
					playButton.toggleClass("sm2-play-button") ;
					playButton.toggleClass("sm2-pause-button") ;
					
					if ( sm2sound.playState == 0 || sm2sound.paused ) 
					{
						sm2sound.play(	{ position: (startTime && startTime > 0) ? startTime * 1000 : 0 } ); 
						
					}
					else {
						sm2sound.pause() ;
					
					}
					return false ;
				}) ;
				
				sm2sound = soundManager.createSound({
					id:"sm2-audio-fallback",
					url: urlMp3,
					autoLoad : true,
					stream : true,
					autoPlay : false,
					whileplaying : function() { 
						audioAvailable(null, this.waveformData, this.eqData) ; 
						
						var timeStr = getTime(this.position, true) ;
						
						if (this.durationEstimate) {
							timeStr += '/' + getTime(this.durationEstimate, true) ;
						}
						
						durationEle.text(timeStr) ;
						
					},
					whileloading : function() {
					
						if ( this.bytesLoaded ) {
							bytesLoaded = this.bytesLoaded;
							bytesTotal = this.bytesTotal;
							var percent = bytesLoaded/bytesTotal ;
							console.log(percent) ;
						}
					},
					onfinish: function() {
								playButton.attr("class", "sm2-play-button") ;
							},
					
					multiShot : false
					
				});
				
			//	if (startTime && startTime > 0)
			//	{
				
			//	}
				
				
				
				
				
			};
			soundManager.debugMode = false;
			soundManager.debugFlash = false;
			soundManager.beginDelayedInit();
		
		});
		
		

	}

	function init(mode) {
	
		var width = $(containerDiv).width() ;
			
		var extLink = $('<a/>', { id: "audiovis", href: "javascript:void(0)" }).appendTo(containerDiv) ;
		
		canvas = $("<canvas/>").appendTo(extLink).get(0);
			
		canvas.width = canvas.height = width ;
				
		ctx = canvas.getContext('2d') ;
		
		ctx.clearRect(0, 0, canvas.width, canvas.height) ;
		var img = new Image();
		img.onload = function() {
			
			var dstw2 = canvas.width ;
			var dsth2 = canvas.height ;	
		
			var origw = this.width ;	
			var origh = this.height ;	
				
			var thumbw, thumbh, offx, offy ;	
		
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
				
			thumbw = Math.min(thumbw, origw) ;
			thumbh = Math.min(thumbh, origh) ;
				
			offx = (dstw2 - thumbw)/2 ;
			offy = (dsth2 - thumbh)/2 ;
						
			ctx.drawImage(this, offx, offy, thumbw, thumbh) ;	
				
		}
		img.src = urlImg ;
			
		if ( Modernizr.audio && mode == "html5" )
		{
			
				
			var audioElement = $("<audio/>", {   preload: "auto", controls : 'controls', "width": width, height: "32px"}).appendTo(containerDiv);
			audio = audioElement.get(0) ;
			
			/**
			 * Triantafillos:
			 * support for audio preview on Android webview
			 * (Android web browser can support the soundManager in 'if',
			 * but when running the I-Search app as native from webView, 
			 * soundmanager is not supported, so we must go to 'else'.
			 */
			if 	(!audio.mozSetup && !navigator.userAgent.indexOf('Android')) {
				
				audioElement.remove() ;
				sm2obj = fallbackSM2();
											
				analyzer = new audioProcessor("sm2") ;
			}
			else
			{
				
				if ( ( startTime && startTime > 0 ) && mediaUrl )
				{
					$('<source>').attr('src', mediaUrl).appendTo(audioElement);  
				}
				else
				{
					if ( urlOgg )
						$('<source>').attr('src', urlOgg).appendTo(audioElement);  
		
					if ( urlMp3 )
						$('<source>').attr('src', urlMp3).appendTo(audioElement);  
				}

				audio.addEventListener('MozAudioAvailable', audioAvailable, false);
				audio.addEventListener('loadedmetadata', loadedMetadata, false);
				
				if ( startTime && startTime > 0 )
				{
					audio.addEventListener("canplay", function() {
						audio.currentTime = startTime ;
						audio.play() ;
					}, false);
				}
			}
		
		
			
		}
		else
		{
		
			sm2obj = fallbackSM2();
											
			analyzer = new audioProcessor("sm2") ;
			
		//	img = $('<img/>').attr('src', urlImg).appendTo(extLink) ;
			
			
		}
	}
	
	function terminate()
	{
		if ( sm2sound ) sm2sound.stop() ;
		else audio.pause() ;
	}

	if ( !mode ) mode = "html5" ;
	init(mode) ;
	
	
	return { 'terminate': terminate } ;
}
