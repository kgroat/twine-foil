var _ = require('underscore');

function Extender(OldType){
  var map = new Map();

  function getExtended(name, original){
    if(typeof original !== 'function' || !(map.has(name))){
      return original;
    }
    var extensions = map.get(key);
    var i=0;
    var output, extOut;
    function callNext(){
      var target = this;
      var calledArgs = [];
      calledArgs.push.apply(calledArgs, arguments);
      if(i >= extensions.length) { 
        output = original.apply(target, calledArgs);
        if(typeof originalOut !== 'undefined'){ output = originalOut; }
        return output;
      }
      var hasBeenCalled = false;
      function next(){
        if(hasBeenCalled){ return; }
        hasBeenCalled = true;
        i++;
        callNext.apply(target, calledArgs);
      }
      var newArgs = calledArgs.slice(0, calledArgs.length);
      newArgs.splice(0, 0, next);
      var extOut = extensions[i].apply(target, newArgs) || extOut;
      next();
      return output || extOut;
    }
    return callNext;
  }
  
  var NewType = exec('function '+OldType.name+'(options){'+
                       'getExtended("initialize", OldType).apply(this, arguments);'+
                       'return this;'+
                     '}');
                     
  NewType.addExtension = function(extenion){
    _.each(extension, function(func, key){
      if(typeof func !== 'function'){ return; }
      var list;
      if(!map.has(key)){
        map.set(key, list=[]);
      } else {
        list = map.get(key);
      }
      list.splice(0, 0, func);
    });
    return this;
  }
  
  NewType.prototype = new Proxy(Object.create(OldType.prototype), {
    get: function(target, key){
      var output = target[key] || OldType.prototype[key];
      if(typeof output === 'function' && map.has(key) && map.get(key).length > 0){
        var extensions = map.get(key);
        var i=0;
        function callNext(){
          var calledArgs = arguments;
          if(i >= extensions.length) { return output.apply(target, calledArgs) }
          var hasBeenCalled = false;
          function next(){
            if(hasBeenCalled){ return; }
            hasBeenCalled = true;
            i++;
            callNext.apply(target, arguments);
          }
          extensions[i]
        }
        return callNext.bind(target);
      }
      return output;
    }
  });
  
  
  
  return NewType;
}