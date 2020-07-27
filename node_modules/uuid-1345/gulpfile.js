/* vim: set et sw=2 ts=2: */
/* jshint node: true */
"use strict";

const { series, src, dest } = require('gulp');
const jshint = require('gulp-jshint');
const mocha = require('gulp-mocha');

function hint() {
  return src(['index.js', 'test/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
}

function test(cb) {
  return src('test/*.js')
    .pipe(mocha());
}

exports.test = series(hint, test);
exports.default = exports.test;
