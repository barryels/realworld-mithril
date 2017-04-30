var m = require('mithril');


var Link = require('./Link');


function view(vnode) {
	var list = vnode.attrs.list ? vnode.attrs.list : [];

	return m('ul.tag-list',
		list.map(function (tag) {
			return m('li',
				m(Link, {
					className: 'tag-default tag-pill tag-outline', key: tag, to: '', onclick: function (e) {
						e.preventDefault();
					}
				}, tag)
			);
		})
	);
};


module.exports = {
	view: view
};
