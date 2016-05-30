var Marionette = require('backbone.marionette');
var HeaderView = require('../header/header');
var FooterView = require('../footer/footer');

var RootView = Marionette.LayoutView.extend({
  el: 'html',
  regions: {
    'header': '#header',
    'main': '#main',
    'footer': '#footer'
  },
  initialize: function(){
    this.showChildView('header', new HeaderView());
    this.showChildView('footer', new FooterView());
  },
  getHeader: function(){
    return this.getRegion('header');
  },
  getMain: function(){
    return this.getRegion('main');
  },
  getFooter: function(){
    return this.getRegion('footer');
  },
});

module.exports = RootView;