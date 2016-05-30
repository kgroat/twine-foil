var templates = require('../../tmp/templates.js');
var _ = require('underscore');

function loadTemplate(templateName){
  var templateString = templates[templateName];
  if(typeof templateString === 'undefined'){
    throw new Error('Template "'+templateName+'" does not exist.');
  }
  return _.template(templateString);
}

module.exports = loadTemplate;