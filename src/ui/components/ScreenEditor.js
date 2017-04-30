var m = require('mithril');


var utils = require('./../utils');
var Banner = require('./Banner');


function oninit() {
	utils.updateDocumentTitle('Editor');
}


function view() {
	return m('div',
		[
			m(Banner),
			m('h1', 'ScreenEditor')
		]
	);
};


module.exports = {
	oninit: oninit,
	view: view
};
