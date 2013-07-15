"use strict";

var expect = require('expect.js')

var Storage = require('../../../lib/moduleStorage')
var Output = require('../../../lib/output/ascii')


describe('output/ASCII', function(){

    it('should format the required modules and dependencies as text', function(done){

        var storage = new Storage()
        storage.put('a', {
            deps: [{full: 'b'}, {full: 'c'}, {full: 'd'}]
        }).put('e', {
            namespace: 'eee',
            deps: [{full: 'f'}, {full: 'g'}]
        })

        var output = new Output()
        output.withStorage(storage)

        output.up(function(err, str){
            expect(str).to.equal([
                'a',
                '├─b',
                '├─c',
                '└─d',
                'e (eee)',
                '├─f',
                '└─g',
                ''
            ].join('\n'))
            done()
        })

    })

})
