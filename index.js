// -*- indent-tabs-mode: t; -*-

'use strict';
var async        = require('async');
var asyncReplace = require('async-replace');
var gutil        = require('gulp-util');
var through      = require('through2');
var cheerio      = require('cheerio');
var fs           = require('fs');
var path         = require('path');
var url          = require('url');

// Reusable regular expression snippets.
var anythingLazy = '([\\s\\S]*?)';
var spaces = '( *)';
var spacesLazy = '( *?)';
var optionalNewline = '(\n?)';
var startSmoosh = ['<!--', spacesLazy, 'smoosh', spacesLazy, '-->'].join('');
var endSmoosh = ['<!--', spacesLazy, 'endsmoosh', spacesLazy, '-->'].join('');

// Used to replace anything within startSmoosh and endSmoosh.
var replaceRegExp = new RegExp([startSmoosh, anythingLazy, endSmoosh].join(''), 'g');

// Used to remove startSmooshs and endSmooshs.
var removeRegExp = new RegExp([
	[spacesLazy, startSmoosh, spaces, optionalNewline].join(''),
	[spacesLazy, endSmoosh, spaces, optionalNewline].join('')
].join('|'), 'g');

function isLocal(link) {
	return link && ! url.parse(link).hostname;
}

module.exports = function(options) {

	var cssTags = options && options.cssTags ? options.cssTags : {begin: '<style>', end: '</style>'};
	var jsTags = options && options.jsTags ? options.jsTags : {begin: '<script>', end: '</script>'};
	var base = options && options.base;

	// create a stream through which each file will pass
	return through.obj(function(file, enc, callback) {

		if (file.isNull()) {
			this.push(file); // do nothing if no contents
			return callback();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('gulp-smoosher', 'Streaming not supported'));
			return callback();
		}

		if (file.isBuffer()) {

			var input = String(file.contents);

			var readFileBase = base !== undefined ? base : file.base;

			asyncReplace(input, replaceRegExp, function(match) {

				// Last argument to asyncReplace is always the callback.
				var callback = Array.prototype.slice.call(arguments).pop();

				var $ = cheerio.load(match);

				// Reduce replaceable elements to an array so we can iterate over them.
				var elements = [$('link'), $('script')].map(function toArray(elements) {
					return Array.prototype.slice.call(elements);
				}).reduce(function flatten(a, b) {
					return a.concat(b);
				});

				// Asynchronously replace the contents of each element in this
				// comment block.
				async.each(elements, function iterator(element, callback) {

					var $element = $(element);
					var url, tags;
					if ($element.is('link')) {
						url = $element.attr('href');
						tags = cssTags;
					} else if ($element.is('script')) {
						url = $element.attr('src');
						tags = jsTags;
					}
					if (isLocal(url)) {
						fs.readFile(path.join(readFileBase, url), function onRead(error, data) {
							if (error) {
								return callback(error);
							}
							$(element).replaceWith(tags.begin + data + tags.end);
							callback(null);
						});
					} else {
						callback(null);
					}

				}, function done(error) {

					if (error) {
						return callback(error);
					}
					// "Return" the replacement for asyncReplace.
					callback(null, $.html());
				});

			}, function done(error, output) {

				if (error) {
					return callback(error);
				}

				output = output.replace(removeRegExp, '');

				file.contents = new Buffer(output);

				callback(null, file);
			});
		}

	});
};
