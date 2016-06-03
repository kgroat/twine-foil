
var $ = require('jquery');
var define = require('../definer').define.raw;
var scriptHelpers = require('../helpers/scriptHelpers');

var Extender = require('../helpers/extender');

function Script(options){
  options = options || {};
  
  this.id = options.id || 0;
  this.name = options.name || '';
  this.tags = options.tags || [];
  this.text = options.text || '';
}

Script.prototype.exists = function($el){
  $el = $el || $(document);
  return scriptHelpers.getExisting($el, this.name).length > 0;
}

Script.prototype.render = function(){
  var fullText = scriptHelpers.build(this.text, this.name, './'+this.name);
  return $(fullText);
}

Script = Extender(Script);

module.exports = Script;
define('script.class', Script);