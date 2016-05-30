
var _ = require('underscore');
var Marionette = require('backbone.marionette');
var templateLoader = require('./docsTemplateLoader');
var DeferredJQ = require('../../format/helpers/deferredJQ');

var DocsView = Marionette.ItemView.extend({
  events: {
    'click .image-icon': 'imageClicked',
    'click .copy': 'copyClicked',
  },
  initialize: function(){
    this.template = templateLoader(this.template);
  },
  onBeforeRender: function(){
    this.jq = new DeferredJQ();
  },
  templateHelpers: function(){
    return {
      $: this.jq.$,
      _: _
    };
  },
  onRender: function(){
    this.jq.apply(this.$el);
  },
  imageClicked: function(ev){
    var $image = $(ev.currentTarget);
    $image.toggleClass('expanded');
  },
  copyClicked: function(ev){
    var $target = $(ev.currentTarget).find('.copy-target');
    $target[0].select();
    document.execCommand('copy');
    var $after = $(ev.currentTarget).find('.after');
    $after.html('Copied!');
  }
})

module.exports = DocsView;