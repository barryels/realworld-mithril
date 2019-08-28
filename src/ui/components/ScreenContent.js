'use strict';


var m = require('mithril');


function view(vnode) {
  return m('section', vnode.children);
};


module.exports = {
  view: view
};
