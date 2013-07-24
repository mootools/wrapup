"use strict";

var expect = require('expect.js')

var Storage = require('../../../lib/moduleStorage')
var Output = require('../../../lib/output/ascii')
var Module = require('../../../lib/module')

describe('output/ASCII', function(){

    it('should format the required modules and dependencies as text', function(done){

        var storage = new Storage()
        var a = new Module('a'), e = new Module('e')
        a.dependencies = [new Module('b'), new Module('c'), new Module('d')]
        e.namespace = 'eee'
        e.dependencies = [new Module('f'), new Module('g')]
        storage.put('a', a).put('e', e)

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
