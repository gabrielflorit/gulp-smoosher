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

## Extended example

### `index.html`

```html
<html>
	<head>
		<!-- smoosh -->
		<link rel='stylesheet' href='styles.css'>
		<!-- endsmoosh -->
	</head>
	<body>
		<!-- smoosh -->
		<smoosh data="file.txt"> </smoosh>
		<!-- endsmoosh -->
...
```

### `styles.css`

```css
body {
	background: red;
}
```
### `file.txt`
```text
Hello World!
```

### `Gulpfile.js`

```js
var gulp = require('gulp');
var smoosher = require('gulp-smoosher');

gulp.task('default', function () {
	gulp.src('index.html')
		.pipe(smoosher({"minify":true,"pathtag":true}))
		.pipe(gulp.dest('dist'));
});
```

### `dist/index.html`

```html
<html>
	<head>
		<style smoosh="styles.css">body{background:red;}</style>
	</head>
	<body>
	Hello World!
...
```


## Notes

If you use [grunt](http://gruntjs.com) instead of gulp, but want to perform a similar task, use [grunt-html-smoosher](https://github.com/motherjones/grunt-html-smoosher).


## License

MIT © [Gabriel Florit](http://gabrielflor.it)