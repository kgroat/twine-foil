var $ = require('jquery');
var _ = require('underscore');

var definerObj = require('../definer');
var definer = definerObj.require;
var define = definerObj.define.raw;
var DeferredJQ = require('../helpers/deferredJQ');
var renderLinks = require('../helpers/renderLinks');

var Extender = require('../helpers/extender');

function Passage(options){
  options = options || {};
  this.id = options.id || 0;
  this.name = options.name || '';
  this.tags = options.tags || [];
  this.requiredParameters = options.requiredParameters || [];
  this.text = options.text || '';
}

Passage.prototype.checkParams = function(params){
  _.each(this.requiredParams, function(key){
    if(params[key] === undefined){
      throw new Error('Parameter "' + key + '" is required for passage "' + passage.name + '".');
    }
  });
};

Passage.prototype.render = function(params){
  this.checkParams(params);
  var scripts = [], styles = [], dones = [];
  
  var jq = new DeferredJQ();
  var local = {
    $: jq.$,
    _: _,
    require: definer,
    params: params,
    show: function(name, params, skipHistory){
      definer('story').show(name, params, skipHistory);
    },
    embed: function(passage){ 
      if(typeof passage !== 'object'){
        passage = definer('story').getPassage(passage);
      }
      return passage.render().html();
    },
    runScript: function(script){ scripts.push(script); },
    addStylesheet: function(stylesheet){ styles.push(stylesheet); },
    onDone: function(cb){ dones.push(cb); }
  };
  var compiled = _.template('<div>' + this.text + '</div>');
  var output = compiled(local);
  
  output = this.renderLinks(output);
  
  output = $(output);
  jq.apply(output).then(function(){}, function(err){
    output.prepend('<div><div>An error occurred:</div><div>' + (err.stack || err.toString()) + '</div></div>')
  });
  
  if(scripts.length){
    var story = definer('story');
    _.each(scripts, function(script){
      var original = script;
      if(typeof script !== 'object'){
        script = story.getScript(script);
      }
      if(!script){
        throw new Error('No script '+original+' exists!');
      }
      output.append(script.render());
    });
  }
  if(styles.length){
    var story = definer('story');
    _.each(styles, function(stylesheet){
      var original = stylesheet;
      if(typeof stylesheet !== 'object'){
        stylesheet = story.getScript(stylesheet);
      }
      if(!stylesheet){
        throw new Error('No stylesheet '+original+' exists!');
      }
      output.append(stylesheet.render());
    });
  }
  
  _.each(dones, function(cb){ cb() });
  
  return output;
}
Passage.prototype.render.resultStrategy = Extender.strategies.latest;

Passage.prototype.renderLinks = function(input){
  return renderLinks(input, this.renderSingleLink);
};
Passage.prototype.renderLinks.resultStrategy = Extender.strategies.latest;

Passage.prototype.renderSingleLink = renderLinks.single;
Passage.prototype.renderSingleLink.resultStrategy = Extender.strategies.latest;

Passage = Extender(Passage);

module.exports = Passage;
define('passage.class', Passage);