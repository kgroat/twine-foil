
var Marionette = require('backbone.marionette');
var loadTemplate = require('../../helpers/loadTemplate');

var ContentView = Marionette.LayoutView.extend({
  template: loadTemplate('views/content/contentItem.html'),
  regions: {
    holder: '.holder'
  },
  onRender: function(){
    var View = this.model.get('view');
    this.showChildView('holder', new View());
  }
})

module.exports = ContentView;
