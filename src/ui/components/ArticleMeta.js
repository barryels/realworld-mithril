var m = require('mithril');


var utils = require('./../utils');
var Link = require('./Link');


function view(vnode) {
	var article = vnode.attrs.article.data;
	var content = m('div', '...');

	if (article) {
		content = [
			m(Link, { to: '/@' + article.author.username },
				m('img', { src: article.author.image })
			),
			m('div.info',
				m(Link, { className: 'author', to: '/@' + article.author.username }, article.author.username),
				m('span.date', utils.formatDate(article.createdAt))
			)
		];
	}

	return m('div.article-meta', content);
};


module.exports = {
	view: view
};
