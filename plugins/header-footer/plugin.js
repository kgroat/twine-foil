var $ = require('jquery');

function plugin(){
  var defaultStory = require('story');
  $(document).on('after:show', function(ev, data){
    var story = data.story || defaultStory;
    if(data.passage.tags.indexOf('no-header') < 0){
      var headers = story.getPassagesByTag('header');
      headers.forEach(function(header){
        story.$output.prepend(header.render());
      });
      story.$output.addClass('has-header').removeClass('no-header');
    } else {
      story.$output.addClass('no-header').removeClass('has-header');
    }
    if(data.passage.tags.indexOf('no-footer') < 0){
      var footers = story.getPassagesByTag('footer');
      footers.forEach(function(footer){
        story.$output.append(footer.render());
      });
      story.$output.addClass('has-footer').removeClass('no-footer');
    } else {
      story.$output.addClass('no-footer').removeClass('has-footer');
    }
  });
}

plugin.pre = [];

module.exports = plugin;