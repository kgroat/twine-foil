
var _ = require('underscore');
var $ = require('jquery');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
//var prettify = require('google-code-prettify');

var loadTemplate = require('../../helpers/loadTemplate');
var generatePermalinks = require('../../helpers/generatePermalinks');
var scrollToSection = require('../../helpers/scrollToSection');
var ContentView = require('../content/content');
var SidenavView = require('../sidenav/sidenav');

var sections = [
  { name:'passages', view: require('./sections/passages/passages'), subSections: [
    { name: 'jquery', view: require('./sections/passages/jquery/jquery') }
  ] },
  { name:'scripts', view: require('./sections/scripts/scripts'), subSections: [
    { name: 'custom', view: require('./sections/scripts/custom/custom') }
  ] },
];

var DocsView = Marionette.LayoutView.extend({
  template: loadTemplate('views/docs/docs.html'),
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
    this.sidenavView = new SidenavView({ sections: sections, base: 'docs' });
    this.contentView = new ContentView({ sections: sections, base: 'docs' });
    this.showChildView('content', this.contentView);
    this.showChildView('sidenav', this.sidenavView);
    generatePermalinks(this.$el, 'docs');
  },
  onShow: function(){
    scrollToSection(this.$el, this.section);
    this.onScroll();
    //prettify();
  },
  onScroll: function(){
    var scroll = document.body.scrollTop;
    var activeSection = this.contentView.getNameAtScroll(scroll);
    this.section = activeSection;
    var route = 'docs';
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

module.exports = DocsView;
