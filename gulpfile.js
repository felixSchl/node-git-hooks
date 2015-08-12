'use strict';

var gulp = require('gulp')
  , sourcemaps = require('gulp-sourcemaps')
  , babel = require('gulp-babel');

gulp.task('default', function () {
  return gulp.src(['src/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(babel({ optional: ['runtime'] }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['default'], function () {
  gulp.watch('./src/**/*', ['default']);
});
