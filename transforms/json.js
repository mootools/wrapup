"use strict";

exports.src = function(module, callback){
    if (/\.json$/.test(module.full)){
        module.src = 'module.exports = ' + module.src
    }
    callback(null, module)
}
