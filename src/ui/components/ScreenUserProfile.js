var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var UserInfoBanner = require('./UserInfoBanner');
var UserArticlesToggle = require('./UserArticlesToggle');
var ArticleList = require('./ArticleList');


var state = {
	username: ''
};


function getUserProfile() {
	state.username = m.route.param('username');
	domain.actions.getUserProfile(state.username);
	document.body.scrollTop = 0;
}


function oninit() {
	getUserProfile();
}


function onbeforeupdate() {
	if (state.username !== m.route.param('username')) {
		getUserProfile();
	}

	return true;
}


function onupdate() {
	utils.updateDocumentTitle('@' + state.username);
}


function view() {
	var username = m.route.param('username') || '';

	return m('.profile-page',
		[
			m(UserInfoBanner, { currentUser: domain.store.user, data: domain.store.selectedUserProfile.data, isLoading: domain.store.selectedUserProfile.isLoading }),
			m('.container', [
				m('.row', [
					m('.col-md-12', [
						m(UserArticlesToggle, { username: username }),
						m(ArticleList, { limit: 5, author: username })
					])
				])
			])
		]
	);
};


module.exports = {
	oninit: oninit,
	onbeforeupdate: onbeforeupdate,
	onupdate: onupdate,
	view: view
};
