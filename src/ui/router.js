var m = require('mithril');


var LayoutDefault = require('./layouts/LayoutDefault');


var ScreenHome = require('./screens/ScreenHome');
var ScreenArticle = require('./screens/ScreenArticle');
var ScreenUserLogin = require('./screens/ScreenUserLogin');
var ScreenUserRegister = require('./screens/ScreenUserRegister');
var ScreenUserProfile = require('./screens/ScreenUserProfile');
var ScreenUserSettings = require('./screens/ScreenUserSettings');
var ScreenUserFavorites = require('./screens/ScreenUserFavorites');
var ScreenEditor = require('./screens/ScreenEditor');


var routes = {
	'/': {
		view: function () {
			return m(LayoutDefault, m(ScreenHome));
		}
	},
	'/article/:slug': {
		view: function () {
			return m(LayoutDefault, m(ScreenArticle));
		}
	},
	'/register': {
		view: function () {
			return m(LayoutDefault, m(ScreenUserRegister));
		}
	},
	'/login': {
		view: function () {
			return m(LayoutDefault, m(ScreenUserLogin));
		}
	},
	'/@:username': {
		view: function () {
			return m(LayoutDefault, m(ScreenUserProfile));
		}
	},
	'/@:username/favorites': {
		view: function () {
			return m(LayoutDefault, m(ScreenUserFavorites));
		}
	},
	'/settings': {
		view: function () {
			return m(LayoutDefault, m(ScreenUserSettings));
		}
	},
	'/editor': {
		view: function () {
			return m(LayoutDefault, m(ScreenEditor));
		}
	},
	'/editor/:slug': {
		view: function () {
			return m(LayoutDefault, m(ScreenEditor));
		}
	}
};


function init() {
	m.route.prefix('?');
	m.route(document.getElementById('app'), '/', routes);
}


module.exports = {
	init: init
};
