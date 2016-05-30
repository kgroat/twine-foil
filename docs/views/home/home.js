var Marionette = require('backbone.marionette');
var loadTemplate = require('../../helpers/loadTemplate');

var HomeView = Marionette.ItemView.extend({
  template: loadTemplate('views/home/home.html')
})

module.exports = HomeView;
