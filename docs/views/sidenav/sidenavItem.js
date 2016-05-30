var Marionette = require('backbone.marionette');
var loadTemplate = require('../../helpers/loadTemplate');
var SidenavSubItemView = require('./sidenavItem.sub');

var template = loadTemplate('views/sidenav/sidenavItem.html');
var templateEmpty = loadTemplate('views/sidenav/sidenavItem.sub.html');

var SidenavItemView = Marionette.CompositeView.extend({
  template: loadTemplate('views/sidenav/sidenavItem.html'),
  tagName: 'li',
  childViewContainer: '.nav',
  childView: SidenavSubItemView,
  initialize: function(options){
    this.model = options.model;
    this.collection = this.model.get('collection');
  },
  templateHelpers: function(){
    return {
      title: this.model.get('title'),
      link: '#/' + this.model.get('base') + '/' + this.model.get('link')
    }
  },
  getTemplate: function(){
    if(this.collection.length){
      return template
    } else {
      return templateEmpty;
    }
  },
  onRender: function(){
    this.$el.attr('data-name', this.model.get('link'));
  }
})

module.exports = SidenavItemView;
