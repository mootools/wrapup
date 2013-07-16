"use strict";

var assert = require('assert')
var test   = require('./run').test
var wrup   = require('../lib/main')({
    output: __dirname + '/output/globalize.result.js',
    globalize: "this"
})

wrup.require("testing", __dirname + '/fixtures/e').up(function(err){
    assert.ifError(err)
    test('globalize')
})
