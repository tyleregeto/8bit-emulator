// Core is a collection of helpers
// Nothing specific to the emultor application

"use strict";

// all code is defined in this namespace
window.te = window.te || {};

// te.provide creates a namespace if not previously defined.
// Levels are seperated by a `.` Each   level is a generic JS object.
// Example:  
// te.provide("my.name.space");
// my.name.foo = function(){};
// my.name.space.bar = function(){};
te.provide = function(ns /*string*/ , root) {
	var parts = ns.split('.');
	var lastLevel = root || window;

	for (var i = 0; i < parts.length; i++) {
		var p = parts[i];

		if (!lastLevel[p]) {
			lastLevel = lastLevel[p] = {};
		} else if (typeof lastLevel[p] !== 'object') {
			throw new Error('Error creating namespace.');
		} else {
			lastLevel = lastLevel[p];
		}
	}
};

// A simple UID generator. Returned UIDs are guaranteed to be unique to the page load
te.Uid = (function() {
	var id = 1;

	function next() {
		return id++;
	}

	return {
		next: next
	};
})();

// defaultOptionParse is a helper for functions that expect an options
// var passed in. This merges the passed in options with a set of defaults.
// Example:
// foo function(options) {
//     tf.defaultOptionParse(options, {bar:true, fizz:"xyz"});
// }
te.defaultOptionParse = function(src, defaults) {
	src = src || {};

	var keys = Object.keys(defaults);
	for (var i = 0; i < keys.length; i++) {
		var k = keys[i];

		if (src[k] === undefined) {
			src[k] = defaults[k];
		}
	}
	return src;
};

// Simple string replacement, eg:
// tf.sprintf('{0} and {1}', 'foo', 'bar'); // outputs: foo and bar
te.sprintf = function(str) {
	for (var i = 1; i < arguments.length; i++) {
		var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
		str = str.replace(re, arguments[i]);
	}
	return str;
};