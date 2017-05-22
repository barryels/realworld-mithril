'use strict';


var m = require('mithril');


function view() {
	return m('footer',
		m('.container', 'AppFooter')
	);
};


module.exports = {
	view: view
};
