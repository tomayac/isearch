<?php 

header("Content-type: text/xml");

$rucod = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
$rucod .= "\n\t<RUCoD xmlns=\"http://www.isearch-project.eu/isearch/RUCoD\" "
          ."xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" "
          ."xmlns:gml=\"http://www.opengis.net/gml\">";
$rucod .= "\n\t\t<Header>";
$rucod .= "\n\t\t\t<ContentObjectType>Abstract Entity</ContentObjectType>";
$rucod .= "\n\t\t\t<ContentObjectName xml:lang=\"en-GB\">office swivel chair plastic light grey cross-shaped steel</ContentObjectName>";

$rucod .= "\n\t\t\t<ContentObjectCreationInformation>";
$rucod .= "\n\t\t\t\t<Creator>";
$rucod .= "\n\t\t\t\t\t<Name>EGR EAIWS2RUCoD</Name>";
$rucod .= "\n\t\t\t\t</Creator>";
$rucod .= "\n\t\t\t</ContentObjectCreationInformation>";

//Image Item
$rucod .= "\n\t\t\t<ContentObjectTypes>";
$rucod .= "\n\t\t\t\t<MultimediaContent xsi:type=\"ImageType\">";
$rucod .= "\n\t\t\t\t\t<MediaName>";
$rucod .= "__kn__seating__2_DE-LA-LABDHL200DREHSTUHL86_B-ARMLEHNEN-AL27";
$rucod .= "</MediaName>";
$rucod .= "\n\t\t\t\t\t<FileFormat>jpg</FileFormat>";
$rucod .= "\n\t\t\t\t\t<MediaLocator>";
$rucod .= "<MediaUri>";
$rucod .= "http://services.easterngraphics.com/X-4GPL/isearch/media/kn/jpg/__kn__seating__2_DE-LA-LABDHL200DREHSTUHL86_B-ARMLEHNEN-AL27.jpg";
$rucod .= "</MediaUri>";
$rucod .= "</MediaLocator>";
$rucod .= "\n\t\t\t\t</MultimediaContent>";

//3D Item
$rucod .= "\n\t\t\t\t<MultimediaContent xsi:type=\"Object3D\">";
$rucod .= "\n\t\t\t\t\t<MediaName>";
$rucod .= "__kn__seating__2_DE-LA-LABDHL200DREHSTUHL86_B-ARMLEHNEN-AL27";
$rucod .= "</MediaName>";
$rucod .= "\n\t\t\t\t\t<FileFormat>3ds</FileFormat>";
$rucod .= "\n\t\t\t\t\t<MediaLocator>";
$rucod .= "<MediaUri>";
$rucod .= "http://services.easterngraphics.com/X-4GPL/isearch/media/kn/3ds/__kn__seating__2_DE-LA-LABDHL200DREHSTUHL86_B-ARMLEHNEN-AL27/__kn__seating__2_DE-LA-LABDHL200DREHSTUHL86_B-ARMLEHNEN-AL27.3ds";
$rucod .= "</MediaUri>";
$rucod .= "</MediaLocator>";
$rucod .= "\n\t\t\t\t</MultimediaContent>";

//Text item
$rucod .= "\n\t\t\t\t<MultimediaContent xsi:type=\"Text\">";
$rucod .= "\n\t\t\t\t\t<FreeText>";
$rucod .= "\n\t\t\t\t\t\tfabric class. seat cushion: fabric prov. for by customer special fabric head supp. fabric classification backrest: fabric prov. for by customer special fabric backrestcolour cross foot: black armrests: armrests AL27 colour seat support: Light grey colour mechanical swingarm: alu-coloured lordosis support: reinforced lordosis support office swivel chair LAMIGA 100% polyester back shell lightgrey cross-shaped steel with plastic cover with ERGO-DISC, ornamental ring chrome seat tilt adjustment seat-depth adjustment comfort seat depth suspension Seat and back upholstered fabric group 00";
$rucod .= "\n\t\t\t\t\t</FreeText>";
$rucod .= "\n\t\t\t\t</MultimediaContent>";

$rucod .= "\n\t\t\t\t<RealWorldInfo>";
$rucod .= "\n\t\t\t\t\t<MetadataUri filetype=\"xml\">";
$rucod .= "http://services.easterngraphics.com/X-4GPL/isearch/kn_dealers.rwml";
$rucod .= "</MetadataUri>";
$rucod .= "\n\t\t\t\t</RealWorldInfo>";
$rucod .= "\n\t\t</ContentObjectTypes>";
$rucod .= "\n\t\t</Header>";
$rucod .= "\n\t</RUCoD>";

echo $rucod;