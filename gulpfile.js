var gulp = require('gulp'),
  useref = require('gulp-useref'),
  gulpif = require('gulp-if'),
  uglify = require('gulp-uglify'),
  minifyCss = require('gulp-minify-css'),
  del = require('del');

gulp.task('html', function () {
  return gulp.src('test/*.html')
    .pipe(useref())
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulpif('*.css', minifyCss()))
    .pipe(gulp.dest('build'));
});

gulp.task('clean', function(cb) {
	del(['build/'], cb);
});

gulp.task('fonts', function () {
  return gulp.src('bower_components/bootstrap/fonts/*.{eot,svg,ttf,woff,woff2}')
    .pipe(gulp.dest('build/fonts/'));
});

gulp.task('build', ['html', 'fonts']);

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});