'use strict'

// Globals
var gulp = require('gulp')
var $ = require('gulp-load-plugins')()

const rollUpBuble = require('rollup-plugin-buble')
const rollUpCommonjs = require('rollup-plugin-commonjs')
const rollUpNodeResolve = require('rollup-plugin-node-resolve')
const rollUpNodebuiltins = require('rollup-plugin-node-builtins')

var name = 'aph'

// Tasks
gulp.task('lint', function () {
  return gulp.src(['src/*.js'])
      .pipe($.eslint())
      .pipe($.eslint.format())
})

gulp.task('build', function () {
  return gulp.src('./src/aph.js')
    .pipe($.plumber())
    .pipe($.betterRollup({
      plugins: [
        // Allow to import node builtin modules such as path, url, querystring, etc
        rollUpNodebuiltins(),
        // Allow to import modules from the `node_modules`
        rollUpNodeResolve({
          module: true,
          jsnext: true,
          main: true,
          browser: true,
          extensions: ['.js'],
          preferBuiltins: true,
        }),
        // Transforms CommonJS modules into ES6 modules for RollUp
        rollUpCommonjs(),
        // Transpiles the code, ignoring coniguration from the `node_modules`
        rollUpBuble({
          transforms: {
            arrow: true,
            dangerousForOf: true,
          },
        }),
      ],
    }, {
      format: 'umd',
    }))
    .pipe($.rename(name + '.js'))
    .pipe($.size({
      showFiles: true,
    }))
    .pipe(gulp.dest('./dist/'))
})

gulp.task('minify', ['lint', 'build'], function () {
  return gulp.src(['./dist/' + name + '.js'])
    .pipe($.plumber())
    .pipe($.uglify())
    .pipe($.rename(name + '.min.js'))
    .pipe($.size({ showFiles: true }))
    .pipe($.size({
      gzip: true,
      showFiles: true,
    }))
    .pipe(gulp.dest('./dist/'))
})

gulp.task('watch', function () {
  gulp.watch(['src/*.js'], ['minify'])
})

gulp.task('default', ['minify'])
