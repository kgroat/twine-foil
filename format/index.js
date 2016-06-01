require('./proxyPolyfill');
var _ = require('underscore');
var $ = require('jquery');

var definer = require('./definer');
definer.define.raw('underscore', _);
definer.define.raw('jquery', $);

var Story = require('./classes/story');
var saveStorage = require('./helpers/saveStorage');

$(document).ready(function(){
  var story = new Story();
  story.start();
});