
var definerObj = require('../definer');
var definer = definerObj.require;
var define = definerObj.define.raw;

var storyId = window.location.hash.split('/')[1];
var nameSeparator = '/::/';
var savesListSeparator = '/;;/';
var descriptionSeparator = '://:';
var savesListLocation = storyId + nameSeparator + 'savesList';
var quicksaveName = 'quicksave';

function save(saveName, description, story){
  var originalName = (saveName || quicksaveName).toString();
  description = (description || (new Date()).toUTCString()).toString();
  story = story || definer('story');
  
  var isNewSave = hasSave(originalName);
  
  $.event.trigger("before:save", { saveName: originalName, description: description, story: story, isNewSave: isNewSave });
  saveName = mapSaveName(saveName);
  var hash = hashSave(story);
  
  $.event.trigger("save", { saveName: originalName, description: description, story: story, isNewSave: isNewSave, hash: hash });
  localStorage.setItem(saveName, hash);
  
  var wasNewSave = addSave(originalName, description);
  $.event.trigger("after:save", { saveName: originalName, description: description, story: story, isNewSave: isNewSave, hash: hash });
  return this;
  
}

function load(saveName, story){
  var originalName = (saveName || quicksaveName).toString();
  story = story || definer('story');
  
  $.event.trigger("before:load", { saveName: saveName, description: description, story: story });
  saveName = mapSaveName(originalName);
  var hash = localStorage.getItem(saveName);
  if(!hash || !hash.length) { throw new Error('Could not load save ' + originalName); }
  var save = dehashSave(hash);
  
  $.event.trigger("load", { saveName: saveName, story: story, save: save });
  story.loadFromSave(save);
  
  $.event.trigger("after:load", { saveName: saveName, story: story, save: save });
  return this;
}

function getSaves(){
  var serialized = localStorage.getItem(savesListLocation);
  var saves = [];
  if(serialized){
    saves = serialized.split(savesListSeparator);
    saves = _.map(saves, function(save) {
      var parts = save.split(descriptionSeparator);
      return {
        id: parts[0],
        description: parts[1]
      };
    });
  }
  return _.sortBy(saves, function(save){
    return save.id === quicksaveName ? '' : save.id;
  });
}

function hasQuicksave(){
  return hasSave(quicksaveName);
}

function hasSave(saveName){
  var saves = getSaves();
  return _.some(saves, function(save){ return save.id === saveName });
}

function deleteSave(saveName){
  $.event.trigger('before:delete', { saveName: saveName });
  saveName = mapSaveName(saveName);
  localStorage.removeItem(saveName);
  $.event.trigger('after:delete', { saveName: saveName });
  return this;
}

function clear(){
  $.event.trigger('before:clear');
  var saves = getSaves();
  $.event.trigger('clear', { saves: saves });
  _.each(saves, function(save){ deleteSave(save.id) });
  localStorage.removeItem(savesListLocation);
  $.event.trigger('after:clear', { saves: saves });
}

var saveStorage = {
  save: save,
  load: load,
  list: getSaves,
  hasQuicksave: hasQuicksave,
  delete: deleteSave,
  clear: clear
};

module.exports = saveStorage;
define('saveStorage', saveStorage);


/***************************/
/********* PRIVATE *********/
/***************************/
function hashSave(story){
  var save = { state: story.state, history: story.history };
  save = cycle.decycle(save);
  var json = JSON.stringify(save);
  var hash = base64.compressToBase64(json);
  return hash;
}

function dehashSave(hash){
  var json = base64.decompressFromBase64(hash)
  var save = JSON.parse(json);
  save = cycle.retrocycle(save);
  return save;
}

function mapSaveName(saveName){
  return storyId + nameSeparator + saveName;
}

function setSaves(saves){
  var savesString = _.map(saves, function(save) {
    return save.id + descriptionSeparator + save.description;
  }).join(savesListSeparator);
  localStorage.setItem(savesListLocation, savesString);
}

function addSave(saveName, description){
  var saves = getSaves();
  var oldSave;
  if(oldSave = _.findWhere(saves, { id: saveName })){
    oldSave.description = description;
  } else {
    saves.push({
      id: saveName,
      description: description
    });
  }
  setSaves(saves);
  return !oldSave;
}