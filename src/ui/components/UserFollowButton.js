var m = require('mithril');


function onFollowUserButtonClick(e) {
	e.preventDefault();
}


function onUnfollowUserButtonClick(e) {
	e.preventDefault();
}


function view(vnode) {
	return [
		m('span',
			m('button.btn.btn-sm.btn-secondary', { onclick: onFollowUserButtonClick.bind(this) }, [
				m('i.ion-plus-round'), m('span', ' Follow ' + vnode.attrs.username)
			])
		),
		m('span', ' '),
		m('span',
			m('button.btn.btn-sm.btn-secondary', { onclick: onUnfollowUserButtonClick.bind(this) }, [
				m('i.ion-minus-round'), m('span', ' Unfollow ' + vnode.attrs.username)
			])
		)
	];
};


module.exports = {
	view: view
};
