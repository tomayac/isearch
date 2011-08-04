
/******************/
/* Author: Arnaud */
/******************/

/*==============================================================================
Initial objects, when freshly out of the database
================================================================================

[{
  "ID": 1,
  "Name": "BulueMarlin0",
  "Title": "Blue Marlin",
  "Screenshot": "http://gdv.fh-erfurt.de/modeldb/media/model/BulueMarlin0.jpg",
  "Category": "Animal",
  "Domain": "Model",
  "Date": "2010-09-02 18:54:52",
  "Author": "Unkown",
  "Web": "Unkown",
  "License": "GPL",
  "LicenseURL": "http://www.gnu.org/licenses/gpl-3.0.html",
  "CategoryPath": "Animal",
  "Files": [{
    "Type": "3ds",
    "Size": 212472,
    "URL": "http://gdv.fh-erfurt.de/modeldb/media/model/BulueMarlin0.3ds",
    "Viewer": "3D Studio MAX"
  }],
  "Related": [{
    "ID": "1860",
    "Domain": "Image",
    "Name": "swordfish-2339474290",
    "SourceURL": "http://gdv.fh-erfurt.de/modeldb/media/image/swordfish-2339474290.jpg",
    "Screenshot": "http://gdv.fh-erfurt.de/modeldb/media/image/swordfish-2339474290_thumb.jpg",
    "Author": "Paulo Valdivieso;p_valdivieso",
    "License": "CC by-nc-nd"
  }, {
    "ID": "1861",
    "Domain": "Image",
    "Name": "swordfish-89332423",
    "SourceURL": "http://gdv.fh-erfurt.de/modeldb/media/image/swordfish-89332423.jpg",
    "Screenshot": "http://gdv.fh-erfurt.de/modeldb/media/image/swordfish-89332423_thumb.jpg",
    "Author": "cristian;omnia_mutantur",
    "License": "CC by-nc-nd"
  }, {
    "ID": "1862",
    "Domain": "Image",
    "Name": "swordfish-43180366",
    "SourceURL": "http://gdv.fh-erfurt.de/modeldb/media/image/swordfish-43180366.jpg",
    "Screenshot": "http://gdv.fh-erfurt.de/modeldb/media/image/swordfish-43180366_thumb.jpg",
    "Author": "Spring Dew;Spring Dew",
    "License": "CC by-nc-nd"
  }, {
    "ID": "1863",
    "Domain": "Image",
    "Name": "swordfish-2118251729",
    "SourceURL": "http://gdv.fh-erfurt.de/modeldb/media/image/swordfish-2118251729.jpg",
    "Screenshot": "http://gdv.fh-erfurt.de/modeldb/media/image/swordfish-2118251729_thumb.jpg",
    "Author": ";MoToMo",
    "License": "CC by-nc-nd"
  }, {
    "ID": "1864",
    "Domain": "Image",
    "Name": "swordfish-3068601245",
    "SourceURL": "http://gdv.fh-erfurt.de/modeldb/media/image/swordfish-3068601245.jpg",
    "Screenshot": "http://gdv.fh-erfurt.de/modeldb/media/image/swordfish-3068601245_thumb.jpg",
    "Author": "Nick Chill;Nick Chill",
    "License": "CC by-nc-nd"
  }, {
    "ID": "1865",
    "Domain": "Image",
    "Name": "swordfish-3603078621",
    "SourceURL": "http://gdv.fh-erfurt.de/modeldb/media/image/swordfish-3603078621.jpg",
    "Screenshot": "http://gdv.fh-erfurt.de/modeldb/media/image/swordfish-3603078621_thumb.jpg",
    "Author": "daniel;number657",
    "License": "CC by-nc-nd"
  }]
}

================================================================================
When the script is finished, we should be able to write a file "1.json" that 
looks like the extract I wrote below.
"1" is the ID of the CO. Then, the conversion to RUCoD should be pretty easy.
(for reference, a sample RUCoD is included below)
Note: I have no idea about the .rwml format. Is there something more in there?
=> have a look on the FTP server of CERTH where all current Content Objects lie
   (isearch@ftp.iti.gr - PW: db4cos!). There are some samples for rwml files.
   Sadly there is no specification, but I already wrote an Email to Xavier from
   JCP regarding this specification. Anyway for some real-world descriptors there
   is a specification (like Weather, Emotion etc.)...have a look here:
   https://service.projectplace.com/pp/pp.cgi/d603738022/I-SEARCH_D3.2_WP3_26042011_JCP-v0.91.doc?save_as=1
================================================================================

{
  "ID": 1,
  "Name": "Blue Marlin",
  <= dropped the "Title" attribute. The value is used as the new value for "Name"
  "Screenshot": "http://gdv.fh-erfurt.de/modeldb/media/model/BulueMarlin0.jpg" <= if PHP adds "\" in front of "/", no worries. But "/" is valid as part of a string in JSON.
  "CategoryPath": "Animal/Fish", 
  <= Removed the "Domain" attribute
  <= Moved the "Date" attribute to individual files
  <= Dropped the Web attribute
  "Freetext": "Whatever free text we will find on DBPedia about blue marlins",
  "Files": [{
    "Type": "Object3D",
    "Name": "Blue Marlin Model", <= added this attribute to match the <mediaName> tag of RUCoD. We can just take the file name as a fallback
    "Tags": ["Detailed", "black"],
    "Extension": "3ds",
    "License": "GPL",
    "LicenseURL": "http://www.gnu.org/licenses/gpl-3.0.html",
    "Author": "Idun No",
    "Date": "2010-09-02 18:54:52", <= let's stick to human readable datetime
    "Size": 212472, <= in Bytes
    "URL": "http://gdv.fh-erfurt.de/modeldb/media/model/BulueMarlin0.3ds",
    "Preview": "http://link.to.the/preview.jpg",
    <= dropped the "viewer" attribute
    "Emotions": ["Affectionnate", "Afraid"]
    => No intensities here. The full list of emotions are based on Cowie’s everyday emotions:
		a.	Affectionate
		b.	Afraid
		c.	Amused
		d.	Angry
		e.	Bored
		f.	Confident
		g.	Content
		h.	Disappointed
		i.	Excited
		j.	Happy
		k.	Interested
		l.	Loving
		m.	Pleased
		n.	Relaxed
		o.	Sad
		p.	Satisfied
		q.	Worried
    "Location": [37.466139,-96.383057,89.0,50.0] <= [lat, long, altitude (m), heading (°)] many cameras provide these information and both values are in the KML standard which is used by RUCoD's RWML files.
    "Weather": {"condition": "NSC", "wind": 3, "temperature": "23", "humidity": "60"} 
    => condition can have the following values: 
    RA	Rain
		SN	Snow
		GR	Grêle
		FG	Fog
		NSC	No cloud
		FEW	1/8 to 2/8 of cloud coverage
		SCT	3/8 to 4/8 of cloud coverage
		BKN	5/8 to 7/8 of cloud coverage
		OVC	8/8 of cloud coverage
	   wind is a Beaufort Number as Wind Descriptor which is in the range from 0 (calm) to 12 (Hurricane Force)
	   temperature is in degree celsius
	   humidity is percent (from 0% up to 100%)	

  },
  {
    "Type": "ImageType",
    "Name": "The Magnificient Marlin",
    "Tags": ["Beautiful", "Exceptionnal light"],
    "Extension": "jpg",
    "License": "GPL", 
    "LicenseURL": "http://www.gnu.org/licenses/gpl-3.0.html",
    "Author": "Idun No",
    "Date": "2010-09-02 18:54:52",
    "Size": 2165,
    "URL": "http://gdv.fh-erfurt.de/modeldb/media/img/BulueMarlin.jpg",
    "Preview": "http://link.to.the/preview",
    "Dimensions": [1024,728], <= [width, height] for pictures or video, optional
    "Emotions": ["sad", "worried"],
    "Location": [37.466139,-96.383057,89.0,50.0], 
    "Weather": {"condition": "NSC", "wind": 3, "temperature": "23", "humidity": "60"}
  },
  {
    "Type": "VideoType",
    "Name": "Blue Marlin Video",
    "Tags": ["Boat", "Ugly", "Fishers"],
    "Extension": "ogg",
    "License": "GPL",
    "LicenseURL": "http://www.gnu.org/licenses/gpl-3.0.html",
    "Author": "Idun No",
    "Date": "2010-09-02 18:54:52",
    "Size": 3212472,
    "URL": "http://gdv.fh-erfurt.de/modeldb/media/vids/BulueMarlin.ogg",
    "Preview": "http://link.to.the/preview.jpg"
    "Dimensions": [800,600],
    "Lenght": 225, <= lenght of the sound or video extract, in seconds, optional
    "Emotions": ["happy"], 
    "Location": [147.466139,-76.383057,89.0,50.0],
    "Weather": {"condition": "NSC", "wind": 3, "temperature": "23", "humidity": "60"}
  },
  {
    "Type": "SoundType",
    "Name": "Blue Marlin Sound",
    "Tags": ["Funny", "Short"],
    "Extension": "mp3",
    "License": "GPL",
    "LicenseURL": "http://www.gnu.org/licenses/gpl-3.0.html",
    "Author": "Idun No",
    "Date": "2010-09-02 18:54:52",
    "Size": 65472,
    "URL": "http://gdv.fh-erfurt.de/modeldb/media/sound/BulueMarlin.mp3",
    "Preview": "http://link.to.the/preview.jpg",
    "Dimensions": [800,600],
    "Lenght": 225,
    "Emotions": ["sad"], 
    "Location": [127.466139,-74.3496057,89.0,50.0],
    "Weather": {"condition": "NSC", "wind": 3, "temperature": "23", "humidity": "60"}
  }] 
  <= dropping the "related" array. Instead, pictures, videos and audio will go in the files Array.
}
<= EOF

================================================================================
The detailed specification of where to find what
================================================================================

{
  "ID": 1,
  **Copied from the initial "ID" value**
  "Name": "Blue Marlin",
  **Copied from the initial "Title" value. Fallback: leave the ancient value as it is if there's no title**
  "Screenshot": "http://gdv.fh-erfurt.de/modeldb/media/model/BulueMarlin0.jpg"
  **This will be manually selected from the list of "Previews" we will have for each media item**
  "CategoryPath": "Animal/Fish", 
  **From the original "CategoryPath" value**
  "Freetext": "Whatever free text we will find on DBPedia about blue marlins",
  **From DBPedia. See here: http://wiki.dbpedia.org/Lookup**
  **Let's use YQL for this since the API delivers only XML**
  **Final JSON-REST URL: http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D%22http%3A%2F%2Flookup.dbpedia.org%2Fapi%2Fsearch.asmx%2FKeywordSearch%3FQueryString%3Dblue%2520Marlin%22&format=json&diagnostics=true
  "Files": [{
    "Type": "Object3D",
    **Static Attribute**
    "Name": "Blue Marlin Model", <= added this attribute to match the <mediaName> tag of RUCoD. We can just take the file name as a fallback
    **We just take the file name for this one?**
    "Tags": ["Detailed", "black"],
    **We can't find tags for the 3d object since there are no tags originally**
    "Extension": "3ds",
    **Static attribute (From what I've seen, all 3d objects in the library are .3ds files)
    "License": "GPL",
    **Copied from the ancient attribute**
    "LicenseURL": "http://www.gnu.org/licenses/gpl-3.0.html",
    **Copied from the ancient Attribute**
    "Author": "Idun No",
    **Copied from the ancient attribute**
    "Date": "2010-09-02 18:54:52",
    **Copied from the ancient attribute**
    "Size": 212472,
    **Copied from the ancient attribute**
    "URL": "http://gdv.fh-erfurt.de/modeldb/media/model/BulueMarlin0.3ds",
    **Copied from the ancient attribute**
    "Preview": "http://link.to.the/preview.jpg",
    **Copied from the ancient attribute**
    "Emotions": ["Affectionnate", "Afraid"]
    **Added manually at the end of the process**
    "Location": [37.466139,-96.383057,89.0,50.0],
    **We don't have any location info for the 3d models. Let's leave this blank?**
    "Weather": {"condition": "NSC", "wind": 3, "temperature": "23", "humidity": "60"} 
    **We don't have any weather info for the 3d models. Let's leave this blank?**
  },
  {
    "Type": "ImageType",
    **Static attribute**
    "Name": "The Magnificient Marlin",
    **From the Flickr API**
    **Documentation is here for the photo search API: http://www.flickr.com/services/api/flickr.photos.search.htm 
    **A convenient explorer is here: http://www.flickr.com/services/api/explore/flickr.photos.search
    **And a sample output for "Blue Marlin": http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=6ba2f236b4359b0b4b2b3fe70c472256&text=blue+marlin&format=json
    "Tags": ["Beautiful", "Exceptionnal light"],
    **From Flickr: http://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=6ba2f236b4359b0b4b2b3fe70c472256&photo_id=6001481790&format=json
    **Documentation: http://www.flickr.com/services/api/flickr.photos.getInfo.html
    "Extension": "jpg",
    **Virtually all images from Flickr can be retrieved as .jpg. This is nearly a static attribute for us
    "License": "GPL",
    **From Flickr API**
    "LicenseURL": "http://www.gnu.org/licenses/gpl-3.0.html",
    **There's only a couple of licences out there, so we can make simple "if"s to fill this attribute**
    **Example: if (Licence === "GPL") {LicenceURL = "http://www.gnu.org/licenses/gpl-3.0.html"}
               elseif (Licence === "Public") {LicenceURL = ...etc
    "Author": "Idun No",
    **From Flickr: http://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=6ba2f236b4359b0b4b2b3fe70c472256&photo_id=6001481790&format=json
    **Documentation: http://www.flickr.com/services/api/flickr.photos.getInfo.html
    "Date": "2010-09-02 18:54:52",
    **From Flickr: http://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=6ba2f236b4359b0b4b2b3fe70c472256&photo_id=6001481790&format=json
    **Documentation: http://www.flickr.com/services/api/flickr.photos.getInfo.html
    ** We grab the "dateuploaded" attribute
    "Size": 2165,
    *not available in the API!*
    "URL": "http://farm{farm-id}.static.flickr.com/{server-id}/{id}_{secret}_b.jpg)",
    *Computed from the ID of the photo with this documentation: http://www.flickr.com/services/api/misc.urls.html **
    "Preview": "http://farm{farm-id}.static.flickr.com/{server-id}/{id}_{secret}_s.jpg",
    *Computed from the ID of the photo with this documentation: http://www.flickr.com/services/api/misc.urls.html **
    "Dimensions": [1024,728],
    *Don't know how we can retrieve this*
    "Emotions": ["sad", "worried"],
    *Maually added afterwards*
    "Location": [37.466139,-96.383057,89.0,50.0], 
    **From Flickr: http://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=6ba2f236b4359b0b4b2b3fe70c472256&photo_id=6001481790&format=json
    **Documentation: http://www.flickr.com/services/api/flickr.photos.getInfo.html
    "Weather": {"condition": "NSC", "wind": 3, "temperature": "23", "humidity": "60"}
    **Computed afterwards if we have a date and a location**
  },
  {
    "Type": "VideoType",
    "Name": "Blue Marlin Video",
    **Youtube API**
    **URL of the call: https://gdata.youtube.com/feeds/api/videos?q=blue%20marlin&orderby=published&max-results=10&v=2&alt=json
    "Tags": ["Boat", "Ugly", "Fishers"],
    **Tags are included in the result**
    "Extension": "ogg",
    **Not sure...mabe we should leave this blank**
    "License": "GPL",
    **YouTube License? I think we don't have the right to download any videos...**
    "LicenseURL": "http://www.gnu.org/licenses/gpl-3.0.html",
    **YouTube License? I think we don't have the right to download any videos...**
    "Author": "Idun No",
    **Provided by YouTube API**
    "Date": "2010-09-02 18:54:52",
    **Provided by YouTube API**
    "Size": 3212472,
    **NOT provided**
    "URL": "https://www.youtube.com/watch?v=QQfk6LGe",
    **Generated from the YouTube ID**
    "Preview": "http://i.ytimg.com/vi/QQfk6LGe-1o/default.jpg"
    **Thumbnail provided by YouTube**
    "Dimensions": [800,600],
    **It depends on what version we take**
    "Lenght": 225,
    **Provided by Youtube API**
    "Emotions": ["happy"], 
    **Manually added**
    "Location": [147.466139,-76.383057,89.0,50.0],
    **Not provided**
    "Weather": {"condition": "NSC", "wind": 3, "temperature": "23", "humidity": "60"}
    **Difficult to have in the case of YouTube: we don't have any "places" available**
  },
  {
    "Type": "SoundType",
    **Static attribute**
    "Name": "Blue Marlin Sound",
    **In this case, I think we should fallback to filename**
    "Tags": ["Funny", "Short"],
    **We use this call: http://tabasco.upf.edu/api/sounds/search/?q=dolphins&api_key=57e0e646aa4941d69cf383575afec73d**
    **The "tags" field contains what we expect**
    "Extension": "mp3",
    **From the same API, field "type"
    "License": "CC",
    **All freesoudproject sounds are under creative commons**
    "LicenseURL": "http://creativecommons.org/",
    **Creative Commons URL**
    "Author": "Idun No",
    **Provided by the API**
    "Date": "2010-09-02 18:54:52",
    **NOT provided by the API
    "Size": 65472,
    **NOT provided**
    "URL": "http://beta.freesound.org/people/acclivity/sounds/13691/",
    **Provided by the API**
    "Preview": "http://beta.freesound.org/data/displays/13/13691_37876_wave_M.png",
    **PROVIDED by the API! HOW COOL IS THAT?! :D **
    "Lenght": 124,
    **Provided by the API ("duration" field)**
    "Emotions": ["sad"], 
    **Added manually afterwards**
    "Location": [127.466139,-74.3496057,89.0,50.0],
    **No location**
    "Weather": {"condition": "NSC", "wind": 3, "temperature": "23", "humidity": "60"}
    **No weather for sounds I guess. It doesn't really makes sense since we don't have datetime and location
  }] 
  <= dropping the "related" array. Instead, pictures, videos and audio will go in the files Array.
}
<= EOF

================================================================================
RUCoD header
------------
For reference, here is the "new" RUCoD format, proposed by Sotiris
(with the RW infos in the header)
================================================================================
<?xml version="1.0" encoding="UTF-8"?>
<RUCoD xsi="http://www.isearch-project.eu/isearch/RUCoD" 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
    xmlns:gml="http://www.opengis.net/gml">
  <Header>
    <ContentObjectType>Audio Recording</ContentObjectType>
    <ContentObjectName xml:lang="en-US">My Bulldog Barking</ContentObjectName>
    <ContentObjectName xml:lang="it-IT">Ave Maria</ContentObjectName>
    <ContentObjectID>3577B5EF-523F-4946-9734-C974CEA6C646</ContentObjectID>
    <ContentObjectVersion xsi:type="xsd:int">1</ContentObjectVersion>
    <ContentObjectCreationInformation>
      <Creator>
        <Name>ANSC</Name>
      </Creator>
      <Contributor>
        <Name>ANSC</Name>
      </Contributor>      
    </ContentObjectCreationInformation>
    <Tags>
      <MetaTag name="Composer" xsi:type="xsd:string">Schubert</MetaTag>
      <MetaTag name="zzz/yyy" xsi:type="isearch:Selection2Choices">true</MetaTag>
      <MetaTag name="Feature/Width" xsi:type="xsd:int">2414</MetaTag >
      <MetaTag name="Feature/Depth" xsi:type="xsd:int">900</MetaTag >
      <MetaTag name="Feature/Height" xsi:type="xsd:int">720</MetaTag >
      <MetaTag name="Dimension/Top/Crystal 230" xsi:type="xsd:string">GO</MetaTag >
      <MetaTag name="Feature/Top/Crystal 230" xsi:type="xsd:string">GO</MetaTag >
      <MetaTag name="Dimension/Leg/Frame/Crystal 230" xsi:type="xsd:string">GO</MetaTag >
      <MetaTag name="Feature/Leg/Frame/Crystal 230" xsi:type="xsd:string">GO</MetaTag >
      <MetaTag name="Part" xsi:type="xsd:string">Top edge</MetaTag >
      <MetaTag name="Part" xsi:type="xsd:string">Leg optimisation</MetaTag >
      <MetaTag name="Feature/Height adjustment" xsi:type="xsd:string">Crank 620-900 mm</MetaTag >
      <MetaTag name="Part" xsi:type="xsd:string">Cable tray</MetaTag >
      <MetaTag name="Part" xsi:type="xsd:string">Cable management</MetaTag >
      <MetaTag name="Part" xsi:type="xsd:string">Cable outlet small</MetaTag >
      <MetaTag name="Part" xsi:type="xsd:string">Cut-out - Partito</MetaTag >
      <MetaTag name="Part" xsi:type="xsd:string">Cut-out</MetaTag >
      <MetaTag name="Part" xsi:type="xsd:string">Column covers</MetaTag >
      <MetaTag name="Dimension/Number of lateral frames" xsi:type="xsd:int">2</MetaTag >
      <MetaTag name="Feature/Number of lateral frames" xsi:type="xsd:int">2</MetaTag >
      <MetaTag name="Dimension/Number of legs" xsi:type="xsd:int">1</MetaTag >
      <MetaTag name="Feature/Number of legs" xsi:type="xsd:int">1</MetaTag >
      <MetaTag name="Feature/VI-type" xsi:type="xsd:string">Type 12</MetaTag >
      <MetaTag name="Dimension/SAP number of end frames" xsi:type="xsd:int">2</MetaTag >
      <MetaTag name="Feature/SAP number of end frames" xsi:type="xsd:int">2</MetaTag >
      <MetaTag name="Dimension/SAP number of legs" xsi:type="xsd:int">1</MetaTag >
      <MetaTag name="Feature/SAP number of legs" xsi:type="xsd:int">1</MetaTag >
      <MetaTag name="Feature/SAP quantity  Inlay Design-Kit" xsi:type="xsd:int">3</MetaTag >
      <MetaTag name="Dimension/PartPG desk top panel" xsi:type="xsd:string">pricegroup A</MetaTag >
      <MetaTag name="Feature/PartPG desk top panel" xsi:type="xsd:string">pricegroup A</MetaTag >
      <MetaTag name="Feature/ArtNo" xsi:type="xsd:int">82</MetaTag >
      <MetaTag name="Dimension/Base/Arms" xsi:type="xsd:string">4 Legs, without arms</MetaTag >
      <MetaTag name="Feature/Base/Arms" xsi:type="xsd:string">4 Legs, without arms</MetaTag >
      <MetaTag name="Feature/iModel" xsi:type="xsd:int">0</MetaTag >
      <MetaTag name="Dimension/Frame finish" xsi:type="xsd:string">Silver</MetaTag >
      <MetaTag name="Feature/Shell type" xsi:type="xsd:string">Lacquered plywood</MetaTag >
      <MetaTag name="Feature/Shell finish" xsi:type="xsd:string">Beech</MetaTag >
      <MetaTag name="Feature/Wooden parts:" xsi:type="xsd:string">Natural beech</MetaTag >
      <MetaTag name="Feature/Castors/glides" xsi:type="xsd:string">Aluminium castors with revolving rubber rings.</MetaTag >
      <MetaTag name="Feature/Special options:" xsi:type="xsd:string">without</MetaTag >
      <MetaTag name="Feature/Price Group [cushion]:" xsi:type="xsd:string">A</MetaTag >
      <MetaTag name="Feature/Colour [cushion]:" xsi:type="xsd:string">Fabric provided by customer</MetaTag >
      <MetaTag name="Feature/Delivery type:" xsi:type="xsd:string">Model completely assembled in box</MetaTag >
    </Tags>
    <ContentObjectTypes>
      <MultimediaContent xsi:type="Text"> 
        <FreeText>It is the image, video and 3D representation of my bulldog (along with the sound of barking) taken from my home in August 2010.
        </FreeText> 
      </MultimediaContent>
      <MultimediaContent xsi:type="Object3D">
        <MediaName>Bulldog</MediaName>
        <FileFormat>x-world/x-vrml</FileFormat>     
        <MediaLocator>
          <MediaUri>http://3d-test.iti.gr:8080/3d-test/ContentObject/Bulldog.wrl</MediaUri>
          <MediaPreview>http://3d-test.iti.gr:8080/3d-test/ContentObject/BulldogWRL.jpg</MediaPreview>
        </MediaLocator>       
      </MultimediaContent>
      <MultimediaContent xsi:type="Object3D">
        <MediaName>BulldogLR</MediaName>
        <FileFormat>x-world/x-vrml</FileFormat>     
        <MediaLocator>
          <MediaUri>http://3d-test.iti.gr:8080/3d-test/ContentObject/BulldogLR.wrl</MediaUri> 
        </MediaLocator>       
      </MultimediaContent>
      <MultimediaContent xsi:type="ImageType">
        <MediaName>Bulldog1</MediaName>
        <FileFormat>image/jpeg</FileFormat>     
        <MediaLocator>
          <MediaUri>http://3d-test.iti.gr:8080/3d-test/ContentObject/Bulldog1.jpg</MediaUri>  
        </MediaLocator>
        <MediaCreationInformation>  
          <Creator>
            <Name>Apostolos Axenopoulos</Name>
          </Creator>
        </MediaCreationInformation>
      </MultimediaContent>
      <MultimediaContent xsi:type="ImageType">
        <MediaName>Bulldog2</MediaName>
        <FileFormat>image/jpeg</FileFormat>     
        <MediaLocator>
          <MediaUri>http://3d-test.iti.gr:8080/3d-test/ContentObject/Bulldog2.jpg</MediaUri>  
        </MediaLocator>
      </MultimediaContent>
      <MultimediaContent xsi:type="VideoType">
        <MediaName>BulldogVideo</MediaName>
        <FileFormat>video/x-msvideo</FileFormat>      
        <MediaLocator>
          <MediaUri>http://3d-test.iti.gr:8080/3d-test/ContentObject/BulldogVideo.avi</MediaUri>  
        </MediaLocator>
        <MediaCreationInformation>
          <Creator>
            <Name>Anne Verroust</Name>
          </Creator>
        </MediaCreationInformation>
      </MultimediaContent>
      <MultimediaContent xsi:type="SoundType">
        <MediaName>AveMaria</MediaName>
        <FileFormat>audio/x-wav</FileFormat>
        <MetaTag name="OrchestraSize">100</MetaTag>
        <MediaLocator>
          <MediaUri>http://bibliomediateca.santacecilia.it/bibliomediateca/cms.view?numDoc=128&amp;munu_str=0_1_0_5&amp;pflag=personalizationFindEtnomusicologia&amp;level=brano&amp;physDoc=204#n</MediaUri> 
          <MediaPreview format="audio/x-wav">http://....wav</MediaPreview>
          <MediaPreview>http://....mp3</MediaPreview>
          <MediaPreview>http://....ogg</MediaPreview>
          <MediaPreview format="image/jpeg">http://....jpg</MediaPreview>
          <MediaPreview format="text/html">http://....html</MediaPreview>
        </MediaLocator>
        <SamplingFrequency>22050</SamplingFrequency>
        <BitsPerSample>8</BitsPerSample>
        <NumberOfChannels>1</NumberOfChannels>
        <MediaTime>5.34</MediaTime>
        <MediaCreationInformation>
          <Creator>
            <Name>RAI</Name>
          </Creator>
          <Author>
            <Name>Coro di Ruda</Name>
          </Author>
          <Licensing>CreativeCommons</Licensing>
        </MediaCreationInformation>
      </MultimediaContent>
      <MultimediaContent xsi:type="SoundType">
        <MediaName>BulldogSound2</MediaName>
        <FileFormat>audio/mpeg</FileFormat>
        <SamplingFrequency>44100</SamplingFrequency>
        <BitsPerSample>16</BitsPerSample>
        <NumberOfChannels>1</NumberOfChannels>
        <MediaTime>5.34</MediaTime>
        <MediaLocator>
          <MediaUri>http://3d-test.iti.gr:8080/3d-test/ContentObject/BulldogSound2.mp3</MediaUri> 
        </MediaLocator>
        <MediaCreationInformation>
          <Creator>
            <Name>Antonio Camurri</Name>
          </Creator>
          <Author>
            <Name>John Doe</Name>
          </Author>
          <Contributor>
            <Name>ANSC</Name>
          </Contributor>  
        </MediaCreationInformation>
      </MultimediaContent>
      
      <RealWorldInfo>
        <MetadataUri filetype="xml">http://3d-test.iti.gr:8080/3d-test/ContentObject/BulldogCO.rwml</MetadataUri> 
        <MetadataUri filetype="xml">http://3d-test.iti.gr:8080/3d-test/ContentObject/BulldogCO-RAT.rwml</MetadataUri>
      </RealWorldInfo>
      
      <UserInfo>
        <UserInfoName>Emotion</UserInfoName>
        <emotion>
           <category set="basicEmotions" name="Sadness"/>
           <intensity value="0.36"/>
         </emotion>
      </UserInfo> 
      
    </ContentObjectTypes>
  
    
  </Header>


================================================================================
RWML File
================================================================================

<RWML>
  <ContextSlice>
    <DateTime>
      <Date>1997-07-16T19:20:30.45+01:00</Date>  
      <Length>100</Length>         
    </DateTime>
    <Location type="text">
    Berlin
    </Location>
    <Location type="gml"> 
      <gml:CircleByCenterPoint numArc="1">                          
        <gml:pos>-117.174 34.055</gml:pos>
        <gml:radius uom="M">10</gml:radius>
      </gml:CircleByCenterPoint>
    </Location>
    <Direction>
      <Heading>0</Heading>     
      <Tilt>0</Tilt>       
      <Roll>0</Roll>       
    </Direction>
    <Weather>
      <Condition>OVC RA</Condition>    
      <Temperature>20</Temperature>    
      <WindSpeed>2</WindSpeed>     
      <Humidity>94</Humidity>      
    </Weather>
    <PhysicalTags>
      <Tag>b9853830-ca34-11df-bd3b-0800200c9a66</Tag>
      <Tag>bulldog dog collar</Tag>
    </PhysicalTags>
  </ContextSlice>
</RWML>

*/

var utils = require('util'),
    nodeio = require('node.io'),
    flickr = require('./flickr');
    //youtube = require('./youtube'),
    //sound = require('./freesound'),
    //weather = require('./weather');

//Get the 3D Model from http://gdv.fh-erfurt.de/modeldb/?mode=json
var modelname = 'Two Dolphins';    
var result = new Array;

flickr.fetch(modelname,result,function(error, data) {
	console.log(result);
});



















