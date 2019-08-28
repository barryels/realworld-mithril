'use strict';


var m = require('mithril');


var ArticleMetaAndActions = require('./ArticleMetaAndActions');


function view(vnode) {
  var title = vnode.attrs.article.data ? vnode.attrs.article.data.title : '...';

  return m('div', [
    m('h1', title),
    m(ArticleMetaAndActions, { article: vnode.attrs.article })
  ]);
};


module.exports = {
  view: view
};
