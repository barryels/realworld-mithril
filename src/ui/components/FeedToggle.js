'use strict';


var m = require('mithril');


var domain = require('./../../domain');


function setCurrentlyActiveArticles(vnode, type) {
  var payload = {
    type: type
  };

  switch (type.name) {
    case domain.store.articleListTypes.USER_FAVORITED.name:
      payload.author = '';
      payload.favorited = vnode.state.username;
      break;

    case domain.store.articleListTypes.USER_OWNED.name:
      payload.author = vnode.state.username;
      payload.favorited = '';
      break;
  }

  domain.actions.setCurrentlyActiveArticles(payload);
}


function onLinkClick(vnode, type, e) {
  e.preventDefault();

  setCurrentlyActiveArticles(vnode, type);
}


function buildLink(vnode, linkType, currentType) {
  var linkClassName = linkType.name === currentType.name ? '.active' : '';

  return m('li.nav-item',
    m('a.nav-link' + linkClassName, {
      href: '', onclick: onLinkClick.bind(null, vnode, linkType)
    }, linkType.label)
  );
}


function oninit(vnode) {
  console.log('vnode.attrs.currentType', vnode.attrs.currentType);
  setCurrentlyActiveArticles(vnode, vnode.attrs.linkTypes[0]);
}


function view(vnode) {
  var currentType = vnode.attrs.currentType ? vnode.attrs.currentType : '';
  var linkTypes = vnode.attrs.linkTypes ? vnode.attrs.linkTypes : [];
  vnode.state.username = vnode.attrs.username ? vnode.attrs.username : '';

  return m('div.feed-toggle',
    m('ul.nav.nav-pills.outline-active', linkTypes.map(function (linkType) {
      return buildLink(vnode, linkType, currentType);
    }))
  );
};


module.exports = {
  oninit: oninit,
  view: view
};
