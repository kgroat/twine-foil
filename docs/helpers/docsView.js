
var _ = require('underscore');
var Marionette = require('backbone.marionette');
var templateLoader = require('./docsTemplateLoader');
var DeferredJQ = require('../../format/helpers/deferredJQ');

var DocsView = Marionette.ItemView.extend({
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
  }
})

module.exports = DocsView;