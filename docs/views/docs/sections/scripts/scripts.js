var Marionette = require('backbone.marionette');
var loadTemplate = require('../../../../helpers/loadTemplate');

var ScriptsView = Marionette.ItemView.extend({
  template: loadTemplate('views/docs/sections/scripts/scripts.html')
}, {
  title: 'Scripts'
})

module.exports = ScriptsView;
