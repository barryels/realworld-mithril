var m = require('mithril');


var ArticleMeta = require('./ArticleMeta');


function view(vnode) {
	var title = vnode.attrs.article.data ? vnode.attrs.article.data.title : '...';

	return m('div',
		[
			m('h1', title),
			m(ArticleMeta, { article: vnode.attrs.article })
		]

		// JSON.stringify(vnode.attrs.article, '', 2)
	);
};


module.exports = {
	view: view
};
