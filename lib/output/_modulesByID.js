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

        var _path = (this._options.path ?
            this._options.path :
            process.cwd()) + '/a'

        prime.each(this.modules, function(module, full){
            byID[module.uid] = module
            var file = util.relativeID(_path, full)
            // rename modules if the files are out of scope
            if (file.slice(0, 2) == '..'){
                self.wrup.emit("warn", new errors.OutOfScopeError(full))
                file = '__oos/' + (uid++) + '-' + path.basename(full)
                if (path.extname(file) == '.js') file = file.slice(0, -3)
            }
            module.fileID = file.slice(0, 2) == './' ? file.slice(2) : file
            module.file = file + '.js'
        })
        return byID
    }

})
