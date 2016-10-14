var $ = {};

var gulp = require('gulp');

$.useref = require('gulp-useref');
$.rev = require('gulp-rev');
$.if = require('gulp-if');
$.uglify = require('gulp-uglify');
$.minifyCss = require('gulp-minify-css');
$.minifyHtml = require('gulp-minify-html');
$.revReplace = require('gulp-rev-replace');
$.del = require('del');

gulp.task('html', function () {
  return gulp.src('test/*.html')
    .pipe($.useref())
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.minifyCss()))
    .pipe($.if('*.js', $.rev()))
    .pipe($.if('*.css', $.rev()))
    .pipe($.if('*.html', $.minifyHtml({ empty: true })))
    .pipe($.revReplace())
    .pipe(gulp.dest('docs'));
});

gulp.task('clean', function (done) {
  return $.del(['docs/'], done);
});

gulp.task('fonts', function () {
  return gulp.src('bower_components/bootstrap/fonts/*.{eot,svg,ttf,woff,woff2}')
    .pipe(gulp.dest('docs/fonts/'));
});

// < gulp 4.0
// gulp.task('build', ['html', 'fonts']);

// gulp.task('default', ['clean'], function () {
// gulp.start('build');
// });

// gulp 4.0
gulp.task('build', gulp.parallel('html', 'fonts'));

gulp.task('default', gulp.series('clean', 'build'));
