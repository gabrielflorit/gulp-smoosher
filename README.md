# gulp-smoosher [![Build Status](https://travis-ci.org/gabrielflorit/gulp-smoosher.png?branch=master)](https://travis-ci.org/gabrielflorit/gulp-smoosher)
> Replaces css and js links with file contents

## Install

Install with [npm](https://npmjs.org/package/gulp-smoosher)

```
npm install --save-dev gulp-smoosher
```


## Example

### `index.html`

```html
<html>
	<head>
		<!-- smoosh -->
		<link rel='stylesheet' href='styles.css'>
		<!-- endsmoosh -->
	</head>
...
```

### `styles.css`

```css
body {
	background: red;
}
```

### `Gulpfile.js`

```js
var gulp = require('gulp');
var smoosher = require('gulp-smoosher');

gulp.task('default', function () {
	gulp.src('index.html')
		.pipe(smoosher())
		.pipe(gulp.dest('dist'));
});
```

### `dist/index.html`

```html
<html>
	<head>
		<style>body {
			background: red;
		}</style>
	</head>
...
```

## Options

### Custom js/css tags
Pass in custom js/css tags, if so desired. Example:

```js
var gulp = require('gulp');
var smoosher = require('gulp-smoosher');

gulp.task('default', function () {
	gulp.src('index.html')
		.pipe(smoosher({
			cssTags: {
				begin: '<p:style>',
				end: '</p:style>'
			},
			jsTags: {
				begin: '<p:script>',
				end: '</p:script>'
			}
		}))
		.pipe(gulp.dest('dist'));
});
```

will result in the following:

```html
<html>
	<head>
		<p:style>body {
			background: red;
		}</p:style>
		<p:script>alert('Hello world!');</p:script>
	</head>
...
```
### Custom `base` dir
Say your `index.html` is still in your `src/` directory and files you intend to smoosh are already written to your `dist/`. In this case, specify a custom `base` to resolve your files from.

```js
gulp.task('default', ['minifyCss', 'uglifyJs'], function () {
	gulp.src('src/index.html')
		.pipe(smoosher({
			base: 'dist'
		}))
		.pipe(gulp.dest('dist'));
});
```

### Ignore files not found
When the option `ignoreFilesNotFound` is true the plugin will keep running even if it finds a nonexistent file:

```js
gulp.task('default', function () {
	gulp.src('src/index.html')
		.pipe(smoosher({
			ignoreFilesNotFound: true
		}))
		.pipe(gulp.dest('dist'));
});
```


## Notes

If you use [grunt](http://gruntjs.com) instead of gulp, but want to perform a similar task, use [grunt-html-smoosher](https://github.com/motherjones/grunt-html-smoosher).

## Contributors

- Gabriel Florit
- Andrew Shaffer
- Jackson Ray Hamilton

## License

MIT © [Gabriel Florit](http://gabrielflorit.github.io/)
