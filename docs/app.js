var Marionette = require('backbone.marionette');
var Backbone = require('backbone');
var RootView = require('./views/_root/root');

var app = new Marionette.Application({
  initialize: function(){
    this.rootView = new RootView();
  },
  getHeader: function(){
    return this.rootView.getHeader();
  },
  getHeaderView: function(){
    return this.getHeader().currentView;
  },
  getMain: function(){
    return this.rootView.getMain();
  },
  getMainView: function(){
    return this.getMain().currentView;
  },
  getFooter: function(){
    return this.rootView.getFooter();
  },
  getFooterView: function(){
    return this.getFooter().currentView;
  },
});

window.app = app;
module.exports = app;
