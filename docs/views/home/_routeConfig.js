var HomeView = require('./home');

module.exports = {
  routes: [''],
  controller: function(show){
    show(new HomeView());
  }
};