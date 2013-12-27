"use strict";

var assert = require('assert')
var wrapup = require('../lib/main')
var test   = require('./run').testFiles

var wrup = wrapup({
    output: __dirname + "/output/amd-result",
    path: __dirname + "/fixtures",
    amd: true
})

wrup.require(__dirname + '/fixtures/h').up(function(err){
    assert.ifError(err)
    test('amd', __dirname + '/output/amd-result/h.js', __dirname + '/output/amd/h.js')
    test('amd', __dirname + '/output/amd-result/f/g.js', __dirname + '/output/amd/f/g.js')
    test('amd', __dirname + '/output/amd-result/f/index.js', __dirname + '/output/amd/f/index.js')
})
