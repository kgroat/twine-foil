var Marionette = require('backbone.marionette');
var loadTemplate = require('../../../../../helpers/loadTemplate');

var CustomView = Marionette.ItemView.extend({
  template: loadTemplate('views/docs/sections/scripts/custom/custom.html')
}, {
  title: 'Custom'
})

module.exports = CustomView;
