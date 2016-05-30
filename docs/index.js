var $ = require('jquery');
window.jQuery = $;
window.$ = $;
require('bootstrap');
//delete window.jQuery;

var Backbone = require('backbone');

var app = require('./app');
var AppRouter = require('./router');

app.on('start', function() {
  app.router = new AppRouter();
  app.router.on('route', function(name, path, arguments){
    app.getHeaderView().triggerMethod('route', name, path, arguments);
  })
  Backbone.history.start();
});

$(document).ready(function(){
  app.start();
});

window._ = require('underscore');