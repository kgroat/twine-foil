var _ = require('underscore');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');

var routeConfigs = require('./views/**/_routeConfig.js', {
  mode: function(base, files, config){
    var mods = files.map(function(file){
      var name;
      var match = /^\.?\/?views\/(.*?)\/_routeConfig\.js$/.exec(file);
      if(match){
        name = match[1].replace(/\//g, '_');
      } else {
        name = file.replace(/[.\/_]/g, '');
      }
      return '{ mod: require("' + file + '"), name: "' + name + '" }';
    });
    return '[' + mods.join(', ') + ']';
  }
});
var app = require('./app');

var appController = {};
var appRoutes = {};

function processConfig(config, name){
  var routes = config.routes;
  var controller = config.controller;
  appController[name] = function(){
    var newArguments = [];
    newArguments.push.apply(newArguments, arguments);
    newArguments.splice(0, 0,
    function show(view, region){
      app.rootView.showChildView(region || 'main', view);
    },
    function getRegion(region){
      return app.rootView.getRegion(region || 'main');
    })
    controller.apply(this, newArguments);
  };
  _.each(routes, function(route){
    if(appRoutes[route]){
      throw new Error('Route "' + route + '" is already in use by "' + appRoutes[route] + '"');
    }
    appRoutes[route] = name
  });
}

_.each(routeConfigs, function(file){
  var config = file.mod;
  if(config.length){
    _.each(config, function(cfg, idx){
      processConfig(cfg, file.name+'_'+idx);
    });
  } else {
    processConfig(config, file.name);
  }
})

appRoutes['*route'] = '_default';
appController['_default'] = function(){
  Backbone.history.navigate('', { trigger: true });
};

var AppRouter = Marionette.AppRouter.extend({
  controller: appController,
  appRoutes: appRoutes
});

module.exports = AppRouter;
