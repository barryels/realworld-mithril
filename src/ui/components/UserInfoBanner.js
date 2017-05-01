var m = require('mithril');


var Link = require('./Link');


function onFollowUserButtonClick(e) {
	e.preventDefault();
}


function onUnfollowUserButtonClick(e) {
	e.preventDefault();
}


function getActionButton(data, currentUser) {

	if (!currentUser) {
		return null;
	}

	if (data && currentUser && (data.username === currentUser.username)) {
		return m(Link, { className: 'btn btn-sm action-btn btn-outline-secondary', to: '/settings' },
			[
				m('i.ion-gear-a'),
				m('span', ' Edit Profile Settings')
			]
		);
	}

	if (data && (data.following === true)) {
		return m(Link, { className: 'btn btn-sm action-btn btn-outline-secondary', onclick: onUnfollowUserButtonClick },
			[
				m('i.ion-minus-round'),
				m('span', ' Unfollow ' + data.username)
			]
		);
	}

	if (data.username) {
		return m(Link, { className: 'btn btn-sm action-btn btn-outline-secondary', onclick: onFollowUserButtonClick },
			[
				m('i.ion-plus-round'),
				m('span', ' Follow ' + data.username)
			]
		);
	}

	return m('button.btn.btn-sm.action-btn.btn-outline-secondary', '...');
}


function view(vnode) {
	var data = vnode.attrs.data ? vnode.attrs.data : {
		bio: '',
		image: '',
		username: ''
	};

	return m('.user-info',
		m('.container',
			[
				m('.row',
					[
						m('.col-xs-12 col-md-10 offset-md-1', [
							m('img.user-img', { src: data.image }),
							m('h4', data.username || '...'),
							m('p', data.bio),
							getActionButton(data, vnode.attrs.currentUser)
						]),
					]
				)
			]
		)
	);
};


module.exports = {
	view: view
};
