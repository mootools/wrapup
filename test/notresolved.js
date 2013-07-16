"use strict";

var assert = require('assert')
var test   = require('./run').test
var wrup   = require('../lib/main')({
    output: __dirname + '/output/notresolved.result.js'
})

var warnings = 0
wrup.scanner.on("warn", function(){
    warnings++
})

wrup.require(__dirname + '/fixtures/a').up(function(err){
    assert.ifError(err)
    assert.equal(2, warnings, "there are " + warnings + ", but should be 2")
    test('notresolved')
})
