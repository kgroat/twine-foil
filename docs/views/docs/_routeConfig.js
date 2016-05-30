var DocsView = require('./docs');

module.exports = {
  routes: ['docs', 'docs/:section'],
  controller: function(show, getRegion, section){
    var region = getRegion();
    if(region && region.currentView instanceof DocsView){
      region.currentView.setSection(section);
    } else {
      show(new DocsView({ section: section }));
    }
  }
};