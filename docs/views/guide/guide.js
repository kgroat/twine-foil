
var _ = require('underscore');
var $ = require('jquery');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');

var loadTemplate = require('../../helpers/loadTemplate');
var generatePermalinks = require('../../helpers/generatePermalinks');
var scrollToSection = require('../../helpers/scrollToSection');
var ContentView = require('../content/content');
var SidenavView = require('../sidenav/sidenav');

var subSections = require('./sections/*/*.js', {
  mode: function(base, files, config){
    var mods = files.map(function(file){
      var name;
      var match = /^\.?\/?sections\/([^\/]*)\/[^\/]+\.js$/.exec(file);
      if(match){
        name = match[1];
      } else {
        throw new Error('Something went horribly wrong');
      }
      return '{ view: require("' + file + '"), name: "' + name + '" }';
    });
    return '[' + mods.join(', ') + ']';
  }
});

var subSubSections = require('./sections/*/*/*.js', {
  mode: function(base, files, config){
    var mods = files.map(function(file){
      var base, name;
      var match = /^\.?\/?sections\/([^\/]*)\/([^\/]*)\/[^\/]+\.js$/.exec(file);
      if(match){
        base = match[1];
        name = match[2];
      } else {
        throw new Error('Something went horribly wrong');
      }
      return '{ view: require("' + file + '"), base: "' + base + '", name: "' + name + '" }';
    });
    return '[' + mods.join(', ') + ']';
  }
})

_.each(subSections, function(section){
  section.subSections = _.where(subSubSections, { base: section.name });
})

var GuideView = Marionette.LayoutView.extend({
  template: loadTemplate('views/guide/guide.html'),
  regions: {
    content: '#content',
    sidenav: '#sidenav'
  },
  initialize: function(options){
    this.section = options.section;
    this.onScroll = this.onScroll.bind(this);
    $(window).scroll(this.onScroll);
  },
  onDestroy: function(){
    $(window).off('scroll', this.onScroll);
  },
  onRender: function(){
    this.sidenavView = new SidenavView({ sections: subSections, base: 'guide' });
    this.contentView = new ContentView({ sections: subSections, base: 'guide' });
    this.showChildView('content', this.contentView);
    this.showChildView('sidenav', this.sidenavView);
    generatePermalinks(this.$el, 'guide');
  },
  onShow: function(){
    scrollToSection(this.$el, this.section);
    this.onScroll();
  },
  onScroll: function(){
    var scroll = document.body.scrollTop;
    var activeSection = this.contentView.getNameAtScroll(scroll);
    this.section = activeSection;
    var route = 'guide';
    if(activeSection){
      route += '/'+activeSection;
    }
    Backbone.history.navigate(route, {trigger:false});
    this.sidenavView.setActive(activeSection);
  },
  setSection: function(section){
    scrollToSection(this.$el, section);
  }
})

module.exports = GuideView;
