var m = require('mithril');


function view(vnode) {
	return m('pre', JSON.stringify(vnode.attrs.article, '', 2));
};


module.exports = {
	view: view
};
