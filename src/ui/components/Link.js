var m = require('mithril');


function view(vnode) {
	if (vnode.attrs.to) {
		return m('a', {className: vnode.attrs.className, href: vnode.attrs.to, oncreate: m.route.link, onupdate: m.route.link}, vnode.children);
	}

	return null;
};


module.exports = {
	view: view
};