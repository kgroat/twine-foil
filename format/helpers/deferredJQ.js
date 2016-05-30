var $ = require('jquery');
var define = require('../definer').define.raw;
var isHtml = require('./isHtml');

function DeferredJQ(){
  if(!(this instanceof DeferredJQ)){
    return new DeferredJQ();
  }
  var self = this;
  var count = 0;
  var decrementCount;
  var failImmediate;
  
  var countPromise = new Promise(function(resolve, reject){
    decrementCount = function(){
      if(--count === 0){
        resolve(undefined);
      }
    };
    failImmediate = function(err){
      reject(err);
      return Promise.reject(err);
    }
  })
  
  function deferred(promise){
    var isResolved = false;
    var resolvedValue = function() { return $() };
    
    promise.then(function($el){
      isResolved = true;
      resolvedValue = $el;
    });
    var output = (isResolved ? resolvedValue : new Proxy(resolvedValue, {
      isDeferredJQ: true,
      getPromise: function(){
        return promise;
      },
      get: function(target, key) {
        if(Object.prototype.hasOwnProperty(key)){ return resolvedValue[key]; }
        if(typeof key === 'symbol'){
          if(resolvedValue[key]){ return resolvedValue[key]; }
          switch(key){
            case Symbol.toStringTag: return resolvedValue.toString();
          }
        }
        if(isResolved) { return resolvedValue[key]; }
        
        count++;
        var getOut = deferred(promise.then(function(resolved){
          decrementCount();
          return resolved[key];
        }, failImmediate));
        return getOut;
      },
      set: function(target, key, value){
        count++;
        return deferred(promise.then(function(resolved){
          decrementCount()
          return resolved[key] = value;
        }, failImmediate));
      },
      apply: function(target, thisArg, argumentsList){
        count++;
        return deferred(promise.then(function(resolved){
          var promises = [];
          _.each(argumentsList, function(arg, i){
            if(arg.isDeferredJQ){
              promises.push(arg.getPromise().then(function(p){ return {p: p, i: i} }))
            }
          });
          if(promises.length > 0){
            return Promise.all(promises).then(function(newArgs){
              _.each(newArgs, function(arg){
                argumentsList[arg.i] = arg.p;
              });
              return callResolved();
            });
          } else {
            return callResolved();
          }
          
          function callResolved(){
            decrementCount();
            if(typeof resolved === 'function'){
              return resolved.apply(thisArg, argumentsList);
            }
            throw Promise.reject(new Error((typeof resolved) + ' ' + resolved + ' is not a function.'));
          }
          
        }, failImmediate));
      },
      has: function (target, key) {
        return key in resolvedValue || resolvedValue.hasItem(key);
      }
    }));
    return output;
  }
  
  var queryPromise = new Promise(function(resolve, reject){
    self.apply = function($el){
      resolve($el);
      return countPromise;
    };
    self.cancel = function(err){
      reject(err);
      return countPromise;
    };
  })
  
  this.$ = function jqlite(selector){
    return deferred(queryPromise.then(function($el){
      if(typeof selector !== 'string' || isHtml(selector)){
        return $(selector);
      }
      return $el.find(selector);
    }));
  }
  return this;
}

module.exports = DeferredJQ;
define('deferredJQ', DeferredJQ);