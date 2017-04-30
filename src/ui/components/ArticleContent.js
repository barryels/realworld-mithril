var m = require('mithril');


var utils = require('./../utils');


function view(vnode) {
	var article = vnode.attrs.article.data;
	var content = m('div', '...');

	if (article) {
		content = [
			m('div.col-xs-12', [
				m('div', m.trust(utils.formatArticleBody(article.body))),
				m('div.tag-list')
			])
		];
	}

	return m('div.article-content', content);
};


module.exports = {
	view: view
};
