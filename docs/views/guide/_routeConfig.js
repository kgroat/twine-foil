var GuiedView = require('./guide');

module.exports = {
  routes: ['guide', 'guide/:section'],
  controller: function(show, region, section){
    show(new GuiedView({ section: section }));
  }
};