'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var UserFollowButton = require('./UserFollowButton');
var ArticleFavoriteButton = require('./ArticleFavoriteButton');


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
	var article = vnode.attrs.article.data ? vnode.attrs.article.data : {
		author: {
			username: null
		}
	};

	return [
		m('span', { key: 'updateButton' },
			m('button.btn.btn-outline-secondary.btn-sm', { onclick: onEditButtonClick.bind(this), disabled: vnode.state.isDeleteArticleBusy }, [
				m('i.ion-edit'), m('span', ' Edit Article')
			])
		),
		m('span', ' '),
		m('span', { key: 'deleteButton' },
			m('button.btn.btn-outline-danger.btn-sm', { onclick: onDeleteButtonClick.bind(this), disabled: vnode.state.isDeleteArticleBusy }, [
				m('i.ion-trash-a'), m('span', ' Delete Article')
			])
		),
		m('span', ' '),
		m(UserFollowButton, { username: article.author.username }),
		m('span', ' '),
		m(ArticleFavoriteButton, { article: article })
	];
};


module.exports = {
	oninit: oninit,
	onupdate: onupdate,
	view: view
};
