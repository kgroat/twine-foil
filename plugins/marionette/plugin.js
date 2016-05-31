var _ = require('underscore');
var define = require.define.raw;
var DeferredJQ = require('deferredJQ');
var renderLinks = require('renderLinks');

function plugin(){
  var plugin = this;
  return this.requestScript('https://twine-foil.herokuapp.com/dist/plugins/marionette/backbone.js', 'backbone').then(function(){
    return plugin.requestScript('https://twine-foil.herokuapp.com/dist/plugins/marionette/marionette.js', 'marionette');
  }).then(function(){
    var Backbone = require('backbone');
    var Marionette = require('marionette');
    
    var Passage = require('passage.class');
    
    Passage.addExtension('constructor', function(next, options){
      next();
      
      var text = this.text || '';
      text = text.replace(/\n/g, ' ');
      
      var template;
      
      var templateSection = /<\s*template[^>]*>(.*?)<\s*\/\s*template\s*>/.exec(text);
      if(!templateSection){
        template = function(){ return ''; };
      } else {
        template = _.template(renderLinks(templateSection[1]));
      }
      
      var viewTypeSection = /<\s*view\s+type='?"?([\w.]+)'?"?/.exec(text);
      switch((viewTypeSection && viewTypeSection[1].toLowerCase())||''){
        case 'backbone.view':
          this.View = Backbone.View; break;
        case 'marionette.view':
          this.View = Marionette.View; break;
        case 'marionette.collectionview':
          this.View = Marionette.CollectionView; break;
        case 'marionette.compositeview':
          this.View = Marionette.CompositeView; break;
        case 'marionette.layoutview':
          this.View = Marionette.LayoutView; break;
        case 'marionette.itemview':
        default:
          this.View = Marionette.ItemView;
      }
      
      var extension = {}, static;
      
      var viewSection = /<\s*view[^>]*>(.*?)<\s*\/\s*view\s*>/.exec(text);
      if(viewSection){
        extension = eval(
          '(function(){'+
            'var require = window.definer;'+
            'var _ = require("underscore");'+
            'var $ = require("jquery");'+
            'return '+viewSection[1]+';'+
          '})()');
      }
      
      var staticSection = /<\s*static[^>]*><\s*\/\s*static\s*>/.exec(text);
      if(staticSection){
        static = eval('(function(){ return '+staticSection[1]+' })()');
      }
      
      if(!templateSection && !viewTypeSection && !viewSection && !staticSection){
        template = _.template(renderLinks(text));
      }
      if(!viewSection){
        var scripts=[], styles=[], dones=[], djq;
        extension.initialize = function(params){
          this.params = params;
          this.collection = params.collection;
          this.model = params.model;
        }
        extension.onBeforeRender = function(){
          scripts = [];
          styles = [];
          dones = [];
          djq = new DeferredJQ();
          define('jquery.local', djq.$);
        }
        extension.templateHelpers = function(){
          return {
            model: this.model,
            collection: this.collection,
            $: djq.$,
            _: _,
            require: require,
            params: this.params,
            embed: function(passage){ 
              if(typeof passage !== 'object'){
                passage = require('story').getPassage(passage);
              }
              return passage.render().html();
            },
            runScript: function(script){ scripts.push(script); },
            addStylesheet: function(stylesheet){ styles.push(stylesheet); },
            onDone: function(cb){ dones.push(cb); }
          };
        }
        extension.onRender = function(){
          var view = this;
          djq.apply(this.$el).then(function(){}, function(err){
            view.$el.prepend('<div><div>An error occurred:</div><div>' + (err.stack || err.toString()) + '</div></div>')
          });
          if(scripts.length){
            var story = require('story');
            _.each(scripts, function(script){
              var original = script;
              if(typeof script !== 'object'){
                script = story.getScript(script);
              }
              if(!script){
                throw new Error('No script '+original+' exists!');
              }
              view.$el.append(script.render());
            });
          }
          if(styles.length){
            var story = require('story');
            _.each(styles, function(stylesheet){
              var original = stylesheet;
              if(typeof stylesheet !== 'object'){
                stylesheet = story.getScript(stylesheet);
              }
              if(!stylesheet){
                throw new Error('No stylesheet '+original+' exists!');
              }
              view.$el.append(stylesheet.render());
            });
          }
          _.each(dones, function(cb){ cb() });
        }
      }
      
      extension.template = template;
      
      this.View = this.View.extend(extension, static);
    })
    
    Passage.prototype.render = function(params){
      var View = this.View;
      var passage = this;
      
      this.destroyView();
      
      _.each(this.requiredParams, function(key){
        if(params[key] === undefined){
          throw new Error('Parameter "' + key + '" is required for passage "' + passage.name + '".');
        }
      })
      
      this.view = new View(params);
      this.view.passage = this;
      this.view.render();
      return this.view.$el;
    }
    
    Passage.prototype.destroyView = function(){
      var wasDestroyed = false;
      if(this.view){
        wasDestroyed = !this.view.isDestroyed;
        this.view.destroy();
      }
      return wasDestroyed;
    }
    
    var Story = definer('story.class');
    
    Story.addExtension('show', function(next){
      if(this.passage){
        this.passage.destroyView();
      }
      next();
    })
    
    var oldShow = Story.prototype.show;
    Story.prototype.show = function(passageName, params, noHistory){
      if(this.passage){
        this.passage.destroyView();
      }
      return this.passage = oldShow.call(this, passageName, params, noHistory);
    };
  });
}

plugin.pre = [];

module.exports = plugin;