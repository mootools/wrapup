"use strict";

var fs     = require('fs')
var assert = require('assert')
var passed = require('./run').passed
var diff   = require('ansidiff')

var wrup = require('../lib/main')({
    graph: true
})

wrup.require(__dirname + '/fixtures/b').up(function(err, actual){
    assert.ifError(err)
    var should = fs.readFileSync(__dirname + '/output/graph.dot', 'utf-8')
    try {
        assert.equal(should, actual, "the generated dot should be equal")
    } catch (e){
        console.log(diff.words(should, actual));
        throw e
    }
    passed("graph")
})
