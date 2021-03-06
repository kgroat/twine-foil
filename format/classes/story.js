var $ = require('jquery');
var _ = require('underscore');
var base64 = require('lz-string');
var cycle = require('json-cycle');

var scriptHelpers = require('../helpers/scriptHelpers');
var definerObj = require('../definer');
var definer = definerObj.require;
var define = definerObj.define.raw;
var Plugin = require('./plugin');
require('./passage');
require('./script');
require('./stylesheet');
require('./state');
require('./history');

var Extender = require('../helpers/extender');

function Story(options){
  options = options || {};
  var story = this;
  var el = options.el || '#story';
  var output = options.output || '#output';
  var defineOut = (typeof options.define === 'boolean' ? options.define : true);
  
  this.$el = $(el);
  this.$output = $(output);
  var $story = (this.$el.is('tw-storydata') ? this.$el : this.$el.find('tw-storydata'));
  
  this.startNode = parseInt($story.attr('startnode'));
  this.passages = [];
  this.scripts = [];
  this.stylesheets = [];
  this.plugins = [];
  this.pluginRegistrationPromises = [];
  
  var $plugins = $story.find('tw-passagedata[tags*="plugin"]');
  $plugins.each(function(){
    story.addPluginFromElement($(this))
  });
  
  if(defineOut){
    define('story', this);
  }
  
  var $userScripts = $story.find('script[type="text/twine-javascript"]');
  $userScripts.each(function(idx){
    var $userScript = $(this);
    var script = $userScript.html();
    var url = 'user-script' + ($userScripts.length>1 ? '-' + idx : '') + '.js';
    script = scriptHelpers.build(script, url);
    $('head').append(script);
  });

  var $userStylesheets = $story.find('style[type="text/twine-css"]');
  $userStylesheets.each(function(idx){
    var $userStylesheet = $(this);
    var style = $userStylesheet.html();
    style = '<style>' + style + '</style>';
    $('head').append(style);
  })
  
  this.initializationPromise = this.finishRegisteringPlugins().then(function(){
    return story.runPlugins();
  }).then(function(){
    var $passages = $story.find('tw-passagedata:not([tags*="plugin"])');
    $passages.each(function(){
      var $passage = $(this);
      if($passage.is('[tags*="script"]')){
        story.addScriptFromElement($passage);
      } else if($passage.is('[tags*="stylesheet"]')){
        story.addStylesheetFromElement($passage);
      } else {
        story.addPassageFromElement($passage);
      }
    });
  });
  
  var State = definer('state.class');
  var History = definer('history.class');
  
  this.state = new State(options.state);
  this.history = new History(options.history);
  
  if(defineOut){
    define('state', this.state);
    define('history', this.history);
  }
  
  return this;
}

Story.prototype.start = function(){
  var story = this;
  return this.initializationPromise.then(function(){
    story.renderGlobalScripts().show(story.startNode);
  });
}

Story.prototype.restart = function(){
  return this.loadFromSave({ state: {}, history: [] });
}

Story.prototype.runPlugins = function(){
  return Promise.all(_.map(this.plugins, function(plugin){
    return plugin.run();
  }));
}

Story.prototype.renderGlobalScripts = function(){
  var story = this;
  var $head = $('head');
  _.each(this.getScriptsByTag('global'), function(script){
    if(!script.exists($head)){
      $('head').append(script.render());
    }
  });
  return this;
}

Story.prototype.renderGlobalStylesheets = function(){
  var story = this;
  var $head = $('head');
  _.each(this.stylesheets, function(stylesheet){
    if(_.indexOf(stylesheet.tags, 'global') > -1){
      $('head').append(stylesheet.render());
    }
  })
  return this;
}

function getByName(list, name){
  if(typeof name === 'string'){
    name = name.toLowerCase();
  }
  var item = _.findWhere(list, { name: name }) || _.findWhere(list, { id: name });
  return item;
}

function getByTag(list, tag){
  var items = _.filter(list, function(item){
    return item.tags.indexOf(tag) > -1;
  });
  return items;
}

Story.prototype.getPassage = function(passageName){
  return getByName(this.passages, passageName);
};

Story.prototype.getPassagesByTag = function(tag){
  return getByTag(this.passages, tag);
};

Story.prototype.getPlugin = function(pluginName){
  return getByName(this.plugins, pluginName);
};

Story.prototype.getPluginsByTag = function(tag){
  return getByTag(this.plugins, tag);
};

Story.prototype.getScript = function(scriptName){
  return getByName(this.scripts, scriptName);
};

Story.prototype.getScriptsByTag = function(tag){
  return getByTag(this.scripts, tag);
};

Story.prototype.getStylesheet = function(stylesheetName){
  return getByName(this.stylesheets, stylesheetName);
};

Story.prototype.getStylesheetsByTag = function(tag){
  return getByTag(this.stylesheets, tag);
};

Story.prototype.renderPassage = function(passageName, params){
  var passage = this.getPassage(passageName);
  if(!passage){
    throw new Error('Cannot find passage "'+passageName+'".');
  }
  return passage.render(params);
};

Story.prototype.show = function(passageName, params, noHistory){
  if(typeof params === 'boolean'){
    noHistory = params;
    params = undefined;
  }
  $.event.trigger('before:show', { story: this, passageName: passageName, params: params });
  var passage = this.getPassage(passageName);
  if(!passage){
    throw new Error('Cannot find passage "'+passageName+'".');
  }
  define('passage', passage);
  $.event.trigger('show', { story: this, passageName: passageName, passage: passage, params: params });
  var passageOutput = passage.render(params);
  passageOutput.attr('id', 'passage');
  this.$output.html(passageOutput);
  if(!noHistory){
    this.history.push(passageName, params);
  }
  $.event.trigger('after:show', { story: this, passageName: passageName, passage: passage, params: params, output: passageOutput });
  return passage;
};

