var m = require('mithril');


var domain = require('./../../domain');


function onEditButtonClick(e) {
	e.preventDefault();

	m.route.set('/editor/' + this.article.slug);
}


function onDeleteButtonClick(e) {
	e.preventDefault();

	domain.actions.deleteArticle(this.article.slug);
}


function updateState(vnode) {
	vnode.state = {
		article: vnode.attrs.article.data,
		isDeleteArticleBusy: domain.store.isDeleteArticleBusy
	};
}


function oninit(vnode) {
	updateState(vnode);
}


function onupdate(vnode) {
	updateState(vnode);
}


function view(vnode) {
	return [
		m('span', { key: 'updateButton' },
			m('button.btn.btn-outline-secondary.btn-sm', { onclick: onEditButtonClick.bind(this), disabled: vnode.state.isDeleteArticleBusy }, [
				m('i.ion-edit'), m('span', ' Edit Article')
			])
		),
		m('span', { key: 'deleteButton' },
			m('button.btn.btn-outline-danger.btn-sm', { onclick: onDeleteButtonClick.bind(this), disabled: vnode.state.isDeleteArticleBusy }, [
				m('i.ion-trash-a'), m('span', ' Delete Article')
			])
		)
	];
};


module.exports = {
	oninit: oninit,
	onupdate: onupdate,
	view: view
};
