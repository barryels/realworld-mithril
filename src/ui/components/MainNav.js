var m = require('mithril');


var Link = require('./Link');


function view(vnode) {
	var currentUser = vnode.attrs.currentUser;
	var linkItemHome = m('li.nav-item', m(Link, { className: 'nav-link', to: '/' }, 'Home'));
	var userAvatarURL = 'https://static.productionready.io/images/smiley-cyrus.jpg';

	if (currentUser && (currentUser.image)) {
		userAvatarURL = currentUser.image;
	}

	if (!currentUser) {
		return m('ul', { className: vnode.attrs.className }, [
			linkItemHome,
			m('li.nav-item', m(Link, { className: 'nav-link', to: '/login' }, 'Sign in')),
			m('li.nav-item', m(Link, { className: 'nav-link', to: '/register' }, 'Sign up'))
		]);
	}

	return m('ul', { className: vnode.attrs.className }, [
		linkItemHome,
		m('li.nav-item', m(Link, { className: 'nav-link', to: '/editor' }, [m('i.ion-compose'), m('span', ' New Post')])),
		m('li.nav-item', m(Link, { className: 'nav-link', to: '/settings' }, [m('i.ion-gear-a'), m('span', ' Settings')])),
		m('li.nav-item', m(Link, { className: 'nav-link', to: '/@' + currentUser.username }, [m('img.user-pic', { src: userAvatarURL }), m('span.hidden-sm-down', ' ' + currentUser.username)])),
	]);
};


module.exports = {
	view: view
};
