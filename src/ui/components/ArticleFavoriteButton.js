'use strict';


var m = require('mithril');


function onFavoriteButtonClick(e) {
  e.preventDefault();
}


function view(vnode) {
  var count = typeof vnode.attrs.article.favoritesCount === 'number' ? vnode.attrs.article.favoritesCount : '...';

  return [
    m('span',
      m('button.btn.btn-sm.btn-outline-primary', { onclick: onFavoriteButtonClick.bind(this) }, [
        m('i.ion-heart'), m('span', ' Favorite Article (' + count + ')')
      ])
    )
  ];
};


module.exports = {
  view: view
};
