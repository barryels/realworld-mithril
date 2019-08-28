'use strict';


var m = require('mithril');


var ArticleMeta = require('./ArticleMeta');
var ArticleActions = require('./ArticleActions');


function view(vnode) {
  return [
    m(ArticleMeta, { article: vnode.attrs.article, style: 'display:inline-block; ' }),
    m(ArticleActions, { article: vnode.attrs.article })
  ];
};


module.exports = {
  view: view
};
