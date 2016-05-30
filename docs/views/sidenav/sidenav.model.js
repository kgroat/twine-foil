
var Backbone = require('backbone');


var SidenavSubItem = Backbone.Model.extend({
  
})

var SidenavSubList = Backbone.Collection.extend({
  model: SidenavSubItem
})
SidenavSubItem.Collection = SidenavSubList;

var SidenavItem = Backbone.Model.extend({
  initialize: function(options){
    this.attributes = options;
    this.set('collection', new SidenavSubList());
  },
  addSubItem: function(sub){
    if(!(sub instanceof SidenavSubItem)){
      sub = new SidenavSubItem(sub);
    }
    sub.set('parent', this);
    this.get('collection').add(sub);
  }
});

var SidenavList = Backbone.Collection.extend({
  model: SidenavItem
});
SidenavItem.Collection = SidenavList;
SidenavItem.Sub = SidenavSubItem;

module.exports = SidenavItem;
