
var _ = require('underscore');
var Marionette = require('backbone.marionette');
var Backbone = require('backbone');
var loadTemplate = require('../../helpers/loadTemplate');
var SidenavItem = require('./sidenav.model');
var SidenavCollection = SidenavItem.Collection;
var SubItem = SidenavItem.Sub;

var SidenavItemView = require('./sidenavItem');

var SidenavView = Marionette.CompositeView.extend({
  template: loadTemplate('views/sidenav/sidenav.html'),
  tagName: 'nav',
  className: 'sidenav affix',
  childViewContainer: '.nav',
  childView: SidenavItemView,
  initialize: function(options){
    var collection = new SidenavCollection();
    this.collection = collection;
    var base = options.base;
    this.base = base;
    
    var sections = options.sections;
    _.each(sections, function(section){
      var name = section.name;
      var title = section.view.title || name;
      var item = new SidenavItem({
        base: base,
        link: name,
        title: title
      });
      _.each(section.subSections, function(subSection){
        var name = subSection.name;
        var title = subSection.view.title || name;
        var subItem = new SubItem({
          link: name,
          title: title
        })
        item.addSubItem(subItem);
      })
      collection.add(item);
    })
  },
  setActive: function(name){
    this.$('.nav li').removeClass('active');
    if(name.indexOf('.') > -1){
      var parts = name.split('.');
      var base = parts[0];
      this.$('.nav li[data-name="'+base+'"]').addClass('active');
    }
    
    this.$('.nav li[data-name="'+name+'"]').addClass('active');
  }
})

module.exports = SidenavView;
