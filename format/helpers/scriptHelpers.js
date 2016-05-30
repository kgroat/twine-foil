
var define = require('../definer').define.raw;

function getExistingScript($el, url){
  return $el.find('script[title="' + url + '"]');
}

function buildScript(original, url, name){
  return $(
    '<script title="' + url + '">'+
      '(function(){\n'+
        'var exports = {};\n'+
        'var module = {exports:exports};\n'+
        'var require = window.definer;\n'+
        original + '\n'+
        (name ? 'definer.define("'+name+'", module)\n' : '')+
      '})()\n//# sourceURL=' + url+
    '</script>');
}

var scriptHelpers = {
  getExisting: getExistingScript,
  build: buildScript
};

module.exports = scriptHelpers;
define('scriptHelpers', scriptHelpers);
