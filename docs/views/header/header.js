var Marionette = require('backbone.marionette');
var loadTemplate = require('../../helpers/loadTemplate');

var HeaderView = Marionette.ItemView.extend({
  ui: {
    navItems: '.navbar-nav li'
  },
  template: loadTemplate('views/header/header.html'),
  onRoute: function(name, path, arguments){
    this.ui.navItems.removeClass('active');
    this.ui.navItems.filter('[data-name*="'+name+'"]').addClass('active');
  }
});

module.exports = HeaderView;