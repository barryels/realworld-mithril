var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var Banner = require('./Banner');
var ArticleList = require('./ArticleList');
var FeedToggle = require('./FeedToggle');
var Tags = require('./Tags');


function onTagItemClick(tag) {
	domain.actions.getArticlesByTag(tag);
}


function oninit() {
	utils.updateDocumentTitle('Home');
	domain.actions.getAllArticles();
	domain.actions.getTags();
}


function view() {
	return m('div.home-page',
		[
			m(Banner),
			m('.container.page', [
				m('.row', [
					m('.col-md-9', [
						m(FeedToggle),
						m(ArticleList, { articles: domain.store.articles })
					]),
					m('.col-md-3', [
						m('.sidebar', m(Tags, { fn_onTagItemClick: onTagItemClick, isLoading: domain.store.tags.isLoading, list: domain.store.tags.list }))
					])
				])
			])
		]
	);
};


module.exports = {
	oninit: oninit,
	view: view
};
