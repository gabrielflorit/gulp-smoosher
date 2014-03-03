'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var cheerio = require('cheerio');
var replace = require('gulp-replace');
var fs = require('fs');
var path = require('path');
var cleanCSS = require('clean-css');
var uglify = require('uglify-js');

module.exports = function(opts) {

	var opt = {
		"minify" : false,
		"pathtag" : false
	};
	if (opts) {
		opt = opts;
	};

	// create a stream through which each file will pass
	return through.obj(function(file, enc, callback) {

		if (file.isNull()) {
			this.push(file);
			// do nothing if no contents
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
					var pathtag = "";
					var href = $(element).attr('href');
					var cssContent = fs.readFileSync(path.join(file.base, href), 'utf8');
					if (opt.minify) {
						cssContent = new cleanCSS().minify(String(cssContent));
					}
					if (opt.pathtag) {
						pathtag = ' smoosh="' + href + '"';
					}
					$(element).replaceWith('<style' + pathtag + '>' + cssContent + '</style>');
				});

				$('script').each(function(index, element) {
					var src = $(element).attr('src');
					var jsContent = fs.readFileSync(path.join(file.base, src), 'utf8');
					if (opt.minify) {
						jsContent = uglify.minify(jsContent, {fromString : true}).code;
					}
					if (opt.pathtag) {
						pathtag = ' smoosh="' + src + '"';
					}
					$(element).replaceWith('<script' + pathtag + '">' + jsContent + '</script>');
				});

				$('smoosh').each(function(index, element) {
					var data = $(element).attr('data');
					var smooshContent = smooshContent + (fs.readFileSync(path.join(file.base, data), 'utf8'));
					$(element).replaceWith(smooshContent);
				});

				return $.html();
			}).replace(/<!-- smoosh -->\n|<!-- endsmoosh -->\n/g, '');

			file.contents = new Buffer(output);

			return callback(null, file);
		}
	});
}; 