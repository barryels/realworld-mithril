'use strict';


var m = require('mithril');


function view(vnode) {
  return [
    m('span',
      m('button.btn.btn-outline-secondary.btn-sm', { onclick: vnode.attrs.action }, [
        m('i.ion-edit'), m('span', ' Edit Article')
      ])
    )
  ];
};


module.exports = {
  view: view
};
