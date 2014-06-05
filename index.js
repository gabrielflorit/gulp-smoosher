'use strict';
var gutil   = require('gulp-util');
var through = require('through2');
var cheerio = require('cheerio');
var replace = require('gulp-replace');
var fs      = require('fs');
var path    = require('path');
var url     = require('url');

function isLocal(link) {
	return link && ! url.parse(link).hostname;
}

module.exports = function(options) {

	var cssTags = options && options.cssTags ? options.cssTags : {begin: '<style>', end: '</style>'};
	var jsTags = options && options.jsTags ? options.jsTags : {begin: '<script>', end: '</script>'};

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

			var rePattern = /<!--(| )smoosh(| )-->([\s\S]*?)<!--(| )endsmoosh(| )-->/g;

			var input = String(file.contents);

			var output = input.replace(rePattern, function(match) {

				var $ = cheerio.load(match);

				$('link').each(function(index, element) {
					var href = $(element).attr('href');
					if (isLocal(href)) {
						$(element).replaceWith(cssTags.begin + fs.readFileSync(path.join(file.base, href), 'utf8') + cssTags.end);
					}
				});

				$('script').each(function(index, element) {
					var src = $(element).attr('src');
					if (isLocal(src)) {
						$(element).replaceWith(jsTags.begin + fs.readFileSync(path.join(file.base, src), 'utf8') + jsTags.end);
					}
				});

				return $.html();
			}).replace(/([ ]*)<!--(| )smoosh(| )-->([ ]*)(\n?)|([ ]*)<!--(| )endsmoosh(| )-->([ ]*)(\n?)/g, '');

			file.contents = new Buffer(output);

			return callback(null, file);
		}

	});
};