'use strict';


var m = require('mithril');


function view(vnode) {
  return [
    m('span',
      m('button.btn.btn-outline-danger.btn-sm', { onclick: vnode.attrs.action }, [
        m('i.ion-trash-a'), m('span', ' Delete Article')
      ])
    )
  ];
};


module.exports = {
  view: view
};
