/**
 * This script takes the JSON data of a Content Object and stores it as
 * json files. It further provides functions for converting the json files
 * to RUCoD Headers including Real-World descriptor files.
 * 
 * @author Jonas
 */
var nodeio = require('node.io'),
    fs     = require('fs');

/**
 * Stores the given JSON data as file on the servers file system.
 * @param the Content Object data in JSON format
 * @param overwrite indicates weather an existing file for content object should be overwritten or not
 */
exports.store = function(data, overwrite, callback) {

	
};

/**
 * Checks weather the given index of a Content Object already exists.
 */
exports.exists = function(index) {

	
};

/**
 * Converts all already stored JSON files into XML RUCoD format with their
 * respective RWML files.
 */
exports.publishRUCoD = function(callback) {

	
};