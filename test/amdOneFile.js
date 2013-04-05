"use strict";

var assert = require('assert')
var wrapup = require('../lib/main')
var util   = require('../lib/util')
var test   = require('./run').test

var wrup = wrapup()

wrup.options({
    output: __dirname + "/output/amdOneFile.result.js"
})

wrup.on("error", function(err){
    assert.fail(err, undefined, "no errors should occur")
})

util.getAST('amdOneFile-wrapper')(function(err, wrapper){

    if (err) throw err

    wrapper = util.clone(wrapper)

    wrup.require(__dirname + '/fixtures/up').amdOneFile(function(err){
        assert.ifError(err)
        test('amdOneFile', null, function(should){
            wrapper.body.push.apply(wrapper.body, should.body)
            return wrapper
        })
    })

})

