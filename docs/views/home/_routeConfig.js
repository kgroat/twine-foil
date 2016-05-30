var HomeView = require('./home');

module.exports = {
  routes: ['home'],
  controller: function(show){
    show(new HomeView());
  }
};