'use strict';
var gutil   = require('gulp-util');
var through = require('through2');
var cheerio = require('cheerio');
var replace = require('gulp-replace');
var fs      = require('fs');
var path    = require('path');

module.exports = function() {

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

			var rePattern = /<!-- smoosh -->([\s\S]*?)<!-- endsmoosh -->/g;

			var input = String(file.contents);

			var output = input.replace(rePattern, function(match) {

				var $ = cheerio.load(match);

				$('link').each(function(index, element) {
					var href = $(element).attr('href');
					$(element).replaceWith('<style>' + fs.readFileSync(path.join(file.base, href), 'utf8') + '</style>');
				});

				$('script').each(function(index, element) {
					var src = $(element).attr('src');
					$(element).replaceWith('<script>' + fs.readFileSync(path.join(file.base, src), 'utf8') + '</script>');
				});

				return $.html();
			}).replace(/<!-- smoosh -->\n|<!-- endsmoosh -->\n/g, '');

			file.contents = new Buffer(output);

			return callback(null, file);
		}

	});
};