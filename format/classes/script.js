
var $ = require('jquery');
var define = require('../definer').define.raw;
var scriptHelpers = require('../helpers/scriptHelpers');

function Script(options){
  options = options || {};
  
  this.id = options.id || 0;
  this.name = options.name || '';
  this.tags = options.tags || [];
  this.text = options.text || '';
}

Script.prototype.exists = function($el){
  $el = $el || $('head');
  return scriptHelpers.getExisting($el).length > 0;
}

Script.prototype.render = function(){
  var script = this;
  var fullText = scriptHelpers.build(this.text, this.name, this.name);
  return $(fullText);
}

module.exports = Script;
define('script.class', Script);