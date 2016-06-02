
var define = require('../definer').define.raw;

var Extender = require('../helpers/extender');

function History(options){
  this._stack = options || [];
}

History.prototype.push = function(passageName, parameters){
  return this._stack.push({ name: passageName, params: parameters });
}

History.prototype.pop = function(){
  return this._stack.pop();
}

History.prototype.peek = function(){
  var row = this._stack[this._stack.length - 1];
  return { name: row.name, params: row.params };
}

History.prototype.any = function(){
  return this._stack.length > 0;
}

History.prototype.count = function(){
  return this._stack.length;
}

History.prototype.back = function(){
  this.pop();
  return this.peek();
}

Script = Extender(History);

module.exports = History;
define('history.class', History);