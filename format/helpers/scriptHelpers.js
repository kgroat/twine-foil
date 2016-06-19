
var define = require('../definer').define.raw;

function getExistingScript($el, url){
  return $el.find('script[title="' + url + '"]');
}

function buildScript(original, url, name, allowDefine){
  return $(
    '<script title="' + url + '">'+
      '(function(){\n'+
        'var exports = {};\n'+
        'var module = {exports:exports};\n'+
        'var require = window.definer;\n'+
        (allowDefine ? 'var define = window.definer.define.raw;\n' : '')+
        original + '\n'+
        (name ? 'window.definer.define("'+name+'", module)\n' : '')+
      '})()\n//# sourceURL=' + url+
    '</script>');
}

var scriptHelpers = {
  getExisting: getExistingScript,
  build: buildScript
};

module.exports = scriptHelpers;
define('scriptHelpers', scriptHelpers);
