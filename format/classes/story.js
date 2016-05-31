var $ = require('jquery');
var _ = require('underscore');
var base64 = require('lz-string');
var cycle = require('json-cycle');

var definer = require('../definer');
var define = definer.define.raw;
var Plugin = require('./plugin');
require('./passage');
require('./script');
require('./stylesheet');

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
  
  this.state = options.state || {};
  this.history = options.history || [];
  
  var $plugins = $story.find('tw-passagedata[tags*="plugin"]');
  $plugins.each(function(){
    story.addPluginFromElement($(this))
  });
  
  if(defineOut){
    define('story', this);
    define('state', this.state);
    define('history', this.history);
    window.story = this;
  }
  
  var $userScripts = $story.find('script[type="text/twine-javascript"]');
  $userScripts.each(function(idx){
    var $userScript = $(this);
    var script = $userScript.html();
    var url = 'user-script' + ($userScripts.length>1 ? '-' + idx : '') + '.js';
    script = '(function(){\n'+script+'\n})()\n//# sourceURL=' + url;
    eval(script);
  });
  
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
  
  return this;
}

Story.prototype.start = function(){
  var story = this;
  return this.initializationPromise.then(function(){
    story.renderGlobalScripts().show(story.startNode);
  });
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
  $.event.trigger('before:show', { passageName: passageName, params: params });
  var passage = this.getPassage(passageName);
  if(!passage){
    throw new Error('Cannot find passage "'+passageName+'".');
  }
  define('passage', passage);
  $.event.trigger('show', { passageName: passageName, passage: passage, params: params });
  this.$output.html(passage.render(params));
  if(!noHistory){
    this.history.push({ name: passageName, params: params });
  }
  $.event.trigger('after:show', { passageName: passageName, passage: passage, params: params });
  return passage;
};

Story.prototype.back = function(skipPop){
  if(!skipPop){
    this.history.pop();
  }
  if(!this.history.length){
    this.show(this.startNode);
  } else {
    var historyRecord = this.history[this.history.lenth-1];
    this.show(historyRecord.name, historyRecord.params, true);
  }
  return this;
}

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
  $.event.trigger('before:loadFromSave');
  this.state = save.state;
  this.history = save.history;
  if(definer('story') === this){
    definer('state', this.state);
    definer('history', this.history);
  }
  $.event.trigger('loadFromSave');
  this.back(true);
  $.event.trigger('after:loadFromSave');
  return this;
}

Story = Extender(Story);

module.exports = Story;
define('story.class', Story);
