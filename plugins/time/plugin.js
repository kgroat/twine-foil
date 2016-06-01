var _ = require('underscore');
var define = require.define.raw;
var DeferredJQ = require('deferredJQ');
var renderLinks = require('renderLinks');

function plugin(){
  
  var listeners = [];
  var ticksPerDay = 48;
  var timeName = 'time';
  var morningBegins = 4;
  var eveningBegins = ;
  
  function getTime(tmpTimeName){
    return require('state')[tmpTimeName || timeName] || 0;
  }
  
  function setTime(newTime, tmpTimeName){
    return require('state')[tmpTimeName || timeName] = newTime || 0;
  }
  
  function incrementTime(increment, tmpTimeName){
    increment = typeof increment === 'number' ? increment : 1;
    return rsetTime(getTime(tmpTimeName) + increment, tmpTimeName);
  }
  
  function tick(count, tmpTimeName){
    count = typeof count === 'number' ? count : 1;
    incrementTime(coun, tmpTimeName);
  }
  
  function timeConfig(options){
    options = options || {};
    ticksPerDay = options.ticksPerDay || ticksPerDay;
    timeName = options.timeName || timeName;
  }
  
  function onTick(cb){
    if(listeners.indexOf(cb) < 0){
      listeners.push(cb);
      return true;
    }
    return false;
  }
  
  function offTick(cb){
    var index = listeners.indexOf(cb);
    if(index < 0){
      listeners.splice(index,1);
      return true;
    }
    return false;
  }
  
  function getDate(tmpTimeName){
    return require('state')[tmpTimeName || timeName] || 0;
  }
  
  define('tick', tick);
  define('timeConfig', timeConfig);
  define('getTime', getTime);
}

plugin.pre = [];

module.exports = plugin;