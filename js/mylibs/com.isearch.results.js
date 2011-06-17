//That JS will take care of the results interactions & visualizations
//TODO: refactoring the code in a clean, obj-oriented way

//Namespace
var com;
if (!com) {
  com = {};
} else if (typeof com != "object") {
  throw new Error("com already exists and is not an object");
}
if (!com.isearch) {
  com.isearch = {}
} else if (typeof com.isearch != "object") {
  throw new Error("com.isearch already exists and is not an object");
}
if (com.isearch.results) {
  throw new Error("com.isearch.results already exists");
}
com.isearch.results = {};

com.isearch.results.display = function(query){
  com.isearch.results.injectFlashObject();
  com.isearch.results.fetch(query);
  com.isearch.results.attachEvents();
}

com.isearch.results.injectFlashObject = function() {
  //Inject the Flash object for the results visualization in the DOMElement
  
  var flashContainer = $( document.createElement('div') )
                       .attr('id','flash-results')
                       .html('Here goes the visualization')
                       .appendTo('#main');

  var swfLoaded = false ;
  var swfObj = null ;
  var lastResult = null ;
  var searchForm ;

  function outputStatus(e) {
    if (e.success) {
      com.isearch.flashResults = e.ref;
      console.log(com.isearch.flashResults);
    }
  }

  var flashVars = { testVar: "value" };
  var params = {
    allowFullScreen: "true",
    allowScriptAccess: "always",
    wmode: "transparent"
  };
        
  var attrs = {} ;
  swfobject.embedSWF( "demo.swf", 
                      "flash-results", 
                      "100%", "600", 
                      "10.2.0", "playerProductInstall.swf", 
                      flashVars, params, attrs, outputStatus );
}

com.isearch.results.attachEvents = function() {
  
  //Loading AJAX gif display/hiding
  var loadingDiv = $( document.createElement('div') )
                       .attr('id','loadingDiv')
                       .html('loading...')
                       .appendTo('body');

  loadingDiv.hide()  // hide it initially
      .ajaxStart(function() {
        $(this).show();
      })
      .ajaxStop(function() {
        $(this).hide();
      }); 

  //Controls for the display of the results
  $('#visualization-method').change(function() {
    if (com.isearch.flashResults && lastResult) {
      com.isearch.flashResults.visualiseResults(
          lastResult, 
          $("#visualization-method").val(), 
          { "iconSize": $("#icon-size").val() }
      );
    }
  });
  
  //Control for the icons size
  $('#icon-size').change(function() {
    if (com.isearch.flashResults && lastResult) {
      com.isearch.flashResults.visualiseResults(
          lastResult, 
          $("#visualization-method").val(), 
          {"iconSize": $("#icon-size").val()}
      );
    }
  });
 
}

