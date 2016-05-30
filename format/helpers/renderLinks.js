
var define = require('../definer').define.raw;

function renderLinks(input){
  return input.replace(/\[\[(.*?)\]\]/gi, function(link, contents){
    var passage, text, id;
    var match;
    if(match = /^(.*?)(?:->|\|)(.*?)(?:#(\w+))?$/.exec(contents)){
      text = match[1];
      passage = match[2];
      id = match[3] || '';
    } else if(match = /^(.*?)<-(.*?)(?:#(\w+))?$/.exec(contents)){
      text = match[2];
      passage = match[1];
      id = match[3] || '';
    } else {
      passage = text = contents;
    }
    return '<a id="'+id+'" href="javascript:definer(\'story\').show(\''+passage+'\')" data-passage="'+passage+'">'+text+'</a>';
  })
}

module.exports = renderLinks;
define('renderLinks', renderLinks);
