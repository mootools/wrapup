"use strict";

var expect = require('expect.js')
var path = require('path')
var OutputMock = require('./mocks/output')

var WrapUp = require('../../lib/wrapup')
var Module = require('../../lib/module')

var fixtures = __dirname + '/../fixtures'

describe('WrapUp', function(){

    it('should wrapup', function(done){
        var wrapup = new WrapUp()
        var output = new OutputMock()
        wrapup
            .withOutput(output)
            .require(fixtures + '/f/i')
            .require('ee', fixtures + '/e')
            .up(function(err, result){
                var modules = output.getModules()
                expect(modules).to.eql([
                    'f/i.js',
                    'e.js',
                    'h.js',
                    'f/index.js',
                    'f/g.js'
                ].map(function(mod){
                    return path.normalize(fixtures + '/' + mod)
                }))
                done()
            })
    })

    it('should set the namespace property, when it is set in the require() method', function(done){
        var wrapup = new WrapUp()
        var output = new OutputMock()
        wrapup
            .withOutput(output)
            .require('ee', fixtures + '/e')
            .up(function(err, result){
                var modules = output.getModules()
                expect(output.getModule(modules[0]).namespace).to.be('ee')
                done()
            })
    })

    it('should error when usign the same namespace twice', function(done){
        var wrapup = new WrapUp()
        wrapup
            .require('ee', 'a')
            .require('ee', 'b')
            .up(function(err){
                expect(err).to.be.ok()
                done()
            })
    })

    it('should error when no modules are required', function(done){
        var wrapup = new WrapUp()
        wrapup
            .up(function(err){
                expect(err).to.be.ok()
                done()
            })
    })

    it('should cleanup the storage', function(done){
        var wrapup = new WrapUp()
        var storage = wrapup.storage
        var foo = new Module('foo')
        var bar = new Module('bar')
        storage.put(foo).put(bar)
        var output = new OutputMock()
        wrapup
            .withOutput(output)
            .require(fixtures + '/e')
            .up(function(){
                var modules = storage.keys()
                expect(modules).to.eql([path.normalize(fixtures + '/e.js')])
                done()
            })
    })

    it('should unrequire some module', function(done){
        var wrapup  = new WrapUp()
        var storage = wrapup.storage
        var output  = new OutputMock()
        wrapup
            .withOutput(output)
            .require(fixtures + '/e')
            .require(fixtures + '/f/g')
            .up(function(err){
                if (err) return done(err)

                var modules = storage.keys()
                expect(modules).to.eql([
                   path.normalize(fixtures + '/e.js'),
                   path.normalize(fixtures + '/f/g.js')
                ])

                wrapup
                    .unrequire(fixtures + '/e')
                    .up(function(err){
                        if (err) return done(err)

                        var modules = storage.keys()
                        expect(modules).to.eql([
                           path.normalize(fixtures + '/f/g.js')
                        ])

                        done()
                    })
            })

    })

})
