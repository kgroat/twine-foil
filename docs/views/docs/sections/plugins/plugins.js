var Marionette = require('backbone.marionette');
var loadTemplate = require('../../../../helpers/loadTemplate');

var PluginsView = Marionette.ItemView.extend({
  template: loadTemplate('views/docs/sections/plugins/plugins.html')
}, {
  title: 'Plugins'
})

module.exports = PluginsView;
