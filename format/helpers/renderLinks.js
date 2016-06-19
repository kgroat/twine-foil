
var define = require('../definer').define.raw;

function renderLinks(input, replacer){
  return input.replace(/\[\[(.*?)\]\]/gi, replacer || renderSingleLink)
}

function renderSingleLink(link, contents){
  var passage, text, id;
  var match;
  if(match = /^(.*?)(?:#(\w+))?(?:->|\|)(.*?)$/.exec(contents)){
    text = match[1];
    passage = match[3];
    id = match[2] || '';
  } else if(match = /^(.*?)<-(.*?)(?:#(\w+))?$/.exec(contents)){
    text = match[2];
    passage = match[1];
    id = match[3] || '';
  } else {
    passage = text = contents;
    id = '';
  }
  return '<a id="'+id+'" href="javascript:definer(\'story\').show(\''+passage+'\')" data-passage="'+passage+'">'+text+'</a>';
}

renderLinks.single = renderSingleLink;

module.exports = renderLinks;
define('renderLinks', renderLinks);
