var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var Banner = require('./Banner');
var ArticleBanner = require('./ArticleBanner');
var ArticleContent = require('./ArticleContent');
var ArticleMeta = require('./ArticleMeta');

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
			m('div.container', [
				m('div.row', [
					m(ArticleContent, { article: domain.store.selectedArticle }),
				]),
				m('hr'),
				m('div.article-actions', [
					m(ArticleMeta, { article: domain.store.selectedArticle })
				])
			])
		]
	);
};


module.exports = {
	oninit: oninit,
	onupdate: onupdate,
	view: view
};
