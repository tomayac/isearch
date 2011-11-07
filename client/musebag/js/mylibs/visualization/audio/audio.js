var audioProcessor = function(mode) {
	this.mode = mode ;
	this.audioData = {
		pause : true,
		waveData : [],
		waveDataL : [],
		waveDataR : [],
		eqData : [],
		eqDataL : [],
		eqDataR : [],
		freqBands : [],
		avgFreqBands : [],
		longAvgFreqBands : [],
		relFreqBands : [],
		avgRelFreqBands : [],
		numFreqBands : 3,
		freqBandInterval : 256 / 3,
		frameCount : 0,
		currentTime : 0,
		duration : Infinity
	} ;
	
	
	for (var i=0;i<this.audioData.numFreqBands;i++) {
		this.audioData.avgFreqBands[i] = 0;
		this.audioData.relFreqBands[i] = 0;
		this.audioData.longAvgFreqBands[i] = 0;
	}

	for (var i=0;i<256;i++) {
		this.audioData.waveDataL[i] = this.audioData.waveDataR[i] = 0
		this.audioData.eqDataL[i] = this.audioData.eqDataR[i] = 0
	}


	this.fftCache = null ;
} ;

var p = audioProcessor.prototype ;

p.fftCache = null;
p.audioSampleRate = 44100; 
p.audioData = null ;
p.mode = "html5" ;


p.analyzeAudio = function(event, _waveformData, _eqData) {

	// TODO: optimize everything.

	var waveDataL = [], waveDataR = [], eqDataL = [], eqDataR = [];

	var audioData = this.audioData ;
	
	if ( this.mode == "html5" )
	{
		var audio = event.target;
		audioData.currentTime = audio.currentTime;
		var duration = audio.duration;
		if (isNaN(duration) || duration == 0)
			duration = Infinity;
		audioData.duration = duration;

		var signal = event.frameBuffer;
		var signalLength = signal.length;
 
		if(this.fftCache === null) {
			this.fftCache = new FFT(signalLength, this.audioSampleRate);
		}
		this.fftCache.forward(signal);

		var spectrum = this.fftCache.spectrum;
		var specLength = spectrum.length;

		for (var i=0;i<256;i++) {
			var s = i/256 * 0.5;
			var specIdx = (s * specLength) >> 0
			var signalIdx = (s * signalLength) >> 0
	
			var signalVal = signal[signalIdx];
			if (signalVal == NaN) signalVal = 0;
	
			waveDataL[i] = waveDataR[i] = signalVal;

			// spectrum modification. Borrowed from http://weare.buildingsky.net/processing/dft.js/audio.new.html
			var j = specIdx + 0.02 * specLength;
			var log = Math.log(j/specLength * (specLength - j)) * Math.sqrt(j/specLength);
			var magnitude = spectrum[specIdx] * 2048 * log * 2;

			eqDataL[i] = eqDataR[i] = magnitude / 50;
		}
	}
	else if ( this.mode == "sm2" )
	{
		waveDataL = _waveformData.left;
		waveDataR = _waveformData.right;

		eqDataL = _eqData.left;
		eqDataR = _eqData.right;

		for (var i=0;i<256;i++) {
			var waveL = waveDataL[i];
			var waveR = waveDataR[i];
			var specL = eqDataR[i];
			var specR = eqDataL[i];
			if (isNaN(waveL)) waveL = 0;
			if (isNaN(waveR)) waveR = 0;
			if (isNaN(specL)) specL = 0;
			if (isNaN(specR)) specR = 0;

			specL /= Math.SQRT2;
			specR /= Math.SQRT2;

			waveDataL[i] = waveL;
			waveDataL[i] = waveR;
			eqDataL[i] = specL;
			eqDataR[i] = specR;
		}
	}
	
	audioData.waveDataL = waveDataL;
	audioData.waveDataR = waveDataR;
	audioData.waveData = waveDataL.concat(waveDataR);
	audioData.eqDataL = eqDataL;
	audioData.eqDataR = eqDataR;

	for (var i=0;i<audioData.numFreqBands;i++)
		audioData.freqBands[i] = 0;

	for (var i=0;i<128;i++) {
		audioData.freqBands[(i/audioData.freqBandInterval*2)>>0] += parseFloat(audioData.eqDataL[i]);
	}

	audioData.frameCount++;

	for (var i=0;i<audioData.numFreqBands;i++) {
		if (audioData.freqBands[i] > audioData.avgFreqBands[i])
			audioData.avgFreqBands[i] = audioData.avgFreqBands[i]*0.2 + audioData.freqBands[i]*0.8;
		else
			audioData.avgFreqBands[i] = audioData.avgFreqBands[i]*0.5 + audioData.freqBands[i]*0.5;

		if (audioData.frameCount < 50)
			audioData.longAvgFreqBands[i] = audioData.longAvgFreqBands[i]*0.900 + audioData.freqBands[i]*0.100;
		else
			audioData.longAvgFreqBands[i] = audioData.longAvgFreqBands[i]*0.992 + audioData.freqBands[i]*0.008;


		if (Math.abs(audioData.longAvgFreqBands[i]) < 0.001)
			audioData.relFreqBands[i] = 1.0;
		else
			audioData.relFreqBands[i]  = audioData.freqBands[i] / audioData.longAvgFreqBands[i];

		if (Math.abs(audioData.longAvgFreqBands[i]) < 0.001)
			audioData.avgRelFreqBands[i] = 1.0;
		else
			audioData.avgRelFreqBands[i]  = audioData.avgFreqBands[i] / audioData.longAvgFreqBands[i];
	}


} ;
