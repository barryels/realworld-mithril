var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var Banner = require('./Banner');
var ArticleList = require('./ArticleList');
var FeedToggle = require('./FeedToggle');
var PopularTagList = require('./PopularTagList');


function onTagItemClick(tag) {
	domain.actions.getArticlesByTag(tag);
}


function oninit() {
	utils.updateDocumentTitle('Home');
	domain.actions.getTags();
}


function view() {
	var banner = m(Banner);

	if (domain.store.user) {
		banner = null;
	}

	return m('div.home-page',
		[
			banner,
			m('.container.page', [
				m('.row', [
					m('.col-md-9', [
						m(FeedToggle, { currentType: domain.store.selectedArticles.type, user: domain.store.user }),
						m(ArticleList, { limit: 10 })
					]),
					m('.col-md-3', [
						m('.sidebar', m(PopularTagList, { fn_onTagItemClick: onTagItemClick, isLoading: domain.store.tags.isLoading, list: domain.store.tags.list }))
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
