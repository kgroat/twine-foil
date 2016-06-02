var define = require('../definer').define.raw;

var Extender = require('../helpers/extender');

var functionRgx = /^##function (.*?)\((.*?)\)\{(.*)\}$/

function State(options){
  this._attributes = options || {};
}

State.prototype.keys = function(){
  return Object.keys(this._attributes);
}

State.prototype.has = function(name){
  return this._attributes.hasOwnProperty(name) && this._attributes[name] != undefined;
}

State.prototype.get = function(name){
  return this._attributes[name];
}

State.prototype.set = function(name, value){
  if(typeof value === 'function'){
    throw new Error('State cannot store function-typed object '+value.toString());
  }
  if(typeof value === 'symbol'){
    throw new Error('State cannot store symbol-typed object '+value.toString());
  }
  return this._attributes[name] = value;
}

State.prototype.delete = function(name){
  return delete this._attributes[name];
}

State.prototype.clear = function(){
  for(var key in this._attributes){
    if(this._attributes.hasOwnProperty(key)){
      delete this._attributes[key];
    }
  }
}

State.prototype.toJSON = function(){
  return this._attributes;
}

State = Extender(State);

module.exports = State;
define('state.class', State);