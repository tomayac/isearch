/**
 * @package MuseBag - Multimodal Search Interface
 * 
 * @description Defines general static configuration information
 * such as paths to external services used by the server of MuSeBag
 * 
 * @author Jonas Etzold
 * @company University of Applied Sciences Fulda
 */

var apcPath = 'http://89.97.237.248:8089/IPersonalisation/'; // personalisation component
var mqfPath = 'http://vision.iti.gr/isearch/server/scripts/'; // multimodal query formulation component
var videoLLdPath = 'http://imedia-ftp.inria.fr:8080/VideoDescriptorExtractor/rest/VideoDescriptorExtractor/'; //Video Low Level descriptor extractor component 
//var mqfPath = 'http://isearch_project.labs.exalead.com/isearch/';

var tempPath = '../../client/musebag/tmp'; // folder for temporary storing of uploaded media items

exports.apcPath = apcPath;
exports.mqfPath = mqfPath;
exports.tempPath = tempPath;
exports.videoLLdPath = videoLLdPath;
