var m = require('mithril');


var domain = require('./../../domain');


function onGlobalFeedClick(e) {
	e.preventDefault();

	domain.actions.setSelectedArticles();
}


function onYourFeedClick(e) {
	e.preventDefault();

	domain.actions.setSelectedArticles({
		type: domain.store.articleListTypes.USER_FAVORITED,
		favorited: this.username
	});
}


function view(vnode) {
	var currentType = vnode.attrs.currentType ? vnode.attrs.currentType : '';
	this.username = vnode.attrs.user ? vnode.attrs.user.username : '';

	var links = [
		{ label: 'Your Feed', type: domain.store.articleListTypes.USER_FAVORITED, onclick: onYourFeedClick.bind(this) },
		{ label: 'Global Feed', type: domain.store.articleListTypes.GLOBAL, onclick: onGlobalFeedClick.bind(this) }
	];


	return m('div.feed-toggle',
		m('ul.nav.nav-pills.outline-active', links.map(function (link) {
			var linkClassName = link.type === currentType ? '.active' : '';

			return m('li.nav-item',
				m('a.nav-link' + linkClassName, { href: '', onclick: link.onclick }, link.label)
			);
		}))
	);
};


module.exports = {
	view: view
};
