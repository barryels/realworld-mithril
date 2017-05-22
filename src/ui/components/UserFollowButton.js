'use strict';


var m = require('mithril');


var domain = require('./../../domain');


function view(vnode) {
	var action = vnode.attrs.action || domain.actions.followUser.bind(null, vnode.attrs.username);

	return [
		m('span',
			m('button.btn.btn-sm.btn-secondary', { onclick: function () { action(); } }, [
				m('i.ion-plus-round'), m('span', ' Follow ' + vnode.attrs.username)
			])
		)
	];
};


module.exports = {
	view: view
};
