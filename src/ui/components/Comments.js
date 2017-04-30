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
	var content = m('div', '...');

	if (vnode.attrs.currentUser) {
		header = m(NewCommentForm);
	}

	if (comments) {
		content = comments.map(function (comment) {
			return m(Comment, { comment: comment });
		});
	}

	return m('div.comments', [
		header,
		content
	]);
};


module.exports = {
	view: view
};
