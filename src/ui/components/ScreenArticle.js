var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var Banner = require('./Banner');


function oninit() {
	domain.actions.getArticle(m.route.param('slug'));
}


function onupdate() {
	utils.updateDocumentTitle(domain.store.selectedArticle.data.title);
}


function view() {
	return m('div.article-page',
		[
			m(Banner)
		]
	);
};


module.exports = {
	oninit: oninit,
	onupdate: onupdate,
	view: view
};
