var Marionette = require('backbone.marionette');
var loadTemplate = require('../../helpers/loadTemplate');

var FooterView = Marionette.ItemView.extend({
  template: loadTemplate('views/footer/footer.html')
});

module.exports = FooterView;