'use strict';

var _            = require('lodash');
var async        = require('async');
var asyncReplace = require('async-replace');
var gutil        = require('gulp-util');
var through      = require('through2');
var cheerio      = require('cheerio');
var fs           = require('fs');
var path         = require('path');
var url          = require('url');

// Used to replace anything within a start and end tag.
var replaceRegExp = /<!--\s*?smoosh\s*?-->[\s\S]*?<!--\s*?endsmoosh\s*?-->/g;

// Used to remove start and end tags.
var removeRegExp = / *?<!--\s*?smoosh\s*?--> *\n?| *?<!--\s*?endsmoosh\s*?--> *\n?/g;

function isLocal(link) {
	return link && !url.parse(link).hostname;
}

module.exports = function(options) {

	var cssTags             = options && options.cssTags ? options.cssTags : {begin: '<style>', end: '</style>'};
	var jsTags              = options && options.jsTags ? options.jsTags : {begin: '<script>', end: '</script>'};
	var base                = options && options.base;
	var ignoreFilesNotFound = options && options.ignoreFilesNotFound;

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

			asyncReplace(input, replaceRegExp, function replacer(match) {

				// Last argument to asyncReplace is always the callback.
				var callback = _.values(arguments).pop();

				var $ = cheerio.load(match);

				var elements = $('link, script');

				// Asynchronously replace the contents of each element in this
				// comment block.
				async.each(elements, function iterator(element, callback) {

					var $element = $(element);
					var url;
					var tags;

					// use this to save <script attributes>
					var attrs;

					if ($element.is('link')) {

						url = $element.attr('href');
						tags = cssTags;
						attrs = {};

					} else if ($element.is('script')) {

						url = $element.attr('src');
						tags = jsTags;
						attrs = _.omit($element.attr(), 'src');
					}

					if (isLocal(url)) {
						fs.readFile(path.join(readFileBase, url), function onRead(error, data) {

							var isToIgnoreError = error && ignoreFilesNotFound && error.code === 'ENOENT';

							if(isToIgnoreError) {

								callback(null);

							} else if(error) {

								callback(error);

							} else {

								// create the new link/script element
								var newElement = $(tags.begin + data + tags.end);
								// port over the old script attributes (e.g. id, type, class, etc)
								_.forEach(attrs, function (value, key) {

									newElement.attr(key, value);

								});

								$(element).replaceWith(newElement);

								callback(error);
							}

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
