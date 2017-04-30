var m = require('mithril');


var utils = require('./../utils');
var Banner = require('./Banner');


function oninit() {
	utils.updateDocumentTitle('Article');
}


function view() {
	return m('div.article-page',
		[
			m(Banner),
			m('h1', 'Article')
		]
	);
};


module.exports = {
	oninit: oninit,
	view: view
};
