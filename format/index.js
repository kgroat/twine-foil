require('./proxyPolyfill');
var _ = require('underscore');
var $ = require('jquery');

var definerObj = require('./definer');
definerObj.define.raw('underscore', _);
definerObj.define.raw('jquery', $);

var Story = require('./classes/story');
var saveStorage = require('./helpers/saveStorage');

$(document).ready(function(){
  var story = new Story();
  story.start();
});