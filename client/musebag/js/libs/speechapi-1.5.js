/*
* speechapi - Javascript frontend for use in on-line speech-to-text and text-to-speech.
*
* Copyright (C) 2010 Speechapi - http://www.speechapi.com
*
* This program is free software; you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation; either version 2 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program; if not, write to the Free Software
* Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*
*/

var speechapi = {
	username: null,
	password: null,
	recognizerSetup : false,
	documentReady: false,
	onResultCallback: null,
	onTtsCallback: null,
	onLoadedCallback: null,
	containerID: null,
	server: null,
	automatic: false,
	initNotCalled: true,
	ruleIndex : 1,
	grammars : {},

	currentFocus : null,
	beingRead : null,
	beingReadBC : null,
	linkables: null,
	speakables: null,
	focusables: null,
	browserControl: false,
	styleControl: false,
	formsEnabled: true,
	mashupMode: false,
	oog: false,

	//------------
	//Low level API
	//------------


	//setup the speechapi (really justs saves some config params)
	setup: function(username, password, result, tts, onLoaded, containerID) {
		speechapi.username = username;
		speechapi.password = password;

		speechapi.recognizerSetup = false;	
		speechapi.documentReady = false;
	
		speechapi.onLoadedCallback = onLoaded;
		speechapi.onResultCallback = result;
		speechapi.initNotCalled=true;

		speechapi.onFinishTTSCallback = tts;
	
		speechapi.containerID = containerID;	
	
		speechapi.automatic=false;
	},

	// Version of the setup method that aslo embeds the flash object (hides all swfobject code from client)
	setup2: function(username, password, result, tts, onLoaded, containerID, altContainerID, server,swffile) {
		var flashvars = {speechServer : server};
        	var params = {allowscriptaccess : "always"};
		var attributes = {};
		attributes.id =containerID; 
		swfobject.embedSWF(swffile, altContainerID, "215", "138", "9.0.28", false,flashvars, params, attributes);
		speechapi.setup(username,password,onResult,onFinishTTS, onLoaded, containerID); 
	},

			

	result: function(result) {

		if (speechapi.mashupMode) {
   			for (var k in result.ruleMatches) {
	   			speechapi.processRule2(result.ruleMatches[k]._rule,result.ruleMatches[k]._tag,result.text); 
   			}
   			speechapi.setupRecognition("JSGF", speechapi.generateGrammar(),false,speechapi.language,speechapi.oog);
		}

        	if (result == null) {
           		result =new Object();
           		result.text = "Recognition Error";
           		result.rCode="Error";
           		result.rMessage="Null result received from server";
        	} 
		//var jsonResult = eval('(' + result + ')');
		if(speechapi.onResultCallback != null)
			speechapi.onResultCallback(result);
	},

	setOnResult: function(obj) {
		if (eval("typeof " + obj + " == 'function'")) {
			speechapi.onResultCallback = obj;
		} else {
			alert('setOnResult needs to have a callback function that exists!');
		}
	},

	finishTTS: function() {
		if (speechapi.mashupMode) {
      			//alert(beingRead);
      			if (speechapi.beingRead != null) {
         			speechapi.beingRead.style.backgroundColor='white';
         			speechapi.beingRead = null;
	 			speechapi.beingReadBC = null;
      			}
		}
		if(speechapi.onFinishTTSCallback != null)
			speechapi.onFinishTTSCallback();
	},

	setOnFinishTTS: function(obj) {
		if (eval("typeof " + obj + " == 'function'")) {
			speechapi.onFinishTTSCallback = obj;
		} else {
			alert('setOnFinishTTS needs to have a callback function that exists!');
		}	
	},


	loaded: function () {
	        document.getElementById(speechapi.containerID).initFS(speechapi.username, speechapi.password, 'speechapi.result', 'speechapi.finishTTS');
		if (speechapi.mashupMode) {
			speechapi.initMashupMode();
		}
		if(speechapi.onLoadedCallback != null)
			speechapi.onLoadedCallback();
	},

	setOnLoaded: function(obj) {
		if (eval("typeof " + obj + " == 'function'")) {
			speechapi.onLoadedCallback = obj;
		} else {
			alert('setOnResult needs to have a callback function that exists!');
		}
	},

	setOogParams: function(oogBranchProb, phoneProb ) {
		document.getElementById(speechapi.containerID).setOogParms(oogBranchProb, phoneProb);
	},

	setupRecognition: function(grammarType, grammar, automatic, language, oogFlag) {
		speechapi.oog = oogFlag;
		speechapi.language =language;

		if (typeof automatic === 'undefined') automatic = speechapi.automatic;

		if (typeof oogFlag === 'undefined') oogFlag = false;
		
		if (typeof language === 'undefined')  language ="en";
	
		if(typeof grammarType == 'string') {
                	gType = grammarType.toUpperCase();
                	if ((gType == 'SIMPLE') || (gType == 'JSGF') ) {
		                if ((typeof grammar == 'string') &&(grammar.length > 0)) {
                        		speechapi.recognizerSetup = true;
		        		document.getElementById(speechapi.containerID).setupRecognition(grammarType,grammar, automatic, language, oogFlag);
                		} else {
		       			alert('Empty grammar string');
				}
			} else if (gType == "LM") {
                        	speechapi.recognizerSetup = true;
		        	document.getElementById(speechapi.containerID).setupRecognition(grammarType,grammar, automatic, language, oogFlag);
                	} else {
		   		alert('Invalid grammar type '+grammarType);
                	}
		} else {
			alert('Grammar type must be a string.');
		}	
	},

	startRecognition: function() {
        	if (speechapi.recognizerSetup) {
  	   		document.getElementById(speechapi.containerID).startRecognition();
        	} else {
			alert('Setup Grammars with setupRecognition() method before calling startRecognition()');
        	}
	},

	stopRecognition: function() {
		document.getElementById(speechapi.containerID).stopRecognition();
	},

	speak: function(text, speaker) {
		document.getElementById(speechapi.containerID).speak(text, speaker);
	},

	//------------
	// Vxml API
	//------------

	startVxmlAppUrl: function(appUrl,callback) {
		document.getElementById(speechapi.containerID).startVxmlAppUrl(appUrl,callback);
	},


	startVxmlAppText: function(app,callback) {
		document.getElementById(speechapi.containerID).startVxmlAppText(app,callback);
	},


	//------------
	// Advanced API
	//------------

	processRule: function(rulename, tag) {
		if (speechapi.grammars[rulename]) {
			speechapi.grammars[rulename].callback(speechapi.grammars[rulename].text, tag);
		} else {
			Logger.info("ProcessRule: ","unhandled rulename/tag "+rulename+"/"+tag);
		}
	},


	resetGrammar: function() {
		speechapi.grammars = {};
	},

	// similar to Array.join() but joins the keys of an
	// associative array instead of the array values
	joinKeys: function(map, separator) {
		var result = "";
		var count = 0;

		for (var x in map) {
			if (count++ > 0)
				result += separator;
			result += x;
		}

		return result;
	},

	constructGrammar: function() {
		var grammar = "#JSGF V1.0;\n";
		grammar += "grammar mashup;\n";

		//grammar += "public <command> = [<pre>] (<";
		grammar += "public <command> =  (<";
		grammar += speechapi.joinKeys(speechapi.grammars, "> | <");
		grammar += ">);\n";

		for (var rulename in speechapi.grammars) {
			grammar += ( "<" + rulename + "> = " + speechapi.grammars[rulename].text + ";\n" );
		}
		//alert(grammar);
		return grammar;
	},

	addJsgfGrammar: function(text, callback) {
		var rulename = 'id' + speechapi.ruleIndex++;
		speechapi.grammars[rulename] = {"text" : text, "callback" : callback};
		return rulename;
	},


	//--------------------
	// Page Scraping API
	//---------------------

   	setupPage: function(username,password,resultCallback,onFinishTTS,onLoaded, containerID,linkables,speakables,focusables,browserControl,formsEnabled) {
		speechapi.mashupMode = true;
   	     	speechapi.linkables = linkables;
   	     	speechapi.speakables = speakables;
 		speechapi.focusables = focusables;
		speechapi.browserControl = browserControl;
		speechapi.formsEnabled = formsEnabled;
		speechapi.setup(username,password,onResult,onFinishTTS, onLoaded, containerID); 
   	},



	initMashupMode: function() {
		speechapi.setupRecognition("JSGF", speechapi.generateGrammar(),false,speechapi.language,speechapi.oog);
		speechapi.makeTextClickable(speakables);
  		speechapi.setupFocus();
	},



	setupFocus: function() {
   		jQuery("input[type=text]").live("focus", function () {
    			if (speechapi.currentFocus)
       				speechapi.currentFocus.style.backgroundColor='white';
    			speechapi.currentFocus = this;
    			this.style.backgroundColor='yellow';
   		});
	},



	makeTextClickable: function(speakables) {
    		for (var i = 0; i <speakables.length; i++) {
        		jQuery(speakables[i]).live("click", function(){
          			speechapi.beingRead = this;
          			speechapi.beingReadBC = speechapi.beingRead.style.backgroundColor;
          			speechapi.beingRead.style.backgroundColor='yellow';
          			speechapi.speak( jQuery(this).text(),'male' );
       			});
   		}
	},


	makeSpeakLinkGrammar: function(links) {

 		//regex for matching html tags.
 		var regexp1 = /<("[^"]*"|'[^']*'|[^'">])*>/gi;
    		//var regexp2 = /[^\w\s]*/gi; 
 		var regexp2 = /[^a-zA-Z\s]/gi; 
 		var regexp3 = /\s/gi; 
		var regexp4 = /&nbsp;/gi; 
		var regexp5 =/^[ \t]+|[ \t]+$/gi;

    		var grammarSeg = "<link> = ( ";
    		for (var j = 0; j <links.length; j++) {
      			jQuery(links[j]).each(function (i) {
        			var x = this.getAttribute("name");
				//alert(j+" "+i+ " "+links[j]+" "+x+" " +this.href);
        			if (x != null) {
	    				grammarSeg = grammarSeg +x+" {"+this.href+"}| \n";
	    				this.style.backgroundColor='ffffcc';
            				//this.style.fontWeight = 'bold';
	    				//this.style.fontStyle = 'italic';
        			} else {
					var inner = this.innerHTML;
              				inner = inner.replace(regexp1,""); 
              				inner = inner.replace(regexp3," "); 
              				inner = inner.replace(regexp4," "); 
              				inner = inner.replace(regexp2," "); 
              				inner = inner.replace(regexp5,""); 
	    				grammarSeg = grammarSeg +inner+" {"+this.href+"}| \n";
            				//this.style.fontWeight = 'bold';
	    				//this.style.fontStyle = 'italic';
	    				this.style.backgroundColor='ffffcc';
        			}
			});
    		}
    		grammarSeg = grammarSeg+" speech web site  {http://www.speechapi.com}); \n";
    		return grammarSeg;
	},

	makeClickAndReadGrammar: function(readables) {
    		var grammarSeg = "<readthis> = ( ";
    		for (var j = 0; j <readables.length; j++) {
      			jQuery(readables[j]).each(function (i) {
        			var x = this.getAttribute("name");
        			var y = this.getAttribute("id");
				//alert(j+" "+i+ " "+readables[j]+" "+x+" " +y);
				if ((x != null) && (y !=null)) {
            				grammarSeg = grammarSeg +"("+x+") {"+y+"}| ";
            				//this.style.backgroundColor='yellow';
        			}
      			});
    		}
    		grammarSeg = grammarSeg+" dummy{dummy}); \n";
    		return grammarSeg;
	},


	makeChangeFocusGrammar: function(focusables) {
    		var grammarSeg = "<changeFocus> = ( ";
    		for (var j = 0; j <focusables.length; j++) {
      			var selectThis="input[type="+focusables[j]+"]";
      			jQuery(selectThis).each(function (i) {
        			var x = this.getAttribute("name");
        			var y = this.getAttribute("id");
				//alert(j+" "+i+ " "+focusables[j]+" "+x+" " +y);
				if ((x != null) && (y !=null)) {
            				grammarSeg = grammarSeg +"("+x+") {"+y+"}| ";
        			}
      			});
    		}
    		grammarSeg = grammarSeg+" dummy{dummy}); \n";
    		return grammarSeg;
	},

	makeFormEntryGrammar: function() {
   		var grammarSeg = "<formEntry> =  ";
   		if (speechapi.currentFocus != null) {
        		var x = speechapi.currentFocus.getAttribute("gram");
        		var y = speechapi.currentFocus.getAttribute("id");
			//alert(j+" "+i+ " "speechapi.currentFocus.name+" "+x+" " +y);
			if ((x != null) && (y !=null)) {
            			grammarSeg = grammarSeg +"("+x+") {"+y+"}; \n";
			}
   		} else {
      			grammarSeg = grammarSeg +"dummy{dummy};"
   		}
   		return grammarSeg;
	},





	processRule2: function(rule,tag,raw) {
   		//alert(rule+" : "+tag);
   		if (rule == 'link') {
      			location.href=tag;
   		} else if (rule == 'readthis') {
      			//alert(document.getElementById(tag));
      			speechapi.beingRead = document.getElementById(tag);
      			speechapi.beingReadBC = speechapi.beingRead.style.backgroundColor;
      			speechapi.beingRead.style.backgroundColor='yellow';
      			speechapi.speak(speechapi.beingRead.innerHTML,'male' );
   		//} else if (rule == 'whatread') {
			//alert("not impl");   

   		} else if (rule == 'changeFocus') {
      			document.getElementById(tag).focus();

   		} else if (rule == 'formEntry') {
      			if (speechapi.currentFocus)
	  			speechapi.currentFocus.value = raw;

   		} else if (rule == "scroll") {
      			if (tag == "up") {
         			window.scrollBy(0,-100);
      			} else if (tag =="down") {
         			window.scrollBy(0,100);
      			} else if (tag == "top") {
         			window.scrollTo(0,0);
      			} else if (tag == "bottom") {
         			if (document.body.scrollHeight) {
            				window.scrollTo(0, document.body.scrollHeight);
         			} else if (screen.height) {
            			// IE5 window.scrollTo(0, screen.height);
         			}
      			}

   		} else if (rule == "resize") {
      			if (tag  == "bigger") {
         			window.resizeBy(100,100);
      			} else if (tag  == "smaller") {
         			window.resizeBy(-100,-100);
      			} else if (tag == "tofit") {
         			window.sizeToContent();
      			}

   		} else if (rule == 'fontSize') {
      			getStyleClass('preferences').style.fontSize = tag;

   		} else if (rule == 'fontColor') {
      			getStyleClass('preferences').style.color = tag;

    		} else if (rule == 'background') {
      			getStyleClass('preferences').style.background = tag;

   		//} else if (rule == 'options') {
   			//       speakoptions();
   		//}else {
   		}
	},



	getStyleClass: function(className) {
        	for (var s = 0; s < document.styleSheets.length; s++){
                	if(document.styleSheets[s].rules) {
                        	for (var r = 0; r < document.styleSheets[s].rules.length; r++) {
                                	if (document.styleSheets[s].rules[r].selectorText == '.' + className) {
                                        	return document.styleSheets[s].rules[r];
                                	}
                        	}
                	} else if(document.styleSheets[s].cssRules) {
                        	for (var r = 0; r < document.styleSheets[s].cssRules.length; r++) {
                                	if (document.styleSheets[s].cssRules[r].selectorText == '.' + className)
                                        	return document.styleSheets[s].cssRules[r];
                        	}
                	}
        	}
        	return null;
	},




	speakoptions: function() {
      		var speakable = "Focus is not set to a speech enabled element";
      		if (currentFocus) {
         		if (currentFocus.id == 'color') {
             			speakable = "You can say: red, white, blue, green, black, yellow, orange, brown or gold"
         		} else if (currentFocus.id =='percentage') {
             			speakable = "You can say: one, two, three, four, five, six, seven, eight, nine or ten";
         		}  else {
             			speakable = "Focus is not set to a speech enabled element";
         		}
      		}
      		speechapi.speak(speakable,'female');
	},

	generateGrammar: function() {
   		var grammar1;
   		var grammar2 ="\n";
   		var firstFlag = true;
   		grammar1 = "#JSGF V1.0;\n";
   		grammar1 = grammar1 + "grammar speechapi;\n";
   		//grammar1 = grammar1 + "public <command> = [<pre>]";
   		grammar1 = grammar1 + "public <command> = ";

   		//for now no pre grammar (because bug in tags. Dont alwasy get the right tags with optional elements)
   		//grammar2 = grammar2 + "<pre> = (I would like [ to see ] ) | ( [please] get [me] ) | (go to);\n";

   		//jQuery(document).ready(function() {
   		//hyperlinks 
   		if (speechapi.linkables.length>0) {
      			if (firstFlag) {
         			grammar1 = grammar1+"(<link>";
         			firstFlag = false;
      			} else {
         			grammar1 = grammar1+"|<link>";
      			}
      			grammar2 = grammar2 + speechapi.makeSpeakLinkGrammar(speechapi.linkables);
   		}

   		//click and read
   		if (speechapi.speakables.length>0) {
      			if (firstFlag) {
         			grammar1 = grammar1+"(<readthis>";
         			firstFlag = false;
      			} else {
         			grammar1 = grammar1+"|<readthis>";
      			}
      				grammar2 = grammar2 + speechapi.makeClickAndReadGrammar(speechapi.speakables);
   		}

   		//change focus grammar
   		if (speechapi.focusables.length>0) {
      			if (firstFlag) {
         			grammar1 = grammar1+"(<changeFocus>";
         			firstFlag = false;
      			} else {
         			grammar1 = grammar1+"|<changeFocus>";
      			}
      				grammar2 = grammar2 + speechapi.makeChangeFocusGrammar(speechapi.focusables);
   		}

   		//form fill grammar
   		if (speechapi.formsEnabled) {
      			if (firstFlag) {
         			grammar1 = grammar1+"(<formEntry>";
         			firstFlag = false;
      			} else {
         			grammar1 = grammar1+"|<formEntry>";
      			}
      			grammar2 = grammar2 + speechapi.makeFormEntryGrammar();
   		}


   		if (speechapi.browserControl)  {
      			if (firstFlag) {
         			grammar1 = grammar1+"(<scroll>|<resize>";
         			firstFlag = false;
      			} else {
         			grammar1 = grammar1+"|<scroll>|<resize>";
      			}

       			grammar2 = grammar2 + "<scroll> = (<up> {up} |<down> {down} | <top> {top} | <bottom> {bottom});\n";
       			grammar2 = grammar2 + "<up> = [scroll] up;\n";
       			grammar2 = grammar2 + "<down> = [scroll] down;\n";
       			grammar2 = grammar2 + "<top> = [scroll to] top;\n";
       			grammar2 = grammar2 + "<bottom> = [scroll to] bottom;\n";
       			grammar2 = grammar2 + "<resize> = (<bigger> {bigger} |<smaller> {smaller} | <tofit> {tofit});\n";
       			grammar2 = grammar2 + "<bigger> = [size] bigger;\n";
       			grammar2 = grammar2 + "<smaller> = [size] smaller;\n";
       			grammar2 = grammar2 + "<tofit> = [size] to fit;\n";
   		}

   		if (speechapi.styleControl)  {
      			if (firstFlag) {
         			grammar1 = grammar1+"(<fontSize>|<fontColor>|<background>";
         			firstFlag = false;
      			} else {
         			grammar1 = grammar1+"|<fontSize>|<fontColor>|<background>";
      			}

       			grammar2 = grammar2 + "<background> = ( black{black} |blue{blue} |gray{gray}| green{green}| lime{lime} |maroon{maroon}| navy{navy} |olive{olive}| purple{purple}| red{red}| silver{silver} |teal{teal}| white{white}| yellow{yellow}) background;\n";
       			grammar2 = grammar2 + "<fontColor> = (black{black} |blue{blue}|gray{gray}| green{green}| lime{lime} |maroon{maroon}| navy{navy} |olive{olive}| purple{purple}| red{red}| silver{silver} |teal{teal}| white{white}| yellow{yellow}) font;\n";
       			grammar2 = grammar2 + "<fontSize> = (extra extra small{xx-small}|extra small{x-small}|small{small}|medium{medium}|large{large}|extra large{x-large}|extra extra large{xx-large}) font [size];\n";
   		}

    		grammar1 = grammar1+");\n"+grammar2;

   		//grammar = grammar + "<options> = (([what are the]options){options} );\n";

   		//});
   		//alert("GRAMMAR: "+grammar1);
   		return grammar1;
	}

};

