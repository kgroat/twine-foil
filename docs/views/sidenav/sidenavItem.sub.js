var Marionette = require('backbone.marionette');
var loadTemplate = require('../../helpers/loadTemplate');

var SidenavItemSubView = Marionette.ItemView.extend({
  template: loadTemplate('views/sidenav/sidenavItem.sub.html'),
  tagName: 'li',
  initialize: function(options){
    this.model = options.model;
  },
  templateHelpers: function(){
    var parent = this.model.get('parent');
    return {
      title: this.model.get('title'),
      link: '#/' + parent.get('base') + '/' + parent.get('link') + '.' + this.model.get('link')
    }
  },
  onRender: function(){
    this.$el.attr('data-name', this.model.get('parent').get('link') + '.' + this.model.get('link'));
  }
})

module.exports = SidenavItemSubView;
