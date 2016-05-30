var define = require('../definer').define.raw;

function Stylesheet(options){
  options = options || {};
  
  this.id = options.id || 0;
  this.name = options.name || '';
  this.tags = options.tags || [];
  this.text = options.text || '';
}

module.exports = Stylesheet;
define('stylesheet.class', Stylesheet);