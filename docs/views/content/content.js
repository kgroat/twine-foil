
var _ = require('underscore');
var Marionette = require('backbone.marionette');
var Backbone = require('backbone');
var loadTemplate = require('../../helpers/loadTemplate');
var ContentItemView = require('./contentItem');

var ContentView = Marionette.CollectionView.extend({
  childView: ContentItemView,
  initialize: function(options){
    var collection = new Backbone.Collection();
    this.collection = collection;
    var base = options.base;
    var sections = options.sections;
    _.each(sections, function(section){
      var sectionName = section.name;
      collection.add({
        name: sectionName,
        title: section.view.title || sectionName,
        view: section.view
      });
      _.each(section.subSections, function(subSection){
        var subSectionName = subSection.name;
        collection.add({
          name: sectionName + '.' + subSectionName,
          title: subSection.view.title || subSectionName,
          view: subSection.view
        });
      })
    })
  },
  getNameAtScroll: function(scroll){
    if(this.children.length < 1){ return ''; }
    
    var mapping = this.children.map(function(childView){
      return {
        name: childView.model.get('name'),
        offset: childView.$el.offset().top
      }
    });
    if(_.all(mapping, function(map){ return map.offset === 0 })){ return ''; }
    for(var i=0; i<mapping.length; i++){
      if(mapping[i].offset > (scroll+55)){
        if(i === 0){ return '' }
        return mapping[i-1].name;
      }
    }
    return mapping[mapping.length-1].name;
  }
})

module.exports = ContentView;
