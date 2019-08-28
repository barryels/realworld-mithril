'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var Link = require('./../components/Link');
var UserLoginForm = require('./../components/UserLoginForm');
var ListErrors = require('./../components/ListErrors');


function redirectIfUserLoggedIn() {
  if (domain.store.user) {
    domain.actions.redirectAfterUserLoginSuccess();
  }
}


function oninit() {
  utils.updateDocumentTitle('Sign in');

  redirectIfUserLoggedIn();
}


function onupdate() {
  redirectIfUserLoggedIn();
}


function view() {
  return m('div',
    [
      m('.container.page', [
        m('.row', [
          m('.col-md-6.offset-md-3.col-xs-12', [
            m('h1.text-xs-center', 'Sign in'),
            m('p.text-xs-center',
              m(Link, { to: '/register' }, 'Need an account?')
            ),
            m(ListErrors, { errors: domain.store.userLoginErrors }),
            m(UserLoginForm, { isUserLoginBusy: domain.store.isUserLoginBusy })
          ])
        ])
      ])
    ]
  );
};


module.exports = {
  oninit: oninit,
  onupdate: onupdate,
  view: view
};
