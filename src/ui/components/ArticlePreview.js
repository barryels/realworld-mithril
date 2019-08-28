'use strict';


var m = require('mithril');


var Link = require('./Link');


var FAVORITED_CLASS = 'btn btn-sm btn-primary';
var NOT_FAVORITED_CLASS = 'btn btn-sm btn-outline-primary';


function onFavoriteButtonClick(e) {
  e.preventDefault();
  // TODO add implementation
}


function view(vnode) {
  var article = vnode.attrs.article,
    favoriteButtonClass = article.favorited ?
      FAVORITED_CLASS :
      NOT_FAVORITED_CLASS;

  return m('.article-preview',
    m('.container', [
      m('.article-meta', [
        m(Link, { to: '/@' + article.author.username },
          m('img', { src: article.author.image })
        ),

        m('.info', [
          m(Link, { to: '/@' + article.author.username, className: 'author' }, article.author.username),
          m('.date', new Date(article.createdAt).toDateString())
        ]),

        m('.pull-xs-right',
          m('button', { className: favoriteButtonClass, onclick: onFavoriteButtonClick }, [
            m('i.ion-heart'),
            m('span', ' ' + article.favoritesCount)
          ])
        )

      ]),

      m(Link, { to: '/article/' + article.slug, className: 'preview-link' }, [
        m('h1', article.title),
        m('p', article.description),
        m('span', 'Read more...'),
        m('ul.tag-list', article.tagList.map(function (tag) {
          return m('li.tag-default tag-pill tag-outline', { key: tag }, tag);
        }))
      ])

    ])
  );
};


module.exports = {
  view: view
};
