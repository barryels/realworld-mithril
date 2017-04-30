var m = require('mithril');


var Link = require('./Link');
var Comment = require('./Comment');


function view(vnode) {
	var comments = vnode.attrs.comments.data || [];
	var content = m('div', '...');

	if (comments) {
		content = comments.map(function (comment) {
			return m(Comment, { comment: comment });
		});
	}

	return m('div.comments', [
		m('p', [
			m(Link, { to: '/login' }, 'Sign in'),
			m('span', ' or '),
			m(Link, { to: '/register' }, 'Sign up'),
			m('span', ' to add comments on this article.')
		]),
		content
	]);
};


module.exports = {
	view: view
};
