'use strict';


var m = require('mithril');


function view(vnode) {
	if (vnode.attrs.onclick) {
		return m('a', { className: vnode.attrs.className, href: vnode.attrs.to, onclick: vnode.attrs.onclick }, vnode.children);
	}

	return m('a', { className: vnode.attrs.className, href: vnode.attrs.to, oncreate: m.route.link, onupdate: m.route.link }, vnode.children);
};


module.exports = {
	view: view
};
