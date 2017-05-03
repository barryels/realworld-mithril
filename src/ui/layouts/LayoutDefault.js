var m = require('mithril');


var name = 'LayoutDefault';


var AppHeader = require('./../components/AppHeader');
var ScreenContent = require('./../components/ScreenContent');
var AppFooter = require('./../components/AppFooter');


function view(vnode) {
	return m('div', { className: name },
		[
			m(AppHeader),
			m(ScreenContent, {}, vnode.children),
			m(AppFooter)
		]
	);
}


module.exports = {
	view: view
};
