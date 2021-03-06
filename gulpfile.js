'use strict'

// Globals
var gulp = require('gulp')
var $ = require('gulp-load-plugins')()

var name = 'aph'

// Tasks
gulp.task('lint', function () {
  return gulp.src(['src/*.js']).pipe($.eslint()).pipe($.eslint.format())
})

gulp.task('build', function () {
  return gulp
    .src('./src/aph.js')
    .pipe($.plumber())
    .pipe(
      $.betterRollup({
        format: 'umd',
        moduleName: '$$',
      })
    )
    .pipe($.rename(name + '.js'))
    .pipe($.size({ showFiles: true }))
    .pipe(gulp.dest('./dist/'))
})

gulp.task('minify', ['lint', 'build'], function () {
  return gulp
    .src(['./dist/' + name + '.js'])
    .pipe($.plumber())
    .pipe($.butternut())
    .pipe($.rename(name + '.min.js'))
    .pipe($.size({ showFiles: true }))
    .pipe(
      $.size({
        gzip: true,
        showFiles: true,
        pretty: false,
      })
    )
    .pipe(gulp.dest('./dist/'))
})

gulp.task('watch', function () {
  gulp.watch(['src/*.js'], ['minify'])
})

gulp.task('default', ['minify'])
