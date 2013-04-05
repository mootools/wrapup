"use strict";

var path   = require('path')
var prime  = require('prime')
var util   = require('../util')
var errors = require('../errors')

var uid = 0;

module.exports = prime({

    modulesByID: function(){
        var byID = {}
        var self = this
        prime.each(this.modules, function(module, full){
            byID[module.uid] = module
            /* TODO make this configurable */
            var file = util.relativeID(process.cwd(), full)
            // rename modules if the files are out of scope
            if (file.slice(0, 2) == '..'){
                self.wrup.emit("warn", new errors.OutOfScopeError(full))
                file = '__oos/' + (uid++) + '-' + path.basename(full)
                if (path.extname(file) == '.js') file = file.slice(0, -3)
            }
            module.fileID = file
            module.file = file + '.js'
        })
        return byID
    }

})
