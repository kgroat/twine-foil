
var define = require('../definer').define;

function getExistingScript($el, url){
  return $el.find('script[title="' + url + '"]');
}

function buildScript(original, url, name, allowDefine){
  window.define = define;
  var output = $(
    '<script title="' + url + '">'+
      '(function(){\n'+
        'var exports = {};\n'+
        'var module = {exports:exports};\n'+
        'var require = window.definer;\n'+
        (allowDefine ? 'var define = window.definer.raw;\n' : '')+
        original + '\n'+
        (name ? 'window.define("'+name+'", module)\n' : '')+
      '})()\n//# sourceURL=' + url+
    '</script>');
  delete window.define;
  return output;
}

var scriptHelpers = {
  getExisting: getExistingScript,
  build: buildScript
};

module.exports = scriptHelpers;
define.raw('scriptHelpers', scriptHelpers);
