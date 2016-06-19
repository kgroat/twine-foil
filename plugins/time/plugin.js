var _ = require('underscore');
var define = require.define.raw;
var DeferredJQ = require('deferredJQ');
var renderLinks = require('renderLinks');

function plugin(){
  
  var listeners = [];
  var ticksPerDay = 48;
  var timeName = 'time';
  var morningBegins = 4;
  var eveningBegins = 20;
  var nightBegins = 36;
  
  function getTime(tmpTimeName){
    return require('state').get(tmpTimeName || timeName) || 0;
  }
  
  function setTime(newTime, tmpTimeName){
    return require('state').set(tmpTimeName || timeName, newTime || 0);
  }
  
  function incrementTime(increment, tmpTimeName){
    increment = typeof increment === 'number' ? increment : 1;
    return setTime(getTime(tmpTimeName) + increment, tmpTimeName);
  }
  
  function tick(count, tmpTimeName){
    count = typeof count === 'number' ? count : 1;
    var currentTime = getTime(tmpTimeName);
    listeners.forEach(function(cb){
      cb(count, currentTime);
    })
    incrementTime(count, tmpTimeName);
  }
  
  function timeConfig(options){
    options = options || {};
    ticksPerDay = options.ticksPerDay || ticksPerDay;
    timeName = options.timeName || timeName;
    morningBegins = options.morningBegins || morningBegins;
    eveningBegins = options.eveningBegins || eveningBegins;
    nightBegins = options.nightBegins || nightBegins;
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
    var time = getTime(tmpTimeName);
    return Math.floor(time / ticksPerDay);
  }
  
  function getTimeOfDay(tmpTimeName){
    var time = getTime(tmpTimeName);
    return time % ticksPerDay;
  }

  function isMorning(tmpTimeName){
    var time = getTime(tmpTimeName);
    return rangeCheck(time, morningBegins, eveningBegins);
  }

  function isEvening(tmpTimeName){
    var time = getTime(tmpTimeName);
    return rangeCheck(time, eveningBegins, nightBegins);
  }

  function isNight(tmpTimeName){
    var time = getTime(tmpTimeName);
    return rangeCheck(time, nightBegins, morningBegins);
  }

  function rangeCheck(current, min, max){
    if(min < max){
      return current >= min && current < max;
    } else {
      return current >= min || current < max;
    }
  }
  
  var time = {
    tick: tick,
    onTick: onTick,
    offTick: offTick,
    get: getTime,
    getDate: getDate,
    getTimeOfDay: getTimeOfDay,
    isMorning: isMorning,
    isEvening: isEvening,
    isNight: isNight
  }

  define('time', time);
}

plugin.pre = [];

module.exports = plugin;