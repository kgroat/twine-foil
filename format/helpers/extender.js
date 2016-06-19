var _ = require('underscore');
var define = require('../definer').define.raw;

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '');
  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if(result === null)
    result = [];
  return result;
}

function Extender(OldType){
  var map = new Map();

  function getExtended(name, original){
    if(typeof original !== 'function' || !(map.has(name))){
      return original;
    }

    var resultStrategy = original.resultStrategy || defaultResultStrategy;

    function callExtended(){
      var target = this;
      var calledArgs = [];
      calledArgs.push.apply(calledArgs, arguments);
      var extensions = map.get(name);
      var i=0;
      var output, extOuts = [];
      
      function callNext(){
        if(i >= extensions.length) {
          output = original.apply(target, calledArgs);
          return output;
        }
        var hasBeenCalled = false;
        var nextResult;
        function next(){
          if(hasBeenCalled){ return nextResult; }
          hasBeenCalled = true;
          i++;
          return nextResult = callNext()
        }
        var newArgs = calledArgs.slice(0, calledArgs.length);
        newArgs.splice(0, 0, next);
        extOuts.push(extensions[i].apply(target, newArgs));
        next();
        return resultStrategy(output, extOuts);
      }
      return callNext();
    }
    
    return callExtended;
  }
  
  var extenderProxy = {
    get: function(target, key){
      var original = target[key];
      if(typeof original === 'function'){
        return getExtended(key, original);
      }
      return original;
    },
    set: function(target, key, val){
      return target[key] = val;
    }
  }
  
  var originalParams = getParamNames(OldType);
  
  var NewType = eval('(function(){'+
                        'return function '+OldType.name+'('+originalParams.join(', ')+'){'+
                          'var self = new Proxy(this, extenderProxy);'+
                          'getExtended("constructor", OldType).apply(self, arguments);'+
                          'return self;'+
                        '}'+
                      '})()');
                     
  NewType.addExtension = function(key, func){
    if(typeof func !== 'function') {
      throw new Error('Extension must be a function.  Instead got ' + typeof func);
    }
    var list;
    if(!map.has(key)){
      map.set(key, list=[]);
    } else {
      list = map.get(key);
    }
    list.splice(0, 0, func);
    return this;
  }
  
  NewType.prototype = Object.create(OldType.prototype);
  
  return NewType;
}

function defaultResultStrategy(originalOutput, extensionOutputs){
  return originalOutput || extensionOutputs.reduce(function(lastOut, currOut){ return currOut || lastOut; }, null);
}

function latestResultStrategy(originalOutput, extensionOutputs){
  return extensionOutputs.reduce(function(lastOut, currOut){ return currOut || lastOut; }, null) || originalOutput;
}

function earliestResultStrategy(originalOutput, extensionOutputs){
  return originalOutput || extensionOutputs.reduce(function(lastOut, currOut){ return lastOut || currOut; }, null);
}

function earliestBesidesOriginalResultStrategy(originalOutput, extensionOutputs){
  return extensionOutputs.reduce(function(lastOut, currOut){ return lastOut || currOut; }, null) || originalOutput;
}

Extender.strategies = {
  default: defaultResultStrategy,
  latest: latestResultStrategy,
  earliest: earliestResultStrategy,
  earliestBesidesOriginal: earliestBesidesOriginalResultStrategy
};

module.exports = Extender;
define('extender', Extender);