Story.prototype.back = function(){
  var historyRecord = this.history.back();
  if(historyRecord){
    this.show(historyRecord.name, historyRecord.params, true);
  } else {
    this.show(this.startNode);
  }
  return this;
};

Story.prototype.refresh = function(){
  var historyRecord = this.history.peek();
  if(historyRecord){
    this.show(historyRecord.name, historyRecord.params, true);
  } else {
    this.show(this.startNode);
  }
  return this;
};

Story.prototype.addPassage = function(passage){
  var Passage = definer('passage.class');
  $.event.trigger('before:add:passage', { passage: passage });
  passage.name = passage.name && passage.name.toLowerCase();
  passage = new Passage(passage);
  $.event.trigger('add:passage', { passage: passage });
  this.passages.push(passage);
  $.event.trigger('after:add:passage', { passage: passage });
  return passage;
};

Story.prototype.addPassageFromElement = function($el){
  $.event.trigger('before:add:passage:element', { $el: $el });
  var tags = $el.attr('tags').split(' ');
  var requiredParamPrefix = 'required-';
  var requiredParameters = _.chain(tags)
      .filter(function(tag){ return tag.indexOf(requiredParamPrefix) === 0 && tag.length > requiredParamPrefix.length; })
      .map(function(tag){ return tag.substring(requiredParamPrefix.length); })
      .value();
  
  return this.addPassage({
    id: parseInt($el.attr('pid')),
    name: $el.attr('name'),
    tags: tags,
    requiredParameters: requiredParameters,
    text: _.unescape($el.html())
  });
};

Story.prototype.addScript = function(script){
  var Script = definer('script.class');
  $.event.trigger('before:add:script', { script: script });
  script.name = script.name && script.name.toLowerCase();
  script = new Script(script);
  $.event.trigger('add:script', { script: script });
  this.scripts.push(script);
  $.event.trigger('after:add:script', { script: script });
  return script;
}

Story.prototype.addScriptFromElement = function($el){
  $.event.trigger('before:add:script:element', { $el: $el });
  var tags = $el.attr('tags').split(' ');
  
  return this.addScript({
    id: parseInt($el.attr('pid')),
    name: $el.attr('name'),
    tags: tags,
    text: _.unescape($el.html())
  });
}

Story.prototype.addStylesheet = function(stylesheet){
  var Stylesheet = definer('stylesheet.class');
  $.event.trigger('before:add:stylesheet', { stylesheet: stylesheet });
  stylesheet.name = stylesheet.name && stylesheet.name.toLowerCase();
  stylesheet = new Stylesheet(stylesheet);
  $.event.trigger('add:stylesheet', { stylesheet: stylesheet });
  this.stylesheets.push(stylesheet);
  $.event.trigger('after:add:stylesheet', { stylesheet: stylesheet });
  return stylesheet;
}

Story.prototype.addStylesheetFromElement = function($el){
  $.event.trigger('before:add:stylesheet:element', { $el: $el });
  var tags = $el.attr('tags').split(' ');
  
  return this.addStylesheet({
    id: parseInt($el.attr('pid')),
    name: $el.attr('name'),
    tags: tags,
    text: _.unescape($el.html())
  });
}

Story.prototype.addPlugin = function(plugin){
  $.event.trigger('before:add:plugin', { plugin: plugin });
  plugin.name = plugin.name && plugin.name.toLowerCase();
  plugin = new Plugin(plugin);
  $.event.trigger('add:plugin', { plugin: plugin });
  this.plugins.push(plugin);
  $.event.trigger('after:add:plugin', { plugin: plugin });
  return plugin;
};

Story.prototype.addPluginFromElement = function($el){
  $.event.trigger('before:add:plugin:element', { $el: $el });
  var tags = $el.attr('tags').split(' ');
  
  return this.addPlugin({
    id: parseInt($el.attr('pid')),
    name: $el.attr('name'),
    tags: tags,
    text: _.unescape($el.html()),
    story: this
  });
}

Story.prototype.finishRegisteringPlugins = function(){
  return Promise.all(this.pluginRegistrationPromises);
}

Story.prototype.registerPluginFromUrl = function(url){
  var story = this;
  this.pluginRegistrationPromises.push(new Promise(function(resolve, reject){
    var id = -(story.pluginRegistrationPromises.length+1);
    $.ajax({
      url: url,
      type: 'GET',
      dataType: 'text',
      success: function(data){
        resolve(story.addPlugin({
          id: id,
          name: url,
          text: data,
          story: story
        }));
      },
      error: function(jqXHR){
        reject(new Error('Unable to load plugin at url: "'+url+'".'));
      }
    })
  }));
}

Story.prototype.loadFromSave = function(save){
  $.event.trigger('before:loadFromSave', { state: save.state, history: save.history });
  var State = definer('state.class');
  var History = definer('history.class');
  this.state = new State(save.state);
  this.history = new History(save.history);
  if(definer('story') === this){
    definer('state', this.state);
    definer('history', this.history);
  }
  $.event.trigger('loadFromSave', { state: this.state, history: this.history });
  this.refresh();
  $.event.trigger('after:loadFromSave', { state: this.state, history: this.history });
  return this;
}

Story.prototype.isDebugMode = function(){
  return this.$el.attr('options').indexOf('debug') >= 0;
}

Story = Extender(Story);

module.exports = Story;
define('story.class', Story);