com.isearch.results.fetch = function(query) {
  
  var urlToFetch = com.isearch.results.createQueryUrl(query);
  console.log("will fetch" + urlToFetch);

  $.ajax({
    //recovering of the XML via YQL to go over the same-origin policy
    url: urlToFetch ,
    type: "GET",
    dataType: "xml",
    success: function(data, textStatus, jqXHR) {

      com.isearch.xmlData= $(data).find('searchResults')[0];
      
      com.isearch.stringData = new XMLSerializer().serializeToString(com.isearch.xmlData); //Note: this will break in IE
      //lastResult = jqXHR.responseText ;
      // ==> Fixed data for testing purpose
      // com.isearch.stringData = '<searchResults><documentList count="27"><document id="3104" score="100"><desc>a man is eating an orange fruit;</desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb3104.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=3104"/><position>52.561 18.6429</position></document><document id="4267" score="100"><desc>a guide and two women in the forest;</desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb4267.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=4267"/><position>43.4476 10.8961</position></document><document id="3538" score="98"><desc>a man is sitting on the bus and is trying coca leaves;</desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb3538.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=3538"/><position>41.9589 1.63924</position></document><document id="3937" score="97"><desc>a man is sitting on a bus and is drinking Inca Kola;</desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb3937.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=3937"/><position>47.747 11.0103</position></document><document id="3951" score="97"><desc>a man is drinking out of a glass with a straw;</desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb3951.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=3951"/><position>42.5985 6.10654</position></document><document id="4642" score="95"><desc>a man is biting of a white stick in his hands;</desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb4642.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=4642"/><position>51.8359 8.56877</position></document><document id="3134" score="94"><desc>three men are standing in front of a glass door with a black frame; </desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb3134.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=3134"/><position>51.4227 17.963</position></document><document id="3186" score="94"><desc>a man is trying to hug a huge stone of a grey wall;</desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb3186.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=3186"/><position>42.7505 18.6515</position></document><document id="5228" score="94"><desc>a woman in red is eating a guinea pig;</desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb5228.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=5228"/><position>42.7163 9.27131</position></document><document id="4053" score="93"><desc>a man is trying to balance an egg on a nail; a woman is watching him;</desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb4053.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=4053"/><position>47.6872 16.9608</position></document><document id="6569" score="91"><desc>four men with glasses in their hands are sitting at a wooden table with a jug of corn beer on it;</desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb6569.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=6569"/><position>48.7498 5.52913</position></document><document id="3721" score="88"><desc>a woman in a wet tee-shirt is standing at a sandy beach; the sea with two waves in the background;</desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb3721.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=3721"/><position>44.7306 10.4158</position></document><document id="4909" score="87"><desc>a man is sitting in front of a red wall and is drinking from a brown cup with a straw;  a lawn in the background;</desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb4909.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=4909"/><position>41.3845 5.9631</position></document><document id="5416" score="87"><desc>a man is sitting at a wooden table with a bottle of Inca Kola on it and is raising a half-full glass of Inca Kola;</desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb5416.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=5416"/><position>42.3855 4.8034</position></document><document id="6225" score="87"><desc>a tourist is holding a brown egg in both hands; a woman behind him is filming him, another tourist is watching him;</desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb6225.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=6225"/><position>52.7935 17.4564</position></document><document id="6677" score="87"><desc>a man is standing on a boulder and is making a photo in a dry, brown desert landscape; another man is standing behind him;</desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb6677.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=6677"/><position>51.0088 15.14</position></document><document id="11511" score="86"><desc>a man and a woman are standing on a brown rocky slope with a little snow; a brown landscape in the valley in the background; </desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb11511.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=11511"/><position>43.4018 12.7339</position></document><document id="4192" score="85"><desc>a man in cycling outfit is standing in front of a cultivated field and is holding coca leaves in his hands; trees and a green slope in the background;</desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb4192.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=4192"/><position>39.2885 14.3374</position></document><document id="8996" score="85"><desc>a woman in dark orange is standing on a beam; a white plastic chair, white sand and brown trees in the foreground; green trees and palms in the background; </desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb8996.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=8996"/><position>55.1813 13.4353</position></document><document id="1172" score="84"><desc>three men are trying to restrain a bull:  one at the horns, the other one at the tail, the third one is watching from behind; dry grass landscape in the background;</desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb1172.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=1172"/><position>38.8875 5.83126</position></document><document id="11354" score="82"><desc>a man and a woman are sitting on a green meadow in the foreground; the man is holding a brown cup; a bicycle is leaning on a tree behind it; many trees in the background; </desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb11354.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=11354"/><position>38.4157 8.68596</position></document><document id="62" score="81"><desc>volunteer workers help with the construction in a kindergarten; four volunteers are squatting down and are trying to prise the ground with hammer and chisel; movable wooden walls are leaning on the wall in the background;</desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb62.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=62"/><position>50.3704 15.7638</position></document><document id="10650" score="81"><desc>a woman with long black hair and a white top is putting a white hat onto a man on with a grey tee-shirt; shelves with a lot of junk in the background; </desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb10650.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=10650"/><position>50.0811 9.81149</position></document><document id="8057" score="77"><desc>a man with a light blue shirt and a black gilet is standing at a beach and is holding an orange pomegranate in his hands; a grey rock, the sea and a light grey sky in the background; </desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb8057.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=8057"/><position>53.5473 10.3736</position></document><document id="15872" score="75"><desc>a team with blue jerseys and white shorts (Italy) and one team in black uniforms (New Zealand) on a rugby field in a large stadium with crowded three-storey grandstands; </desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb15872.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=15872"/><position>51.9348 11.8007</position></document><document id="15874" score="75"><desc>a team with blue jerseys and white shorts (Italy) and one team in black uniforms (New Zealand) on a rugby field in a large stadium with crowded three-storey grandstands; </desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb15874.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=15874"/><position>55.3601 14.1988</position></document><document id="11786" score="68"><desc>a bald man with sun glasses, a black tee-shirt and blue jeans is standing on the green deck of a ship in the foreground and is drinking from a cup; people are standing and sitting on the deck behind him; dark blue water, three cranes, a village on the brown bank and a few white clouds in a blue sky in the background; </desc><thumb url="http://vision.iti.gr/sotiris/hellaspath/images/thumbs/thumb11786.jpg"/><content mime="image/jpeg" url="http://vision.iti.gr:8080/fcgi-bin/indexer.exe?id=11786"/><position>46.4701 2.15989</position></document></documentList><cluster level="0"><node docidx="0" x="0.786462" y="0.021424"/><node docidx="1" x="0.438368" y="0.0421461"/><node docidx="2" x="0.506302" y="0.269265"/><node docidx="3" x="0.0682699" y="0.24485"/><node docidx="4" x="0.982055" y="0.506455"/><node docidx="5" x="0.615528" y="0.0710166"/><node docidx="6" x="0.367504" y="0.955535"/><node docidx="7" x="0.860073" y="0.337474"/><node docidx="8" x="0.24189" y="0.289529"/><node docidx="9" x="0.0509659" y="0.992706"/><node docidx="10" x="0.17246" y="0.0689108"/><node docidx="11" x="0.22013" y="0.300913"/><node docidx="12" x="0.786859" y="0.649617"/><node docidx="13" x="0.0836818" y="0.262764"/><node docidx="14" x="0.136479" y="0.217536"/><node docidx="15" x="0.562578" y="0.178259"/><node docidx="16" x="0.632282" y="0.106906"/><node docidx="17" x="0.453719" y="0.758843"/><node docidx="18" x="0.333811" y="0.0574053"/><node docidx="19" x="0.28251" y="0.694296"/><node docidx="20" x="0.873257" y="0.567583"/><node docidx="21" x="0.868496" y="0.0812098"/><node docidx="22" x="0.795404" y="0.999664"/><node docidx="23" x="0.634999" y="0.618854"/><node docidx="24" x="0.594775" y="0.593127"/><node docidx="25" x="0.19425" y="0.978881"/><node docidx="26" x="0.231513" y="0.0422987"/><cluster level="1"><node docidx="3" x="0.900052" y="0.379437"/><node docidx="6" x="0.727561" y="0.206488"/><node docidx="8" x="0.0529496" y="0.604572"/><node docidx="9" x="0.353984" y="0.361248"/><node docidx="10" x="0.668111" y="0.976043"/><node docidx="22" x="0.22364" y="0.895779"/><node docidx="23" x="0.346965" y="0.95352"/><node docidx="25" x="0.66512" y="0.201666"/><cluster level="2"><node docidx="3" x="0.290994" y="0.219977"/><node docidx="6" x="0.0996124" y="0.106723"/><node docidx="25" x="0.709342" y="0.843806"/></cluster><cluster level="2"><node docidx="9" x="0.671865" y="0.819147"/><node docidx="10" x="0.005768" y="0.491348"/><node docidx="23" x="0.604633" y="0.935331"/></cluster><cluster level="2"><node docidx="8" x="0.290628" y="0.605823"/><node docidx="22" x="0.74691" y="0.873836"/></cluster></cluster><cluster level="1"><node docidx="1" x="0.912229" y="0.830103"/><node docidx="2" x="0.605914" y="0.30488"/><node docidx="7" x="0.784234" y="0.150121"/><node docidx="13" x="0.542619" y="0.689047"/><node docidx="17" x="0.394635" y="0.993194"/><node docidx="20" x="0.101932" y="0.411603"/><node docidx="26" x="0.0274361" y="0.687429"/><cluster level="2"><node docidx="2" x="0.189001" y="0.862209"/><node docidx="17" x="0.763298" y="0.0476089"/></cluster><cluster level="2"><node docidx="1" x="0.48323" y="0.0561541"/><node docidx="7" x="0.961241" y="0.084994"/></cluster><cluster level="2"><node docidx="13" x="0.565477" y="0.962554"/><node docidx="20" x="0.573901" y="0.878658"/><node docidx="26" x="0.408704" y="0.40315"/></cluster></cluster><cluster level="1"><node docidx="4" x="0.413495" y="0.658528"/><node docidx="5" x="0.823359" y="0.945189"/><node docidx="15" x="0.28312" y="0.00222785"/><node docidx="16" x="0.61626" y="0.04944"/><node docidx="18" x="0.656056" y="0.421949"/><node docidx="21" x="0.954497" y="0.603961"/><cluster level="2"><node docidx="4" x="0.105258" y="0.394421"/></cluster><cluster level="2"><node docidx="5" x="0.276864" y="0.316782"/><node docidx="15" x="0.824244" y="0.853511"/><node docidx="16" x="0.311533" y="0.197668"/><node docidx="18" x="0.564684" y="0.469069"/></cluster><cluster level="2"><node docidx="21" x="0.995117" y="0.433241"/></cluster></cluster><cluster level="1"><node docidx="11" x="0.36848" y="0.418775"/><node docidx="19" x="0.384869" y="0.580432"/><node docidx="24" x="0.877743" y="0.337413"/><cluster level="2"><node docidx="11" x="0.207923" y="0.087344"/></cluster><cluster level="2"><node docidx="19" x="0.31727" y="0.471816"/></cluster><cluster level="2"><node docidx="24" x="0.629139" y="0.332774"/></cluster></cluster><cluster level="1"><node docidx="0" x="0.0793176" y="0.614521"/><node docidx="12" x="0.142827" y="0.280709"/><node docidx="14" x="0.824976" y="0.43907"/><cluster level="2"><node docidx="0" x="0.00735496" y="0.57625"/></cluster><cluster level="2"><node docidx="12" x="0.770562" y="0.107517"/></cluster><cluster level="2"><node docidx="14" x="0.969207" y="0.369427"/></cluster></cluster></cluster></searchResults>';

      //IMPORTANT: setTimeout is a dirty hack I put here. 
      //It's just to wait till the Flash obj is really loaded.      
      //More on this here: http://stackoverflow.com/questions/1436722/problem-accessing-externalinterface-exposed-method-in-google-chrome
      if (com.isearch.flashResults) {
        window.setTimeout(com.isearch.results.visualize, com.isearch.config.flashLoadedTimeout);
      } else {
        alert('Flash object is not loaded');
      }
    }
  }); 
}

com.isearch.results.createQueryUrl = function(query) {
  var baseYQLUrl = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D%22";
  var baseWSUrl = "http%3A%2F%2Fvision.iti.gr%2Fsotiris%2Fisearch%2Ftools%2Ffetch.php%3F";
  var parameters = "q%3D" + query
                   + "%26total%3D" + com.isearch.config.maxNumResults
                   + "%26cls%3D" + com.isearch.config.clusters0
                   + "%252C" + com.isearch.config.clusters1
                   + "%26tr%3D" + com.isearch.config.trans;
  return baseYQLUrl + baseWSUrl + parameters + "%22&diagnostics=true";
}

com.isearch.results.visualize = function() {
  com.isearch.flashResults.visualiseResults(
      com.isearch.stringData, 
      com.isearch.config.visualizationMethod, 
      {"iconSize": com.isearch.config.iconSize}
  );
}

