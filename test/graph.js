"use strict";

var assert   = require('assert')
var test     = require('./run')
var passed   = test.passed
var readFile = test.readFile
var diff     = require('ansidiff')

var wrup = require('../lib/main')({
    graph: true
})

wrup.require(__dirname + '/fixtures/b').up(function(err, actual){
    assert.ifError(err)
    var should = readFile(__dirname + '/output/graph.dot')
    try {
        assert.equal(should, actual, "the generated dot should be equal")
    } catch (e){
        console.log(diff.words(should, actual));
        throw e
    }
    passed("graph")
})
