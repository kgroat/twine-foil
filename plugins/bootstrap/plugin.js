var $ = require('jquery');

function plugin(){
  this.requestStyle('https://foil.kevingroat.io/dist/plugins/bootstrap/css/bootstrap.min.css');
  this.requestScript('https://foil.kevingroat.io/dist/plugins/bootstrap/js/bootstrap.min.js', { jQuery: $ });
  $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">');
  $('#output').addClass('container');
  var Passage = require('passage.class');
  Passage.addExtension('renderSingleLink', function(next){
    var $link = $(next());
    $link.addClass('btn btn-default');
    return $link[0].outerHTML;
  })
}

plugin.pre = [];

module.exports = plugin;