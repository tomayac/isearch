/**
 * Defines an object with allowed filename extensions for every module
 * Provides one pseudo-attribute 'extensions.all' which is a concatenation
 *    of all available extension - for general purpose use
 */
define('mylibs/extensions', [], function _extensions () {
  var extensions = {
    audio: [],
    '3d': ['dae','3ds'],
    picture: ['jpg','png','gif'],
    video: ['webm','mp4','avi','ogv'],
    sound: ['oga','ogg','mp3','wav'],
    rhythm: ['oga','ogg','mp3','wav']
  };

  // concatenate all extensions into one
  extensions.all = [];
  for (var key in extensions) {
    extensions.all = extensions.all.concat(extensions[key]);
  }

  return extensions;
})