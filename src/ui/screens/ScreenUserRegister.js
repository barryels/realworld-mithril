'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var Link = require('./../components/Link');
var ListErrors = require('./../components/ListErrors');
var UserRegistrationForm = require('./../components/UserRegistrationForm');


function oninit() {
  utils.updateDocumentTitle('Sign up');
}


function onupdate() {
  if (domain.store.user) {
    domain.actions.redirectAfterUserRegistrationSuccess();
  }
}


function view() {
  return m('div',
    [
      m('.container.page', [
        m('.row', [
          m('.col-md-6.offset-md-3.col-xs-12', [
            m('h1.text-xs-center', 'Sign up'),
            m('p.text-xs-center',
              m(Link, { to: '/login' }, 'Have an account?')
            ),
            m(ListErrors, { errors: domain.store.userRegistrationErrors }),
            m(UserRegistrationForm, { isUserRegistrationBusy: domain.store.isUserRegistrationBusy, fn_registerUser: domain.actions.registerNewUser })
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
