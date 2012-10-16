/**
 * @package MuseBag - Multimodal Search Interface
 * 
 * @description Defines general helper functions used by
 * several parts of the MuSeBag framework.
 * 
 * @author Jonas Etzold
 * @company University of Applied Sciences Fulda
 */

/**
 *  -----------------------------------------------------------------------------
 *  Generic helper functions
 *  -----------------------------------------------------------------------------
 */

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

/**
 * a little but effective number test function
 */
var isNumber = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

var isObjectEmpty = function(obj) {
  return typeof obj !== 'object' || Object.keys(obj).length === 0;
};

var clone = function(obj) {
  if (null == obj || "object" != typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
  }
  return copy;
};

var sift = function() {
  
  var maxOffset = 5;
  
  var distance = function(s1, s2) {
    if (!s1 || !s2 || s1.length < 2 || s2.length < 2) {
      return 0;
    }
    
    var c = 0; 
    var offset1 = 0;
    var offset2 = 0;
    var dist = 0;
    var lcs = 0;
    
    while ((c + offset1 < s1.length) && (c + offset2 < s2.length)) {
      if (s1[c + offset1] === s2[c + offset2]) {
        lcs++;
      } else {
        offset1 = 0;
        offset2 = 0;
        for (var i = 0; i < maxOffset; i++) {
          if ((c + i < s1.length) && (s1[c + i] === s2[c])) {
            offset1 = i;
            break;
          }
          if ((c + i < s2.length) && (s1[c] === s2[c + i]))
          {
            offset2 = i;
            break;
          }
        }
      }
      c++;
    }
    return (s1.length + s2.length)/2 - lcs;
  };
  
  var similarity = function(s1, s2) {
    var dis = distance(s1, s2);
    var maxLen = Math.max(s1.length, s2.length);
    if (maxLen == 0) {
      return 1;
    } else {
      return 1 - dis / maxLen;
    }
  };
  
  return {
    similarity : similarity
  };
}();

/**
 *  -----------------------------------------------------------------------------
 *  Session specific helper functions
 *  -----------------------------------------------------------------------------
 */

var getSessionStore = function(req,asCopy) {
  //Does a user is logged in?
  if(!req.session.musebag) {
    //If not create an guest session store
    req.session.musebag = {
      'user' : { 
        'userId'   : 'guest',
        'settings' : '{"maxNumResults" : 100, "clusterType" : "3D", "numClusters" : 5, "transMethod" : "rand"}'
      },
      'queries' : new Array(),
      'querycount' : 0
    };
  };

  return asCopy === true ? clone(req.session.musebag) : req.session.musebag;
};

var setSessionStore = function(req,store) {
  try {
    req.session.musebag = store;
  } catch(e) {
    console.error('Session store could not be set due to an error: ' + e.message);
  }
};

var isGuest = function(req) {
  //Does a user is logged in?
  var sessionStore = getSessionStore(req,false);
  
  if(sessionStore.user.userId == 'guest') {
    return true;
  } else {
    return false;
  }
};

var getExternalSessionId = function(req) {  
  if(req) {
    var sessionStore = getSessionStore(req,false);
    if(!sessionStore.user.extSessionId) {
      var sid = req.sessionID.substring(req.sessionID.length-32,req.sessionID.length) + '-' + sessionStore.querycount;
      //remove illegal characters
      sid = sid.replace(/[|&;$%@"<>()+,\/]/g, '0');
      sessionStore.extSessionId = sid;
    } 
    return sessionStore.extSessionId;
  } 
};

var getQueryId = function(req) {
  if(req) {
    var sessionStore = getSessionStore(req,false);
    if(req.body.queryId && sessionStore.queries[req.body.queryId]) {
      return req.body.queryId;
    } else {
      return -1 + sessionStore.queries.push({
        'query'  : null,        //storage for the query JSON object
        'result' : {            //initial result object
          'raw'      : null,
          'relevant' : new Array()
        } 
      });
    }
  }
};

//Export all public available functions
exports.isNumber             = isNumber;
exports.isObjectEmpty        = isObjectEmpty;
exports.clone                = clone;
exports.sift                 = sift; 
exports.getSessionStore      = getSessionStore;
exports.setSessionStore      = setSessionStore;
exports.isGuest              = isGuest;
exports.getExternalSessionId = getExternalSessionId;
exports.getQueryId           = getQueryId;