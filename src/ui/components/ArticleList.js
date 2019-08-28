'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var ArticlePreview = require('./ArticlePreview');
var Pagination = require('./Pagination');


function getTotalPages(limit, total) {
  return Math.ceil(total / (limit || total));
}


function getCurrentPage(limit, offset) {
  return Math.ceil((offset + 1) / limit);
}


function getOffsetFromPageNumber(pageNumber, limit) {
  return Math.ceil((pageNumber - 1) * limit);
}


function getCurrentLimitFromArticles(articles) {
  return articles.limit || 0;
}


function updateSelectedArticles() {
  // domain.actions.setCurrentlyActiveArticles({
  // limit: limit,
  // offset: offset,
  // author: author
  // });
}


function selectPage(pageNumber) {
  var limit = getCurrentLimitFromArticles(domain.store.selectedArticles);
  updateSelectedArticles(limit, getOffsetFromPageNumber(pageNumber, limit), this.author);
}


function updateStateFromAttributes(state, attrs) {
  state.limit = attrs.limit || 10;
  state.offset = attrs.offset || 0;
  state.author = attrs.author || '';

  return state;
}


function oninit(vnode) {
  updateStateFromAttributes(this, vnode.attrs);
  updateSelectedArticles(this.limit, this.offset, this.author);
}


function onbeforeupdate(vnode, vnodePrevious) {
  if (JSON.stringify(vnode.attrs) !== JSON.stringify(vnodePrevious.attrs)) {
    updateStateFromAttributes(this, vnode.attrs);
    updateSelectedArticles(this.limit, this.offset, this.author);
  }
}


function view() {
  var totalPages = 1,
    currentPage = 1;

  if (domain.store.selectedArticles.isLoading) {
    return m('div.article-preview', 'Loading...');
  }

  if (domain.store.selectedArticles.list.length === 0) {
    return m('div.article-preview', 'No articles are here... yet.');
  }

  totalPages = getTotalPages(domain.store.selectedArticles.limit, domain.store.selectedArticles.total);
  currentPage = getCurrentPage(domain.store.selectedArticles.limit, domain.store.selectedArticles.offset);

  return m('div', [
    domain.store.selectedArticles.list.map(function (article) {
      return m(ArticlePreview, { key: article.slug, article: article });
    }),
    m(Pagination, { totalPages: totalPages, currentPage: currentPage, fn_onItemClick: selectPage.bind(this) })
  ]);
};


module.exports = {
  oninit: oninit,
  onbeforeupdate: onbeforeupdate,
  view: view
};
