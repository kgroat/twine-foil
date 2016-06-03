var define = require('../definer').define.raw;

var Extender = require('../helpers/extender');

function Stylesheet(options){
  options = options || {};
  
  this.id = options.id || 0;
  this.name = options.name || '';
  this.tags = options.tags || [];
  this.text = options.text || '';
}

Script.prototype.render = function(){
  var fullText = '<style>'+this.text+'</style>';
  return $(fullText);
}

Stylesheet = Extender(Stylesheet);

module.exports = Stylesheet;
define('stylesheet.class', Stylesheet);