'use strict';


var m = require('mithril');


var LayoutDefault = require('./layouts/LayoutDefault');
var LayoutHome = require('./layouts/LayoutHome');


var ScreenHome = require('./screens/ScreenHome');
var ScreenArticle = require('./screens/ScreenArticle');
var ScreenUserLogin = require('./screens/ScreenUserLogin');
var ScreenUserRegister = require('./screens/ScreenUserRegister');
var ScreenUserProfile = require('./screens/ScreenUserProfile');
var ScreenUserSettings = require('./screens/ScreenUserSettings');
var ScreenUserFavorites = require('./screens/ScreenUserFavorites');
var ScreenEditor = require('./screens/ScreenEditor');


var routes = {
  '/': buildRoute(ScreenHome, LayoutHome),
  '/article/:slug': buildRoute(ScreenArticle),
  '/register': buildRoute(ScreenUserRegister),
  '/login': buildRoute(ScreenUserLogin),
  '/@:username': buildRoute(ScreenUserProfile),
  '/@:username/favorites': buildRoute(ScreenUserFavorites),
  '/settings': buildRoute(ScreenUserSettings),
  '/editor': buildRoute(ScreenEditor),
  '/editor/:slug': buildRoute(ScreenEditor)
};


function buildRoute(screen, layout) {
  layout = layout || LayoutDefault;

  return {
    render: function () {
      return m(layout, m(screen));
    }
  };
}


function init() {
  m.route.prefix('?');
  m.route(document.getElementById('app'), '/', routes);
}


module.exports = {
  init: init
};
