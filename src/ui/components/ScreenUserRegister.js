var m = require('mithril');


var utils = require('./../utils');
var Banner = require('./Banner');


function oninit() {
	utils.updateDocumentTitle('Sign up');
}


function view() {
	return m('div',
		[
			m(Banner),
			m('h1', 'ScreenUserRegister')
		]
	);
};


module.exports = {
	oninit: oninit,
	view: view
};
