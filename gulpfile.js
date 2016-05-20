// 'use strict';
//
// var del = require('del');
// var gulp = require('gulp');
// var concat = require('gulp-concat');
// var uglify = require('gulp-uglify');
// var ngAnnotate = require('gulp-ng-annotate');
// var rename = require('gulp-rename');
// var gulpUtil = require('gulp-util');
// var flatten = require('gulp-flatten');
// var sass = require('gulp-sass');
//
// gulp.task('clean', function(cb){
//   del(['public/**/*']);
//   cb();
// })
//
// gulp.task('js', ['clean'], function(cb){
//   gulp.src(['client/*.js', 'client/app/**/*.js', 'client/components/**/*.js'])
//   .pipe(concat('bundle.js'))
//   .pipe(gulp.dest('public/js'));
//   cb()
// })
