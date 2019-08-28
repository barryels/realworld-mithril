'use strict';


var m = require('mithril');


var TagList = require('./TagList');


function view(vnode) {
  var tagsContent = m('div', 'Loading Tags...');

  if (vnode.attrs.isLoading === false) {
    tagsContent = m(TagList, { list: vnode.attrs.list });
  }

  return m('div', [
    m('p', 'Popular Tags'),
    tagsContent
  ]);
};


module.exports = {
  view: view
};
