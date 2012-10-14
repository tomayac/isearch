/**
 * @package MuseBag - Multimodal Search Interface
 * 
 * @description Defines general helper functions used by
 * several modules of MuSeBag
 * 
 * @author Jonas Etzold
 * @company University of Applied Sciences Fulda
 */
var isObjectEmpty = function(obj) {
  return Object.keys(obj).length === 0;
};

exports.isObjectEmpty = isObjectEmpty;