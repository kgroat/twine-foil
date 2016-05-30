var $ = require('jquery');

function plugin(){
  this.requestStyle('https://twine-foil.herokuapp.com/dist/plugins/bootstrap/css/bootstrap.min.css');
  this.requestScript('https://twine-foil.herokuapp.com/dist/plugins/bootstrap/js/bootstrap.min.js', { jQuery: $ });
  $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">');
  $('#output').addClass('container');
}

plugin.pre = [];

module.exports = plugin;