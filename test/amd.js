"use strict";

var assert = require('assert')
var wrapup = require('../lib/main')
var test   = require('./run').testFiles

var wrup = wrapup()

wrup.options({
    output: __dirname + "/output/amd-result",
    path: __dirname + "/fixtures"
})

wrup.on("error", function(err){
    assert.fail(err, undefined, "no errors should occur")
})

wrup.require(__dirname + '/fixtures/h').amd(function(err){
    assert.ifError(err)
    test('amd', __dirname + '/output/amd-result/h.js', __dirname + '/output/amd/h.js')
})
