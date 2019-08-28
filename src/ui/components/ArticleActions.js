'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var ArticleFavoriteButton = require('./ArticleFavoriteButton');
var ArticleUpdateButton = require('./ArticleUpdateButton');
var ArticleDeleteButton = require('./ArticleDeleteButton');
var UserFollowUnfollowButton = require('./UserFollowUnfollowButton');


function updateState(vnode) {
  vnode.state = {
    article: vnode.attrs.article.data,
    isDeleteArticleBusy: domain.store.isDeleteArticleBusy
  };
}


function oninit(vnode) {
  updateState(vnode);
}


function onupdate(vnode) {
  updateState(vnode);
}


function view(vnode) {
  var article = vnode.attrs.article.data ? vnode.attrs.article.data : {
    author: {
      username: null
    }
  };

  var loggedInUsername = domain.store.user ? domain.store.user.username : '';

  return [
    m(ArticleUpdateButton, { action: domain.actions.goToArticleEditScreen.bind(null, article.slug) }),
    m('span', ' '),
    m(ArticleDeleteButton, { action: domain.actions.deleteArticle.bind(null, article.slug) }),
    m('span', ' '),
    m(UserFollowUnfollowButton, { isFollowing: article.author.following, username: article.author.username, loggedInUsername: loggedInUsername }),
    m('span', ' '),
    m(ArticleFavoriteButton, { article: article })
  ];
};


module.exports = {
  oninit: oninit,
  onupdate: onupdate,
  view: view
};
