'use strict';


var m = require('mithril');


var name = 'LayoutHome';


var AppHeader = require('./../components/AppHeader');
var ScreenContent = require('./../components/ScreenContent');


function view(vnode) {
  return m('div', {
    className: name
  },
    [
      m(AppHeader),
      m(ScreenContent, {}, vnode.children)
    ]
  );
}


module.exports = {
  view: view
};
