'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var Banner = require('./../components/Banner');


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
  utils.updateDocumentTitle('Articles favourited by ' + state.username);
}


function view() {
  return m('div',
    [
      m(Banner),
      m('h1', 'ScreenUserFavorites')
    ]
  );
};


module.exports = {
  oninit: oninit,
  onbeforeupdate: onbeforeupdate,
  onupdate: onupdate,
  view: view
};
