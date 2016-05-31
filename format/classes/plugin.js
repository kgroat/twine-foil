var $ = require('jquery');
var definer = require('../definer');
var define = definer.define.raw;
var scriptHelpers = require('../helpers/scriptHelpers');

var Extender = require('../helpers/extender');

function Plugin(options){
  options = options || {};
  this.id = options.id || 0;
  this.name = options.name || '';
  this.tags = options.tags || [];
  this.text = options.text || '';
  this.story = options.story || definer('story');
  this.pre = options.pre || [];
}

Plugin.prototype.requestStyle = function(url){
  var plugin = this;
  return new Promise(function(resolve, reject){
    var existing = plugin.story.$el.find('link[href="' + url + '"]');
    if(existing.length){
      return resolve(existing);
    }
    existing = $('<link href="' + url + '" />');
    plugin.story.$el.append(existing);
    return resolve(existing);
  })
}

Plugin.prototype.requestScript = function(url, scope, name){
  if(typeof scope === 'string'){
    name = scope;
    scope = undefined;
  }
  
  var pluginScopeName = '__currentPluginScope';
  var plugin = this;
  return new Promise(function(resolve, reject){
    var existing = scriptHelpers.getExisting(plugin.story.$el, url);
    if(existing.length){ return resolve(existing) }
    $.ajax({
      url: url,
      type: 'GET',
      dataType: 'text',
      success: function(data){
        if(scope){
          window[pluginScopeName] = scope;
          data = 'with(window.'+pluginScopeName+'){\n'+data+'\n}';
        }
        var $script = scriptHelpers.build(data, url, name);
        plugin.story.$el.append($script);
        window[pluginScopeName] = undefined;
        delete window[pluginScopeName];
        resolve($script);
      },
      error: function(jqXHR){
        reject(jqXHR);
      }
    });
  })
}

Plugin.prototype.run = function(){
  var plugin = this;
  return new Promise(function(resolve, reject){
    if(plugin.$script){ return resolve(plugin); }
    var $script = scriptHelpers.build(plugin.text, plugin.name, './plugins/'+plugin.name);
    $('head').append($script);
    var pluginFunction = definer('./plugins/'+plugin.name);
    if(pluginFunction.pre){ plugin.pre = pluginFunction.pre; }
    if(plugin.pre.length){
      Promise.all(_.map(plugin.pre, function(pluginName){
        return plugin.story.getPlugin(pluginName).run();
      })).then(runPluginFunction);
    } else {
      runPluginFunction([]);
    }
    function runPluginFunction(prePlugins){
      if(pluginFunction.length > 0){
        pluginFunction(function(err){
          if(err) { return reject(err); }
          plugin.$script = $script;
          resolve(plugin);
        });
      }
      var p;
      try{
        p = pluginFunction.call(plugin, prePlugins||[]);
      } catch(e){
        return reject(e);
      }
      if(p && typeof p.then === 'function'){
        p.then(function(){
          plugin.$script = $script;
          resolve(plugin);
        }, function(err){
          reject(err);
        });
      } else {
        plugin.$script = $script;
        resolve(plugin);
      }
    }
  });
}

Plugin = Extender(Plugin);

module.exports = Plugin;
define('plugin.class', Plugin);