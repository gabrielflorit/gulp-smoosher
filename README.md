# gulp-smoosher [![NPM version][npm-image]][npm-url] [![Build status][travis-image]][travis-url]
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


## Notes

If you use [grunt](http://gruntjs.com) instead of gulp, but want to perform a similar task, use [grunt-html-smoosher](https://github.com/motherjones/grunt-html-smoosher).


## License

MIT © [Gabriel Florit](http://gabrielflor.it)

[travis-url]: https://travis-ci.org/gabrielflorit/gulp-smoosher
[travis-image]: https://travis-ci.org/gabrielflorit/gulp-smoosher.png
[npm-url]: https://npmjs.org/package/gulp-smoosher
[npm-image]: https://badge.fury.io/js/gulp-smoosher.png

