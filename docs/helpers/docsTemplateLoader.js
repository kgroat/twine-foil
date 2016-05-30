var templates = require('../../tmp/templates.js');
var _ = require('underscore');
var $ = require('jquery');

function loadTemplate(templateName){
  var templateString = templates[templateName];
  if(typeof templateString === 'undefined'){
    throw new Error('Template "'+templateName+'" does not exist.');
  }
  var tmpDoc = $('<div>'+templateString+'</div>');
  var examples = tmpDoc.find('.example');
  examples.each(function(){
    var $example = $(this);
    var $content = $example.find('.example-content');
    var exampleContent = ($content.length > 0 ? $content.html() : $example.html());
    exampleContent = _.unescape(_.escape(exampleContent.replace(/&/g, '%AMP%')).replace(/%AMP%/g, '&'));
    exampleContent = '<pre class="example-code lang-html" data-lang="html">'+_.escape(_.escape(exampleContent.trim()))+'</pre>';
    
    if(!$example.is('.no-result')){
      var exampleText = $example.html();
      exampleText = _.unescape(_.escape(exampleText.replace(/&/g, '%AMP%')).replace(/%AMP%/g, '&'));
      exampleText = '<div class="panel-body example-result">'+exampleText+'</div>';
      exampleContent = exampleText + exampleContent;
    }
    
    $example.html(exampleContent);
    $example.addClass('panel panel-default');
  });
  templateString = _.unescape(tmpDoc.html());
  return _.template(templateString);
}

module.exports = loadTemplate;