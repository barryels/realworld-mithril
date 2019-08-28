'use strict';


var m = require('mithril');


var Link = require('./Link');
var NewCommentForm = require('./NewCommentForm');
var Comment = require('./Comment');


function view(vnode) {
  var comments = vnode.attrs.comments.data || [];
  var header = m('p', [
    m(Link, { to: '/login' }, 'Sign in'),
    m('span', ' or '),
    m(Link, { to: '/register' }, 'Sign up'),
    m('span', ' to add comments on this article.')
  ]);
  var body = null;

  if (vnode.attrs.currentUser) {
    header = m(NewCommentForm);
  }

  if (vnode.attrs.comments.isLoading) {
    body = m('div', 'Loading...');
  }

  if (comments) {
    body = comments.map(function (comment) {
      return m(Comment, { comment: comment, key: comment.id });
    });
  }

  return m('div.comments', [
    header,
    body
  ]);
};


module.exports = {
  view: view
};
