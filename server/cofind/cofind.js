/**
 * @package CoFind - Collaborative Search Component
 * 
 * @description This file exposes all functions dedicated to collaborative search
 * within I-SEARCH.
 * 
 * @author Jonas Etzold
 * @company University of Applied Sciences Erfurt
 */
this.title = "CoFind - Collaborative Search Service for I-SEARCH";
this.name = "CoFind";
this.version = "0.1.0";
this.endpoint = "http://isearch.ai.fh-erfurt.de/cofind";

exports.echo = function(options, callback){
  callback(null, options.msg);
};
//Documentation for echo function
exports.echo.description = "this is the echo method, it echos back your msg";
exports.echo.schema = {
  msg: { 
    type: 'string',
    optional: false 
  }
};

exports.ping = function(options, callback){
  setTimeout(function(){
    callback(null, 'pong');
  }, 2000);
};
//Documentation for ping function
exports.ping.description = "this is the ping method, it pongs back after a 2 second delay";