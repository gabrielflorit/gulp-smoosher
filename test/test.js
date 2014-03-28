var assert   = require('assert');
var gutil    = require('gulp-util');
var smoosher = require('../index');
var fs       = require('fs');
var path     = require('path');

describe('gulp-smoosher', function() {
	describe('in buffer mode', function() {

		it('should smoosh css and js', function(done) {

			var filename = path.join(__dirname, '/fixtures/input.html');

			var input = new gutil.File({
				base: path.dirname(filename),
				path: filename,
				contents: new Buffer(fs.readFileSync(filename, 'utf8'))
			});

			var stream = smoosher();

			stream.on('data', function(newFile) {
				assert.equal(String(newFile.contents), fs.readFileSync(path.join(__dirname, '/fixtures/output.html'), 'utf8'));
				done();
			});

			stream.write(input);

		});

		it('should skip non-local urls', function(done) {
			var filename = path.join(__dirname, '/fixtures/remote.html');

			var input = new gutil.File({
				base: path.dirname(filename),
				path: filename,
				contents: new Buffer(fs.readFileSync(filename, 'utf8'))
			});

			var stream = smoosher();
			stream.on('data', function(newFile) {
				assert.equal(String(newFile.contents), fs.readFileSync(path.join(__dirname, '/fixtures/remote-output.html'), 'utf8'));
				done();
			});

			stream.write(input);
		});

		it('should support scripts that contain html strings', function(done) {
			var filename = path.join(__dirname, '/fixtures/html-script.html');

			var input = new gutil.File({
				base: path.dirname(filename),
				path: filename,
				contents: new Buffer(fs.readFileSync(filename, 'utf8'))
			});

			var stream = smoosher();
			stream.on('data', function(newFile) {
				assert.equal(String(newFile.contents), fs.readFileSync(path.join(__dirname, '/fixtures/html-script-output.html'), 'utf8'));
				done();
			});

			stream.write(input);
		});

		it('should support custom tags', function(done) {

			var filename = path.join(__dirname, '/fixtures/input.html');

			var input = new gutil.File({
				base: path.dirname(filename),
				path: filename,
				contents: new Buffer(fs.readFileSync(filename, 'utf8'))
			});

			var stream = smoosher({
				cssTags: {
					begin: '<p:style>',
					end: '</p:style>'
				},
				jsTags: {
					begin: '<p:script>',
					end: '</p:script>'
				}
			});

			stream.on('data', function(newFile) {
				assert.equal(String(newFile.contents), fs.readFileSync(path.join(__dirname, '/fixtures/output-customtags.html'), 'utf8'));
				done();
			});

			stream.write(input);

		});

	});

});