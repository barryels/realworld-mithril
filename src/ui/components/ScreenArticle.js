var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var Banner = require('./Banner');
var ArticleBanner = require('./ArticleBanner');


function oninit() {
	domain.actions.getArticle(m.route.param('slug'));
}


function onupdate() {
	utils.updateDocumentTitle(domain.store.selectedArticle.data.title);
}


function view() {
	return m('div.article-page',
		[
			m(Banner,
				m(ArticleBanner, { article: domain.store.selectedArticle })
			),
			m('pre', JSON.stringify(domain.store.selectedArticle, '', 2))
		]
	);
};


module.exports = {
	oninit: oninit,
	onupdate: onupdate,
	view: view
};
