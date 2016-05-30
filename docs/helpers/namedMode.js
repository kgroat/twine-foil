
function namedMode(rgx){
  return function(base, files, config){
    var mods = files.map(function(file){
      var name;
      var match = rgx.exec(file);
      if(match){
        name = match[1];
      } else {
        name = file.replace(/[.\/_]/g, '');
      }
      return '{ mod: require("' + file + '"), name: "' + name + '" }';
    });
    return '[' + mods.join(', ') + ']';
  }
}

module.exports = namedMode;
