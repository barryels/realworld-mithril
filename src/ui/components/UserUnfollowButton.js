'use strict';


var m = require('mithril');


var domain = require('./../../domain');


function view(vnode) {
  var action = domain.actions.unfollowUser.bind(null, vnode.attrs.username);
  var label = vnode.attrs.username ? ' Unfollow ' + vnode.attrs.username : '';

  return [
    m('span',
      m('button.btn.btn-sm.btn-secondary', { onclick: function () { action(); } }, [
        m('i.ion-minus-round'), m('span', label)
      ])
    )
  ];
};


module.exports = {
  view: view
};
